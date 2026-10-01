-- Jalur belajar bergaya Duolingo: unit, jenis simpul baru, dan jadwal buka per rombel (diterapkan juga di submit_quiz).
create table public.path_units (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  subject_id uuid not null,
  title text not null check (char_length(title) between 2 and 120),
  summary text check (summary is null or char_length(summary) <= 300),
  position int not null default 0,
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  unique (school_id, id),
  foreign key (school_id, subject_id) references public.school_subjects (school_id, id) on delete cascade
);
create index on public.path_units (school_id, subject_id, position);
alter table public.path_units enable row level security;
revoke all on public.path_units from anon;
create policy pu_select on public.path_units for select to authenticated using (app_private.is_member(school_id) and (status = 'published' or app_private.has_capability(school_id, 'content.author')));
create policy pu_write on public.path_units for all to authenticated using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));

alter table public.competency_nodes add column unit_id uuid;
alter table public.competency_nodes add constraint competency_nodes_unit_fk foreign key (school_id, unit_id) references public.path_units (school_id, id) on delete set null (unit_id);
alter table public.competency_nodes drop constraint competency_nodes_kind_check;
alter table public.competency_nodes add constraint competency_nodes_kind_check check (kind in ('materi','checkpoint','proyek','persiapan','latihan','ulang','boss','cerita'));
create index on public.competency_nodes (school_id, unit_id);

create table public.node_schedule (
  school_id uuid not null,
  node_id uuid not null,
  class_group_id uuid not null,
  unlock_at timestamptz not null,
  meeting_at timestamptz,
  primary key (node_id, class_group_id),
  foreign key (school_id, node_id) references public.competency_nodes (school_id, id) on delete cascade,
  foreign key (school_id, class_group_id) references public.class_groups (school_id, id) on delete cascade
);
create index on public.node_schedule (school_id, class_group_id);
alter table public.node_schedule enable row level security;
revoke all on public.node_schedule from anon;
create policy ns_select on public.node_schedule for select to authenticated using (
  app_private.has_capability(school_id, 'content.author')
  or exists (select 1 from public.class_group_students cs where cs.class_group_id = node_schedule.class_group_id and cs.member_id = app_private.my_member_id(school_id)));
create policy ns_write on public.node_schedule for all to authenticated using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));

-- Siswa terkunci waktu bila semua jadwal untuk rombelnya belum jatuh tempo.
create function app_private.node_time_locked(p_node uuid, p_member uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.node_schedule ns join public.class_group_students cs on cs.class_group_id = ns.class_group_id and cs.member_id = p_member where ns.node_id = p_node)
     and not exists (select 1 from public.node_schedule ns join public.class_group_students cs on cs.class_group_id = ns.class_group_id and cs.member_id = p_member where ns.node_id = p_node and ns.unlock_at <= now())
$$;

