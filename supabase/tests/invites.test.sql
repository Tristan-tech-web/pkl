-- Tes kode undangan. Seluruh transaksi dibatalkan di akhir (RAISE EXCEPTION memuat hasil).
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void
language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;

do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); us uuid := gen_random_uuid();
  ux uuid := gen_random_uuid(); ub uuid := gen_random_uuid();
  sa uuid; sb uuid; prog uuid; ay uuid; cg uuid; r_teacher uuid; r_student uuid; r_owner uuid;
  code_t text; code_s text; code_o text; ret uuid; n int;
begin
  insert into auth.users (id, email) values
    (uo, 'o@t.local'), (ut, 't@t.local'), (us, 's@t.local'), (ux, 'x@t.local'), (ub, 'b@t.local');

  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah A', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on) values (sa, '2026/2027', '2026-07-13', '2027-06-26') returning id into ay;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, ay, 'X A', 10) returning id into cg;
  select id into r_teacher from public.roles where school_id = sa and code = 'teacher';
  select id into r_student from public.roles where school_id = sa and code = 'student';
  select id into r_owner from public.roles where school_id = sa and code = 'owner';

  insert into public.invites (school_id, role_id) values (sa, r_teacher) returning code into code_t;
  insert into public.invites (school_id, role_id, class_group_id, max_uses) values (sa, r_student, cg, 2) returning code into code_s;
  perform pg_temp.chk('kode berformat 8 karakter', length(code_t) = 8 and code_t ~ '^[A-HJ-NP-Z2-9]{8}$');
  begin
    insert into public.invites (school_id, role_id) values (sa, r_owner);
    perform pg_temp.chk('undangan peran owner ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('undangan peran owner ditolak', true, sqlerrm); end;

  -- Guru menebus kode guru
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  ret := public.redeem_invite(lower(code_t), 'Pak Guru');
  perform pg_temp.chk('guru menebus kode (huruf kecil diterima)', ret = sa);
  perform pg_temp.chk('guru kini anggota dengan peran teacher',
    (select r.code from public.school_members m join public.roles r on r.id = m.role_id where m.user_id = ut and m.school_id = sa) = 'teacher');
  begin
    perform public.redeem_invite(code_t);
    perform pg_temp.chk('kode sekali pakai tidak bisa dipakai lagi', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('kode sekali pakai tidak bisa dipakai lagi', true, sqlerrm); end;
  perform pg_temp.chk('guru tidak bisa membaca daftar undangan', (select count(*) from public.invites) = 0);
  begin
    insert into public.invites (school_id, role_id) values (sa, r_teacher);
    perform pg_temp.chk('guru tidak bisa membuat undangan', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru tidak bisa membuat undangan', true, sqlerrm); end;

  -- Siswa menebus kode siswa (otomatis masuk rombel)
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  ret := public.redeem_invite(code_s, 'Siswa Satu');
  perform pg_temp.chk('siswa menebus kode', ret = sa);
  perform pg_temp.chk('siswa otomatis masuk rombel',
    (select count(*) from public.class_group_students where class_group_id = cg) = 1);
  begin
    perform public.redeem_invite(code_s);
    perform pg_temp.chk('tidak bisa menebus dua kali oleh orang yang sama', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('tidak bisa menebus dua kali oleh orang yang sama', true, sqlerrm); end;

  -- Kode kedaluwarsa dan kode tidak dikenal
  execute 'reset role';
  update public.invites set expires_at = now() - interval '1 day' where code = code_s;
  perform set_config('request.jwt.claims', json_build_object('sub', ux, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    perform public.redeem_invite(code_s);
    perform pg_temp.chk('kode kedaluwarsa ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('kode kedaluwarsa ditolak', true, sqlerrm); end;
  begin
    perform public.redeem_invite('XXXXXXXX');
    perform pg_temp.chk('kode tidak dikenal ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('kode tidak dikenal ditolak', true, sqlerrm); end;

  -- Sekolah lain tidak melihat undangan A
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ub, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sb := public.create_school('Sekolah B', 'kemenag', 'swasta', array['MI']);
  perform pg_temp.chk('sekolah lain tidak melihat undangan A', (select count(*) from public.invites) = 0);

  -- Anon tidak bisa menebus
  execute 'reset role';
  perform set_config('request.jwt.claims', '{}', true);
  execute 'set local role anon';
  begin
    perform public.redeem_invite('ABCDEFGH');
    perform pg_temp.chk('anon tidak bisa menebus kode', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('anon tidak bisa menebus kode', true, sqlerrm); end;

  execute 'reset role';
  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name), '[]'::jsonb) from _t where not ok);
end $$;
