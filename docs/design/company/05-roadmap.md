# 05. Peta jalan, eksperimen, risiko, keputusan

Prioritas dari R3 §11 (K = 1 sampai 20 orang, M = 20 sampai 200), urutan kerja dari R5 §6.3. Semua ⚠ tentang pajak harus diverifikasi ke teks resmi sebelum menjadi data preset.

## Fase
**F0. Fondasi (tanpa fitur pengguna)**
Arsip kode sekolah terverifikasi, `CLAUDE.md` dan struktur repo baru, CI (lint, typecheck, tes, pemindai rahasia), proyek Supabase untuk produk perusahaan, `list_extensions`.
*Selesai bila:* CI hijau, rahasia bersih, arsip terverifikasi.

**F1. Multi-tenant + ledger**
`perusahaan`, `unit`, `keanggotaan`, `peran`, RLS pola A/B, pemindai katalog (E9). Ledger kaku + fungsi posting + E5.
*Selesai bila:* tes lintas-tenant nol pelanggaran; jurnal tak seimbang mustahil; posting ulang idempoten.

**F2. Inti fleksibel**
`tipe_entitas`/`definisi_bidang`/`rekaman`, penerjemah filter, form dan daftar dari metadata, evaluator ekspresi (E6), E1, E2, E11.
*Selesai bila:* pengguna menambah kolom dan filter tanpa kode; p95 daftar sesuai ambang E1.

**F3. Satu proses ujung ke ujung: Jual → Tagih → Terima uang**
Impor Excel (pelanggan, barang, faktur lama), faktur + nota cetak, pembayaran, kas dan bank, laba rugi dan neraca (SAK EMKM ⚠ cek), dasbor pemilik, stok satu gudang. Pencatatan PPh final 0,5 persen dan ekspor daftar faktur (status aturan ⚠).
*Selesai bila:* pemilik uji impor Excel-nya sendiri dan melihat angka hari ini dalam kurang dari satu jam (hipotesis diuji dengan 3 pemilik).

**F4. Alur dan aturan**
Mesin status, persetujuan satu tingkat, aturan otomatis via outbox (E8), notifikasi (email, tautan WhatsApp klik-untuk-kirim).

**F5. Template dan sandbox**
Paket template untuk 3 sampai 4 industri, overlay + three-way merge (E7), sandbox/rilis/rollback konfigurasi, ekspor utuh.

**F6. Pembelian, stok lanjut, SDM**
Tagihan pemasok, PO, multi gudang, opname. Karyawan, absensi, cuti, slip gaji. Penggajian dengan PPh 21 TER dan BPJS hanya setelah angka diverifikasi ke sumber resmi (⚠).

**F7. POS, offline, laporan buatan pengguna**
POS dengan antrean draf offline, QRIS, printer. Pembangun laporan (E3). Pencarian (E10).

**F8. Skala M**
Persetujuan bertingkat menurut nilai, peran per cabang/kolom, multi-entitas, PPN, e-Bupot, API/webhook.

**Pengerasan (jalan terus)**: UU PDP, audit, backup + uji pulih, aksesibilitas, beban.

## Eksperimen (dari R5 §6.2)
E1 JSONB vs kolom vs EAV · E2 RLS dengan hirarki unit · E3 laporan atas bidang kustom · E4 DDL per tenant (hanya bila dipertimbangkan, default ditolak) · E5 throughput ledger · E6 CEL vs JSONLogic · E7 migrasi template · E8 aturan di bawah beban · E9 isolasi tenant · E10 pencarian · E11 ukuran JSONB. Skrip dapat diulang, hasil mentah disimpan, RLS aktif saat ukur.

## Riset yang masih harus dikerjakan
1. Wawancara 15 sampai 20 pemilik usaha + 5 akuntan; uji 12 pernyataan masalah dan urutan prioritas.
2. Verifikasi pajak ke teks resmi: PPh final UMKM 0,5 persen (status PP 55/2022), PPN 12 persen DPP 11/12, PPh 21 TER, BPJS, format faktur Coretax, status e-Faktur Desktop (R3 §12, R6 §6).
3. Cek pesaing yang mungkin sudah mengisi celah (Odoo Indonesia, HashMicro, Kledo, ERP vertikal) (R4 daftar 7).
4. Ulasan Play Store (Jurnal, Accurate, Kledo, Moka, Majoo, BukuWarung, Talenta), hitung tema bintang 1 sampai 2.
5. Pilih industri awal berdasarkan wawancara, bukan tebakan.

## Risiko utama
| Risiko | Penanganan |
|---|---|
| Cakupan terlalu lebar (ERP penuh) | F3 satu proses dulu; modul lain menunggu bukti pakai |
| Fleksibel tapi lambat di skala | E1/E2/E3/E5 sebelum dikunci; promosi bidang panas ke kolom |
| Kesalahan pajak/payroll merugikan pelanggan | Tarif sebagai data bersumber dan bertanggal; pajak payroll tidak dirilis sebelum diverifikasi dan diaudit akuntan |
| Kustomisasi rusak saat upgrade | Overlay + three-way merge + sandbox + rollback |
| Orang tetap di Excel | Impor jadi fitur utama; ekspor selalu ada |
| Kebocoran antar tenant | RLS di tiap tabel, pemindai CI, pgTAP, advisors |
| Pasar menolak (seperti proyek sekolah) | Validasi lewat wawancara dan uji dengan pemilik nyata sebelum membangun luas |
| Regulasi berubah | Aturan sebagai data, pengamat perubahan manual per kuartal |

## Keputusan yang butuh pengguna
1. **Arsip kode sekolah**: buat repo kosong (atau fork) dan tambahkan ke sesi. Pembuatan repo/tag lewat integrasi ditolak 403. Kode sekolah tidak dihapus dari `pkl` sebelum arsip terverifikasi.
2. **Nama produk** (Rangka hanya placeholder).
3. **Proyek Supabase**: proyek baru untuk produk perusahaan (disarankan) atau pakai proyek dev yang ada; produksi di Singapura.
4. **Pasar awal**: K dulu, dan industri yang dipilih setelah wawancara.
5. **Wawancara**: siapa yang bisa kamu hubungi (pemilik usaha dan akuntan)?
