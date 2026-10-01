-- Tes OAuth MCP: registrasi klien dibatasi, PKCE S256 wajib, kode sekali pakai dan hangus saat verifier salah, token hasilnya bisa dipakai di MCP.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ux uuid := gen_random_uuid(); sa uuid;
  verifier text := repeat('v', 43); challenge text; cid text; code text; res jsonb;
begin
  insert into auth.users (id, email) values (uo,'o@oa.local'),(ux,'x@oa.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah OA', 'kemendikdasmen', 'swasta', array['SMK']);
  execute 'reset role';
  challenge := translate(rtrim(encode(sha256(convert_to(verifier, 'utf8')), 'base64'), '='), '+/', '-_');

  execute 'set local role anon';
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  begin perform public.oauth_register('Jahat', array['http://evil.example/cb']); perform pg_temp.chk('redirect http non-lokal ditolak', false);
  exception when others then perform pg_temp.chk('redirect http non-lokal ditolak', true); end;
  res := public.oauth_register('Claude', array['https://claude.ai/api/mcp/auth_callback','http://localhost:6274/cb']);
  cid := res->>'client_id';
  perform pg_temp.chk('registrasi klien', cid like 'esc_%', res::text);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin perform public.oauth_issue_code(cid, 'https://claude.ai/lain', challenge); perform pg_temp.chk('redirect tak terdaftar ditolak', false);
  exception when others then perform pg_temp.chk('redirect tak terdaftar ditolak', true); end;
  begin perform public.oauth_issue_code(cid, 'https://claude.ai/api/mcp/auth_callback', 'pendek'); perform pg_temp.chk('challenge tak valid ditolak', false);
  exception when others then perform pg_temp.chk('challenge tak valid ditolak', true); end;
  code := public.oauth_issue_code(cid, 'https://claude.ai/api/mcp/auth_callback', challenge, true);
  perform pg_temp.chk('kode diterbitkan', code like 'eoc_%');

  execute 'set local role anon';
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  res := public.oauth_exchange(code, cid, 'https://claude.ai/api/mcp/auth_callback', repeat('x', 43));
  perform pg_temp.chk('verifier salah ditolak', res->>'error' = 'invalid_grant');
  res := public.oauth_exchange(code, cid, 'https://claude.ai/api/mcp/auth_callback', verifier);
  perform pg_temp.chk('kode hangus setelah percobaan salah (verifier benar pun ditolak)', res->>'error' = 'invalid_grant');

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  code := public.oauth_issue_code(cid, 'https://claude.ai/api/mcp/auth_callback', challenge, true);
  execute 'set local role anon';
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  res := public.oauth_exchange(code, cid, 'https://claude.ai/lain', verifier);
  perform pg_temp.chk('redirect_uri beda ditolak', res->>'error' = 'invalid_grant');
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  code := public.oauth_issue_code(cid, 'https://claude.ai/api/mcp/auth_callback', challenge, true);
  execute 'set local role anon';
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  res := public.oauth_exchange(code, cid, 'https://claude.ai/api/mcp/auth_callback', verifier);
  perform pg_temp.chk('tukar kode: token akses', res->>'access_token' like 'esm_%' and res->>'scope' = 'read write', res::text);
  perform pg_temp.chk('token OAuth bisa dipakai di MCP', public.mcp_whoami(res->>'access_token')->'schools'->0->>'role' = 'owner');
  res := public.oauth_exchange(code, cid, 'https://claude.ai/api/mcp/auth_callback', verifier);
  perform pg_temp.chk('kode tak bisa dipakai dua kali', res->>'error' = 'invalid_grant');
  begin perform 1 from public.oauth_codes; perform pg_temp.chk('anon tak bisa membaca tabel kode', false);
  exception when others then perform pg_temp.chk('anon tak bisa membaca tabel kode', true); end;

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
