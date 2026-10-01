-- Tes portal orang tua: hanya anak yang terhubung, tidak ada akses tabel langsung, gerbang paket.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); up uuid := gen_random_uuid(); us1 uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; term uuid; subj uuid; c1 uuid; r_t uuid; r_s uuid; r_p uuid;
  mt uuid; mp uuid; ms1 uuid; ms2 uuid; asm uuid; res jsonb;
begin
  insert into auth.users (id, email) values (uo,'o@pp.local'),(ut,'t@pp.local'),(up,'p@pp.local'),(us1,'s1@pp.local'),(us2,'s2@pp.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah PP', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.terms (school_id, academic_year_id, seq, name, starts_on, ends_on) values (sa, yr, 1, 'Ganjil', '2026-07-01', '2026-12-31') returning id into term;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  select id into r_p from public.roles where school_id = sa and code = 'parent';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Guru') returning id into mt;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, up, r_p, 'Orang Tua') returning id into mp;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us1, r_s, 'Anak') returning id into ms1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Bukan Anak') returning id into ms2;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms1), (sa, c1, ms2);
  insert into public.teaching_assignments (school_id, class_group_id, school_subject_id, teacher_member_id) values (sa, c1, subj, mt);

  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;
  insert into public.attendance_records (school_id, class_group_id, member_id, on_date, status) values (sa, c1, ms1, '2026-10-01', 'hadir'), (sa, c1, ms1, '2026-10-02', 'sakit'), (sa, c1, ms2, '2026-10-01', 'alpa');
  insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title, weight) values (sa, c1, subj, term, 'UH', 2) returning id into asm;
  insert into public.assessment_scores (assessment_id, member_id, school_id, score) values (asm, ms1, sa, 80), (asm, ms2, sa, 40);
  insert into public.report_notes (school_id, term_id, member_id, note) values (sa, term, ms1, 'Baik.');

  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.guardianships (school_id, parent_member_id, student_member_id, relation) values (sa, mp, ms1, 'ibu');
  perform pg_temp.chk('pengelola menghubungkan wali', (select count(*) from public.guardianships) = 1);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', up, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('wali melihat daftar anaknya saja', (select count(*) from public.my_children(sa)) = 1 and (select name from public.my_children(sa)) = 'Anak');
  res := public.child_overview(sa, ms1);
  perform pg_temp.chk('ringkasan: kehadiran', (res->'attendance'->>'hadir')::int = 1 and (res->'attendance'->>'sakit')::int = 1, res->>'attendance');
  perform pg_temp.chk('ringkasan: nilai akhir 80', (res->'grades'->0->>'grade')::numeric = 80 and res->'grades'->0->>'subject' = 'Matematika', res->>'grades');
  perform pg_temp.chk('ringkasan: catatan wali kelas dan rombel', res->>'note' = 'Baik.' and res->>'class' = 'X-1');
  begin
    perform public.child_overview(sa, ms2);
    perform pg_temp.chk('wali tidak bisa melihat anak orang lain', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('wali tidak bisa melihat anak orang lain', true, sqlerrm); end;
  perform pg_temp.chk('wali tidak membaca tabel langsung', (select count(*) from public.attendance_records) = 0 and (select count(*) from public.assessment_scores) = 0 and (select count(*) from public.report_notes) = 0);
  begin
    insert into public.guardianships (school_id, parent_member_id, student_member_id) values (sa, mp, ms2);
    perform pg_temp.chk('wali tidak bisa menghubungkan diri sendiri', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('wali tidak bisa menghubungkan diri sendiri', true, sqlerrm); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    perform public.child_overview(sa, ms1);
    perform pg_temp.chk('guru bukan wali ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru bukan wali ditolak', true, sqlerrm); end;

  execute 'reset role';
  update public.schools set plan_code = 'starter' where id = sa;
  perform set_config('request.jwt.claims', json_build_object('sub', up, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    perform public.child_overview(sa, ms1);
    perform pg_temp.chk('Starter: portal ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('Starter: portal ditolak', true, sqlerrm); end;

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
