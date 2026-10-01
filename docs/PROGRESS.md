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

## Berikutnya
0. Prioritas langsung: M2 (graf kompetensi, skill tree dengan prasyarat, kuis dinilai di server, XP/streak/level di server dengan satu konfigurasi, dashboard guru dengan intervensi).
1. (selesai) integrasi Supabase Auth di web (`@supabase/ssr`; di Next 16 pakai `proxy.ts`, bukan middleware), halaman login/daftar, wizard pembuatan sekolah lewat RPC `create_school`, landing dengan paket dan formulir enterprise (tabel `leads`).
2. Pindahkan tes isolasi ke CI setelah secret Supabase tersedia di GitHub.
3. Vercel: project `edusmart` sudah dibuat (root `apps/web`) dengan env sesuai matriks; `GEMINI_API_KEYS` bertipe sensitive. Cek deployment preview setelah push.

## Catatan lingkungan
- Docker tidak berjalan di sesi cloud; tes RLS memakai pgTAP langsung di proyek Supabase dev.
- Berkas `test` di root berasal dari commit awal `main`, bukan dari pekerjaan ini.
