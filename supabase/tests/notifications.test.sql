-- Tes notifikasi: pemicu pengumuman/tagihan/nilai, wali ikut diberi tahu, tanpa banjir, hanya milik sendiri.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); up uuid := gen_random_uuid(); us1 uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; term uuid; subj uuid; c1 uuid; c2 uuid; r_t uuid; r_s uuid; r_p uuid; mo uuid; mt uuid; mp uuid; ms1 uuid; ms2 uuid; asm uuid; n int;
begin
  insert into auth.users (id, email) values (uo,'o@nt.local'),(ut,'t@nt.local'),(up,'p@nt.local'),(us1,'s1@nt.local'),(us2,'s2@nt.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah NT', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into mo from public.school_members where school_id = sa and user_id = uo;
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.terms (school_id, academic_year_id, seq, name, starts_on, ends_on) values (sa, yr, 1, 'Ganjil', '2026-07-01', '2026-12-31') returning id into term;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-2', 10) returning id into c2;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  select id into r_p from public.roles where school_id = sa and code = 'parent';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Guru') returning id into mt;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, up, r_p, 'Orang Tua') returning id into mp;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us1, r_s, 'Anak') returning id into ms1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Lain') returning id into ms2;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms1), (sa, c2, ms2);
  insert into public.teaching_assignments (school_id, class_group_id, school_subject_id, teacher_member_id) values (sa, c1, subj, mt);
  execute 'reset role';
  update public.schools set plan_code = 'enterprise' where id = sa;
  insert into public.guardianships (school_id, parent_member_id, student_member_id) values (sa, mp, ms1);

  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.announcements (school_id, author_member_id, title, body, audience, class_group_id) values (sa, mo, 'Ulangan Rabu', 'Siapkan alat tulis.', 'kelas', c1);
  insert into public.invoices (school_id, member_id, title, amount) values (sa, ms1, 'SPP Oktober', 250000);
  execute 'reset role';
  perform pg_temp.chk('pengumuman rombel: siswa X-1 dan walinya diberi tahu, bukan X-2 atau pembuat',
    (select count(*) from public.notifications where kind = 'pengumuman' and member_id in (ms1, mp)) = 2
    and (select count(*) from public.notifications where kind = 'pengumuman' and member_id in (ms2, mo)) = 0);
  perform pg_temp.chk('tagihan: siswa dan wali diberi tahu', (select count(*) from public.notifications where kind = 'tagihan' and member_id in (ms1, mp)) = 2);

  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title, weight, created_by) values (sa, c1, subj, term, 'UH 1', 1, mt) returning id into asm;
  insert into public.assessment_scores (assessment_id, member_id, school_id, score) values (asm, ms1, sa, 80);
  update public.assessment_scores set score = 85 where assessment_id = asm and member_id = ms1;
  execute 'reset role';
  perform pg_temp.chk('nilai: satu notifikasi per penerima (tanpa banjir)', (select count(*) from public.notifications where kind = 'nilai' and member_id = ms1) = 1 and (select count(*) from public.notifications where kind = 'nilai' and member_id = mp) = 1);
  perform pg_temp.chk('siswa lain tidak diberi tahu soal nilai teman', (select count(*) from public.notifications where kind = 'nilai' and member_id = ms2) = 0);

  perform set_config('request.jwt.claims', json_build_object('sub', us1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa melihat 3 notifikasi miliknya', (select count(*) from public.notifications) = 3);
  update public.notifications set read_at = now();
  get diagnostics n = row_count;
  perform pg_temp.chk('siswa menandai dibaca miliknya', n = 3 and (select count(*) from public.notifications where read_at is null) = 0);
  begin
    insert into public.notifications (school_id, member_id, kind, title) values (sa, ms1, 'nilai', 'palsu');
    perform pg_temp.chk('siswa tidak bisa membuat notifikasi', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa membuat notifikasi', true, sqlerrm); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa lain tidak melihat notifikasi orang lain', (select count(*) from public.notifications where member_id <> ms2) = 0);

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
