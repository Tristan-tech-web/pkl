# Rangka (nama kerja)

Platform manajemen perusahaan yang super fleksibel (bukan sekolah). Berawal dari EduSmart v2 (platform sekolah "Pulau Belajar") yang ditolak; kode sekolah **tidak dihapus** dan sedang menunggu diarsipkan ke repo lain. Lihat `docs/design/company/00-pivot.md`.

Baca dulu: `docs/PROGRESS.md` (status dan langkah berikutnya), `docs/design/company/01-visi.md` sampai `05-roadmap.md`, dan riset di `docs/research/company/R2` sampai `R6`.

## Perintah
- `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- `./scripts/check-secrets.sh` (pemindai rahasia; harus bersih sebelum commit)

## Aturan
- **Next.js 16**: berbeda dari pengetahuan umum (mis. `middleware` kini `proxy`). Baca `apps/web/node_modules/next/dist/docs/` sebelum menulis kode Next.
- **Rahasia tidak pernah masuk git.** Env asli hanya di Vercel (sensitive) dan Supabase. Tidak memakai service-role key; isolasi lewat RLS.
- **Multi-tenant**: setiap tabel tenant punya `perusahaan_id` (kode sekolah lama: `school_id`) dan kebijakan RLS; setiap perubahan skema disertai tes pgTAP dan pengecekan `get_advisors` (security).
- Konfigurasi berupa **data** (bidang, status, aturan, template industri, tarif pajak bertanggal), bukan enum di kode. Inti kaku: ledger, stok, pajak, izin, audit.
- Angka pajak/BPJS/regulasi hanya jadi preset setelah diverifikasi ke teks resmi; sebelum itu ditandai ⚠.
- Data pelanggan/karyawan nyata tidak boleh lewat kunci AI gratis milik platform; hanya data sintetis untuk demo.
- Bahasa UI: Indonesia, sederhana. Mobile-first.
- Branch kerja: `claude/web-app-ideas-pspl5x`. Commit kecil per langkah, tanpa PR kecuali diminta.
- Klaim kebijakan/kurikulum yang belum bersumber ditandai ⚠ dan tidak dijadikan preset.

## Supabase
Proyek dev: `qxxicvqncftuktblezud` (region ap-south-1). Migrasi lewat tool MCP Supabase, simpan salinan SQL di `supabase/migrations/`.
