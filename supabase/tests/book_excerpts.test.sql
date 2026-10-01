-- Tes kutipan buku untuk tutor: siswa dapat cuplikan (bukan berkas), orang luar tidak, modul tutor dicabut = kosong.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); us uuid := gen_random_uuid(); ux uuid := gen_random_uuid();
  sa uuid; prog uuid; subj uuid; node uuid; mo uuid; r_s uuid; res jsonb;
begin
  insert into auth.users (id, email) values (uo,'o@be.local'),(us,'s@be.local'),(ux,'x@be.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah BE', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into mo from public.school_members where school_id = sa and user_id = uo;
  select id into prog from public.school_programs where school_id = sa limit 1;
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us, r_s, 'Siswa');
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, position, status) values (sa, subj, 10, 'K1', 'Fungsi kuadrat', 1, 'published') returning id into node;
  insert into public.school_files (school_id, scope, uploaded_by, name, size_bytes, path, category, text_content)
    values (sa, 'guru', mo, 'buku.pdf', 100, sa || '/guru/x-buku.pdf', 'buku_paket', repeat('pengantar ', 40) || 'Fungsi kuadrat berbentuk ax^2+bx+c, grafiknya parabola.');
  insert into public.school_files (school_id, scope, uploaded_by, name, size_bytes, path, category, text_content)
    values (sa, 'sekolah', mo, 'siswa.csv', 100, sa || '/sekolah/x-siswa.csv', 'siswa', 'fungsi kuadrat RAHASIA data siswa');
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;

  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa: tidak bisa baca berkas langsung', (select count(*) from public.school_files) = 0);
  res := public.book_excerpts(sa, node);
  perform pg_temp.chk('siswa: dapat 1 kutipan dari buku', jsonb_array_length(res) = 1 and res->0->>'excerpt' like '%parabola%', res::text);
  perform pg_temp.chk('kutipan tidak memuat berkas kategori data siswa', res::text not like '%RAHASIA%');

  perform set_config('request.jwt.claims', json_build_object('sub', ux, 'role', 'authenticated')::text, true);
  perform pg_temp.chk('orang luar: kosong', jsonb_array_length(public.book_excerpts(sa, node)) = 0);

  execute 'reset role';
  insert into public.school_modules (school_id, module_code, enabled) values (sa, 'ai_tutor', false);
  perform set_config('request.jwt.claims', json_build_object('sub', us, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('modul tutor dicabut: kosong', jsonb_array_length(public.book_excerpts(sa, node)) = 0);

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
