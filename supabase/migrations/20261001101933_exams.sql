-- Ujian terkunci: jadwal, soal, sesi, jawaban, dan peristiwa integritas. Aplikasi ujian memakai token sesi (bukan cookie),
-- sehingga semua operasi klien ujian lewat RPC exam_* yang memeriksa token sendiri. Kunci jawaban tidak pernah dikirim ke klien.
insert into public.modules (code, name, description, category, status, sort) values
  ('exams', 'Ujian terkunci', 'Ujian dengan aplikasi khusus (Android, iOS, Windows) yang mengunci perangkat, timer server, dan log pelanggaran.', 'belajar', 'tersedia', 4)
on conflict (code) do nothing;
insert into public.plan_modules (plan_code, module_code) values ('school','exams'), ('enterprise','exams') on conflict do nothing;

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  class_group_id uuid not null,
  school_subject_id uuid not null,
  title text not null check (char_length(title) between 3 and 140),
  instructions text check (instructions is null or char_length(instructions) <= 2000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes int not null check (duration_minutes between 5 and 360),
  status text not null default 'draf' check (status in ('draf','terbit','ditutup')),
  secure_required boolean not null default true,
  on_violation text not null default 'bekukan' check (on_violation in ('catat','bekukan')),
  max_violations int not null default 3 check (max_violations between 1 and 20),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (school_id, id),
  foreign key (school_id, class_group_id) references public.class_groups (school_id, id) on delete cascade,
  foreign key (school_id, school_subject_id) references public.school_subjects (school_id, id) on delete cascade,
  foreign key (school_id, created_by) references public.school_members (school_id, id) on delete cascade
);
create index on public.exams (school_id, starts_at);
create index on public.exams (school_id, class_group_id);

create table public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  exam_id uuid not null,
  kind text not null check (kind in ('mcq','multi','short','essay')),
  prompt text not null check (char_length(prompt) between 3 and 2000),
  options jsonb not null default '[]'::jsonb,
  points numeric not null default 1 check (points > 0 and points <= 100),
  position int not null default 0,
  unique (school_id, id),
  foreign key (school_id, exam_id) references public.exams (school_id, id) on delete cascade
);
create index on public.exam_questions (school_id, exam_id, position);

create table public.exam_answer_keys (
  question_id uuid primary key,
  school_id uuid not null,
  answer jsonb not null,
  explanation text,
  foreign key (school_id, question_id) references public.exam_questions (school_id, id) on delete cascade
);

create table public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  exam_id uuid not null,
  member_id uuid not null,
  status text not null default 'menunggu' check (status in ('menunggu','berjalan','dibekukan','selesai')),
  token_hash text unique,
  token_expires_at timestamptz,
  platform text,
  app_version text,
  secure boolean not null default false,
  started_at timestamptz,
  deadline_at timestamptz,
  submitted_at timestamptz,
  score numeric,
  manual_pending boolean not null default false,
  violations int not null default 0,
  frozen_reason text,
  created_at timestamptz not null default now(),
  unique (exam_id, member_id),
  unique (school_id, id),
  foreign key (school_id, exam_id) references public.exams (school_id, id) on delete cascade,
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.exam_sessions (school_id, member_id);

create table public.exam_answers (
  session_id uuid not null,
  question_id uuid not null,
  school_id uuid not null,
  answer jsonb not null,
  saved_at timestamptz not null default now(),
  primary key (session_id, question_id),
  foreign key (school_id, session_id) references public.exam_sessions (school_id, id) on delete cascade,
  foreign key (school_id, question_id) references public.exam_questions (school_id, id) on delete cascade
);

create table public.exam_events (
  id bigint generated always as identity primary key,
  school_id uuid not null,
  session_id uuid not null,
  kind text not null,
  detail jsonb not null default '{}'::jsonb,
  counted boolean not null default true,
  at timestamptz not null default now(),
  foreign key (school_id, session_id) references public.exam_sessions (school_id, id) on delete cascade
);
create index on public.exam_events (school_id, session_id, at);

