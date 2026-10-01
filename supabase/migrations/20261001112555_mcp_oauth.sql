-- OAuth 2.1 (kode otorisasi + PKCE S256, pendaftaran klien dinamis) untuk konektor MCP yang hanya mendukung OAuth (mis. claude.ai).
-- Hasil penukaran kode adalah token MCP biasa (mcp_tokens), sehingga bisa dicabut dari halaman AI saya.
create table public.oauth_clients (
  client_id text primary key default ('esc_' || replace(gen_random_uuid()::text, '-', '')),
  client_name text not null check (char_length(client_name) between 1 and 80),
  redirect_uris text[] not null check (cardinality(redirect_uris) between 1 and 5),
  created_at timestamptz not null default now()
);
create table public.oauth_codes (
  code_hash text primary key,
  client_id text not null references public.oauth_clients (client_id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  redirect_uri text not null,
  code_challenge text not null,
  can_write boolean not null default false,
  expires_at timestamptz not null,
  used_at timestamptz
);
create index on public.oauth_codes (user_id);
alter table public.oauth_clients enable row level security;
alter table public.oauth_codes enable row level security;
revoke all on public.oauth_clients, public.oauth_codes from anon, authenticated;

create function app_private.oauth_redirect_ok(p text) returns boolean
language sql immutable set search_path = '' as $$
  select char_length(p) <= 300 and (p ~ '^https://[^\s#]+$' or p ~ '^http://(localhost|127\.0\.0\.1)(:[0-9]+)?(/[^\s#]*)?$')
$$;

create function public.oauth_register(p_name text, p_redirects text[]) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare c public.oauth_clients; u text;
begin
  if p_redirects is null or cardinality(p_redirects) not between 1 and 5 then raise exception 'redirect_uris tidak valid'; end if;
  foreach u in array p_redirects loop
    if not app_private.oauth_redirect_ok(u) then raise exception 'redirect_uri tidak diizinkan: %', left(u, 60); end if;
  end loop;
  if (select count(*) from public.oauth_clients) >= 5000 then raise exception 'terlalu banyak klien terdaftar'; end if;
  insert into public.oauth_clients (client_name, redirect_uris) values (left(coalesce(nullif(btrim(p_name), ''), 'Aplikasi AI'), 80), p_redirects) returning * into c;
  return jsonb_build_object('client_id', c.client_id, 'client_name', c.client_name, 'redirect_uris', c.redirect_uris);
end $$;

create function public.oauth_client_info(p_client text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('client_name', client_name, 'redirect_uris', redirect_uris) from public.oauth_clients where client_id = p_client
$$;

-- Dipanggil dari halaman persetujuan setelah pengguna masuk dan menyetujui.
create function public.oauth_issue_code(p_client text, p_redirect text, p_challenge text, p_can_write boolean default false) returns text
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := (select auth.uid()); c public.oauth_clients; v_code text;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select * into c from public.oauth_clients where client_id = p_client;
  if c.client_id is null or not (p_redirect = any (c.redirect_uris)) then raise exception 'klien atau redirect_uri tidak dikenal'; end if;
  if p_challenge is null or p_challenge !~ '^[A-Za-z0-9_-]{43,128}$' then raise exception 'code_challenge tidak valid (wajib S256)'; end if;
  v_code := 'eoc_' || replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.oauth_codes (code_hash, client_id, user_id, redirect_uri, code_challenge, can_write, expires_at)
    values (encode(sha256(convert_to(v_code, 'utf8')), 'hex'), p_client, v_uid, p_redirect, p_challenge, coalesce(p_can_write, false), now() + interval '10 minutes');
  return v_code;
end $$;

-- Tukar kode dengan token akses (token MCP, berlaku 60 hari).
create function public.oauth_exchange(p_code text, p_client text, p_redirect text, p_verifier text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare oc public.oauth_codes; v_tok text; v_challenge text; v_name text;
begin
  if p_code is null or p_verifier is null or char_length(p_verifier) not between 43 and 128 then raise exception 'invalid_grant'; end if;
  update public.oauth_codes set used_at = now()
    where code_hash = encode(sha256(convert_to(p_code, 'utf8')), 'hex') and used_at is null and expires_at > now() and client_id = p_client and redirect_uri = p_redirect
    returning * into oc;
  if oc.code_hash is null then raise exception 'invalid_grant'; end if;
  v_challenge := translate(rtrim(encode(sha256(convert_to(p_verifier, 'utf8')), 'base64'), '='), '+/', '-_');
  if v_challenge <> oc.code_challenge then raise exception 'invalid_grant'; end if;
  select left('OAuth: ' || client_name, 60) into v_name from public.oauth_clients where client_id = oc.client_id;
  v_tok := 'esm_' || replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.mcp_tokens (user_id, name, token_hash, token_hint, can_write, expires_at)
    values (oc.user_id, v_name, encode(sha256(convert_to(v_tok, 'utf8')), 'hex'), '…' || right(v_tok, 4), oc.can_write, now() + interval '60 days');
  return jsonb_build_object('access_token', v_tok, 'token_type', 'Bearer', 'expires_in', 60 * 86400, 'scope', case when oc.can_write then 'read write' else 'read' end);
end $$;

revoke all on function app_private.oauth_redirect_ok(text) from public;
do $$
declare f text;
begin
  foreach f in array array['oauth_register(text,text[])','oauth_exchange(text,text,text,text)'] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
  foreach f in array array['oauth_client_info(text)','oauth_issue_code(text,text,text,boolean)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
comment on function public.oauth_exchange(text, text, text, text) is 'SECURITY DEFINER dan dapat dipanggil anon DISENGAJA: endpoint token OAuth tidak punya sesi pengguna; fungsi memverifikasi kode sekali pakai, klien, redirect_uri, dan PKCE sebelum menerbitkan token.';
comment on function public.oauth_register(text, text[]) is 'SECURITY DEFINER dan dapat dipanggil anon DISENGAJA: pendaftaran klien dinamis (RFC 7591); redirect_uri dibatasi https/localhost dan jumlah klien dibatasi.';
