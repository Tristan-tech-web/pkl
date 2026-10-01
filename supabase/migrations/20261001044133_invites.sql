-- M1 / bagian 5: kode undangan untuk anggota (guru, siswa, dll.), dengan peran dan rombel opsional.
create function app_private.gen_invite_code() returns text
language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := extensions.gen_random_bytes(8);
  code text := '';
  i int;
begin
  for i in 0..7 loop
    code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return code;
end $$;
revoke execute on function app_private.gen_invite_code() from public, anon;
grant execute on function app_private.gen_invite_code() to authenticated;

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  code text not null unique default app_private.gen_invite_code(),
  role_id uuid not null,
  class_group_id uuid,
  max_uses int not null default 1 check (max_uses between 1 and 500),
  used_count int not null default 0 check (used_count >= 0),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  foreign key (school_id, role_id) references public.roles (school_id, id),
  foreign key (school_id, class_group_id) references public.class_groups (school_id, id) on delete cascade
);
create index on public.invites (school_id);
create index on public.invites (school_id, role_id);
create index on public.invites (school_id, class_group_id);
create index on public.invites (created_by);

alter table public.invites enable row level security;
revoke all on public.invites from anon;

create policy invites_select on public.invites for select to authenticated
  using (app_private.has_capability(school_id, 'members.manage'));
create policy invites_insert on public.invites for insert to authenticated
  with check (
    app_private.has_capability(school_id, 'members.manage')
    and not exists (select 1 from public.roles r where r.id = role_id and r.code = 'owner')
  );
create policy invites_update on public.invites for update to authenticated
  using (app_private.has_capability(school_id, 'members.manage'))
  with check (
    app_private.has_capability(school_id, 'members.manage')
    and not exists (select 1 from public.roles r where r.id = role_id and r.code = 'owner')
  );
create policy invites_delete on public.invites for delete to authenticated
  using (app_private.has_capability(school_id, 'members.manage'));

create function public.redeem_invite(p_code text, p_display_name text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  inv public.invites;
  v_role public.roles;
  v_inserted int;
  v_member uuid;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select * into inv from public.invites where code = upper(trim(p_code)) for update;
  if not found or inv.expires_at < now() or inv.used_count >= inv.max_uses then
    raise exception 'kode undangan tidak valid atau sudah tidak berlaku';
  end if;
  select * into v_role from public.roles where id = inv.role_id;
  if v_role.code = 'owner' then raise exception 'kode undangan tidak valid atau sudah tidak berlaku'; end if;

  insert into public.school_members (school_id, user_id, role_id, display_name)
  values (inv.school_id, v_uid, inv.role_id, nullif(trim(p_display_name), ''))
  on conflict (school_id, user_id) do nothing
  returning id into v_member;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then raise exception 'Anda sudah menjadi anggota sekolah ini'; end if;

  if inv.class_group_id is not null and v_role.code = 'student' then
    insert into public.class_group_students (school_id, class_group_id, member_id)
    values (inv.school_id, inv.class_group_id, v_member)
    on conflict (class_group_id, member_id) do nothing;
  end if;
  update public.invites set used_count = used_count + 1 where id = inv.id;
  return inv.school_id;
end $$;
revoke execute on function public.redeem_invite(text, text) from public, anon;
grant execute on function public.redeem_invite(text, text) to authenticated;
comment on function public.redeem_invite(text, text) is
  'SECURITY DEFINER disengaja: pemakai kode belum menjadi anggota sehingga tidak bisa menulis lewat RLS. Peran owner tidak pernah bisa diundang.';
