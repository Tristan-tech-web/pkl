-- Tes integritas latihan: skor risiko, tahan/batal/denda berbatas, banding, keputusan guru, pengecualian, kamera tidak cukup sendirian, kebijakan sekolah.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
create function pg_temp.sess(p_sa uuid, p_subj uuid, p_user uuid, p_slow int, p_fast int, p_blurs int, p_camera boolean default false, p_cam jsonb default null) returns jsonb
language plpgsql as $$
declare sess uuid; nx jsonb; i int; res jsonb; meta jsonb; item uuid;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sess := public.practice_open(p_sa, p_subj, p_slow + p_fast, p_camera);
  for i in 1..(p_slow + p_fast) loop
    nx := public.practice_next(sess);
    exit when (nx->>'done')::boolean;
    item := (nx->'item'->>'id')::uuid;
    if i <= p_slow then
      execute 'reset role';
      update public.practice_answers set served_at = now() - (20 + i * 7) * interval '1 second' where session_id = sess and answered_at is null;
      perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
      execute 'set local role authenticated';
    end if;
    meta := jsonb_build_object('blurs', case when i = 1 then p_blurs else 0 end);
    if p_cam is not null then meta := meta || jsonb_build_object('cam', p_cam); end if;
    res := public.practice_answer(sess, item, 0, meta);
  end loop;
  execute 'reset role';
  return jsonb_build_object('session', sess, 'integrity', coalesce(res->'integrity', 'null'::jsonb));
end $$;
grant execute on function pg_temp.sess(uuid, uuid, uuid, int, int, int, boolean, jsonb) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); u1 uuid := gen_random_uuid(); u2 uuid := gen_random_uuid(); u3 uuid := gen_random_uuid(); u4 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; c1 uuid; subj uuid; r_t uuid; r_s uuid; mt uuid; m1 uuid; m2 uuid; m3 uuid; m4 uuid; it uuid; k int;
  r jsonb; cs public.integrity_cases; xp0 int; xp1 int; earned int;
