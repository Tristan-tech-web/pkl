# Progres

Cara melanjutkan di sesi baru: baca `CLAUDE.md`, berkas ini, lalu kerjakan "Berikutnya". Perbarui berkas ini di setiap commit penting.

## Keputusan
- Tulis ulang penuh di repo ini; kode lama hanya referensi (SHA `35251b6`, tidak diarsipkan di sini karena memuat kredensial dan data siswa).
- Next.js 16 + Supabase (Postgres/Auth/RLS) + Vercel. Tidak memakai service-role key.
- Model bisnis: paket umum + enterprise; AI lewat BYOK; kunci Gemini platform hanya demo/sintetis. Lihat `docs/design/product-architecture.md`.

## Status milestone
- **M0 fondasi**: kerangka monorepo, CI, pemindai rahasia, hook sesi, CLAUDE.md. ✅ (lint, typecheck, test, build hijau)
- **M1 model sekolah + auth + RLS**: belum.
- M2–M7: belum.

## Berikutnya
1. M1: skema Postgres (satuan pendidikan, program, bentuk pendidikan, paket kurikulum, mapel, track `ltree`, kalender, rombel, penugasan, peran, plans/entitlements, leads) dengan RLS + tes pgTAP.
2. Buat project Vercel setelah branch ini siap, atur env sesuai matriks di dokumen arsitektur.

## Catatan lingkungan
- Docker tidak berjalan di sesi cloud; tes RLS memakai pgTAP langsung di proyek Supabase dev.
- Berkas `test` di root berasal dari commit awal `main`, bukan dari pekerjaan ini.
