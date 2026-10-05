-- Tahap 2 data uji SMK TI Bali Global Badung: menyalin unit "Fungsi Kuadrat" (Matematika) dari sekolah demo SMK Nusantara Contoh,
-- lalu memberi progres dan XP murid kelas X. Jalankan SETELAH bali_global_badung.sql. Aman dijalankan ulang.
do $$
declare src uuid; dst uuid; src_subj uuid; dst_subj uuid;
begin
  select id into src from public.schools where name='SMK Nusantara Contoh';
  select id into dst from public.schools where name='SMK TI Bali Global Badung';
  select id into src_subj from public.school_subjects where school_id=src and code='MAT';
  select id into dst_subj from public.school_subjects where school_id=dst and code='MAT';
  if exists (select 1 from public.competency_nodes where school_id=dst) then return; end if;
  create temp table nmap (old_id uuid primary key, new_id uuid default gen_random_uuid()) on commit drop;
  insert into nmap (old_id) select id from public.competency_nodes where school_id=src and subject_id=src_subj;
  insert into public.competency_nodes (id, school_id, subject_id, grade, code, title, summary, kind, position, xp_reward, estimated_minutes)
  select m.new_id, dst, dst_subj, n.grade, n.code, n.title, n.summary, n.kind, n.position, n.xp_reward, n.estimated_minutes from public.competency_nodes n join nmap m on m.old_id=n.id;
  insert into public.competency_prerequisites (school_id, node_id, requires_id)
  select dst, a.new_id, b.new_id from public.competency_prerequisites p join nmap a on a.old_id=p.node_id join nmap b on b.old_id=p.requires_id where p.school_id=src;
  insert into public.lessons (node_id, school_id, objectives, visual_module, body_md)
  select m.new_id, dst, l.objectives, l.visual_module, l.body_md from public.lessons l join nmap m on m.old_id=l.node_id;
  create temp table qmap (old_id uuid primary key, new_id uuid default gen_random_uuid()) on commit drop;
  insert into qmap (old_id) select q.id from public.quiz_questions q join nmap m on m.old_id=q.node_id;
  insert into public.quiz_questions (id, school_id, node_id, kind, prompt, options, difficulty, position)
  select qm.new_id, dst, nm.new_id, q.kind, q.prompt, q.options, q.difficulty, q.position from public.quiz_questions q join qmap qm on qm.old_id=q.id join nmap nm on nm.old_id=q.node_id;
  insert into public.quiz_answer_keys (question_id, school_id, answer, explanation)
  select qm.new_id, dst, k.answer, k.explanation from public.quiz_answer_keys k join qmap qm on qm.old_id=k.question_id;

  insert into public.node_progress (node_id, member_id, school_id, best_score, stars, attempts, completed_at, updated_at)
  select n.id, cgs.member_id, dst, 60 + abs(hashtext(cgs.member_id::text || n.code)) % 41, 0, 1 + abs(hashtext(n.code || cgs.member_id::text)) % 3, now() - ((abs(hashtext(cgs.member_id::text)) % 96) || ' hours')::interval, now()
  from public.competency_nodes n
  join public.class_groups g on g.school_id = dst and g.grade = 10
  join public.class_group_students cgs on cgs.class_group_id = g.id
  where n.school_id = dst and ((n.code = 'FK-1' and abs(hashtext(cgs.member_id::text)) % 100 < 75) or (n.code = 'FK-2' and abs(hashtext(cgs.member_id::text)) % 100 < 40));
  update public.node_progress set stars = case when best_score >= 90 then 3 when best_score >= 75 then 2 else 1 end where school_id = dst;
  insert into public.xp_events (school_id, member_id, amount, reason, node_id, created_at)
  select dst, p.member_id, 40 + (p.best_score / 10) * 5, 'kuis', p.node_id, p.completed_at from public.node_progress p where p.school_id = dst;
end $$;
