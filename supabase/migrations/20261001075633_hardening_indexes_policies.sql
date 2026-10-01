-- Pengerasan dari advisor performa: indeks untuk FK komposit, dan kebijakan tulis dipecah per aksi
-- agar tiap aksi SELECT hanya dievaluasi oleh satu kebijakan permisif.
create index if not exists announcements_author_idx on public.announcements (school_id, author_member_id);
create index if not exists announcements_class_idx on public.announcements (school_id, class_group_id);
create index if not exists assessment_scores_assessment_idx on public.assessment_scores (school_id, assessment_id);
create index if not exists assessments_subject_idx on public.assessments (school_id, school_subject_id);
create index if not exists assessments_term_idx on public.assessments (school_id, term_id);
create index if not exists attendance_class_idx on public.attendance_records (school_id, class_group_id);
create index if not exists guardianships_parent_idx on public.guardianships (school_id, parent_member_id);
create index if not exists lessons_node_idx on public.lessons (school_id, node_id);
create index if not exists letters_member_idx on public.letters (school_id, member_id);
create index if not exists member_achievements_code_idx on public.member_achievements (code);
create index if not exists member_profiles_member_idx on public.member_profiles (school_id, member_id);
create index if not exists node_progress_node_idx on public.node_progress (school_id, node_id);
create index if not exists plan_modules_module_idx on public.plan_modules (module_code);
create index if not exists quiz_answer_keys_question_idx on public.quiz_answer_keys (school_id, question_id);
create index if not exists report_notes_member_idx on public.report_notes (school_id, member_id);
create index if not exists report_notes_term_idx on public.report_notes (school_id, term_id);
create index if not exists schedule_slots_subject_idx on public.schedule_slots (school_id, school_subject_id);
create index if not exists school_modules_module_idx on public.school_modules (module_code);
create index if not exists schools_plan_idx on public.schools (plan_code);
create index if not exists student_stats_member_idx on public.student_stats (school_id, member_id);

create or replace function pg_temp.split_write(p_table text, p_old text, p_prefix text, p_expr text, p_check text default null) returns void
language plpgsql as $f$
begin
  execute format('drop policy %I on public.%I', p_old, p_table);
  execute format('create policy %I on public.%I for insert to authenticated with check (%s)', p_prefix || '_insert', p_table, coalesce(p_check, p_expr));
  execute format('create policy %I on public.%I for update to authenticated using (%s) with check (%s)', p_prefix || '_update', p_table, p_expr, coalesce(p_check, p_expr));
  execute format('create policy %I on public.%I for delete to authenticated using (%s)', p_prefix || '_delete', p_table, p_expr);
end $f$;

select pg_temp.split_write('gradebook_settings', 'gb_settings_write', 'gb_settings', $e$app_private.has_capability(school_id, 'curriculum.manage')$e$);
select pg_temp.split_write('guardianships', 'guardianships_write', 'guardianships', $e$app_private.module_enabled(school_id, 'parent_portal') and app_private.has_capability(school_id, 'members.manage')$e$);
select pg_temp.split_write('invoices', 'invoices_write', 'invoices', $e$app_private.module_enabled(school_id, 'fees') and app_private.has_capability(school_id, 'members.manage')$e$);
select pg_temp.split_write('payments', 'payments_write', 'payments', $e$app_private.module_enabled(school_id, 'fees') and app_private.has_capability(school_id, 'members.manage')$e$);
select pg_temp.split_write('member_profiles', 'profiles_write', 'profiles', $e$app_private.module_enabled(school_id, 'admin_records') and app_private.has_capability(school_id, 'members.manage')$e$);
select pg_temp.split_write('letter_templates', 'templates_write', 'templates', $e$school_id is not null and app_private.module_enabled(school_id, 'admin_records') and app_private.has_capability(school_id, 'members.manage')$e$);
select pg_temp.split_write('report_notes', 'report_notes_write', 'report_notes', $e$app_private.module_enabled(school_id, 'gradebook') and (app_private.has_capability(school_id, 'class.manage') or app_private.is_homeroom_of(school_id, member_id))$e$);
select pg_temp.split_write('schedule_slots', 'schedule_write', 'schedule', $e$app_private.module_enabled(school_id, 'schedule') and app_private.has_capability(school_id, 'class.manage')$e$);
