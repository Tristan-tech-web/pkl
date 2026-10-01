-- Pusat data dan berkas: bucket privat, katalog berkas, roster (calon anggota) dengan undangan otomatis.
insert into storage.buckets (id, name, public, file_size_limit)
values ('school-files', 'school-files', false, 52428800) on conflict (id) do nothing;

-- Jalur: {school_id}/{scope}/{uuid}-{nama}. scope 'sekolah' hanya pengelola; scope 'guru' juga boleh guru (content.author).
create function app_private.can_use_file_path(p_name text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare v_school uuid; v_scope text;
begin
  v_school := ((storage.foldername(p_name))[1])::uuid;
  v_scope := (storage.foldername(p_name))[2];
  return app_private.has_capability(v_school, 'members.manage')
      or (v_scope = 'guru' and app_private.has_capability(v_school, 'content.author'));
exception when others then return false;
end $$;
create policy school_files_select on storage.objects for select to authenticated
  using (bucket_id = 'school-files' and app_private.can_use_file_path(name));
create policy school_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'school-files' and app_private.can_use_file_path(name));
create policy school_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'school-files' and app_private.can_use_file_path(name));

create table public.school_files (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  scope text not null check (scope in ('sekolah','guru')),
  uploaded_by uuid not null,
  name text not null check (char_length(name) between 1 and 200),
  mime text,
  size_bytes bigint not null check (size_bytes >= 0),
  path text not null,
  category text not null default 'belum_dipilah' check (category in
    ('belum_dipilah','siswa','guru','sekolah','peraturan','keuangan','kurikulum','buku_paket','lks','rapor_contoh','lainnya')),
  category_source text not null default 'manual' check (category_source in ('manual','ai')),
  subject_id uuid,
  ai_status text not null default 'belum' check (ai_status in ('belum','berjalan','selesai','gagal')),
  ai_summary text,
  ai_confidence numeric check (ai_confidence is null or (ai_confidence between 0 and 1)),
  extracted jsonb,
  text_content text,
  status text not null default 'baru' check (status in ('baru','dianalisis','diimpor','diarsipkan')),
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  unique (school_id, id),
  unique (path),
  foreign key (school_id, uploaded_by) references public.school_members (school_id, id) on delete cascade,
  foreign key (school_id, subject_id) references public.school_subjects (school_id, id) on delete set null
);
create index on public.school_files (school_id, category, created_at desc);
create index on public.school_files (school_id, uploaded_by);
create index on public.school_files (school_id, subject_id);
create index school_files_fts on public.school_files using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(ai_summary, '') || ' ' || coalesce(text_content, '')));
alter table public.school_files enable row level security;
revoke all on public.school_files from anon;
create policy files_select on public.school_files for select to authenticated
  using (app_private.module_enabled(school_id, 'data_hub')
         and (app_private.has_capability(school_id, 'members.manage')
              or (scope = 'guru' and app_private.has_capability(school_id, 'content.author'))));
create policy files_insert on public.school_files for insert to authenticated
  with check (app_private.module_enabled(school_id, 'data_hub') and uploaded_by = app_private.my_member_id(school_id)
              and (app_private.has_capability(school_id, 'members.manage') or (scope = 'guru' and app_private.has_capability(school_id, 'content.author'))));
create policy files_update on public.school_files for update to authenticated
  using (app_private.module_enabled(school_id, 'data_hub')
         and (app_private.has_capability(school_id, 'members.manage') or (scope = 'guru' and app_private.has_capability(school_id, 'content.author'))))
  with check (app_private.module_enabled(school_id, 'data_hub')
              and (app_private.has_capability(school_id, 'members.manage') or (scope = 'guru' and app_private.has_capability(school_id, 'content.author'))));
create policy files_delete on public.school_files for delete to authenticated
  using (app_private.module_enabled(school_id, 'data_hub')
         and (app_private.has_capability(school_id, 'members.manage') or (scope = 'guru' and app_private.has_capability(school_id, 'content.author'))));

