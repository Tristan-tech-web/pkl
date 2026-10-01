-- Bank soal AI + mode Latihan (farming XP yang sehat). Kunci jawaban hanya di bank_keys; siswa hanya lewat RPC sesi.
create table public.bank_items (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  subject_id uuid not null,
  node_id uuid,
  file_id uuid references public.school_files (id) on delete set null,
  stem text not null check (char_length(stem) between 3 and 1000),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 6),
  bloom text not null default 'pahami' check (bloom in ('ingat','pahami','terapkan','analisis','evaluasi','cipta')),
  rating numeric(7,1) not null default 1200 check (rating between 400 and 2400),
  attempts int not null default 0,
  correct int not null default 0,
  reports int not null default 0,
  source_quote text check (source_quote is null or char_length(source_quote) <= 400),
  status text not null default 'draf' check (status in ('draf','siap','ditinjau','ditarik')),
  checks jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (school_id, id),
  foreign key (school_id, subject_id) references public.school_subjects (school_id, id) on delete cascade,
  foreign key (school_id, node_id) references public.competency_nodes (school_id, id) on delete set null (node_id)
);
create index on public.bank_items (school_id, subject_id, status);
create table public.bank_keys (
  item_id uuid primary key references public.bank_items (id) on delete cascade,
  school_id uuid not null,
  answer int not null check (answer between 0 and 5),
  explanation text check (explanation is null or char_length(explanation) <= 600)
);
create table public.bank_reports (
  item_id uuid not null references public.bank_items (id) on delete cascade,
  member_id uuid not null,
  school_id uuid not null,
  reason text check (reason is null or char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  primary key (item_id, member_id)
);
create table public.bank_progress (
  member_id uuid not null,
  item_id uuid not null references public.bank_items (id) on delete cascade,
  school_id uuid not null,
  box int not null default 0 check (box between 0 and 5),
  due_at timestamptz not null default now(),
  seen int not null default 0,
  last_correct boolean,
  last_at timestamptz not null default now(),
  primary key (member_id, item_id),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create table public.practice_ability (
  member_id uuid not null,
  subject_id uuid not null,
  school_id uuid not null,
  rating numeric(7,1) not null default 1200,
  answered int not null default 0,
  primary key (member_id, subject_id),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  member_id uuid not null,
  subject_id uuid not null,
  target int not null default 10 check (target between 1 and 30),
  answered int not null default 0,
  xp int not null default 0,
  started_at timestamptz not null default now(),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.practice_sessions (school_id, member_id, started_at desc);
create table public.practice_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions (id) on delete cascade,
  school_id uuid not null,
  member_id uuid not null,
  item_id uuid not null references public.bank_items (id) on delete cascade,
  served_at timestamptz not null default now(),
  answered_at timestamptz,
  choice int,
  correct boolean,
  ms int,
  xp int not null default 0,
  flags text[] not null default '{}',
  meta jsonb not null default '{}'::jsonb,
  unique (session_id, item_id)
);
create index on public.practice_answers (school_id, member_id, answered_at desc);
create table public.bank_jobs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  file_id uuid not null references public.school_files (id) on delete cascade,
  subject_id uuid not null,
  node_id uuid,
  grade int not null default 10,
  target int not null check (target between 8 and 2000),
  auto_publish boolean not null default false,
  step int not null default 0,
  made int not null default 0,
  rejected int not null default 0,
  status text not null default 'berjalan' check (status in ('berjalan','selesai')),
  created_by uuid,
  created_at timestamptz not null default now(),
  foreign key (school_id, subject_id) references public.school_subjects (school_id, id) on delete cascade
);

alter table public.bank_items enable row level security;
alter table public.bank_keys enable row level security;
alter table public.bank_reports enable row level security;
alter table public.bank_progress enable row level security;
alter table public.practice_ability enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_answers enable row level security;
alter table public.bank_jobs enable row level security;
revoke all on public.bank_items, public.bank_keys, public.bank_reports, public.bank_progress, public.practice_ability, public.practice_sessions, public.practice_answers, public.bank_jobs from anon;

create policy bi_all on public.bank_items for all to authenticated using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));
create policy bk_all on public.bank_keys for all to authenticated using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));
create policy bj_all on public.bank_jobs for all to authenticated using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));
create policy br_select on public.bank_reports for select to authenticated using (app_private.has_capability(school_id, 'content.author'));
create policy bp_select on public.bank_progress for select to authenticated using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));
create policy pa_select on public.practice_ability for select to authenticated using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));
create policy ps_select on public.practice_sessions for select to authenticated using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));
create policy pans_select on public.practice_answers for select to authenticated using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));

