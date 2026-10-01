# Progres

Cara melanjutkan di sesi baru: baca `CLAUDE.md`, berkas ini, lalu kerjakan "Berikutnya". Perbarui berkas ini di setiap commit penting.

## Keputusan
- Tulis ulang penuh di repo ini; kode lama hanya referensi (SHA `35251b6`, tidak diarsipkan di sini karena memuat kredensial dan data siswa).
- Next.js 16 + Supabase (Postgres/Auth/RLS) + Vercel. Tidak memakai service-role key.
- Model bisnis: paket umum + enterprise; AI lewat BYOK; kunci Gemini platform hanya demo/sintetis. Lihat `docs/design/product-architecture.md`.

## Status milestone
- **M0 fondasi**: kerangka monorepo, CI, pemindai rahasia, hook sesi, CLAUDE.md. ✅ (lint, typecheck, test, build hijau)
- **M1 model sekolah + auth + RLS**: skema inti sudah ter-apply ke Supabase dev (`supabase/migrations/`, 4 migrasi): bentuk pendidikan, paket kurikulum, sekolah, program, mapel, track (`ltree`), kalender, rombel, penugasan, peran berbasis kapabilitas, paket/entitlement/langganan, leads. RLS aktif di semua tabel. Tes isolasi `supabase/tests/rls_isolation.test.sql`: **28/28 lulus** (dijalankan via execute_sql; transaksi selalu dibatalkan). Advisor security: hanya 1 peringatan yang disengaja (`create_school` SECURITY DEFINER). Aplikasi web: landing dengan paket dari DB + formulir enterprise (`leads`), masuk/daftar (Supabase Auth via `@supabase/ssr`, `proxy.ts`), dashboard, wizard `Buat sekolah` (RPC `create_school`), detail sekolah. Diuji e2e dengan Chromium (formulir kontak, penjagaan `/dashboard`, galat login). Belum teruji: daftar+masuk sungguhan (butuh email konfirmasi/pengaturan Auth), editor program/mapel/track.
- M2–M7: belum.

## Hasil uji pengalaman (sesi ini)
- Akun demo sintetis ada di proyek dev (kepala sekolah, guru, siswa pada `SMK Nusantara Contoh`); kata sandi hanya di scratchpad sesi, bukan di repo. Pembuatannya: `supabase/seed/demo.sql` belum disimpan, ulangi bila perlu.
- Tampilan per peran sudah ada (pemilik: ringkasan dan struktur; guru: kelas dan siswa; siswa: kelas dan mata pelajaran). Uji Chromium 20/20 lulus, termasuk bahwa siswa tidak melihat nama guru dan kepala sekolah.
- Kekurangan yang ditemukan: pemilik belum bisa melakukan aksi apa pun (tambah rombel, undang anggota, atur mapel); siswa belum punya materi; navigasi antar sekolah hanya relevan untuk pengguna multi-sekolah (sudah diperbaiki).
- Inventaris v1 dan peta fitur: `docs/research/R2-v1-inventory.md`.

## Aksi pemilik sekolah (selesai di sesi ini)
- Migrasi `invites`: kode undangan 8 karakter (tanpa huruf/angka yang mirip), peran dan rombel opsional, batas pemakaian dan masa berlaku; RPC `redeem_invite` (peran owner tidak bisa diundang). Tes SQL `supabase/tests/invites.test.sql`: 14/14 lulus.
- Halaman web: `/dashboard/sekolah/[id]/rombel` (tahun ajaran + rombel), `/anggota` (daftar anggota, buat dan cabut undangan, salin kode/tautan), `/mapel` (mata pelajaran + penugasan mengajar), `/gabung` (tebus kode; tujuan semula dipertahankan lewat `?next=`). Hanya peran pemilik/admin/wakil kurikulum yang bisa membuka halaman pengelolaan (yang lain 404).
- Uji Chromium: rombel baru, undangan, tebus kode oleh guru kedua, kode sekali pakai ditolak, penugasan tersimpan dan terlihat oleh guru, siswa dan guru tidak bisa membuka `/anggota`.
- Temuan advisor yang hanya bisa diubah dari dashboard Supabase: "Leaked Password Protection" belum aktif (Authentication → Providers → Email).

