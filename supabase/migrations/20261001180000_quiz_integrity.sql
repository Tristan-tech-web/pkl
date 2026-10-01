-- Integritas untuk kuis jalur belajar: waktu mulai dicatat server (quiz_begin), lalu diperiksa setelah kirim (quiz_integrity_check).
-- Kasus memakai tabel integrity_cases yang sama (attempt_id menggantikan session_id), jadi antrean, banding, dan keputusan guru sama.
create table public.quiz_starts (
  member_id uuid not null,
  node_id uuid not null,
  school_id uuid not null,
  started_at timestamptz not null default now(),
  primary key (member_id, node_id),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
alter table public.quiz_starts enable row level security;
revoke all on public.quiz_starts from anon;
create policy qs_select on public.quiz_starts for select to authenticated using (member_id = app_private.my_member_id(school_id));

alter table public.integrity_cases alter column session_id drop not null;
alter table public.integrity_cases add column attempt_id uuid references public.quiz_attempts (id) on delete cascade;
create unique index integrity_cases_attempt_uq on public.integrity_cases (attempt_id) where attempt_id is not null;
alter table public.integrity_cases add constraint integrity_cases_src_chk check (session_id is not null or attempt_id is not null);

create function public.quiz_begin(p_school uuid, p_node uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_member uuid := app_private.my_member_id(p_school);
begin
  if v_member is null then raise exception 'bukan anggota'; end if;
  insert into public.quiz_starts (member_id, node_id, school_id, started_at) values (v_member, p_node, p_school, now())
    on conflict (member_id, node_id) do update set started_at = now();
end $$;

create function public.quiz_integrity_check(p_school uuid, p_node uuid, p_blurs int default 0) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_member uuid := app_private.my_member_id(p_school); a public.quiz_attempts; cfg public.school_integrity; v_start timestamptz;
  n int; el numeric; beh int := 0; kinds int := 0; sig jsonb := '[]'::jsonb; v_level text; v_rev int := 0; v_pen int := 0; v_cap_left int; v_id uuid;
begin
  if v_member is null then raise exception 'bukan anggota'; end if;
  select * into a from public.quiz_attempts where member_id = v_member and node_id = p_node and created_at > now() - interval '10 minutes' order by created_at desc limit 1;
  if not found or exists (select 1 from public.integrity_cases where attempt_id = a.id) then return null; end if;
  cfg := app_private.integrity_cfg(p_school);
  if not cfg.enabled or exists (select 1 from public.integrity_exempt e where e.member_id = v_member) then return jsonb_build_object('level', 'rendah'); end if;
  select started_at into v_start from public.quiz_starts where member_id = v_member and node_id = p_node;
  select count(*) into n from public.quiz_questions where node_id = p_node;
  if v_start is not null and n >= 3 then
    el := extract(epoch from (a.created_at - v_start));
    if el >= 0 and el < n * 2.5 then beh := beh + 40; kinds := kinds + 1; sig := sig || jsonb_build_array(jsonb_build_object('type','kuis_terlalu_cepat','value',round(el),'of',n));
    elsif el >= 0 and el < n * 5 and a.score = 100 then beh := beh + 25; kinds := kinds + 1; sig := sig || jsonb_build_array(jsonb_build_object('type','sempurna_cepat','value',round(el),'of',n)); end if;
  end if;
  if p_blurs >= 8 then beh := beh + 35; kinds := kinds + 1; sig := sig || jsonb_build_array(jsonb_build_object('type','pindah_tab','value',p_blurs));
  elsif p_blurs >= 3 then beh := beh + 20; kinds := kinds + 1; sig := sig || jsonb_build_array(jsonb_build_object('type','pindah_tab','value',p_blurs)); end if;
  beh := least(100, beh);
  if beh >= cfg.penalty_threshold and kinds >= 2 then v_level := 'tinggi';
  elsif beh >= cfg.hold_threshold then v_level := 'sedang';
  else return jsonb_build_object('level', 'rendah', 'score', beh); end if;
  if a.xp_awarded = 0 and v_level = 'sedang' then return jsonb_build_object('level', 'rendah', 'score', beh); end if;
  if a.xp_awarded > 0 then v_rev := -app_private.xp_adjust(p_school, v_member, -a.xp_awarded, 'tahan'); end if;
  if v_level = 'tinggi' and v_rev > 0 then
    select cfg.daily_penalty_cap + coalesce(sum(amount), 0) into v_cap_left from public.xp_events
      where member_id = v_member and reason = 'denda' and (created_at at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date;
    v_pen := -app_private.xp_adjust(p_school, v_member, -least(v_rev, greatest(0, v_cap_left)), 'denda');
  end if;
  insert into public.integrity_cases (school_id, member_id, attempt_id, score, level, signals, xp_reversed, xp_penalty, status)
    values (p_school, v_member, a.id, beh, v_level, sig, v_rev, v_pen, case when v_level = 'tinggi' then 'dibatalkan' else 'ditahan' end) returning id into v_id;
  return jsonb_build_object('level', v_level, 'score', beh, 'case_id', v_id, 'xp_reversed', v_rev, 'xp_penalty', v_pen);
end $$;
revoke execute on function public.quiz_begin(uuid, uuid), public.quiz_integrity_check(uuid, uuid, int) from public, anon;
grant execute on function public.quiz_begin(uuid, uuid), public.quiz_integrity_check(uuid, uuid, int) to authenticated;