-- Ringkasan untuk siswa: mapel yang punya butir siap, dan berapa yang jatuh tempo diulang.
create function public.practice_overview(p_school uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_member uuid := app_private.my_member_id(p_school);
begin
  if v_member is null then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('subject_id', s.id, 'name', s.name, 'items', x.n, 'due', coalesce(d.n, 0)) order by s.name)
    from public.school_subjects s
    join (select subject_id, count(*) n from public.bank_items where school_id = p_school and status = 'siap' group by 1) x on x.subject_id = s.id
    left join (select i.subject_id, count(*) n from public.bank_progress bp join public.bank_items i on i.id = bp.item_id
               where bp.member_id = v_member and bp.due_at <= now() and i.status = 'siap' group by 1) d on d.subject_id = s.id
    where s.school_id = p_school), '[]'::jsonb);
end $$;

create function public.practice_start(p_school uuid, p_subject uuid, p_count int default 10) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_member uuid := app_private.my_member_id(p_school); v_id uuid;
begin
  if v_member is null then raise exception 'bukan anggota'; end if;
  if (select count(*) from public.bank_items where school_id = p_school and subject_id = p_subject and status = 'siap') = 0 then raise exception 'belum ada soal'; end if;
  insert into public.practice_sessions (school_id, member_id, subject_id, target) values (p_school, v_member, p_subject, least(30, greatest(1, p_count))) returning id into v_id;
  return v_id;
end $$;

