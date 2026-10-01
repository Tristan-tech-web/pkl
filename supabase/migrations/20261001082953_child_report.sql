-- Rapor untuk orang tua: child_overview memuat juga identitas sekolah, tahun ajaran, wali kelas, dan daftar mapel rombel.
create or replace function public.child_overview(p_school_id uuid, p_child_id uuid, p_term_id uuid default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_term public.terms; v_name text; v_class text; v_class_id uuid; v_homeroom text; v_year text; v_school jsonb;
  v_att jsonb := null; v_grades jsonb := null; v_learn jsonb := null; v_note text := null; v_pass int; v_subjects jsonb;
  v_done int; v_total int; st public.student_stats;
begin
  if not app_private.module_enabled(p_school_id, 'parent_portal') then raise exception 'modul portal orang tua tidak aktif'; end if;
  if not app_private.is_guardian_of(p_school_id, p_child_id) then raise exception 'bukan wali siswa ini'; end if;
  select display_name into v_name from public.school_members where id = p_child_id and school_id = p_school_id;
  select jsonb_build_object('name', name, 'city', city, 'province', province) into v_school from public.schools where id = p_school_id;
  select cg.name, cg.id, hm.display_name into v_class, v_class_id, v_homeroom
    from public.class_group_students s join public.class_groups cg on cg.id = s.class_group_id
    left join public.school_members hm on hm.id = cg.homeroom_member_id
    where s.member_id = p_child_id and s.school_id = p_school_id limit 1;
  select t.* into v_term from public.terms t where t.school_id = p_school_id and (p_term_id is null or t.id = p_term_id)
    order by (v_today between t.starts_on and t.ends_on) desc, t.starts_on limit 1;
  select ay.name into v_year from public.academic_years ay where ay.id = v_term.academic_year_id;
  select coalesce(jsonb_agg(distinct sub.name), '[]'::jsonb) into v_subjects
    from public.teaching_assignments ta join public.school_subjects sub on sub.id = ta.school_subject_id where ta.class_group_id = v_class_id;

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

  return jsonb_build_object('name', v_name, 'class', v_class, 'homeroom', v_homeroom, 'year', v_year, 'school', v_school, 'subjects', v_subjects,
    'term', case when v_term.id is null then null else jsonb_build_object('id', v_term.id, 'name', v_term.name) end,
    'attendance', v_att, 'grades', v_grades, 'pass_mark', v_pass, 'note', v_note, 'learning', v_learn);
end $$;
