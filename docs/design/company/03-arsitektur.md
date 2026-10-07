# 03. Arsitektur

## Tumpukan
| Lapisan | Pilihan | Alasan |
|---|---|---|
| Web | Next.js 16 (App Router, Server Components, server actions), React 19, Tailwind v4, PWA | Pola sudah ada dari proyek sebelumnya. Baca `apps/web/node_modules/next/dist/docs/` sebelum kode. |
| Data | Supabase Postgres + Auth + Storage | Satu penyimpan, RLS, pgTAP sudah dikuasai. |
| Auth | Supabase Auth. Pengguna tanpa email lewat kode+ID (pola `login_code` dari proyek lama) untuk kasir/staf lapangan | Staf kecil sering tidak punya email |
| Server | Server actions memanggil Supabase dengan token pengguna, `auth.getClaims()` lokal (JWT asimetris) | Tanpa service-role |
| Pekerjaan latar | `pg_cron` + `outbox` + (`pgmq` bila ada) + Edge Function | Temporal/Camunda ditunda |
| Hosting | Vercel (region dekat pengguna), Supabase region Singapura untuk produksi (keputusan) | Latensi dan UU PDP (⚠ cek ketentuan lokasi data) |
| AI | Opsional, lapis atas: bantu petakan kolom impor, bantu tulis aturan dari bahasa biasa. Tidak menyentuh ledger. BYOK, tanpa data nyata lewat kunci gratis platform | Nilai tambah, bukan inti |
| Tes | Vitest, Playwright+axe, tes SQL (pgTAP) | Seperti sebelumnya |

## Potongan utama
1. **Penerjemah metadata** (server): baca `tipe_entitas`/`definisi_bidang`/`tampilan`, bangun form dan daftar. Registri tipe bidang mengendalikan komponen UI.
2. **Evaluator ekspresi**: satu paket, dipakai server (otoritatif) dan klien (pratinjau saja).
3. **Fungsi posting** (SQL): faktur, pembayaran, gerak stok, jurnal. Idempoten, transaksi tunggal.
4. **Mesin status + aturan**: transisi lewat fungsi yang cek izin, kondisi, lalu tulis `transisi_log` dan `outbox`.
5. **Pekerja outbox**: ambil, jalankan aksi, tandai selesai. Aman diulang.
6. **Adaptor integrasi** (R6 §3): mulai dari impor berkas (mutasi bank CSV, ekspor marketplace), lalu WhatsApp, QRIS, e-sign. Tiap adaptor di balik antarmuka sama, bisa dimatikan.
7. **Pemasang template**: tulis konfigurasi + overlay + three-way merge.

## Offline
Ditunda dari MVP kecuali POS dan absensi (R3 tabel: offline hanya POS di MVP K). Aturannya sudah dikunci sekarang: klien hanya mengantre **draf** dengan ID klien; posting ke ledger selalu server-side dan idempoten. Dengan itu sinkron kemudian bisa ditambah tanpa mengubah ledger. Pustaka sinkron (PowerSync/ElectricSQL) belum dievaluasi ⚠.

## Skala
Jawaban atas peringatan R4 §6.2 ("fleksibel kewalahan di skala"): E1, E2, E3, E5, E11 dijalankan sebelum model dikunci. Hasil mentah disimpan di `docs/research/company/experiments/`.

## Keamanan dan privasi
- Rahasia tidak masuk git. `./scripts/check-secrets.sh` bersih sebelum commit.
- UU PDP dan PP 33/2026: persetujuan, retensi, hak hapus, pencatatan pemrosesan. Detail dan status ⚠ di R6 §2.
- Data gaji dan KTP karyawan kolom sensitif: izin per bidang, tercatat di audit saat dibuka.
- Pencadangan dan pemulihan diuji sebelum pelanggan nyata (M7 lama, tetap berlaku).

## Penggunaan ulang dari proyek sekolah
Dipakai: pola `React.cache` per permintaan, `getClaims`, pelacak `DB_TRACE=1`, katalog modul/paket, undangan, notifikasi, login kode+ID, MCP, struktur monorepo, skrip tes SQL, pemindai rahasia. Tidak dipakai: semua tabel dan layar sekolah, identitas "Pulau Belajar", maskot 3D (lihat `00-pivot.md`).
