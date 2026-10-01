-- Tes ujian terkunci: RLS (siswa tidak membaca soal), kode sekali pakai, token sesi, timer server, pembekuan, penilaian otomatis.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); us uuid := gen_random_uuid(); us2 uuid := gen_random_uuid(); ux uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; c1 uuid; subj uuid; r_t uuid; r_s uuid; mt uuid; ms uuid; ms2 uuid; ex uuid; q1 uuid; q2 uuid; q3 uuid; q4 uuid;
  lcode text; res jsonb; tok text; sess uuid;
begin
  insert into auth.users (id, email) values (uo,'o@ex.local'),(ut,'t@ex.local'),(us,'s@ex.local'),(us2,'s2@ex.local'),(ux,'x@ex.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah EX', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select r.id into r_t from public.roles r where r.school_id = sa and r.code = 'teacher';
  select r.id into r_s from public.roles r where r.school_id = sa and r.code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Guru EX') returning id into mt;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_s, 'Siswa Satu') returning id into ms;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Siswa Dua') returning id into ms2;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms);
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;

  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.exams (school_id, class_group_id, school_subject_id, title, starts_at, ends_at, duration_minutes, status, max_violations, created_by)
    values (sa, c1, subj, 'UTS Matematika', now() - interval '5 minutes', now() + interval '2 hours', 60, 'terbit', 2, mt) returning id into ex;
  insert into public.exam_questions (school_id, exam_id, kind, prompt, options, points, position) values (sa, ex, 'mcq', '2+2 = ?', '["3","4","5"]', 2, 1) returning id into q1;
  insert into public.exam_questions (school_id, exam_id, kind, prompt, options, points, position) values (sa, ex, 'multi', 'Bilangan genap?', '["1","2","3","4"]', 2, 2) returning id into q2;
  insert into public.exam_questions (school_id, exam_id, kind, prompt, points, position) values (sa, ex, 'short', 'Ibu kota Indonesia?', 1, 3) returning id into q3;
  insert into public.exam_questions (school_id, exam_id, kind, prompt, points, position) values (sa, ex, 'essay', 'Jelaskan pythagoras.', 5, 4) returning id into q4;
  insert into public.exam_answer_keys (question_id, school_id, answer) values (q1, sa, '1'), (q2, sa, '[1,3]'), (q3, sa, '["jakarta","nusantara"]');
  perform pg_temp.chk('guru: membuat ujian dan soal', (select count(*) from public.exam_questions) = 4);

  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  perform pg_temp.chk('siswa kelas: melihat ujian terbit', (select count(*) from public.exams) = 1);
  perform pg_temp.chk('siswa: tidak bisa membaca soal langsung', (select count(*) from public.exam_questions) = 0 and (select count(*) from public.exam_answer_keys) = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  perform pg_temp.chk('siswa kelas lain: tidak melihat ujian', (select count(*) from public.exams) = 0);
  begin perform public.exam_issue_launch(ex); perform pg_temp.chk('siswa kelas lain: tak bisa minta peluncuran', false);
  exception when others then perform pg_temp.chk('siswa kelas lain: tak bisa minta peluncuran', true); end;

  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  lcode := public.exam_issue_launch(ex);
  execute 'set local role anon';
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  res := public.exam_redeem(lcode, 'android', '1.0.0');
  tok := res->>'token';
  perform pg_temp.chk('redeem: token dan data ujian', tok like 'esx_%' and res->'exam'->>'title' = 'UTS Matematika' and res->>'status' = 'menunggu', res::text);
  begin perform public.exam_redeem(lcode); perform pg_temp.chk('kode tak bisa dipakai dua kali', false);
  exception when others then perform pg_temp.chk('kode tak bisa dipakai dua kali', true); end;
  begin perform public.exam_begin(tok, '{"secure": false}'); perform pg_temp.chk('mulai tanpa kunci perangkat ditolak', false);
  exception when others then perform pg_temp.chk('mulai tanpa kunci perangkat ditolak', true); end;
  res := public.exam_begin(tok, '{"secure": true}');
  perform pg_temp.chk('mulai: 4 soal tanpa kunci jawaban', jsonb_array_length(res->'questions') = 4 and not (res::text like '%explanation%') and res->>'status' = 'berjalan', left(res::text, 200));
  perform pg_temp.chk('mulai: tenggat 60 menit', (res->>'deadline_at')::timestamptz between now() + interval '59 minutes' and now() + interval '61 minutes');
  perform public.exam_save(tok, q1, '1'); perform public.exam_save(tok, q2, '[1,3]'); perform public.exam_save(tok, q3, '"Jakarta"'); perform public.exam_save(tok, q4, '"Segitiga siku-siku..."');
  perform public.exam_save(tok, q1, '1');
  begin perform public.exam_save('esx_' || repeat('0', 64), q1, '1'); perform pg_temp.chk('token palsu ditolak', false);
  exception when others then perform pg_temp.chk('token palsu ditolak', true); end;
  res := public.exam_begin(tok, '{"secure": true}');
  perform pg_temp.chk('lanjut: jawaban tersimpan dikembalikan', (res->'answers'->>(q3::text)) = 'Jakarta', (res->'answers')::text);
  res := public.exam_event(tok, 'keluar_fokus', '{"ms": 1200}');
  perform pg_temp.chk('peristiwa 1: dihitung, belum beku', res->>'status' = 'berjalan' and (res->>'violations')::int = 1, res::text);
  res := public.exam_event(tok, 'jaringan_putus');
  perform pg_temp.chk('jaringan putus: tidak dihitung', (res->>'violations')::int = 1);
  res := public.exam_event(tok, 'screenshot');
  perform pg_temp.chk('peristiwa 2 (batas 2): dibekukan', res->>'status' = 'dibekukan', res::text);
  begin perform public.exam_save(tok, q1, '0'); perform pg_temp.chk('simpan saat beku ditolak', false);
  exception when others then perform pg_temp.chk('simpan saat beku ditolak', true); end;

  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sess := (select id from public.exam_sessions where exam_id = ex limit 1);
  perform pg_temp.chk('guru: melihat sesi dan 3 peristiwa', (select count(*) from public.exam_events where session_id = sess) = 3 and (select count(*) from public.exam_answers where session_id = sess) = 4);
  perform public.exam_unfreeze(sess, 10);
  perform pg_temp.chk('guru: melanjutkan siswa (beku dicabut)', (select status from public.exam_sessions where id = sess) = 'berjalan');
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  begin perform public.exam_unfreeze(sess, 0); perform pg_temp.chk('siswa lain tak bisa melanjutkan', false);
  exception when others then perform pg_temp.chk('siswa lain tak bisa melanjutkan', true); end;

  execute 'set local role anon';
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  res := public.exam_submit(tok);
  perform pg_temp.chk('nilai: 5 dari 10 poin dinilai otomatis (esai menunggu)', (res->>'score')::numeric = 50 and (res->>'manual_pending')::boolean, res::text);
  begin perform public.exam_save(tok, q1, '0'); perform pg_temp.chk('simpan setelah kumpul ditolak', false);
  exception when others then perform pg_temp.chk('simpan setelah kumpul ditolak', true); end;

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
