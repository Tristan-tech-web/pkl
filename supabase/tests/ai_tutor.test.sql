-- Tes tutor AI: pengaturan hanya untuk pengelola, jatah harian ditegakkan server, orang luar ditolak, mode demo.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); us uuid := gen_random_uuid(); ux uuid := gen_random_uuid();
  sa uuid; r_student uuid; ms uuid; res jsonb;
begin
  insert into auth.users (id, email) values (uo, 'o@ai.local'), (us, 's@ai.local'), (ux, 'x@ai.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah AI', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into r_student from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_student, 'Siswa') returning id into ms;
  insert into public.school_ai_settings (school_id, provider, model, key_ciphertext, key_hint, daily_limit_per_student) values (sa, 'gemini', 'gemini-2.5-flash', 'v1:abc', '…wxyz', 2);
  perform pg_temp.chk('pemilik membaca pengaturan AI', (select count(*) from public.school_ai_settings) = 1);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa tidak melihat tabel pengaturan', (select count(*) from public.school_ai_settings) = 0);
  begin
    insert into public.school_ai_settings (school_id, provider, model, key_ciphertext, key_hint) values (sa, 'gemini', 'gemini-2.5-flash', 'x', 'x');
    perform pg_temp.chk('siswa tidak bisa menulis pengaturan', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa menulis pengaturan', true, sqlerrm); end;
  begin
    insert into public.ai_usage (school_id, member_id) values (sa, ms);
    perform pg_temp.chk('siswa tidak bisa menulis pemakaian langsung', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa menulis pemakaian langsung', true, sqlerrm); end;
  res := public.reserve_ai_call(sa);
  perform pg_temp.chk('jatah 1: mode school, sisa 1', res->>'mode' = 'school' and (res->>'remaining')::int = 1 and res->>'provider' = 'gemini');
  res := public.reserve_ai_call(sa);
  perform pg_temp.chk('jatah 2: sisa 0', res->>'mode' = 'school' and (res->>'remaining')::int = 0);
  res := public.reserve_ai_call(sa);
  perform pg_temp.chk('jatah 3: dibatasi', res->>'mode' = 'limit', res::text);
  perform pg_temp.chk('siswa melihat pemakaian sendiri', (select count(*) from public.ai_usage) = 2);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ux, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    perform public.reserve_ai_call(sa);
    perform pg_temp.chk('orang luar ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('orang luar ditolak', true, sqlerrm); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  delete from public.school_ai_settings where school_id = sa;
  res := public.reserve_ai_call(sa);
  perform pg_temp.chk('tanpa kunci dan bukan demo: mode none', res->>'mode' = 'none', res::text);
  execute 'reset role';
  update public.schools set is_demo = true where id = sa;
  execute 'set local role authenticated';
  res := public.reserve_ai_call(sa);
  perform pg_temp.chk('sekolah demo tanpa kunci: mode platform', res->>'mode' = 'platform', res::text);

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