## Sistem gerak (motion design)
- Prinsip dari riset: hanya `transform` dan `opacity`; 150-480 ms; satu momen terorkestrasi per halaman; keadaan akhir selalu terlihat; mati total saat `prefers-reduced-motion`.
- Bahasa gerak bertema buku tulis: kurva digambar pena (`.draw-in`), stabilo disapu (`.highlight`), gelembung LJK terisi saat disentuh (`.bubble`), centang digambar (`.draw-check`), daftar muncul bergantian (`.stagger`), bagian muncul saat digulir lewat CSS scroll-driven animation (`.reveal`, dengan fallback tanpa animasi), transisi antarhalaman lewat React `<ViewTransition>` di layout.
- Token: `--ease-out`, `--ease-spring`, `--dur-fast/base/slow` di `globals.css`.
- Diuji Chromium: 26 animasi berjalan saat dimuat, selesai < 3 detik, konten penuh setelah digulir, 0 animasi di mode kurangi gerakan.
- Skill pihak ketiga untuk motion (mis. "Design Motion Principles", "Impeccable animate") ditemukan di riset tetapi tidak dipasang; prinsipnya diterapkan langsung.
- Lapis 2 (koreografi kode, GSAP, grid 60 fps; spesifikasi di `docs/design/motion-spec.md`): kata judul mendarat berurutan dengan antisipasi dan overshoot, stabilo menyapu setelah kata terakhir, pena menulis kurva parabola dengan blur sebanding kecepatan, penanda squash/stretch + riak, slider `a` menyapu sebagai petunjuk, dan panggung scroll "Satu kurva, tiga mata pelajaran" (`story-stage.tsx`, di-scrub ScrollTrigger; label jujur bahwa baru Matematika yang berjalan).
- Diuji lewat "playblast" (`NEXT_PUBLIC_MOTION_DEBUG=1` membuka `window.__gsap`; timeline dijeda lalu di-seek per bingkai, contact sheet ditinjau). Temuan: properti CSS `transform` awal bentrok dengan `yPercent` GSAP (kata tertahan turun); diganti properti `translate`. Mode kurangi gerak: panggung statis, 0 animasi; HP 390px: tanpa scroll horizontal, simbol dekoratif disembunyikan.

## M2 UI (belajar dan pantau)
- Seed demo `supabase/seed/fungsi_kuadrat_demo.sql`: 5 materi Fungsi Kuadrat (Matematika kelas 10), prasyarat bercabang, 16 soal beserta kunci terpisah.
- Siswa: statistik level/XP/beruntun, peta belajar bertingkat (terkunci/tersedia/selesai + bintang), pelajaran (markdown mini + grafik parabola), kuis satu soal per layar, penilaian lewat RPC `submit_quiz`, hasil dengan bintang menghentak, hitung naik XP, konfeti kanvas, pembahasan.
- Guru/manajemen: `/pantau` dengan progres per siswa, tanda risiko (belum mulai, tidak aktif 7 hari, materi belum lulus, rata-rata < 60), pembuatan dan pembaruan tindak lanjut.
- Diuji Playwright (siswa desktop+HP, guru): 14 pemeriksaan lulus; siswa tidak bisa membuka `/pantau` (404); ulang kuis tidak memberi XP ganda.
- Authoring guru (`/materi`): buat draf materi, tulis pelajaran (markdown mini), prasyarat, tambah/hapus soal (pilihan ganda & isian singkat) dengan kunci terpisah; terbit ditolak bila belum ada soal. Diuji Playwright (7 pemeriksaan; siswa 404 di /materi, materi terbit langsung muncul di peta siswa).
- Tutor AI (BYOK): `school_ai_settings` (kunci terenkripsi AES-256-GCM di aplikasi, rahasia `AI_KEY_ENCRYPTION_SECRET` sudah di Vercel sensitive), `ai_usage`, RPC `reserve_ai_call` (keanggotaan + jatah harian di server, mode school/platform/limit/none). Sekolah demo (`schools.is_demo`) boleh memakai kunci platform (data sintetis); sekolah lain wajib kunci sendiri. Halaman `/ai` untuk pemilik (uji kunci sebelum simpan, kunci tak pernah ditampilkan), chat tutor Sokratik di halaman pelajaran siswa. Tes SQL 11/11, Vitest crypto 6, Playwright 5.
- Belum: analitik (BYOK), analitik, ringkasan orang tua, liga/pencapaian.

