-- Administrasi: data induk anggota (siswa/guru) dan surat resmi sekolah.
create table public.member_profiles (
  member_id uuid primary key,
  school_id uuid not null,
  nis text check (nis is null or char_length(nis) <= 30),
  nisn text check (nisn is null or nisn ~ '^[0-9]{10}$'),
  nip text check (nip is null or char_length(nip) <= 30),
  gender text check (gender is null or gender in ('L','P')),
  birth_place text check (birth_place is null or char_length(birth_place) <= 80),
  birth_date date,
  address text check (address is null or char_length(address) <= 300),
  phone text check (phone is null or char_length(phone) <= 30),
  guardian_name text check (guardian_name is null or char_length(guardian_name) <= 100),
  guardian_phone text check (guardian_phone is null or char_length(guardian_phone) <= 30),
  updated_at timestamptz not null default now(),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete cascade
);
create index on public.member_profiles (school_id);
create unique index member_profiles_nis_uq on public.member_profiles (school_id, nis) where nis is not null;
create unique index member_profiles_nisn_uq on public.member_profiles (school_id, nisn) where nisn is not null;

create table public.letter_templates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools (id) on delete cascade,
  code text not null,
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 10 and 4000),
  unique nulls not distinct (school_id, code)
);
create table public.letters (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  number text not null,
  title text not null,
  body text not null,
  member_id uuid,
  issued_by uuid,
  issued_on date not null default ((now() at time zone 'Asia/Jakarta')::date),
  created_at timestamptz not null default now(),
  unique (school_id, number),
  foreign key (school_id, member_id) references public.school_members (school_id, id) on delete set null
);
create index on public.letters (school_id, issued_on desc);

alter table public.member_profiles enable row level security;
alter table public.letter_templates enable row level security;
alter table public.letters enable row level security;
revoke all on public.member_profiles, public.letter_templates, public.letters from anon;

-- Data induk memuat data pribadi anak: pengelola anggota, wali kelas siswa itu, dan pemilik data sendiri.
create policy profiles_select on public.member_profiles for select to authenticated
  using (app_private.module_enabled(school_id, 'admin_records')
         and (member_id = app_private.my_member_id(school_id) or app_private.has_capability(school_id, 'members.manage')
              or app_private.is_homeroom_of(school_id, member_id)));
create policy profiles_write on public.member_profiles for all to authenticated
  using (app_private.module_enabled(school_id, 'admin_records') and app_private.has_capability(school_id, 'members.manage'))
  with check (app_private.module_enabled(school_id, 'admin_records') and app_private.has_capability(school_id, 'members.manage'));

create policy templates_select on public.letter_templates for select to authenticated
  using (school_id is null or (app_private.module_enabled(school_id, 'admin_records') and app_private.is_member(school_id)));
create policy templates_write on public.letter_templates for all to authenticated
  using (school_id is not null and app_private.module_enabled(school_id, 'admin_records') and app_private.has_capability(school_id, 'members.manage'))
  with check (school_id is not null and app_private.module_enabled(school_id, 'admin_records') and app_private.has_capability(school_id, 'members.manage'));

-- Surat: diterbitkan pengelola; arsip dibaca pengelola dan penerima surat.
create policy letters_select on public.letters for select to authenticated
  using (app_private.module_enabled(school_id, 'admin_records')
         and (app_private.has_capability(school_id, 'members.manage') or member_id = app_private.my_member_id(school_id)));
create policy letters_insert on public.letters for insert to authenticated
  with check (app_private.module_enabled(school_id, 'admin_records') and app_private.has_capability(school_id, 'members.manage'));
create policy letters_delete on public.letters for delete to authenticated
  using (app_private.module_enabled(school_id, 'admin_records') and app_private.has_capability(school_id, 'members.manage'));

insert into public.letter_templates (school_id, code, title, body) values
(null, 'siswa_aktif', 'Surat Keterangan Siswa Aktif',
$t$Yang bertanda tangan di bawah ini, Kepala {{sekolah}}, menerangkan bahwa:

Nama: {{nama}}
NIS: {{nis}}
Kelas: {{kelas}}

adalah benar siswa aktif di {{sekolah}} pada tahun ajaran berjalan.

Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.$t$),
(null, 'izin', 'Surat Izin Tidak Mengikuti Pelajaran',
$t$Kepada Yth. Bapak/Ibu Guru {{sekolah}},

Dengan hormat, kami memberitahukan bahwa siswa:

Nama: {{nama}}
Kelas: {{kelas}}

diberi izin tidak mengikuti kegiatan belajar pada tanggal ______ dengan alasan ______.

Demikian surat ini dibuat agar dapat dimaklumi.$t$),
(null, 'panggilan_ortu', 'Surat Panggilan Orang Tua/Wali',
$t$Kepada Yth. Orang Tua/Wali dari {{nama}} (kelas {{kelas}}),

Dengan hormat, kami mengundang Bapak/Ibu untuk hadir di {{sekolah}} pada hari ______, tanggal ______, pukul ______ guna membicarakan perkembangan belajar putra/putri Bapak/Ibu.

Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.$t$);

revoke execute on all functions in schema app_private from public, anon;
grant execute on all functions in schema app_private to authenticated;
update public.modules set status = 'tersedia' where code = 'admin_records';
