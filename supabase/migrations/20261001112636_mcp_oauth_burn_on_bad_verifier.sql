-- Kegagalan PKCE harus menghanguskan kode (tidak boleh ditebak ulang). RAISE membatalkan update used_at, jadi kembalikan galat sebagai hasil.
create or replace function public.oauth_exchange(p_code text, p_client text, p_redirect text, p_verifier text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare oc public.oauth_codes; v_tok text; v_challenge text; v_name text;
begin
  if p_code is null or p_verifier is null or char_length(p_verifier) not between 43 and 128 then return jsonb_build_object('error', 'invalid_grant'); end if;
  update public.oauth_codes set used_at = now()
    where code_hash = encode(sha256(convert_to(p_code, 'utf8')), 'hex') and used_at is null and expires_at > now() and client_id = p_client and redirect_uri = p_redirect
    returning * into oc;
  if oc.code_hash is null then return jsonb_build_object('error', 'invalid_grant'); end if;
  v_challenge := translate(rtrim(encode(sha256(convert_to(p_verifier, 'utf8')), 'base64'), '='), '+/', '-_');
  if v_challenge <> oc.code_challenge then return jsonb_build_object('error', 'invalid_grant'); end if;
  select left('OAuth: ' || client_name, 60) into v_name from public.oauth_clients where client_id = oc.client_id;
  v_tok := 'esm_' || replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.mcp_tokens (user_id, name, token_hash, token_hint, can_write, expires_at)
    values (oc.user_id, v_name, encode(sha256(convert_to(v_tok, 'utf8')), 'hex'), '…' || right(v_tok, 4), oc.can_write, now() + interval '60 days');
  return jsonb_build_object('access_token', v_tok, 'token_type', 'Bearer', 'expires_in', 60 * 86400, 'scope', case when oc.can_write then 'read write' else 'read' end);
end $$;
