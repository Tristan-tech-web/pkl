-- Tes tagihan untuk siswa belum bergabung: staf melihat, siswa lain tidak, otomatis pindah ke akun setelah bergabung.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); us uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; r_s uuid; ms uuid; ms2 uuid; rp uuid; inv uuid;
begin
  insert into auth.users (id, email) values (uo,'o@ir.local'),(us,'s@ir.local'),(us2,'s2@ir.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah IR', 'kemendikdasmen', 'swasta', array['SMK']);
  select r.id into r_s from public.roles r where r.school_id = sa and r.code = 'student';
  execute 'reset role';
  update public.schools set plan_code = 'enterprise' where id = sa;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Siswa Lain') returning id into ms2;
  insert into public.roster_people (school_id, kind, full_name, nis) values (sa, 'siswa', 'Budi Belum Gabung', '1234') returning id into rp;
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.invoices (school_id, roster_id, title, amount) values (sa, rp, 'SPP Oktober', 150000) returning id into inv;
  perform pg_temp.chk('admin: tagihan untuk roster tanpa akun tersimpan', (select count(*) from public.invoices where roster_id = rp and member_id is null) = 1);
  begin insert into public.invoices (school_id, title, amount) values (sa, 'Yatim', 1000); perform pg_temp.chk('tagihan tanpa pemilik ditolak', false);
  exception when others then perform pg_temp.chk('tagihan tanpa pemilik ditolak', true); end;
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  perform pg_temp.chk('siswa lain tidak melihat tagihan roster', (select count(*) from public.invoices) = 0);
  execute 'reset role';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_s, 'Budi') returning id into ms;
  update public.roster_people set member_id = ms where id = rp;
  perform pg_temp.chk('setelah bergabung: tagihan pindah ke akun', (select member_id from public.invoices where id = inv) = ms);
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa melihat tagihannya sendiri', (select count(*) from public.invoices) = 1);
  execute 'reset role';
  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
