# R3. Fungsi bisnis dan kebutuhan platform manajemen perusahaan

Tanggal riset: 7 Oktober 2026. Bagian 2 dari riset arah baru (platform manajemen perusahaan fleksibel, fokus Indonesia, pola global).

Cara baca tanda:
- ⚠ = belum bersumber kuat, atau sumbernya saling bertentangan, atau aturan sedang berubah. Verifikasi ke aturan resmi (peraturan.go.id, pajak.go.id, bpjs) atau konsultan pajak sebelum jadi preset.
- Angka tanpa sumber tidak ditulis. Bila angka tidak ditemukan, ditulis "belum diverifikasi".
- Pola umum (alur, status, laporan) di bagian non-pajak berasal dari praktik ERP yang lazim (Odoo, ERPNext, Accurate, Jurnal, Zahir) dan pengetahuan umum penulis, bukan dari satu dokumen. Bagian itu ditandai "pola umum".

Prinsip yang berlaku di semua fungsi, sesuai CLAUDE.md: konfigurasi adalah data (bukan enum di kode), setiap tabel tenant punya `company_id` dan RLS, tanpa service-role key.

---

## 0. Ringkasan temuan

1. Fungsi yang paling dicari pemilik usaha kecil Indonesia: faktur dan penjualan, stok, laporan laba rugi, kas dan bank, gaji, pajak. Urutan ini juga urutan MVP yang disarankan.
2. Bagian tersulit bukan teknologinya, tapi aturannya: pajak (Coretax, TER, PPN 12 persen dengan DPP nilai lain), BPJS, dan standar akuntansi, yang semuanya berubah tiap tahun. Aturan harus disimpan sebagai data bertanggal berlaku, bukan ditulis di kode.
3. Satu buku besar (jurnal berpasangan) harus jadi pusat. Semua modul lain hanya membuat jurnal lewat aturan posting yang bisa dikonfigurasi.
4. Coretax aktif sejak 1 Januari 2025 dan masih sering bermasalah. Integrasi pajak sebaiknya berupa ekspor/impor berkas dulu, API belakangan.
5. Untuk usaha 1 sampai 20 orang, SAK EMKM dan PPh final 0,5 persen membuat akuntansi jauh lebih sederhana. Platform tetap harus menyiapkan jalur ke SAK Entitas Privat untuk usaha menengah.

---

## 1. Keuangan dan akuntansi

### Tujuan
Mencatat semua kejadian uang secara berpasangan (debit dan kredit), menghasilkan laporan keuangan yang bisa dipakai untuk keputusan, bank, pajak, dan audit.

### Standar akuntansi (pengaturan, bukan kode)
- SAK EMKM: untuk usaha mikro, kecil, menengah. Sederhana: laporan posisi keuangan, laporan laba rugi, catatan atas laporan keuangan. Biaya historis.
- SAK ETAP: dicabut dan digantikan SAK Entitas Privat (SAK EP), berlaku efektif 1 Januari 2025. SAK EP lebih lengkap dari SAK ETAP (35 bab, ada pajak tangguhan, instrumen keuangan lebih rinci). Setelah SAK EP, opsi "turun kelas" ke SAK EMKM tidak dibuka lagi menurut ringkasan DDTC. ⚠ Syarat entitas yang boleh pakai SAK EMKM versus SAK EP perlu dibaca langsung di publikasi DSAK IAI sebelum dibuat preset.
- PSAK (berbasis IFRS): untuk entitas dengan akuntabilitas publik (tercatat di bursa, bank, asuransi). Kelas ini bukan target awal.
- Arti desain: paket "kerangka laporan" per perusahaan (EMKM, EP, PSAK) sebagai data. Tiap paket menentukan susunan laporan dan bagan akun bawaan. Perusahaan boleh ganti paket, dengan peringatan bila ada transaksi yang perlu penyesuaian.

### Objek data dan atribut penting
| Objek | Atribut penting |
|---|---|
| Entitas/perusahaan | nama, NPWP (16 digit), NITKU per cabang, mata uang fungsional, kerangka akuntansi, awal tahun buku, metode persediaan |
| Bagan akun | kode, nama, tipe (aset, liabilitas, ekuitas, pendapatan, beban), induk, boleh diposting langsung, mata uang akun, terkait pajak, aktif |
| Periode akuntansi | tahun buku, bulan, status (terbuka, ditutup sementara, dikunci) |
| Jurnal | nomor, tanggal, referensi sumber (dokumen asal), periode, status, pembuat, mata uang, kurs |
| Baris jurnal | akun, debit, kredit, pihak (pelanggan/pemasok/karyawan), cabang, proyek/pusat biaya, tag analitik |
| Pihak ketiga | pelanggan, pemasok, karyawan, NPWP/NIK, termin, akun kontrol |
| Rekening bank dan kas | nama bank, nomor, akun buku besar, mata uang |
| Mutasi bank | tanggal, deskripsi, jumlah, saldo, status cocok |
| Aset tetap | kategori, tanggal perolehan, nilai perolehan, umur manfaat, nilai sisa, metode, lokasi, status |
| Anggaran | periode, akun/pusat biaya, jumlah, versi |
| Kurs | mata uang, tanggal, kurs, sumber |

### Alur dan status
- Jurnal: draf, diposting, dibalik (reversal). Jurnal yang sudah diposting tidak diedit, hanya dibalik atau dikoreksi dengan jurnal baru. Pola umum.
- Periode: terbuka, ditutup sementara (hanya peran tertentu), dikunci (tak ada posting).
- Kas dan bank: terima, bayar, transfer antar-rekening. Rekonsiliasi: mutasi bank diimpor (CSV/Excel/MT940), disarankan cocok otomatis dengan transaksi, sisanya dicocokkan manual atau dibuatkan jurnal baru.
- Piutang: faktur, terbayar sebagian, lunas, jatuh tempo, macet. Hutang: tagihan pemasok, dijadwalkan bayar, dibayar.
- Aset tetap: draf, aktif, disusutkan penuh, dilepas/dijual. Penyusutan bulanan dibuat jurnal otomatis. Metode umum: garis lurus dan saldo menurun. ⚠ Kelompok dan tarif penyusutan fiskal (UU PPh Pasal 11) perlu dicek terpisah dari penyusutan komersial.
- Tutup buku: bulanan (cek semua draf selesai, rekonsiliasi, penyusutan, akrual, selisih kurs), tahunan (jurnal penutup, saldo laba pindah ke tahun baru, kunci periode).

### Persetujuan
- Jurnal manual di atas batas nilai tertentu perlu persetujuan. Pembayaran besar perlu dua orang (pembuat dan penyetuju). Buka kunci periode hanya peran pemilik/akuntan senior. Pola umum.

### Laporan yang dicari
Neraca/laporan posisi keuangan, laba rugi, arus kas (metode langsung dan tidak langsung), perubahan ekuitas, buku besar, neraca saldo, umur piutang dan hutang, laporan anggaran vs realisasi, laba rugi per cabang/proyek, laporan kas harian.

### Integrasi yang diharapkan
Impor mutasi bank (CSV/Excel, MT940; koneksi langsung ke bank/open banking ⚠ belum diverifikasi ketersediaannya untuk usaha kecil), payment gateway (Midtrans, Xendit, dan sejenis), e-commerce (Tokopedia, Shopee), ekspor ke akuntan (Excel), Coretax lewat modul pajak.

