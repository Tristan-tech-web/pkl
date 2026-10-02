-- Indeks penutup untuk kunci asing pada tabel yang dipakai jalur panas (latihan, ujian, integritas, kuis).
-- Sumber: get_advisors (performance) unindexed_foreign_keys. Indeks "unused" sengaja dibiarkan (data masih kecil).
create index if not exists bank_items_node_idx on public.bank_items (school_id, node_id);
create index if not exists bank_items_file_idx on public.bank_items (file_id);
create index if not exists bank_jobs_school_subject_idx on public.bank_jobs (school_id, subject_id);
create index if not exists bank_jobs_file_idx on public.bank_jobs (file_id);
create index if not exists bank_progress_item_idx on public.bank_progress (item_id);
create index if not exists bank_progress_member_idx on public.bank_progress (school_id, member_id);
create index if not exists practice_answers_item_idx on public.practice_answers (item_id);
create index if not exists practice_ability_member_idx on public.practice_ability (school_id, member_id);
create index if not exists exam_answers_session_idx on public.exam_answers (school_id, session_id);
create index if not exists exam_answers_question_idx on public.exam_answers (school_id, question_id);
create index if not exists exam_answer_keys_question_idx on public.exam_answer_keys (school_id, question_id);
create index if not exists exam_sessions_exam_idx on public.exam_sessions (school_id, exam_id);
create index if not exists exam_launch_codes_exam_idx on public.exam_launch_codes (school_id, exam_id);
create index if not exists exam_launch_codes_member_idx on public.exam_launch_codes (school_id, member_id);
create index if not exists exams_subject_idx on public.exams (school_id, school_subject_id);
create index if not exists exams_creator_idx on public.exams (school_id, created_by);
create index if not exists integrity_cases_member_idx on public.integrity_cases (school_id, member_id);
create index if not exists integrity_exempt_member_idx on public.integrity_exempt (school_id, member_id);
create index if not exists node_schedule_node_idx on public.node_schedule (school_id, node_id);
create index if not exists quiz_starts_member_idx on public.quiz_starts (school_id, member_id);
create index if not exists study_plans_subject_idx on public.study_plans (school_id, subject_id);
create index if not exists oauth_codes_client_idx on public.oauth_codes (client_id);
