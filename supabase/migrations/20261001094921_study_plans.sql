-- Rencana belajar hasil analisis mendalam berkas kurikulum/buku (bab, strategi per elemen, jadwal ulangan dan tugas).
create table public.study_plans (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  file_id uuid references public.school_files (id) on delete set null,
  subject_id uuid,
  title text not null check (char_length(title) between 2 and 160),
  grade int not null default 10 check (grade between 0 and 13),
  weeks int not null default 18 check (weeks between 4 and 40),
  created_by uuid not null,
  status text not null default 'berjalan' check (status in ('berjalan','selesai','gagal')),
  work jsonb not null default '{}'::jsonb,
  plan jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, id),
  foreign key (school_id, created_by) references public.school_members (school_id, id) on delete cascade,
  foreign key (school_id, subject_id) references public.school_subjects (school_id, id) on delete set null (subject_id)
);
create index on public.study_plans (school_id, created_by);
create index on public.study_plans (file_id);
alter table public.study_plans enable row level security;
revoke all on public.study_plans from anon;
create policy sp_select on public.study_plans for select to authenticated
  using (app_private.module_enabled(school_id, 'data_hub') and (created_by = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'members.manage')));
create policy sp_insert on public.study_plans for insert to authenticated
  with check (app_private.module_enabled(school_id, 'data_hub') and created_by = app_private.my_member_id(school_id)
    and (app_private.has_capability(school_id, 'content.author') or app_private.has_capability(school_id, 'members.manage')));
create policy sp_update on public.study_plans for update to authenticated
  using (created_by = app_private.my_member_id(school_id)) with check (created_by = app_private.my_member_id(school_id));
create policy sp_delete on public.study_plans for delete to authenticated
  using (created_by = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'members.manage'));
