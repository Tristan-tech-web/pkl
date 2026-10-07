# 01. Visi, masalah, dan siapa pemakainya

Nama kerja: **Rangka** (placeholder, belum diputuskan). Dokumen ini merangkum R2 sampai R6 di `docs/research/company/`. Angka dan klaim yang masih ⚠ di riset tetap ⚠ di sini.

## Satu kalimat
Sistem kelola usaha yang dimulai dari berkas Excel pemilik, bisa diubah sendiri oleh orang non-teknis (kolom, status, langkah persetujuan, laporan), tetapi tetap menghasilkan jurnal, stok, dan laporan pajak Indonesia yang benar dan punya jejak audit.

## Kenapa ada celah
Dari R4 §6: pemilik harus memilih antara bebas tanpa akuntansi (Excel, Airtable, Notion) atau akuntansi tanpa kebebasan (Accurate, Jurnal, ERP). ERP besar mahal dan 70 persen proyeknya disebut gagal (angka dari blog konsultan, ⚠). Aplikasi lokal paham pajak tapi kaku. Alat fleksibel tidak paham pajak dan izin. Yang bertahan di Excel dan WhatsApp bukan karena malas, tapi karena biaya pindah tinggi dan mereka merasa pegang kendali (R4 §3).

Catatan jujur: "tidak ada yang melayani celah ini" belum diuji. Odoo+lokalisasi, HashMicro, dan ERP vertikal belum dicek (R4 daftar kerja 7).

## Pernyataan masalah yang dipilih (8 dari 12 di R4 §6.1)
1. Mulai dari Excel sendiri, ubah kolom sendiri, tetap dapat jurnal dan pajak benar. (no. 1)
2. Satu proses jalan dulu dalam hitungan hari, tumbuh tanpa proyek ulang. (no. 2)
3. Perubahan kecil (status, kolom, langkah persetujuan) tanpa konsultan. (no. 3)
4. Kustomisasi tidak rusak saat versi naik. (no. 4)
5. Harga tidak menghukum yang mengajak seluruh staf. (no. 5)
6. Lapangan dan kasir bekerja walau sinyal buruk. (no. 6)
7. Laporan yang pemilik mau bisa dibuat di dalam sistem, tidak lari ke Excel. (no. 8)
8. Keluar itu mudah: ekspor utuh dengan hubungan antar data terjaga. (no. 11, ini juga cara menurunkan rasa takut masuk)

Nomor 7 (aturan pajak berubah tiap tahun) dan 9, 10, 12 ditangani oleh arsitektur (tarif sebagai data bertanggal, RLS berbasis cakupan, satu inti banyak template), bukan sebagai janji pemasaran.

## Persona
| Persona | Kebutuhan utama | Jangan sampai |
|---|---|---|
| Pemilik (1 sampai 20 orang, K) | Lihat kas, piutang, stok hari ini di HP. Impor Excel. Tidak perlu belajar istilah akuntansi. | Disuruh isi bagan akun sebelum bisa mulai |
| Staf operasional / admin | Ubah tampilan, status, kolom sendiri. Catat transaksi cepat. | Tiket ke vendor untuk satu kolom |
| Staf lapangan, kasir, gudang | Catat penjualan, stok, absensi, pengiriman di HP, offline | Login rumit, layar penuh istilah |
| Akuntan (internal atau eksternal) | Jurnal benar, periode terkunci, ekspor pajak, jejak audit, akses lintas klien | Angka yang tidak bisa ditelusuri |
| Manajer menengah (M, 20 sampai 200) | Persetujuan bertingkat, laporan per cabang | Izin yang tidak bisa ikut struktur cabang |

Pasar awal: **K**, dengan 3 sampai 4 industri pertama yang dipilih dari wawancara (kandidat: toko/distributor kecil, bengkel/jasa, F&B, kontraktor kecil). M menyusul. Ini keputusan terbuka (lihat 05 §Keputusan).

## Prinsip produk
1. **Mulai dari berkas pemilik.** Impor Excel dengan pemetaan kolom adalah fitur nomor satu, bukan tambahan.
2. **Satu proses dulu.** Modul bisa dinyalakan satu per satu. Tidak ada wizard 40 langkah.
3. **Fleksibel di pinggir, kaku di inti.** Uang, stok, pajak, izin, audit tidak bisa dikustom sembarangan. Yang lain bisa.
4. **Konfigurasi adalah data.** Bidang, status, aturan, tampilan, laporan, template: semua baris data berversi, bukan kode per pelanggan.
5. **Bisa dicoba tanpa risiko.** Perubahan konfigurasi diuji di sandbox, lalu dirilis, bisa dibatalkan.
6. **Bisa keluar.** Ekspor penuh yang menjaga relasi.
7. **Harga per perusahaan atau per modul, bukan per kursi** (hipotesis, diuji di wawancara).
8. **Indonesia dulu.** Rupiah, tanggal, nota, cetak thermal, pajak, BPJS, WhatsApp.

## Yang bukan tujuan (untuk sekarang)
Produksi/MRP penuh, konsolidasi multi-entitas, integrasi API Coretax langsung (dokumentasi resminya tidak ditemukan, R3 §12), marketplace aplikasi pihak ketiga.
