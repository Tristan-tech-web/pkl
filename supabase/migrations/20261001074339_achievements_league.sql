-- Pencapaian (lencana) dan liga mingguan per rombel; modul analitik tersedia.
create table public.achievements (
  code text primary key,
  name text not null,
  description text not null,
  icon text not null,
  sort int not null default 100
);
create table public.member_achievements (
  member_id uuid not null,
  school_id uuid not null,
  code text not null references public.achievements (code) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (member_id, code),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.member_achievements (school_id, member_id);
alter table public.achievements enable row level security;
alter table public.member_achievements enable row level security;
revoke all on public.achievements, public.member_achievements from anon;
create policy achievements_read on public.achievements for select to authenticated using (true);
create policy member_achievements_select on public.member_achievements for select to authenticated
  using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));

insert into public.achievements (code, name, description, icon, sort) values
  ('first_quiz', 'Langkah pertama', 'Menyelesaikan kuis pertama.', 'seedling', 1),
  ('perfect', 'Sempurna', 'Mendapat nilai 100 pada sebuah kuis.', 'star', 2),
  ('streak_3', 'Tiga hari berturut', 'Belajar 3 hari berturut-turut.', 'flame', 3),
  ('streak_7', 'Seminggu penuh', 'Belajar 7 hari berturut-turut.', 'flame', 4),
  ('nodes_5', 'Penjelajah', 'Menyelesaikan 5 materi.', 'map', 5),
  ('level_5', 'Level 5', 'Mencapai level 5.', 'rocket', 6),
  ('comeback', 'Pantang menyerah', 'Lulus materi setelah gagal sebelumnya.', 'refresh', 7);

-- Pemberian otomatis tiap statistik siswa berubah (setelah kuis dinilai server).
create function app_private.award_achievements() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_done int; v_attempts int; v_fail_then_pass boolean;
begin
  select count(*) filter (where completed_at is not null) into v_done from public.node_progress where member_id = new.member_id;
  select count(*) into v_attempts from public.quiz_attempts where member_id = new.member_id;
  select exists (select 1 from public.node_progress np where np.member_id = new.member_id and np.completed_at is not null and np.attempts > 1
                 and exists (select 1 from public.quiz_attempts qa where qa.member_id = new.member_id and qa.node_id = np.node_id and qa.stars = 0))
    into v_fail_then_pass;
  insert into public.member_achievements (member_id, school_id, code)
  select new.member_id, new.school_id, c from unnest(array[
    case when v_attempts >= 1 then 'first_quiz' end,
    case when exists (select 1 from public.quiz_attempts where member_id = new.member_id and score = 100) then 'perfect' end,
    case when new.streak >= 3 then 'streak_3' end,
    case when new.streak >= 7 then 'streak_7' end,
    case when v_done >= 5 then 'nodes_5' end,
    case when new.level >= 5 then 'level_5' end,
    case when v_fail_then_pass then 'comeback' end
  ]) as c where c is not null
  on conflict do nothing;
  return new;
end $$;
create trigger student_stats_award after insert or update on public.student_stats
  for each row execute function app_private.award_achievements();

-- Liga mingguan: XP pekan ini (Senin-Minggu, WIB) untuk teman sekelas. Nama disingkat demi privasi anak.
create function public.weekly_league(p_school_id uuid, p_class_id uuid default null)
returns table (rank int, label text, xp bigint, is_me boolean)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_me uuid := app_private.my_member_id(p_school_id);
  v_class uuid := p_class_id;
  v_week date := date_trunc('week', now() at time zone 'Asia/Jakarta')::date;
begin
  if v_me is null or not app_private.module_enabled(p_school_id, 'learning') then return; end if;
  if v_class is null then
    select s.class_group_id into v_class from public.class_group_students s where s.member_id = v_me limit 1;
  elsif not (app_private.has_capability(p_school_id, 'students.read')
             or exists (select 1 from public.class_group_students s where s.member_id = v_me and s.class_group_id = p_class_id)) then
    return;
  end if;
  if v_class is null then return; end if;
  return query
  select (rank() over (order by coalesce(x.xp, 0) desc))::int, 
         split_part(m.display_name, ' ', 1) || coalesce(' ' || nullif(left(split_part(m.display_name, ' ', 2), 1), '') || '.', ''),
         coalesce(x.xp, 0)::bigint, (m.id = v_me)
  from public.class_group_students s
  join public.school_members m on m.id = s.member_id
  left join (select e.member_id, sum(e.amount) xp from public.xp_events e
             where e.school_id = p_school_id and (e.created_at at time zone 'Asia/Jakarta')::date >= v_week group by e.member_id) x on x.member_id = s.member_id
  where s.class_group_id = v_class and s.school_id = p_school_id
  order by 1, 2
  limit 20;
end $$;
revoke execute on function public.weekly_league(uuid, uuid) from public, anon;
grant execute on function public.weekly_league(uuid, uuid) to authenticated;
comment on function public.weekly_league(uuid, uuid) is 'SECURITY DEFINER disengaja: peringkat memuat nama teman sekelas yang tidak boleh dibaca siswa lewat tabel anggota; nama disingkat, hanya rombel sendiri.';

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;
update public.modules set status = 'tersedia' where code = 'analytics';
