-- Kasus 'ditahan' yang tidak diputuskan guru dalam 7 hari dibebaskan otomatis (XP kembali): murid tidak boleh dirugikan oleh antrean yang terbengkalai.
create function public.integrity_expire_held(p_school uuid) returns int
language plpgsql security definer set search_path = '' as $$
declare c record; n int := 0;
begin
  if not app_private.is_member(p_school) then raise exception 'bukan anggota'; end if;
  for c in select * from public.integrity_cases where school_id = p_school and status = 'ditahan' and created_at < now() - interval '7 days' for update loop
    perform app_private.xp_adjust(c.school_id, c.member_id, c.xp_reversed + c.xp_penalty, 'bebas');
    update public.integrity_cases set status = 'dibebaskan', decided_at = now(), note = 'Otomatis: tidak diputuskan dalam 7 hari' where id = c.id;
    n := n + 1;
  end loop;
  return n;
end $$;
revoke execute on function public.integrity_expire_held(uuid) from public, anon;
grant execute on function public.integrity_expire_held(uuid) to authenticated;