### Yang membuatnya susah
- Integritas: jumlah debit sama kredit di database, tidak bisa dilewati. Perlu constraint dan tes pgTAP.
- Multi-mata uang: kurs, selisih kurs terealisasi dan belum terealisasi, revaluasi akhir bulan.
- Rekonsiliasi bank otomatis: format mutasi tiap bank beda, deskripsi tidak seragam, satu mutasi bisa melunasi banyak faktur.
- Penyusutan: perubahan nilai, pelepasan di tengah bulan, revaluasi, pemisahan komersial dan fiskal.
- Tutup buku dan penguncian: koreksi sesudah tutup tanpa merusak laporan yang sudah dilaporkan.
- Bagan akun bawaan per jenis usaha: terlalu banyak variasi (dagang, jasa, manufaktur, restoran, konstruksi). Solusi: templat bagan akun sebagai data.
- Perubahan standar (SAK ETAP ke SAK EP) memengaruhi nama laporan dan pos.
- Laporan berat pada data besar: perlu saldo harian terakumulasi (materialized), bukan hitung ulang tiap buka.

---

## 2. Pajak Indonesia

Peringatan umum: aturan pajak Indonesia berubah cepat. Semua angka di bagian ini harus dimasukkan ke tabel aturan dengan kolom `berlaku_mulai`, `berlaku_sampai`, `sumber`, dan diverifikasi konsultan pajak sebelum rilis. Tanggal tiap aturan dicantumkan di bawah.

### 2.1 Tujuan
Menghitung, memungut/memotong, membayar, dan melaporkan pajak dengan benar dan tepat waktu, dengan data yang langsung berasal dari transaksi (faktur, gaji, pembayaran jasa).

### 2.2 Dasar sistem: Coretax dan NPWP 16 digit
- Coretax DJP berlaku sejak 1 Januari 2025, diluncurkan 31 Desember 2024. Ia menggantikan berbagai aplikasi terpisah (e-Faktur, e-SPT, e-Bupot, DJP Online untuk sebagian besar fungsi). Sumber: pajak.go.id, DDTC.
- Login dengan NIK, NPWP, atau NITKU. Isian pembeli di faktur memakai NPWP 16 digit yang otomatis menampilkan data pembeli. Untuk orang pribadi, NPWP 16 digit adalah NIK. Badan memakai NPWP 16 digit dengan NITKU per lokasi/cabang. ⚠ Detail format NITKU (nomor identitas tempat kegiatan usaha) dan aturan transisi perlu dicek di ketentuan DJP.
- Setelah masalah teknis di awal 2025, DJP lewat KEP-54/PJ/2025 (12 Februari 2025) mengizinkan PKP yang dikukuhkan sebelum 1 Januari 2025 kembali memakai e-Faktur Desktop untuk membuat dan mengganti faktur keluaran. Pelaporan SPT Masa PPN, retur, dan pembatalan faktur tetap lewat Coretax. ⚠ Status e-Faktur Desktop per Oktober 2026 belum diverifikasi.
- SPT Tahunan PPh Tahun Pajak 2025 dilaporkan lewat Coretax; e-Filing dan e-Form untuk SPT Tahunan dihentikan (pajak.go.id).
- Bagi ERP, jalur integrasi: penyedia aplikasi resmi (PJAP) atau API Coretax dengan OAuth2 dan sertifikat digital. Satu sumber vendor ERP (saka-erp.id) menyebut API REST/JSON dengan ISO 8601 dan penyimpanan NSFP. ⚠ Itu sumber vendor, bukan DJP. Dokumentasi API resmi belum ditemukan dalam riset ini. Rencanakan ekspor/impor berkas (Excel/XML sesuai templat Coretax) sebagai jalur pertama.

### 2.3 PPN
- Tarif PPN 12 persen secara hukum, tetapi lewat PMK 131 Tahun 2024 dan PER-1/PJ/2025, untuk barang/jasa non-mewah dasar pengenaan pajak (DPP) memakai nilai lain 11/12 dari nilai transaksi, sehingga PPN yang dibayar efektif tetap 11 persen. Barang mewah memakai 12 persen penuh. Faktur dengan kode 04 (DPP nilai lain) dibuat di Coretax. Sumber: IKPI, Ortax, DDTC.
- ⚠ Aturan tarif berubah dalam setahun terakhir (Coretax, nilai lain). Cek kondisi terakhir per Oktober 2026 di pajak.go.id sebelum jadi preset. Kemungkinan ada perubahan lanjutan yang tidak tertangkap riset ini.
- Pengusaha Kena Pajak (PKP): wajib dikukuhkan bila omzet setahun melewati Rp4,8 miliar (Kontan, pajak.go.id). ⚠ Cek dasar hukum (PMK 197/PMK.03/2013) dan perubahannya.
- Objek data: faktur pajak keluaran (nomor seri NSFP, kode transaksi, tanggal, NPWP/NIK pembeli, DPP, DPP nilai lain, PPN, PPnBM), faktur masukan (dari pemasok, bisa dikreditkan bila memenuhi syarat), retur, pembatalan.
- Status: draf, terbit (disetujui/diunggah ke Coretax), diganti, dibatalkan.
- Laporan: SPT Masa PPN (bulanan), daftar faktur keluaran/masukan, rekonsiliasi PPN buku besar vs SPT, kredit pajak masukan yang tidak bisa dikreditkan.
- Susah: kode transaksi (01, 02, 03, 04, 07, 08 dan seterusnya) dengan aturan berbeda; dokumen tertentu (pembeli tanpa NPWP memakai NIK); pajak masukan hanya bisa dikreditkan bila faktur sah dan masa pajak sesuai; penggantian faktur; PPN atas uang muka dan termin proyek; pembulatan antara sistem dan Coretax.

### 2.4 PPh 21 (karyawan) dan tarif efektif rata-rata (TER)
- Dasar hukum: PP 58 Tahun 2023 dan PMK 168 Tahun 2023, berlaku untuk penghasilan sejak 1 Januari 2024 (pajak.go.id, pajak.com). PMK 168/2023 menggantikan PMK 252/2008.
- Cara kerja: Januari sampai November (masa pajak bukan terakhir) pemotongan = penghasilan bruto bulanan x tarif efektif bulanan. Masa pajak terakhir (Desember, atau saat berhenti kerja) dihitung ulang dengan tarif Pasal 17 UU PPh untuk setahun penuh, lalu dikurangi pajak yang sudah dipotong.
- Kategori TER menurut status PTKP: A untuk TK/0, TK/1, K/0. B untuk TK/2, TK/3, K/1, K/2. C untuk K/3. Tabel tarifnya ada di lampiran PMK 168/2023. ⚠ Angka tabel tidak disalin di sini, ambil langsung dari lampiran resmi.
- Pegawai tidak tetap harian: tarif efektif harian, 0 persen sampai penghasilan harian Rp450.000, 0,5 persen untuk Rp450.000 sampai Rp2.500.000 (pajak.com). ⚠ Lampiran lain berlaku untuk penghasilan harian di atas itu dan untuk jenis penerima lain (bukan pegawai, mantan pegawai, dan lainnya).
- Objek data: karyawan (NIK/NPWP, status PTKP), komponen penghasilan (tetap, tidak tetap, tunjangan, bonus, THR), iuran pensiun dan JHT yang mengurangi, pajak dipotong tiap bulan, bukti potong.
- Susah: THR dan bonus yang membuat penghasilan bulan itu naik (dihitung bruto bulan tersebut dengan TER, lalu koreksi Desember); karyawan masuk/keluar di tengah tahun; pindah status PTKP; gross-up (pajak ditanggung perusahaan); karyawan dengan dua pemberi kerja.