-- submit_quiz: sama dengan versi sebelumnya ditambah pemeriksaan waktu buka (app_private.node_time_locked).
create or replace function public.submit_quiz(p_node_id uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  node public.competency_nodes;
  v_member uuid;
  v_unmet int;
  q record;
  given jsonb;
  ok boolean;
  v_total int := 0; v_correct int := 0;
  results jsonb := '[]'::jsonb;
  v_score int; v_stars int; v_prev public.node_progress; v_had_prev boolean;
  v_prev_xp int := 0; v_new_xp int; v_delta int; v_bonus int := 0;
  v_stats public.student_stats;
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_streak int; v_level_before int; v_level int;
  unlocked jsonb := '[]'::jsonb;
begin
  if v_uid is null then raise exception 'perlu login' using errcode = '28000'; end if;
  select * into node from public.competency_nodes where id = p_node_id and status = 'published';
  if not found then raise exception 'materi tidak ditemukan'; end if;
  select m.id into v_member from public.school_members m
    where m.school_id = node.school_id and m.user_id = v_uid and m.status = 'active';
  if v_member is null then raise exception 'bukan anggota sekolah ini'; end if;

  select count(*) into v_unmet from public.competency_prerequisites pr
    where pr.node_id = node.id
      and not exists (select 1 from public.node_progress np
                      where np.node_id = pr.requires_id and np.member_id = v_member and np.completed_at is not null);
  if v_unmet > 0 then raise exception 'materi ini masih terkunci'; end if;
  if app_private.node_time_locked(node.id, v_member) then raise exception 'materi ini belum dibuka'; end if;

  for q in
    select qq.id, qq.kind, k.answer, k.explanation
    from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
    where qq.node_id = node.id order by qq.position, qq.id
  loop
    v_total := v_total + 1;
    given := p_answers -> q.id::text;
    ok := case q.kind
      when 'mcq' then given is not null and given = q.answer
      when 'multi' then given is not null and jsonb_typeof(given) = 'array'
        and (select coalesce(array_agg(x order by x), '{}') from jsonb_array_elements_text(given) x)
          = (select coalesce(array_agg(x order by x), '{}') from jsonb_array_elements_text(q.answer) x)
      else given is not null and jsonb_typeof(given) = 'string'
        and exists (select 1 from jsonb_array_elements_text(q.answer) a
                    where lower(trim(a)) = lower(trim(given #>> '{}')))
    end;
    if ok then v_correct := v_correct + 1; end if;
    results := results || jsonb_build_object(
      'question_id', q.id, 'correct', ok, 'correct_answer', q.answer, 'explanation', q.explanation);
  end loop;
  if v_total = 0 then raise exception 'materi ini belum punya soal'; end if;

  v_score := round(100.0 * v_correct / v_total)::int;
  v_stars := app_private.stars_for_score(v_score);
  select * into v_prev from public.node_progress where node_id = node.id and member_id = v_member;
  v_had_prev := found;
  if v_had_prev and v_prev.completed_at is not null then
    v_prev_xp := app_private.xp_for_stars(node.xp_reward, v_prev.stars);
  end if;
  v_new_xp := case when v_stars >= 1 then app_private.xp_for_stars(node.xp_reward, v_stars) else 0 end;
  v_delta := greatest(0, v_new_xp - v_prev_xp);
  if v_score = 100 and (not v_had_prev or v_prev.best_score < 100) then v_bonus := 25; end if;
  v_delta := v_delta + v_bonus;

  insert into public.quiz_attempts (school_id, node_id, member_id, score, stars, xp_awarded, answers)
    values (node.school_id, node.id, v_member, v_score, v_stars, v_delta, coalesce(p_answers, '{}'::jsonb));

  insert into public.node_progress (node_id, member_id, school_id, best_score, stars, attempts, completed_at)
    values (node.id, v_member, node.school_id, v_score, v_stars, 1, case when v_stars >= 1 then now() end)
  on conflict (node_id, member_id) do update set
    best_score = greatest(public.node_progress.best_score, excluded.best_score),
    stars = greatest(public.node_progress.stars, excluded.stars),
    attempts = public.node_progress.attempts + 1,
    completed_at = coalesce(public.node_progress.completed_at, excluded.completed_at),
    updated_at = now();

  select * into v_stats from public.student_stats where member_id = v_member for update;
  if not found then
    v_level_before := 1;
    insert into public.student_stats (member_id, school_id, xp, level, streak, best_streak, last_activity_date)
      values (v_member, node.school_id, v_delta, app_private.level_for_xp(v_delta), 1, 1, v_today)
      returning * into v_stats;
  else
    v_level_before := v_stats.level;
    v_streak := case
      when v_stats.last_activity_date = v_today then v_stats.streak
      when v_stats.last_activity_date = v_today - 1 then v_stats.streak + 1
      else 1 end;
    update public.student_stats set
      xp = xp + v_delta, level = app_private.level_for_xp(xp + v_delta),
      streak = v_streak, best_streak = greatest(best_streak, v_streak), last_activity_date = v_today
    where member_id = v_member returning * into v_stats;
  end if;
  v_level := v_stats.level;

  if v_delta > 0 then
    insert into public.xp_events (school_id, member_id, amount, reason, node_id)
      values (node.school_id, v_member, v_delta, 'kuis', node.id);
  end if;

  if v_stars >= 1 and (not v_had_prev or v_prev.completed_at is null) then
    select coalesce(jsonb_agg(jsonb_build_object('id', n.id, 'title', n.title)), '[]'::jsonb) into unlocked
    from public.competency_nodes n
    where n.school_id = node.school_id and n.status = 'published'
      and exists (select 1 from public.competency_prerequisites p where p.node_id = n.id and p.requires_id = node.id)
      and not exists (select 1 from public.competency_prerequisites p2
                      where p2.node_id = n.id
                        and not exists (select 1 from public.node_progress np2
                                        where np2.node_id = p2.requires_id and np2.member_id = v_member and np2.completed_at is not null));
  end if;

  return jsonb_build_object(
    'score', v_score, 'correct', v_correct, 'total', v_total, 'stars', v_stars, 'passed', v_stars >= 1,
    'xp_awarded', v_delta, 'bonus', v_bonus, 'xp_total', v_stats.xp, 'level', v_level,
    'level_before', v_level_before, 'leveled_up', v_level > v_level_before,
    'xp_into_level', v_stats.xp - (select coalesce(sum(app_private.xp_needed(l)), 0)::int from generate_series(1, v_level - 1) l),
    'xp_for_level', app_private.xp_needed(v_level),
    'streak', v_stats.streak, 'unlocked', unlocked, 'results', results);
end $$;
