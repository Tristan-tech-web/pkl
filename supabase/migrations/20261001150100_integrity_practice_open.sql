-- practice_open: sesi latihan dengan opsi kamera (tanpa DROP; practice_start lama mendelegasikan ke sini).
create function public.practice_open(p_school uuid, p_subject uuid, p_count int default 10, p_camera boolean default false) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_member uuid := app_private.my_member_id(p_school); v_id uuid; cfg public.school_integrity;
begin
  if v_member is null then raise exception 'bukan anggota'; end if;
  if (select count(*) from public.bank_items where school_id = p_school and subject_id = p_subject and status = 'siap') = 0 then raise exception 'belum ada soal'; end if;
  cfg := app_private.integrity_cfg(p_school);
  if p_camera and not (cfg.enabled and cfg.camera_mode = 'optional' and cfg.parental_consent_confirmed) then raise exception 'kamera tidak diizinkan sekolah'; end if;
  insert into public.practice_sessions (school_id, member_id, subject_id, target, camera) values (p_school, v_member, p_subject, least(30, greatest(1, p_count)), p_camera) returning id into v_id;
  return v_id;
end $$;
create or replace function public.practice_start(p_school uuid, p_subject uuid, p_count int default 10) returns uuid
language sql security definer set search_path = '' as $$ select public.practice_open(p_school, p_subject, p_count, false) $$;
revoke execute on function public.practice_open(uuid, uuid, int, boolean) from public, anon;
grant execute on function public.practice_open(uuid, uuid, int, boolean) to authenticated;