## Ekosistem sekolah (modul per paket)
Permintaan pemilik: situs harus lengkap untuk siswa, guru, dan sekolah; modul (rapor, absensi, administrasi, dst.) muncul sesuai paket.
- Mekanisme (data, bukan kode): tabel `modules`, `plan_modules`, `schools.plan_code`, penimpaan `school_modules` (Enterprise kustom), fungsi `app_private.module_enabled`; RLS tabel modul ikut memeriksa modul aktif; navigasi dan halaman memakai `lib/modules.ts` (`requireModule`). Halaman pemilik `/paket` menampilkan paket dan status tiap modul (aktif / tidak di paket / segera). Penggantian paket lewat tim dev (Enterprise = hubungi tim dev), bukan swalayan.
- Katalog: Belajar, Tutor AI, Analitik, Absensi, Nilai dan rapor, Jadwal, Administrasi (data induk, surat), Pengumuman, Portal orang tua, Keuangan, Integrasi. Starter: belajar, absensi, pengumuman. Sekolah: + tutor AI, analitik, nilai dan rapor, jadwal, administrasi, portal orang tua. Enterprise: semua + keuangan + integrasi.
- Selesai: absensi harian (`attendance_records`; hanya guru penugasan/wali kelas/pengelola yang boleh mencatat; siswa hanya membaca miliknya; rekap bulanan; tes SQL 16/16; Playwright 8/8).
- Selesai: nilai dan rapor (`assessments`, `assessment_scores`, `report_notes`, `gradebook_settings`; hak menilai per penugasan guru; nilai akhir berbobot; rapor cetak/PDF dengan kehadiran dan catatan wali kelas; siswa hanya melihat miliknya; tes SQL 12/12, Vitest 24, Playwright 7). Catatan: predikat memakai skala bawaan A/B/C/D dan ambang ketuntasan per sekolah (default 70) ⚠ belum diselaraskan dengan aturan penilaian resmi (Kurikulum Merdeka tanpa KKM); format rapor resmi per jenjang masih riset terbuka (R1 butir 5).
- Selesai: pengumuman (sasaran semua/siswa/guru/rombel; guru hanya ke rombel yang diajar; sematkan; teaser di dashboard) dan jadwal pelajaran (pengelola menyusun; trigger menolak bentrok rombel dan guru; siswa melihat jadwal kelas dengan nama guru lewat RPC `schedule_for`, guru melihat jadwal mengajar). Tes SQL 15/15, Playwright 12/12. Dashboard guru dan siswa kini punya menu modul sesuai paket (`ModuleLinks`).
- Selesai: administrasi (`member_profiles` data induk dengan NISN 10 digit dan NIS/NISN unik per sekolah; `letter_templates` dengan 3 templat bawaan; `letters` arsip bernomor, cetak/PDF). Data pribadi hanya terbaca pengelola anggota, wali kelas siswa itu, dan pemilik data; siswa melihat 'Data diriku' dan surat untuknya. Tes SQL 13/13, Playwright 8/8. Belum: impor CSV/Dapodik (modul Integrasi) dan templat surat buatan sekolah lewat UI.
- Selesai: portal orang tua (`guardianships`; orang tua tidak membaca tabel apa pun langsung, hanya RPC `my_children` dan `child_overview` yang memeriksa perwalian dan modul; ringkasan kehadiran, nilai semester, catatan wali kelas, dan progres belajar; pengelola menghubungkan/melepas wali di halaman data induk siswa). Akun demo: orangtua@demo.edusmart.test (terhubung ke Ayu Lestari, sandi sama dengan akun demo lain). Tes SQL 10/10, Playwright 8/9 (satu hanya soal waktu tunggu). Belum: rapor cetak untuk orang tua dan notifikasi.
- Selesai: analitik belajar (`/analitik`: ringkasan, aktivitas kuis 14 hari, materi tersulit, sebaran nilai, kehadiran 30 hari per rombel; bagan HTML/CSS) dan liga/pencapaian (7 lencana diberikan otomatis oleh trigger di `student_stats`; liga mingguan per rombel lewat RPC `weekly_league` dengan nama disingkat; siswa tak bisa melihat rombel lain). Tes SQL 12/12, Playwright 7/7.
- Selesai: keuangan (hanya Enterprise): `invoices`, `payments`; pengelola menerbitkan tagihan ke semua siswa atau satu rombel, mencatat pembayaran manual (tunai/transfer), saring status (terlambat dihitung dari jatuh tempo); siswa dan wali hanya melihat tagihan anak sendiri; guru tidak melihat keuangan. Tes SQL 10/10, Playwright 6/7 (satu hanya soal waktu). Halaman paket di landing kini menampilkan semua modul per paket dari data.
- Urutan berikutnya: integrasi (impor CSV/Dapodik, SSO, API; dibahas bersama tim dev), templat surat dan notifikasi, rapor cetak untuk orang tua, uji kegunaan, pengerasan (UU PDP, audit log, backup), dan polesan desain/gerak untuk halaman modul baru.