### 2.5 PPh 23, 4(2), 22, 25, 29
- PPh 23: 15 persen atas dividen, bunga, royalti, hadiah; 2 persen atas sewa harta (selain tanah/bangunan) dan jasa teknik, manajemen, konstruksi, konsultan, dan jasa lain yang ditetapkan. Tarif lebih tinggi 100 persen bila penerima tak punya NPWP (ketentuan lama). ⚠ Cek apakah perlakuan itu masih berlaku setelah NPWP 16 digit/NIK. Sumber utama: pajak.com, online-pajak.
- PPh 4(2) final: contoh sewa tanah/bangunan, jasa konstruksi, dan lainnya, tarif tergantung jenis. ⚠ Tarif per jenis belum dikumpulkan di riset ini.
- Pemotongan PPh 23, 4(2), 22, 15 dan PPh non-residen dibuat bukti potong lewat e-Bupot Unifikasi, yang sejak 2025 terintegrasi di Coretax (PMK 81 Tahun 2024). Jika memakai NIK untuk penerima orang pribadi, tarif normal berlaku (DDTC).
- PPh 25 (angsuran bulanan) dan PPh 29 (kurang bayar akhir tahun): dihitung dari PPh tahun lalu atau perkiraan, dikreditkan pajak yang sudah dipotong pihak lain dan PPh 22/23/24 yang sudah dibayar. ⚠ Rumus rinci (angsuran, dasar penghitungan, pengurangan karena fasilitas) perlu diverifikasi.
- PPh badan: tarif umum 22 persen. Fasilitas Pasal 31E: tarif dikurangi 50 persen (jadi efektif 11 persen) untuk bagian penghasilan kena pajak sampai Rp4,8 miliar, bagi badan dengan omzet sampai Rp50 miliar. Sumber: online-pajak, DDTC. ⚠ Verifikasi batas.
- Objek data: pemotongan per transaksi (penerima, NPWP/NIK, jenis penghasilan, kode objek, DPP, tarif, jumlah, masa), bukti potong terbit, SPT masa.
- Susah: mencocokkan jenis jasa ke kode objek pajak dan tarif; pemotongan berdasarkan tanggal bayar atau akrual; penerima tak berNPWP; kredit pajak dari bukti potong yang dipotong pihak lain (harus cocok dengan data Coretax, sering selisih).

### 2.6 Pajak final UMKM 0,5 persen
- PP 55 Tahun 2022: tarif 0,5 persen dari omzet bruto. Jangka waktu pemanfaatan: orang pribadi paling lama 7 tahun pajak; koperasi, CV, firma, BUMDes, perseroan perorangan paling lama 4 tahun; PT 3 tahun. Omzet tidak kena pajak Rp500 juta setahun untuk orang pribadi (pajak.com, IKPI).
- Berita 31 Oktober 2025 (DDTC): pemerintah berencana memberlakukan PPh final 0,5 persen tanpa batas waktu untuk UMKM orang pribadi dan perseroan perorangan, koperasi sampai tahun pajak 2029, lewat revisi PP 55/2022 yang saat itu belum terbit. ⚠ Status revisi per Oktober 2026 belum diverifikasi. Jangan hardcode batas waktu 7/4/3 tahun, dan jangan hardcode "tanpa batas waktu".
- Batas omzet: sampai Rp4,8 miliar setahun. Di atasnya keluar dari rezim final.
- Objek data: omzet bruto bulanan, omzet kumulatif tahun berjalan, tahun mulai memanfaatkan, sisa omzet tidak kena pajak, setoran PPh final (kode billing), tanggal setor.
- Susah: batas waktu per bentuk badan; omzet tidak kena pajak yang dihitung kumulatif; usaha yang menjadi PKP; kombinasi dengan PPh 23 yang dipotong pihak lain (ada surat keterangan bebas/SKB bagi WP final) ⚠.

### 2.7 e-Meterai
- UU 10 Tahun 2020 (26 Oktober 2020): bea meterai Rp10.000, berlaku sejak 1 Januari 2021, dokumen bernilai di atas Rp5 juta atau jenis dokumen tertentu. e-Meterai diatur lewat PMK 133 dan 134 Tahun 2021, dibuat oleh Perum Peruri.
- Untuk platform: tanda bukti pembelian, kontrak, surat perjanjian, dan dokumen digital tertentu perlu e-Meterai. Integrasi ke penyedia resmi (Peruri, atau penyedia e-sign terdaftar) dibutuhkan pada modul dokumen/kontrak. ⚠ Jenis dokumen yang wajib (dan pengecualian) harus dibaca langsung dari UU.

### 2.8 Laporan pajak yang dicari
Daftar faktur keluaran/masukan siap impor Coretax, rekap bukti potong per jenis, rekap PPh 21 per karyawan per bulan, SPT masa PPN, rekonsiliasi pajak buku vs fiskal, jadwal jatuh tempo dan denda, perkiraan pajak bulan berjalan.

### 2.9 Susahnya (ringkas)
Aturan berubah-ubah, ada selisih antara sistem DJP dan buku sendiri, Coretax tidak stabil, perlu bukti potong tepat waktu, banyak pengecualian dan kode. Solusi desain: tabel aturan pajak bertanggal, mesin penghitung terpisah dengan tes, dan fitur "tandai perlu verifikasi" pada hasil.

---

## 3. Penjualan dan CRM

### Tujuan
Dari calon pelanggan sampai uang masuk, dengan jejak yang jelas.

### Objek data
| Objek | Atribut |
|---|---|
| Lead | nama, kontak, sumber, penanggung jawab, status, nilai perkiraan |
| Peluang | tahap, probabilitas, tanggal tutup perkiraan |
| Pelanggan | nama, NPWP/NIK, alamat penagihan dan kirim, termin, limit kredit, daftar harga, sales |
| Penawaran | nomor, versi, masa berlaku, baris produk, diskon, syarat |
| Pesanan penjualan | referensi penawaran, jadwal kirim, gudang, status |
| Surat jalan | pengiriman parsial |
| Faktur | referensi pesanan, tanggal, jatuh tempo, pajak, pembayaran |
| Langganan | produk, siklus (bulanan, tahunan), tanggal berikutnya, jumlah |
| Daftar harga | produk, satuan, jumlah minimal, grup pelanggan, periode |
| Komisi | aturan (persen dari penjualan, dari margin, bertingkat), periode, status |

### Alur dan status
- Lead: baru, dihubungi, memenuhi syarat, jadi peluang atau hilang.
- Penawaran: draf, terkirim, disetujui pelanggan, kedaluwarsa, ditolak.
- Pesanan: draf, dikonfirmasi, dikirim sebagian, selesai, dibatalkan.
- Faktur: draf, terbit, dibayar sebagian, lunas, dibatalkan/dikredit (nota kredit).
- Langganan: aktif, ditunda, dibatalkan. Generator faktur berulang membuat draf atau faktur otomatis.
- Pola umum untuk semua alur di atas.

### Persetujuan
Diskon di atas batas per peran, limit kredit terlampaui, harga di bawah margin minimal, nota kredit. Persetujuan bertingkat sesuai nilai.

### Laporan
Corong penjualan, penjualan per produk/pelanggan/sales/cabang, umur piutang, margin, komisi per sales, retensi dan pendapatan berulang (MRR) untuk langganan, penawaran terbuka.

### Integrasi
WhatsApp (kirim penawaran dan faktur), email, e-commerce/marketplace (sinkron pesanan dan stok), payment gateway (tautan bayar, QRIS ⚠ perlu cek penyedia), pajak (faktur keluaran), ongkos kirim (kurir).

### Susah
- Harga bertingkat dan diskon berlapis (per pelanggan, per jumlah, per periode, promo) dengan aturan prioritas yang jelas dan bisa dijelaskan ke pengguna.
- Komisi: dasar hitung (dibayar atau terbit?), retur memotong komisi, split antar-sales, target bertingkat.
- Langganan: prorata, perubahan paket di tengah siklus, penagihan gagal.
- Faktur pajak dengan DPP nilai lain bercampur dengan barang mewah dan bebas pajak dalam satu faktur.
- CRM yang terlalu berat membuat usaha kecil tidak memakainya. Sediakan versi ringan.

---

## 4. Pembelian dan pemasok

### Tujuan
Membeli dengan kontrol, dan membayar hanya yang benar-benar diterima.

