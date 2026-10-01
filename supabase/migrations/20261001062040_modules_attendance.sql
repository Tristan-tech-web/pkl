-- Modul per paket (data, bukan kode) + absensi harian.
create table public.modules (
  code text primary key,
  name text not null,
  description text not null,
  category text not null check (category in ('belajar','administrasi','komunikasi','keuangan','integrasi')),
  status text not null default 'segera' check (status in ('tersedia','segera')),
  sort int not null default 100
);
create table public.plan_modules (
  plan_code text not null references public.plans (code) on delete cascade,
  module_code text not null references public.modules (code) on delete cascade,
  primary key (plan_code, module_code)
);
alter table public.schools add column plan_code text not null default 'starter' references public.plans (code);
-- Penimpaan per sekolah (mis. Enterprise kustom): enabled=true menambah, false mencabut.
create table public.school_modules (
  school_id uuid not null references public.schools (id) on delete cascade,
  module_code text not null references public.modules (code) on delete cascade,
  enabled boolean not null,
  primary key (school_id, module_code)
);
alter table public.modules enable row level security;
alter table public.plan_modules enable row level security;
alter table public.school_modules enable row level security;
revoke all on public.modules, public.plan_modules, public.school_modules from anon;
create policy modules_read on public.modules for select to authenticated using (true);
create policy plan_modules_read on public.plan_modules for select to authenticated using (true);
create policy school_modules_read on public.school_modules for select to authenticated using (app_private.is_member(school_id));

insert into public.modules (code, name, description, category, status, sort) values
  ('learning', 'Belajar', 'Peta belajar, pelajaran, kuis, XP, level, dan streak.', 'belajar', 'tersedia', 1),
  ('ai_tutor', 'Tutor AI', 'Tutor Sokratik dengan kunci API milik sekolah.', 'belajar', 'tersedia', 2),
  ('analytics', 'Analitik belajar', 'Distribusi nilai, materi tersulit, dan aktivitas.', 'belajar', 'segera', 3),
  ('attendance', 'Absensi', 'Absensi harian per rombel, rekap, dan keterlambatan.', 'administrasi', 'tersedia', 10),
  ('gradebook', 'Nilai dan rapor', 'Penilaian, bobot, nilai akhir, dan rapor cetak.', 'administrasi', 'segera', 11),
  ('schedule', 'Jadwal pelajaran', 'Jadwal per rombel dan guru.', 'administrasi', 'segera', 12),
  ('admin_records', 'Administrasi', 'Data induk siswa dan guru, surat, dan arsip.', 'administrasi', 'segera', 13),
  ('announcements', 'Pengumuman', 'Pengumuman sekolah dan kelas.', 'komunikasi', 'segera', 20),
  ('parent_portal', 'Portal orang tua', 'Ringkasan kehadiran, nilai, dan pengumuman untuk orang tua.', 'komunikasi', 'segera', 21),
  ('fees', 'Keuangan', 'Tagihan dan pembayaran sekolah.', 'keuangan', 'segera', 30),
  ('integrations', 'Integrasi', 'Impor Dapodik, SSO, dan API. Dibahas bersama tim dev.', 'integrasi', 'segera', 40);

insert into public.plan_modules (plan_code, module_code) values
  ('starter','learning'), ('starter','attendance'), ('starter','announcements'),
  ('school','learning'), ('school','attendance'), ('school','announcements'), ('school','ai_tutor'), ('school','analytics'),
  ('school','gradebook'), ('school','schedule'), ('school','admin_records'), ('school','parent_portal'),
  ('enterprise','learning'), ('enterprise','attendance'), ('enterprise','announcements'), ('enterprise','ai_tutor'), ('enterprise','analytics'),
  ('enterprise','gradebook'), ('enterprise','schedule'), ('enterprise','admin_records'), ('enterprise','parent_portal'),
  ('enterprise','fees'), ('enterprise','integrations');

create function app_private.module_enabled(p_school uuid, p_module text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select sm.enabled from public.school_modules sm where sm.school_id = p_school and sm.module_code = p_module),
    exists (select 1 from public.schools s join public.plan_modules pm on pm.plan_code = s.plan_code
            where s.id = p_school and pm.module_code = p_module)
  )
$$;

-- Absensi harian per rombel.
update public.roles set capabilities = array_append(capabilities, 'attendance.write')
  where code in ('teacher','homeroom','admin','curriculum_lead') and not 'attendance.write' = any (capabilities);

-- Boleh mencatat absensi rombel: pengelola (class.manage/*), wali kelas, atau guru yang ditugaskan di rombel itu.
create function app_private.can_take_attendance(p_school uuid, p_class uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select app_private.has_capability(p_school, 'class.manage')
    or exists (select 1 from public.class_groups g where g.id = p_class and g.school_id = p_school
               and g.homeroom_member_id = app_private.my_member_id(p_school))
    or (app_private.has_capability(p_school, 'attendance.write')
        and exists (select 1 from public.teaching_assignments t where t.class_group_id = p_class and t.school_id = p_school
                    and t.teacher_member_id = app_private.my_member_id(p_school)))
$$;

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  class_group_id uuid not null,
  member_id uuid not null,
  on_date date not null,
  status text not null check (status in ('hadir','terlambat','izin','sakit','alpa')),
  note text check (note is null or char_length(note) <= 300),
  recorded_by uuid,
  updated_at timestamptz not null default now(),
  unique (class_group_id, member_id, on_date),
  foreign key (school_id, class_group_id) references public.class_groups (school_id, id) on delete cascade,
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.attendance_records (school_id, on_date);
create index on public.attendance_records (school_id, member_id, on_date);
alter table public.attendance_records enable row level security;
revoke all on public.attendance_records from anon;
create policy attendance_select on public.attendance_records for select to authenticated
  using (app_private.module_enabled(school_id, 'attendance')
         and (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'students.read')));
create policy attendance_insert on public.attendance_records for insert to authenticated
  with check (app_private.module_enabled(school_id, 'attendance') and app_private.can_take_attendance(school_id, class_group_id));
create policy attendance_update on public.attendance_records for update to authenticated
  using (app_private.module_enabled(school_id, 'attendance') and app_private.can_take_attendance(school_id, class_group_id))
  with check (app_private.module_enabled(school_id, 'attendance') and app_private.can_take_attendance(school_id, class_group_id));
create policy attendance_delete on public.attendance_records for delete to authenticated
  using (app_private.module_enabled(school_id, 'attendance') and app_private.can_take_attendance(school_id, class_group_id));

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;

update public.schools set plan_code = 'enterprise' where name = 'SMK Nusantara Contoh';
