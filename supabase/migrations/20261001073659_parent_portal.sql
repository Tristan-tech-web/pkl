-- Portal orang tua: keterhubungan wali-siswa dan ringkasan anak lewat fungsi yang memeriksa perwalian.
create table public.guardianships (
  school_id uuid not null,
  parent_member_id uuid not null,
  student_member_id uuid not null,
  relation text not null default 'wali' check (relation in ('ayah','ibu','wali')),
  created_at timestamptz not null default now(),
  primary key (parent_member_id, student_member_id),
  check (parent_member_id <> student_member_id),
  foreign key (school_id, parent_member_id) references public.school_members (school_id, id) on delete cascade,
  foreign key (school_id, student_member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.guardianships (school_id, student_member_id);
alter table public.guardianships enable row level security;
revoke all on public.guardianships from anon;

create function app_private.is_guardian_of(p_school uuid, p_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.guardianships g
                 where g.school_id = p_school and g.student_member_id = p_student
                   and g.parent_member_id = app_private.my_member_id(p_school))
$$;

create policy guardianships_select on public.guardianships for select to authenticated
  using (app_private.module_enabled(school_id, 'parent_portal')
         and (parent_member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'members.manage')));
create policy guardianships_write on public.guardianships for all to authenticated
  using (app_private.module_enabled(school_id, 'parent_portal') and app_private.has_capability(school_id, 'members.manage'))
  with check (app_private.module_enabled(school_id, 'parent_portal') and app_private.has_capability(school_id, 'members.manage'));

create function public.my_children(p_school_id uuid)
returns table (student_id uuid, name text, class_name text, relation text)
language sql stable security definer set search_path = '' as $$
  select g.student_member_id, m.display_name,
         (select cg.name from public.class_group_students s join public.class_groups cg on cg.id = s.class_group_id
           where s.member_id = g.student_member_id limit 1), g.relation
  from public.guardianships g join public.school_members m on m.id = g.student_member_id
  where g.school_id = p_school_id and g.parent_member_id = app_private.my_member_id(p_school_id)
    and app_private.module_enabled(p_school_id, 'parent_portal')
  order by m.display_name
$$;

create function public.child_overview(p_school_id uuid, p_child_id uuid, p_term_id uuid default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_term public.terms; v_name text; v_class text;
  v_att jsonb := null; v_grades jsonb := null; v_learn jsonb := null; v_note text := null; v_pass int;
  v_done int; v_total int; st public.student_stats;
begin
  if not app_private.module_enabled(p_school_id, 'parent_portal') then raise exception 'modul portal orang tua tidak aktif'; end if;
  if not app_private.is_guardian_of(p_school_id, p_child_id) then raise exception 'bukan wali siswa ini'; end if;
  select display_name into v_name from public.school_members where id = p_child_id and school_id = p_school_id;
  select cg.name into v_class from public.class_group_students s join public.class_groups cg on cg.id = s.class_group_id
    where s.member_id = p_child_id and s.school_id = p_school_id limit 1;
  select * into v_term from public.terms t where t.school_id = p_school_id and (p_term_id is null or t.id = p_term_id)
    order by (v_today between t.starts_on and t.ends_on) desc, t.starts_on limit 1;

  if v_term.id is not null and app_private.module_enabled(p_school_id, 'attendance') then
    select coalesce(jsonb_object_agg(status, n), '{}'::jsonb) into v_att from (
      select status, count(*) n from public.attendance_records
      where member_id = p_child_id and on_date between v_term.starts_on and v_term.ends_on group by status) a;
  end if;

  if v_term.id is not null and app_private.module_enabled(p_school_id, 'gradebook') then
    select coalesce(pass_mark, 70) into v_pass from (select 1) x left join public.gradebook_settings gs on gs.school_id = p_school_id;
    select coalesce(jsonb_agg(jsonb_build_object('subject', subj, 'grade', grade) order by subj), '[]'::jsonb) into v_grades from (
      select sub.name subj,
             round((sum(sc.score / a.max_score * 100 * a.weight) / nullif(sum(a.weight), 0))::numeric, 1) grade
      from public.assessment_scores sc join public.assessments a on a.id = sc.assessment_id
      join public.school_subjects sub on sub.id = a.school_subject_id
      where sc.member_id = p_child_id and a.term_id = v_term.id and sc.score is not null
      group by sub.name) g;
    select note into v_note from public.report_notes where term_id = v_term.id and member_id = p_child_id;
  end if;

  if app_private.module_enabled(p_school_id, 'learning') then
    select * into st from public.student_stats where member_id = p_child_id;
    select count(*) filter (where np.completed_at is not null) into v_done from public.node_progress np where np.member_id = p_child_id;
    select count(*) into v_total from public.competency_nodes where school_id = p_school_id and status = 'published';
    v_learn := jsonb_build_object('level', coalesce(st.level, 1), 'xp', coalesce(st.xp, 0), 'streak', coalesce(st.streak, 0), 'done', coalesce(v_done, 0), 'total', v_total);
  end if;

  return jsonb_build_object('name', v_name, 'class', v_class,
    'term', case when v_term.id is null then null else jsonb_build_object('id', v_term.id, 'name', v_term.name) end,
    'attendance', v_att, 'grades', v_grades, 'pass_mark', v_pass, 'note', v_note, 'learning', v_learn);
end $$;

revoke execute on function public.my_children(uuid), public.child_overview(uuid, uuid, uuid) from public, anon;
grant execute on function public.my_children(uuid), public.child_overview(uuid, uuid, uuid) to authenticated;
comment on function public.my_children(uuid) is 'SECURITY DEFINER disengaja: orang tua tidak boleh membaca tabel anggota/rombel; hanya anak yang terhubung.';
comment on function public.child_overview(uuid, uuid, uuid) is 'SECURITY DEFINER disengaja: ringkasan anak untuk wali yang terhubung; memeriksa modul dan perwalian di dalam.';

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;
update public.modules set status = 'tersedia' where code = 'parent_portal';
