-- AI untuk pekerjaan pengelola/guru (analisis berkas). Jatah harian per orang, kunci sekolah atau platform (hanya sekolah demo).
create function public.reserve_admin_ai(p_school_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_member uuid; cfg public.school_ai_settings; v_demo boolean; v_used int; v_limit constant int := 200;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select m.id into v_member from public.school_members m where m.school_id = p_school_id and m.user_id = v_uid and m.status = 'active';
  if v_member is null then raise exception 'bukan anggota sekolah ini'; end if;
  if not (app_private.has_capability(p_school_id, 'members.manage') or app_private.has_capability(p_school_id, 'content.author')) then
    raise exception 'tidak berhak memakai AI untuk berkas';
  end if;
  select * into cfg from public.school_ai_settings where school_id = p_school_id;
  select is_demo into v_demo from public.schools where id = p_school_id;
  if cfg.school_id is null and not coalesce(v_demo, false) then return jsonb_build_object('mode', 'none'); end if;
  select count(*) into v_used from public.ai_usage where member_id = v_member and used_on = (now() at time zone 'Asia/Jakarta')::date and node_id is null;
  if v_used >= v_limit then return jsonb_build_object('mode', 'limit', 'limit', v_limit); end if;
  insert into public.ai_usage (school_id, member_id) values (p_school_id, v_member);
  if cfg.school_id is null then return jsonb_build_object('mode', 'platform'); end if;
  return jsonb_build_object('mode', 'school', 'provider', cfg.provider, 'model', cfg.model, 'key_ciphertext', cfg.key_ciphertext);
end $$;
revoke execute on function public.reserve_admin_ai(uuid) from public, anon;
grant execute on function public.reserve_admin_ai(uuid) to authenticated;
comment on function public.reserve_admin_ai(uuid) is 'SECURITY DEFINER disengaja: memeriksa kapabilitas, menegakkan jatah harian, dan memberi ciphertext kunci sekolah ke server aplikasi.';
