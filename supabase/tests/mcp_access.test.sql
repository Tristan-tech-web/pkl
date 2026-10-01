-- Tes MCP: token tidak valid ditolak, identitas mengikuti token, siswa tidak melihat berkas orang lain, unggah sekali pakai.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); us uuid := gen_random_uuid(); ux uuid := gen_random_uuid();
  tok_o text := 'esm_' || repeat('a', 43); tok_s text := 'esm_' || repeat('b', 43); tok_x text := 'esm_' || repeat('c', 43); tok_ro text := 'esm_' || repeat('d', 43);
  sa uuid; r_s uuid; mo uuid; res jsonb; pth text; fid uuid;
begin
  insert into auth.users (id, email) values (uo,'o@mc.local'),(us,'s@mc.local'),(ux,'x@mc.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah MC', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into mo from public.school_members where school_id = sa and user_id = uo;
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_s, 'Siswa MC');
  insert into public.school_files (school_id, scope, uploaded_by, name, size_bytes, path, category, text_content) values
    (sa, 'sekolah', mo, 'Tata tertib.txt', 10, sa || '/sekolah/a-tt.txt', 'peraturan', 'Siswa wajib berseragam dan datang sebelum pukul 07.00 setiap hari.'),
    (sa, 'sekolah', mo, 'Daftar siswa.csv', 10, sa || '/sekolah/a-ds.csv', 'siswa', 'rahasia');
  insert into public.mcp_tokens (user_id, name, token_hash, token_hint, can_write) values (uo, 'owner', encode(sha256(convert_to(tok_o, 'utf8')), 'hex'), '…aaaa', true);
  insert into public.mcp_tokens (user_id, name, token_hash, token_hint, can_write) values (uo, 'owner-ro', encode(sha256(convert_to(tok_ro, 'utf8')), 'hex'), '…dddd', false);
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;
  insert into public.mcp_tokens (user_id, name, token_hash, token_hint) values (us, 'siswa', encode(sha256(convert_to(tok_s, 'utf8')), 'hex'), '…bbbb');

  execute 'set local role anon';
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  begin perform public.mcp_whoami('esm_salah'); perform pg_temp.chk('token salah ditolak', false);
  exception when others then perform pg_temp.chk('token salah ditolak', true); end;
  res := public.mcp_whoami(tok_o);
  perform pg_temp.chk('whoami: pemilik di sekolahnya', res->'schools'->0->>'role' = 'owner' and res->'schools'->0->>'school_id' = sa::text, res::text);
  res := public.mcp_today(tok_s, sa);
  perform pg_temp.chk('today: siswa, peran student', res->>'role' = 'student', res::text);
  begin perform public.mcp_today(tok_x, sa); perform pg_temp.chk('token tak dikenal ditolak', false);
  exception when others then perform pg_temp.chk('token tak dikenal ditolak', true); end;
  res := public.mcp_school_docs(tok_s, sa, 'seragam');
  perform pg_temp.chk('siswa: peraturan terbaca lewat pencarian', jsonb_array_length(res) = 1 and res->0->>'name' = 'Tata tertib.txt' and res->0->>'excerpt' like '%berseragam%', res::text);
  perform pg_temp.chk('siswa: berkas data siswa tidak muncul', not (res::text like '%rahasia%'));
  perform pg_temp.chk('siswa: daftar berkas kosong', jsonb_array_length(public.mcp_list_files(tok_s, sa)) = 0);
  perform pg_temp.chk('pemilik: daftar berkas 2', jsonb_array_length(public.mcp_list_files(tok_o, sa)) = 2);
  begin perform public.mcp_request_upload(tok_ro, sa, 'sekolah', 'x.pdf'); perform pg_temp.chk('token baca-saja tak bisa minta unggah', false);
  exception when others then perform pg_temp.chk('token baca-saja tak bisa minta unggah', true); end;
  begin perform public.mcp_request_upload(tok_s, sa, 'sekolah', 'x.pdf'); perform pg_temp.chk('siswa tak bisa minta unggah', false);
  exception when others then perform pg_temp.chk('siswa tak bisa minta unggah', true); end;
  res := public.mcp_request_upload(tok_o, sa, 'sekolah', 'Buku Besar.pdf', 'application/pdf');
  pth := res->>'path';
  perform pg_temp.chk('unggah: jalur dikeluarkan', pth like sa::text || '/sekolah/%', pth);
  perform pg_temp.chk('unggah: kebijakan Storage mengizinkan jalur sekali pakai', app_private.mcp_upload_allowed(pth) and not app_private.mcp_upload_allowed(pth || 'x'));
  begin perform public.mcp_finish_upload(tok_o, pth, 100); perform pg_temp.chk('selesai sebelum berkas terkirim ditolak', false);
  exception when others then perform pg_temp.chk('selesai sebelum berkas terkirim ditolak', true); end;
  execute 'reset role';
  insert into storage.objects (bucket_id, name, owner) values ('school-files', pth, null);
  execute 'set local role anon';
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  res := public.mcp_finish_upload(tok_o, pth, 1234, 'buku_paket');
  fid := (res->>'file_id')::uuid;
  perform pg_temp.chk('unggah: tidak bisa dipakai dua kali', not app_private.mcp_upload_allowed(pth));
  perform pg_temp.chk('baca berkas: teks null bila belum dianalisis', public.mcp_read_file(tok_o, sa, fid)->>'note' is not null);
  execute 'reset role';
  perform pg_temp.chk('unggah: berkas tercatat dengan kategori', (select category from public.school_files where id = fid) = 'buku_paket');

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
