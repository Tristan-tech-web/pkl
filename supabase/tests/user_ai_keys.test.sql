-- Tes kunci AI pribadi: hanya pemilik yang membaca, staf didahulukan, siswa hanya bila sekolah mengizinkan.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); us uuid := gen_random_uuid();
  sa uuid; r_t uuid; r_s uuid; res jsonb;
begin
  insert into auth.users (id, email) values (uo,'o@uk.local'),(ut,'t@uk.local'),(us,'s@uk.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah UK', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Guru'), (sa, us, r_s, 'Siswa');
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;

  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.user_ai_keys (user_id, provider, model, key_ciphertext, key_hint) values (ut, 'gemini', 'gemini-2.5-flash', 'v1:x', '…abcd');
  perform pg_temp.chk('guru: simpan kunci sendiri', (select count(*) from public.user_ai_keys) = 1);
  begin
    insert into public.user_ai_keys (user_id, provider, model, key_ciphertext, key_hint) values (us, 'gemini', 'gemini-2.5-flash', 'v1:x', '…zzzz');
    perform pg_temp.chk('guru tidak bisa menulis kunci orang lain', false, 'seharusnya ditolak');
  exception when insufficient_privilege or others then perform pg_temp.chk('guru tidak bisa menulis kunci orang lain', true); end;
  perform pg_temp.chk('guru: tutor memakai kunci pribadi', public.reserve_ai_call(sa, null)->>'mode' = 'user');
  perform pg_temp.chk('guru: AI berkas memakai kunci pribadi', public.reserve_admin_ai(sa)->>'mode' = 'user');

  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  perform pg_temp.chk('siswa tidak melihat kunci guru', (select count(*) from public.user_ai_keys) = 0);
  execute 'reset role';
  insert into public.user_ai_keys (user_id, provider, model, key_ciphertext, key_hint) values (us, 'gemini', 'gemini-2.5-flash', 'v1:y', '…wxyz');
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa dengan kunci: ditolak bila sekolah belum mengizinkan', public.reserve_ai_call(sa, null)->>'mode' = 'none');
  execute 'reset role';
  update public.schools set allow_student_keys = true where id = sa;
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa dengan kunci: boleh bila sekolah mengizinkan', public.reserve_ai_call(sa, null)->>'mode' = 'user');

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
