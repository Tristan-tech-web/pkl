-- Undangan massal dari CSV: label = nama yang ditetapkan sekolah, dipakai sebagai nama anggota saat kode ditebus.
alter table public.invites add column label text check (label is null or char_length(label) between 2 and 120);

create or replace function public.redeem_invite(p_code text, p_display_name text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  inv public.invites;
  v_role public.roles;
  v_inserted int;
  v_member uuid;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select * into inv from public.invites where code = upper(trim(p_code)) for update;
  if not found or inv.expires_at < now() or inv.used_count >= inv.max_uses then
    raise exception 'kode undangan tidak valid atau sudah tidak berlaku';
  end if;
  select * into v_role from public.roles where id = inv.role_id;
  if v_role.code = 'owner' then raise exception 'kode undangan tidak valid atau sudah tidak berlaku'; end if;

  insert into public.school_members (school_id, user_id, role_id, display_name)
  values (inv.school_id, v_uid, inv.role_id, coalesce(inv.label, nullif(trim(p_display_name), '')))
  on conflict (school_id, user_id) do nothing
  returning id into v_member;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then raise exception 'Anda sudah menjadi anggota sekolah ini'; end if;

  if inv.class_group_id is not null and v_role.code = 'student' then
    insert into public.class_group_students (school_id, class_group_id, member_id)
    values (inv.school_id, inv.class_group_id, v_member)
    on conflict (class_group_id, member_id) do nothing;
  end if;
  update public.invites set used_count = used_count + 1 where id = inv.id;
  return inv.school_id;
end $$;
