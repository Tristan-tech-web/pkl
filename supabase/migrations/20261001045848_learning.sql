-- M2: graf kompetensi, pelajaran, kuis dinilai server, progres, XP/level/streak, intervensi guru.

-- ===== Konfigurasi gamifikasi (satu-satunya sumber aturan) =====
create function app_private.xp_needed(p_level int) returns int
language sql immutable set search_path = '' as $$ select floor(100 * power(p_level, 1.5))::int $$;

create function app_private.level_for_xp(p_xp int) returns int
language plpgsql immutable set search_path = '' as $$
declare lvl int := 1; remaining int := greatest(p_xp, 0); need int;
begin
  loop
    need := app_private.xp_needed(lvl);
    exit when remaining < need;
    remaining := remaining - need;
    lvl := lvl + 1;
  end loop;
  return lvl;
end $$;

create function app_private.stars_for_score(p_score int) returns int
language sql immutable set search_path = '' as $$
  select case when p_score >= 90 then 3 when p_score >= 75 then 2 when p_score >= 60 then 1 else 0 end
$$;

-- XP node menurut bintang: 0 -> 50%, 1 -> 75%, 2 -> 100%, 3 -> 125%
create function app_private.xp_for_stars(p_base int, p_stars int) returns int
language sql immutable set search_path = '' as $$
  select round(p_base * case p_stars when 0 then 0.5 when 1 then 0.75 when 2 then 1.0 else 1.25 end)::int
$$;

-- ===== Graf kompetensi =====
create table public.competency_nodes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  subject_id uuid not null,
  grade int not null check (grade between 0 and 13),
  code text not null,
  title text not null check (char_length(title) between 2 and 160),
  summary text,
  kind text not null default 'materi' check (kind in ('materi','checkpoint','proyek')),
  position int not null default 0,
  xp_reward int not null default 50 check (xp_reward between 0 and 1000),
  estimated_minutes int check (estimated_minutes is null or estimated_minutes between 1 and 600),
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  unique (school_id, id),
  unique (school_id, subject_id, code),
  foreign key (school_id, subject_id) references public.school_subjects (school_id, id) on delete cascade
);
create index on public.competency_nodes (school_id, subject_id, position);

create table public.competency_prerequisites (
  school_id uuid not null,
  node_id uuid not null,
  requires_id uuid not null,
  primary key (node_id, requires_id),
  check (node_id <> requires_id),
  foreign key (school_id, node_id) references public.competency_nodes (school_id, id) on delete cascade,
  foreign key (school_id, requires_id) references public.competency_nodes (school_id, id) on delete cascade
);
create index on public.competency_prerequisites (school_id, node_id);
create index on public.competency_prerequisites (school_id, requires_id);

create table public.lessons (
  node_id uuid primary key,
  school_id uuid not null,
  body_md text not null default '',
  objectives text[] not null default '{}',
  visual_module text check (visual_module is null or visual_module in ('parabola')),
  updated_at timestamptz not null default now(),
  foreign key (school_id, node_id) references public.competency_nodes (school_id, id) on delete cascade
);
create index on public.lessons (school_id);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  node_id uuid not null,
  kind text not null check (kind in ('mcq','multi','short')),
  prompt text not null check (char_length(prompt) between 3 and 1000),
  options jsonb not null default '[]'::jsonb,
  hints text[] not null default '{}',
  difficulty int not null default 2 check (difficulty between 1 and 3),
  position int not null default 0,
  unique (school_id, id),
  foreign key (school_id, node_id) references public.competency_nodes (school_id, id) on delete cascade
);
create index on public.quiz_questions (school_id, node_id, position);

-- Kunci jawaban terpisah: tidak pernah terbaca siswa lewat API.
create table public.quiz_answer_keys (
  question_id uuid primary key,
  school_id uuid not null,
  answer jsonb not null,
  explanation text not null check (char_length(explanation) >= 3),
  foreign key (school_id, question_id) references public.quiz_questions (school_id, id) on delete cascade
);
create index on public.quiz_answer_keys (school_id);

-- ===== Progres dan gamifikasi (hanya ditulis lewat RPC) =====
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  node_id uuid not null,
  member_id uuid not null,
  score int not null check (score between 0 and 100),
  stars int not null check (stars between 0 and 3),
  xp_awarded int not null default 0,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (school_id, node_id) references public.competency_nodes (school_id, id) on delete cascade,
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.quiz_attempts (school_id, member_id, created_at desc);
create index on public.quiz_attempts (school_id, node_id);

