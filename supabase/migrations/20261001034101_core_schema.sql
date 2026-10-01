-- M1 / bagian 1: skema inti sekolah fleksibel + RLS multi-tenant.
create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;

create extension if not exists ltree with schema extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

create or replace function app_private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

-- ===== Referensi global =====
create table public.education_forms (
  code text primary key,
  name text not null,
  category text not null check (category in ('paud','dasar','menengah','khusus','kesetaraan','pesantren','internasional','kustom')),
  default_authority text not null check (default_authority in ('kemendikdasmen','kemenag','lainnya')),
  default_grades int[] not null default '{}',
  verified boolean not null default false,
  source_note text
);

-- ===== Sekolah (satuan pendidikan) =====
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 200),
  npsn text check (npsn is null or char_length(npsn) <= 20),
  authority text not null check (authority in ('kemendikdasmen','kemenag','lainnya')),
  ownership text not null default 'swasta' check (ownership in ('negeri','swasta')),
  city text,
  province text,
  curriculum_pack_id uuid,
  timezone text not null default 'Asia/Jakarta',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger schools_touch before update on public.schools
  for each row execute function app_private.touch_updated_at();

-- ===== Paket kurikulum (berversi; owner null = bawaan sistem) =====
create table public.curriculum_packs (
  id uuid primary key default gen_random_uuid(),
  owner_school_id uuid references public.schools (id) on delete cascade,
  code text not null,
  version text not null,
  name text not null,
  grade_to_phase jsonb not null default '{}'::jsonb,
  subject_groups jsonb not null default '[]'::jsonb,
  assessment_scheme jsonb not null default '{}'::jsonb,
  source_url text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique nulls not distinct (owner_school_id, code, version)
);
alter table public.schools
  add constraint schools_curriculum_pack_fk foreign key (curriculum_pack_id) references public.curriculum_packs (id);

-- ===== Peran (kapabilitas) dan keanggotaan =====
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools (id) on delete cascade, -- null = templat sistem
  code text not null,
  name text not null,
  capabilities text[] not null default '{}',
  unique nulls not distinct (school_id, code),
  unique (school_id, id)
);

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  locale text not null default 'id',
  created_at timestamptz not null default now()
);

create table public.school_members (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role_id uuid not null,
  display_name text,
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  unique (school_id, user_id),
  unique (school_id, id),
  foreign key (school_id, role_id) references public.roles (school_id, id)
);

-- ===== Struktur akademik =====
create table public.school_programs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  form_code text not null references public.education_forms (code),
  name text not null,
  grades int[] not null default '{}',
  curriculum_pack_id uuid references public.curriculum_packs (id),
  unique (school_id, id),
  unique (school_id, name)
);

create table public.subject_definitions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools (id) on delete cascade, -- null = katalog global
  pack_id uuid references public.curriculum_packs (id),
  code text not null,
  name text not null,
  group_code text not null,
  unique nulls not distinct (school_id, pack_id, code)
);

create table public.school_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  program_id uuid not null,
  subject_definition_id uuid references public.subject_definitions (id),
  code text not null,
  name text not null,
  group_code text not null,
  hours_per_week numeric(5,2),
  grades int[] not null default '{}',
  unique (school_id, id),
  unique (school_id, program_id, code),
  foreign key (school_id, program_id) references public.school_programs (school_id, id) on delete cascade
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  parent_id uuid,
  type text not null check (type in ('peminatan','smk_bidang','smk_program','smk_konsentrasi','program_pesantren','kustom')),
  code text not null check (code ~ '^[A-Za-z0-9_]+$'),
  name text not null,
  path extensions.ltree not null,
  unique (school_id, id),
  unique (school_id, path),
  foreign key (school_id, parent_id) references public.tracks (school_id, id) on delete cascade
);
create index tracks_path_gist on public.tracks using gist (path);

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null check (ends_on > starts_on),
  term_model text not null default 'semester' check (term_model in ('semester','trimester','blok','kustom')),
  unique (school_id, id),
  unique (school_id, name)
);

create table public.terms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  academic_year_id uuid not null,
  seq int not null check (seq > 0),
  name text not null,
  starts_on date not null,
  ends_on date not null check (ends_on > starts_on),
  unique (school_id, id),
  unique (academic_year_id, seq),
  foreign key (school_id, academic_year_id) references public.academic_years (school_id, id) on delete cascade
);

create table public.class_groups (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  program_id uuid not null,
  academic_year_id uuid not null,
  track_id uuid,
  name text not null,
  grade int not null check (grade between 0 and 13),
  homeroom_member_id uuid,
  unique (school_id, id),
  unique (school_id, academic_year_id, name),
  foreign key (school_id, program_id) references public.school_programs (school_id, id),
  foreign key (school_id, academic_year_id) references public.academic_years (school_id, id),
  foreign key (school_id, track_id) references public.tracks (school_id, id),
  foreign key (school_id, homeroom_member_id) references public.school_members (school_id, id)
);

create table public.class_group_students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  class_group_id uuid not null,
  member_id uuid not null,
  unique (class_group_id, member_id),
  foreign key (school_id, class_group_id) references public.class_groups (school_id, id) on delete cascade,
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);

