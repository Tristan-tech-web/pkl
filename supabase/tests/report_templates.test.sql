-- Tes templat rapor dan isian tambahan: satu templat bawaan, hanya wali kelas/pengelola mengisi, wali membaca lewat RPC.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut1 uuid := gen_random_uuid(); ut2 uuid := gen_random_uuid(); up uuid := gen_random_uuid(); us1 uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; term uuid; subj uuid; c1 uuid; r_t uuid; r_s uuid; r_p uuid; mt1 uuid; mt2 uuid; mp uuid; ms1 uuid; ms2 uuid; asm uuid; res jsonb;
begin
  insert into auth.users (id, email) values (uo,'o@rt.local'),(ut1,'t1@rt.local'),(ut2,'t2@rt.local'),(up,'p@rt.local'),(us1,'s1@rt.local'),(us2,'s2@rt.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah RT', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.terms (school_id, academic_year_id, seq, name, starts_on, ends_on) values (sa, yr, 1, 'Ganjil', '2026-07-01', '2026-12-31') returning id into term;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  select id into r_p from public.roles where school_id = sa and code = 'parent';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut1, r_t, 'Wali') returning id into mt1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut2, r_t, 'Guru Lain') returning id into mt2;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, up, r_p, 'Ortu') returning id into mp;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us1, r_s, 'Anak') returning id into ms1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Lain') returning id into ms2;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms1), (sa, c1, ms2);
  update public.class_groups set homeroom_member_id = mt1 where id = c1;
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;
  insert into public.guardianships (school_id, parent_member_id, student_member_id) values (sa, mp, ms1);
  insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title, weight) values (sa, c1, subj, term, 'UH', 1) returning id into asm;
  insert into public.assessment_scores (assessment_id, member_id, school_id, score) values (asm, ms1, sa, 90);

  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.report_templates (school_id, name, config, is_default) values (sa, 'Rapor Merdeka', '{"title":"RAPOR PESERTA DIDIK","sections":{"sikap":true}}', true);
  begin
    insert into public.report_templates (school_id, name, config, is_default) values (sa, 'Kedua', '{}', true);
    perform pg_temp.chk('hanya satu templat bawaan per sekolah', false, 'seharusnya ditolak');
  exception when unique_violation then perform pg_temp.chk('hanya satu templat bawaan per sekolah', true); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.report_extras (school_id, term_id, member_id, section, data, written_by) values (sa, term, ms1, 'sikap', '{"spiritual":"Baik","sosial":"Sangat baik"}', mt1);
  perform pg_temp.chk('wali kelas mengisi sikap siswanya', (select count(*) from public.report_extras) = 1);
  perform pg_temp.chk('guru melihat templat sekolah', (select count(*) from public.report_templates) = 1);
  begin
    insert into public.report_templates (school_id, name, config) values (sa, 'Curang', '{}');
    perform pg_temp.chk('guru biasa tidak bisa membuat templat', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru biasa tidak bisa membuat templat', true, sqlerrm); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    insert into public.report_extras (school_id, term_id, member_id, section, data) values (sa, term, ms1, 'ekskul', '{"items":[]}');
    perform pg_temp.chk('bukan wali kelas tidak bisa mengisi isian rapor', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('bukan wali kelas tidak bisa mengisi isian rapor', true, sqlerrm); end;

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa membaca isian rapor sendiri', (select count(*) from public.report_extras) = 1);
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa lain tidak membaca isian teman', (select count(*) from public.report_extras) = 0);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', up, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  res := public.child_report_extra(sa, ms1, term);
  perform pg_temp.chk('wali: templat, isian sikap, dan penilaian lewat RPC', res->'template'->>'title' = 'RAPOR PESERTA DIDIK' and res->'extras'->'sikap'->>'spiritual' = 'Baik' and (res->'assessments'->0->'items'->0->>'pct')::numeric = 90, res::text);
  perform pg_temp.chk('wali tidak membaca tabel isian langsung', (select count(*) from public.report_extras) = 0);
  begin
    perform public.child_report_extra(sa, ms2, term);
    perform pg_temp.chk('wali tidak bisa membaca rapor anak lain', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('wali tidak bisa membaca rapor anak lain', true, sqlerrm); end;

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