### Objek data
Pemasok (NPWP, rekening bank, termin, kategori), permintaan pembelian (PR), permintaan penawaran (RFQ), pesanan pembelian (PO: baris, harga, jadwal, gudang tujuan), penerimaan barang (GRN: jumlah diterima, lot/serial, kualitas), tagihan pemasok (nomor faktur pemasok, faktur pajak masukan, jatuh tempo), retur pembelian, pembayaran.

### Alur dan status
- PR: draf, diajukan, disetujui, diproses jadi PO, ditolak.
- PO: draf, dikirim ke pemasok, dikonfirmasi, diterima sebagian, diterima penuh, ditutup.
- Tagihan: draf, perlu cocok, cocok, disetujui bayar, dibayar.
- 3-way match: PO, penerimaan barang, tagihan harus cocok dalam toleransi (jumlah dan harga). Bila tidak cocok, tagihan tertahan dan ditandai selisih. Pola umum.

### Persetujuan
PR dan PO bertingkat menurut nilai dan kategori, pemasok baru perlu persetujuan, perubahan rekening bank pemasok perlu persetujuan kedua (pencegahan penipuan).

### Laporan
Pembelian per pemasok/kategori, umur hutang, PO terbuka, kinerja pemasok (ketepatan, kualitas), selisih harga pembelian, pajak masukan, pemotongan PPh 23 atas jasa.

### Integrasi
Email/WhatsApp ke pemasok, impor faktur pajak masukan dari Coretax, bank (pembayaran massal, file transfer bank ⚠ format per bank belum diverifikasi), e-procurement/katalog.

### Susah
- 3-way match dengan penerimaan parsial, harga berubah, biaya tambahan (ongkos, bea masuk) yang dialokasikan ke nilai persediaan (landed cost).
- Pembelian jasa vs barang: jasa tidak ada penerimaan fisik, perlu "konfirmasi jasa".
- Faktur pajak masukan dari pemasok sering telat atau salah.
- Pemotongan PPh 23 saat membayar jasa harus otomatis.
- Pembelian dalam mata uang asing.

---

## 5. Persediaan dan gudang

### Tujuan
Mengetahui stok yang benar di tiap lokasi, dan nilainya di buku.

### Objek data
Produk (kode, nama, tipe: barang stok, jasa, bahan, kit), varian, satuan dasar dan konversi (dus, lusin, pcs), kategori, gudang dan lokasi (rak/bin), lot/batch (nomor, tanggal produksi, kedaluwarsa), serial, mutasi stok (tanggal, tipe, jumlah, nilai), saldo stok per lokasi, stok opname (lembar hitung, selisih), transfer antar-gudang, titik pesan ulang.

### Alur dan status
- Penerimaan, pengeluaran, transfer (draf, dalam perjalanan, diterima), penyesuaian, opname (draf, sedang dihitung, direview, diposting).
- Metode nilai: rata-rata bergerak (moving average) dan FIFO. ⚠ Metode yang diterima untuk pajak/standar perlu diverifikasi (LIFO tidak dibolehkan di SAK/IFRS; ini pengetahuan umum, bukan hasil riset sumber). Satu metode per kategori produk atau per perusahaan, bisa diatur sebagai data, tidak berubah sembarangan setelah ada transaksi.
- Kedaluwarsa: FEFO (yang lebih cepat kedaluwarsa keluar dulu), peringatan sebelum tanggal.
- Satuan konversi: stok disimpan dalam satuan dasar, transaksi boleh satuan lain.

### Persetujuan
Penyesuaian stok dan hasil opname perlu persetujuan, karena langsung memengaruhi laba.

### Laporan
Kartu stok, saldo stok per gudang, nilai persediaan, stok minimum, barang kedaluwarsa/hampir, perputaran stok, selisih opname, barang lambat laku.

### Integrasi
Pemindai barcode/QR, printer label, marketplace (sinkron stok), kurir, POS.

### Susah
- Perhitungan nilai FIFO/rata-rata dengan transaksi mundur (backdated) dan retur: harus menghitung ulang biaya yang sudah dibebankan.
- Stok negatif: izinkan atau tidak? Biasanya perlu opsi per perusahaan.
- Lot dan serial menambah beban data entri; harus opsional per produk.
- Konkurensi: dua kasir menjual stok terakhir bersamaan. Perlu kunci di database.
- Konversi satuan dengan pembulatan.
- Stok opname di gudang yang tetap beroperasi (cut-off).
- Offline: stok di perangkat bisa tertinggal.

---

## 6. Produksi

### Tujuan
Mengubah bahan menjadi barang jadi, dengan biaya yang bisa ditelusuri.

### Objek data
BOM (daftar bahan: komponen, jumlah, satuan, persen susut/scrap, versi, bertingkat), routing (urutan operasi, pusat kerja, waktu setup dan proses, biaya per jam), pusat kerja/mesin (kapasitas, biaya), work order (produk, jumlah, tanggal, status, BOM dan routing yang dipakai), konsumsi bahan, hasil produksi, produk sampingan, biaya (bahan, tenaga kerja, overhead), subkontrak (pemasok, bahan dikirim, barang dikembalikan, biaya jasa).

### Alur dan status
- Work order: draf, dikonfirmasi, bahan siap, berjalan, selesai, ditutup, dibatalkan.
- Subkontrak: kirim bahan ke pihak ketiga (stok di lokasi subkon), terima barang jadi, tagihan jasa.
- Selesai produksi: stok bahan keluar, stok barang jadi masuk, biaya dikapitalisasi ke persediaan.

### Persetujuan
Pelepasan work order, perubahan BOM aktif, penyesuaian selisih produksi.

### Laporan
Biaya per work order, selisih (varians) standar vs aktual, hasil dan susut, utilisasi mesin, WIP (barang dalam proses), kebutuhan bahan (MRP sederhana).

### Integrasi
Mesin/IoT (jauh di fase lanjut), barcode, penjadwalan.

### Susah
- Alokasi overhead dan biaya tenaga kerja ke produk.
- Barang dalam proses dan biaya WIP di akhir periode.
- Produk sampingan, hasil campuran (proses kimia/makanan), resep dengan rendemen.
- BOM bertingkat dan versi.
- Subkontrak: stok milik kita di tempat orang lain, plus PPN dan pemotongan PPh jasa.
- Banyak usaha kecil Indonesia (katering, konveksi, bengkel) butuh versi ringan: resep sederhana tanpa routing.

---

## 7. Proyek, tugas, timesheet, penagihan

### Tujuan
Mengelola pekerjaan berbasis proyek, mencatat waktu dan biaya, dan menagih sesuai progres.

### Objek data
Proyek (klien, tanggal, anggaran, tipe penagihan, manajer), fase/milestone, tugas (penanggung jawab, status, estimasi jam, prioritas, tanggal), timesheet (karyawan, tanggal, jam, tugas, bisa ditagih atau tidak), biaya proyek (bahan, perjalanan, subkontrak), kontrak/nilai kontrak, termin penagihan (persen/jumlah, syarat pemicu), tarif per jam per peran.

### Alur dan status
- Proyek: draf, berjalan, ditahan, selesai, ditutup.
- Tugas: belum mulai, dikerjakan, review, selesai.
- Timesheet: draf, diajukan, disetujui, ditagih.
- Penagihan: waktu dan bahan (jam x tarif), harga tetap per termin, persentase progres (ada pengakuan pendapatan sesuai progres), uang muka dan retensi.

### Persetujuan
Timesheet oleh manajer proyek, biaya proyek, faktur termin, perubahan lingkup (change order).

### Laporan
Profitabilitas proyek, anggaran vs aktual, jam per orang/klien, utilisasi, WIP proyek, termin yang belum ditagih, retensi, arus kas proyek.

### Integrasi
Kalender, email, penyimpanan berkas, git/alat kerja (jauh), WhatsApp.

