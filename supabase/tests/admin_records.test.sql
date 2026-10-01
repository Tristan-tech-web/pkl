-- Tes administrasi: data induk (data pribadi) terbatas, NISN valid dan unik, surat hanya untuk pengelola dan penerima.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut1 uuid := gen_random_uuid(); ut2 uuid := gen_random_uuid(); us1 uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; c1 uuid; r_t uuid; r_s uuid; mt1 uuid; mt2 uuid; ms1 uuid; ms2 uuid; n int;
begin
  insert into auth.users (id, email) values (uo,'o@a2.local'),(ut1,'t1@a2.local'),(ut2,'t2@a2.local'),(us1,'s1@a2.local'),(us2,'s2@a2.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah AD', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut1, r_t, 'Wali') returning id into mt1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut2, r_t, 'Guru Lain') returning id into mt2;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us1, r_s, 'Siswa 1') returning id into ms1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Siswa 2') returning id into ms2;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms1), (sa, c1, ms2);
  update public.class_groups set homeroom_member_id = mt1 where id = c1;

  begin
    insert into public.member_profiles (member_id, school_id, nis) values (ms1, sa, '1001');
    perform pg_temp.chk('Starter: data induk ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('Starter: data induk ditolak', true, sqlerrm); end;

  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.member_profiles (member_id, school_id, nis, nisn, guardian_name, guardian_phone) values (ms1, sa, '1001', '0123456789', 'Ibu Siswa', '0812');
  insert into public.member_profiles (member_id, school_id, nis, nisn) values (ms2, sa, '1002', '0123456780');
  perform pg_temp.chk('pengelola menyimpan data induk', (select count(*) from public.member_profiles) = 2);
  begin
    update public.member_profiles set nisn = '0123456789' where member_id = ms2;
    perform pg_temp.chk('NISN ganda ditolak', false, 'seharusnya ditolak');
  exception when unique_violation then perform pg_temp.chk('NISN ganda ditolak', true); end;
  begin
    update public.member_profiles set nisn = '123' where member_id = ms2;
    perform pg_temp.chk('NISN harus 10 digit', false, 'seharusnya ditolak');
  exception when check_violation then perform pg_temp.chk('NISN harus 10 digit', true); end;
  perform pg_temp.chk('templat surat bawaan terbaca', (select count(*) from public.letter_templates) >= 3);
  insert into public.letters (school_id, number, title, body, member_id, issued_by) values (sa, '001/SKET/2026', 'Surat Keterangan', 'isi', ms1, (select id from public.school_members where school_id = sa and user_id = uo));
  begin
    insert into public.letters (school_id, number, title, body) values (sa, '001/SKET/2026', 'x', 'y');
    perform pg_temp.chk('nomor surat ganda ditolak', false, 'seharusnya ditolak');
  exception when unique_violation then perform pg_temp.chk('nomor surat ganda ditolak', true); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('wali kelas membaca data induk siswanya', (select count(*) from public.member_profiles) = 2);
  update public.member_profiles set guardian_phone = '000' where member_id = ms1;
  get diagnostics n = row_count;
  perform pg_temp.chk('wali kelas tidak bisa mengubah data induk', n = 0);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('guru lain tidak melihat data induk', (select count(*) from public.member_profiles) = 0 and (select count(*) from public.letters) = 0);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa hanya membaca data induk sendiri', (select count(*) from public.member_profiles) = 1);
  perform pg_temp.chk('siswa membaca surat untuk dirinya', (select count(*) from public.letters) = 1);
  begin
    insert into public.letters (school_id, number, title, body, member_id) values (sa, '002', 'x', 'y', ms1);
    perform pg_temp.chk('siswa tidak bisa menerbitkan surat', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa menerbitkan surat', true, sqlerrm); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa lain tidak melihat surat teman', (select count(*) from public.letters) = 0);

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
