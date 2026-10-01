-- Tes integritas kuis: kuis dikerjakan terlalu cepat → XP ditahan dan kasus tercatat; wajar → tidak ada kasus; idempoten.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); us uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; c1 uuid; subj uuid; r_t uuid; r_s uuid; mt uuid; ms uuid; ms2 uuid; n1 uuid; q1 uuid; q2 uuid; q3 uuid; res jsonb; chk jsonb; ans jsonb; xp_before int; k int;
begin
  insert into auth.users (id, email) values (uo,'o@qz.local'),(ut,'t@qz.local'),(us,'s@qz.local'),(us2,'s2@qz.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah QZ', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select r.id into r_t from public.roles r where r.school_id = sa and r.code = 'teacher';
  select r.id into r_s from public.roles r where r.school_id = sa and r.code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Guru') returning id into mt;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_s, 'S1') returning id into ms;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'S2') returning id into ms2;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms), (sa, c1, ms2);
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, position, status, kind, xp_reward) values (sa, subj, 10, 'Q1', 'Kuis uji', 1, 'published', 'materi', 60) returning id into n1;
  for k in 1..3 loop
    insert into public.quiz_questions (school_id, node_id, kind, prompt, options, position) values (sa, n1, 'mcq', 'Soal kuis nomor ' || k || '?', '["a","b"]', k) returning id into q1;
    insert into public.quiz_answer_keys (question_id, school_id, answer, explanation) values (q1, sa, '0', 'a benar');
    if k = 1 then q2 := q1; elsif k = 2 then q3 := q1; end if;
  end loop;
  select jsonb_object_agg(id::text, 0) into ans from public.quiz_questions where node_id = n1;
  -- 1) terlalu cepat: begin lalu langsung kirim
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  perform public.quiz_begin(sa, n1);
  res := public.submit_quiz(n1, ans);
  perform pg_temp.chk('kuis menghasilkan XP', (res->>'xp_awarded')::int > 0, res::text);
  chk := public.quiz_integrity_check(sa, n1, 0);
  perform pg_temp.chk('kuis terlalu cepat: XP ditahan dan kasus dibuat', chk->>'level' = 'sedang' and (chk->>'xp_reversed')::int = (res->>'xp_awarded')::int, chk::text);
  perform pg_temp.chk('XP murid kembali ke 0', (select xp from public.student_stats where member_id = ms) = 0);
  perform pg_temp.chk('pemeriksaan ulang idempoten', public.quiz_integrity_check(sa, n1, 0) is null);
  perform pg_temp.chk('kasus kuis terlihat murid dengan attempt_id', (select count(*) from public.integrity_cases where attempt_id is not null and session_id is null) = 1);
  -- 2) guru membebaskan → XP kembali
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  perform public.integrity_decide((chk->>'case_id')::uuid, 'bebaskan', 'Kuis memang mudah');
  perform pg_temp.chk('dibebaskan: XP kembali', (select xp from public.student_stats where member_id = ms) = (res->>'xp_awarded')::int);
  -- 3) wajar: waktu dimundurkan 60 detik
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform public.quiz_begin(sa, n1);
  execute 'reset role';
  update public.quiz_starts set started_at = now() - interval '60 seconds' where member_id = ms2;
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  res := public.submit_quiz(n1, ans);
  chk := public.quiz_integrity_check(sa, n1, 0);
  perform pg_temp.chk('kuis wajar: tanpa kasus, XP utuh', chk->>'level' = 'rendah' and (select xp from public.student_stats where member_id = ms2) = (res->>'xp_awarded')::int and (res->>'xp_awarded')::int > 0, chk::text);
  execute 'reset role';
  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