## Pengerasan dan polesan (iterasi ini)
- Advisor keamanan: hanya peringatan `SECURITY DEFINER` yang disengaja (semua dijelaskan lewat `comment on function`) dan Leaked Password Protection (pengaturan dasbor, belum diaktifkan). Advisor performa: 20 FK komposit kini berindeks, 8 tabel dengan kebijakan `for all` dipecah per aksi (tidak ada lagi "multiple permissive policies"); sisa hanya INFO indeks belum terpakai (basis data baru).
- CI database (`database.yml` + `scripts/run-sql-tests.sh`) memuat semua `supabase/tests/*.test.sql` lewat glob, termasuk tes baru.
- Navigasi pengelola dikelompokkan (Sekolah, Belajar, Administrasi, Komunikasi) tanpa gulir samping; ringkasan keuangan tidak lagi bertabrakan di HP.
- Impor CSV (`/anggota/impor`): nama[,peran[,kelas]] dengan pemisah koma/titik koma/tab, satu baris salah membatalkan semua, satu kode undangan sekali pakai per baris (nama dan rombel terisi dari label sekolah), kartu kode cetak dan salin sebagai CSV. Tes SQL 6/6, Vitest csv 6, Playwright 3/3.
- Aksesibilitas: 88 halaman diperiksa dengan axe-core (WCAG 2 A/AA + best-practice) di HP terang dan desktop gelap untuk 4 peran + halaman publik: 0 pelanggaran setelah perbaikan (landmark `<main>`, tautan lompat ke isi, h1 pada rapor/surat, tabel yang bisa digulir fokusable). Temuan kontras di landing hanya terjadi saat animasi reveal berjalan; dengan kurangi-gerak bersih.
- Data demo ekosistem: `supabase/seed/demo_ecosystem.sql` (jadwal, absensi, nilai, pengumuman, data induk, tagihan untuk Ayu Lestari).

## Iterasi: rapor orang tua, templat surat, notifikasi, gerak
- Rapor cetak untuk orang tua (`/anak/[childId]`): hanya lewat RPC `child_overview` (diperluas dengan identitas sekolah, tahun ajaran, wali kelas, daftar mapel); anak lain atau bukan wali = 404. Tes SQL 4/4.
- Templat surat sekolah (`/administrasi/surat/templat`): buat/ubah/hapus, ruang pengisi {{nama}} {{nis}} {{kelas}} {{sekolah}} {{tanggal}}; dipakai langsung saat menerbitkan surat.
- Notifikasi dalam aplikasi: tabel `notifications` diisi pemicu (pengumuman baru sesuai sasaran, tagihan baru, nilai baru; wali ikut diberi tahu; tanpa banjir: judul sama belum dibaca < 1 jam tidak diulang); lonceng dengan jumlah belum dibaca di semua halaman sekolah, halaman `/notifikasi`, tandai dibaca saat dibuka atau sekaligus. Penerima hanya membaca miliknya. Tes SQL 8/8.
- Gerak halaman modul: umpan balik simpan masuk (status) dan bergetar halus (galat), batang analitik/liga/kelengkapan data/level tumbuh bertahap, detail terbuka memudar masuk, lencana lonceng membal; semuanya hanya di `prefers-reduced-motion: no-preference` (24 animasi vs 0 saat kurangi-gerak). Playwright 11/11.

