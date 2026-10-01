-- Tes nilai dan rapor: gerbang paket, hak menilai per penugasan, siswa hanya membaca nilai sendiri, catatan wali kelas.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut1 uuid := gen_random_uuid(); ut2 uuid := gen_random_uuid(); us1 uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; term uuid; subj uuid; c1 uuid; r_t uuid; r_s uuid; r_h uuid;
  mt1 uuid; mt2 uuid; ms1 uuid; ms2 uuid; asm uuid; n int;
begin
  insert into auth.users (id, email) values (uo,'o@g.local'),(ut1,'t1@g.local'),(ut2,'t2@g.local'),(us1,'s1@g.local'),(us2,'s2@g.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah G', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.terms (school_id, academic_year_id, seq, name, starts_on, ends_on) values (sa, yr, 1, 'Ganjil', '2026-07-01', '2026-12-31') returning id into term;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut1, r_t, 'Guru 1') returning id into mt1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut2, r_t, 'Guru 2') returning id into mt2;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us1, r_s, 'Siswa 1') returning id into ms1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Siswa 2') returning id into ms2;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms1), (sa, c1, ms2);
  insert into public.teaching_assignments (school_id, class_group_id, school_subject_id, teacher_member_id) values (sa, c1, subj, mt1);
  update public.class_groups set homeroom_member_id = mt1 where id = c1;

  -- Starter: modul nilai belum aktif, guru ditolak
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title) values (sa, c1, subj, term, 'UH 1');
    perform pg_temp.chk('Starter: penilaian ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('Starter: penilaian ditolak', true, sqlerrm); end;

  -- Paket Sekolah
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;
  perform set_config('request.jwt.claims', json_build_object('sub', ut1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title, kind, weight, created_by) values (sa, c1, subj, term, 'UH 1', 'tugas', 2, mt1) returning id into asm;
  insert into public.assessment_scores (assessment_id, member_id, school_id, score) values (asm, ms1, sa, 88), (asm, ms2, sa, 70);
  perform pg_temp.chk('guru penugasan membuat penilaian dan nilai', (select count(*) from public.assessment_scores) = 2);
  insert into public.report_notes (school_id, term_id, member_id, note, written_by) values (sa, term, ms1, 'Rajin dan aktif.', mt1);
  perform pg_temp.chk('wali kelas menulis catatan rapor', (select count(*) from public.report_notes) = 1);

  -- Guru 2 tanpa penugasan
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title) values (sa, c1, subj, term, 'Curang');
    perform pg_temp.chk('guru tanpa penugasan tidak bisa membuat penilaian', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru tanpa penugasan tidak bisa membuat penilaian', true, sqlerrm); end;
  update public.assessment_scores set score = 100 where member_id = ms2;
  get diagnostics n = row_count;
  perform pg_temp.chk('guru tanpa penugasan tidak bisa mengubah nilai', n = 0);
  begin
    insert into public.report_notes (school_id, term_id, member_id, note) values (sa, term, ms2, 'bukan wali kelas');
    perform pg_temp.chk('bukan wali kelas tidak bisa menulis catatan', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('bukan wali kelas tidak bisa menulis catatan', true, sqlerrm); end;

  -- Siswa 1
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa hanya membaca nilai sendiri', (select count(*) from public.assessment_scores) = 1 and (select score from public.assessment_scores) = 88);
  perform pg_temp.chk('siswa melihat penilaian rombelnya', (select count(*) from public.assessments) = 1);
  perform pg_temp.chk('siswa membaca catatan rapor sendiri', (select count(*) from public.report_notes) = 1);
  update public.assessment_scores set score = 100 where member_id = ms1;
  get diagnostics n = row_count;
  perform pg_temp.chk('siswa tidak bisa mengubah nilainya', n = 0);

  -- Siswa 2 tidak melihat catatan siswa 1
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa lain tidak melihat catatan rapor teman', (select count(*) from public.report_notes) = 0);

  -- Modul dicabut: data tidak terbaca
  execute 'reset role';
  insert into public.school_modules (school_id, module_code, enabled) values (sa, 'gradebook', false);
  perform set_config('request.jwt.claims', json_build_object('sub', ut1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('modul dicabut: nilai tidak terbaca', (select count(*) from public.assessment_scores) = 0 and (select count(*) from public.assessments) = 0);

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