begin
  insert into auth.users (id, email) values (uo,'o@ig.local'),(ut,'t@ig.local'),(u1,'s1@ig.local'),(u2,'s2@ig.local'),(u3,'s3@ig.local'),(u4,'s4@ig.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah IG', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select r.id into r_t from public.roles r where r.school_id = sa and r.code = 'teacher';
  select r.id into r_s from public.roles r where r.school_id = sa and r.code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Guru') returning id into mt;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, u1, r_s, 'S1') returning id into m1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, u2, r_s, 'S2') returning id into m2;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, u3, r_s, 'S3') returning id into m3;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, u4, r_s, 'S4') returning id into m4;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, m1), (sa, c1, m2), (sa, c1, m3), (sa, c1, m4);
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;
  for k in 1..10 loop
    insert into public.bank_items (school_id, subject_id, stem, options, status) values (sa, subj, 'Soal integritas nomor ' || k || ' yang cukup panjang?', '["a","b","c"]', 'siap') returning id into it;
    insert into public.bank_keys (item_id, school_id, answer, explanation) values (it, sa, 0, 'a benar');
  end loop;
  insert into public.student_stats (member_id, school_id, xp, level) values (m1, sa, 100, 1), (m2, sa, 100, 1), (m3, sa, 100, 1), (m4, sa, 100, 1);

  -- 1) perilaku mencurigakan berlapis (separuh terlalu cepat + 9 kali pindah tab) → tinggi
  r := pg_temp.sess(sa, subj, u1, 4, 4, 9);
  select * into cs from public.integrity_cases where member_id = m1;
  perform pg_temp.chk('tinggi: kasus dibatalkan tercatat', cs.status = 'dibatalkan' and cs.level = 'tinggi' and cs.score >= 70, r::text);
  earned := cs.xp_reversed;
  perform pg_temp.chk('tinggi: XP sesi dibatalkan dan didenda sebesar yang diperoleh (tidak lebih)', earned > 0 and cs.xp_penalty = earned, cs.xp_reversed || '/' || cs.xp_penalty);
  perform pg_temp.chk('tinggi: XP akhir = awal dikurangi denda (XP sesi sudah ditarik)', (select xp from public.student_stats where member_id = m1) = 100 - earned);
  perform pg_temp.chk('buku besar mencatat tahan dan denda', (select count(*) from public.xp_events where member_id = m1 and reason in ('tahan','denda')) = 2);
  -- 2) banding oleh siswa, lalu guru membebaskan → XP penuh kembali
  perform set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin perform public.integrity_appeal(cs.id, 'bukan kasus saya'); perform pg_temp.chk('siswa lain tak bisa banding kasus orang', false);
  exception when others then perform pg_temp.chk('siswa lain tak bisa banding kasus orang', sqlerrm like '%bukan kasus%', sqlerrm); end;
  perform pg_temp.chk('siswa lain tak melihat kasus orang', (select count(*) from public.integrity_cases) = 0);
  perform set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  begin perform public.integrity_appeal(cs.id, 'ya'); perform pg_temp.chk('banding tanpa alasan ditolak', false);
  exception when others then perform pg_temp.chk('banding tanpa alasan ditolak', true); end;
  perform public.integrity_appeal(cs.id, 'Saya sedang membuka kamus untuk bahasa soal');
  begin perform public.integrity_decide(cs.id, 'bebaskan', 'sendiri'); perform pg_temp.chk('siswa tak bisa memutuskan', false);
  exception when others then perform pg_temp.chk('siswa tak bisa memutuskan', sqlerrm like '%berwenang%', sqlerrm); end;
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  perform pg_temp.chk('guru melihat kasus berstatus banding', (select status from public.integrity_cases where id = cs.id) = 'banding');
  perform public.integrity_decide(cs.id, 'bebaskan', 'Alasan masuk akal');
  execute 'reset role';
  perform pg_temp.chk('banding diterima: XP kembali penuh', (select xp from public.student_stats where member_id = m1) = 100 + earned and (select status from public.integrity_cases where id = cs.id) = 'dibebaskan');
  begin perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true); execute 'set local role authenticated'; perform public.integrity_decide(cs.id, 'kukuhkan'); perform pg_temp.chk('kasus selesai tak bisa diputuskan lagi', false);
  exception when others then perform pg_temp.chk('kasus selesai tak bisa diputuskan lagi', sqlerrm like '%sudah diputuskan%', sqlerrm); end;
  execute 'reset role';

  -- 3) sedang: satu jenis sinyal → XP ditahan, tanpa denda; guru mengukuhkan → tetap ditahan
  r := pg_temp.sess(sa, subj, u2, 5, 3, 9);
  select * into cs from public.integrity_cases where member_id = m2;
  perform pg_temp.chk('sedang: ditahan tanpa denda', cs.level = 'sedang' and cs.status = 'ditahan' and cs.xp_penalty = 0 and cs.xp_reversed > 0, to_jsonb(cs)::text);
  perform pg_temp.chk('sedang: XP kembali ke semula (hanya XP sesi ditahan)', (select xp from public.student_stats where member_id = m2) = 100);
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform public.integrity_decide(cs.id, 'kukuhkan', 'Terbukti');
  execute 'reset role';
  perform pg_temp.chk('kukuhkan: XP tetap tidak dikembalikan', (select xp from public.student_stats where member_id = m2) = 100 and (select status from public.integrity_cases where id = cs.id) = 'dikukuhkan');

  -- 4) pengecualian (akomodasi): pola sama, tanpa tindakan
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.integrity_exempt (school_id, member_id, reason) values (sa, m3, 'Gangguan fokus, disetujui guru BK');
  execute 'reset role';
  r := pg_temp.sess(sa, subj, u3, 4, 4, 9);
  perform pg_temp.chk('dikecualikan: tidak ada kasus', (select count(*) from public.integrity_cases where member_id = m3) = 0 and (select xp from public.student_stats where member_id = m3) > 100, r::text);

  -- 5) kamera tidak cukup sendirian, dan hanya jika sekolah mengizinkan
  perform set_config('request.jwt.claims', json_build_object('sub', u4, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin perform public.practice_open(sa, subj, 5, true); perform pg_temp.chk('kamera ditolak bila sekolah belum mengizinkan', false);
  exception when others then perform pg_temp.chk('kamera ditolak bila sekolah belum mengizinkan', sqlerrm like '%kamera%', sqlerrm); end;
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.school_integrity (school_id, camera_mode, parental_consent_confirmed) values (sa, 'optional', true);
  execute 'reset role';
  r := pg_temp.sess(sa, subj, u4, 8, 0, 0, true, '{"noface_ms": 30000, "multi": 3}'::jsonb);
  perform pg_temp.chk('kamera saja (perilaku bersih): tanpa kasus, XP utuh', (select count(*) from public.integrity_cases where member_id = m4) = 0 and (select xp from public.student_stats where member_id = m4) > 100, r::text);
  perform pg_temp.chk('skor sesi bersih tetap 0', (select risk from public.practice_sessions where member_id = m4 order by started_at desc limit 1) = 0);

  -- 6) batas denda harian = 0 → hanya ditahan, tidak didenda
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  update public.school_integrity set daily_penalty_cap = 0 where school_id = sa;
  execute 'reset role';
  select xp into xp0 from public.student_stats where member_id = m4;
  r := pg_temp.sess(sa, subj, u4, 4, 4, 9, true, '{"noface_ms": 30000, "multi": 3}'::jsonb);
  select * into cs from public.integrity_cases where member_id = m4;
  perform pg_temp.chk('batas denda 0: dibatalkan tetapi tanpa denda', cs.status = 'dibatalkan' and cs.xp_penalty = 0 and cs.xp_reversed > 0 and (select xp from public.student_stats where member_id = m4) = xp0, to_jsonb(cs)::text);
  perform pg_temp.chk('kamera menambah skor hanya bila perilaku sudah menunjukkan sinyal', (cs.signals @> '[{"type":"kamera_tanpa_wajah"}]'::jsonb) and cs.score >= 70, cs.signals::text);

  -- 7) kebijakan: siswa tak bisa mengubah; anggota bisa membaca
  perform set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin update public.school_integrity set enabled = false where school_id = sa; perform pg_temp.chk('siswa tak bisa mengubah kebijakan', (select enabled from public.school_integrity where school_id = sa) is true);
  exception when others then perform pg_temp.chk('siswa tak bisa mengubah kebijakan', true); end;
  begin insert into public.integrity_exempt (school_id, member_id) values (sa, m1); perform pg_temp.chk('siswa tak bisa memberi pengecualian', false);
  exception when others then perform pg_temp.chk('siswa tak bisa memberi pengecualian', true); end;
  execute 'reset role';
  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