create table public.exam_launch_codes (
  code_hash text primary key,
  school_id uuid not null,
  exam_id uuid not null,
  member_id uuid not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  foreign key (school_id, exam_id) references public.exams (school_id, id) on delete cascade,
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);

-- Hak: pengelola ujian = pembuat, atau pengelola sekolah.
create function app_private.can_manage_exam(p_school uuid, p_creator uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select app_private.module_enabled(p_school, 'exams')
     and (app_private.has_capability(p_school, 'members.manage') or app_private.has_capability(p_school, 'class.manage')
          or (p_creator = app_private.my_member_id(p_school) and app_private.has_capability(p_school, 'content.author')))
$$;

alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_answer_keys enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.exam_answers enable row level security;
alter table public.exam_events enable row level security;
alter table public.exam_launch_codes enable row level security;
revoke all on public.exams, public.exam_questions, public.exam_answer_keys, public.exam_sessions, public.exam_answers, public.exam_events, public.exam_launch_codes from anon;
revoke all on public.exam_launch_codes from authenticated;

create policy exams_select on public.exams for select to authenticated using (
  app_private.can_manage_exam(school_id, created_by)
  or (app_private.module_enabled(school_id, 'exams') and status <> 'draf'
      and exists (select 1 from public.class_group_students cs where cs.class_group_id = exams.class_group_id and cs.member_id = app_private.my_member_id(school_id))));
create policy exams_insert on public.exams for insert to authenticated with check (
  app_private.can_manage_exam(school_id, created_by) and created_by = app_private.my_member_id(school_id));
create policy exams_update on public.exams for update to authenticated using (app_private.can_manage_exam(school_id, created_by)) with check (app_private.can_manage_exam(school_id, created_by));
create policy exams_delete on public.exams for delete to authenticated using (app_private.can_manage_exam(school_id, created_by));

create policy eq_all on public.exam_questions for all to authenticated
  using (exists (select 1 from public.exams e where e.id = exam_id and app_private.can_manage_exam(e.school_id, e.created_by)))
  with check (exists (select 1 from public.exams e where e.id = exam_id and app_private.can_manage_exam(e.school_id, e.created_by)));
create policy eak_all on public.exam_answer_keys for all to authenticated
  using (exists (select 1 from public.exam_questions q join public.exams e on e.id = q.exam_id where q.id = question_id and app_private.can_manage_exam(e.school_id, e.created_by)))
  with check (exists (select 1 from public.exam_questions q join public.exams e on e.id = q.exam_id where q.id = question_id and app_private.can_manage_exam(e.school_id, e.created_by)));
create policy es_select on public.exam_sessions for select to authenticated using (
  member_id = app_private.my_member_id(school_id)
  or exists (select 1 from public.exams e where e.id = exam_id and app_private.can_manage_exam(e.school_id, e.created_by)));
create policy ea_select on public.exam_answers for select to authenticated using (
  exists (select 1 from public.exam_sessions s join public.exams e on e.id = s.exam_id where s.id = session_id and app_private.can_manage_exam(e.school_id, e.created_by)));
create policy ee_select on public.exam_events for select to authenticated using (
  exists (select 1 from public.exam_sessions s join public.exams e on e.id = s.exam_id where s.id = session_id and (app_private.can_manage_exam(e.school_id, e.created_by) or s.member_id = app_private.my_member_id(s.school_id))));

-- Siswa meminta kode peluncuran (sekali pakai, 5 menit) dari web.
create function public.exam_issue_launch(p_exam uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare e public.exams; v_me uuid; v_code text;
begin
  select * into e from public.exams where id = p_exam;
  if e.id is null then raise exception 'ujian tidak ditemukan'; end if;
  v_me := app_private.my_member_id(e.school_id);
  if v_me is null or not app_private.module_enabled(e.school_id, 'exams') then raise exception 'tidak berhak'; end if;
  if not exists (select 1 from public.class_group_students cs where cs.class_group_id = e.class_group_id and cs.member_id = v_me) then raise exception 'ujian ini bukan untuk kelasmu'; end if;
  if e.status <> 'terbit' or now() < e.starts_at or now() > e.ends_at then raise exception 'ujian belum dibuka atau sudah ditutup'; end if;
  if exists (select 1 from public.exam_sessions s where s.exam_id = e.id and s.member_id = v_me and s.status = 'selesai') then raise exception 'ujian sudah kamu kumpulkan'; end if;
  v_code := 'esl_' || replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.exam_launch_codes (code_hash, school_id, exam_id, member_id, expires_at)
    values (encode(sha256(convert_to(v_code, 'utf8')), 'hex'), e.school_id, e.id, v_me, now() + interval '5 minutes');
  return v_code;
end $$;
revoke all on function public.exam_issue_launch(uuid) from public, anon;
grant execute on function public.exam_issue_launch(uuid) to authenticated;

-- Sesi dari token. Token ditolak bila kedaluwarsa atau sesi selesai.
create function app_private.exam_session_of(p_token text) returns public.exam_sessions
language plpgsql security definer set search_path = '' as $$
declare s public.exam_sessions;
begin
  if p_token is null or p_token !~ '^esx_[0-9a-f]{64}$' then return null; end if;
  select * into s from public.exam_sessions where token_hash = encode(sha256(convert_to(p_token, 'utf8')), 'hex') and token_expires_at > now();
  return s;
end $$;
revoke all on function app_private.exam_session_of(text) from public, anon, authenticated;

-- Tukar kode peluncuran dengan token sesi. Token lama dicabut (sambung ulang aman).
create function public.exam_redeem(p_code text, p_platform text default null, p_app_version text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare lc public.exam_launch_codes; e public.exams; s public.exam_sessions; v_tok text;
begin
  if p_code is null or p_code !~ '^esl_[0-9a-f]{64}$' then raise exception 'kode tidak valid'; end if;
  update public.exam_launch_codes set used_at = now() where code_hash = encode(sha256(convert_to(p_code, 'utf8')), 'hex') and used_at is null and expires_at > now() returning * into lc;
  if lc.code_hash is null then raise exception 'kode tidak valid atau kedaluwarsa'; end if;
  select * into e from public.exams where id = lc.exam_id;
  if e.status <> 'terbit' or now() > e.ends_at then raise exception 'ujian sudah ditutup'; end if;
  insert into public.exam_sessions (school_id, exam_id, member_id) values (lc.school_id, lc.exam_id, lc.member_id) on conflict (exam_id, member_id) do nothing;
  select * into s from public.exam_sessions where exam_id = lc.exam_id and member_id = lc.member_id;
  if s.status = 'selesai' then raise exception 'ujian sudah dikumpulkan'; end if;
  v_tok := 'esx_' || replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  update public.exam_sessions set token_hash = encode(sha256(convert_to(v_tok, 'utf8')), 'hex'), token_expires_at = least(e.ends_at, now() + interval '12 hours') + interval '1 hour',
    platform = left(p_platform, 20), app_version = left(p_app_version, 30) where id = s.id;
  return jsonb_build_object('token', v_tok, 'status', s.status, 'now', now(), 'student', (select display_name from public.school_members where id = lc.member_id),
    'exam', jsonb_build_object('title', e.title, 'instructions', e.instructions, 'duration_minutes', e.duration_minutes, 'ends_at', e.ends_at,
      'secure_required', e.secure_required, 'on_violation', e.on_violation, 'max_violations', e.max_violations),
    'deadline_at', s.deadline_at, 'violations', s.violations);
end $$;

-- Mulai (atau lanjutkan) ujian setelah perangkat terkunci. p_lock = {secure: bool, ...}
create function public.exam_begin(p_token text, p_lock jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s public.exam_sessions; e public.exams; v_secure boolean := coalesce((p_lock->>'secure')::boolean, false); v_q jsonb; v_a jsonb;
begin
  s := app_private.exam_session_of(p_token);
  if s.id is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  select * into e from public.exams where id = s.exam_id;
  if s.status = 'selesai' then raise exception 'ujian sudah dikumpulkan'; end if;
  if s.status = 'dibekukan' then return jsonb_build_object('status', 'dibekukan', 'reason', s.frozen_reason); end if;
  if e.secure_required and not v_secure then raise exception 'ujian ini wajib memakai aplikasi ujian terkunci'; end if;
  if now() > e.ends_at then raise exception 'ujian sudah ditutup'; end if;
  if s.status = 'menunggu' then
    update public.exam_sessions set status = 'berjalan', started_at = now(), deadline_at = least(e.ends_at, now() + make_interval(mins => e.duration_minutes)), secure = v_secure
      where id = s.id returning * into s;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'kind', q.kind, 'prompt', q.prompt, 'options', q.options, 'points', q.points) order by q.position), '[]'::jsonb)
    into v_q from public.exam_questions q where q.exam_id = e.id;
  select coalesce(jsonb_object_agg(a.question_id::text, a.answer), '{}'::jsonb) into v_a from public.exam_answers a where a.session_id = s.id;
  return jsonb_build_object('status', s.status, 'now', now(), 'deadline_at', s.deadline_at, 'title', e.title, 'questions', v_q, 'answers', v_a, 'violations', s.violations);
end $$;

create function public.exam_save(p_token text, p_question uuid, p_answer jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s public.exam_sessions;
begin
  s := app_private.exam_session_of(p_token);
  if s.id is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  if s.status <> 'berjalan' then raise exception 'ujian tidak sedang berjalan (%)', s.status; end if;
  if now() > s.deadline_at + interval '15 seconds' then raise exception 'waktu habis'; end if;
  if not exists (select 1 from public.exam_questions q where q.id = p_question and q.exam_id = s.exam_id) then raise exception 'soal tidak ditemukan'; end if;
  insert into public.exam_answers (session_id, question_id, school_id, answer) values (s.id, p_question, s.school_id, p_answer)
    on conflict (session_id, question_id) do update set answer = excluded.answer, saved_at = now();
  return jsonb_build_object('ok', true, 'now', now(), 'deadline_at', s.deadline_at);
end $$;

-- Peristiwa integritas dari aplikasi. Kebijakan ujian menentukan pembekuan.
create function public.exam_event(p_token text, p_kind text, p_detail jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s public.exam_sessions; e public.exams; v_count boolean := p_kind not in ('info','jaringan_putus','jaringan_pulih');
begin
  s := app_private.exam_session_of(p_token);
  if s.id is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  if s.status in ('selesai') then return jsonb_build_object('status', s.status); end if;
  select * into e from public.exams where id = s.exam_id;
  insert into public.exam_events (school_id, session_id, kind, detail, counted) values (s.school_id, s.id, left(p_kind, 40), coalesce(p_detail, '{}'::jsonb), v_count);
  if v_count and s.status = 'berjalan' then
    update public.exam_sessions set violations = violations + 1 where id = s.id returning * into s;
    if e.on_violation = 'bekukan' and s.violations >= e.max_violations then
      update public.exam_sessions set status = 'dibekukan', frozen_reason = 'Pelanggaran melewati batas: ' || left(p_kind, 40) where id = s.id returning * into s;
    end if;
  end if;
  return jsonb_build_object('status', s.status, 'violations', s.violations, 'max', e.max_violations, 'on_violation', e.on_violation);
end $$;

create function public.exam_status(p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s public.exam_sessions;
begin
  s := app_private.exam_session_of(p_token);
  if s.id is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  return jsonb_build_object('status', s.status, 'now', now(), 'deadline_at', s.deadline_at, 'violations', s.violations, 'reason', s.frozen_reason);
end $$;

-- Kumpulkan: nilai otomatis untuk pilihan ganda, ganda, dan isian singkat; esai menunggu guru.
create function public.exam_submit(p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare s public.exam_sessions; v_max numeric; v_got numeric := 0; v_pending boolean := false; r record; v_ok boolean;
begin
  s := app_private.exam_session_of(p_token);
  if s.id is null then raise exception 'token tidak valid' using errcode = '28000'; end if;
  if s.status = 'selesai' then return jsonb_build_object('status', 'selesai', 'score', s.score, 'manual_pending', s.manual_pending); end if;
  if s.status <> 'berjalan' then raise exception 'ujian tidak sedang berjalan (%)', s.status; end if;
  select coalesce(sum(points), 0) into v_max from public.exam_questions where exam_id = s.exam_id;
  for r in select q.id, q.kind, q.points, k.answer as key, a.answer as given
           from public.exam_questions q left join public.exam_answer_keys k on k.question_id = q.id left join public.exam_answers a on a.question_id = q.id and a.session_id = s.id
           where q.exam_id = s.exam_id
  loop
    if r.kind = 'essay' then v_pending := true; continue; end if;
    if r.given is null or r.key is null then continue; end if;
    if r.kind = 'mcq' then v_ok := (r.given = r.key);
    elsif r.kind = 'multi' then v_ok := (select coalesce(array_agg(x order by x), '{}') from jsonb_array_elements_text(r.given) x) = (select coalesce(array_agg(x order by x), '{}') from jsonb_array_elements_text(r.key) x);
    else v_ok := exists (select 1 from jsonb_array_elements_text(r.key) k where lower(btrim(k)) = lower(btrim(r.given #>> '{}')));
    end if;
    if v_ok then v_got := v_got + r.points; end if;
  end loop;
  update public.exam_sessions set status = 'selesai', submitted_at = now(), manual_pending = v_pending,
    score = case when v_max > 0 then round(v_got / v_max * 100, 2) else 0 end, token_expires_at = now() where id = s.id returning * into s;
  return jsonb_build_object('status', 'selesai', 'score', s.score, 'manual_pending', v_pending);
end $$;

-- Pengawas/guru melanjutkan siswa yang dibekukan (dengan tambahan waktu opsional).
create function public.exam_unfreeze(p_session uuid, p_extra_minutes int default 0) returns void
language plpgsql security definer set search_path = '' as $$
declare s public.exam_sessions; e public.exams;
begin
  select * into s from public.exam_sessions where id = p_session;
  select * into e from public.exams where id = s.exam_id;
  if s.id is null or not app_private.can_manage_exam(e.school_id, e.created_by) then raise exception 'tidak berhak'; end if;
  if s.status <> 'dibekukan' then return; end if;
  update public.exam_sessions set status = 'berjalan', frozen_reason = null, violations = 0,
    deadline_at = least(e.ends_at + make_interval(mins => greatest(p_extra_minutes, 0)), coalesce(deadline_at, now()) + make_interval(mins => greatest(least(p_extra_minutes, 60), 0))) where id = p_session;
  insert into public.exam_events (school_id, session_id, kind, detail, counted) values (s.school_id, s.id, 'dilanjutkan_pengawas', jsonb_build_object('extra', p_extra_minutes), false);
end $$;

do $$
declare f text;
begin
  foreach f in array array['exam_redeem(text,text,text)','exam_begin(text,jsonb)','exam_save(text,uuid,jsonb)','exam_event(text,text,jsonb)','exam_status(text)','exam_submit(text)']
  loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
  revoke all on function public.exam_unfreeze(uuid, int) from public, anon;
  grant execute on function public.exam_unfreeze(uuid, int) to authenticated;
end $$;
comment on function public.exam_begin(text, jsonb) is 'SECURITY DEFINER dan dapat dipanggil anon DISENGAJA: aplikasi ujian tidak punya sesi cookie; semua fungsi exam_* memverifikasi token sesi ujian (hash, berumur pendek) dan tidak pernah mengirim kunci jawaban.';