### Susah
- Pengakuan pendapatan berbasis progres (ada di standar akuntansi, dibahas di ranah konstruksi) dan hubungannya dengan faktur dan PPN.
- Konstruksi: PPh final jasa konstruksi (tarif tergantung kualifikasi usaha) ⚠ belum diverifikasi, plus retensi, uang muka, dan bukti potong dari bouwheer.
- Timesheet yang jujur dan tidak memberatkan karyawan.
- Satu orang di banyak proyek, tarif berbeda.
- Pembagian biaya tidak langsung ke proyek.

---

## 8. SDM dan penggajian

### Tujuan
Mengelola data karyawan, kehadiran, dan menggaji dengan benar sesuai aturan.

### Objek data
Karyawan (NIK, NPWP, status PTKP, alamat, rekening, tanggal masuk, jabatan, cabang, atasan), kontrak (PKWT/PKWTT, tanggal mulai/akhir, gaji), struktur gaji dan komponen (tetap, tidak tetap, tunjangan, potongan), shift dan jadwal, absensi (masuk, keluar, lokasi/foto), cuti (jenis, saldo, pengajuan), lembur, slip gaji, pinjaman karyawan, BPJS (nomor kepesertaan), THR, pesangon/kompensasi.

### Alur dan status
- Absensi: catat (aplikasi, mesin, GPS/foto) lalu dikoreksi/disetujui bila lupa absen.
- Cuti: diajukan, disetujui, ditolak, dibatalkan. Saldo cuti berjalan per tahun, ada cuti sakit, melahirkan, dan lain-lain.
- Lembur: diajukan (perlu surat perintah), disetujui, dihitung.
- Penggajian: periode, draf, dihitung, ditinjau, disetujui, dibayar, dikunci, dijurnal, bukti potong/slip.
- Kontrak: aktif, akan berakhir (peringatan), diperpanjang, berakhir.

### Aturan Indonesia yang harus ada (⚠ semua perlu verifikasi ke teks resmi)
- PKWT (kontrak): PP 35 Tahun 2021 menetapkan jangka waktu maksimal PKWT 5 tahun. Uang kompensasi wajib diberikan saat PKWT berakhir bagi pekerja dengan masa kerja minimal 1 bulan terus-menerus; PKWT tidak mendapat pesangon, melainkan kompensasi (gadjian, hukumonline). ⚠ Rumus kompensasi (biasanya masa kerja dibagi 12 dikali satu bulan upah) tidak dikonfirmasi di sumber yang dibuka; verifikasi pasal-pasalnya.
- Pesangon PHK: PP 35/2021 mengatur perhitungan pesangon, uang penghargaan masa kerja, dan uang penggantian hak, dengan pengali berbeda menurut alasan PHK (sumber menyebut pengali 0,5 sampai 2 kali ketentuan dasar). ⚠ Tabel rinci belum dikumpulkan, jangan dijadikan preset tanpa teks pasal.
- Lembur dan pengupahan: PP 36 Tahun 2021. ⚠ Rumus lembur hari kerja (1,5 kali upah sejam untuk jam pertama dan 2 kali untuk jam berikutnya) adalah pengetahuan umum penulis, tidak terkonfirmasi di sumber yang dibuka. Verifikasi, termasuk rumus hari libur dan upah sejam (1/173).
- THR: wajib dibayar paling lambat 7 hari sebelum hari raya keagamaan (Permenaker 6 Tahun 2016 Pasal 5 ayat 4; Ombudsman menyebut tidak boleh dicicil, 2026). Besaran: sebulan upah untuk masa kerja 12 bulan atau lebih, proporsional untuk di bawahnya. ⚠ Verifikasi besaran proporsional dan perubahan terbaru (ada surat edaran Menaker tiap tahun).
- BPJS Kesehatan: iuran 5 persen dari upah, 4 persen ditanggung pemberi kerja dan 1 persen pekerja. Batas atas upah dasar Rp12 juta, batas bawah UMK/UMP. Menkeu menyatakan tidak ada kenaikan tarif iuran sepanjang 2026 (goodnewsfromindonesia, kiakrikil, kontan). ⚠ Cek ulang untuk 2027.
- BPJS Ketenagakerjaan (sumber dealls.com, CNN Indonesia, 2025-2026):
  - JHT: pemberi kerja 3,7 persen, pekerja 2 persen.
  - JP: pemberi kerja 2 persen, pekerja 1 persen. Batas upah dasar JP Rp10.547.400 per bulan (2026, menurut dealls). ⚠ Batas ini naik tiap tahun, simpan sebagai data bertanggal.
  - JKK: hanya pemberi kerja, tergantung tingkat risiko. Dua sumber memberi rentang berbeda: 0,24 sampai 1,74 persen (sumber lebih lama) dan 0,10 sampai 1,60 persen setelah PP 6/2025 (dealls). ⚠ Pakai tabel resmi PP 6/2025.
  - JKM: pemberi kerja 0,3 persen.
  - JKP: total 0,36 persen dari upah (batas upah Rp5.000.000), pemerintah 0,22 persen dan 0,14 persen dari rekomposisi JKK (dealls). ⚠ Verifikasi, dan ada informasi diskon iuran JKK/JKM 50 persen sampai Desember 2026 (JPNN, belum dibuka). ⚠
- PPh 21 TER: lihat bagian 2.4.
- Upah minimum UMP/UMK: per wilayah dan tahun, simpan sebagai data. ⚠ Angka belum dikumpulkan.

### Persetujuan
Cuti dan lembur oleh atasan, penggajian oleh HR lalu keuangan/pemilik, perubahan gaji oleh pemilik, PHK oleh pemilik dengan dokumen.

### Laporan
Slip gaji, rekap gaji per bulan dan cabang, rekap BPJS (daftar iuran yang dibayar), rekap PPh 21 dan bukti potong, kehadiran dan keterlambatan, saldo cuti, turnover, kontrak yang akan berakhir, biaya tenaga kerja per proyek/cabang.

### Integrasi
Mesin fingerprint/face, aplikasi absensi seluler dengan GPS dan foto, BPJS (portal SIPP, ⚠ belum diverifikasi cara impor), Coretax (bukti potong 21), bank (transfer gaji massal), WhatsApp (slip gaji).

### Susah
- Aturan yang banyak dan sering berubah (TER, BPJS, UMK, PTKP).
- Komponen gaji berbeda tiap usaha: harian, borongan, per jam, komisi, uang makan dan transport yang dihitung hadir.
- Absensi: kecurangan (titip absen), lokasi lemah sinyal, shift lintas hari.
- Karyawan masuk/keluar di tengah bulan (prorata).
- Perhitungan pesangon yang bisa diperselisihkan secara hukum; platform sebaiknya memberi "perkiraan" dengan peringatan.
- Data pribadi karyawan sensitif (NIK, gaji): akses terbatas dan audit trail. ⚠ UU Pelindungan Data Pribadi (UU 27/2022) berlaku, perlu ditelaah.
- Pembulatan dan potongan yang harus cocok dengan bukti potong dan SPT.

---

## 9. Fungsi pendukung

### 9.1 POS dan kasir
- Tujuan: penjualan tunai/QRIS cepat di toko, kedai, restoran.
- Objek: shift kasir (modal awal, kas masuk/keluar, tutup), transaksi (struk, item, diskon, pembayaran bercampur), meja/pesanan (F&B), pembayaran (tunai, kartu, QRIS, e-wallet), retur, loyalty/poin.
- Alur: buka shift, jual, bayar, cetak/kirim struk, tutup shift (hitung kas, selisih), sinkron ke buku besar (jurnal rekap harian per shift atau per transaksi).
- Laporan: penjualan harian per kasir/produk/jam, selisih kas, produk terlaris, margin.
- Integrasi: printer thermal (Bluetooth/USB), laci kas, pemindai, QRIS ⚠ (penyedia perlu dipilih), GoFood/GrabFood/ShopeeFood ⚠.
- Susah: OFFLINE dulu (internet toko tidak stabil), sinkron antar-perangkat tanpa duplikat, stok real time, pajak daerah restoran/PB1 ⚠ belum diverifikasi, struk dengan pajak, diskon item/total, split bill. Ini fungsi dengan syarat offline terberat.

