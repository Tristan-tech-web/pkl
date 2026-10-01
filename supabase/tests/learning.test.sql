-- Tes belajar: kunci jawaban tersembunyi, prasyarat, penilaian server, XP/level/streak, intervensi, isolasi.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void
language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;

do $$
declare
  uo uuid := gen_random_uuid(); us uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); ux uuid := gen_random_uuid();
  sa uuid; prog uuid; subj uuid; n1 uuid; n2 uuid; n3 uuid; q1 uuid; q2 uuid; q3 uuid;
  r_student uuid; r_teacher uuid; ms uuid; mt uuid; res jsonb; n int; lvl int;
begin
  insert into auth.users (id, email) values (uo, 'o@l.local'), (us, 's@l.local'), (ut, 't@l.local'), (ux, 'x@l.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah L', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, position, xp_reward) values (sa, subj, 10, 'A', 'Dasar', 1, 100) returning id into n1;
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, position, xp_reward) values (sa, subj, 10, 'B', 'Lanjut', 2, 100) returning id into n2;
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, position, xp_reward, status) values (sa, subj, 10, 'C', 'Draf', 3, 100, 'draft') returning id into n3;
  insert into public.competency_prerequisites (school_id, node_id, requires_id) values (sa, n2, n1);
  insert into public.quiz_questions (school_id, node_id, kind, prompt, options, position) values
    (sa, n1, 'mcq', '1 + 1 = ?', '[{"id":"a","text":"1"},{"id":"b","text":"2"}]', 1) returning id into q1;
  insert into public.quiz_questions (school_id, node_id, kind, prompt, options, position) values
    (sa, n1, 'multi', 'Bilangan genap?', '[{"id":"a","text":"2"},{"id":"b","text":"3"},{"id":"c","text":"4"}]', 2) returning id into q2;
  insert into public.quiz_questions (school_id, node_id, kind, prompt, position) values (sa, n1, 'short', 'Akar dari 9?', 3) returning id into q3;
  insert into public.quiz_answer_keys (school_id, question_id, answer, explanation) values
    (sa, q1, '"b"', 'Satu tambah satu sama dengan dua.'),
    (sa, q2, '["a","c"]', 'Dua dan empat habis dibagi dua.'),
    (sa, q3, '["3","tiga"]', 'Tiga kali tiga sama dengan sembilan.');
  insert into public.quiz_questions (school_id, node_id, kind, prompt, options, position) values
    (sa, n2, 'mcq', '2 + 2 = ?', '[{"id":"a","text":"4"},{"id":"b","text":"5"}]', 1) returning id into q3;
  insert into public.quiz_answer_keys (school_id, question_id, answer, explanation) values (sa, q3, '"a"', 'Dua tambah dua sama dengan empat.');

  select id into r_student from public.roles where school_id = sa and code = 'student';
  select id into r_teacher from public.roles where school_id = sa and code = 'teacher';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_student, 'Siswa') returning id into ms;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_teacher, 'Guru') returning id into mt;

  -- Siswa
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa melihat materi terbit saja', (select count(*) from public.competency_nodes) = 2);
  perform pg_temp.chk('siswa membaca soal tetapi bukan kunci', (select count(*) from public.quiz_questions) = 4 and (select count(*) from public.quiz_answer_keys) = 0);
  begin
    perform public.submit_quiz(n2, '{}'::jsonb);
    perform pg_temp.chk('materi terkunci ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('materi terkunci ditolak', true, sqlerrm); end;
  begin
    insert into public.node_progress (node_id, member_id, school_id, best_score, stars, completed_at) values (n1, ms, sa, 100, 3, now());
    perform pg_temp.chk('siswa tidak bisa menulis progres langsung', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa menulis progres langsung', true, sqlerrm); end;
  begin
    update public.student_stats set xp = 99999 where member_id = ms;
    get diagnostics n = row_count;
    perform pg_temp.chk('siswa tidak bisa mengubah XP sendiri', n = 0);
  exception when others then perform pg_temp.chk('siswa tidak bisa mengubah XP sendiri', true, sqlerrm); end;

  -- Percobaan pertama: 1 dari 3 benar -> 33 (gagal)
  res := public.submit_quiz(n1, jsonb_build_object(q1::text, to_jsonb('b'::text)));
  perform pg_temp.chk('skor 33 untuk 1 dari 3 benar', (res->>'score')::int = 33 and (res->>'stars')::int = 0 and (res->>'xp_awarded')::int = 0, res->>'score');
  perform pg_temp.chk('gagal tidak membuka materi berikutnya', jsonb_array_length(res->'unlocked') = 0);
  begin
    perform public.submit_quiz(n2, '{}'::jsonb);
    perform pg_temp.chk('masih terkunci setelah gagal', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('masih terkunci setelah gagal', true, sqlerrm); end;

  -- Percobaan kedua: semua benar -> 100, 3 bintang
  select id into q1 from public.quiz_questions where node_id = n1 and position = 1;
  select id into q2 from public.quiz_questions where node_id = n1 and position = 2;
  select id into q3 from public.quiz_questions where node_id = n1 and position = 3;
  res := public.submit_quiz(n1, jsonb_build_object(q1::text, to_jsonb('b'::text), q2::text, '["c","a"]'::jsonb, q3::text, to_jsonb(' Tiga '::text)));
  perform pg_temp.chk('semua benar: skor 100 dan 3 bintang', (res->>'score')::int = 100 and (res->>'stars')::int = 3);
  perform pg_temp.chk('XP = 100*1,25 + bonus sempurna 25 = 150', (res->>'xp_awarded')::int = 150, res->>'xp_awarded');
  perform pg_temp.chk('level naik ke 2 (butuh 100 XP)', (res->>'level')::int = 2 and (res->>'leveled_up')::boolean);
  perform pg_temp.chk('materi berikutnya terbuka', jsonb_array_length(res->'unlocked') = 1);
  perform pg_temp.chk('streak hari pertama = 1', (res->>'streak')::int = 1);
  perform pg_temp.chk('hasil memuat penjelasan per soal', res->'results'->0->>'explanation' is not null);

  -- Mengulang tidak menambah XP dan tidak menurunkan hasil terbaik
  res := public.submit_quiz(n1, jsonb_build_object(q1::text, to_jsonb('a'::text)));
  perform pg_temp.chk('mengulang tidak menambah XP', (res->>'xp_awarded')::int = 0, res->>'xp_awarded');
  perform pg_temp.chk('hasil terbaik tidak turun', (select best_score from public.node_progress where node_id = n1 and member_id = ms) = 100);
  perform pg_temp.chk('percobaan tercatat 3', (select attempts from public.node_progress where node_id = n1 and member_id = ms) = 3);
  perform pg_temp.chk('streak sama di hari yang sama', (select streak from public.student_stats where member_id = ms) = 1);

  -- Materi berikutnya kini bisa dikerjakan
  select id into q3 from public.quiz_questions where node_id = n2;
  res := public.submit_quiz(n2, jsonb_build_object(q3::text, to_jsonb('a'::text)));
  perform pg_temp.chk('materi kedua selesai 3 bintang', (res->>'stars')::int = 3);
  perform pg_temp.chk('buku besar XP mencatat 2 kejadian', (select count(*) from public.xp_events where member_id = ms) = 2);

  -- Streak: kemarin -> hari ini = +1; lewat 2 hari -> reset
  execute 'reset role';
  update public.student_stats set last_activity_date = (now() at time zone 'Asia/Jakarta')::date - 1 where member_id = ms;
  execute 'set local role authenticated';
  res := public.submit_quiz(n1, jsonb_build_object(q1::text, to_jsonb('b'::text)));
  perform pg_temp.chk('streak +1 bila kemarin aktif', (res->>'streak')::int = 2, res->>'streak');
  execute 'reset role';
  update public.student_stats set last_activity_date = (now() at time zone 'Asia/Jakarta')::date - 3 where member_id = ms;
  execute 'set local role authenticated';
  res := public.submit_quiz(n1, jsonb_build_object(q1::text, to_jsonb('b'::text)));
  perform pg_temp.chk('streak reset bila libur lebih dari sehari', (res->>'streak')::int = 1, res->>'streak');
  perform pg_temp.chk('best_streak tetap 2', (select best_streak from public.student_stats where member_id = ms) = 2);

  -- Siswa tidak bisa membuat intervensi
  begin
    insert into public.interventions (school_id, student_member_id, created_by_member_id, kind, note) values (sa, ms, ms, 'remedial', 'catatan');
    perform pg_temp.chk('siswa tidak bisa membuat intervensi', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa membuat intervensi', true, sqlerrm); end;

  -- Guru
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('guru melihat progres siswa', (select count(*) from public.node_progress where member_id = ms) = 2);
  perform pg_temp.chk('guru melihat statistik siswa', (select count(*) from public.student_stats where member_id = ms) = 1);
  perform pg_temp.chk('guru membaca kunci jawaban (penulis)', (select count(*) from public.quiz_answer_keys) = 4);
  insert into public.interventions (school_id, student_member_id, created_by_member_id, kind, priority, note, due_on)
    values (sa, ms, mt, 'remedial', 'tinggi', 'Ulangi materi dasar.', current_date + 7);
  perform pg_temp.chk('guru membuat intervensi', (select count(*) from public.interventions) = 1);
  begin
    insert into public.interventions (school_id, student_member_id, created_by_member_id, kind, note) values (sa, ms, ms, 'remedial', 'palsu');
    perform pg_temp.chk('intervensi atas nama orang lain ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('intervensi atas nama orang lain ditolak', true, sqlerrm); end;

  -- Orang luar
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ux, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('orang luar tidak melihat materi', (select count(*) from public.competency_nodes) = 0);
  perform pg_temp.chk('orang luar tidak melihat progres', (select count(*) from public.node_progress) = 0 and (select count(*) from public.interventions) = 0);
  begin
    perform public.submit_quiz(n1, '{}'::jsonb);
    perform pg_temp.chk('orang luar tidak bisa mengerjakan kuis', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('orang luar tidak bisa mengerjakan kuis', true, sqlerrm); end;

  -- Aturan level
  execute 'reset role';
  perform pg_temp.chk('level_for_xp: 0->1, 99->1, 100->2, 381->2, 382->3',
    app_private.level_for_xp(0) = 1 and app_private.level_for_xp(99) = 1 and app_private.level_for_xp(100) = 2
    and app_private.level_for_xp(381) = 2 and app_private.level_for_xp(382) = 3);
  perform pg_temp.chk('bintang: 90->3, 75->2, 60->1, 59->0',
    app_private.stars_for_score(90) = 3 and app_private.stars_for_score(75) = 2 and app_private.stars_for_score(60) = 1 and app_private.stars_for_score(59) = 0);

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
