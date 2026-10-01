-- Jadwal dengan nama guru (siswa tidak boleh membaca tabel anggota, jadi lewat fungsi yang tetap memeriksa keanggotaan dan modul).
create function public.schedule_for(p_school uuid, p_class uuid default null, p_teacher uuid default null)
returns table (id uuid, class_group_id uuid, class_name text, subject_name text, teacher_name text, weekday int, starts_at time, ends_at time, room text)
language sql stable security definer set search_path = '' as $$
  select s.id, s.class_group_id, g.name, sub.name, m.display_name, s.weekday, s.starts_at, s.ends_at, s.room
  from public.schedule_slots s
  join public.class_groups g on g.id = s.class_group_id
  join public.school_subjects sub on sub.id = s.school_subject_id
  left join public.school_members m on m.id = s.teacher_member_id
  where s.school_id = p_school
    and app_private.module_enabled(p_school, 'schedule') and app_private.is_member(p_school)
    and (p_class is null or s.class_group_id = p_class)
    and (p_teacher is null or s.teacher_member_id = p_teacher)
  order by s.weekday, s.starts_at
$$;
revoke execute on function public.schedule_for(uuid, uuid, uuid) from public, anon;
grant execute on function public.schedule_for(uuid, uuid, uuid) to authenticated;
comment on function public.schedule_for(uuid, uuid, uuid) is
  'SECURITY DEFINER disengaja: jadwal memuat nama guru yang tidak boleh dibaca siswa lewat tabel anggota; tetap memeriksa keanggotaan dan modul.';