### 9.2 Reservasi dan penjadwalan
- Tujuan: pelanggan memesan slot (salon, klinik, bengkel, lapangan, kamar, kelas).
- Objek: sumber daya (staf, ruang, alat), layanan (durasi, harga), slot, reservasi (status: menunggu, dikonfirmasi, hadir, tidak hadir, batal), deposit, aturan buka/tutup.
- Laporan: okupansi, tidak hadir, pendapatan per layanan/staf.
- Integrasi: WhatsApp pengingat, kalender (Google), pembayaran uang muka, halaman pemesanan publik.
- Susah: bentrok slot (kunci), zona waktu, durasi variabel dan jeda, aturan pembatalan, reservasi berulang, beberapa sumber daya sekaligus.

### 9.3 Tiket dan layanan pelanggan (helpdesk)
- Objek: tiket (pelanggan, kanal, kategori, prioritas, status, penanggung jawab, SLA), pesan, lampiran, basis pengetahuan.
- Status: baru, ditugaskan, dikerjakan, menunggu pelanggan, selesai, ditutup.
- Laporan: waktu respons dan selesai, tiket per kategori, kepatuhan SLA, kepuasan.
- Integrasi: email, WhatsApp, formulir web.
- Susah: WhatsApp Business API (biaya dan persetujuan templat ⚠ belum diverifikasi), mencocokkan pesan ke tiket, SLA dengan jam kerja dan libur.

### 9.4 Manajemen aset dan perawatan
- Objek: aset (kode, lokasi, penanggung jawab, kondisi, nilai, penyusutan, hubungan ke aset tetap akuntansi), jadwal perawatan (berbasis waktu atau pemakaian), perintah kerja perawatan, riwayat servis, suku cadang, garansi.
- Status perintah kerja: direncanakan, dijadwalkan, dikerjakan, selesai.
- Laporan: biaya perawatan per aset, downtime, jadwal jatuh tempo, aset habis garansi.
- Susah: memisahkan aset akuntansi dari aset operasional (satu aset fisik bisa jadi banyak), data awal yang berantakan, QR label dan pemindaian di lapangan (offline).

### 9.5 Dokumen, kontrak, tanda tangan elektronik
- Objek: dokumen (versi, kategori, pemilik, kedaluwarsa), kontrak (pihak, nilai, tanggal, perpanjangan, klausul penting), permintaan tanda tangan, templat dokumen, jejak.
- Status kontrak: draf, ditinjau, disetujui, ditandatangani, aktif, akan berakhir, berakhir.
- Hukum: UU ITE dan PP 71/2019 mengakui tanda tangan elektronik, dengan syarat penyelenggara tersertifikasi untuk tanda tangan tersertifikasi ⚠ perlu verifikasi pasal. e-Meterai untuk dokumen yang kena bea (bagian 2.7).
- Integrasi: penyedia tanda tangan elektronik tersertifikasi (Privy, VIDA, Peruri Sign, dan lain-lain ⚠ belum dikaji), e-Meterai, penyimpanan berkas.
- Susah: keabsahan hukum (tanda tangan tersertifikasi vs tidak), versi dan audit, retensi dokumen (UU Dokumen Perusahaan ⚠), penyimpanan berkas besar, pencarian isi.

### 9.6 Pengadaan dan perizinan
- Objek: izin usaha (NIB, izin sektor, sertifikat, lisensi, Sertifikat Halal, PIRT, dan lain-lain ⚠ per sektor), tanggal terbit/berakhir, pengingat, penanggung jawab, dokumen bukti. Untuk pengadaan: lihat pembelian (bagian 4), plus tender sederhana untuk usaha menengah.
- OSS dan NIB: perizinan berusaha berbasis risiko lewat OSS (PP 5/2021 ⚠ perlu verifikasi dan perubahannya).
- Laporan: kalender izin, izin yang akan berakhir.
- Susah: variasi izin per sektor dan daerah, perubahan aturan. Cukup jadi register dengan pengingat pada MVP, bukan integrasi OSS.

### 9.7 Pelaporan dan BI (business intelligence)
- Tujuan: pemilik melihat angka usaha ringkas dalam satu layar.
- Kebutuhan: dasbor (penjualan hari ini, kas, piutang jatuh tempo, stok menipis, laba bulan ini), filter periode/cabang, laporan simpan dan jadwalkan kirim (email/WhatsApp), ekspor, pembangun laporan sederhana, pivot.
- Susah: konsistensi angka antar-laporan (semua dari satu sumber: buku besar dan mutasi stok), performa, izin data per peran/cabang, laporan kustom tanpa membuka celah RLS.

---

## 10. Lintas-fungsi

### 10.1 Persetujuan bertingkat
- Model data: aturan (dokumen, syarat: nilai, cabang, kategori, pembuat), tahapan (urutan, penyetuju berupa peran atau orang, paralel/berurutan, kuorum), permintaan (status: menunggu, disetujui, ditolak, ditarik), catatan, delegasi saat cuti.
- Susah: aturan yang fleksibel tanpa menjadi bahasa pemrograman, penyetuju yang absen (delegasi dan eskalasi waktu), dokumen yang diedit setelah disetujui (harus reset), pemisahan tugas (pembuat tak boleh menyetujui sendiri).

### 10.2 Notifikasi (WhatsApp, email)
- Kebutuhan: pengingat jatuh tempo, persetujuan menunggu, faktur kirim ke pelanggan, slip gaji, stok menipis.
- WhatsApp Business API: perlu penyedia (BSP) dan templat pesan disetujui, biaya per percakapan ⚠ aturan dan harga belum diverifikasi. Email lebih mudah. Siapkan abstraksi saluran: kirim lewat "antrean notifikasi" dengan penyedia yang bisa diganti.
- Susah: biaya, batas kirim, opt-in/opt-out, templat per bahasa, status terkirim/dibaca, notifikasi gagal (retry).

### 10.3 Audit trail
- Catat siapa, kapan, apa (nilai lama dan baru), dari mana (IP/perangkat) untuk tabel penting. Tidak bisa diubah (append-only). Berguna untuk sengketa, audit, dan fraud.
- Susah: volume data, privasi (jangan simpan data berlebih), tampilan yang mudah dibaca, dan menjaga agar pemilik data tidak bisa menghapusnya lewat RLS.

### 10.4 Hak akses per peran dan per cabang
- Model: peran (data, bukan kode) berisi izin (modul x aksi: lihat, buat, ubah, hapus, setujui, ekspor), ditetapkan per pengguna per perusahaan, dengan cakupan data (semua cabang, cabang tertentu, hanya milik sendiri). Pembatasan tingkat kolom (misal gaji) sebagai izin terpisah.
- Susah: RLS yang menggabungkan perusahaan, cabang, dan peran tanpa lambat; pengguna dengan banyak peran/perusahaan (akuntan eksternal melayani banyak klien); uji menyeluruh (pgTAP) untuk setiap tabel.

### 10.5 Multi-cabang dan multi-entitas
- Multi-cabang: satu badan hukum, banyak lokasi. Setiap transaksi bertanda cabang, laporan bisa per cabang dan gabungan, stok per cabang, kas per cabang. NITKU untuk pajak per cabang.
- Multi-entitas: beberapa badan hukum (grup) dengan bagan akun sendiri atau bersama. Transaksi antar-perusahaan (jual beli, pinjaman, bagi biaya) otomatis membuat pasangan dokumen di kedua sisi. Konsolidasi: gabung laporan, eliminasi saldo antar-perusahaan, konversi mata uang, kepentingan nonpengendali.
- Susah: eliminasi antar-perusahaan yang harus cocok sampai rupiah, konversi kurs untuk laporan konsolidasi, perbedaan periode tutup buku, pajak per badan hukum. Konsolidasi penuh hanya untuk fase 3.

