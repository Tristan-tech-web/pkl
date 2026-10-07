# 02. Model data

Pola dari R5 §6: **hibrid berlapis** di Postgres. Tiga lapis, tiap lapis aturannya beda.

## Lapis 1: inti kaku (tabel nyata, skema tetap)
Tidak boleh diubah pengguna. Diubah hanya lewat migrasi tim, dengan tes.

| Kelompok | Tabel (nama kerja) | Catatan |
|---|---|---|
| Tenant | `perusahaan`, `unit` (cabang/outlet, hirarki), `keanggotaan`, `peran`, `izin_peran`, `undangan` | Semua tabel tenant punya `perusahaan_id`. Satu pemilik bisa punya banyak perusahaan. Akuntan eksternal diundang ke banyak perusahaan. |
| Pihak | `pihak`, `pihak_peran` | Pelanggan, pemasok, karyawan, mitra dalam satu tabel (R2 §4.1) |
| Ledger | `akun`, `jurnal`, `baris_jurnal`, `periode` | Hanya INSERT. `numeric` untuk uang. Trigger tertunda menjaga debit = kredit per jurnal. Periode terkunci. Koreksi lewat jurnal pembalik. Kunci idempotensi per posting. |
| Stok | `item`, `gudang`, `gerak_stok` | Gerak stok append-only, saldo diturunkan. Metode biaya (rata-rata bergerak dulu) |
| Pajak | `aturan_pajak` (bertanggal berlaku), `tarif` | Tarif PPN, PPh, BPJS, TER sebagai **data dengan `berlaku_dari`/`berlaku_sampai` dan sumber** (R6 §7). Tidak ada angka pajak di kode. |
| Dokumen | `dokumen`, `baris_dokumen`, `seri_nomor` | Penawaran, pesanan, faktur, bukti bayar dengan status. Penomoran per seri. |
| Audit | `audit_log`, `transisi_log` | Append-only, diisi trigger generik, dipartisi waktu |
| Konfigurasi | `config_*` (lihat lapis 2) | |
| Antrean | `outbox`, `notifikasi` | Efek samping idempoten |

Dokumen transaksi (faktur dan sejenisnya) menjadi jurnal dan gerak stok lewat **fungsi posting** di database, bukan dari klien. Posting selalu di server (juga syarat offline nanti: klien hanya mengantre draf).

## Lapis 2: metadata (konfigurasi sebagai data, berversi)
Semua baris, bukan kode. Dipakai satu penerjemah di server untuk membangun form, daftar, alur.

- `tipe_entitas` (mis. "Pesanan servis", "Kunjungan sales"): nama, ikon, modul induk.
- `definisi_bidang`: tipe (teks, angka, uang, tanggal, pilihan, relasi, berkas, formula), wajib, aturan validasi (ekspresi), izin baca/tulis per peran.
- `rekaman`: `id`, `perusahaan_id`, `tipe_entitas_id`, `data jsonb`, kolom baku (status, dibuat_oleh, unit_id, dll.). Bidang kustom hidup di `data`. Tanpa DDL per tenant, tanpa EAV (R5 §3, §5).
- `mesin_status`: status dan transisi deklaratif per tipe entitas, siapa boleh, kondisi (ekspresi). Setiap transisi tercatat di `transisi_log`.
- `aturan_otomatis`: pemicu (peristiwa/jadwal), kondisi (ekspresi), aksi (buat rekaman, kirim notifikasi, minta persetujuan, posting). Dijalankan lewat outbox.
- `aturan_persetujuan`: siapa menyetujui apa di atas nilai berapa, per unit.
- `tampilan`: daftar/papan/kalender/formulir sebagai JSON (kolom, filter, urutan).
- `laporan`: definisi laporan (dimensi, ukuran, filter) yang diterjemahkan ke SQL terkontrol.
- `template_terpasang`, `overlay`: lihat bawah.

**Satu mesin ekspresi tertutup** untuk formula, validasi, kondisi alur, kondisi aturan, filter tampilan. CEL atau JSONLogic, dipilih lewat spike E6. Tidak ada eval JS.

**Promosi bidang panas**: bila bidang kustom jadi sering difilter/diagregasi, tim mempromosikannya ke kolom lewat migrasi (atau index ekspresi parsial). Batas ukuran `data` per tipe ditetapkan dari E11.

## Lapis 3: template industri dan overlay
- **Template** = paket JSON berversi di repo (tipe entitas, bidang, status, aturan, tampilan, laporan, bagan akun awal, preset pajak bila bersumber). Diuji di CI.
- **Pemasangan** menulis objek konfigurasi ke tenant dengan `asal_template` + `versi`.
- **Overlay**: ubahan pengguna disimpan terpisah dari objek template, jadi upgrade template memakai **three-way merge** (versi lama template, versi baru, ubahan pengguna). Bentrok masuk antrean tinjauan, tidak menimpa (E7).
- **Sandbox dan rilis**: perubahan konfigurasi dikerjakan di draf, diuji dengan data contoh, dirilis sebagai versi, bisa di-rollback. Ini jawaban atas keluhan "kustomisasi rusak saat upgrade" (R4 no. 4).

## Isolasi dan izin (RLS)
Pola dari R5 §4:
- **A**: `perusahaan_id` cocok dengan keanggotaan pengguna.
- **B**: izin per peran per tipe tabel/entitas (baca/tulis/hapus), dicek di kebijakan.
- **C**: cakupan unit (cabang) lewat array cakupan di klaim atau `ltree`. Dibandingkan di E2.
- Batas nilai ("hanya sampai Rp X") dicek di fungsi aksi, bukan kebijakan baris.
- Izin per kolom/bidang lewat `definisi_bidang` + view yang diterjemahkan server.
- Setiap tabel: `get_advisors` security + tes pgTAP. Pemindai katalog di CI menggagalkan build bila ada tabel tenant tanpa RLS (E9).
- Tanpa service-role key (aturan proyek tetap).

## Impor dan ekspor
- Impor: unggah xlsx/csv, deteksi kolom, pemetaan ke tipe entitas/bidang, pratinjau galat per baris, impor ulang idempoten (kunci alami dipilih pengguna).
- Ekspor: per tipe entitas dan ekspor utuh perusahaan (CSV/JSON + peta relasi) agar pindah keluar mudah.

## Pencarian dan laporan
`tsvector` + `pg_trgm` dulu (E10). Laporan keuangan baku ditulis sebagai SQL. Laporan buatan pengguna lewat penerjemah terkontrol, view terwujud untuk entitas panas (E3).

## Yang perlu dicek sebelum dikunci
Ekstensi Supabase yang tersedia (`pg_jsonschema`, `pgmq`, `pg_cron`, `ltree`) lewat `list_extensions`. Semua ambang di E1 sampai E11 adalah usulan, bukan fakta.
