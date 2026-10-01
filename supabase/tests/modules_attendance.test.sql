-- Tes modul per paket dan absensi: gerbang paket, penulis yang berhak, isolasi, penimpaan per sekolah.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut1 uuid := gen_random_uuid(); ut2 uuid := gen_random_uuid(); us uuid := gen_random_uuid(); ux uuid := gen_random_uuid();
  sa uuid; sb uuid; prog uuid; yr uuid; subj uuid; c1 uuid; c2 uuid;
  r_t uuid; r_s uuid; mt1 uuid; mt2 uuid; ms uuid; n int;
begin
  insert into auth.users (id, email) values (uo,'o@a.local'),(ut1,'t1@a.local'),(ut2,'t2@a.local'),(us,'s@a.local'),(ux,'x@a.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah A', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-2', 10) returning id into c2;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut1, r_t, 'Guru 1') returning id into mt1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut2, r_t, 'Guru 2') returning id into mt2;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_s, 'Siswa') returning id into ms;
  insert into public.teaching_assignments (school_id, class_group_id, school_subject_id, teacher_member_id) values (sa, c1, subj, mt1);

  -- Paket
  perform pg_temp.chk('Starter: absensi aktif', app_private.module_enabled(sa, 'attendance'));
  perform pg_temp.chk('Starter: nilai dan rapor tidak aktif', not app_private.module_enabled(sa, 'gradebook'));
  perform pg_temp.chk('Starter: tutor AI tidak aktif', not app_private.module_enabled(sa, 'ai_tutor'));

  -- Guru yang ditugaskan di X-1 mencatat absensi
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.attendance_records (school_id, class_group_id, member_id, on_date, status, recorded_by) values (sa, c1, ms, '2026-10-01', 'hadir', mt1);
  perform pg_temp.chk('guru penugasan mencatat absensi rombelnya', (select count(*) from public.attendance_records) = 1);
  begin
    insert into public.attendance_records (school_id, class_group_id, member_id, on_date, status) values (sa, c2, ms, '2026-10-01', 'hadir');
    perform pg_temp.chk('guru tidak bisa mencatat rombel lain', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru tidak bisa mencatat rombel lain', true, sqlerrm); end;

  -- Guru 2 (tanpa penugasan)
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    insert into public.attendance_records (school_id, class_group_id, member_id, on_date, status) values (sa, c1, ms, '2026-10-02', 'sakit');
    perform pg_temp.chk('guru tanpa penugasan ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru tanpa penugasan ditolak', true, sqlerrm); end;

  -- Siswa
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa membaca absensi sendiri', (select count(*) from public.attendance_records) = 1);
  begin
    insert into public.attendance_records (school_id, class_group_id, member_id, on_date, status) values (sa, c1, ms, '2026-10-03', 'hadir');
    perform pg_temp.chk('siswa tidak bisa menulis absensi', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa menulis absensi', true, sqlerrm); end;
  update public.attendance_records set status = 'hadir' where member_id = ms;
  get diagnostics n = row_count;
  perform pg_temp.chk('siswa tidak bisa mengubah absensi', n = 0);

  -- Orang luar
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ux, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('orang luar tidak melihat absensi', (select count(*) from public.attendance_records) = 0);

  -- Penimpaan per sekolah: cabut absensi
  execute 'reset role';
  insert into public.school_modules (school_id, module_code, enabled) values (sa, 'attendance', false), (sa, 'gradebook', true);
  perform pg_temp.chk('penimpaan: absensi dicabut', not app_private.module_enabled(sa, 'attendance'));
  perform pg_temp.chk('penimpaan: rapor ditambahkan', app_private.module_enabled(sa, 'gradebook'));
  perform set_config('request.jwt.claims', json_build_object('sub', ut1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('absensi dicabut: data tidak terbaca', (select count(*) from public.attendance_records) = 0);
  begin
    insert into public.attendance_records (school_id, class_group_id, member_id, on_date, status) values (sa, c1, ms, '2026-10-04', 'hadir');
    perform pg_temp.chk('absensi dicabut: tulis ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('absensi dicabut: tulis ditolak', true, sqlerrm); end;

  -- Paket sekolah/enterprise
  execute 'reset role';
  delete from public.school_modules where school_id = sa;
  update public.schools set plan_code = 'school' where id = sa;
  perform pg_temp.chk('Paket Sekolah: rapor aktif, keuangan tidak', app_private.module_enabled(sa, 'gradebook') and not app_private.module_enabled(sa, 'fees'));
  update public.schools set plan_code = 'enterprise' where id = sa;
  perform pg_temp.chk('Enterprise: keuangan aktif', app_private.module_enabled(sa, 'fees'));

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