### 10.6 Impor dan ekspor Excel
- Wajib sejak MVP: migrasi dari Excel/aplikasi lama (pelanggan, produk, saldo awal, stok awal, bagan akun, karyawan) dan ekspor semua laporan.
- Susah: templat per entitas, validasi baris (laporkan error per baris, bukan gagal semua), impor besar (antrean/latar belakang), format tanggal dan angka Indonesia (titik ribuan, koma desimal), pemetaan kolom, impor saldo awal yang seimbang.

### 10.7 API dan webhook
- Kunci API per perusahaan dengan cakupan izin, batas laju, webhook (peristiwa: faktur terbit, pembayaran, stok berubah) dengan tanda tangan dan percobaan ulang, dokumentasi terbuka, versi.
- Catatan CLAUDE.md: tanpa service-role key. API pihak ketiga harus lewat peran database dengan RLS, tidak mem-bypass. ⚠ Desain ini perlu dibahas di riset arsitektur.

### 10.8 Offline
- Paling penting untuk POS, absensi lapangan, stok opname, aset. Pola: simpan lokal (IndexedDB), antrean perubahan, sinkron saat online, penyelesaian konflik (terakhir menang untuk catatan sederhana; aturan khusus untuk stok dan kas).
- Susah: nomor dokumen unik tanpa server (gunakan awalan per perangkat/UUID lalu nomor resmi saat sinkron), konflik stok, keamanan data di perangkat, kuota penyimpanan peramban. Putuskan batas: modul mana yang offline-first (POS, absensi) dan mana online saja (akuntansi, pajak).

### 10.9 Mobile
- Pemilik dan lapangan memakai ponsel. Web mobile-first (PWA) dulu, aplikasi asli belakangan. Fungsi utama di ponsel: persetujuan, dasbor, absensi, POS, foto bukti, scan barcode, penagihan, slip gaji.
- Susah: layar kecil untuk tabel akuntansi, kamera dan GPS di peramban, notifikasi push (iOS di PWA ada batasan ⚠ cek versi terbaru), performa di ponsel murah dan jaringan lambat.

---

## 11. Tabel prioritas

Keterangan: K = usaha kecil (1 sampai 20 orang), M = usaha menengah (20 sampai 200 orang). Ini rekomendasi penulis berdasarkan pola umum, bukan hasil survei. ⚠ Perlu divalidasi dengan wawancara pemilik usaha nyata.

| Fungsi | MVP (K) | Fase 2 (K) | Fase 3 (K) | MVP (M) | Fase 2 (M) | Fase 3 (M) |
|---|---|---|---|---|---|---|
| Keuangan dan akuntansi | Bagan akun, jurnal otomatis dari transaksi, kas dan bank, laba rugi dan neraca (SAK EMKM) | Impor mutasi bank, rekonsiliasi, aset tetap, anggaran sederhana | Multi-mata uang, tutup tahunan terpandu | Buku besar penuh, rekonsiliasi, aset tetap, periode dikunci, SAK EP | Anggaran, multi-mata uang, pusat biaya | Konsolidasi, antar-perusahaan |
| Pajak Indonesia | Pencatatan PPh final 0,5 persen, ekspor daftar faktur, pengingat jatuh tempo | Faktur pajak (kode 04 dsb.), ekspor untuk Coretax | Bukti potong 23/4(2), integrasi API | PPN, PPh 21/23, ekspor Coretax, rekonsiliasi pajak | e-Bupot, PPh 25/29 dukung | API Coretax, e-Meterai otomatis |
| Penjualan dan CRM | Faktur, pelanggan, piutang, penawaran sederhana | Pesanan, daftar harga, diskon, kirim WhatsApp | Langganan, komisi | Penawaran, pesanan, faktur, piutang, lead | Harga bertingkat, komisi, langganan | Prakiraan, integrasi marketplace |
| Pembelian dan pemasok | Tagihan pemasok, hutang, pemasok | PO, penerimaan barang | 3-way match, PR | PO, penerimaan, tagihan, persetujuan | 3-way match, kinerja pemasok | RFQ, landed cost |
| Persediaan dan gudang | Produk, stok satu gudang, kartu stok, rata-rata bergerak | Multi gudang, opname, satuan konversi | Lot/serial, kedaluwarsa, FIFO | Multi gudang, opname, satuan konversi, transfer | Lot, kedaluwarsa, FIFO | Lokasi/bin, barcode lanjut |
| Produksi | Tidak ada (kecuali resep sederhana bila usaha F\&B/konveksi) | Resep/BOM satu tingkat, work order | Biaya produksi | BOM, work order | Routing, biaya, subkontrak | MRP, WIP lanjut |
| Proyek dan timesheet | Daftar proyek/tugas sederhana | Timesheet, penagihan jam | Termin dan progres | Proyek, tugas, timesheet | Termin, progres, profitabilitas | Pengakuan pendapatan, retensi |
| SDM dan penggajian | Data karyawan, absensi sederhana, slip gaji, cuti | Penggajian dengan PPh 21 TER dan BPJS, lembur, THR | Kontrak, pesangon, PHK | Absensi, cuti, penggajian penuh | Lembur, THR, kontrak, bukti potong | Pesangon, penilaian kinerja |
| POS dan kasir | Kasir dasar, struk, tutup shift | Offline, QRIS, printer | Loyalti, integrasi pesan-antar | Multi-kasir, shift | Offline, QRIS | Multi-outlet lanjut |
| Reservasi | Tidak ada, atau form pemesanan | Slot, WhatsApp pengingat | Deposit, sumber daya lanjut | Slot dan sumber daya | Deposit, aturan batal | Integrasi kalender |
| Helpdesk | Tidak ada | Kotak masuk tiket sederhana | SLA | Tiket, SLA | Basis pengetahuan | Otomasi |
| Aset dan perawatan | Daftar aset | Jadwal perawatan sederhana | Perintah kerja | Daftar aset, jadwal perawatan | Perintah kerja, biaya | Berbasis pemakaian |
| Dokumen, kontrak, e-sign | Penyimpanan dokumen | Pengingat kontrak | e-Sign, e-Meterai | Register kontrak | e-Sign, e-Meterai | Alur kontrak penuh |
| Pengadaan dan perizinan | Register izin dengan pengingat | Pengingat lebih rinci | | Register izin | Tender sederhana | |
| Pelaporan dan BI | Dasbor pemilik (kas, penjualan, piutang) | Laporan terjadwal | Laporan kustom | Dasbor per cabang | Laporan terjadwal, pivot | Laporan kustom |
| Persetujuan bertingkat | Satu tingkat sederhana | | | Bertingkat menurut nilai | Delegasi, eskalasi | |
| Notifikasi | Email, tautan WhatsApp (klik untuk kirim) | WhatsApp API | | Email, WhatsApp API | Aturan pengingat | |
| Audit trail | Log dasar | Tampilan riwayat | | Penuh | Tidak bisa diubah | |
| Hak akses | Pemilik, kasir, akuntan, karyawan | Per cabang | | Peran kustom, per cabang | Per kolom | |
| Multi-cabang/entitas | Satu cabang | Multi-cabang | | Multi-cabang | Multi-entitas | Konsolidasi |
| Impor/ekspor Excel | Ya (wajib) | | | Ya (wajib) | | |
| API dan webhook | Tidak | Webhook dasar | API publik | Webhook | API publik | Marketplace aplikasi |
| Offline | POS saja | Absensi | Opname | POS | Absensi, opname | Sinkron lanjut |
| Mobile | PWA web | Scan barcode, kamera | Notifikasi push | PWA | Scan, kamera | Aplikasi asli |

