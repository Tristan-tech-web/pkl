-- Pengumuman dan jadwal pelajaran.
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  author_member_id uuid not null,
  title text not null check (char_length(title) between 3 and 140),
  body text not null check (char_length(body) between 1 and 4000),
  audience text not null default 'semua' check (audience in ('semua','siswa','guru','kelas')),
  class_group_id uuid,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  check ((audience = 'kelas') = (class_group_id is not null)),
  foreign key (school_id, author_member_id) references public.school_members (school_id, id) on delete cascade,
  foreign key (school_id, class_group_id) references public.class_groups (school_id, id) on delete cascade
);
create index on public.announcements (school_id, created_at desc);

-- Penulis: pengelola (class.manage) untuk semua sasaran; guru hanya untuk rombel yang ia ajar.
create function app_private.can_announce(p_school uuid, p_audience text, p_class uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select app_private.has_capability(p_school, 'class.manage')
    or (p_audience = 'kelas' and p_class is not null and app_private.has_capability(p_school, 'content.author')
        and exists (select 1 from public.teaching_assignments t where t.school_id = p_school and t.class_group_id = p_class
                    and t.teacher_member_id = app_private.my_member_id(p_school)))
$$;
create function app_private.can_see_announcement(p_school uuid, p_audience text, p_class uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select app_private.has_capability(p_school, 'students.read')
    or (app_private.is_member(p_school) and (p_audience in ('semua','siswa')
        or (p_audience = 'kelas' and exists (select 1 from public.class_group_students s
              where s.class_group_id = p_class and s.member_id = app_private.my_member_id(p_school)))))
$$;

alter table public.announcements enable row level security;
revoke all on public.announcements from anon;
create policy announcements_select on public.announcements for select to authenticated
  using (app_private.module_enabled(school_id, 'announcements') and app_private.can_see_announcement(school_id, audience, class_group_id));
create policy announcements_insert on public.announcements for insert to authenticated
  with check (app_private.module_enabled(school_id, 'announcements') and app_private.can_announce(school_id, audience, class_group_id)
              and author_member_id = app_private.my_member_id(school_id));
create policy announcements_update on public.announcements for update to authenticated
  using (app_private.module_enabled(school_id, 'announcements') and app_private.can_announce(school_id, audience, class_group_id)
         and (author_member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'class.manage')))
  with check (app_private.module_enabled(school_id, 'announcements') and app_private.can_announce(school_id, audience, class_group_id));
create policy announcements_delete on public.announcements for delete to authenticated
  using (app_private.module_enabled(school_id, 'announcements')
         and (author_member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'class.manage')));

create table public.schedule_slots (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  class_group_id uuid not null,
  school_subject_id uuid not null,
  teacher_member_id uuid,
  weekday int not null check (weekday between 1 and 7),
  starts_at time not null,
  ends_at time not null,
  room text check (room is null or char_length(room) <= 40),
  check (ends_at > starts_at),
  foreign key (school_id, class_group_id) references public.class_groups (school_id, id) on delete cascade,
  foreign key (school_id, school_subject_id) references public.school_subjects (school_id, id) on delete cascade,
  foreign key (school_id, teacher_member_id) references public.school_members (school_id, id) on delete set null
);
create index on public.schedule_slots (school_id, class_group_id, weekday);
create index on public.schedule_slots (school_id, teacher_member_id, weekday);

-- Tidak boleh bentrok: rombel yang sama, atau guru yang sama, pada hari dan jam yang beririsan.
create function app_private.schedule_no_overlap() returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.schedule_slots s where s.id <> new.id and s.school_id = new.school_id
             and s.weekday = new.weekday and s.starts_at < new.ends_at and new.starts_at < s.ends_at
             and s.class_group_id = new.class_group_id) then
    raise exception 'jadwal bentrok: rombel sudah punya pelajaran pada jam itu';
  end if;
  if new.teacher_member_id is not null and exists (select 1 from public.schedule_slots s where s.id <> new.id and s.school_id = new.school_id
             and s.weekday = new.weekday and s.starts_at < new.ends_at and new.starts_at < s.ends_at
             and s.teacher_member_id = new.teacher_member_id) then
    raise exception 'jadwal bentrok: guru sudah mengajar pada jam itu';
  end if;
  return new;
end $$;
create trigger schedule_no_overlap before insert or update on public.schedule_slots
  for each row execute function app_private.schedule_no_overlap();

alter table public.schedule_slots enable row level security;
revoke all on public.schedule_slots from anon;
create policy schedule_select on public.schedule_slots for select to authenticated
  using (app_private.module_enabled(school_id, 'schedule') and app_private.is_member(school_id));
create policy schedule_write on public.schedule_slots for all to authenticated
  using (app_private.module_enabled(school_id, 'schedule') and app_private.has_capability(school_id, 'class.manage'))
  with check (app_private.module_enabled(school_id, 'schedule') and app_private.has_capability(school_id, 'class.manage'));

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;

update public.modules set status = 'tersedia' where code in ('announcements', 'schedule');
