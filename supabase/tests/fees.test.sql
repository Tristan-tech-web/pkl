-- Tes keuangan: hanya paket Enterprise, pengelola menulis, siswa dan wali hanya membaca tagihan anak sendiri.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); up uuid := gen_random_uuid(); us1 uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; r_t uuid; r_s uuid; r_p uuid; mt uuid; mp uuid; ms1 uuid; ms2 uuid; inv1 uuid; inv2 uuid;
begin
  insert into auth.users (id, email) values (uo,'o@f.local'),(ut,'t@f.local'),(up,'p@f.local'),(us1,'s1@f.local'),(us2,'s2@f.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah F', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  select id into r_p from public.roles where school_id = sa and code = 'parent';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Guru') returning id into mt;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, up, r_p, 'Orang Tua') returning id into mp;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us1, r_s, 'Anak') returning id into ms1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Lain') returning id into ms2;
  begin
    insert into public.invoices (school_id, member_id, title, amount) values (sa, ms1, 'SPP Oktober', 250000);
    perform pg_temp.chk('Starter: tagihan ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('Starter: tagihan ditolak', true, sqlerrm); end;

  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    insert into public.invoices (school_id, member_id, title, amount) values (sa, ms1, 'SPP Oktober', 250000);
    perform pg_temp.chk('paket Sekolah: keuangan belum aktif', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('paket Sekolah: keuangan belum aktif', true, sqlerrm); end;

  execute 'reset role';
  update public.schools set plan_code = 'enterprise' where id = sa;
  insert into public.guardianships (school_id, parent_member_id, student_member_id) values (sa, mp, ms1);
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.invoices (school_id, member_id, title, amount, due_on) values (sa, ms1, 'SPP Oktober', 250000, '2026-10-10') returning id into inv1;
  insert into public.invoices (school_id, member_id, title, amount) values (sa, ms2, 'SPP Oktober', 250000) returning id into inv2;
  insert into public.payments (school_id, invoice_id, amount, method) values (sa, inv1, 100000, 'tunai');
  perform pg_temp.chk('pengelola menerbitkan tagihan dan mencatat pembayaran', (select count(*) from public.invoices) = 2 and (select count(*) from public.payments) = 1);
  begin
    insert into public.invoices (school_id, member_id, title, amount) values (sa, ms1, 'Nol', 0);
    perform pg_temp.chk('jumlah tagihan harus positif', false, 'seharusnya ditolak');
  exception when check_violation then perform pg_temp.chk('jumlah tagihan harus positif', true); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa melihat tagihan dan pembayaran sendiri saja', (select count(*) from public.invoices) = 1 and (select count(*) from public.payments) = 1);
  begin
    insert into public.payments (school_id, invoice_id, amount) values (sa, inv1, 150000);
    perform pg_temp.chk('siswa tidak bisa mencatat pembayaran', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa mencatat pembayaran', true, sqlerrm); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', up, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('wali melihat tagihan anaknya saja', (select count(*) from public.invoices) = 1 and (select member_id from public.invoices) = ms1);
  perform pg_temp.chk('wali melihat pembayaran anaknya', (select count(*) from public.payments) = 1);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('guru tidak melihat keuangan', (select count(*) from public.invoices) = 0 and (select count(*) from public.payments) = 0);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa lain tidak melihat tagihan teman', (select count(*) from public.invoices where member_id = ms1) = 0);

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