Catatan urutan kerja (usulan): inti buku besar dan multi-tenant, lalu penjualan, pembelian, persediaan, kas dan bank, lalu laporan dasar. Setelah itu pajak PPN dan penggajian, lalu POS offline. Produksi, proyek, dan multi-entitas belakangan. Kriteria pemilih: tiap fungsi perlu data nyata dari wawancara pemilik usaha sebelum dikunci.

---

## 12. Ringkasan risiko dan hambatan riset

1. Banyak sumber pajak adalah situs media dan konsultan (pajak.com, DDTC, IKPI, Ortax, Kontan). Teks peraturan asli (PMK, PP, KEP) tidak dibuka satu per satu. Semua angka dan tanggal di atas harus dicek ke teks resmi sebelum jadi data preset.
2. Dokumentasi API Coretax resmi tidak ditemukan. Klaim integrasi API berasal dari vendor ERP.
3. Rumus lembur, THR proporsional, pesangon, kompensasi PKWT, penyusutan fiskal, tarif PPh 4(2), tarif PPh final jasa konstruksi, dan batas PKP belum dikonfirmasi dari sumber yang dibuka. Ditandai ⚠.
4. Status revisi PP 55/2022 (PPh final tanpa batas waktu) dan status e-Faktur Desktop per Oktober 2026 belum dipastikan.
5. Prioritas fase didasarkan pada pola umum, bukan survei pengguna.
6. Alat pencarian hanya memberi ringkasan, jadi tidak semua klaim bisa ditelusuri ke kalimat sumber.

---

## 13. Daftar sumber

Pajak dan Coretax
- https://www.pajak.go.id/en/node/105641 (PMK 168/2023, TER)
- https://www.pajak.com/pajak/petunjuk-pemotongan-tarif-efektif-pph-21-dalam-pmk-168-2023/
- https://www.pajak.com/pajak/cara-menentukan-kategori-ter-pascapemberlakuan-pmk-168-2023/
- https://pajak.go.id/index.php/en/node/104990 (TER, kategori)
- https://www.pajak.com/pajak/pemberi-kerja-berikut-ketentuan-lengkap-pemotongan-pph-21-skema-ter/
- https://ikpi.or.id/?p=8499 (rumus PPh 21 PP 58/2023 dan PMK 168/2023)
- https://ikpi.or.id/?p=13685 (faktur kode 04, DPP nilai lain, Coretax)
- https://ortax.org/membuat-faktur-pajak-dpp-nilai-lain-pada-aplikasi-coretax
- https://news.ddtc.co.id/review/konsultasi-coretax/1808042/bagaimana-cara-membuat-faktur-pajak-dengan-dpp-nilai-lain-di-coretax
- https://www.pajak.go.id/index.php/en/node/113835 dan https://www.pajak.go.id/en/node/115438 (Coretax)
- https://pajak.go.id/en/node/115238 (e-Faktur Desktop kembali)
- https://news.ddtc.co.id/berita/nasional/1810488/ada-coretax-wp-tetap-bisa-bikin-faktur-pajak-lewat-e-faktur-desktop
- https://www.pajak.go.id/en/node/118358 (SPT Tahunan di Coretax)
- https://www.online-pajak.com/tentang-efaktur-ppn/aplikasi-ppn/
- https://www.saka-erp.id/artikel/cara-integrasi-erp-dengan-coretax (sumber vendor)
- https://news.ddtc.co.id/berita/nasional/1814883/pemerintah-bakal-terapkan-pph-final-umkm-05-tanpa-batas-waktu (31 Oktober 2025)
- https://www.pajak.com/pajak/penyesuaian-aturan-pph-final-05-persen/
- https://ikpi.or.id/dirjen-pajak-pastikan-aturan-sedang-diproses-umkm-masih-bisa-nikmati-pph-final-05-persen/
- https://news.ddtc.co.id/berita/nasional/1800682/isi-nik-di-e-bupot-unifikasi-tarif-pph-pasal-23-normal-ini-kata-djp
- https://www.online-pajak.com/e-bupot/kapan-bukti-potong-pph-23-dibuat-simak-di-sini/
- https://news.ddtc.co.id/berita/nasional/1793802/omzet-masih-di-bawah-rp48-m-wp-badan-bisa-manfaatkan-pph-pasal-31e
- https://www.online-pajak.com/pajak/tarif-pph-badan/
- https://www.online-pajak.com/tentang-pph-final/pph-badan/
- https://nasional.kontan.co.id/news/turunkan-batas-pkp-hingga-rp-600-juta-pemerintah-bisa-raih-pph-dan-ppn-lebih-banyak (batas PKP)
- https://pajak.go.id/en/node/105288

Bea meterai
- https://finance.detik.com/berita-ekonomi-bisnis/d-5160099/dokumen-apa-saja-yang-kena-bea-meterai-rp-10-000
- https://www.pajak.go.id/en/node/42493
- https://m.antaranews.com/amp/berita/4352007/apa-itu-e-meterai-dan-manfaatnya
- https://ekonomi.bisnis.com/read/20211004/9/1450103/resmi-diluncurkan-ini-kelebihan-meterai-elektronik-atau-e-meterai

Standar akuntansi
- https://news.ddtc.co.id/berita/nasional/1802565/sak-ep-bakal-gantikan-sak-etap-tak-boleh-turun-kelas-pakai-sak-emkm
- https://news.ddtc.co.id/literasi/kamus/1803456/apa-itu-standar-akuntansi-keuangan-entitas-privat-sak-ep
- https://www.jurnal.id/id/blog/sak-ep/
- https://web.iaiglobal.or.id/assets/files/file_berita/Materi%20Presentasi_Sosialisasi%20SAK%20Entitas%20Privat.pdf

Ketenagakerjaan dan BPJS
- https://dealls.com/pengembangan-karir/potongan-bpjs-ketenagakerjaan
- https://www.cnnindonesia.com/edukasi/20250205162651-561-1194991/berapa-persen-potongan-gaji-untuk-bpjs-ketenagakerjaan-ini-rinciannya
- https://kantorku.id/blog/premi-bpjs-ketenagakerjaan/
- https://m.jpnn.com/news/manfaatkan-diskon-iuran-50-persen-jkk-dan-jkm-hingga-desember-2026 (belum dibuka, hanya judul)
- https://www.goodnewsfromindonesia.id/2026/01/02/daftar-tarif-iuran-bpjs-kesehatan-terbaru-yang-berlaku-di-1-januari-2026-kelas-1-2-dan-3
- https://nasional.kontan.co.id/news/inilah-batas-bawah-dan-atas-gaji-peserta-jkn-untuk-iuran-bpjs
- https://www.gadjian.com/blog/2023/09/30/besaran-kompensasi-karyawan-kontrak/
- https://www.gadjian.com/blog/2021/03/12/perbedaan-uang-kompensasi-dan-pesangon-cipta-kerja/
- https://www.hukumonline.com/klinik/a/adakah-pesangon-bagi-karyawan-kontrak-lt560b6b4ee463f/
- https://www.talenta.co/blog/seputar-perjanjian-kerja-pesangon-phk-sesuai-pp-35-2021-tentang-ketenagakerjaan/
- https://ombudsman.go.id/news/download/pwkmedia--ombudsman-kepri-ingatkan-pemberi-kerja-thr-2026-wajib-dibayar-penuh-tanpa-cicil-dan-paling-lambat-h-7
- https://www.gadjian.com/blog/2022/08/16/contoh-perhitungan-thr-natal-beserta-pajak

Referensi dalam repo: CLAUDE.md (aturan multi-tenant dan RLS).
