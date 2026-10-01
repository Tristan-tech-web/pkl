-- Tes pencapaian dan liga: lencana otomatis dari server, liga hanya rombel sendiri dengan nama disingkat.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); us1 uuid := gen_random_uuid(); us2 uuid := gen_random_uuid(); us3 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; subj uuid; c1 uuid; c2 uuid; n1 uuid; q1 uuid; r_s uuid; ms1 uuid; ms2 uuid; ms3 uuid; res jsonb; n int;
begin
  insert into auth.users (id, email) values (uo,'o@lg.local'),(us1,'s1@lg.local'),(us2,'s2@lg.local'),(us3,'s3@lg.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah LG', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-2', 10) returning id into c2;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, position, xp_reward) values (sa, subj, 10, 'A', 'Dasar', 1, 100) returning id into n1;
  insert into public.quiz_questions (school_id, node_id, kind, prompt, options, position) values (sa, n1, 'mcq', '1 + 1 = ?', '["1","2"]', 1) returning id into q1;
  insert into public.quiz_answer_keys (school_id, question_id, answer, explanation) values (sa, q1, '1', 'Dua.');
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us1, r_s, 'Ayu Lestari') returning id into ms1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Budi Santoso') returning id into ms2;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us3, r_s, 'Citra Dewi') returning id into ms3;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms1), (sa, c1, ms2), (sa, c2, ms3);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  res := public.submit_quiz(n1, json_build_object(q1::text, 1)::jsonb);
  perform pg_temp.chk('kuis sempurna dinilai', (res->>'score')::int = 100);
  perform pg_temp.chk('lencana langkah pertama dan sempurna diberikan otomatis', (select count(*) from public.member_achievements where code in ('first_quiz','perfect')) = 2);
  perform pg_temp.chk('lencana lain belum diberikan', (select count(*) from public.member_achievements) = 2);
  begin
    insert into public.member_achievements (member_id, school_id, code) values (ms1, sa, 'level_5');
    perform pg_temp.chk('siswa tidak bisa memberi lencana sendiri', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa memberi lencana sendiri', true, sqlerrm); end;

  select count(*) into n from public.weekly_league(sa);
  perform pg_temp.chk('liga menampilkan teman sekelas saja (2 siswa)', n = 2);
  perform pg_temp.chk('peringkat 1 adalah saya dengan XP pekan ini', (select label from public.weekly_league(sa) where rank = 1) = 'Ayu L.' and (select is_me from public.weekly_league(sa) where rank = 1) and (select xp from public.weekly_league(sa) where rank = 1) > 0);
  perform pg_temp.chk('nama teman disingkat (tanpa nama belakang lengkap)', exists (select 1 from public.weekly_league(sa) where label = 'Budi S.') and not exists (select 1 from public.weekly_league(sa) where label like '%Santoso%'));
  perform pg_temp.chk('siswa tidak bisa meminta liga rombel lain', (select count(*) from public.weekly_league(sa, c2)) = 0);
  perform pg_temp.chk('siswa tidak melihat lencana teman', (select count(*) from public.member_achievements where member_id = ms2) = 0);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us3, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('liga siswa X-2 hanya dirinya', (select count(*) from public.weekly_league(sa)) = 1);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('staf melihat liga rombel X-1', (select count(*) from public.weekly_league(sa, c1)) = 2);
  perform pg_temp.chk('staf membaca lencana siswa', (select count(*) from public.member_achievements) = 2);

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