## Pusat Data dan Berkas (fase 1) — lihat docs/design/data-hub.md
- Unggah massal (seret-lepas) langsung ke Storage privat `school-files` lewat tautan bertanda tangan (tanpa batas 4,5 MB fungsi server; maksimal 50 MB). Ruang `sekolah` (pengelola) dan `guru` (kurikulum, buku paket, LKS dengan mapel); RLS storage dan katalog `school_files` mengikuti kapabilitas; guru tidak melihat berkas sekolah.
- AI memilah otomatis: kategori (siswa, guru, sekolah, peraturan, keuangan, kurikulum, buku paket, LKS, contoh rapor), ringkasan tanpa data pribadi, mapel, dan pemetaan kolom tabel. Kunci AI milik sekolah (BYOK) lewat RPC `reserve_admin_ai` (jatah 200/hari/orang); sekolah demo boleh kunci platform. Tanpa kunci: aturan dasar (sinonim judul kolom, nama berkas). Tabel besar tidak dikirim utuh: hanya 14 baris sampel; pemetaan diterapkan lokal.
- Pembaca berkas: xlsx (exceljs), csv/tsv (titik koma Excel Indonesia), docx (mammoth), pdf (unpdf; PDF/gambar pindaian dikirim ke AI sebagai lampiran ≤ 8 MB), txt/md. Teks dokumen diindeks untuk pencarian; teks tabel siswa/guru/keuangan sengaja tidak disimpan (data pribadi).
- Pembersihan data: NISN dilengkapi nol di depan (Excel membuangnya), tanggal (dd/mm/yyyy, "14 Maret 2010", serial Excel), jenis kelamin, telepon (+62 → 0), baris judul tidak di baris 1 (Dapodik), duplikat di berkas dan di roster.
- Tinjau dan impor: pemetaan bisa diubah, pratinjau 20 baris dengan galat/peringatan, rombel tak dikenal diperingatkan, tidak ada yang masuk sebelum disetujui. Hasil masuk ke `roster_people` (siswa/guru/staf belum punya akun) + kode undangan otomatis; saat kode ditebus, akun, rombel, dan data induk tersambung (`redeem_invite` diperluas). Halaman Roster (`/administrasi/roster`): status bergabung, buat kode, hapus, saring.
- Pengujian: Vitest intake 12 + csv 6, SQL data_hub 13/13, Playwright 19/19 (5 berkas sintetis: xlsx Dapodik, csv keuangan, txt peraturan, pdf kurikulum, pdf buku paket — semuanya dipilah benar oleh AI; impor, undangan, roster, unduh, ruang guru, siswa 404).
- Fase 2 (berikutnya): draf graf kompetensi/materi dari berkas kurikulum dan buku; tutor memakai teks buku sekolah; impor keuangan (SPP/LKS) dengan pencocokan nama/NIS ke roster. Fase 3: templat rapor yang bisa diatur per sekolah (kolom, kelompok mapel, sikap, ekskul, deskripsi capaian) + usulan templat dari contoh rapor yang diunggah.

## Berikutnya
0. Prioritas langsung: M2 (graf kompetensi, skill tree dengan prasyarat, kuis dinilai di server, XP/streak/level di server dengan satu konfigurasi, dashboard guru dengan intervensi).
1. (selesai) integrasi Supabase Auth di web (`@supabase/ssr`; di Next 16 pakai `proxy.ts`, bukan middleware), halaman login/daftar, wizard pembuatan sekolah lewat RPC `create_school`, landing dengan paket dan formulir enterprise (tabel `leads`).
2. Pindahkan tes isolasi ke CI setelah secret Supabase tersedia di GitHub.
3. Vercel: project `edusmart` sudah dibuat (root `apps/web`) dengan env sesuai matriks; `GEMINI_API_KEYS` bertipe sensitive. Cek deployment preview setelah push.

## Catatan lingkungan
- Docker tidak berjalan di sesi cloud; tes RLS memakai pgTAP langsung di proyek Supabase dev.
- Berkas `test` di root berasal dari commit awal `main`, bukan dari pekerjaan ini.

## Pusat Data fase 3: templat rapor (selesai)
- Tabel `report_templates` (satu default per sekolah) dan `report_extras` (sikap, ekskul, prestasi, P5); RPC `child_report_extra` untuk orang tua. Tes pgTAP-style: `supabase/tests/report_templates.test.sql` (10 lulus).
- Templat bisa diatur: judul, kelompok mapel, kolom, bagian, tanda tangan, skala predikat, catatan kaki; pratinjau langsung; usulan AI dari berkas kategori `rapor_contoh`.
- `ReportSheet` dipakai rapor siswa, wali kelas, dan orang tua. Wali kelas mengisi sikap/ekskul/prestasi/P5.
- Diuji Playwright (m15): pemilik buat templat, wali kelas isi, siswa (mobile gelap) dan orang tua melihat hasilnya.
- Berikutnya (fase 2): impor keuangan dari berkas (SPP/LKS), kurikulum/buku → draf materi oleh AI, tutor memakai kutipan buku sekolah.
