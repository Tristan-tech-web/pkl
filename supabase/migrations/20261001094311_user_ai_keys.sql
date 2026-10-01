-- Kunci AI milik pengguna (BYOK per orang). Satu kunci per akun, berlaku di semua sekolahnya.
create table public.user_ai_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  provider text not null check (provider in ('gemini','anthropic')),
  model text not null check (char_length(model) between 3 and 80),
  key_ciphertext text not null,
  key_hint text not null,
  updated_at timestamptz not null default now()
);
alter table public.user_ai_keys enable row level security;
revoke all on public.user_ai_keys from anon;
create policy uak_select on public.user_ai_keys for select to authenticated using (user_id = (select auth.uid()));
create policy uak_insert on public.user_ai_keys for insert to authenticated with check (user_id = (select auth.uid()));
create policy uak_update on public.user_ai_keys for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy uak_delete on public.user_ai_keys for delete to authenticated using (user_id = (select auth.uid()));

-- Siswa baru boleh memakai kunci pribadinya bila sekolah mengizinkan; staf selalu boleh.
alter table public.schools add column allow_student_keys boolean not null default false;

-- Tutor: kunci pribadi didahulukan (tanpa memakai jatah sekolah), lalu kunci sekolah, lalu platform (demo).
create or replace function public.reserve_ai_call(p_school_id uuid, p_node_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_member uuid; v_role text; cfg public.school_ai_settings; uk public.user_ai_keys; v_demo boolean; v_allow boolean;
  v_limit int; v_used int;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select m.id, r.code into v_member, v_role from public.school_members m join public.roles r on r.id = m.role_id
    where m.school_id = p_school_id and m.user_id = v_uid and m.status = 'active';
  if v_member is null then raise exception 'bukan anggota sekolah ini'; end if;
  select is_demo, allow_student_keys into v_demo, v_allow from public.schools where id = p_school_id;
  select * into uk from public.user_ai_keys where user_id = v_uid;
  if uk.user_id is not null and (v_role <> 'student' or coalesce(v_allow, false)) then
    return jsonb_build_object('mode', 'user', 'provider', uk.provider, 'model', uk.model, 'key_ciphertext', uk.key_ciphertext);
  end if;
  select * into cfg from public.school_ai_settings where school_id = p_school_id;
  if cfg.school_id is null and not coalesce(v_demo, false) then return jsonb_build_object('mode', 'none'); end if;
  v_limit := coalesce(cfg.daily_limit_per_student, 10);
  select count(*) into v_used from public.ai_usage where member_id = v_member and used_on = (now() at time zone 'Asia/Jakarta')::date;
  if v_used >= v_limit then return jsonb_build_object('mode', 'limit', 'limit', v_limit); end if;
  insert into public.ai_usage (school_id, member_id, node_id) values (p_school_id, v_member, p_node_id);
  if cfg.school_id is null then return jsonb_build_object('mode', 'platform', 'remaining', v_limit - v_used - 1); end if;
  return jsonb_build_object('mode', 'school', 'provider', cfg.provider, 'model', cfg.model, 'key_ciphertext', cfg.key_ciphertext, 'remaining', v_limit - v_used - 1);
end $$;

-- AI administrasi/guru (berkas, rencana belajar): kunci pribadi dulu, lalu sekolah, lalu platform (demo).
create or replace function public.reserve_admin_ai(p_school_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_member uuid; cfg public.school_ai_settings; uk public.user_ai_keys; v_demo boolean; v_used int; v_limit constant int := 200;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select m.id into v_member from public.school_members m where m.school_id = p_school_id and m.user_id = v_uid and m.status = 'active';
  if v_member is null then raise exception 'bukan anggota sekolah ini'; end if;
  if not (app_private.has_capability(p_school_id, 'members.manage') or app_private.has_capability(p_school_id, 'content.author')
          or app_private.has_capability(p_school_id, 'fees.manage')) then
    raise exception 'tidak berhak memakai AI untuk berkas';
  end if;
  select * into uk from public.user_ai_keys where user_id = v_uid;
  if uk.user_id is not null then
    return jsonb_build_object('mode', 'user', 'provider', uk.provider, 'model', uk.model, 'key_ciphertext', uk.key_ciphertext);
  end if;
  select * into cfg from public.school_ai_settings where school_id = p_school_id;
  select is_demo into v_demo from public.schools where id = p_school_id;
  if cfg.school_id is null and not coalesce(v_demo, false) then return jsonb_build_object('mode', 'none'); end if;
  select count(*) into v_used from public.ai_usage where member_id = v_member and used_on = (now() at time zone 'Asia/Jakarta')::date and node_id is null;
  if v_used >= v_limit then return jsonb_build_object('mode', 'limit', 'limit', v_limit); end if;
  insert into public.ai_usage (school_id, member_id) values (p_school_id, v_member);
  if cfg.school_id is null then return jsonb_build_object('mode', 'platform'); end if;
  return jsonb_build_object('mode', 'school', 'provider', cfg.provider, 'model', cfg.model, 'key_ciphertext', cfg.key_ciphertext);
end $$;
