# Pivot: dari aplikasi sekolah ke management perusahaan yang super fleksibel

Status: draf awal (7 Okt 2026). Dilengkapi setelah riset `docs/research/company/R2..R6` selesai.

## Keputusan pengguna
1. Aplikasi sekolah (EduSmart v2, "Pulau Belajar") ditolak. Kodenya **tidak dihapus**: disimpan di repo lain.
2. Arah baru: management perusahaan yang **super fleksibel**, bukan sekolah. Berlaku untuk semua jenis perusahaan.
3. Urutan kerja: riset dulu (jenis perusahaan, kebutuhan, titik sulit, keluhan aplikasi yang ada, sebab dan solusinya), baru merancang ulang semuanya.

## Penyimpanan kode sekolah
- Titik terakhir yang diarsipkan: tag lokal `edusmart-sekolah-final` (commit `7ebb1b6`), juga ada di riwayat cabang `claude/web-app-ideas-pspl5x`.
- Pembuatan repo baru lewat integrasi GitHub sesi ini ditolak (403, tidak ada izin membuat repo). Push cabang atau tag baru juga ditolak oleh proxy git (hanya cabang kerja yang boleh). Jadi arsip ke repo lain butuh langkah dari pemilik: buat repo kosong (mis. `edusmart-sekolah`) atau fork `pkl`, lalu tambahkan ke sesi agar bisa di-push.
- Aturan: kode sekolah baru dihapus dari `pkl` **setelah** arsip di repo lain terverifikasi.

## Yang layak dibawa dari proyek sekolah (infrastruktur generik, bukan isi sekolah)
Dari 78 tabel di database dev, sebagian besar spesifik sekolah (rombel, kuis, XP, ujian, rapor). Yang generik dan berguna:
| Aset sekolah | Bentuk generik untuk perusahaan |
|---|---|
| `schools`, `school_members`, `roles` (kapabilitas) | organisasi/tenant, anggota, peran dengan kapabilitas |
| `invites` + `redeem_invite` | undangan karyawan/mitra dengan kode |
| `plans`, `plan_entitlements`, `modules`, `plan_modules`, `school_modules` | katalog modul yang bisa dinyalakan per perusahaan dan per paket |
| `notifications`, `announcements` | pusat notifikasi dan pengumuman internal |
| `school_files`, data hub, `roster_people` + impor CSV | pusat berkas dan impor data massal |
| `letters`, `letter_templates` | dokumen bertemplate (surat, kontrak) |
| `invoices`, `payments` | embrio tagihan (perlu diganti buku besar sungguhan) |
| `user_ai_keys` (BYOK), `ai_usage` | AI dengan kunci milik pengguna dan batas pakai |
| `mcp_tokens`, OAuth MCP | akses agen/AI eksternal ke data perusahaan |
| `school_appearance`, `user_preferences` | merek perusahaan dan preferensi tampilan |
| Pola RLS, tes SQL (`supabase/tests`), pemindai rahasia, CI | tetap dipakai |
| `login_code` + ID murid | pola "masuk tanpa email" untuk staf lapangan |

Yang **tidak** dibawa: model rombel/kurikulum, kuis dan XP, ujian, rapor, "Pulau Belajar", maskot Pena.
