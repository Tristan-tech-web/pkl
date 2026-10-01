# Progres

Cara melanjutkan di sesi baru: baca `CLAUDE.md`, berkas ini, lalu kerjakan "Berikutnya". Perbarui berkas ini di setiap commit penting.

## Keputusan
- Tulis ulang penuh di repo ini; kode lama hanya referensi (SHA `35251b6`, tidak diarsipkan di sini karena memuat kredensial dan data siswa).
- Next.js 16 + Supabase (Postgres/Auth/RLS) + Vercel. Tidak memakai service-role key.
- Model bisnis: paket umum + enterprise; AI lewat BYOK; kunci Gemini platform hanya demo/sintetis. Lihat `docs/design/product-architecture.md`.

## Status milestone
- **M0 fondasi**: kerangka monorepo, CI, pemindai rahasia, hook sesi, CLAUDE.md. ✅ (lint, typecheck, test, build hijau)
- **M1 model sekolah + auth + RLS**: skema inti sudah ter-apply ke Supabase dev (`supabase/migrations/`, 4 migrasi): bentuk pendidikan, paket kurikulum, sekolah, program, mapel, track (`ltree`), kalender, rombel, penugasan, peran berbasis kapabilitas, paket/entitlement/langganan, leads. RLS aktif di semua tabel. Tes isolasi `supabase/tests/rls_isolation.test.sql`: **28/28 lulus** (dijalankan via execute_sql; transaksi selalu dibatalkan). Advisor security: hanya 1 peringatan yang disengaja (`create_school` SECURITY DEFINER). Belum: Supabase Auth di aplikasi web dan wizard sekolah.
- M2–M7: belum.

## Berikutnya
1. M1 sisa: integrasi Supabase Auth di web (`@supabase/ssr`; di Next 16 pakai `proxy.ts`, bukan middleware), halaman login/daftar, wizard pembuatan sekolah lewat RPC `create_school`, landing dengan paket dan formulir enterprise (tabel `leads`).
2. Pindahkan tes isolasi ke CI setelah secret Supabase tersedia di GitHub.
3. Vercel: project `edusmart` sudah dibuat (root `apps/web`) dengan env sesuai matriks; `GEMINI_API_KEYS` bertipe sensitive. Cek deployment preview setelah push.

## Catatan lingkungan
- Docker tidak berjalan di sesi cloud; tes RLS memakai pgTAP langsung di proyek Supabase dev.
- Berkas `test` di root berasal dari commit awal `main`, bukan dari pekerjaan ini.
