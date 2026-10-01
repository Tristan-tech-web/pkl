-- Tes isolasi RLS. Dijalankan lewat execute_sql; seluruh transaksi dibatalkan di akhir
-- dengan RAISE EXCEPTION yang memuat hasil (tidak meninggalkan data).
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void
language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;

do $$
declare
  ua uuid := gen_random_uuid(); ub uuid := gen_random_uuid();
  ut uuid := gen_random_uuid(); us uuid := gen_random_uuid();
  sa uuid; sb uuid; trk uuid; n int; r_teacher uuid; r_student uuid; r_b uuid;
begin
  insert into auth.users (id, email) values
    (ua, 'a@test.local'), (ub, 'b@test.local'), (ut, 't@test.local'), (us, 's@test.local');
  perform pg_temp.chk('profil dibuat otomatis', (select count(*) from public.profiles where user_id in (ua,ub,ut,us)) = 4);

  -- A membuat sekolah A (SMK)
  perform set_config('request.jwt.claims', json_build_object('sub', ua, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah A', 'kemendikdasmen', 'swasta', array['SMK'], 'kurmer');
  perform pg_temp.chk('A melihat sekolahnya', (select count(*) from public.schools) = 1);
  perform pg_temp.chk('A punya 8 peran salinan', (select count(*) from public.roles where school_id = sa) = 8);
  perform pg_temp.chk('langganan awal starter', (select plan_code from public.school_subscriptions where school_id = sa) = 'starter');

  -- A menambah guru dan siswa
  select id into r_teacher from public.roles where school_id = sa and code = 'teacher';
  select id into r_student from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id) values (sa, ut, r_teacher), (sa, us, r_student);
  -- hierarki track
  insert into public.tracks (school_id, type, code, name, path) values (sa, 'smk_bidang', 'TIK', 'Teknologi Informasi', 'TIK') returning id into trk;
  insert into public.tracks (school_id, parent_id, type, code, name, path) values (sa, trk, 'smk_program', 'PPLG', 'Pengembangan Perangkat Lunak', 'TIK.PPLG');
  perform pg_temp.chk('ltree turunan track', (select count(*) from public.tracks where path operator(extensions.<@) 'TIK') = 2);

  -- B membuat sekolah B (dua program madrasah)
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sb := public.create_school('Madrasah B', 'kemenag', 'swasta', array['MI','MTS'], 'kma-agama');
  perform pg_temp.chk('B hanya melihat sekolah B', (select count(*) from public.schools) = 1 and (select id from public.schools) = sb);
  perform pg_temp.chk('B tidak melihat program A', (select count(*) from public.school_programs where school_id = sa) = 0);
  perform pg_temp.chk('B tidak melihat anggota A', (select count(*) from public.school_members where school_id = sa) = 0);
  perform pg_temp.chk('B tidak melihat track A', (select count(*) from public.tracks where school_id = sa) = 0);
  perform pg_temp.chk('B tidak melihat peran A', (select count(*) from public.roles where school_id = sa) = 0);
  begin
    insert into public.school_programs (school_id, form_code, name) values (sa, 'SD', 'Program Selundupan');
    perform pg_temp.chk('B tidak bisa menulis ke A', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('B tidak bisa menulis ke A', true, sqlerrm); end;
  begin
    insert into public.tracks (school_id, parent_id, type, code, name, path)
    values (sb, trk, 'kustom', 'X', 'Silang', 'TIK.X');
    perform pg_temp.chk('FK mencegah induk track lintas sekolah', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('FK mencegah induk track lintas sekolah', true, sqlerrm); end;
  select id into r_b from public.roles where school_id = sb and code = 'teacher';
  begin
    insert into public.school_members (school_id, user_id, role_id) values (sb, ua, r_teacher);
    perform pg_temp.chk('peran dari sekolah lain ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('peran dari sekolah lain ditolak', true, sqlerrm); end;

  -- Guru di sekolah A
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('guru melihat sekolah A', (select count(*) from public.schools) = 1);
  update public.schools set name = 'Diubah Guru' where id = sa;
  get diagnostics n = row_count;
  perform pg_temp.chk('guru tidak bisa mengubah sekolah', n = 0);
  begin
    insert into public.tracks (school_id, type, code, name, path) values (sa, 'kustom', 'Z', 'Z', 'Z');
    perform pg_temp.chk('guru tidak bisa membuat track', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru tidak bisa membuat track', true, sqlerrm); end;
  begin
    insert into public.school_members (school_id, user_id, role_id) values (sa, ub, r_teacher);
    perform pg_temp.chk('guru tidak bisa menambah anggota', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru tidak bisa menambah anggota', true, sqlerrm); end;

  -- Siswa di sekolah A
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa hanya melihat dirinya di daftar anggota', (select count(*) from public.school_members where school_id = sa) = 1);
  perform pg_temp.chk('siswa melihat struktur akademik', (select count(*) from public.school_programs where school_id = sa) = 1);

  -- Anon
  execute 'reset role';
  perform set_config('request.jwt.claims', '{}', true);
  execute 'set local role anon';
  perform pg_temp.chk('anon membaca bentuk pendidikan', (select count(*) from public.education_forms) >= 20);
  perform pg_temp.chk('anon melihat paket publik', (select count(*) from public.plans) = 3);
  begin
    perform count(*) from public.schools;
    perform pg_temp.chk('anon tidak bisa membaca schools', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('anon tidak bisa membaca schools', true, sqlerrm); end;
  begin
    perform public.create_school('X', 'lainnya');
    perform pg_temp.chk('anon tidak bisa create_school', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('anon tidak bisa create_school', true, sqlerrm); end;
  insert into public.leads (name, email, school_name, plan_interest, message)
    values ('Budi', 'budi@sekolah.sch.id', 'SMK X', 'enterprise', 'Ingin demo');
  perform pg_temp.chk('anon bisa mengirim lead', true);
  begin
    perform count(*) from public.leads;
    perform pg_temp.chk('anon tidak bisa membaca leads', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('anon tidak bisa membaca leads', true, sqlerrm); end;
  begin
    insert into public.leads (name, email) values ('Cc', 'bukan-email');
    perform pg_temp.chk('lead dengan email tidak valid ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('lead dengan email tidak valid ditolak', true, sqlerrm); end;

  execute 'reset role';
  raise exception 'HASIL_TES %', (select jsonb_pretty(jsonb_agg(jsonb_build_object('n', name, 'ok', ok, 'i', left(coalesce(info,''), 60)))) from _t);
end $$;