-- Roster: orang yang didaftarkan sekolah (hasil impor) sebelum punya akun.
create table public.roster_people (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  kind text not null check (kind in ('siswa','guru','staf','orang_tua')),
  full_name text not null check (char_length(full_name) between 2 and 120),
  nis text check (nis is null or char_length(nis) <= 30),
  nisn text check (nisn is null or nisn ~ '^[0-9]{10}$'),
  nip text check (nip is null or char_length(nip) <= 30),
  gender text check (gender is null or gender in ('L','P')),
  birth_place text check (birth_place is null or char_length(birth_place) <= 80),
  birth_date date,
  address text check (address is null or char_length(address) <= 300),
  phone text check (phone is null or char_length(phone) <= 30),
  email text check (email is null or char_length(email) <= 200),
  class_name text check (class_name is null or char_length(class_name) <= 60),
  guardian_name text check (guardian_name is null or char_length(guardian_name) <= 100),
  guardian_phone text check (guardian_phone is null or char_length(guardian_phone) <= 30),
  source_file_id uuid,
  member_id uuid,
  created_at timestamptz not null default now(),
  unique (school_id, id),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete set null,
  foreign key (school_id, source_file_id) references public.school_files (school_id, id) on delete set null
);
create unique index roster_nis_uq on public.roster_people (school_id, nis) where nis is not null;
create unique index roster_nisn_uq on public.roster_people (school_id, nisn) where nisn is not null;
create index on public.roster_people (school_id, kind, class_name);
create index on public.roster_people (school_id, member_id);
create index on public.roster_people (school_id, source_file_id);
alter table public.roster_people enable row level security;
revoke all on public.roster_people from anon;
create policy roster_select on public.roster_people for select to authenticated
  using (app_private.module_enabled(school_id, 'data_hub') and app_private.has_capability(school_id, 'members.manage'));
create policy roster_insert on public.roster_people for insert to authenticated
  with check (app_private.module_enabled(school_id, 'data_hub') and app_private.has_capability(school_id, 'members.manage'));
create policy roster_update on public.roster_people for update to authenticated
  using (app_private.module_enabled(school_id, 'data_hub') and app_private.has_capability(school_id, 'members.manage'))
  with check (app_private.module_enabled(school_id, 'data_hub') and app_private.has_capability(school_id, 'members.manage'));
create policy roster_delete on public.roster_people for delete to authenticated
  using (app_private.module_enabled(school_id, 'data_hub') and app_private.has_capability(school_id, 'members.manage'));

alter table public.invites add column roster_id uuid;
alter table public.invites add constraint invites_roster_fk foreign key (school_id, roster_id) references public.roster_people (school_id, id) on delete set null;
create index on public.invites (school_id, roster_id);

-- Menebus kode: bila terkait roster, data induk disalin dan roster ditautkan ke anggota baru.
create or replace function public.redeem_invite(p_code text, p_display_name text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  inv public.invites;
  v_role public.roles;
  v_inserted int;
  v_member uuid;
  rp public.roster_people;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select * into inv from public.invites where code = upper(trim(p_code)) for update;
  if not found or inv.expires_at < now() or inv.used_count >= inv.max_uses then
    raise exception 'kode undangan tidak valid atau sudah tidak berlaku';
  end if;
  select * into v_role from public.roles where id = inv.role_id;
  if v_role.code = 'owner' then raise exception 'kode undangan tidak valid atau sudah tidak berlaku'; end if;

  insert into public.school_members (school_id, user_id, role_id, display_name)
  values (inv.school_id, v_uid, inv.role_id, coalesce(inv.label, nullif(trim(p_display_name), '')))
  on conflict (school_id, user_id) do nothing
  returning id into v_member;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then raise exception 'Anda sudah menjadi anggota sekolah ini'; end if;

  if inv.class_group_id is not null and v_role.code = 'student' then
    insert into public.class_group_students (school_id, class_group_id, member_id)
    values (inv.school_id, inv.class_group_id, v_member)
    on conflict (class_group_id, member_id) do nothing;
  end if;
  if inv.roster_id is not null then
    select * into rp from public.roster_people where id = inv.roster_id and school_id = inv.school_id and member_id is null for update;
    if found then
      update public.roster_people set member_id = v_member where id = rp.id;
      if app_private.module_enabled(inv.school_id, 'admin_records') then
        insert into public.member_profiles (member_id, school_id, nis, nisn, nip, gender, birth_place, birth_date, address, phone, guardian_name, guardian_phone)
        values (v_member, inv.school_id, rp.nis, rp.nisn, rp.nip, rp.gender, rp.birth_place, rp.birth_date, rp.address, rp.phone, rp.guardian_name, rp.guardian_phone)
        on conflict (member_id) do nothing;
      end if;
    end if;
  end if;
  update public.invites set used_count = used_count + 1 where id = inv.id;
  return inv.school_id;
end $$;

insert into public.modules (code, name, description, category, status, sort) values
  ('data_hub', 'Pusat data dan berkas', 'Unggah berkas sekolah, guru, siswa, keuangan, kurikulum, dan buku; AI memilah dan mengimpor dengan persetujuan Anda.', 'administrasi', 'tersedia', 9);
insert into public.plan_modules (plan_code, module_code) values ('starter', 'data_hub'), ('school', 'data_hub'), ('enterprise', 'data_hub');

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;
