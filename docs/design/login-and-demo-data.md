# Cara masuk dan data uji

## Siapa masuk dengan apa
| Peran | Masuk dengan | Catatan |
|---|---|---|
| Kepala sekolah / pemilik, admin (tata usaha), guru, orang tua | **Email + kata sandi** | Akun dibuat lewat Daftar, lalu bergabung ke sekolah dengan kode undangan; atau dibuatkan pemilik. |
| Murid | **ID murid + kata sandi** | ID murid = kode sekolah + NIS, mis. `bgb-2610001`. Murid tidak perlu punya email. |
| Murid yang punya email | Email + kata sandi | Tetap bisa, sama seperti staf. |

Kolom masuk bernama "Email atau ID murid". Bila isinya mengandung `@`, dipakai sebagai email. Bila berbentuk `kode-nis`, ID itu dipetakan ke alamat sintetis `kode-nis@murid.edusmart.test` lalu masuk lewat Supabase Auth biasa (`apps/web/src/lib/login-id.ts`, dengan tes). Tidak ada kunci service-role.

Kode undangan (8 huruf/angka) hanya untuk **bergabung ke sekolah** sekali, bukan untuk masuk tiap hari.

## Akun murid massal dan atur ulang sandi
Halaman `Anggota → Buat akun murid tanpa email` (`/dashboard/sekolah/[id]/anggota/murid`): pengelola menempel daftar nama (boleh dari Excel, dengan NIS), memilih rombel, lalu mendapat kartu ID murid + kata sandi acak yang bisa dicetak atau disalin sebagai CSV. Kata sandi hanya tampil sekali. Pengelola atau wali kelas juga bisa menekan "Atur ulang sandi" di daftar anggota.

Di database ini dua fungsi `SECURITY DEFINER` (`create_student_accounts`, `reset_student_password`) dengan pemeriksaan izin sendiri, tanpa service-role. Berkas: `supabase/pending/20261005010000_student_accounts.sql` beserta tesnya `student_accounts.test.sql`. **Belum diterapkan**: alat migrasi menolak otomatis SQL yang menulis ke `auth.users`. Jalankan lewat SQL editor Supabase, lalu pindahkan kedua berkas ke `supabase/migrations/` dan `supabase/tests/`, jalankan tesnya, dan cek `get_advisors`. Kolom `schools.login_code` sudah diterapkan.

Belum ada: masuk dengan Google/SSO (butuh client ID dari pemilik).

## Data uji "SMK TI Bali Global Badung"
Sekolah sintetis di proyek dev. Nama orang, NIS, nilai, kehadiran, dan tagihan karangan. Dari situs publik hanya dipakai: nama sekolah, kabupaten (Badung), dan tiga kompetensi keahlian (Rekayasa Perangkat Lunak, Teknik Komputer dan Jaringan, Multimedia). Sumbernya sekunder dan belum diverifikasi ⚠, jadi jangan dijadikan preset.

- 5 rombel: X RPL 1, X TKJ 1, X MM 1, XI RPL 1, XI TKJ 1 (8 murid tiap rombel, 40 murid).
- 7 guru (satu mapel utama tiap guru, wali kelas di tiap rombel), 1 kepala sekolah (pemilik), 1 admin, 1 orang tua (terhubung ke murid `bgb-2610001`).
- 8 mapel, 72 slot jadwal tanpa bentrok guru, 552 nilai, kehadiran 2 pekan, tagihan SPP, pengumuman, XP pekan ini untuk Liga.
- Matematika kelas 10 berisi unit Fungsi Kuadrat (5 materi, 16 soal) beserta progres sebagian murid.
- Skrip: `supabase/seed/bali_global_badung.sql` lalu `bali_global_badung_belajar.sql`. Kata sandi di berkas diganti penanda `__KATA_SANDI_*__`; isi sendiri saat menjalankan. Kata sandi nyata tidak disimpan di repo.
