create or replace function public.practice_next(p_session uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  s public.practice_sessions; v_member uuid; ab numeric; it public.bank_items; v_pending uuid; v_due_used int;
begin
  select * into s from public.practice_sessions where id = p_session;
  if not found then raise exception 'sesi tidak ada'; end if;
  v_member := app_private.my_member_id(s.school_id);
  if v_member is distinct from s.member_id then raise exception 'bukan sesi Anda'; end if;
  if s.answered >= s.target then return jsonb_build_object('done', true, 'answered', s.answered, 'total', s.target, 'xp', s.xp, 'integrity', app_private.integrity_evaluate(p_session)); end if;
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
      return jsonb_build_object('done', true, 'answered', s.answered, 'total', s.target, 'xp', s.xp, 'empty', true, 'integrity', app_private.integrity_evaluate(p_session));
    end if;
    insert into public.practice_answers (session_id, school_id, member_id, item_id) values (p_session, s.school_id, v_member, it.id);
  end if;
  return jsonb_build_object('done', false, 'index', s.answered + 1, 'total', s.target, 'xp', s.xp,
    'item', jsonb_build_object('id', it.id, 'stem', it.stem, 'options', it.options, 'bloom', it.bloom));
end $$;


create or replace function public.practice_answer(p_session uuid, p_item uuid, p_choice int, p_meta jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  s public.practice_sessions; v_member uuid; a public.practice_answers; it public.bank_items; k public.bank_keys;
  bp public.bank_progress; v_ms int; v_ok boolean; v_xp numeric; v_flags text[] := '{}'; v_min int; v_prior int; v_today_xp int;
  v_ab numeric; v_exp numeric; v_box int; v_stats public.student_stats; v_streak int; v_today date := (now() at time zone 'Asia/Jakarta')::date; v_int jsonb;
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
    if v_ms < v_min then v_flags := array_append(v_flags, 'terlalu_cepat'); v_xp := 0; end if;
    select count(*) into v_prior from public.practice_answers pa
      where pa.member_id = v_member and pa.item_id = p_item and pa.correct and pa.answered_at > now() - interval '7 days' and pa.session_id <> p_session;
    if v_prior > 0 then v_flags := array_append(v_flags, 'ulang_cepat'); v_xp := v_xp * power(0.5, v_prior); end if;
    select * into bp from public.bank_progress where member_id = v_member and item_id = p_item;
    if found and bp.last_correct is false then v_flags := array_append(v_flags, 'bangkit'); v_xp := v_xp * 1.5; end if;
    if found and bp.box > 0 and bp.due_at > now() then v_flags := array_append(v_flags, 'belum_waktunya'); v_xp := v_xp * 0.5; end if;
    select coalesce(sum(pa.xp), 0) into v_today_xp from public.practice_answers pa
      where pa.member_id = v_member and (pa.answered_at at time zone 'Asia/Jakarta')::date = v_today;
    if v_today_xp >= 300 then v_flags := array_append(v_flags, 'batas_harian'); v_xp := 0; end if;
  end if;
  v_xp := floor(v_xp);

  update public.practice_answers set answered_at = now(), choice = p_choice, correct = v_ok, ms = v_ms, xp = v_xp::int, flags = v_flags,
    meta = coalesce(p_meta, '{}'::jsonb) where id = a.id;
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
  if s.answered >= s.target then v_int := app_private.integrity_evaluate(p_session); end if;
  return jsonb_build_object('integrity', v_int, 'correct', v_ok, 'answer', k.answer, 'explanation', k.explanation, 'xp', v_xp::int, 'flags', v_flags,
    'session_xp', s.xp, 'answered', s.answered, 'total', s.target, 'done', s.answered >= s.target);
end $$;


