-- Tutor AI: kunci milik sekolah (BYOK, terenkripsi di aplikasi), batas pemakaian harian, penanda sekolah demo.
alter table public.schools add column is_demo boolean not null default false;

create table public.school_ai_settings (
  school_id uuid primary key references public.schools (id) on delete cascade,
  provider text not null check (provider in ('gemini','anthropic')),
  model text not null check (char_length(model) between 3 and 80),
  key_ciphertext text not null,
  key_hint text not null,
  daily_limit_per_student int not null default 20 check (daily_limit_per_student between 1 and 200),
  updated_at timestamptz not null default now()
);
alter table public.school_ai_settings enable row level security;
revoke all on public.school_ai_settings from anon;
create policy ai_settings_select on public.school_ai_settings for select to authenticated
  using (app_private.has_capability(school_id, 'school.manage'));
create policy ai_settings_insert on public.school_ai_settings for insert to authenticated
  with check (app_private.has_capability(school_id, 'school.manage'));
create policy ai_settings_update on public.school_ai_settings for update to authenticated
  using (app_private.has_capability(school_id, 'school.manage')) with check (app_private.has_capability(school_id, 'school.manage'));
create policy ai_settings_delete on public.school_ai_settings for delete to authenticated
  using (app_private.has_capability(school_id, 'school.manage'));

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  member_id uuid not null,
  node_id uuid,
  used_on date not null default ((now() at time zone 'Asia/Jakarta')::date),
  created_at timestamptz not null default now(),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.ai_usage (school_id, member_id, used_on);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon;
create policy ai_usage_select on public.ai_usage for select to authenticated
  using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'reports.read'));

-- Mengambil konfigurasi sekaligus memakai satu jatah harian. Ciphertext hanya dibuka di server aplikasi.
create function public.reserve_ai_call(p_school_id uuid, p_node_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_member uuid;
  cfg public.school_ai_settings;
  v_demo boolean;
  v_limit int; v_used int;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select m.id into v_member from public.school_members m
    where m.school_id = p_school_id and m.user_id = v_uid and m.status = 'active';
  if v_member is null then raise exception 'bukan anggota sekolah ini'; end if;
  select * into cfg from public.school_ai_settings where school_id = p_school_id;
  select is_demo into v_demo from public.schools where id = p_school_id;
  if cfg.school_id is null and not coalesce(v_demo, false) then
    return jsonb_build_object('mode', 'none');
  end if;
  v_limit := coalesce(cfg.daily_limit_per_student, 10);
  select count(*) into v_used from public.ai_usage
    where member_id = v_member and used_on = (now() at time zone 'Asia/Jakarta')::date;
  if v_used >= v_limit then
    return jsonb_build_object('mode', 'limit', 'limit', v_limit);
  end if;
  insert into public.ai_usage (school_id, member_id, node_id) values (p_school_id, v_member, p_node_id);
  if cfg.school_id is null then
    return jsonb_build_object('mode', 'platform', 'remaining', v_limit - v_used - 1);
  end if;
  return jsonb_build_object('mode', 'school', 'provider', cfg.provider, 'model', cfg.model,
    'key_ciphertext', cfg.key_ciphertext, 'remaining', v_limit - v_used - 1);
end $$;
revoke execute on function public.reserve_ai_call(uuid, uuid) from public, anon;
grant execute on function public.reserve_ai_call(uuid, uuid) to authenticated;
comment on function public.reserve_ai_call(uuid, uuid) is
  'SECURITY DEFINER disengaja: memeriksa keanggotaan, menegakkan batas harian, dan memberi ciphertext kunci sekolah ke server aplikasi. Ciphertext tidak berguna tanpa AI_KEY_ENCRYPTION_SECRET.';

update public.schools set is_demo = true where name = 'SMK Nusantara Contoh';
