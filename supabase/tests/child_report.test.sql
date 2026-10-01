-- Tes rapor orang tua: ringkasan memuat identitas sekolah, tahun ajaran, wali kelas, mapel; tetap hanya untuk wali.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut uuid := gen_random_uuid(); up uuid := gen_random_uuid(); us1 uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; term uuid; subj uuid; c1 uuid; r_t uuid; r_s uuid; r_p uuid; mt uuid; mp uuid; ms1 uuid; ms2 uuid; res jsonb;
begin
  insert into auth.users (id, email) values (uo,'o@cr.local'),(ut,'t@cr.local'),(up,'p@cr.local'),(us1,'s1@cr.local'),(us2,'s2@cr.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah CR', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.terms (school_id, academic_year_id, seq, name, starts_on, ends_on) values (sa, yr, 1, 'Ganjil', '2026-07-01', '2026-12-31') returning id into term;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  select id into r_p from public.roles where school_id = sa and code = 'parent';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut, r_t, 'Pak Guru') returning id into mt;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, up, r_p, 'Orang Tua') returning id into mp;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us1, r_s, 'Anak') returning id into ms1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Bukan Anak') returning id into ms2;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms1), (sa, c1, ms2);
  insert into public.teaching_assignments (school_id, class_group_id, school_subject_id, teacher_member_id) values (sa, c1, subj, mt);
  update public.class_groups set homeroom_member_id = mt where id = c1;
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;
  insert into public.guardianships (school_id, parent_member_id, student_member_id) values (sa, mp, ms1);
  perform set_config('request.jwt.claims', json_build_object('sub', up, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  res := public.child_overview(sa, ms1);
  perform pg_temp.chk('rapor: nama sekolah dan tahun ajaran', res->'school'->>'name' = 'Sekolah CR' and res->>'year' = '2026/2027', res::text);
  perform pg_temp.chk('rapor: wali kelas dan daftar mapel', res->>'homeroom' = 'Pak Guru' and res->'subjects'->>0 = 'Matematika');
  perform pg_temp.chk('rapor: semester dan rombel', res->'term'->>'name' = 'Ganjil' and res->>'class' = 'X-1');
  begin
    perform public.child_overview(sa, ms2);
    perform pg_temp.chk('rapor anak orang lain ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('rapor anak orang lain ditolak', true, sqlerrm); end;
  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
