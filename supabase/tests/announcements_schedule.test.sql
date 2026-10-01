-- Tes pengumuman dan jadwal: sasaran pembaca, penulis yang berhak, bentrok jadwal, gerbang paket.
create temp table _t (name text, ok boolean, info text);
grant all on _t to public;
create function pg_temp.chk(n text, c boolean, i text default null) returns void language sql as $$ insert into _t values (n, coalesce(c, false), i) $$;
grant execute on function pg_temp.chk(text, boolean, text) to public;
do $$
declare
  uo uuid := gen_random_uuid(); ut1 uuid := gen_random_uuid(); ut2 uuid := gen_random_uuid(); us1 uuid := gen_random_uuid(); us2 uuid := gen_random_uuid();
  sa uuid; prog uuid; yr uuid; subj uuid; c1 uuid; c2 uuid; r_t uuid; r_s uuid;
  mo uuid; mt1 uuid; mt2 uuid; ms1 uuid; ms2 uuid; n int;
begin
  insert into auth.users (id, email) values (uo,'o@p.local'),(ut1,'t1@p.local'),(ut2,'t2@p.local'),(us1,'s1@p.local'),(us2,'s2@p.local');
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  sa := public.create_school('Sekolah P', 'kemendikdasmen', 'swasta', array['SMK']);
  select id into prog from public.school_programs where school_id = sa limit 1;
  insert into public.academic_years (school_id, name, starts_on, ends_on, term_model) values (sa, '2026/2027', '2026-07-01', '2027-06-30', 'semester') returning id into yr;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-1', 10) returning id into c1;
  insert into public.class_groups (school_id, program_id, academic_year_id, name, grade) values (sa, prog, yr, 'X-2', 10) returning id into c2;
  insert into public.school_subjects (school_id, program_id, code, name, group_code) values (sa, prog, 'MAT', 'Matematika', 'umum') returning id into subj;
  select id into mo from public.school_members where school_id = sa and user_id = uo;
  select id into r_t from public.roles where school_id = sa and code = 'teacher';
  select id into r_s from public.roles where school_id = sa and code = 'student';
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut1, r_t, 'Guru 1') returning id into mt1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, ut2, r_t, 'Guru 2') returning id into mt2;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us1, r_s, 'Siswa 1') returning id into ms1;
  insert into public.school_members (school_id, user_id, role_id, display_name) values (sa, us2, r_s, 'Siswa 2') returning id into ms2;
  insert into public.class_group_students (school_id, class_group_id, member_id) values (sa, c1, ms1), (sa, c2, ms2);
  insert into public.teaching_assignments (school_id, class_group_id, school_subject_id, teacher_member_id) values (sa, c1, subj, mt1);

  -- Pemilik (Starter punya pengumuman, belum jadwal)
  insert into public.announcements (school_id, author_member_id, title, body, audience) values (sa, mo, 'Libur', 'Besok libur.', 'semua');
  insert into public.announcements (school_id, author_member_id, title, body, audience) values (sa, mo, 'Rapat guru', 'Jumat 14.00.', 'guru');
  perform pg_temp.chk('pemilik membuat pengumuman', (select count(*) from public.announcements) = 2);
  begin
    insert into public.schedule_slots (school_id, class_group_id, school_subject_id, weekday, starts_at, ends_at) values (sa, c1, subj, 1, '07:00', '08:30');
    perform pg_temp.chk('Starter: jadwal ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('Starter: jadwal ditolak', true, sqlerrm); end;

  -- Guru 1 (mengajar X-1): boleh pengumuman kelas X-1 saja, bukan semua
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', ut1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.announcements (school_id, author_member_id, title, body, audience, class_group_id) values (sa, mt1, 'Tugas', 'Kerjakan hal. 10.', 'kelas', c1);
  perform pg_temp.chk('guru mengumumkan ke rombel yang diajar', (select count(*) from public.announcements where title = 'Tugas') = 1);
  begin
    insert into public.announcements (school_id, author_member_id, title, body, audience, class_group_id) values (sa, mt1, 'Tugas X-2', 'x', 'kelas', c2);
    perform pg_temp.chk('guru tidak bisa mengumumkan ke rombel lain', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru tidak bisa mengumumkan ke rombel lain', true, sqlerrm); end;
  begin
    insert into public.announcements (school_id, author_member_id, title, body, audience) values (sa, mt1, 'Umum', 'x', 'semua');
    perform pg_temp.chk('guru tidak bisa mengumumkan ke semua', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('guru tidak bisa mengumumkan ke semua', true, sqlerrm); end;
  perform pg_temp.chk('guru (staf) melihat semua pengumuman', (select count(*) from public.announcements) = 3);

  -- Siswa 1 (X-1): semua + kelasnya, bukan pengumuman guru
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa X-1 melihat umum dan kelasnya', (select count(*) from public.announcements) = 2 and not exists (select 1 from public.announcements where audience = 'guru'));
  begin
    insert into public.announcements (school_id, author_member_id, title, body) values (sa, ms1, 'Iseng', 'x');
    perform pg_temp.chk('siswa tidak bisa membuat pengumuman', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa membuat pengumuman', true, sqlerrm); end;

  -- Siswa 2 (X-2) tidak melihat PR kelas X-1
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa X-2 tidak melihat pengumuman X-1', (select count(*) from public.announcements) = 1);

  -- Jadwal (paket Sekolah)
  execute 'reset role';
  update public.schools set plan_code = 'school' where id = sa;
  perform set_config('request.jwt.claims', json_build_object('sub', uo, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.schedule_slots (school_id, class_group_id, school_subject_id, teacher_member_id, weekday, starts_at, ends_at) values (sa, c1, subj, mt1, 1, '07:00', '08:30');
  perform pg_temp.chk('pengelola membuat jadwal', (select count(*) from public.schedule_slots) = 1);
  begin
    insert into public.schedule_slots (school_id, class_group_id, school_subject_id, weekday, starts_at, ends_at) values (sa, c1, subj, 1, '08:00', '09:00');
    perform pg_temp.chk('bentrok rombel ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('bentrok rombel ditolak', true, sqlerrm); end;
  begin
    insert into public.schedule_slots (school_id, class_group_id, school_subject_id, teacher_member_id, weekday, starts_at, ends_at) values (sa, c2, subj, mt1, 1, '08:00', '09:00');
    perform pg_temp.chk('bentrok guru ditolak', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('bentrok guru ditolak', true, sqlerrm); end;
  insert into public.schedule_slots (school_id, class_group_id, school_subject_id, teacher_member_id, weekday, starts_at, ends_at) values (sa, c1, subj, mt1, 1, '08:30', '10:00');
  perform pg_temp.chk('jam bersambung (08:30) tidak dianggap bentrok', (select count(*) from public.schedule_slots) = 2);

  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', us1, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  perform pg_temp.chk('siswa membaca jadwal', (select count(*) from public.schedule_slots) = 2);
  begin
    insert into public.schedule_slots (school_id, class_group_id, school_subject_id, weekday, starts_at, ends_at) values (sa, c1, subj, 2, '07:00', '08:00');
    perform pg_temp.chk('siswa tidak bisa mengubah jadwal', false, 'seharusnya ditolak');
  exception when others then perform pg_temp.chk('siswa tidak bisa mengubah jadwal', true, sqlerrm); end;

  raise exception 'HASIL_TES % | gagal=%', (select count(*) from _t), (select coalesce(jsonb_agg(name || ' [' || coalesce(info,'') || ']'), '[]'::jsonb) from _t where not ok);
end $$;
