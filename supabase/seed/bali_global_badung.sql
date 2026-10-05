-- Data uji sintetis: SMK TI Bali Global Badung (nama dan angka karangan; profil sekolah dari situs publik, belum diverifikasi ⚠).
-- Kata sandi diganti penanda __KATA_SANDI_*__ di repo; jalankan dengan nilai sendiri. Aman dijalankan ulang (berhenti bila sekolah sudah ada).
do $$
declare
  s uuid; prog uuid; ay uuid; term uuid; trk_b uuid; r_t uuid; r_s uuid; r_p uuid; r_a uuid; r_o uuid; owner_uid uuid;
begin
  if exists (select 1 from public.schools where name = 'SMK TI Bali Global Badung') then raise notice 'sudah ada'; return; end if;
  create temp table tmp_u (key text primary key, id uuid default gen_random_uuid(), email text, name text, role text, pw text) on commit drop;
  insert into tmp_u (key, email, name, role, pw) values
    ('kepsek', 'kepsek@baliglobal.edusmart.test', 'Ni Nyoman Sri Wahyuni', 'owner', '__KATA_SANDI_OWNER__'),
    ('admin', 'admin@baliglobal.edusmart.test', 'I Gede Surya Adnyana', 'admin', '__KATA_SANDI_ADMIN__'),
    ('t_mat', 'made.arya@baliglobal.edusmart.test', 'I Made Arya Pratama', 'teacher', '__KATA_SANDI_GURU__'),
    ('t_bin', 'kadek.wulan@baliglobal.edusmart.test', 'Ni Kadek Wulan Sari', 'teacher', '__KATA_SANDI_GURU__'),
    ('t_prog', 'putu.wirawan@baliglobal.edusmart.test', 'I Putu Gede Wirawan', 'teacher', '__KATA_SANDI_GURU__'),
    ('t_bing', 'komang.tri@baliglobal.edusmart.test', 'Ni Komang Tri Handayani', 'teacher', '__KATA_SANDI_GURU__'),
    ('t_jar', 'wayan.cahyadi@baliglobal.edusmart.test', 'I Wayan Dwi Cahyadi', 'teacher', '__KATA_SANDI_GURU__'),
    ('t_dgr', 'agung.mahendra@baliglobal.edusmart.test', 'Anak Agung Ngurah Bagus Mahendra', 'teacher', '__KATA_SANDI_GURU__'),
    ('t_inf', 'eka.mahayani@baliglobal.edusmart.test', 'Ni Putu Eka Mahayani', 'teacher', '__KATA_SANDI_GURU__'),
    ('s01', 'bgb-2610001@murid.edusmart.test', 'Surya Kadek Handayani', 'student', '__KATA_SANDI_MURID__'),
    ('s02', 'bgb-2610002@murid.edusmart.test', 'I Rama Wayan Kusuma', 'student', '__KATA_SANDI_MURID__'),
    ('s03', 'bgb-2610003@murid.edusmart.test', 'I Gede Komang Pradnyana', 'student', '__KATA_SANDI_MURID__'),
    ('s04', 'bgb-2610004@murid.edusmart.test', 'Anjani Kirana Pertiwi', 'student', '__KATA_SANDI_MURID__'),
    ('s05', 'bgb-2610005@murid.edusmart.test', 'I Nyoman Wayan Darmayanti', 'student', '__KATA_SANDI_MURID__'),
    ('s06', 'bgb-2610006@murid.edusmart.test', 'Utami Ratna Kusuma', 'student', '__KATA_SANDI_MURID__'),
    ('s07', 'bgb-2610007@murid.edusmart.test', 'Ratna Dewi Permana', 'student', '__KATA_SANDI_MURID__'),
    ('s08', 'bgb-2610008@murid.edusmart.test', 'I Surya Rama Ardana', 'student', '__KATA_SANDI_MURID__'),
    ('s09', 'bgb-2610009@murid.edusmart.test', 'I Dwi Eka Saputra', 'student', '__KATA_SANDI_MURID__'),
    ('s10', 'bgb-2610010@murid.edusmart.test', 'Ni Dewi Anjani Adnyani', 'student', '__KATA_SANDI_MURID__'),
    ('s11', 'bgb-2610011@murid.edusmart.test', 'Nadia Kirana Handayani', 'student', '__KATA_SANDI_MURID__'),
    ('s12', 'bgb-2610012@murid.edusmart.test', 'Ni Kirana Dewi Suryawan', 'student', '__KATA_SANDI_MURID__'),
    ('s13', 'bgb-2610013@murid.edusmart.test', 'Widya Dewi Nugraha', 'student', '__KATA_SANDI_MURID__'),
    ('s14', 'bgb-2610014@murid.edusmart.test', 'Lestari Laksmi Permana', 'student', '__KATA_SANDI_MURID__'),
    ('s15', 'bgb-2610015@murid.edusmart.test', 'I Arya Putu Pertiwi', 'student', '__KATA_SANDI_MURID__'),
    ('s16', 'bgb-2610016@murid.edusmart.test', 'I Komang Agus Pradnyana', 'student', '__KATA_SANDI_MURID__'),
    ('s17', 'bgb-2610017@murid.edusmart.test', 'Komang Rama Purnama', 'student', '__KATA_SANDI_MURID__'),
    ('s18', 'bgb-2610018@murid.edusmart.test', 'Ni Utami Maharani Handayani', 'student', '__KATA_SANDI_MURID__'),
    ('s19', 'bgb-2610019@murid.edusmart.test', 'I Dewa Adi Handayani', 'student', '__KATA_SANDI_MURID__'),
    ('s20', 'bgb-2610020@murid.edusmart.test', 'Ni Utami Widya Wiguna', 'student', '__KATA_SANDI_MURID__'),
    ('s21', 'bgb-2610021@murid.edusmart.test', 'Ni Lestari Ayu Pradnyana', 'student', '__KATA_SANDI_MURID__'),
    ('s22', 'bgb-2610022@murid.edusmart.test', 'Adi Dewa Handayani', 'student', '__KATA_SANDI_MURID__'),
    ('s23', 'bgb-2610023@murid.edusmart.test', 'I Dewa Komang Mahardika', 'student', '__KATA_SANDI_MURID__'),
    ('s24', 'bgb-2610024@murid.edusmart.test', 'I Agus Ketut Suryawan', 'student', '__KATA_SANDI_MURID__'),
    ('s25', 'bgb-2610025@murid.edusmart.test', 'I Bayu Gede Wijaya', 'student', '__KATA_SANDI_MURID__'),
    ('s26', 'bgb-2610026@murid.edusmart.test', 'Maharani Dewi Wijaya', 'student', '__KATA_SANDI_MURID__'),
    ('s27', 'bgb-2610027@murid.edusmart.test', 'Ni Tari Nadia Suryawan', 'student', '__KATA_SANDI_MURID__'),
    ('s28', 'bgb-2610028@murid.edusmart.test', 'Putri Maharani Suastika', 'student', '__KATA_SANDI_MURID__'),
    ('s29', 'bgb-2610029@murid.edusmart.test', 'Lestari Utami Santika', 'student', '__KATA_SANDI_MURID__'),
    ('s30', 'bgb-2610030@murid.edusmart.test', 'Ni Nadia Widya Pertiwi', 'student', '__KATA_SANDI_MURID__'),
    ('s31', 'bgb-2610031@murid.edusmart.test', 'Komang Kadek Nugraha', 'student', '__KATA_SANDI_MURID__'),
    ('s32', 'bgb-2610032@murid.edusmart.test', 'Ni Ratna Putri Mahardika', 'student', '__KATA_SANDI_MURID__'),
    ('s33', 'bgb-2610033@murid.edusmart.test', 'Ni Nadia Citra Sudiarta', 'student', '__KATA_SANDI_MURID__'),
    ('s34', 'bgb-2610034@murid.edusmart.test', 'Rama Yoga Pertiwi', 'student', '__KATA_SANDI_MURID__'),
    ('s35', 'bgb-2610035@murid.edusmart.test', 'I Nyoman Gede Suastika', 'student', '__KATA_SANDI_MURID__'),
    ('s36', 'bgb-2610036@murid.edusmart.test', 'Ketut Nyoman Nugraha', 'student', '__KATA_SANDI_MURID__'),
    ('s37', 'bgb-2610037@murid.edusmart.test', 'I Komang Kadek Wijaya', 'student', '__KATA_SANDI_MURID__'),
    ('s38', 'bgb-2610038@murid.edusmart.test', 'I Wayan Bayu Pradnyana', 'student', '__KATA_SANDI_MURID__'),
    ('s39', 'bgb-2610039@murid.edusmart.test', 'Bayu Wayan Jayanti', 'student', '__KATA_SANDI_MURID__'),
    ('s40', 'bgb-2610040@murid.edusmart.test', 'I Adi Dwi Darmayanti', 'student', '__KATA_SANDI_MURID__'),
    ('ortu', 'ortu@baliglobal.edusmart.test', 'I Nyoman Budi Santika', 'parent', '__KATA_SANDI_ORTU__');
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current)
  select '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email, extensions.crypt(u.pw, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', u.name), now(), now(), '', '', '', '', '' from tmp_u u;
  insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), u.id::text, u.id, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now() from tmp_u u;
  select id into owner_uid from tmp_u where key = 'kepsek';
  perform set_config('request.jwt.claims', json_build_object('sub', owner_uid, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  s := public.create_school('SMK TI Bali Global Badung', 'kemendikdasmen', 'swasta', array['SMK'], 'kurmer', 'Badung', 'Bali', 'Ni Nyoman Sri Wahyuni');
  execute 'reset role';
  select id into prog from public.school_programs where school_id = s limit 1;
  select id into r_t from public.roles where school_id = s and code = 'teacher';
  select id into r_s from public.roles where school_id = s and code = 'student';
  select id into r_p from public.roles where school_id = s and code = 'parent';
  select id into r_a from public.roles where school_id = s and code = 'admin';
  create temp table tmp_m (key text primary key, mid uuid) on commit drop;
  insert into tmp_m select u.key, m.id from tmp_u u join public.school_members m on m.school_id = s and m.user_id = u.id where u.key = 'kepsek';
  with ins as (
    insert into public.school_members (school_id, user_id, role_id, display_name)
    select s, u.id, case u.role when 'teacher' then r_t when 'student' then r_s when 'parent' then r_p when 'admin' then r_a end, u.name from tmp_u u where u.role in ('teacher','student','parent','admin') returning id, user_id)
  insert into tmp_m select u.key, ins.id from ins join tmp_u u on u.id = ins.user_id;
  insert into public.tracks (school_id, type, code, name, path) values (s, 'smk_bidang', 'TIK', 'Teknologi Informasi dan Komunikasi', 'TIK') returning id into trk_b;
  insert into public.tracks (school_id, parent_id, type, code, name, path) values
    (s, trk_b, 'smk_program', 'RPL', 'Rekayasa Perangkat Lunak', 'TIK.RPL'),
    (s, trk_b, 'smk_program', 'TKJ', 'Teknik Komputer dan Jaringan', 'TIK.TKJ'),
    (s, trk_b, 'smk_program', 'MM', 'Multimedia', 'TIK.MM');
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (s, '2026/2027', '2026-07-13', '2027-06-26', 'semester') returning id into ay;
  insert into public.terms (school_id, academic_year_id, seq, name, starts_on, ends_on) values
    (s, ay, 1, 'Semester Ganjil', '2026-07-13', '2026-12-19'), (s, ay, 2, 'Semester Genap', '2027-01-04', '2027-06-26');
  select id into term from public.terms where school_id = s and seq = 1;
  insert into public.school_subjects (school_id, program_id, code, name, group_code, hours_per_week, grades) values
    (s, prog, 'MAT', 'Matematika', 'umum', 4, '{10,11,12}'),
    (s, prog, 'BIN', 'Bahasa Indonesia', 'umum', 4, '{10,11,12}'),
    (s, prog, 'BING', 'Bahasa Inggris', 'umum', 3, '{10,11,12}'),
    (s, prog, 'INF', 'Informatika', 'umum', 3, '{10,11}'),
    (s, prog, 'DPK', 'Dasar-dasar Program Keahlian', 'kejuruan', 6, '{10}'),
    (s, prog, 'PROG', 'Pemrograman Dasar', 'kejuruan', 6, '{10,11}'),
    (s, prog, 'JAR', 'Jaringan Komputer Dasar', 'kejuruan', 6, '{10,11}'),
    (s, prog, 'DGR', 'Desain Grafis Dasar', 'kejuruan', 6, '{10,11}');

  insert into public.class_groups (school_id, program_id, academic_year_id, track_id, name, grade, homeroom_member_id)
    select s, prog, ay, (select id from public.tracks where school_id = s and code = 'RPL'), 'X RPL 1', 10, (select mid from tmp_m where key = 't_prog');
  insert into public.class_groups (school_id, program_id, academic_year_id, track_id, name, grade, homeroom_member_id)
    select s, prog, ay, (select id from public.tracks where school_id = s and code = 'TKJ'), 'X TKJ 1', 10, (select mid from tmp_m where key = 't_jar');
  insert into public.class_groups (school_id, program_id, academic_year_id, track_id, name, grade, homeroom_member_id)
    select s, prog, ay, (select id from public.tracks where school_id = s and code = 'MM'), 'X MM 1', 10, (select mid from tmp_m where key = 't_dgr');
  insert into public.class_groups (school_id, program_id, academic_year_id, track_id, name, grade, homeroom_member_id)
    select s, prog, ay, (select id from public.tracks where school_id = s and code = 'RPL'), 'XI RPL 1', 11, (select mid from tmp_m where key = 't_inf');
  insert into public.class_groups (school_id, program_id, academic_year_id, track_id, name, grade, homeroom_member_id)
    select s, prog, ay, (select id from public.tracks where school_id = s and code = 'TKJ'), 'XI TKJ 1', 11, (select mid from tmp_m where key = 't_mat');
  create temp table tmp_c (key text primary key, id uuid) on commit drop;
  insert into tmp_c select 'x_rpl1', id from public.class_groups where school_id = s and name = 'X RPL 1';
  insert into tmp_c select 'x_tkj1', id from public.class_groups where school_id = s and name = 'X TKJ 1';
  insert into tmp_c select 'x_mm1', id from public.class_groups where school_id = s and name = 'X MM 1';
  insert into tmp_c select 'xi_rpl1', id from public.class_groups where school_id = s and name = 'XI RPL 1';
  insert into tmp_c select 'xi_tkj1', id from public.class_groups where school_id = s and name = 'XI TKJ 1';
  insert into public.class_group_students (school_id, class_group_id, member_id) select s, c.id, m.mid from (values
    ('s01', 'x_rpl1'),
    ('s02', 'x_rpl1'),
    ('s03', 'x_rpl1'),
    ('s04', 'x_rpl1'),
    ('s05', 'x_rpl1'),
    ('s06', 'x_rpl1'),
    ('s07', 'x_rpl1'),
    ('s08', 'x_rpl1'),
    ('s09', 'x_tkj1'),
    ('s10', 'x_tkj1'),
    ('s11', 'x_tkj1'),
    ('s12', 'x_tkj1'),
    ('s13', 'x_tkj1'),
    ('s14', 'x_tkj1'),
    ('s15', 'x_tkj1'),
    ('s16', 'x_tkj1'),
    ('s17', 'x_mm1'),
    ('s18', 'x_mm1'),
    ('s19', 'x_mm1'),
    ('s20', 'x_mm1'),
    ('s21', 'x_mm1'),
    ('s22', 'x_mm1'),
    ('s23', 'x_mm1'),
    ('s24', 'x_mm1'),
    ('s25', 'xi_rpl1'),
    ('s26', 'xi_rpl1'),
    ('s27', 'xi_rpl1'),
    ('s28', 'xi_rpl1'),
    ('s29', 'xi_rpl1'),
    ('s30', 'xi_rpl1'),
    ('s31', 'xi_rpl1'),
    ('s32', 'xi_rpl1'),
    ('s33', 'xi_tkj1'),
    ('s34', 'xi_tkj1'),
    ('s35', 'xi_tkj1'),
    ('s36', 'xi_tkj1'),
    ('s37', 'xi_tkj1'),
    ('s38', 'xi_tkj1'),
    ('s39', 'xi_tkj1'),
    ('s40', 'xi_tkj1')) as v(skey, ckey) join tmp_m m on m.key = v.skey join tmp_c c on c.key = v.ckey;
  insert into public.teaching_assignments (school_id, class_group_id, school_subject_id, teacher_member_id, hours_per_week)
  select s, c.id, sj.id, m.mid, v.h from (values
    ('x_rpl1', 'MAT', 't_mat', 4),
    ('x_rpl1', 'BIN', 't_bin', 4),
    ('x_rpl1', 'BING', 't_bing', 3),
    ('x_rpl1', 'DPK', 't_prog', 6),
    ('x_rpl1', 'PROG', 't_prog', 6),
    ('x_tkj1', 'MAT', 't_mat', 4),
    ('x_tkj1', 'BIN', 't_bin', 4),
    ('x_tkj1', 'BING', 't_bing', 3),
    ('x_tkj1', 'DPK', 't_jar', 6),
    ('x_tkj1', 'JAR', 't_jar', 6),
    ('x_mm1', 'MAT', 't_mat', 4),
    ('x_mm1', 'BIN', 't_bin', 4),
    ('x_mm1', 'BING', 't_bing', 3),
    ('x_mm1', 'DPK', 't_dgr', 6),
    ('x_mm1', 'DGR', 't_dgr', 6),
    ('xi_rpl1', 'MAT', 't_mat', 4),
    ('xi_rpl1', 'BIN', 't_bin', 4),
    ('xi_rpl1', 'PROG', 't_prog', 6),
    ('xi_rpl1', 'INF', 't_inf', 3),
    ('xi_tkj1', 'MAT', 't_mat', 4),
    ('xi_tkj1', 'BING', 't_bing', 3),
    ('xi_tkj1', 'JAR', 't_jar', 6),
    ('xi_tkj1', 'INF', 't_inf', 3)) as v(ckey, sub, tkey, h) join tmp_c c on c.key = v.ckey join public.school_subjects sj on sj.school_id = s and sj.code = v.sub join tmp_m m on m.key = v.tkey;
  insert into public.schedule_slots (school_id, class_group_id, school_subject_id, teacher_member_id, weekday, starts_at, ends_at, room)
  select s, c.id, sj.id, m.mid, v.d, v.a::time, v.b::time, v.r from (values
    ('x_rpl1', 'MAT', 't_mat', 1, '07:30', '09:00', 'R. 12'),
    ('x_rpl1', 'BIN', 't_bin', 1, '09:15', '10:45', 'R. 12'),
    ('x_rpl1', 'BING', 't_bing', 1, '11:15', '12:45', 'R. 12'),
    ('x_rpl1', 'DPK', 't_prog', 2, '07:30', '09:00', 'Lab 1'),
    ('x_rpl1', 'PROG', 't_prog', 2, '09:15', '10:45', 'Lab RPL'),
    ('x_rpl1', 'MAT', 't_mat', 2, '11:15', '12:45', 'R. 12'),
    ('x_rpl1', 'BIN', 't_bin', 3, '07:30', '09:00', 'R. 12'),
    ('x_rpl1', 'BING', 't_bing', 3, '09:15', '10:45', 'R. 12'),
    ('x_rpl1', 'DPK', 't_prog', 3, '11:15', '12:45', 'Lab 1'),
    ('x_rpl1', 'PROG', 't_prog', 4, '07:30', '09:00', 'Lab RPL'),
    ('x_rpl1', 'MAT', 't_mat', 4, '09:15', '10:45', 'R. 12'),
    ('x_rpl1', 'BIN', 't_bin', 4, '11:15', '12:45', 'R. 12'),
    ('x_rpl1', 'BING', 't_bing', 5, '07:30', '09:00', 'R. 12'),
    ('x_rpl1', 'DPK', 't_prog', 5, '09:15', '10:45', 'Lab 1'),
    ('x_rpl1', 'PROG', 't_prog', 5, '11:15', '12:45', 'Lab RPL'),
    ('x_tkj1', 'BIN', 't_bin', 1, '07:30', '09:00', 'R. 12'),
    ('x_tkj1', 'BING', 't_bing', 1, '09:15', '10:45', 'R. 12'),
    ('x_tkj1', 'DPK', 't_jar', 1, '11:15', '12:45', 'Lab 1'),
    ('x_tkj1', 'JAR', 't_jar', 2, '07:30', '09:00', 'Lab TKJ'),
    ('x_tkj1', 'MAT', 't_mat', 2, '09:15', '10:45', 'R. 12'),
    ('x_tkj1', 'BIN', 't_bin', 2, '11:15', '12:45', 'R. 12'),
    ('x_tkj1', 'BING', 't_bing', 3, '07:30', '09:00', 'R. 12'),
    ('x_tkj1', 'DPK', 't_jar', 3, '09:15', '10:45', 'Lab 1'),
    ('x_tkj1', 'JAR', 't_jar', 3, '11:15', '12:45', 'Lab TKJ'),
    ('x_tkj1', 'MAT', 't_mat', 4, '07:30', '09:00', 'R. 12'),
    ('x_tkj1', 'BIN', 't_bin', 4, '09:15', '10:45', 'R. 12'),
    ('x_tkj1', 'BING', 't_bing', 4, '11:15', '12:45', 'R. 12'),
    ('x_tkj1', 'DPK', 't_jar', 5, '07:30', '09:00', 'Lab 1'),
    ('x_tkj1', 'JAR', 't_jar', 5, '09:15', '10:45', 'Lab TKJ'),
    ('x_tkj1', 'MAT', 't_mat', 5, '11:15', '12:45', 'R. 12'),
    ('x_mm1', 'BING', 't_bing', 1, '07:30', '09:00', 'R. 12'),
    ('x_mm1', 'DPK', 't_dgr', 1, '09:15', '10:45', 'Lab 1'),
    ('x_mm1', 'DGR', 't_dgr', 1, '11:15', '12:45', 'Lab MM'),
    ('x_mm1', 'MAT', 't_mat', 2, '07:30', '09:00', 'R. 12'),
    ('x_mm1', 'BIN', 't_bin', 2, '09:15', '10:45', 'R. 12'),
    ('x_mm1', 'BING', 't_bing', 2, '11:15', '12:45', 'R. 12'),
    ('x_mm1', 'DPK', 't_dgr', 3, '07:30', '09:00', 'Lab 1'),
    ('x_mm1', 'DGR', 't_dgr', 3, '09:15', '10:45', 'Lab MM'),
    ('x_mm1', 'MAT', 't_mat', 3, '11:15', '12:45', 'R. 12'),
    ('x_mm1', 'BIN', 't_bin', 4, '07:30', '09:00', 'R. 12'),
    ('x_mm1', 'BING', 't_bing', 4, '09:15', '10:45', 'R. 12'),
    ('x_mm1', 'DPK', 't_dgr', 4, '11:15', '12:45', 'Lab 1'),
    ('x_mm1', 'DGR', 't_dgr', 5, '07:30', '09:00', 'Lab MM'),
    ('x_mm1', 'MAT', 't_mat', 5, '09:15', '10:45', 'R. 12'),
    ('x_mm1', 'BIN', 't_bin', 5, '11:15', '12:45', 'R. 12'),
    ('xi_rpl1', 'INF', 't_inf', 1, '07:30', '09:00', 'Lab 1'),
    ('xi_rpl1', 'MAT', 't_mat', 1, '09:15', '10:45', 'R. 12'),
    ('xi_rpl1', 'BIN', 't_bin', 1, '11:15', '12:45', 'R. 12'),
    ('xi_rpl1', 'INF', 't_inf', 2, '07:30', '09:00', 'Lab 1'),
    ('xi_rpl1', 'PROG', 't_prog', 2, '11:15', '12:45', 'Lab RPL'),
    ('xi_rpl1', 'INF', 't_inf', 3, '07:30', '09:00', 'Lab 1'),
    ('xi_rpl1', 'MAT', 't_mat', 3, '09:15', '10:45', 'R. 12'),
    ('xi_rpl1', 'BIN', 't_bin', 3, '11:15', '12:45', 'R. 12'),
    ('xi_rpl1', 'INF', 't_inf', 4, '07:30', '09:00', 'Lab 1'),
    ('xi_rpl1', 'PROG', 't_prog', 4, '09:15', '10:45', 'Lab RPL'),
    ('xi_rpl1', 'MAT', 't_mat', 4, '11:15', '12:45', 'R. 12'),
    ('xi_rpl1', 'BIN', 't_bin', 5, '07:30', '09:00', 'R. 12'),
    ('xi_rpl1', 'INF', 't_inf', 5, '09:15', '10:45', 'Lab 1'),
    ('xi_tkj1', 'JAR', 't_jar', 1, '07:30', '09:00', 'Lab TKJ'),
    ('xi_tkj1', 'INF', 't_inf', 1, '09:15', '10:45', 'Lab 1'),
    ('xi_tkj1', 'MAT', 't_mat', 1, '11:15', '12:45', 'R. 12'),
    ('xi_tkj1', 'BING', 't_bing', 2, '07:30', '09:00', 'R. 12'),
    ('xi_tkj1', 'JAR', 't_jar', 2, '09:15', '10:45', 'Lab TKJ'),
    ('xi_tkj1', 'INF', 't_inf', 2, '11:15', '12:45', 'Lab 1'),
    ('xi_tkj1', 'MAT', 't_mat', 3, '07:30', '09:00', 'R. 12'),
    ('xi_tkj1', 'INF', 't_inf', 3, '09:15', '10:45', 'Lab 1'),
    ('xi_tkj1', 'BING', 't_bing', 3, '11:15', '12:45', 'R. 12'),
    ('xi_tkj1', 'JAR', 't_jar', 4, '07:30', '09:00', 'Lab TKJ'),
    ('xi_tkj1', 'INF', 't_inf', 4, '09:15', '10:45', 'Lab 1'),
    ('xi_tkj1', 'MAT', 't_mat', 5, '07:30', '09:00', 'R. 12'),
    ('xi_tkj1', 'BING', 't_bing', 5, '09:15', '10:45', 'R. 12'),
    ('xi_tkj1', 'JAR', 't_jar', 5, '11:15', '12:45', 'Lab TKJ')) as v(ckey, sub, tkey, d, a, b, r) join tmp_c c on c.key = v.ckey join public.school_subjects sj on sj.school_id = s and sj.code = v.sub join tmp_m m on m.key = v.tkey;
  insert into public.member_profiles (member_id, school_id, nis, nisn, gender, birth_place, birth_date, address, phone, guardian_name, guardian_phone)
  select m.mid, s, '2610' || lpad(right(m.key,2)::int::text, 3, '0'), '00870' || lpad((right(m.key,2)::int * 7)::text, 5, '0'), case when (right(m.key,2)::int) % 2 = 0 then 'P' else 'L' end, 'Badung', (case when right(m.key,2)::int <= 24 then date '2010-01-01' else date '2009-01-01' end) + ((right(m.key,2)::int * 23) % 330), 'Jl. Contoh ' || right(m.key,2)::int || ', Badung', '08120001' || right(m.key,2), 'Orang tua murid ' || right(m.key,2), '08130001' || right(m.key,2)
  from tmp_m m where m.key ~ '^s[0-9]+$';
  insert into public.guardianships (school_id, parent_member_id, student_member_id, relation) select s, (select mid from tmp_m where key = 'ortu'), (select mid from tmp_m where key = 's01'), 'ayah';
  insert into public.announcements (school_id, author_member_id, title, body, audience, pinned) values
    (s, (select mid from tmp_m where key = 'kepsek'), 'Selamat datang di EduSmart', 'Mulai semester ini jadwal, absensi, nilai, dan pengumuman ada di satu tempat. Murid masuk dengan ID murid, guru dan staf dengan email.', 'semua', true),
    (s, (select mid from tmp_m where key = 'admin'), 'Pembayaran SPP Oktober', 'SPP Oktober dibayar paling lambat tanggal 10. Pembayaran dicatat oleh tata usaha di ruang administrasi.', 'semua', false),
    (s, (select mid from tmp_m where key = 'kepsek'), 'Jadwal PKL kelas XI', 'Rapat persiapan Praktik Kerja Lapangan kelas XI diadakan Jumat pekan depan di aula. Wali kelas mohon hadir.', 'guru', false);
  insert into public.announcements (school_id, author_member_id, title, body, audience, class_group_id) values
    (s, (select mid from tmp_m where key = 't_mat'), 'Ulangan harian Fungsi Kuadrat', 'Ulangan harian hari Rabu pekan depan. Coba kuis FK-1 sampai FK-4 di peta belajar dulu.', 'kelas', (select id from tmp_c where key = 'x_rpl1'));

  -- Kehadiran 10 hari sekolah terakhir (deterministik)
  insert into public.attendance_records (school_id, class_group_id, member_id, on_date, status, note, recorded_by)
  select s, cgs.class_group_id, cgs.member_id, d::date,
    case when abs(hashtext(cgs.member_id::text || d::text)) % 100 < 85 then 'hadir'
         when abs(hashtext(cgs.member_id::text || d::text)) % 100 < 90 then 'terlambat'
         when abs(hashtext(cgs.member_id::text || d::text)) % 100 < 94 then 'sakit'
         when abs(hashtext(cgs.member_id::text || d::text)) % 100 < 98 then 'izin' else 'alpa' end,
    null, (select homeroom_member_id from public.class_groups g where g.id = cgs.class_group_id)
  from public.class_group_students cgs
  cross join generate_series(((now() at time zone 'Asia/Jakarta')::date - 16), ((now() at time zone 'Asia/Jakarta')::date - 1), interval '1 day') d
  where cgs.school_id = s and extract(isodow from d) < 6;
  -- Penilaian dan nilai
  insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title, kind, weight, held_on, created_by)
  select s, ta.class_group_id, ta.school_subject_id, term, a.title, a.kind, a.weight, a.held_on, ta.teacher_member_id
  from public.teaching_assignments ta
  cross join (values ('Ulangan harian 1','tugas',2,date '2026-08-19'), ('Kuis bab 1','kuis',1,date '2026-09-03'), ('UTS','uts',3,date '2026-09-24')) as a(title, kind, weight, held_on)
  where ta.school_id = s;
  insert into public.assessment_scores (assessment_id, member_id, school_id, score)
  select a.id, cgs.member_id, s, least(100, greatest(45, 58 + abs(hashtext(cgs.member_id::text)) % 33 + (abs(hashtext(cgs.member_id::text || a.id::text)) % 15) - 4))
  from public.assessments a join public.class_group_students cgs on cgs.class_group_id = a.class_group_id
  where a.school_id = s;
  insert into public.invoices (school_id, member_id, title, amount, due_on, created_by)
  select s, m.id, t.title, 350000, t.due, (select mid from tmp_m where key = 'admin')
  from public.school_members m cross join (values ('SPP September 2026', date '2026-09-10'), ('SPP Oktober 2026', date '2026-10-10')) as t(title, due)
  where m.school_id = s and m.role_id = r_s;
  insert into public.payments (school_id, invoice_id, amount, method, paid_on, recorded_by)
  select s, i.id, i.amount, case when abs(hashtext(i.member_id::text)) % 2 = 0 then 'transfer' else 'tunai' end, '2026-09-08', (select mid from tmp_m where key = 'admin')
  from public.invoices i where i.school_id = s and i.title = 'SPP September 2026' and abs(hashtext(i.member_id::text)) % 100 < 80;
  insert into public.payments (school_id, invoice_id, amount, method, paid_on, recorded_by)
  select s, i.id, i.amount, 'transfer', (now() at time zone 'Asia/Jakarta')::date - 2, (select mid from tmp_m where key = 'admin')
  from public.invoices i where i.school_id = s and i.title = 'SPP Oktober 2026' and abs(hashtext(i.member_id::text)) % 100 < 45;
  -- XP pekan ini supaya Liga ramai
  insert into public.xp_events (school_id, member_id, amount, reason, created_at)
  select s, m.id, 20 * (1 + abs(hashtext(m.id::text || g::text)) % 8), 'latihan', now() - ((abs(hashtext(m.id::text || g::text)) % 120) || ' hours')::interval
  from public.school_members m cross join generate_series(1, 4) g
  where m.school_id = s and m.role_id = r_s and abs(hashtext(m.id::text)) % 100 < 85;
  raise notice 'selesai: %', s;
end $$;