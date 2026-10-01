# EduSmart v2

Platform sekolah multi-jenis (SD/MI/SMP/MTs/SMA/MA/SMK/SLB/kesetaraan/pesantren/kustom) dengan model data fleksibel, AI tutor, dan modul visual per mata pelajaran. Tulis ulang penuh dari `Tristan-IT/EduSmart` (proyek lama yang sudah mati; hanya referensi, SHA `35251b6`).

Baca dulu: `docs/PROGRESS.md` (status dan langkah berikutnya), `docs/research/R1-school-domain.md`, `docs/design/`.

## Perintah
- `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- `./scripts/check-secrets.sh` (pemindai rahasia; harus bersih sebelum commit)

## Aturan
- **Next.js 16**: berbeda dari pengetahuan umum (mis. `middleware` kini `proxy`). Baca `apps/web/node_modules/next/dist/docs/` sebelum menulis kode Next.
- **Rahasia tidak pernah masuk git.** Env asli hanya di Vercel (sensitive) dan Supabase. Tidak memakai service-role key; isolasi lewat RLS.
- **Multi-tenant**: setiap tabel tenant punya `school_id` dan kebijakan RLS; setiap perubahan skema disertai tes pgTAP dan pengecekan `get_advisors` (security).
- Konfigurasi sekolah berupa **data** (paket kurikulum, bentuk pendidikan, track), bukan enum di kode.
- Data siswa nyata tidak boleh lewat kunci AI gratis milik platform; hanya data sintetis untuk demo.
- Bahasa UI: Indonesia, sederhana. Mobile-first.
- Branch kerja: `claude/web-app-ideas-pspl5x`. Commit kecil per langkah, tanpa PR kecuali diminta.
- Klaim kebijakan/kurikulum yang belum bersumber ditandai ⚠ dan tidak dijadikan preset.

## Supabase
Proyek dev: `qxxicvqncftuktblezud` (region ap-south-1). Migrasi lewat tool MCP Supabase, simpan salinan SQL di `supabase/migrations/`.
