-- Tes akun murid massal: izin, isolasi antarsekolah, kata sandi valid, reset hanya akun sintetis.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); ub uuid := gen_random_uuid(); ue uuid := gen_random_uuid();
  sa uuid; sb uuid; prog uuid; yr uuid; c1 uuid; r_t uuid; r_s uuid; mt uuid; me uuid; ms uuid; n int; pw text; cnt int;
begin
  insert into auth.users (id, email) values (uo,'o@sa.local'),(ut,'t@sa.local'),(ub,'b@sb.local'),(ue,'e@sa.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah SA', 'kemendikdasmen', 'swasta', array['SMK']);
  update public.schools set login_code = 'sa' where id = sa;
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  execute 'reset role';
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Guru Biasa') returning id into mt;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ue, r_s, 'Murid Email') returning id into me;
  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sb := public.create_school('Sekolah SB', 'kemendikdasmen', 'swasta', array['SMK']);
  execute 'reset role';

  -- pemilik membuat akun
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into n from public.create_student_accounts(sa, c1, '[{"name":"Ayu Contoh","nis":"1001"},{"name":"Budi Contoh"},{"name":"X"}]'::jsonb) where status = 'dibuat';
  perform pg_temp.chk('dua murid dibuat, satu nama ditolak', n = 2, n::text);
  select password into pw from public.create_student_accounts(sa, c1, '[{"name":"Citra Contoh","nis":"1003"}]'::jsonb);
  perform pg_temp.chk('kata sandi dikembalikan sekali dan panjangnya 10', length(pw) = 10, pw);
  select count(*) into n from public.create_student_accounts(sa, c1, '[{"name":"Ayu Lagi","nis":"1001"}]'::jsonb) where status = 'sudah ada' and password is null;
  perform pg_temp.chk('NIS ganda ditolak tanpa kata sandi', n = 1);
  execute 'reset role';
  perform pg_temp.chk('email sintetis terbentuk', exists (select 1 from auth.users where email = 'sa-1001@murid.edusmart.test'));
  perform pg_temp.chk('kata sandi tersimpan sebagai hash yang cocok', exists (select 1 from auth.users where email = 'sa-1003@murid.edusmart.test' and encrypted_password = extensions.crypt(pw, encrypted_password)));
  perform pg_temp.chk('murid masuk ke rombel', (select count(*) from public.class_group_students where class_group_id = c1) = 3);
  select id into ms from public.school_members where school_id = sa and display_name = 'Ayu Contoh';

  -- guru biasa tidak boleh
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin perform * from public.create_student_accounts(sa, c1, '[{"name":"Guru Coba"}]'::jsonb); perform pg_temp.chk('guru biasa tak bisa membuat akun', false);
  exception when others then perform pg_temp.chk('guru biasa tak bisa membuat akun', true); end;
  begin perform public.reset_student_password(ms); perform pg_temp.chk('guru biasa (bukan wali kelas) tak bisa reset', false);
  exception when others then perform pg_temp.chk('guru biasa (bukan wali kelas) tak bisa reset', true); end;
  execute 'reset role';

  -- pemilik sekolah lain tidak boleh menyentuh sekolah SA
  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin perform * from public.create_student_accounts(sa, null, '[{"name":"Penyusup"}]'::jsonb); perform pg_temp.chk('pemilik sekolah lain tak bisa membuat akun', false);
  exception when others then perform pg_temp.chk('pemilik sekolah lain tak bisa membuat akun', true); end;
  begin perform public.reset_student_password(ms); perform pg_temp.chk('pemilik sekolah lain tak bisa reset', false);
  exception when others then perform pg_temp.chk('pemilik sekolah lain tak bisa reset', true); end;
  execute 'reset role';

  -- pemilik: reset berhasil, sandi lama tak lagi cocok; murid berEmail sendiri ditolak
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  pw := public.reset_student_password(ms);
  perform pg_temp.chk('reset mengembalikan sandi baru', length(pw) = 10);
  begin perform public.reset_student_password(me); perform pg_temp.chk('akun berEmail sendiri tak bisa direset', false);
  exception when others then perform pg_temp.chk('akun berEmail sendiri tak bisa direset', true); end;
  begin perform * from public.create_student_accounts(sa, null, '[]'::jsonb); perform pg_temp.chk('daftar kosong ditolak', false);
  exception when others then perform pg_temp.chk('daftar kosong ditolak', true); end;
  execute 'reset role';
  perform pg_temp.chk('sandi baru cocok', exists (select 1 from auth.users where email = 'sa-1001@murid.edusmart.test' and encrypted_password = extensions.crypt(pw, encrypted_password)));
  perform pg_temp.chk('anon tak punya izin eksekusi', not has_function_privilege('anon', 'public.create_student_accounts(uuid, uuid, jsonb)', 'execute') and not has_function_privilege('anon', 'public.reset_student_password(uuid)', 'execute'));
  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
