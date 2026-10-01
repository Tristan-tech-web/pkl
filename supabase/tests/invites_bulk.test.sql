-- Tes undangan massal: nama dari label sekolah, rombel otomatis, sekali pakai.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); u1 uuid := gen_random_uuid(); u2 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; c1 uuid; r_s uuid; code1 text; code2 text; sid uuid;
begin
  insert into auth.users (id, email) values (uo,'o@iv.local'),(u1,'a@iv.local'),(u2,'b@iv.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah IV', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.invites (school_id, role_id, class_group_id, max_uses, label) values (sa, r_s, c1, 1, 'Dewi Anggraini') returning code into code1;
  insert into public.invites (school_id, role_id, max_uses) values (sa, r_s, 1) returning code into code2;
  begin
    insert into public.invites (school_id, role_id, label) values (sa, r_s, 'x');
    perform pg_temp.chk('label terlalu pendek ditolak', false, 'seharusnya ditolak');
  exception when check_violation then perform pg_temp.chk('label terlalu pendek ditolak', true); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sid := public.redeem_invite(code1, 'Nama Yang Diketik');
  perform pg_temp.chk('menebus kode: nama dari label sekolah, bukan ketikan', (select display_name from public.school_members where school_id = sa and user_id = u1) = 'Dewi Anggraini');
  perform pg_temp.chk('menebus kode: masuk rombel otomatis', (select count(*) from public.class_group_students where class_group_id = c1) = 1);
  begin
    perform public.redeem_invite(code1, 'x');
    perform pg_temp.chk('kode sekali pakai tidak bisa dipakai lagi', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('kode sekali pakai tidak bisa dipakai lagi', true, sqlerrm); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sid := public.redeem_invite(code2, 'Budi Pilih Sendiri');
  perform pg_temp.chk('kode tanpa label memakai nama ketikan', (select display_name from public.school_members where school_id = sa and user_id = u2) = 'Budi Pilih Sendiri');
  perform pg_temp.chk('siswa tidak melihat daftar undangan', (select count(*) from public.invites) = 0);

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
