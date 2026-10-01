-- Nilai dan rapor: penilaian berbobot per rombel, mapel, dan semester; catatan wali kelas; ambang ketuntasan sekolah.
create table public.gradebook_settings (
  school_id uuid primary key references public.schools (id) on delete cascade,
  pass_mark int not null default 70 check (pass_mark between 0 and 100),
  updated_at timestamptz not null default now()
);

-- Boleh menilai: pengelola kelas, atau guru yang ditugaskan pada rombel dan mapel itu.
create function app_private.can_grade(p_school uuid, p_class uuid, p_subject uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select app_private.has_capability(p_school, 'class.manage')
    or (app_private.has_capability(p_school, 'grades.write')
        and exists (select 1 from public.teaching_assignments t
                    where t.school_id = p_school and t.class_group_id = p_class and t.school_subject_id = p_subject
                      and t.teacher_member_id = app_private.my_member_id(p_school)))
$$;

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  class_group_id uuid not null,
  school_subject_id uuid not null,
  term_id uuid not null,
  title text not null check (char_length(title) between 2 and 120),
  kind text not null default 'tugas' check (kind in ('tugas','kuis','uts','uas','praktik','proyek')),
  weight int not null default 1 check (weight between 1 and 100),
  max_score numeric not null default 100 check (max_score > 0 and max_score <= 1000),
  held_on date,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (school_id, id),
  foreign key (school_id, class_group_id) references public.class_groups (school_id, id) on delete cascade,
  foreign key (school_id, school_subject_id) references public.school_subjects (school_id, id) on delete cascade,
  foreign key (school_id, term_id) references public.terms (school_id, id) on delete cascade
);
create index on public.assessments (school_id, class_group_id, school_subject_id, term_id);

create table public.assessment_scores (
  assessment_id uuid not null,
  member_id uuid not null,
  school_id uuid not null,
  score numeric check (score is null or score >= 0),
  note text check (note is null or char_length(note) <= 300),
  updated_at timestamptz not null default now(),
  primary key (assessment_id, member_id),
  foreign key (school_id, assessment_id) references public.assessments (school_id, id) on delete cascade,
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.assessment_scores (school_id, member_id);

create table public.report_notes (
  school_id uuid not null,
  term_id uuid not null,
  member_id uuid not null,
  note text not null check (char_length(note) <= 1000),
  written_by uuid,
  updated_at timestamptz not null default now(),
  primary key (term_id, member_id),
  foreign key (school_id, term_id) references public.terms (school_id, id) on delete cascade,
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);

alter table public.gradebook_settings enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_scores enable row level security;
alter table public.report_notes enable row level security;
revoke all on public.gradebook_settings, public.assessments, public.assessment_scores, public.report_notes from anon;

create policy gb_settings_select on public.gradebook_settings for select to authenticated using (app_private.is_member(school_id));
create policy gb_settings_write on public.gradebook_settings for all to authenticated
  using (app_private.has_capability(school_id, 'curriculum.manage')) with check (app_private.has_capability(school_id, 'curriculum.manage'));

-- Penilaian terlihat staf (students.read) dan siswa di rombel itu.
create policy assessments_select on public.assessments for select to authenticated
  using (app_private.module_enabled(school_id, 'gradebook')
         and (app_private.has_capability(school_id, 'students.read')
              or exists (select 1 from public.class_group_students s where s.class_group_id = assessments.class_group_id
                         and s.member_id = app_private.my_member_id(school_id))));
create policy assessments_insert on public.assessments for insert to authenticated
  with check (app_private.module_enabled(school_id, 'gradebook') and app_private.can_grade(school_id, class_group_id, school_subject_id));
create policy assessments_update on public.assessments for update to authenticated
  using (app_private.module_enabled(school_id, 'gradebook') and app_private.can_grade(school_id, class_group_id, school_subject_id))
  with check (app_private.module_enabled(school_id, 'gradebook') and app_private.can_grade(school_id, class_group_id, school_subject_id));
create policy assessments_delete on public.assessments for delete to authenticated
  using (app_private.module_enabled(school_id, 'gradebook') and app_private.can_grade(school_id, class_group_id, school_subject_id));

create policy scores_select on public.assessment_scores for select to authenticated
  using (app_private.module_enabled(school_id, 'gradebook')
         and (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read')));
create policy scores_insert on public.assessment_scores for insert to authenticated
  with check (app_private.module_enabled(school_id, 'gradebook')
              and exists (select 1 from public.assessments a where a.id = assessment_id and a.school_id = assessment_scores.school_id
                          and app_private.can_grade(a.school_id, a.class_group_id, a.school_subject_id)));
create policy scores_update on public.assessment_scores for update to authenticated
  using (app_private.module_enabled(school_id, 'gradebook')
         and exists (select 1 from public.assessments a where a.id = assessment_id and a.school_id = assessment_scores.school_id
                     and app_private.can_grade(a.school_id, a.class_group_id, a.school_subject_id)))
  with check (app_private.module_enabled(school_id, 'gradebook')
              and exists (select 1 from public.assessments a where a.id = assessment_id and a.school_id = assessment_scores.school_id
                          and app_private.can_grade(a.school_id, a.class_group_id, a.school_subject_id)));
create policy scores_delete on public.assessment_scores for delete to authenticated
  using (app_private.module_enabled(school_id, 'gradebook')
         and exists (select 1 from public.assessments a where a.id = assessment_id and a.school_id = assessment_scores.school_id
                     and app_private.can_grade(a.school_id, a.class_group_id, a.school_subject_id)));

-- Catatan rapor: wali kelas rombel siswa atau pengelola; siswa membaca miliknya.
create function app_private.is_homeroom_of(p_school uuid, p_member uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.class_group_students s join public.class_groups g on g.id = s.class_group_id
                 where s.school_id = p_school and s.member_id = p_member
                   and g.homeroom_member_id = app_private.my_member_id(p_school))
$$;
create policy report_notes_select on public.report_notes for select to authenticated
  using (app_private.module_enabled(school_id, 'gradebook')
         and (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read')));
create policy report_notes_write on public.report_notes for all to authenticated
  using (app_private.module_enabled(school_id, 'gradebook')
         and (app_private.has_capability(school_id, 'class.manage') or app_private.is_homeroom_of(school_id, member_id)))
  with check (app_private.module_enabled(school_id, 'gradebook')
              and (app_private.has_capability(school_id, 'class.manage') or app_private.is_homeroom_of(school_id, member_id)));

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;

update public.modules set status = 'tersedia' where code = 'gradebook';
