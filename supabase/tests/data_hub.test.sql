-- Tes pusat data: RLS berkas (ruang sekolah/guru), roster hanya pengelola, tebus kode menyambungkan roster, gerbang modul.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); us uuid := gen_random_uuid(); un uuid := gen_random_uuid(); ux uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; c1 uuid; r_t uuid; r_s uuid; mo uuid; mt uuid; rp uuid; inv text; res jsonb;
begin
  insert into auth.users (id, email) values (uo,'o@dh.local'),(ut,'t@dh.local'),(us,'s@dh.local'),(un,'n@dh.local'),(ux,'x@dh.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah DH', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into mo from public.school_members where school_id = sa and user_id = uo;
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Guru') returning id into mt;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_s, 'Siswa');
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;

  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.school_files (school_id, scope, uploaded_by, name, size_bytes, path, category) values (sa, 'sekolah', mo, 'siswa.xlsx', 100, sa || '/sekolah/a-siswa.xlsx', 'siswa');
  insert into public.school_files (school_id, scope, uploaded_by, name, size_bytes, path, category) values (sa, 'guru', mo, 'buku.pdf', 100, sa || '/guru/b-buku.pdf', 'buku_paket');
  insert into public.roster_people (school_id, kind, full_name, nis, nisn, class_name, gender, birth_date, guardian_name) values (sa, 'siswa', 'Dewi Anggraini', '2601', '0098765001', 'X-1', 'P', '2010-03-14', 'Wayan') returning id into rp;
  perform pg_temp.chk('pengelola: dua berkas dan roster tersimpan', (select count(*) from public.school_files) = 2 and (select count(*) from public.roster_people) = 1);
  begin
    insert into public.roster_people (school_id, kind, full_name, nisn) values (sa, 'siswa', 'Ganda', '0098765001');
    perform pg_temp.chk('NISN ganda di roster ditolak', false, 'seharusnya ditolak');
  exception when unique_violation then perform pg_temp.chk('NISN ganda di roster ditolak', true); end;
  begin
    insert into public.roster_people (school_id, kind, full_name, nisn) values (sa, 'siswa', 'Pendek', '123');
    perform pg_temp.chk('NISN tidak 10 digit ditolak', false, 'seharusnya ditolak');
  exception when check_violation then perform pg_temp.chk('NISN tidak 10 digit ditolak', true); end;
  insert into public.invites (school_id, role_id, class_group_id, max_uses, label, roster_id) values (sa, r_s, c1, 1, 'Dewi Anggraini', rp) returning code into inv;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('guru melihat berkas ruang guru saja', (select count(*) from public.school_files) = 1 and (select name from public.school_files) = 'buku.pdf');
  perform pg_temp.chk('guru tidak melihat roster', (select count(*) from public.roster_people) = 0);
  perform pg_temp.chk('jalur storage: guru boleh ruang guru, tidak ruang sekolah', app_private.can_use_file_path(sa || '/guru/x.pdf') and not app_private.can_use_file_path(sa || '/sekolah/x.xlsx'));
  insert into public.school_files (school_id, scope, uploaded_by, name, size_bytes, path, category) values (sa, 'guru', mt, 'lks.pdf', 10, sa || '/guru/c-lks.pdf', 'lks');
  begin
    insert into public.school_files (school_id, scope, uploaded_by, name, size_bytes, path) values (sa, 'sekolah', mt, 'curang.xlsx', 10, sa || '/sekolah/d.xlsx');
    perform pg_temp.chk('guru tidak bisa mencatat berkas ruang sekolah', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru tidak bisa mencatat berkas ruang sekolah', true, sqlerrm); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa tidak melihat berkas maupun roster', (select count(*) from public.school_files) = 0 and (select count(*) from public.roster_people) = 0 and not app_private.can_use_file_path(sa || '/guru/x.pdf'));
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ux, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('orang luar tidak melihat apa pun', (select count(*) from public.school_files) = 0 and (select count(*) from public.roster_people) = 0);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', un, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  res := to_jsonb(public.redeem_invite(inv, 'Nama Ketikan'));
  execute 'reset role';
  perform pg_temp.chk('tebus kode: anggota bernama dari roster, masuk rombel', (select display_name from public.school_members where user_id = un and school_id = sa) = 'Dewi Anggraini' and (select count(*) from public.class_group_students where class_group_id = c1) = 1);
  perform pg_temp.chk('tebus kode: roster tertaut ke anggota', (select member_id from public.roster_people where id = rp) = (select id from public.school_members where user_id = un and school_id = sa));
  perform pg_temp.chk('tebus kode: data induk disalin', (select nisn from public.member_profiles where member_id = (select id from public.school_members where user_id = un and school_id = sa)) = '0098765001'
    and (select guardian_name from public.member_profiles where member_id = (select id from public.school_members where user_id = un and school_id = sa)) = 'Wayan');

  insert into public.school_modules (school_id, module_code, enabled) values (sa, 'data_hub', false);
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('modul dicabut: berkas dan roster tidak terbaca', (select count(*) from public.school_files) = 0 and (select count(*) from public.roster_people) = 0);

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
