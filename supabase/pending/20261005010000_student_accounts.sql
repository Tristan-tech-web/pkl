-- Akun murid tanpa email: ID murid = kode sekolah + NIS (mis. bgb-2610001), dibuat massal oleh pengelola sekolah.
-- Tanpa service-role: dua fungsi SECURITY DEFINER dengan pemeriksaan izin sendiri.
--  * create_student_accounts: pengelola (members.manage) membuat banyak akun sekaligus; kata sandi acak dikembalikan SEKALI.
--  * reset_student_password: pengelola atau wali kelas mengganti kata sandi murid; hanya untuk akun sintetis (@murid.edusmart.test).

alter table public.schools add column if not exists login_code text;
alter table public.schools drop constraint if exists schools_login_code_chk;
alter table public.schools add constraint schools_login_code_chk check (login_code is null or login_code ~ '^[a-z0-9]{2,12}$');
create unique index if not exists schools_login_code_uq on public.schools (login_code) where login_code is not null;

create or replace function app_private.random_password(p_len int default 10) returns text
language plpgsql volatile set search_path = '' as $$
declare alphabet text := 'abcdefghjkmnpqrstuvwxyz23456789'; bytes bytea := extensions.gen_random_bytes(p_len); out text := ''; i int;
begin
  for i in 0 .. p_len - 1 loop
    out := out || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;
  return out;
end $$;

create or replace function public.create_student_accounts(p_school_id uuid, p_class_id uuid, p_rows jsonb)
returns table (name text, login_id text, password text, status text)
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_code text; v_role uuid; v_email text; v_pw text; v_new uuid; v_member uuid; v_nis text; v_name text; v_next bigint;
  r jsonb;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  if not app_private.has_capability(p_school_id, 'members.manage') then raise exception 'tidak berhak membuat akun murid' using errcode = '42501'; end if;
  select s.login_code into v_code from public.schools s where s.id = p_school_id;
  if v_code is null then raise exception 'atur kode sekolah untuk ID murid dulu'; end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) not between 1 and 200 then raise exception 'kirim 1 sampai 200 murid sekaligus'; end if;
  if (select count(*) from public.school_members m join public.roles ro on ro.id = m.role_id where m.school_id = p_school_id and ro.code = 'student') + jsonb_array_length(p_rows) > 5000 then
    raise exception 'jumlah murid melewati batas sekolah';
  end if;
  if p_class_id is not null and not exists (select 1 from public.class_groups g where g.id = p_class_id and g.school_id = p_school_id) then raise exception 'rombel tidak ditemukan'; end if;
  select ro.id into v_role from public.roles ro where ro.school_id = p_school_id and ro.code = 'student';

  select coalesce(max(mp.nis::bigint), 2026000) into v_next from public.member_profiles mp where mp.school_id = p_school_id and mp.nis ~ '^[0-9]{1,15}$';

  for r in select * from jsonb_array_elements(p_rows) loop
    v_name := btrim(coalesce(r->>'name', ''));
    if char_length(v_name) < 2 or char_length(v_name) > 80 then
      name := v_name; login_id := null; password := null; status := 'nama tidak valid'; return next; continue;
    end if;
    v_nis := nullif(lower(btrim(coalesce(r->>'nis', ''))), '');
    if v_nis is null then v_next := v_next + 1; v_nis := v_next::text; end if;
    if v_nis !~ '^[a-z0-9]{3,20}$' then
      name := v_name; login_id := null; password := null; status := 'NIS tidak valid'; return next; continue;
    end if;
    v_email := v_code || '-' || v_nis || '@murid.edusmart.test';
    if exists (select 1 from auth.users u where u.email = v_email) or exists (select 1 from public.member_profiles mp where mp.school_id = p_school_id and mp.nis = v_nis) then
      name := v_name; login_id := v_code || '-' || v_nis; password := null; status := 'sudah ada'; return next; continue;
    end if;
    v_pw := app_private.random_password(10);
    v_new := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current)
    values ('00000000-0000-0000-0000-000000000000', v_new, 'authenticated', 'authenticated', v_email, extensions.crypt(v_pw, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', v_name), now(), now(), '', '', '', '', '');
    insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), v_new::text, v_new, jsonb_build_object('sub', v_new::text, 'email', v_email, 'email_verified', true), 'email', now(), now(), now());
    insert into public.school_members (school_id, user_id, role_id, display_name) values (p_school_id, v_new, v_role, v_name) returning id into v_member;
    insert into public.member_profiles (member_id, school_id, nis) values (v_member, p_school_id, v_nis) on conflict (member_id) do nothing;
    if p_class_id is not null then
      insert into public.class_group_students (school_id, class_group_id, member_id) values (p_school_id, p_class_id, v_member) on conflict do nothing;
    end if;
    name := v_name; login_id := v_code || '-' || v_nis; password := v_pw; status := 'dibuat'; return next;
  end loop;
end $$;

create or replace function public.reset_student_password(p_member_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  m record; v_pw text;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select sm.school_id, sm.user_id, ro.code as role_code, u.email into m
  from public.school_members sm join public.roles ro on ro.id = sm.role_id join auth.users u on u.id = sm.user_id where sm.id = p_member_id;
  if not found or m.role_code <> 'student' then raise exception 'murid tidak ditemukan'; end if;
  if not (app_private.has_capability(m.school_id, 'members.manage') or app_private.is_homeroom_of(m.school_id, p_member_id)) then
    raise exception 'tidak berhak mengganti kata sandi murid ini' using errcode = '42501';
  end if;
  if m.email is null or m.email not like '%@murid.edusmart.test' then raise exception 'akun ini memakai email sendiri; minta murid memakai fitur lupa kata sandi'; end if;
  v_pw := app_private.random_password(10);
  update auth.users set encrypted_password = extensions.crypt(v_pw, extensions.gen_salt('bf')), updated_at = now() where id = m.user_id;
  delete from auth.sessions where user_id = m.user_id;
  return v_pw;
end $$;

revoke all on function public.create_student_accounts(uuid, uuid, jsonb) from public, anon;
revoke all on function public.reset_student_password(uuid) from public, anon;
grant execute on function public.create_student_accounts(uuid, uuid, jsonb) to authenticated;
grant execute on function public.reset_student_password(uuid) to authenticated;
revoke all on function app_private.random_password(int) from public, anon, authenticated;
