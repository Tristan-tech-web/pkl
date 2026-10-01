-- Data demo sintetis untuk modul ekosistem sekolah (SMK Nusantara Contoh). Aman dijalankan ulang.
do $$
declare
  s uuid; yr uuid; term uuid; c1 uuid; c2 uuid; mat uuid; dp uuid; made uuid; komang uuid; ayu uuid; sari uuid; a1 uuid; a2 uuid; a3 uuid; a4 uuid;
  d date; i int := 0;
begin
  select id into s from public.schools where name = 'SMK Nusantara Contoh';
  if s is null or exists (select 1 from public.schedule_slots where school_id = s) then return; end if;
  select id into c1 from public.class_groups where school_id = s and name = 'X PPLG 1';
  select id into c2 from public.class_groups where school_id = s and name = 'X PPLG 2';
  select id into mat from public.school_subjects where school_id = s and code = 'MAT';
  select id into dp from public.school_subjects where school_id = s and code = 'DPPLG';
  select id into made from public.school_members where school_id = s and display_name = 'Made Arta';
  select id into komang from public.school_members where school_id = s and display_name = 'Komang Putri';
  select id into ayu from public.school_members where school_id = s and display_name = 'Ayu Lestari';
  select id into sari from public.school_members where school_id = s and display_name = 'Sari Wulandari';
  select t.id into term from public.terms t where t.school_id = s order by t.starts_on limit 1;

  insert into public.schedule_slots (school_id, class_group_id, school_subject_id, teacher_member_id, weekday, starts_at, ends_at, room) values
    (s, c1, mat, made, 1, '07:00', '08:30', 'R. 12'), (s, c1, dp, komang, 1, '08:30', '10:30', 'Lab RPL'),
    (s, c1, dp, komang, 2, '07:00', '09:00', 'Lab RPL'), (s, c1, mat, made, 3, '09:15', '10:45', 'R. 12'),
    (s, c1, dp, komang, 4, '07:00', '10:00', 'Lab RPL'), (s, c1, mat, made, 5, '07:45', '09:15', 'R. 12');

  insert into public.announcements (school_id, author_member_id, title, body, audience, pinned) values
    (s, sari, 'Selamat datang di EduSmart', 'Mulai semester ini, jadwal, absensi, nilai, dan pengumuman sekolah ada di satu tempat. Orang tua dapat memantau lewat akun masing-masing.', 'semua', true);
  insert into public.announcements (school_id, author_member_id, title, body, audience, class_group_id) values
    (s, made, 'Ulangan harian Fungsi Kuadrat', 'Ulangan harian hari Rabu pekan depan. Pelajari materi FK-1 sampai FK-4 di peta belajar dan coba kuisnya dulu.', 'kelas', c1);

  d := (now() at time zone 'Asia/Jakarta')::date;
  while i < 12 loop
    d := d - 1;
    if extract(isodow from d) < 6 then
      insert into public.attendance_records (school_id, class_group_id, member_id, on_date, status, note, recorded_by)
      values (s, c1, ayu, d, case when i = 3 then 'sakit' when i = 7 then 'terlambat' else 'hadir' end, case when i = 3 then 'Demam' when i = 7 then 'Bus terlambat' end, made);
    end if;
    i := i + 1;
  end loop;

  insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title, kind, weight, held_on, created_by) values (s, c1, mat, term, 'Ulangan harian 1', 'tugas', 2, '2026-08-12', made) returning id into a1;
  insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title, kind, weight, held_on, created_by) values (s, c1, mat, term, 'Kuis grafik fungsi', 'kuis', 1, '2026-09-02', made) returning id into a2;
  insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title, kind, weight, held_on, created_by) values (s, c1, mat, term, 'UTS', 'uts', 3, '2026-09-23', made) returning id into a3;
  insert into public.assessments (school_id, class_group_id, school_subject_id, term_id, title, kind, weight, held_on, created_by) values (s, c1, dp, term, 'Praktik algoritma', 'praktik', 2, '2026-09-09', komang) returning id into a4;
  insert into public.assessment_scores (assessment_id, member_id, school_id, score) values (a1, ayu, s, 82), (a2, ayu, s, 90), (a3, ayu, s, 76), (a4, ayu, s, 94);
  insert into public.report_notes (school_id, term_id, member_id, note, written_by) values (s, term, ayu, 'Aktif bertanya dan cepat menangkap konsep. Latih ketelitian menghitung agar nilai ulangan lebih stabil.', made);

  insert into public.member_profiles (member_id, school_id, nis, nisn, gender, birth_place, birth_date, address, phone, guardian_name, guardian_phone)
  values (ayu, s, '2026001', '0098765432', 'P', 'Denpasar', '2010-03-14', 'Jl. Contoh No. 7, Denpasar', '081200000001', 'Ibu Lestari', '081200000002');

  insert into public.invoices (school_id, member_id, title, amount, due_on, created_by) values
    (s, ayu, 'SPP September 2026', 250000, '2026-09-10', sari), (s, ayu, 'SPP Oktober 2026', 250000, '2026-10-10', sari), (s, ayu, 'Seragam praktik', 175000, '2026-09-25', sari);
  insert into public.payments (school_id, invoice_id, amount, method, paid_on, recorded_by)
  select s, i.id, i.amount, 'transfer', '2026-09-08', sari from public.invoices i where i.school_id = s and i.title = 'SPP September 2026';
  insert into public.payments (school_id, invoice_id, amount, method, paid_on, recorded_by)
  select s, i.id, 100000, 'tunai', '2026-09-30', sari from public.invoices i where i.school_id = s and i.title = 'Seragam praktik';
end $$;