create table public.node_progress (
  node_id uuid not null,
  member_id uuid not null,
  school_id uuid not null,
  best_score int not null default 0,
  stars int not null default 0,
  attempts int not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (node_id, member_id),
  foreign key (school_id, node_id) references public.competency_nodes (school_id, id) on delete cascade,
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.node_progress (school_id, member_id);

create table public.student_stats (
  member_id uuid primary key,
  school_id uuid not null,
  xp int not null default 0 check (xp >= 0),
  level int not null default 1,
  streak int not null default 0,
  best_streak int not null default 0,
  last_activity_date date,
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.student_stats (school_id);

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  member_id uuid not null,
  amount int not null,
  reason text not null,
  node_id uuid,
  created_at timestamptz not null default now(),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.xp_events (school_id, member_id, created_at desc);

-- ===== Intervensi guru =====
create table public.interventions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  student_member_id uuid not null,
  created_by_member_id uuid not null,
  kind text not null check (kind in ('remedial','bimbingan','teman_sebaya','orang_tua','lainnya')),
  priority text not null default 'sedang' check (priority in ('rendah','sedang','tinggi')),
  note text not null check (char_length(note) between 3 and 1000),
  due_on date,
  status text not null default 'baru' check (status in ('baru','berjalan','selesai','batal')),
  created_at timestamptz not null default now(),
  foreign key (school_id, student_member_id) references public.school_members (school_id, id) on delete cascade,
  foreign key (school_id, created_by_member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.interventions (school_id, student_member_id);
create index on public.interventions (school_id, created_by_member_id);

-- ===== RLS =====
alter table public.competency_nodes enable row level security;
alter table public.competency_prerequisites enable row level security;
alter table public.lessons enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.node_progress enable row level security;
alter table public.student_stats enable row level security;
alter table public.xp_events enable row level security;
alter table public.interventions enable row level security;
revoke all on public.competency_nodes, public.competency_prerequisites, public.lessons, public.quiz_questions,
  public.quiz_answer_keys, public.quiz_attempts, public.node_progress, public.student_stats, public.xp_events,
  public.interventions from anon;

-- Konten: anggota membaca yang terbit; penulis (content.author) membaca dan menulis semuanya.
create policy nodes_select on public.competency_nodes for select to authenticated
  using (app_private.is_member(school_id) and (status = 'published' or app_private.has_capability(school_id, 'content.author')));
create policy nodes_insert on public.competency_nodes for insert to authenticated
  with check (app_private.has_capability(school_id, 'content.author'));
create policy nodes_update on public.competency_nodes for update to authenticated
  using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));
create policy nodes_delete on public.competency_nodes for delete to authenticated
  using (app_private.has_capability(school_id, 'content.author'));

do $$
declare t text;
begin
  foreach t in array array['competency_prerequisites','lessons','quiz_questions'] loop
    execute format('create policy %I on public.%I for select to authenticated using (app_private.is_member(school_id))', t || '_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (app_private.has_capability(school_id, ''content.author''))', t || '_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (app_private.has_capability(school_id, ''content.author'')) with check (app_private.has_capability(school_id, ''content.author''))', t || '_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (app_private.has_capability(school_id, ''content.author''))', t || '_delete', t);
  end loop;
end $$;

create policy keys_select on public.quiz_answer_keys for select to authenticated
  using (app_private.has_capability(school_id, 'content.author'));
create policy keys_insert on public.quiz_answer_keys for insert to authenticated
  with check (app_private.has_capability(school_id, 'content.author'));
create policy keys_update on public.quiz_answer_keys for update to authenticated
  using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));
create policy keys_delete on public.quiz_answer_keys for delete to authenticated
  using (app_private.has_capability(school_id, 'content.author'));

-- Progres: milik sendiri atau staf (students.read). Tidak ada kebijakan tulis: hanya RPC.
create policy attempts_select on public.quiz_attempts for select to authenticated
  using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));
create policy progress_select on public.node_progress for select to authenticated
  using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));
create policy stats_select on public.student_stats for select to authenticated
  using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));
create policy xp_select on public.xp_events for select to authenticated
  using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));

create policy interventions_select on public.interventions for select to authenticated
  using (app_private.has_capability(school_id, 'students.read'));
create policy interventions_insert on public.interventions for insert to authenticated
  with check (app_private.has_capability(school_id, 'students.read')
              and created_by_member_id = app_private.my_member_id(school_id));
create policy interventions_update on public.interventions for update to authenticated
  using (app_private.has_capability(school_id, 'students.read')) with check (app_private.has_capability(school_id, 'students.read'));

-- ===== RPC: kuis dinilai di server =====
create function public.submit_quiz(p_node_id uuid, p_answers jsonb)
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
revoke execute on function public.submit_quiz(uuid, jsonb) from public, anon;
grant execute on function public.submit_quiz(uuid, jsonb) to authenticated;
comment on function public.submit_quiz(uuid, jsonb) is
  'SECURITY DEFINER disengaja: penilaian, XP, level, dan streak hanya boleh dihitung server; kunci jawaban tidak pernah dikirim ke klien sebelum percobaan.';

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;