create table public.teaching_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  class_group_id uuid not null,
  school_subject_id uuid not null,
  teacher_member_id uuid not null,
  hours_per_week numeric(5,2),
  unique (class_group_id, school_subject_id, teacher_member_id),
  foreign key (school_id, class_group_id) references public.class_groups (school_id, id) on delete cascade,
  foreign key (school_id, school_subject_id) references public.school_subjects (school_id, id) on delete cascade,
  foreign key (school_id, teacher_member_id) references public.school_members (school_id, id) on delete cascade
);

-- Indeks untuk FK dan kebijakan RLS
create index on public.school_members (user_id);
create index on public.school_members (role_id);
create index on public.school_programs (curriculum_pack_id);
create index on public.school_subjects (program_id);
create index on public.class_groups (program_id);
create index on public.class_groups (academic_year_id);
create index on public.class_group_students (member_id);
create index on public.teaching_assignments (school_subject_id);
create index on public.teaching_assignments (teacher_member_id);

-- ===== Fungsi bantu RLS (di skema privat, tidak terekspos API) =====
create function app_private.is_member(p_school uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.school_members m
    where m.school_id = p_school and m.user_id = (select auth.uid()) and m.status = 'active')
$$;

create function app_private.has_capability(p_school uuid, p_cap text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.school_members m
    join public.roles r on r.id = m.role_id
    where m.school_id = p_school and m.user_id = (select auth.uid()) and m.status = 'active'
      and (p_cap = any (r.capabilities) or '*' = any (r.capabilities)))
$$;

create function app_private.my_member_id(p_school uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select m.id from public.school_members m
  where m.school_id = p_school and m.user_id = (select auth.uid()) and m.status = 'active'
$$;

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;

-- ===== RLS =====
alter table public.education_forms enable row level security;
alter table public.schools enable row level security;
alter table public.curriculum_packs enable row level security;
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.school_members enable row level security;
alter table public.class_group_students enable row level security;
alter table public.subject_definitions enable row level security;

create policy education_forms_select on public.education_forms for select to anon, authenticated using (true);

create policy schools_select on public.schools for select to authenticated using (app_private.is_member(id));
create policy schools_update on public.schools for update to authenticated
  using (app_private.has_capability(id, 'school.manage')) with check (app_private.has_capability(id, 'school.manage'));

create policy packs_select on public.curriculum_packs for select to anon, authenticated
  using (owner_school_id is null or app_private.is_member(owner_school_id));
create policy packs_write on public.curriculum_packs for all to authenticated
  using (owner_school_id is not null and app_private.has_capability(owner_school_id, 'curriculum.manage'))
  with check (owner_school_id is not null and app_private.has_capability(owner_school_id, 'curriculum.manage'));

create policy roles_select on public.roles for select to authenticated
  using (school_id is null or app_private.is_member(school_id));
create policy roles_write on public.roles for all to authenticated
  using (school_id is not null and app_private.has_capability(school_id, 'members.manage'))
  with check (school_id is not null and app_private.has_capability(school_id, 'members.manage'));

create policy profiles_select on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy profiles_insert on public.profiles for insert to authenticated with check (user_id = (select auth.uid()));

create policy members_select on public.school_members for select to authenticated
  using (user_id = (select auth.uid())
         or app_private.has_capability(school_id, 'members.manage')
         or app_private.has_capability(school_id, 'students.read'));
create policy members_write on public.school_members for all to authenticated
  using (app_private.has_capability(school_id, 'members.manage'))
  with check (app_private.has_capability(school_id, 'members.manage'));

create policy cgs_select on public.class_group_students for select to authenticated
  using (app_private.has_capability(school_id, 'students.read')
         or app_private.has_capability(school_id, 'class.manage')
         or member_id = app_private.my_member_id(school_id));
create policy cgs_write on public.class_group_students for all to authenticated
  using (app_private.has_capability(school_id, 'class.manage'))
  with check (app_private.has_capability(school_id, 'class.manage'));

create policy subject_defs_select on public.subject_definitions for select to anon, authenticated
  using (school_id is null or app_private.is_member(school_id));
create policy subject_defs_write on public.subject_definitions for all to authenticated
  using (school_id is not null and app_private.has_capability(school_id, 'curriculum.manage'))
  with check (school_id is not null and app_private.has_capability(school_id, 'curriculum.manage'));

do $$
declare t text; cap text;
begin
  for t, cap in select * from (values
    ('school_programs','school.manage'), ('school_subjects','curriculum.manage'),
    ('tracks','curriculum.manage'), ('academic_years','curriculum.manage'), ('terms','curriculum.manage'),
    ('class_groups','class.manage'), ('teaching_assignments','class.manage')) as v(t, cap)
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using (app_private.is_member(school_id))', t || '_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (app_private.has_capability(school_id, %L))', t || '_insert', t, cap);
    execute format('create policy %I on public.%I for update to authenticated using (app_private.has_capability(school_id, %L)) with check (app_private.has_capability(school_id, %L))', t || '_update', t, cap, cap);
    execute format('create policy %I on public.%I for delete to authenticated using (app_private.has_capability(school_id, %L))', t || '_delete', t, cap);
  end loop;
end $$;

-- Pertahanan berlapis: anon tidak punya hak tulis/baca pada tabel tenant.
revoke all on all tables in schema public from anon;
grant select on public.education_forms, public.curriculum_packs, public.subject_definitions to anon;
