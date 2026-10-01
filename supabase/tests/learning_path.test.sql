-- Tes jalur belajar: jenis simpul baru, unit, jadwal buka per rombel (siswa terkunci sebelum waktunya, bebas tanpa jadwal), RLS.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); us uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; c1 uuid; c2 uuid; subj uuid; r_t uuid; r_s uuid; mt uuid; ms uuid; ms2 uuid; unit uuid; n1 uuid; qn uuid; res jsonb;
begin
  insert into auth.users (id, email) values (uo,'o@lp.local'),(ut,'t@lp.local'),(us,'s@lp.local'),(us2,'s2@lp.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah LP', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-2', 10) returning id into c2;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select r.id into r_t from public.roles r where r.school_id = sa and r.code = 'teacher';
  select r.id into r_s from public.roles r where r.school_id = sa and r.code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Guru') returning id into mt;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_s, 'Siswa 1') returning id into ms;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Siswa 2') returning id into ms2;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms), (sa, c2, ms2);
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;

  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.path_units (school_id, subject_id, title, position) values (sa, subj, 'Bab 1 Fungsi', 1) returning id into unit;
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, position, status, kind, unit_id) values (sa, subj, 10, 'P1', 'Persiapan Bab 1', 1, 'published', 'persiapan', unit) returning id into n1;
  insert into public.quiz_questions (school_id, node_id, kind, prompt, options, position) values (sa, n1, 'mcq', 'Apa itu fungsi?', '["a","b"]', 1) returning id into qn;
  insert into public.quiz_answer_keys (question_id, school_id, answer, explanation) values (qn, sa, '0', 'Karena a benar');
  perform pg_temp.chk('guru: simpul jenis persiapan dengan unit', (select kind from public.competency_nodes where id = n1) = 'persiapan' and (select unit_id from public.competency_nodes where id = n1) = unit);
  insert into public.node_schedule (school_id, node_id, class_group_id, unlock_at, meeting_at) values (sa, n1, c1, now() + interval '1 day', now() + interval '2 days');
  begin insert into public.competency_nodes (school_id, subject_id, grade, code, title, kind) values (sa, subj, 10, 'X', 'Salah jenis', 'aneh'); perform pg_temp.chk('jenis simpul tak dikenal ditolak', false);
  exception when others then perform pg_temp.chk('jenis simpul tak dikenal ditolak', true); end;

  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  perform pg_temp.chk('siswa X-1: melihat jadwal rombelnya', (select count(*) from public.node_schedule) = 1);
  begin perform public.submit_quiz(n1, jsonb_build_object(qn::text, 0)); perform pg_temp.chk('siswa X-1: kuis sebelum waktunya ditolak', false);
  exception when others then perform pg_temp.chk('siswa X-1: kuis sebelum waktunya ditolak', sqlerrm like '%belum dibuka%', sqlerrm); end;
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  perform pg_temp.chk('siswa X-2: tidak melihat jadwal rombel lain', (select count(*) from public.node_schedule) = 0);
  res := public.submit_quiz(n1, jsonb_build_object(qn::text, 0));
  perform pg_temp.chk('siswa X-2 (tanpa jadwal): bebas mengerjakan', (res->>'passed')::boolean, res::text);
  begin insert into public.node_schedule (school_id, node_id, class_group_id, unlock_at) values (sa, n1, c2, now()); perform pg_temp.chk('siswa tak bisa membuat jadwal', false);
  exception when others then perform pg_temp.chk('siswa tak bisa membuat jadwal', true); end;
  execute 'reset role';
  update public.node_schedule set unlock_at = now() - interval '1 minute' where node_id = n1;
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  res := public.submit_quiz(n1, jsonb_build_object(qn::text, 0));
  perform pg_temp.chk('siswa X-1: setelah waktu buka bisa mengerjakan', (res->>'passed')::boolean, res::text);
  begin insert into public.path_units (school_id, subject_id, title) values (sa, subj, 'Unit siswa'); perform pg_temp.chk('siswa tak bisa membuat unit', false);
  exception when others then perform pg_temp.chk('siswa tak bisa membuat unit', true); end;
  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
