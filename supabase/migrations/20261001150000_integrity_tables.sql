-- Integritas latihan (C4): kebijakan sekolah, skor risiko dari sinyal perilaku (+ kamera di perangkat, opsional), buku besar XP,
-- tahan/batalkan/denda berbatas, banding, pengecualian (akomodasi), dan antrean guru. Kamera saja tidak pernah cukup untuk mengurangi XP.
alter table public.practice_sessions add column camera boolean not null default false, add column risk int, add column evaluated_at timestamptz;

create table public.school_integrity (
  school_id uuid primary key references public.schools (id) on delete cascade,
  enabled boolean not null default true,
  camera_mode text not null default 'off' check (camera_mode in ('off','optional')),
  parental_consent_confirmed boolean not null default false,
  hold_threshold int not null default 40 check (hold_threshold between 10 and 90),
  penalty_threshold int not null default 70 check (penalty_threshold between 30 and 100),
  daily_penalty_cap int not null default 100 check (daily_penalty_cap between 0 and 500),
  updated_at timestamptz not null default now()
);
create table public.integrity_exempt (
  school_id uuid not null,
  member_id uuid not null,
  reason text check (reason is null or char_length(reason) <= 200),
  created_by uuid,
  created_at timestamptz not null default now(),
  primary key (member_id),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create table public.integrity_cases (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  member_id uuid not null,
  session_id uuid not null unique references public.practice_sessions (id) on delete cascade,
  score int not null,
  level text not null check (level in ('sedang','tinggi')),
  signals jsonb not null default '[]'::jsonb,
  xp_reversed int not null default 0,
  xp_penalty int not null default 0,
  status text not null default 'ditahan' check (status in ('ditahan','dibatalkan','banding','dibebaskan','dikukuhkan')),
  appeal_text text check (appeal_text is null or char_length(appeal_text) <= 600),
  appeal_at timestamptz,
  decided_by uuid,
  decided_at timestamptz,
  note text check (note is null or char_length(note) <= 300),
  created_at timestamptz not null default now(),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.integrity_cases (school_id, status, created_at desc);
alter table public.school_integrity enable row level security;
alter table public.integrity_exempt enable row level security;
alter table public.integrity_cases enable row level security;
revoke all on public.school_integrity, public.integrity_exempt, public.integrity_cases from anon;
create policy si_select on public.school_integrity for select to authenticated using (app_private.is_member(school_id));
create policy si_write on public.school_integrity for all to authenticated using (app_private.has_capability(school_id, 'school.manage')) with check (app_private.has_capability(school_id, 'school.manage'));
create policy ie_select on public.integrity_exempt for select to authenticated using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));
create policy ie_write on public.integrity_exempt for all to authenticated using (app_private.has_capability(school_id, 'content.author')) with check (app_private.has_capability(school_id, 'content.author'));
create policy ic_select on public.integrity_cases for select to authenticated using (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read'));

-- Buku besar: semua perubahan XP lewat sini (tidak pernah di bawah 0), tercatat di xp_events dengan alasan.
create function app_private.xp_adjust(p_school uuid, p_member uuid, p_amount int, p_reason text) returns int
language plpgsql security definer set search_path = '' as $$
declare v_cur int; v_new int; v_applied int;
begin
  select xp into v_cur from public.student_stats where member_id = p_member for update;
  if not found then return 0; end if;
  v_new := greatest(0, v_cur + p_amount);
  v_applied := v_new - v_cur;
  update public.student_stats set xp = v_new, level = app_private.level_for_xp(v_new) where member_id = p_member;
  if v_applied <> 0 then insert into public.xp_events (school_id, member_id, amount, reason) values (p_school, p_member, v_applied, p_reason); end if;
  return v_applied;
end $$;

create function app_private.integrity_cfg(p_school uuid) returns public.school_integrity
language sql stable security definer set search_path = '' as $$
  select coalesce((select si from public.school_integrity si where si.school_id = p_school), row(p_school, true, 'off', false, 40, 70, 100, now())::public.school_integrity)
$$;

-- Skor risiko 0..100 dari jawaban sesi. Perilaku selalu dihitung; kamera hanya menambah (maks +25) bila perilaku sudah menunjukkan sinyal.
create function app_private.integrity_score(p_session uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  n int; n_fast int; n_ok int; n_ok_fast int; blurs int; avg_ms numeric; sd_ms numeric; noface numeric; multi int;
  beh int := 0; cam int := 0; sig jsonb := '[]'::jsonb; kinds int := 0; v_camera boolean;
begin
  select camera into v_camera from public.practice_sessions where id = p_session;
  select count(*), count(*) filter (where 'terlalu_cepat' = any(flags) or ms < 1500), count(*) filter (where correct), count(*) filter (where correct and 'terlalu_cepat' = any(flags)),
         coalesce(sum(nullif(meta->>'blurs','')::int), 0), coalesce(avg(ms), 0), coalesce(stddev_pop(ms), 0),
         coalesce(sum(nullif(meta->'cam'->>'noface_ms','')::numeric), 0) / 1000, coalesce(sum(nullif(meta->'cam'->>'multi','')::int), 0)
    into n, n_fast, n_ok, n_ok_fast, blurs, avg_ms, sd_ms, noface, multi
  from public.practice_answers where session_id = p_session and answered_at is not null;
  if n < 5 then return jsonb_build_object('score', 0, 'signals', '[]'::jsonb, 'kinds', 0); end if;
  if n_fast::numeric / n >= 0.5 then beh := beh + 35; kinds := kinds + 1; sig := sig || jsonb_build_array(jsonb_build_object('type','jawab_terlalu_cepat','value',n_fast,'of',n));
  elsif n_fast::numeric / n >= 0.3 then beh := beh + 15; sig := sig || jsonb_build_array(jsonb_build_object('type','jawab_cepat','value',n_fast,'of',n)); end if;
  if blurs >= 8 then beh := beh + 35; kinds := kinds + 1; sig := sig || jsonb_build_array(jsonb_build_object('type','pindah_tab','value',blurs));
  elsif blurs >= 3 then beh := beh + 20; kinds := kinds + 1; sig := sig || jsonb_build_array(jsonb_build_object('type','pindah_tab','value',blurs)); end if;
  if n >= 6 and avg_ms > 0 and sd_ms / avg_ms < 0.08 then beh := beh + 30; kinds := kinds + 1; sig := sig || jsonb_build_array(jsonb_build_object('type','waktu_seragam','value',round(sd_ms / avg_ms, 3))); end if;
  if n >= 6 and n_ok::numeric / n >= 0.9 and n_ok_fast::numeric / greatest(n_ok, 1) >= 0.6 then beh := beh + 25; kinds := kinds + 1; sig := sig || jsonb_build_array(jsonb_build_object('type','benar_semua_terlalu_cepat','value',n_ok_fast,'of',n_ok)); end if;
  beh := least(100, beh);
  if v_camera then
    if noface >= 20 then cam := cam + 15; sig := sig || jsonb_build_array(jsonb_build_object('type','kamera_tanpa_wajah','value',round(noface))); end if;
    if multi >= 2 then cam := cam + 20; sig := sig || jsonb_build_array(jsonb_build_object('type','kamera_banyak_wajah','value',multi)); end if;
    cam := least(25, cam);
    if beh < 20 then cam := 0; end if;   -- kamera saja tidak pernah cukup
  end if;
  return jsonb_build_object('score', least(100, beh + cam), 'behavior', beh, 'camera', cam, 'signals', sig, 'kinds', kinds);
end $$;

-- Dipanggil sekali per sesi (idempoten): menahan XP sesi (sedang) atau membatalkannya dan mendenda berbatas (tinggi).
create function app_private.integrity_evaluate(p_session uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  s public.practice_sessions; cfg public.school_integrity; sc jsonb; v_score int; v_level text; v_xp int; v_rev int := 0; v_pen int := 0; v_id uuid; v_cap_left int; v_cur int;
begin
  select * into s from public.practice_sessions where id = p_session for update;
  if not found or s.evaluated_at is not null then return null; end if;
  cfg := app_private.integrity_cfg(s.school_id);
  sc := app_private.integrity_score(p_session);
  v_score := (sc->>'score')::int;
  update public.practice_sessions set evaluated_at = now(), risk = v_score where id = p_session;
  if not cfg.enabled or exists (select 1 from public.integrity_exempt e where e.member_id = s.member_id) then return jsonb_build_object('level', 'rendah', 'score', v_score); end if;
  if v_score >= cfg.penalty_threshold and (sc->>'kinds')::int >= 2 then v_level := 'tinggi';
  elsif v_score >= cfg.hold_threshold then v_level := 'sedang';
  else return jsonb_build_object('level', 'rendah', 'score', v_score); end if;
  select coalesce(sum(xp), 0) into v_xp from public.practice_answers where session_id = p_session;
  if v_xp = 0 and v_level = 'sedang' then return jsonb_build_object('level', 'rendah', 'score', v_score); end if;
  if v_xp > 0 then v_rev := -app_private.xp_adjust(s.school_id, s.member_id, -v_xp, 'tahan'); end if;
  if v_level = 'tinggi' and v_rev > 0 then
    select cfg.daily_penalty_cap + coalesce(sum(amount), 0) into v_cap_left from public.xp_events
      where member_id = s.member_id and reason = 'denda' and (created_at at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date;
    v_pen := -app_private.xp_adjust(s.school_id, s.member_id, -least(v_rev, greatest(0, v_cap_left)), 'denda');
  end if;
  insert into public.integrity_cases (school_id, member_id, session_id, score, level, signals, xp_reversed, xp_penalty, status)
    values (s.school_id, s.member_id, p_session, v_score, v_level, sc->'signals', v_rev, v_pen, case when v_level = 'tinggi' then 'dibatalkan' else 'ditahan' end) returning id into v_id;
  return jsonb_build_object('level', v_level, 'score', v_score, 'case_id', v_id, 'xp_reversed', v_rev, 'xp_penalty', v_pen);
end $$;

create function public.integrity_appeal(p_case uuid, p_text text) returns void
language plpgsql security definer set search_path = '' as $$
declare c public.integrity_cases;
begin
  select * into c from public.integrity_cases where id = p_case for update;
  if not found or c.member_id is distinct from app_private.my_member_id(c.school_id) then raise exception 'bukan kasus Anda'; end if;
  if c.status not in ('ditahan','dibatalkan') then raise exception 'kasus sudah diputuskan'; end if;
  if char_length(coalesce(trim(p_text), '')) < 5 then raise exception 'tulis alasan banding'; end if;
  update public.integrity_cases set status = 'banding', appeal_text = left(trim(p_text), 600), appeal_at = now() where id = p_case;
end $$;

create function public.integrity_decide(p_case uuid, p_decision text, p_note text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare c public.integrity_cases; v_me uuid;
begin
  select * into c from public.integrity_cases where id = p_case for update;
  if not found or not app_private.has_capability(c.school_id, 'content.author') then raise exception 'tidak berwenang'; end if;
  if c.status not in ('ditahan','dibatalkan','banding') then raise exception 'kasus sudah diputuskan'; end if;
  v_me := app_private.my_member_id(c.school_id);
  if p_decision = 'bebaskan' then
    perform app_private.xp_adjust(c.school_id, c.member_id, c.xp_reversed + c.xp_penalty, 'bebas');
    update public.integrity_cases set status = 'dibebaskan', decided_by = v_me, decided_at = now(), note = left(p_note, 300) where id = p_case;
  elsif p_decision = 'kukuhkan' then
    update public.integrity_cases set status = 'dikukuhkan', decided_by = v_me, decided_at = now(), note = left(p_note, 300) where id = p_case;
  else raise exception 'keputusan tidak dikenal'; end if;
end $$;

revoke execute on function public.integrity_appeal(uuid, text), public.integrity_decide(uuid, text, text) from public, anon;
grant execute on function public.integrity_appeal(uuid, text), public.integrity_decide(uuid, text, text) to authenticated;
revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;
