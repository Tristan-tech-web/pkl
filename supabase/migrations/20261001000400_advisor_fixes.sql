-- M1 / bagian 4: tindak lanjut advisor (indeks FK dan kebijakan RLS yang tumpang tindih).
create index on public.class_group_students (school_id, class_group_id);
create index on public.class_group_students (school_id, member_id);
create index on public.class_groups (school_id, homeroom_member_id);
create index on public.class_groups (school_id, program_id);
create index on public.class_groups (school_id, track_id);
create index on public.school_members (school_id, role_id);
create index on public.school_programs (form_code);
create index on public.school_subjects (subject_definition_id);
create index on public.schools (created_by);
create index on public.schools (curriculum_pack_id);
create index on public.subject_definitions (pack_id);
create index on public.teaching_assignments (school_id, class_group_id);
create index on public.teaching_assignments (school_id, school_subject_id);
create index on public.teaching_assignments (school_id, teacher_member_id);
create index on public.terms (school_id, academic_year_id);
create index on public.tracks (school_id, parent_id);

do $$
declare r record;
begin
  for r in select * from (values
    ('curriculum_packs','packs','owner_school_id is not null and app_private.has_capability(owner_school_id, ''curriculum.manage'')'),
    ('roles','roles','school_id is not null and app_private.has_capability(school_id, ''members.manage'')'),
    ('school_members','members','app_private.has_capability(school_id, ''members.manage'')'),
    ('class_group_students','cgs','app_private.has_capability(school_id, ''class.manage'')'),
    ('subject_definitions','subject_defs','school_id is not null and app_private.has_capability(school_id, ''curriculum.manage'')')
  ) as v(tbl, pfx, cond)
  loop
    execute format('drop policy %I on public.%I', r.pfx || '_write', r.tbl);
    execute format('create policy %I on public.%I for insert to authenticated with check (%s)', r.pfx || '_insert', r.tbl, r.cond);
    execute format('create policy %I on public.%I for update to authenticated using (%s) with check (%s)', r.pfx || '_update', r.tbl, r.cond, r.cond);
    execute format('create policy %I on public.%I for delete to authenticated using (%s)', r.pfx || '_delete', r.tbl, r.cond);
  end loop;
end $$;

comment on function public.create_school(text, text, text, text[], text, text, text, text) is
  'SECURITY DEFINER disengaja: bootstrap sekolah (peran, anggota pemilik, langganan) tidak bisa lewat RLS. Hanya authenticated yang boleh memanggil.';