-- Soal berikutnya: yang tertunda dijawab dulu; lalu butir jatuh tempo (maks 40% sesi), lalu butir terdekat dengan kemampuan.
create function public.practice_next(p_session uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  s public.practice_sessions; v_member uuid; ab numeric; it public.bank_items; v_pending uuid; v_due_used int;
begin
  select * into s from public.practice_sessions where id = p_session;
  if not found then raise exception 'sesi tidak ada'; end if;
  v_member := app_private.my_member_id(s.school_id);
  if v_member is distinct from s.member_id then raise exception 'bukan sesi Anda'; end if;
  if s.answered >= s.target then return jsonb_build_object('done', true, 'answered', s.answered, 'total', s.target, 'xp', s.xp); end if;
  select item_id into v_pending from public.practice_answers where session_id = p_session and answered_at is null order by served_at limit 1;
  if v_pending is not null then
    select * into it from public.bank_items where id = v_pending;
  else
    select coalesce(rating, 1200) into ab from public.practice_ability where member_id = v_member and subject_id = s.subject_id;
    ab := coalesce(ab, 1200);
    select count(*) into v_due_used from public.practice_answers a join public.bank_progress bp on bp.member_id = a.member_id and bp.item_id = a.item_id
      where a.session_id = p_session and bp.box > 0;
    select i.* into it from public.bank_items i
      left join public.bank_progress bp on bp.item_id = i.id and bp.member_id = v_member
      where i.school_id = s.school_id and i.subject_id = s.subject_id and i.status = 'siap'
        and not exists (select 1 from public.practice_answers a where a.session_id = p_session and a.item_id = i.id)
      order by (case when bp.due_at is not null and bp.due_at <= now() and v_due_used < ceil(s.target * 0.4) then 0 else 1 end),
               (case when bp.item_id is null then 0 else 1 end),
               abs(i.rating - ab) + random() * 200
      limit 1;
    if it.id is null then
      return jsonb_build_object('done', true, 'answered', s.answered, 'total', s.target, 'xp', s.xp, 'empty', true);
    end if;
    insert into public.practice_answers (session_id, school_id, member_id, item_id) values (p_session, s.school_id, v_member, it.id);
  end if;
  return jsonb_build_object('done', false, 'index', s.answered + 1, 'total', s.target, 'xp', s.xp,
    'item', jsonb_build_object('id', it.id, 'stem', it.stem, 'options', it.options, 'bloom', it.bloom));
end $$;

create function public.practice_answer(p_session uuid, p_item uuid, p_choice int, p_meta jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  s public.practice_sessions; v_member uuid; a public.practice_answers; it public.bank_items; k public.bank_keys;
  bp public.bank_progress; v_ms int; v_ok boolean; v_xp numeric; v_flags text[] := '{}'; v_min int; v_prior int; v_today_xp int;
  v_ab numeric; v_exp numeric; v_box int; v_stats public.student_stats; v_streak int; v_level int; v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_total int;
begin
  select * into s from public.practice_sessions where id = p_session for update;
  if not found then raise exception 'sesi tidak ada'; end if;
  v_member := app_private.my_member_id(s.school_id);
  if v_member is distinct from s.member_id then raise exception 'bukan sesi Anda'; end if;
  select * into a from public.practice_answers where session_id = p_session and item_id = p_item for update;
  if not found or a.answered_at is not null then raise exception 'soal tidak sedang dikerjakan'; end if;
  select * into it from public.bank_items where id = p_item;
  select * into k from public.bank_keys where item_id = p_item;
  if p_choice is null or p_choice < 0 or p_choice >= jsonb_array_length(it.options) then raise exception 'pilihan tidak valid'; end if;
  v_ms := greatest(0, (extract(epoch from (now() - a.served_at)) * 1000)::int);
  v_ok := p_choice = k.answer;

  v_xp := 0;
  if v_ok then
    v_xp := least(15, greatest(5, 5 + round((it.rating - 1000) / 100)));
    v_min := least(8000, 1500 + char_length(it.stem) * 25);          -- batas waktu wajar membaca
    if v_ms < v_min then v_flags := v_flags || 'terlalu_cepat'; v_xp := 0; end if;
    select count(*) into v_prior from public.practice_answers pa
      where pa.member_id = v_member and pa.item_id = p_item and pa.correct and pa.answered_at > now() - interval '7 days' and pa.session_id <> p_session;
    if v_prior > 0 then v_flags := v_flags || 'ulang_cepat'; v_xp := v_xp * power(0.5, v_prior); end if;
    select * into bp from public.bank_progress where member_id = v_member and item_id = p_item;
    if found and bp.last_correct is false then v_flags := v_flags || 'bangkit'; v_xp := v_xp * 1.5; end if;
    if found and bp.box > 0 and bp.due_at > now() then v_flags := v_flags || 'belum_waktunya'; v_xp := v_xp * 0.5; end if;
    select coalesce(sum(pa.xp), 0) into v_today_xp from public.practice_answers pa
      where pa.member_id = v_member and (pa.answered_at at time zone 'Asia/Jakarta')::date = v_today;
    if v_today_xp >= 300 then v_flags := v_flags || 'batas_harian'; v_xp := 0; end if;
  end if;
  v_xp := floor(v_xp);

  update public.practice_answers set answered_at = now(), choice = p_choice, correct = v_ok, ms = v_ms, xp = v_xp::int, flags = v_flags,
    meta = coalesce(p_meta, '{}'::jsonb) - 'secret' where id = a.id;
  update public.practice_sessions set answered = answered + 1, xp = xp + v_xp::int where id = p_session returning answered, xp into s.answered, s.xp;

  -- Kalibrasi Elo sederhana (jawaban terlalu cepat tidak dihitung) dan kotak ulang berjarak
  if not ('terlalu_cepat' = any(v_flags)) then
    select rating into v_ab from public.practice_ability where member_id = v_member and subject_id = s.subject_id;
    v_ab := coalesce(v_ab, 1200);
    v_exp := 1 / (1 + power(10, (it.rating - v_ab) / 400.0));
    insert into public.practice_ability (member_id, subject_id, school_id, rating, answered)
      values (v_member, s.subject_id, s.school_id, greatest(600, least(2000, v_ab + 24 * ((case when v_ok then 1 else 0 end) - v_exp))), 1)
      on conflict (member_id, subject_id) do update set rating = excluded.rating, answered = public.practice_ability.answered + 1;
    update public.bank_items set attempts = attempts + 1, correct = correct + (case when v_ok then 1 else 0 end),
      rating = greatest(600, least(2000, rating - (case when attempts < 30 then 32 else 12 end) * ((case when v_ok then 1 else 0 end) - v_exp))) where id = p_item;
  end if;
  v_box := case when v_ok then least(5, coalesce((select box from public.bank_progress where member_id = v_member and item_id = p_item), 0) + 1) else 0 end;
  insert into public.bank_progress (member_id, item_id, school_id, box, due_at, seen, last_correct, last_at)
    values (v_member, p_item, s.school_id, v_box,
            now() + (case v_box when 0 then interval '10 minutes' when 1 then interval '1 day' when 2 then interval '3 days' when 3 then interval '7 days' when 4 then interval '14 days' else interval '30 days' end), 1, v_ok, now())
    on conflict (member_id, item_id) do update set box = excluded.box, due_at = excluded.due_at, seen = public.bank_progress.seen + 1, last_correct = v_ok, last_at = now();

  v_total := 0;
  if v_xp > 0 then
    select * into v_stats from public.student_stats where member_id = v_member for update;
    if not found then
      insert into public.student_stats (member_id, school_id, xp, level, streak, best_streak, last_activity_date)
        values (v_member, s.school_id, v_xp::int, app_private.level_for_xp(v_xp::int), 1, 1, v_today) returning * into v_stats;
    else
      v_streak := case when v_stats.last_activity_date = v_today then v_stats.streak when v_stats.last_activity_date = v_today - 1 then v_stats.streak + 1 else 1 end;
      update public.student_stats set xp = xp + v_xp::int, level = app_private.level_for_xp(xp + v_xp::int), streak = v_streak,
        best_streak = greatest(best_streak, v_streak), last_activity_date = v_today where member_id = v_member returning * into v_stats;
    end if;
    insert into public.xp_events (school_id, member_id, amount, reason) values (s.school_id, v_member, v_xp::int, 'latihan');
  end if;
  return jsonb_build_object('correct', v_ok, 'answer', k.answer, 'explanation', k.explanation, 'xp', v_xp::int, 'flags', v_flags,
    'session_xp', s.xp, 'answered', s.answered, 'total', s.target, 'done', s.answered >= s.target);
end $$;

create function public.bank_report(p_item uuid, p_reason text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare it public.bank_items; v_member uuid;
begin
  select * into it from public.bank_items where id = p_item;
  if not found then return; end if;
  v_member := app_private.my_member_id(it.school_id);
  if v_member is null then raise exception 'bukan anggota'; end if;
  insert into public.bank_reports (item_id, member_id, school_id, reason) values (p_item, v_member, it.school_id, left(p_reason, 200)) on conflict do nothing;
  update public.bank_items set reports = (select count(*) from public.bank_reports where item_id = p_item),
    status = case when status = 'siap' and (select count(*) from public.bank_reports where item_id = p_item) >= 3 then 'ditinjau' else status end
  where id = p_item;
end $$;

revoke execute on function public.practice_overview(uuid), public.practice_start(uuid, uuid, int), public.practice_next(uuid), public.practice_answer(uuid, uuid, int, jsonb), public.bank_report(uuid, text) from public, anon;
grant execute on function public.practice_overview(uuid), public.practice_start(uuid, uuid, int), public.practice_next(uuid), public.practice_answer(uuid, uuid, int, jsonb), public.bank_report(uuid, text) to authenticated;
