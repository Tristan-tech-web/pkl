# R8b. Keluhan dan pujian publik tentang aplikasi usaha kecil di Indonesia

Tanggal riset: 12 Oktober 2026. Bagian B dari putaran riset meja R8. Melengkapi R4 §2 dan §5 (versi global) dan daftar kerja lanjutan R4 nomor 1, 2, 3, 7. Dipakai untuk memangkas bagian "keluhan umum" di R7. R4 dan R7 tidak diubah di sini. Harga etalase sudah dicatat di R8d §2.2, jadi di sini hanya keluhan harganya.

## 0. Cara membaca, dan batasnya

**Tingkat keyakinan** (selaras dengan R4 §7 dan R8d §0).
- **A** = halaman resmi vendor atau berita arus utama yang saya buka langsung. Untuk harga, A berarti "tertulis begitu pada tanggal itu".
- **B** = teks ulasan pengguna asli (Google Play, App Store) yang saya ambil langsung, lengkap dengan tanggal. Isinya otentik sebagai pengakuan pengguna. Sampelnya tidak acak, jadi tidak boleh dibaca sebagai angka populasi.
- **C** = blog, vendor, pesaing, agregator, reseller. Pola boleh dipakai, nada dan angka jangan.
- **⚠** = hanya dari ringkasan hasil pencarian, halaman tidak bisa dibuka, atau klaim satu orang yang belum bisa dicek. Jangan dikutip keluar.

**Cara ambil data.**
- Halaman Play Store tidak bisa dibaca lewat WebFetch (halaman terpotong, tidak ada ulasan). Jalur yang jalan: endpoint ulasan internal Google Play (`batchexecute`, rpc `UsvDTd`), urut terbaru, difilter per bintang, 100 ulasan per halaman. Endpoint ini tidak resmi, jadi cara ini bisa berhenti bekerja sewaktu-waktu. Hasilnya teks ulasan asli, bukan ringkasan, jadi tidak saya tandai ⚠ tetapi keyakinannya B.
- App Store: RSS ulasan pelanggan Apple (toko Indonesia, JSON, `sortby=mostrecent`, sampai 10 halaman per aplikasi). Hanya ulasan yang punya teks.
- Total yang diambil dan dihitung (sebagian besar ulasan bintang 1 dan 2 juga saya baca, sisanya dihitung lewat kata kunci): Play 1.794 ulasan bintang 1, 759 bintang 2, 1.539 bintang 5. App Store (aplikasi dalam cakupan) 348 bintang 1, 58 bintang 2, 921 bintang 5. Angka persen di dokumen ini dihitung dari **2.959 ulasan bintang 1 dan 2** (Play 2.553, App Store 406).
- Per aplikasi saya ambil sampai 300 ulasan bintang 1 terbaru, 200 bintang 2 terbaru, dan 100 bintang 5 terbaru per paket aplikasi. Untuk aplikasi kecil itu berarti semua ulasan yang ada, untuk yang besar (BukuWarung, Majoo, Moka, Talenta) itu hanya yang terbaru.
- Persen = jumlah ulasan yang memuat kata kunci tema (dihitung otomatis), lalu saya cek dengan membaca sampel dan semua ulasan yang saya kutip. Bisa kurang hitung 30 sampai 50 persen (orang menulis dengan cara berbeda-beda), jadi pakai sebagai urutan dan ukuran kasar, bukan angka pasti. Kategori: **sering** (25 persen ke atas), **cukup sering** (10 sampai 24), **kadang** (3 sampai 9), **jarang** (di bawah 3).
- Kutipan di bawah disalin persis dari ulasan (ejaan asli), dengan bintang dan tanggal. Nama pengulas dan nama pegawai vendor sengaja tidak dicantumkan. Salinan mentah ulasan tidak disimpan di repo.
- Harga dan halaman resmi dibuka 12 Oktober 2026, rata-rata tanpa tanggal terbit di halamannya.

**Tidak terjangkau dari lingkungan riset ini** (jadi tidak ada di dokumen ini, dan itu bukan berarti tidak ada keluhan di sana).
- Reddit: diblokir untuk alat pencarian dan WebFetch. Tidak ada utas r/indonesia, r/smallbusiness, r/Accounting yang bisa dikutip.
- G2, Capterra, Trustpilot, Software Advice: halaman langsung 403 atau 404. Isi hanya dari ringkasan hasil pencarian (⚠).
- Kaskus: utas ketemu lewat pencarian, tetapi balasan tidak termuat. Satu utas yang dibuka bertanggal 2012, terlalu tua. Quora: 403, hanya judul pertanyaan dari pencarian.
- Mekari Community: 403 (hanya judul dan cuplikan dari pencarian). Forum pengguna Accurate, Kledo, Zahir: tidak ketemu (hanya dokumentasi resmi).
- Facebook group dan komentar YouTube: tidak bisa dicari atau dibuka.
- Play Store "BukuKas": tidak ada lagi (aplikasi ditutup 2023, lihat §3.6).

**Bias yang harus diingat.**
1. **Aplikasi pendamping, bukan produk inti.** Yang punya ulasan banyak adalah aplikasi HP-nya (Jurnal Mobile, Accurate Lite, Kledo, Zahir Apps). Akuntan dan admin yang bekerja di versi web jarang menulis ulasan. Jadi keluhan "mobile tidak setara web" kelihatan besar, keluhan laporan dan akuntansi inti kelihatan kecil. Ini artefak sumber.
2. **Jendela waktu berbeda.** Sampel Jurnal 2017 sampai 2026 (hanya 3 dari 146 yang berumur di bawah 12 bulan), Zahir 1 dari 54, Kledo 6 dari 56. Sampel BukuWarung 398 dari 500 dan Talenta 508 dari 769 berumur di bawah 12 bulan. Kondisi hari ini lebih terwakili untuk yang terakhir.
3. **Bintang 5 tidak semuanya organik.** Ada kelompok ulasan bintang 5 yang tampak diatur: Jurnal 47 dari 100 bintang 5 terbaru bertanggal 18 sampai 19 Maret 2025, dan 37 lainnya Januari sampai Februari 2026 berupa kalimat slogan ("Aplikasi stok barang ini cocok untuk bisnis retail dan grosir"); Majoo Lite 88 dari 100 jatuh di Februari 2025, banyak yang hanya "Sangat membantu"; Olsera 40 ulasan bintang 5 di September 2025 dengan gaya kalimat seragam. Satu pengguna Majoo mengaku teknisi mengetik dan mengirim sendiri ulasan bintang 5 di tabletnya (⚠ klaim satu orang, Apple 2024-10-09). Bintang 5 saya pakai hanya untuk tema pujian dan dengan tanda ⚠. Catatan: bintang 5 terbaru Majoo, Talenta, dan Moka hanya menjangkau beberapa minggu karena volumenya besar; itu bukan tanda kampanye.
4. **Banyak pengulas adalah pegawai, bukan pembeli** (Talenta, GadjianKu, Majoo Teams). Mereka yang menanggung akibat error, tetapi bukan yang memutuskan membeli.
5. **Ulasan salah kira.** Di Jurnal 8 dari 146 ulasan bintang rendah bukan soal aplikasinya (orang mengira ini aplikasi belajar, pinjaman uang, atau penipuan atas nama Jurnal). Sudah dihitung apa adanya, tidak dibuang.
6. **Balasan vendor** di Play berbentuk templat (misalnya Jurnal mengarahkan ke WhatsApp Customer Care). Tidak dihitung sebagai bukti apa pun.
7. **Keluhan bukan niat pindah** (R4 §6.2). §2.4 menunjukkan jarak antara keduanya.

## 1. Ringkasan

1. **Keluhan terbesar adalah aplikasi yang tidak bisa diandalkan saat dipakai, bukan fitur yang kurang.** Error, lambat, keluar sendiri, gangguan di jam kerja muncul di semua aplikasi, sekitar 18 sampai 48 persen ulasan bintang rendah di 11 dari 12 aplikasi (Accurate 42, Talenta 36, Majoo 32, Jurnal 31, Olsera 29; hanya GadjianKu yang rendah, 9). Sering ditulis "jaringan bagus tapi loading terus", bukan "saya butuh offline".
2. **Update yang merusak adalah pola yang berulang dan sering menimpa pengguna lama.** Accurate Lite (18 persen menyebut update), Olsera (19), BukuWarung (18), Majoo, Talenta. Pengulas dengan langganan 1 sampai 4 tahun menulis "dulu bagus". Tidak ada jalan kembali ke versi lama; permintaan "kembalikan versi sebelumnya" muncul di Accurate, Olsera, Majoo.
3. **Dukungan adalah keluhan nomor tiga sampai empat** (11 sampai 24 persen menyebut CS, teknisi, atau training di Jurnal, Accurate, Majoo, Moka, Olsera, Odoo). Pola: ramah sebelum bayar, hilang sesudah bayar; dioper antar tim; tutup tepat saat closing akhir bulan; training terbatas atau berbayar. BukuWarung punya masalah khusus: CS bot, dan tombol yang rusak juga menutup kolom chat CS.
4. **Uang dan kontrak: janji sales tidak sama dengan kenyataan, aktivasi dan training tertunda setelah bayar, kontrak tahunan, refund dipotong atau tidak ada.** Terutama Majoo (15 persen menyebut sales, janji, training, teknisi), juga Moka, Accurate POS, iSeller, Olsera. Fitur dasar yang ditaruh di paket lebih mahal: Majoo (server lokal, diskon per item), dan di halaman harga resmi hak akses ditagih terpisah (Majoo, Accurate Multi Branch, Kledo per paket).
5. **Permintaan menyesuaikan sendiri ada, kecil jumlahnya tetapi tajam.** Satu ulasan BukuWarung meminta kembalinya "tambah kategori manual" dan mendapat 196 jempol. Zahir 2018: "benar-benar mirip exel yg membuat kita bebas mengatur apa yg kita butuhkan". Moka retail, varian Olsera, komisi (Moka dan Majoo untuk jasa).
6. **Biaya kesalahan jatuh ke orang paling bawah.** Kasir dimarahi bos karena error Moka, pegawai lapangan dipotong gaji karena Talenta salah baca lokasi, admin pulang malam saat closing.
7. **Pajak dan Coretax hampir tidak muncul di ulasan aplikasi** (0 sampai 2 persen). Bukan berarti tidak bermasalah; ulasan Play dan App Store ditulis oleh pengguna HP, bukan akuntan. Keluhan Coretax per aplikasi tidak terdokumentasi di sumber yang bisa saya buka.
8. **Per kursi: tidak ada keluhan publik.** Di 2.959 ulasan hanya satu yang menyebut batas jumlah pegawai (Majoo Lite 2026-04-02, kirain 3 kasir ternyata 1). Harga resminya memang per pengguna, per outlet, atau per modul, tetapi hipotesis 5 R7 tidak terjawab oleh sumber publik.
9. **Pindah itu jarang terjadi dengan nama tujuan.** Sekitar 6 ulasan menyebut aplikasi tujuan (Kledo, Odoo, Jurnal, Moka, Qasir, GentaTekno). Selebihnya "uninstal", "kapok", atau mengancam. Alasan yang konkret: harga (Jurnal ke Kledo), rusak setelah update, dukungan, terkunci kontrak atau database. BukuKas ditutup Mei 2023 dan penggunanya diminta mengunduh data ke Excel sebelum 26 Mei 2023.
10. **Pujian yang organik: membereskan catatan dan laporan dari cara manual, mudah bagi pemula, trainer atau admin yang ramah, praktis di HP bagi pegawai (slip gaji, cuti, absen).** Pujian jarang menyebut fleksibilitas atau pajak.
11. **Sektor yang tercakup sempit.** Hampir semua bukti dari kasir F&B/ritel, akuntansi umum, dan HR. Bengkel, kontraktor, klinik, produksi kecil nyaris tidak ada. Satu cuplikan lewat pencarian: ulasan Kaskus tentang Majoo untuk klinik menyebut tidak ada jadwal dokter atau booking pasien (⚠ ringkasan pencarian, tidak dibuka).
12. **Yang paling perlu ditanyakan langsung** (§5): biaya dan lama pindah nyata, siapa yang memutuskan membeli, sinyal di titik kerja, kursi dan unit harga mana yang bikin akses ditahan, apa yang diminta akuntan, dan keadaan di luar F&B.

## 2. Tema lintas aplikasi

### 2.1 Tabel tema

Frekuensi memakai kategori di §0. "Sampel" = ulasan bintang 1 dan 2 di app terkait. Keyakinan B kecuali dinyatakan lain.

| # | Tema | Paling sering di | Frekuensi kasar | Contoh singkat (bintang, tanggal) |
|---|---|---|---|---|
| 1 | Error, lambat, keluar sendiri, gangguan atau maintenance di jam kerja | Accurate 42, Talenta 36, Zahir 33, Majoo 32, Jurnal 31, Olsera 29, Odoo 48 (n kecil) | sering | Accurate Lite 1★ 2023-08-01 (239 jempol): "internet lancar buat aplikasi lain, ke accurate lemot". Accurate 1★ 2023-10-23: "Maintenen pas jam kerja." Moka 1★ 2024-09-29: "banyak data pembayaran ga masuk ke pendapatan padahal sudah memulai shift" |
| 2 | Setelah update jadi rusak, lambat, atau fitur berubah; tidak bisa balik ke versi lama | Olsera 19, Accurate 18, BukuWarung 18, Majoo 10, Talenta 10 | cukup sering | Accurate 1★ 2025-11-14: "versi sebelumnya lebih praktis dan cepat". Olsera Office 2★ 2024-10-31: "Tolong kembalikan yg versi sebelumnya min". Majoo 1★ 2024-01-16: "Tiap update bukannya semakin bagus UX nya malah semakin hancur." |
| 3 | Gerbang masuk: daftar, OTP, verifikasi, login, nomor lama tidak aktif, minta KTP atau NPWP | GadjianKu 42, Odoo 30, Kledo 23, Zahir 22, Jurnal 19, Majoo 17, Moka 17, Olsera 17 | cukup sering | BukuWarung 1★ 2026-01-21: "minta otp gak di kirim2 30 menit kemudian di spam otp". Moka 1★ 2023-06-26: "kudu daftar segala KTP...kek pinjol aja deh". Jurnal 1★ 2019-05-04 (25 jempol): "Daftar aja ribet bikin Password pdhl udah gede kecil spesial dan angka masih aja ga bisa" |
| 4 | Dukungan: lambat, dioper, tutup saat dibutuhkan, fokus jualan, training terbatas atau berbayar | Olsera 24, Majoo 23, Jurnal 16, Odoo 15, Moka 14, Accurate 12, Zahir 13, BukuWarung 11 | cukup sering | Jurnal 1★ 2025-09-02: "komplain hanya via chat di jurnal.id dan suruh menunggu 7-9 hari". Accurate 1★ 2026-08-05: "CS supportnya fokus jualan bukan memberikan solusi. Trainingnya berbayar." Moka 1★ 2025-03-15: "hubungi cs slow respon sekali" |
| 5 | Janji sales tidak sama dengan kenyataan; aktivasi atau training tertunda setelah bayar; kontrak tahunan; refund dipotong atau tidak ada | Menyebut sales, janji, training, teknisi: Majoo 15, Olsera 10. Menyebut kontrak, refund, blokir akun: iSeller 14 (n kecil), Majoo 7, Olsera 7, Zahir 6, Accurate 5 | cukup sering di Majoo, kadang di lain | Majoo 1★ 2023-03-21 (51 jempol): "sebelum bayar tiap hari neror nanyain baik2in kita". Jurnal 1★ 2020-03-05 (51 jempol): "minta refund,lsng di potong 50%". iSeller Apple 1★ 2026-08-24: "Tidak bisa refund, jangan mau kena tipu" |
| 6 | Data berubah sendiri, hilang, atau tidak sinkron (stok jadi 0, harga berubah, dua perangkat, POS dengan web, marketplace, akuntansi) | Majoo 7, BukuWarung 7 (9 bila ikut data hilang saat pulihkan), Moka 4, Kledo 4, Zahir 4 | kadang, tetapi dampaknya paling berat | Majoo 1★ 2023-08-16 (44 jempol): "Data sering berubah2 sendiri bisa tiba2 semua stok jadi 0". Moka 1★ 2022-12-07 (49 jempol): "data di kasir sama web tidak sinkron". Olsera 1★ 2026-09-21: "stoknya selalu selisih,bahkan kadang sampe puluhan,karyawan juga tidak ada akses buat otak Atik stok" |
| 7 | Hal dasar ditaruh di paket lebih mahal atau add-on | Majoo, Kledo, Jurnal (halaman harga resmi A, dan ulasan) | kadang di ulasan | Majoo Apple 2★ 2026-02-02: kelancaran transaksi "(offline / server lokal) justru ada di paket berbayar tinggi". Majoo 1★ 2026-03-03: "untuk ngasih discount per item dan per customer butuh upgrade lagi" |
| 8 | Tidak bisa disesuaikan: kategori, menu, varian, alur retur dan split bill, tampilan invoice, komisi | BukuWarung, Moka, Olsera, Zahir, Jurnal | kadang, tetapi dukungan jempolnya besar | BukuWarung 1★ 2026-06-30 (196 jempol): "Hilangnya fitur tambah kategori manual". Moka 1★ 2022-07-05 (56 jempol): "sistem returnya, sistem spilt billnya ribet bgt sih kurang fleksibel". Zahir 2★ 2018-06-11: "benar-benar mirip exel yg membuat kita bebas mengatur apa yg kita butuhkan" |
| 9 | Aplikasi HP tidak setara web atau platform lain (iOS, Lite, tampilan beda) | Accurate Lite (iOS), Jurnal, Zahir, iSeller Admin | kadang | Jurnal 2★ 2021-08-10 (47 jempol): "justru lebih lengkap dan lebih detail klo sy buka via web". Accurate Apple 1★ 2025-06-30: "ios anak tiri kah min lama banget update fitur nya" |
| 10 | Cetak struk dan perangkat keras (printer Bluetooth atau thermal, tablet yang didukung, EDC) | Moka 7, Zahir 7, Olsera 5, Accurate 4, Majoo 3 | kadang | Moka 2★ 2018-12-28 (87 jempol): "Printer yg bisa dipakai oleh aplikasi ini cuma 1-2 saja". Olsera 1★ 2025-03-04: "POS yang sangat buruk dalam hal proses Printing". BukuWarung 2★ 2026-02-05 (74 jempol): "saat hendak mencetak struk, aplikasi langsung eror dan force close" |
| 11 | Biaya kesalahan jatuh ke orang di bawah: kasir, pegawai lapangan, admin | Talenta, Moka, Majoo | kadang, tetapi bobotnya besar | Talenta 1★ 2026-08-10 (19 jempol): "banyak orang lapangan kepotong gaji nya, padahal absen masuk tidak terlambat". Moka 1★ 2024-09-29: "saya sering kenal omel bos saya karena error aplikasi moka" |
| 12 | Kontrol dan izin: jarang, tetapi spesifik | Accurate Lite, Majoo Lite, Olsera, iSeller, Talenta, Zahir | jarang (1 sampai 3 persen) | Accurate Lite 2★ 2023-04-03 (139 jempol): "syarat pembayaran bs diedit oleh salesman di accurate lite shg sia2 setting pd accurate online". Majoo Lite 1★ 2025-07-18: "karyawan bisa melakukan semua di data produk" |
| 13 | Terkunci dan susah keluar: database terikat, akun diblokir saat telat bayar, kontrak sisa, produk ditutup | Accurate POS, Accurate Lite, Kledo, Jurnal, iSeller, BukuKas | jarang di ulasan, tetapi konkret | Accurate POS 1★ 2025-08-06: "pingin putus berlangganan tapi database sudah terikat di servernya". iSeller Apple 1★ 2025-10-11: "kontrak masih ada sisa 2 tahun lagi" |
| 14 | Privasi dan telepon sales setelah daftar | Moka (4), Majoo (2), Jurnal | kadang di Moka | Moka 1★ 2021-12-27: "Jika anda berikan nomor anda maka anda akan ditelpon terus". BukuWarung 1★ 2026-06-30: pengguna minta penghapusan data KTP dari akun lama dan mengaku dipersulit |

### 2.2 Angka per aplikasi

Profil sampel. Rating dari Play (jumlah rating) dan App Store Indonesia (jumlah rating), dibaca 12 Oktober 2026.

| Aplikasi (paket yang dibaca) | Play | App Store | n bintang 1 dan 2 (Play + App Store) | Rentang tanggal sampel | Umur di bawah 12 bulan |
|---|---|---|---|---|---|
| Jurnal (Jurnal Mobile, Jurnal Touch) | 4,59 (1.289); Touch 4,01 (72) | 4,29 (322) | 146 (119 + 27) | 2017-09 sampai 2026-04 | 3 |
| Accurate (Accurate Lite, Accurate POS) | Lite 4,71 (4.060); POS 4,88 (793) | Lite 2,51 (39) | 185 (165 + 20) | 2018-07 sampai 2026-09 | 61 |
| Kledo (Kledo, Kledo POS) | 4,37 (633); POS 4,00 (72) | 4,33 (114) | 56 (47 + 9) | 2021-08 sampai 2026-10 | 6 |
| Zahir (Apps, Simply, POSX) | 3,95 (204); Simply 4,13 (319); POSX 3,96 (151) | Apps 4,4 (15); POSX 3,61 (28) | 54 (50 + 4) | 2018-05 sampai 2026-06 | 1 |
| BukuWarung | 3,18 (94.650) | tidak ketemu | 500 (500 + 0) | 2023-07 sampai 2026-10 | 398 |
| Majoo (majoo, Lite, Owner, Teams) | 4,87 (16.083); Lite 4,25 (310); Owner 4,23 (68); Teams 3,75 (95) | Kasir 4,19 (690); Lite 3,6 (80); Owner 3,13 (24); Teams 2,58 (36) | 530 (433 + 97) | 2019-11 sampai 2026-09 | 61 |
| Moka | 4,73 (12.507) | tidak ketemu | 425 (425 + 0) | 2016-08 sampai 2026-09 | 33 |
| Olsera (POS, Office) | POS 4,44 (1.361); Office 4,72 (833) | POS 4,07 (199); Office 3,85 (172) | 178 (136 + 42) | 2019-09 sampai 2026-10 | 24 |
| iSeller (Admin, Retail) | Admin 4,37 (90); Retail 4,34 (194) | Admin 3,28 (32) | 28 (20 + 8) | 2020-07 sampai 2026-08 | 3 |
| Talenta (Talenta, Attendance) | 4,49 (48.112); Attendance 4,21 (1.266) | 3,90 (5.676) | 769 (591 + 178) | 2020-03 sampai 2026-10 | 508 |
| Gadjian (GadjianKu, Admin) | GadjianKu 4,24 (449); Admin 4,68 (40) | GadjianKu 4,46 (71) | 55 (49 + 6) | 2019-10 sampai 2026-10 | 8 |
| Odoo (aplikasi global) | 3,48 (4.906) | 2,33 (33) | 33 (18 + 15) | 2019-09 sampai 2026-09 | 8 |

Catatan baca tabel. Rating tinggi Play untuk Majoo (4,87) dan Moka (4,73) berdampingan dengan 300 ulasan bintang 1 yang saya ambil, jadi rating tinggi tidak membuktikan sedikit keluhan; lihat bias nomor 3 di §0. Selisih Play dan App Store cukup besar di beberapa aplikasi (Accurate Lite 4,71 dan 2,51; Talenta 4,49 dan 3,90; Odoo 3,48 dan 2,33), alasan tidak diketahui. Histogram Play BukuWarung: 35 persen bintang 1 (32.867), 44 persen bintang 5 (41.456), sangat terbelah. Histogram aplikasi lain tidak saya pakai karena jumlahnya tidak cocok dengan total rating.

Persen ulasan bintang 1 dan 2 yang memuat kata kunci tema (dibulatkan; baca §0).

| Aplikasi | Error, lambat | Setelah update | Login, daftar | CS, support | Harga, tagihan, refund | Data berubah, hilang | Struk, printer | Offline | Ekspor, impor | Pajak |
|---|---|---|---|---|---|---|---|---|---|---|
| Jurnal (146) | 31 | 4 | 19 | 16 | 8 | 3 | 2 | 0 | 1 | 1 |
| Accurate (185) | 42 | 18 | 12 | 12 | 3 | 3 | 4 | 1 | 1 | 2 |
| Kledo (56) | 21 | 7 | 23 | 11 | 7 | 4 | 2 | 2 | 0 | 0 |
| Zahir (54) | 33 | 9 | 22 | 13 | 4 | 4 | 7 | 0 | 2 | 0 |
| BukuWarung (500) | 18 | 18 | 6 | 11 | 1 | 7 | 2 | 0 | 2 | 0 |
| Majoo (530) | 32 | 10 | 17 | 23 | 9 | 7 | 3 | 1 | 2 | 1 |
| Moka (425) | 19 | 8 | 17 | 14 | 7 | 4 | 7 | 4 | 2 | 0 |
| Olsera (178) | 29 | 19 | 17 | 24 | 4 | 2 | 5 | 0 | 2 | 1 |
| iSeller (28) | 21 | 0 | 14 | 11 | 18 | 4 | 0 | 0 | 0 | 0 |
| Talenta (769) | 36 | 10 | 12 | 3 | 2 | 1 | 0 | 1 | 0 | 0 |
| Gadjian (55) | 9 | 7 | 42 | 4 | 2 | 2 | 0 | 0 | 0 | 0 |
| Odoo (33) | 48 | 3 | 30 | 15 | 0 | 0 | 3 | 0 | 0 | 0 |

Tiga pengecualian yang tidak tampak di tabel:
- **BukuWarung**: sejak sekitar akhir Januari 2026, 153 dari 388 ulasan bintang 1 dan 2 berumur 2026 (39 persen) menyebut tombol angka 0 atau tombol bawah tertutup bilah navigasi Android setelah update. Ini di luar kolom "error" karena bukan crash.
- **Talenta**: masalah saat clock in atau out (error, loading, verifikasi lambat) 198 dari 769 (26 persen), lokasi atau radius 112 (15), potongan gaji atau denda atau telat 67 (9), login atau OTP atau logout 57 (7), wajah atau selfie 22 (3), cuti dan izin 18 (2).
- **Gadjian**: 42 persen ulasan menyangkut aktivasi akun dan login di GadjianKu (aplikasi pegawai), bukan fitur payroll.

### 2.3 Tema pujian

Dasar: ulasan bintang 5 (hanya yang ≥ 70 karakter) dan kalimat memuji di dalam ulasan bintang rendah. Peringatan ⚠ untuk kelompok bintang 5 bernada iklan (lihat §0 bias 3).

| Tema pujian | Aplikasi | Bukti | Catatan |
|---|---|---|---|
| Merapikan catatan dan laporan, menggantikan cara manual atau Excel | Kledo, Jurnal, Zahir, Olsera | Kledo 5★ 2026-09-24: "Aku sendiri sebelumnya masih sering nyatet manual, jadi kadang ada transaksi yang kelewat." Zahir 5★ 2018-04-28: "menghitung laba rugi, hutang dan piutang, serta sisa stock" | Jurnal bintang 5 Maret 2025 yang menyebut "dari yang awalnya pakai excel yang ribet" ada di kelompok bertanggal sama ⚠ |
| Mudah bagi pemula atau orang tanpa dasar akuntansi | Kledo, Zahir, Moka | Kledo 5★ 2026-08-20: "yang gak ada basic accounting boleh banget dicoba". Zahir 5★ 2018-10-24: "mudah di gunakan dan mudah di pahami" | Kledo punya paket gratis, jadi pemula memang banyak |
| Satu ekosistem: kasir, akuntansi, gaji | Kledo (Kledo, Kledo POS, Gajihub) | Kledo POS 5★ 2024-01-29: "sistem kasir, pencatatan akuntansi dan penggajiam yang terhubung dalam satu ekosistem" | Satu pengguna, 22 jempol |
| Trainer dan after-sales yang ramah | iSeller, Majoo, Moka, Kledo | iSeller Retail 5★ 2022-06-29: "after salesnya juga oke bgt fast respon". Moka 5★ 2026-06-09: "trainnernya sippp, gampang banget bikin pengguna ngerti" | 5 dari 7 bintang 5 iSeller memuji trainer atau after sales. Majoo bintang 5 Sep sampai Okt 2026 sering menyebut nama trainer ⚠ |
| Praktis di HP bagi pegawai: absen, cuti, slip gaji | Talenta, GadjianKu | Talenta 5★ 2026-09-08: "lebih mudah melakukan absensi, lebih mudah memantau absensi, lebih mudah melakukan pengajuan absensi, praktis dan efisien". GadjianKu 5★ 2026-07-27: "tdk pernah protes lagi ke HRD gara gara absen" | Bukti kehadiran yang bisa dicek ulang disebut sebagai manfaat (Talenta 5★ 2026-09-23) |
| Setup di awal berat, sesudahnya HRD tenang | GadjianKu | 5★ 2022-02-08: "Settingan awal memamg cukup banyak tapi setelahnya HRD sudah tidak perlu lagi menghitung lain-lainnya" | Satu ulasan |
| Stok, varian, komisi, integrasi marketplace | Olsera, Majoo, iSeller | Majoo 5★ 2026-10-08: "laporan komisi juga membantu untuk outlet dibidang jasa". iSeller Retail 5★ 2022-03-12: "fitur konek sama marketplacenya" | Komisi muncul juga sebagai kekurangan di Moka (lihat §3.7) |
| Harga cocok | Olsera, Kledo | Olsera Office 5★ 2026-04-28: "harga juga sangat terjangkau seimbang dgn fitur dan layanan sistemnya" | Pengguna Kledo sering menyebut paket gratis |
| Pengguna lama yang membela | Accurate | Accurate Lite 5★ 2025-02-03 (16 jempol): "Accurate bukan layani anda seorang tp se indonesia.. Kalau mau cepat, cari lah trainer/ layanan berbayar" | Menarik: pengguna yang puas menerima training berbayar sebagai wajar |

Pola yang penting: **banyak ulasan bintang rendah memuji dulu**, lalu kecewa karena keandalan atau update. Contoh: BukuWarung 1★ 2026-01-21: "Awal pakai sangat bagus, sangat membantu Catat utang Piutang". Accurate 2★ 2024-09-25: "Secara software bagus, dan mudah untuk dipahami. Namun secara support client buruk". Olsera POS 1★ 2022-06-22: "Aplikasinya bagus sebenarnya.hanya pelayanan marketingnya dan aftersalesnya kurang bagus." Moka 1★ 2021-11-17: "Saya rasa fitur2nya telah mengakomodir kebutuhan toko saya." Artinya fungsi dasarnya diterima; yang membuat mereka marah adalah rusaknya sesuatu yang tadinya jalan.

### 2.4 Alasan berhenti atau pindah

Peringatan: keluhan dan ancaman jauh lebih banyak daripada aksi. Yang saya hitung sebagai pernyataan pindah dengan nama tujuan hanya sekitar 6 dari 2.959 ulasan. Yang menyebut "uninstal", "kapok", "tidak lanjut" lebih banyak tetapi tidak punya tujuan. R4 §6.2 dikuatkan: jangan menyamakan keluhan dengan niat pindah.

| Alasan | Contoh (aplikasi, bintang, tanggal) | Catatan |
|---|---|---|
| Harga naik atau tidak sepadan | Jurnal 1★ 2023-03-05: "sya skrg pindah pke aplikasi kledo .fitur nya sama persis .jurnal 800rb/bln kledo cuma 200rb/bln". iSeller Retail 1★ 2020-11-14: "250.000/bulan untuk biaya langganan. Mendingan pakai produk sebelah yg cuman $5/bulan". Moka 1★ 2025-04-01: "kemahalan untuk berlangganan masa 300k ?" | Satu-satunya pindah bernama dengan alasan harga (Jurnal ke Kledo). Angka Rp800 ribu per bulan tidak cocok dengan harga etalase sekarang (R8d §2.2), jadi anggap kesan, bukan harga |
| Rusak setelah update | Accurate Lite 2★ 2026-06-30 (35 jempol): "beralih ke Odoo aja guys.. makin lama makin lemot nih app". Olsera Office 1★ 2024-11-22: "Versi baru sangat lemot. Mempertimbangkan ganti aplikasi." BukuWarung 1★ 2026-02-05: "kalau kelamaan gini auto pindah aplikasi lain" | Alasan paling sering diucapkan |
| Dukungan tidak menyelesaikan | Olsera Office 1★ 2024-11-23 (23 jempol, 3 tahun, 2 toko): "Biar kami cari sistem pos yg lain yg bisa memenuhi kebutuhan Kami". Zahir Apps 1★ 2022-10-08: "memutuskan tidak berlangganan lagi, karena layanan nya yang buruk". Kledo 1★ 2023-08-02 (67 jempol): "Sedang pertimbangkan utk ganti program aja ke yang lain" | Kledo: sebelumnya "service dari CS gercep"; dua bulan terakhir data stok tidak muncul |
| Perangkat atau fitur ternyata tidak didukung setelah bayar | Moka 1★ 2023-09-14: sudah bayar 1 tahun, baru tahu harus pakai printer Epson dan tablet tertentu. Zahir POSX Apple 2★ 2022-04-23: beli perangkat 7 juta lebih lewat Zahir, kemudian dikatakan tidak didukung. iSeller Apple 1★ 2024-03-01: dijanjikan terhubung ke semua marketplace, ternyata hanya salin ke Shopee | Tiga kasus berbeda, polanya sama: janji sales, kenyataan di lapangan |
| Terkunci kontrak atau data | Accurate POS 1★ 2025-08-06: "database sudah terikat di servernya". Accurate Lite 1★ 2019-03-30: "klo gak bayar gak bisa dibuka, mana data disitu semua". Kledo 1★ 2022-04-11 (30 jempol): "Mintanya min 3bln dan data yg udah masuk gak bisa di akses lagi". Jurnal 1★ 2018-10-09 (20 jempol): "tapi kalau bulanan. Gak akan, karena ada masanya usaha yang omsetnya menurut" | Mendukung hipotesis 11 dari sisi pengalaman, bukan dari sisi "menolak karena takut terkunci" |
| Produk ditutup | BukuKas: pemberitahuan lewat WhatsApp, aplikasi tidak dapat dipakai setelah 26 Mei 2023, pengguna diminta mengunduh data ke Excel sebelumnya (CNBC Indonesia 2023-05-15, A). Induknya, Lummo, masuk likuidasi sukarela September 2023 (DealStreetAsia lewat pencarian, ⚠) | Satu-satunya kasus "dipaksa pindah" yang terdokumentasi |
| Kembali ke manual | Majoo 1★ 2023-08-16 (44 jempol): "Apa bedanya pake sistem pembukuan pakai kertas dan pulpen". Moka 1★ 2022-04-15: "Jadinya saya harus ngitung manual gara gara ini app error". Olsera 1★ 2026-06-25: "bagian shift di hilangin sih, jadi harus ngitung manual satu persatu" | Bukti anekdot untuk "diam-diam kembali ke manual" (R4 §4.3 hipotesis) |
| Salah paham gratis atau trial | Kledo 1★ 2022-12-05: "Gratis selamanya....ah kirain, sori saya uninstal". Kledo 2★ 2022-08-30: "Ternyata free trial hanya 14 hari. Kirain bisa free terus." Jurnal 2★ 2018-09-12: "Kirain gratis ternyata trial" | 2 sampai 7 persen ulasan di Jurnal, Kledo, Majoo, Moka. Ini mismatch ekspektasi di pintu masuk, bukan pindah |

### 2.5 Harga, kursi, paket

Harga etalase lengkap sudah di R8d §2.2 (dibaca hari yang sama; angka yang saya baca di halaman resmi cocok). Yang ditambahkan di sini: apa yang pengguna keluhkan, dan tiga temuan harga yang relevan untuk kursi dan fleksibilitas.

**Yang dikeluhkan pengguna** (ulasan bintang 1 dan 2, B):

| Pola | Contoh | Aplikasi |
|---|---|---|
| Harga naik atau mahal untuk nilai yang diterima | Jurnal Apple 1★ 2019-10-24: "Harga makin mahal, fitur malah dipangkas". Majoo 1★ 2026-03-03: "fitur yang sama pembayaran berikutnya malah ada kenaikan harga". Moka 1★ 2025-04-01 | Jurnal, Majoo, Moka, iSeller |
| Harga di iklan tidak sama dengan harga checkout | Olsera POS 1★ 2020-02-20: "di iklan 140rb/bulan, tp setelah saya chek out pembyaran tertera 218rb/bulan" | Olsera (satu kasus 2020) |
| Batas pengguna atau kasir ternyata sempit | Majoo Lite 1★ 2026-04-02: "akses karyawan tanpa batas ... ternyata hanya bisa mendaftarkan 1 orang kasir saja. jika mau tambah karyawan harus langganan majoo reguler yang lebih mahal." | Satu-satunya keluhan kursi di 2.959 ulasan |
| Perpanjangan atau add-on membatalkan hak yang sudah dibayar | Accurate POS 1★ 2026-04-28: lisensi utama setahun "ikut hangus" saat add-on bulan pertama gratis mulai ditagih. Majoo 1★ 2025-03-25: "beli promo langganan 2 tahun, baru berjalan 1 tahun sudah diminta bayar lagi" | Accurate POS, Majoo |
| Biaya transaksi pembayaran | Majoo 1★ 2023-09-11 (30 jempol): sales bilang tidak ada fee MDR 2 persen, teknisi bilang ada. Majoo 1★ 2024-12-06: "Qris mdr mahal 1% juga cair lama bgt, aplikasi sebelah yg cuma 50rb/bln qris mdr 0,6℅ bisa cair sehari". Moka Play 1★ 2021-12-21 (25 jempol): pencairan dana lebih lama dari yang dijanjikan | Majoo, Moka, iSeller (payout 1 sampai 3 minggu), BukuWarung (EDC) |
| Refund | Jurnal 1★ 2020-03-05 (51 jempol): "minta refund,lsng di potong 50%". Kledo Apple 1★ 2025-10-25: "bayar langganan 500k cuma diganti benefit senilai 200k". iSeller Apple 1★ 2026-08-24 | Jurnal, Kledo, iSeller |
| Trial, gratis, kirain gratis | lihat §2.4 | Kledo, Jurnal, Moka, Majoo |

**Tiga temuan dari halaman resmi** (A, dibaca 12 Oktober 2026, tidak bertanggal kecuali pengumuman Accurate):
1. **Hak akses dijual terpisah.** Majoo: Lisensi Karyawan dan Lisensi Hak Akses Rp49.000 per outlet per bulan (add-on). Accurate: add-on Multi Branch Rp99.900 per cabang per bulan "atur hak akses karyawan per cabang". Kledo: hak akses "Basic" di Pro, "Advance" di Elite dan Champion, "tidak tersedia" di Free. Padahal ulasan menunjukkan hak akses adalah sumber kerugian nyata bagi owner (§2.1 baris 12).
2. **Fleksibilitas dijual sebagai upgrade.** Jurnal (tabel perbandingan paket, dicocokkan ke HTML mentah): custom field "Add-on" di Essentials, 1 field di Plus, 3 field di Jurnal 360; custom report "Add-on" di Essentials dan Plus, 1 laporan di Jurnal 360; custom dashboard "Add-on", "Add-on", 1 dasbor. Kledo (HTML mentah): approval bertingkat hanya di Champion, hak akses "Advance" dari Elite. Ini mendukung sisi penawaran dari hipotesis 3 R7. Bukti permintaan ada di ulasan BukuWarung dan Moka (baris 8), tetapi tidak ada ulasan yang menyebut custom field Jurnal.
3. **Accurate menaikkan harga data usaha mulai 1 Januari 2026**: Rp300.000 sebelum PPN (Rp333.000 setelah PPN 11 persen); pengguna lama tetap Rp250.000 sebelum PPN (Rp277.500) sampai 30 Juni 2026. Pengumuman resmi (accurate.id). Tidak ada ulasan yang saya baca mengeluhkan kenaikan ini; ulasan Accurate yang menyebut harga hanya 3 persen.

**Kursi.** Di 2.959 ulasan tidak ada keluhan "per kursi". Alasan yang mungkin (tebakan, bukan temuan): kursi di aplikasi akuntansi Indonesia murah (R8d §2.2.4), yang membatasi adalah outlet, cabang, gudang, faktur; atau pemilik yang menahan akses staf tidak menulis ulasan. Hipotesis 5 R7 tetap harus ditanya.

### 2.6 Impor data, ekspor, dukungan, offline, struk/thermal, pajak/Coretax

| Topik | Apa yang terdokumentasi | Frekuensi | Keyakinan |
|---|---|---|---|
| **Impor data dan migrasi** | Jurnal Apple 1★ 2019-12-02: "Penginputan pertama kali diberikan kepada customers sendiri. Tanpa ada panduan bgmn mengisinya", laporan "terbengkalai selama 6bln" karena data pindahan beda dengan software lama. Jurnal 1★ 2021-01-19 (58 jempol): menghapus satu file impor yang salah malah menghapus banyak file impor sebelumnya, "Hubungi CS ktnya tidak punya backup". Olsera Office 2★ 2024-08-05: update harga lewat impor berhenti bekerja untuk stok 0 tanpa pemberitahuan. Majoo 1★ 2024-02-05: "Cuma data teks aja yang bisa bulk update sedangkan foto harus masukan satu per satu". Majoo 1★ 2023-10-14: "Upload produk aja sampek 1 jam lebih kagak selesai". Zahir POSX 2★ 2019-04-18: "tidak bisa upload stock tidak bisa upload harga dasar". Panduan reseller Accurate (C): lima kesalahan migrasi: tidak rapikan bagan akun, saldo awal tidak seimbang, tidak ada stok opname akurat, tanggal cut-off tidak disepakati, lewati uji penerimaan. Webinar Kledo (C, parafrase dari ringkasan): masalah utama klien adalah kualitas data, bukan pajaknya. G2 Jurnal (⚠ ringkasan): impor memudahkan transaksi besar tetapi lambat saat impor | jarang di ulasan (0 sampai 2 persen), tetapi dampaknya satu ulasan bisa 58 jempol | B (ulasan), C (reseller dan vendor), ⚠ (G2) |
| **Ekspor dan laporan** | BukuWarung: sekitar 10 ulasan tentang gagal mengunduh laporan atau PDF (hitung manual, Februari sampai Mei 2026 dan satu dari Januari 2024). BukuWarung 1★ 2026-02-12: "laporan pembukuan gak bs diunduh. sudah bberapa kali komplain hbungi cs katanya suruh uninstall trus install ulang. trnyata pas diinstal, datanya hilang". Talenta 2★ 2025-09-01: slip gaji selalu gagal diunduh. Olsera Office 1★ 2024-11-11: laporan hanya menampilkan penjualan hari, tidak bisa hari atau bulan. Kledo Apple 1★ 2025-04-13: vendor mengubah tata letak dokumen tanpa pemberitahuan ("change document layout without customer acknowledgment"). Jurnal Apple 1★ 2019-10-24: pengguna tidak bisa lagi mengedit tampilan PDF invoice | kadang (BukuWarung), jarang lain | B |
| **Dukungan pelanggan** | Lihat §2.1 baris 4. Waktu tunggu yang disebut: Jurnal 7 sampai 9 hari (2025), Olsera 1 minggu sampai 1 bulan, Moka teknisi tidak datang 2 minggu sampai 6 bulan, Kledo POS 21 hari tanpa selesai (2024-10-21). CS tutup saat dibutuhkan: Talenta 1★ 2026-06-07: mengadu ke customer care, "ternyata libur", padahal aplikasi "dipakai untuk approval absensi karyawan". Olsera POS 1★ 2021-12-02: situs menulis 24/7 tetapi "hanya bisa d selesaikan pada saat jam kantor". Jawaban umum CS: instal ulang (Jurnal Apple 2025-04-17, BukuWarung 2026-02-12), minta salinan database (Accurate POS 2025-08-06) | cukup sering (11 sampai 24 persen) | B |
| **Offline** | Disebut eksplisit jarang: Moka 4 persen, Kledo 2, lainnya 0 sampai 1. Contoh: Moka 1★ 2023-12-30: "Tidak bisa print struck saat offline.. padahal sangat dibutuhkan ketika tidak tersedianya jaringan". Accurate Lite 1★ 2026-01-13: butuh penerimaan penjualan "disaat listrik mati dan kita tidak bisa memakai komputer". Kledo 2★ 2024-08-15: "Kecewa gak bisa offline". Talenta 1★ 2026-09-05: "Tidak bisa absen offline mode pesawat ... area susah sinyal dikebun atau dihutan". Talenta 2★ 2024-10-17: tidak bisa absen "ditengah laut meski sudah mode offline". Majoo Apple 2★ 2026-02-02: "Server Lokal kebutuhan dasar biar transaksi lancar, bukan premium atau kemewahan"; fitur itu di paket tinggi. Jauh lebih sering ditulis: "jaringan bagus tapi loading terus" (Accurate 2026-08-22, Talenta 2026-04-03: "SINYAL BAGUS TAPI SERING EROR") | jarang eksplisit; keluhan "sinyal bagus tapi lambat" lebih sering | B |
| **Cetak struk dan thermal** | Moka 2★ 2018-12-28 (87 jempol): printer yang didukung "cuma 1-2 saja". Moka 2★ 2019-03-09 (67 jempol): laporan harian tercetak semua "sampai menghabiskan stengah roll kertas struk". Olsera POS 1★ 2025-03-04: gagal cetak ke printer kasir, dapur/bar, dan stiker label; vendor menyalahkan koneksi Bluetooth pelanggan lain (parafrase). Accurate Lite 1★ 2025-12-14: "setelah update fitur print wifi, skrg print bloetooth yg tdk bisa di setup". Accurate Lite 1★ 2025-02-05 (8 jempol): riwayat cetak "numpuk sampe 77 ribu" tidak bisa dihapus. Zahir POSX Apple 2★ 2020-07-18: "Koneksi ke bluetooth thermal berhasil. Tp tdk bisa print out struk". Kledo POS 2★ 2025-08-02: "susah connect ke printer thermal". Zahir Apps 1★ 2019-03-09 (30 jempol): cetak nota di printer dot matrix terlalu besar, kertas boros. BukuWarung 2026: gagal cetak setelah update, banyak ulasan | kadang (Moka 7, Zahir 7, Olsera 5, Accurate 4); BukuWarung melonjak 2026 | B |
| **Pajak dan Coretax** | Ulasan Play dan App Store: sangat jarang. Majoo Apple 1★ 2025-11-21: "Settingan pajak tidak bisa ubah walaupun sudah dibayar". Accurate 1★ 2025-02-22: "Tulisan DPP membingungkan". Zahir 2★ 2020-04-04: "tax tidak muncul di rincian". Moka 1★ 2026-01-31: "malas harus ada npwp". Coretax: tidak ada ulasan aplikasi yang menyebutnya. Dari sumber lain (⚠ semuanya belum dibuka penuh): komunitas Mekari punya utas "Kendala Implementasi Coretax" dan "Solusi Praktis Mengatasi Kendala Impersonate Akun Coretax Badan" (judul dari hasil pencarian, 403 saat dibuka); ringkasan Capterra Talenta menyebut satu pengulas kesulitan menyambung ke Coretax; halaman harga Talenta menyebut "Buat eBupot (DJP integration)" hanya di paket Plus (A); reseller Accurate mengklaim Accurate Online siap Coretax lewat PJAP (C ⚠). Blog Kledo (tanggal di artikel 19 Juni 2026, C): masalah utama klien adalah data tidak rapi. Klaim PP 20 Tahun 2026 tentang siapa yang boleh memakai PPh final UMKM di blog yang sama **⚠ belum dicek ke teks aturan; jangan dijadikan apa pun** | jarang (0 sampai 2 persen) | B (ulasan), C dan ⚠ (lainnya) |

### 2.7 Tema yang akhirnya berulang lintas aplikasi

Diurutkan menurut seberapa kuat buktinya di sumber publik ini. "Kuat" = muncul di 6 aplikasi atau lebih dan berulang bertahun-tahun.

| Urutan | Tema | Kekuatan bukti | Catatan |
|---|---|---|---|
| 1 | Aplikasi tidak bisa diandalkan saat jam sibuk atau closing (error, lambat, maintenance di jam kerja) | Kuat (semua 12 aplikasi) | Waktu kejadian penting: akhir bulan, jam makan, shift, "disaat toko harus segera menotalkan produk" |
| 2 | Update merusak dan tidak bisa kembali | Kuat (8 aplikasi: Accurate, Olsera, BukuWarung, Majoo, Talenta, Jurnal, Kledo, Moka) | Menimpa pengguna lama yang tadinya puas |
| 3 | Dukungan berputar setelah bayar; onboarding dan training tidak datang | Kuat (9 aplikasi) | Mekari Talenta dan GadjianKu bukan contoh, karena pengulasnya pegawai |
| 4 | Janji sales sebelum bayar vs kenyataan; kontrak dan refund | Cukup kuat (Majoo, Moka, Accurate POS, iSeller, Olsera, Odoo, Jurnal 2020) | Banyak yang tidak ada kabar setelah bayar |
| 5 | Data berubah sendiri atau tidak sinkron antar tempat (HP, web, POS, marketplace, akuntansi) | Cukup kuat (Majoo, Moka, BukuWarung, Jurnal-Moka, Accurate-POS, Kledo-POS, Zahir) | Dampak paling berat per kejadian (stok, harga, saldo) |
| 6 | Pengguna ingin menyesuaikan sendiri hal kecil, sedikit tetapi didukung banyak jempol | Sedang (BukuWarung, Moka, Olsera, Zahir, Jurnal) | Jangan dibaca sebagai "semua orang ingin kustomisasi"; permintaannya konkret (kategori, varian, komisi, split bill) |
| 7 | Gerbang masuk (daftar, OTP, KTP) membuat orang pergi sebelum mencoba | Cukup kuat tetapi pengulasnya sebagian bukan target | Pindah ke R7 sebagai hipotesis baru: berapa langkah sebelum nilai pertama |
| 8 | Cetak dan perangkat keras bukan urusan sampingan untuk kasir | Sedang (Moka, Zahir, Olsera, Accurate, BukuWarung) | Relevan hanya bila industri awal berkasir |
| 9 | Hak akses dan kontrol uang ditagih terpisah atau dilewatkan | Lemah di ulasan, kuat di halaman harga | Kontrol laci, syarat pembayaran bisa diedit sales, karyawan bisa ubah produk |

Yang **tidak** berulang walau dikira: keluhan "per kursi" (hanya 1), pajak/Coretax (0 sampai 2 persen), dan offline sebagai kata (0 sampai 4 persen).

## 3. Per aplikasi

Format: sumber dan sampel, keluhan (frekuensi kasar dan kutipan pendek), pujian, berhenti atau pindah, harga, catatan teknis, keyakinan. Persen dari §2.2.

### 3.1 Mekari Jurnal

Sumber: [Play id.jurnal.mobile](https://play.google.com/store/apps/details?id=id.jurnal.mobile), [Play Jurnal Touch](https://play.google.com/store/apps/details?id=id.jurnal.JurnalTouch), [App Store Jurnal Mobile](https://apps.apple.com/id/app/id1289636276), [RSS](https://itunes.apple.com/id/rss/customerreviews/page=1/id=1289636276/sortby=mostrecent/json). n=146 (2017 sampai 2026; hanya 3 yang berumur di bawah 12 bulan), 8 di antaranya salah kira. Produk inti (web) tidak punya ulasan di sumber yang bisa saya buka.

**Keluhan.**
- Error, force close, lambat di HP (31 persen): Apple 1★ 2023-11-17: "Selalu crash pada saat masuk ke halaman penjualan dan pembelian". Play 1★ 2024-01-08 (18 jempol): "Item sudah banyak, pas di ubah langsung ilang semua dan force close". Play 1★ 2024-05-28 (16 jempol): "Bug mulu. Pake app biar gampang, malah jd sulit."
- Daftar dan login (19 persen): kata sandi ditolak walau memenuhi syarat (2019), verifikasi gagal. Play 1★ 2023-10-09: "Enggak bisa login padahal kata sandi dan emailnya benar". Apple 1★ 2024-04-29: "email sm password salah mulu".
- Dukungan (16 persen), termasuk saat closing: Play 1★ 2025-10-04: "firur hitung ulang sangat menghambat accounting utk closingan, laporan sulit di akses di akhi sampai awal bulan". Play 1★ 2025-09-02 (6 jempol): "suruh menunggu 7-9 hari". Play 1★ 2023-01-02 (14 jempol): "training yg di batasi hanya 3 kali dan selebihnya berbayar".
- Sinkron dengan Moka (3 laporan di 2020, 2023, 2024): Play 1★ 2023-09-12 (18 jempol): "sering terjadi masalah syncron dengan aplikasi moka yg awal di info nya bisa realtime". Pada laporan yang sama pengulas bilang trainer awal "menghapus item-item tanpa seijin kita".
- Penginputan awal dan migrasi: Apple 1★ 2019-12-02 (§2.6).
- Data hilang saat impor salah: Play 1★ 2021-01-19 (58 jempol), §2.6.
- Update memperlambat input: Play 1★ 2022-12-08 (33 jempol): "banyak fitur2 di tampilan lama yg ga bisa di tampilan baru, jadi bikin makin lama aj nginputnya".
- Aplikasi HP lebih sempit dari web: Play 2★ 2021-08-10 (47 jempol).
- Jurnal Touch (POS): Play 2★ 2021-12-26: "Search box sangat lambat dan harus diketik sama persis dengan nama produk". Play 1★ 2019-06-11 (12 jempol): "tidak bisa menyesuaikan operasional gerai es krim saya". Play 2★ 2021-10-28: "pilihan pembayaran hanya cash sj". Play 1★ 2024-11-14: tiba-tiba tidak bisa konek printer dan struk, "dianggap bug".
- Telepon sales setelah mencoba: Play 1★ 2021-04-20: "baru coba belom ada 7 hari Udah ditawarin berlangganan". Play 2★ 2018-10-23: ditelepon setelah memasang aplikasi.
- Per kursi: tidak ada.

**G2 dan Capterra (⚠ ringkasan pencarian, 403 saat dibuka).** Pro: mudah dipakai (kata paling sering), laporan jelas, buku besar dan neraca saldo mudah dicek, impor memudahkan transaksi besar. Kontra: lambat di jam sibuk dan saat impor, kustomisasi dokumen dan laporan terbatas, fitur dan integrasi tertentu di paket atas, multi-perusahaan bayar per perusahaan, live chat repot ditutup, aplikasi HP kurang fitur lanjut. Skor 4,9 dari sekitar 24 ulasan G2: sampel kecil.

**Pujian.** Lihat §2.3. Catatan: 84 dari 100 bintang 5 terbaru jatuh di dua kelompok yang tampak diatur (Maret 2025 dan Januari sampai Februari 2026, lihat §0), jadi tidak ada pujian Jurnal organik yang bisa saya kutip dengan percaya diri ⚠.

**Berhenti atau pindah.** Ke Kledo karena harga (2023-03-05); ke GentaTekno (Play 1★ 2019-12-19: "Baiknya saya tetep pake aplikasi dari GentaTekno yg masih sangat bagus"); bayar bulanan dan diblokir kalau telat (2018-10-09).

**Harga.** Etalase di R8d §2.2. Pengguna menyebut refund dipotong 50 persen (2020), training terbatas 3 kali (2023), dan akun diblokir bila telat bayar (2018).

**Keyakinan.** B untuk ulasan, ⚠ untuk G2. Aplikasi pendamping, jangan dipakai menilai produk web.

### 3.2 Accurate (Accurate Online; ulasan Accurate Lite dan Accurate POS)

Sumber: [Play Accurate Lite](https://play.google.com/store/apps/details?id=com.cpssoft.mobile.alpha), [Play Accurate POS](https://play.google.com/store/apps/details?id=com.cpssoft.mobile.titan), [App Store Accurate Lite](https://apps.apple.com/id/app/id6446817668), [RSS](https://itunes.apple.com/id/rss/customerreviews/page=1/id=6446817668/sortby=mostrecent/json). n=185 (2018 sampai 2026; 61 berumur di bawah 12 bulan). Accurate Online (web) sendiri tidak punya kumpulan ulasan yang bisa dibuka; pencarian G2 dan Capterra hanya mengembalikan produk lain bernama Accurate.

**Keluhan.**
- Lambat, loading, gangguan, maintenance (42 persen): Play 1★ 2023-08-01 (239 jempol): "internet lancar buat aplikasi lain, ke accurate lemot". Play 1★ 2022-11-21 (158 jempol): "wajib punya kesabaran tinggat dewa". Play 1★ 2026-08-22: "jaringan bagus tapi loading terus". Gangguan atau maintenance, sebagian di jam kerja (9 persen menyebut kata maintenance, jam kerja, atau gangguan): Play 1★ 2024-05-22 (15 jempol): "Dalam seminggu ini sudah 2kali gangguan disaat jam kerja, tidak ada pemberitahuan".
- Rusak setelah update (18 persen): Play 1★ 2025-11-14: "versi sebelumnya lebih praktis dan cepat". Play 2★ 2025-03-05: "semenjak update fitur multi satuan di jenis varian barang hilang". Play 1★ 2025-09-29: "setelah update, jadi error semua..".
- Dukungan (12 persen), terutama sesudah bayar: Play 1★ 2024-07-04 (17 jempol): "kami sudah bayar accurate POS tapi setelahnya ga ada kabar". Play 1★ 2025-07-26: "marketing nya resign kita yang sudah terlanjur ambil paket langganan 1 tahun tidak terurus". Play 1★ 2025-08-06: "selalu minta kembali duplikasi database kita untuk mengecek dan berbelit sampai berhari2". Play 1★ 2026-08-05: "Rumit untuk digunakan. panduan minim. CS supportnya fokus jualan bukan memberikan solusi. Trainingnya berbayar."
- Fitur Lite kurang dibanding Online (kontrol dan izin): Play 2★ 2023-04-03 (139 jempol): "syarat pembayaran bs diedit oleh salesman di accurate lite shg sia2 setting pd accurate online", dan "Tdk bisa input faktur, pembyrn, biaya, di acurate lite jika fitur persetujuan diaktifkan". Play 1★ 2025-10-20: "harga belinya tidak bisa di ubah saat melakukan transaksi penjualan".
- iOS lambat diperbarui (4 persen menyebut iOS atau iPad): Apple 1★ 2025-06-30: "ios anak tiri kah min lama banget update fitur nya". Apple 1★ 2026-05-22: stok tampil nol di iOS, ada di Android.
- Sinkron POS dengan Online: Play 1★ 2026-01-03 (7 jempol): "update di accurate online sering tidak terupdate di accurate pos, sampai hari ini belum ada solusinya". Play 1★ 2023-08-07 (17 jempol): sinkronisasi lama, update harga di backend tidak masuk ke POS.
- Printer: Play 1★ 2025-12-14; 2025-02-05 (8 jempol), §2.6.
- Add-on bisa menghanguskan lisensi utama: Play (POS) 1★ 2026-04-28.

**Pujian.** "software top, berkualitas dan stabil" (Play 5★ 2025-02-03). Pengguna puas menganggap training berbayar wajar. Bintang 5 lain umumnya berisi pujian singkat atas pencatatan, lalu permintaan iOS dan stok opname dari HP. Skor Play tinggi (4,71 dan 4,88), App Store Lite rendah (2,51 dari 39).

**Berhenti atau pindah.** Ke Odoo karena lemot setelah upgrade (Lite 2026-06-30). Play 1★ 2026-08-25: "berhubung tpt kerja pake mau gak mau, kl pribadi dah ditinggalin" (tetap dipakai karena kantor mewajibkan). Database terikat di server POS (2025-08-06).

**Harga.** Pengumuman resmi: Rp300.000 sebelum PPN per bulan mulai 1 Januari 2026 (§2.5). Add-on Multi Branch memuat hak akses per cabang. Reseller: training berbayar disebut oleh pengguna.

**Keyakinan.** B (ulasan); A (halaman harga). Reseller Accurate (doniirvan.id, acisindonesia.com) adalah C.

### 3.3 Kledo

Sumber: [Play Kledo](https://play.google.com/store/apps/details?id=com.kledo.app), [Play Kledo POS](https://play.google.com/store/apps/details?id=com.kledopos.app), [App Store Kledo](https://apps.apple.com/id/app/id1586502518), [RSS](https://itunes.apple.com/id/rss/customerreviews/page=1/id=1586502518/sortby=mostrecent/json). n=56 (2021 sampai 2026; hanya 6 berumur di bawah 12 bulan). Kecil, baca sebagai anekdot. Capterra (⚠ ringkasan) menampilkan rating 4,4 dengan "customer service" sebagai nilai terendah (4,0), tetapi G2 dan Software Advice tidak punya ulasan tertulis.

**Keluhan.**
- Daftar dan login (23 persen): Apple 2★ 2026-02-11: tidak ada pilihan daftar, "yg ada langsung masuk akun". Play 1★ 2022-06-08 (13 jempol): "email sudah terdaftar pas mau login malah infonya email tidak terdaftar".
- Salah paham gratis (7 persen): §2.4.
- Data contoh yang sudah terisi di akun baru: Play 1★ 2021-11-14 (7 jempol): "Capek hapusinnya ... ngga ada icon hapus masal juga". Play 2★ 2025-05-26: "baru daftar kok udh ada data".
- Gangguan teknis setelah beberapa bulan: Play 1★ 2023-08-02 (67 jempol): "data stok ga muncul, data antar menu ga konsisten". Play 2★ 2025-08-22: "setelah di update jadi error tidak bisa input pembelian".
- Kledo POS: Play 1★ 2024-10-21 (23 jempol): "Sudah 21 hari problem tak slesei", penjualan POS "tdk terintegrasi dgn backend sehingga laporan penjualan dari pos 0". Play 2★ 2025-08-02: printer thermal.
- Kebijakan: Apple 1★ 2025-04-13: vendor mengubah layout dokumen tanpa pemberitahuan. Apple 1★ 2025-10-25: refund tidak penuh. Play 1★ 2022-04-11 (30 jempol): minimal langganan 3 bulan.
- Tidak ada keluhan pajak, impor, atau kursi.

**Pujian.** Pemula tanpa dasar akuntansi, satu ekosistem dengan Gajihub dan POS, admin ramah (§2.3). Gajihub (aplikasi payroll Kledo, [App Store](https://apps.apple.com/id/app/id1604540147)): 68 dari 80 ulasan bintang 5; ulasan rendah soal absen gagal dan lag.

**Berhenti atau pindah.** Sebagian karena paket gratis tidak sesuai harapan; satu pengulas 8 bulan memikirkan ganti (2023-08-02).

**Harga.** Etalase R8d §2.2. Dari halaman resmi: approval bertingkat dan hak akses "Advance" tidak ada di Pro.

**Keyakinan.** B, n kecil. ⚠ untuk Capterra.

### 3.4 Zahir

Sumber: [Play Zahir Apps](https://play.google.com/store/apps/details?id=com.zahironline), [Play Zahir Simply](https://play.google.com/store/apps/details?id=com.zahirsimplestart), [Play ZahirPOSX](https://play.google.com/store/apps/details?id=com.posx), [App Store Zahir Apps](https://apps.apple.com/id/app/id1504813555), [App Store POSX](https://apps.apple.com/id/app/id1367134082). n=54, hampir semuanya 2018 sampai 2023 (hanya 1 berumur di bawah 12 bulan), sehingga menggambarkan Zahir lama.

**Keluhan.**
- Error, macet, loading (33 persen) dan daftar/login (22 persen): Play 1★ 2019-07-16: "gimana mau nyoba klo mau sign up aj susahnya minta ampun".
- Data hilang atau lari: Play 1★ 2019-02-18 (8 jempol): "semua data yang sudah dibuat tiba-tiba hilang". Play 1★ 2021-11-11: "Data transaksi lari kemana mana". Play 2★ 2019-10-18 (13 jempol): data hilang, pihak Zahir ada "tapi ngasihnya lamaaa".
- Tidak sinkron Android dan web: Play 1★ 2019-05-22: "tidak sinkron antara data di android dan web pc", "tidak bisa beralih perusahaan di android".
- Perangkat dan POSX: Apple 2★ 2022-04-23: beli perangkat lewat Zahir 7 juta lebih, lalu pihak Sunmi bilang "device saya GA SUPPORT sama app zahir posx". Cetak: §2.6.
- Menu: Play 2★ 2018-06-11: "Menunya terlalu rumit ... Terlalu banyak syarat saat mau input. Sangat bagus jika ada sebuah apk yg bisa di custome semua menunya, sehingga benar-benar mirip exel". Ini satu-satunya ulasan yang menyebut Excel sebagai tolok ukur.
- Pajak: Play 2★ 2020-04-04: "tax tidak muncul di rincian".
- Harga/langganan: Play 1★ 2023-12-04: "mahal tapi ga efisien". Beberapa menyebut sudah bayar setahun lalu error (2021-04-22).

**Pujian.** Sederhana untuk UMKM kecil (menghitung laba rugi, utang piutang, sisa stok), cloud, terhubung Bluetooth printer (Play 5★ 2018). Pengguna 15 tahun "rencana balik lagi ke Zahir" menanyakan apakah user bisa dikunci "hanya terbatas pada transaksi dan lihat stoc" (Play 5★ 2021-02-09, 8 jempol): permintaan izin granular yang jelas.

**Berhenti atau pindah.** Satu pengulas menghentikan berlangganan karena layanan (2022-10-08). Satu pengguna 15 tahun merencanakan kembali ke Zahir (2021).

**Harga.** Etalase R8d §2.2. Syarat berlangganan 1 tahun (halaman resmi).

**Keyakinan.** B, n kecil dan lama. Blog pembanding menyebut Zahir paling mahal atau paling murah secara bertentangan (R4 §2.4).

### 3.5 BukuWarung

Sumber: [Play](https://play.google.com/store/apps/details?id=com.bukuwarung). Tidak ada aplikasi iOS di pencarian App Store Indonesia. n=500 (2023 sampai 2026; 398 berumur di bawah 12 bulan).

**Keluhan.**
- **Tombol angka 0 dan tombol bawah tertutup navigasi sejak update awal 2026**: 39 persen ulasan bintang 1 dan 2 tahun 2026. Play 1★ 2026-02-02 (72 jempol): "susah menulis nominal uang karena terlalu bawah, jadi tertutup panah ke bawah. Tidak bisa ngetik angka nol." Play 2★ 2026-05-18 (20 jempol): "sudah ada komplain sejak Januari ... sampai detik ini bulan Mei 2026 masih tidak diperbaiki". Play 2★ 2026-04-09: "Harus ganti hp baru, baru bisa normal kembali". Ada pengguna yang menemukan jalan di pengaturan HP (5★ 2026-09-30) setelah sebulan tidak memakai.
- Bug itu juga menutup kolom chat CS: Play 2★ 2026-02-06 (42 jempol): "chat ke cs jg tdk bisa ketik. soalnya tombolnya tertutup tombol navigasi hp".
- CS bot: Play 1★ 2026-08-06 (32 jempol): CS awalnya AI, manusia lama membalas. Play 1★ 2026-08-31: "banyak yg memberi ulasan buruk bukannya melakukan perbaikan malah kinerja bot yang balas ulasan".
- Data hilang atau berubah (9 persen): Play 1★ 2026-01-22 (35 jempol): setelah instal ulang dan pemulihan "data stok barang ilang semua, menjadi kosong, padahal sudah ratusan datanya". Play 2★ 2024-09-21 (39 jempol): "Ada data transaksi yang tiba-tiba berubah.... lagi dan lagi". Play 2★ 2024-11-05 (18 jempol): "Rp48juta di tambah 10000 jadi 68juta".
- Terikat nomor telepon: Play 2★ 2024-08-04 (35 jempol): "cara ubah nomor terdaftar. Soal nya kartu nmr yg terdaftar sudah tidak aktif". OTP terlambat (2026-01-21). Verifikasi akun sulit (2★ 2025-10-13).
- Fitur dihilangkan: kategori manual (1★ 2026-06-30, 196 jempol).
- Cetak struk dan laporan: §2.6.
- Uang dan data pribadi: mesin EDC yang dibeli tidak bisa dipakai (1★ 2026-03-05); EDC Rp2 juta dengan transaksi lemot dan tanpa CS manusia (1★ 2026-08-31); tawaran pinjaman yang tidak cair (1★ 2026-09-28); penghapusan data KTP dipersulit (1★ 2026-06-30).

**Pujian.** Catat utang piutang, stok, pembukuan sederhana; pengguna 3 sampai 4 tahun (banyak ulasan bintang rendah memuji dulu). Pujian bintang 5 yang menyebut "tagih hutang via WhatsApp" terlihat generik ⚠ (2026-06 sampai 07).

**Berhenti atau pindah.** Ancaman pindah di 5 ulasan, satu nyata ("lama2 sya pindah ke aplikasi lain", 2★ 2024-02-09).

**Harga.** Aplikasi gratis; uang dari PPOB, EDC, pinjaman (R8d §2.2.1). Rating Play sangat terbelah: sekitar satu dari tiga pemberi rating memilih bintang 1 (35 persen) dan 44 persen bintang 5.

**Keyakinan.** B, n besar, kondisi terbaru. Dua hal yang tidak dijangkau: apakah masalah tombol sudah diperbaiki setelah 11 Oktober 2026, dan iOS.

### 3.6 BukuKas

Tidak ada lagi di Play Store. CNBC Indonesia, 15 Mei 2023 ([tautan](https://www.cnbcindonesia.com/tech/20230515080100-37-437245/bukukas-tutup-walau-dulu-punya-rp-114-triliun-nasib-lummo), A): pengguna menerima kabar lewat WhatsApp resmi bahwa "Aplikasi BukuKas tidak lagi dapat digunakan setelah tanggal 26 Mei 2023", disarankan mengunduh data ke Excel sebelumnya. Perusahaan tidak memberi penjelasan resmi; seorang mantan pegawai menyebut model baru "tidak memiliki potensial seperti yang diperkirakan sebelumnya". Lummo, induknya, dilaporkan masuk likuidasi sukarela September 2023 (DealStreetAsia lewat hasil pencarian, ⚠ tidak dibuka). Tidak ada ulasan pengguna yang bisa dibaca. Relevan untuk hipotesis 11 (risiko vendor hilang).

### 3.7 Majoo

Sumber: [Play majoo](https://play.google.com/store/apps/details?id=com.klopos), [Play majoolite](https://play.google.com/store/apps/details?id=id.majoo.lite), [Play Owner](https://play.google.com/store/apps/details?id=id.majoo.owner), [Play Teams](https://play.google.com/store/apps/details?id=id.majoo.teams), [App Store Kasir](https://apps.apple.com/id/app/id1642259472), [App Store majoolite](https://apps.apple.com/id/app/id1669605872). n=530 (2019 sampai 2026; 61 berumur di bawah 12 bulan).

**Keluhan.**
- Error, lambat, sinkron (32 persen): Play 2★ 2024-01-22 (86 jempol): "majoo belum layak di rilis sebagai aplikasi kasir berbayar, sistemnya belum konsisten masih banyak ujicoba". Play 1★ 2024-03-28 (28 jempol): "Orderan sering hilang sendiri", "sering tidak sinkron, antara device server dan client", "Laporan pendapatan tidak sesuai jumlahnya". Order dobel (2 persen).
- Stok berubah sendiri (6 persen menyebut stok): Play 1★ 2023-08-16 (44 jempol): "tiba2 semua stok jadi 0". Play 1★ 2024-12-06: "pas closing saldo sama stok berubah2 terus", pulang makin malam.
- Dukungan, sales, training (23 dan 15 persen): Play 1★ 2023-03-21 (51 jempol): "Ga ada follow up setelah kita bayar, sebelum bayar tiap hari neror nanyain baik2in kita". Play 1★ 2023-08-09 (31 jempol): beli paket merchant setahun dengan cicilan Kredivo, belum ada training dan aktivasi. Play 1★ 2024-12-06: "Training dijadwalkan aja udh 1 bulan nggak ada kabar". Play 1★ 2023-03-19 (55 jempol): sudah bayar tetapi belum diaktifkan, "Pas masa trial habis sistem mati".
- Update (10 persen): Play 1★ 2024-01-16 (28 jempol), Play 1★ 2024-01-24 (66 jempol): "Setelah di update app nya sekarang malah sering error".
- Harga, fee, kontrak (9 dan 7 persen): MDR 2 persen yang tidak disebut sales (2023-09-11), QRIS MDR 1 persen dan cair lambat (2024-12-06), "beli promo langganan 2 tahun, baru berjalan 1 tahun sudah diminta bayar lagi" (2025-03-25), akses karyawan terbatas (Lite 2026-04-02), diskon per item butuh upgrade (2026-03-03). Apple 1★ 2024-10-09: dijanjikan gratis 1 tahun, kemudian ditagih; saat perpanjang dipaksa "daftar outlet baru" sehingga harus mengulang onboarding data; teknisi mengetik sendiri ulasan bintang 5 di tablet pengulas (⚠ satu orang).
- Kontrol: Lite 1★ 2025-07-18: "udh langganan masak hak akses tidak ada, karyawan bisa melakukan semua di data produk". Halaman harga resmi menagih Lisensi Hak Akses Rp49.000 per outlet.
- Offline: Apple 2★ 2026-02-02 (§2.6).
- Pajak: Apple 1★ 2025-11-21: pengaturan pajak tidak bisa diubah.
- Majoo Teams (absen): Play 1★ 2023-12-06: "Mau absen masuk juga gabisa gabisa melulu".
- Spam telepon dan data: Apple 1★ 2025-02-23: banyak nomor baru menelepon setelah memasang aplikasi.

**Pujian.** Kasir, stok, pembukuan satu aplikasi; trainer yang jelas dan cepat; laporan komisi untuk jasa; mudah. Bintang 5 Majoo Lite 88 dari 100 jatuh di Februari 2025 (banyak hanya "Sangat membantu") ⚠; bintang 5 majoo utama September sampai Oktober 2026 sering menyebut nama trainer dengan pola seragam ⚠.

**Berhenti atau pindah.** "Lebih enak pakai jurnal" (1★ 2023-10-09, 73 jempol); "Lebih bagus aplikasi sebelah" (2023-03-21); "kertas dan pulpen" (2023-08-16); tidak melanjutkan (2024-03-20).

**Harga.** Etalase R8d §2.2.1; PPN belum termasuk; tidak ada paket gratis di halaman resmi.

**Keyakinan.** B (n besar). Perhatikan bias 3 §0.

### 3.8 Moka

Sumber: [Play](https://play.google.com/store/apps/details?id=com.mokapos.android). Tidak ada aplikasi iOS di pencarian App Store Indonesia. n=425 (300 bintang 1 terbaru sejak 2020-11, 125 bintang 2 terbaru; keseluruhan 2016 sampai 2026; hanya 33 berumur di bawah 12 bulan). Capterra (⚠ ringkasan): fitur 3,0 dari 5, nilai uang 4,0; keluhan satu ulasan: tidak ada sub-resep.

**Keluhan.**
- Error dan lambat (19 persen), terutama di jam ramai: Play 1★ 2024-03-18: "saat resto rame dan full kalo masi pake samsung a7 a8 auto lemot, karena ramnya kecil". Play 1★ 2024-03-13: "Kompatibel dengan pilihan tablet android yang sangat terbatas".
- Sinkron kasir dengan web atau layanan antar (5 persen): Play 1★ 2022-12-07 (49 jempol): "orderan gostore lambat masuk di system kasir,pelanggan sudah order dan bayar,namun baru masuk di notif 3 jam an". Play 1★ 2022-08-03: "transaksi jadi data offline mengakibatkan stock tidak berkurang". Sinkron ke Jurnal (2024-09-28).
- Angka tidak cocok (stok, COGS, laba): Play 1★ 2021-03-27 (30 jempol): stok bertambah karena "VOID". Play 1★ 2023-09-19 (30 jempol): "COGS bisa berubah sendiri".
- Dukungan dan kunjungan teknisi (14 persen; 5 persen menyebut kunjungan atau teknisi yang tidak datang): Play 1★ 2022-03-16 (23 jempol): "sdh 1 bulan ga ada telp sama sekali dr tim terkait". Play 1★ 2024-08-07 (40 jempol, pengguna 3 tahun): komplain hanya bisa ditangani "dibawah 10% dari presentase total masalah". Play 1★ 2023-10-25: "Berlangganan 1 tahun 1 x pun dari 365 hari tidak pernah di maintenance".
- Retail, retur, split bill, komisi: Play 1★ 2022-07-05 (56 jempol), §2.1 baris 8. Play 1★ 2023-06-10: beli untuk 4 outlet, tidak bisa dipakai karena usaha memakai komisi dan fitur yang dijanjikan tidak ada.
- Printer (7 persen) dan perangkat: §2.6.
- Pendaftaran dan privasi: KTP/NPWP wajib (6 persen menyebut KTP, NPWP, spam, telepon): Play 1★ 2025-08-17: "harus masukkan nomor KTP yang itu adalah privasi". Play 1★ 2021-12-27, 2021-11-01: ditelepon dari banyak nomor.
- Harga: 2025-04-01: "kemahalan untuk berlangganan masa 300k ?". Add-on halaman resmi Rp10.000 per slot karyawan.
- Offline (4 persen): print dan data offline, §2.6.
- Kasir yang disalahkan: Play 1★ 2024-09-29.

**Pujian.** Bintang 5 hanya 5 dengan teks ≥ 70 karakter: sederhana, lengkap, mudah dimengerti, trainer bagus. Capterra (⚠): mudah dipakai staf tanpa pelatihan rumit.

**Berhenti atau pindah.** "mending pake aplikasi lain" (2022-01-12), "Masih kalah bagus dibanding aplikasi Qasir" (2020-01-20), uninstal.

**Harga.** Etalase R8d §2.2.1; PPN tidak disebut di halaman.

**Keyakinan.** B (n besar tetapi umur campuran).

### 3.9 Olsera

Sumber: [Play POS](https://play.google.com/store/apps/details?id=com.olserapratama.pos), [Play Office](https://play.google.com/store/apps/details?id=com.olserapratama.office), [App Store POS](https://apps.apple.com/id/app/id1172633730), [App Store Office](https://apps.apple.com/id/app/id1478712450). n=178 (2019 sampai 2026; 24 berumur di bawah 12 bulan). Halaman harga resmi tidak terbaca (dirender JavaScript).

**Keluhan.**
- Gelombang rusak setelah update Olsera Office: 22 dari 53 ulasan bintang 1 dan 2 Play Office jatuh antara 15 Oktober 2024 dan 1 April 2025, 15 di antaranya menyebut lemot, berat, update, atau minta versi lama. Play 2★ 2024-10-31: "Tolong kembalikan yg versi sebelumnya min". Play 1★ 2024-11-05 (16 jempol): "melihat harga modal tidak bisa". Play 1★ 2025-03-11: "SERBA LOADING MAU NAMBAH STOK LOADING MAU KURANGI STOK".
- Stok tidak cocok (kadang): Play POS 1★ 2024-08-16 (14 jempol), Play Office 1★ 2022-10-05 (21 jempol): "menu stock yg sering ngaco". FIFO error: Play Office 1★ 2024-02-08: "Mau berlangganan olsera karena bisa pake stok fifo, tapi setelah berlangganan stok fifo nya error terus".
- Dukungan (24 persen): Play Office 1★ 2024-11-23, Play POS 1★ 2025-10-30: "hanya di alikahkan ke tim ini tim ini". Play POS 1★ 2021-12-02: 24/7 hanya jam kantor.
- Input produk: Play POS 1★ 2022-05-21 (41 jempol): "Saat tambah produk, yg diketik lain yang muncul lain". Varian: Play Office 2★ 2023-07-18: "Edit isi varian mesti delete varian utama". Integrasi GoFood/GrabFood: Play Office 1★ 2023-03-22: harga di Grabfood tiba-tiba nol, harus dihapus satu-satu. Play POS 1★ 2021-01-14: tidak bisa sync dengan akun Go-Pay yang sudah ada.
- Kontrol kasir: Apple POS 1★ 2024-12-28: laci kas terbuka lewat "Akhiri shift" lalu X tanpa PIN supervisor ("FRAUD KASIR"). Play POS 1★ 2022-12-17: kebalikannya, mengurangi qty harus input password supervisor, "sangat menyulitkan untuk kita sebagai karyawan".
- Impor: Play Office 2★ 2024-08-05: update harga lewat impor berhenti bekerja untuk stok 0 tanpa pemberitahuan.
- Printer (5 persen): Play POS 1★ 2025-03-04, §2.6.
- Harga di iklan vs checkout (2020).

**Pujian.** Stok dan varian, harga terjangkau. Mode offline disebut sebagai keunggulan di artikel pembanding (⚠ ringkasan pencarian, artikel tidak saya buka, tidak diverifikasi). Olsera punya 40 ulasan bintang 5 di September 2025 dengan gaya kalimat seragam ⚠.

**Berhenti atau pindah.** "mending ke moka aja" (2021); "Biar kami cari sistem pos yg lain" (3 tahun, 2024).

**Harga.** Tidak terbaca dari halaman resmi (R8d memakai situs pesaing, C ⚠).

**Keyakinan.** B.

### 3.10 iSeller

Sumber: [Play Admin](https://play.google.com/store/apps/details?id=iSeller.Android.v2), [Play Retail](https://play.google.com/store/apps/details?id=iSellerRetail.Android.v2), [App Store Admin](https://apps.apple.com/id/app/id1279627776). n=28 (anekdot). Halaman harga resmi: 503. G2 punya satu halaman iSeller, tidak jelas apakah produk yang sama (tidak dipakai).

**Keluhan.** Harga (18 persen): Retail 1★ 2020-11-14, 2021-06-13: "mahal banget bro untuk fasilitas seperti ini". Kontrak (14 persen): Apple 1★ 2025-10-11: harus hapus dan instal ulang tiap hari, "kontrak masih ada sisa 2 tahun lagi". Janji marketplace tidak terpenuhi (Apple 2024-03-01). Kontrol dan SOP: Retail 1★ 2023-08-10: "perjanjian awal bisa hapus data penjualan, tiba tiba sop berubah dan tidak bisa hapus data, merugikan owner". Aplikasi produk terpisah: Retail 1★ 2025-02-18: "jangan pisah aplikasi hanya untuk mengurus produk". Payout lama: Retail 2023-03-05 dan 2023-04-19. Laporan dan grafik: Admin 2024-03-27: "grafik nggak bisa di liat di android".

**Pujian.** Trainer dan after-sales (5 dari 7 bintang 5), integrasi marketplace.

**Keyakinan.** B, n terlalu kecil untuk persen.

### 3.11 Mekari Talenta

Sumber: [Play Talenta](https://play.google.com/store/apps/details?id=co.talenta), [Play Attendance](https://play.google.com/store/apps/details?id=co.talenta.attendance), [App Store Talenta](https://apps.apple.com/id/app/id1459958693), [RSS](https://itunes.apple.com/id/rss/customerreviews/page=1/id=1459958693/sortby=mostrecent/json). n=769 (508 berumur di bawah 12 bulan). Pengulas hampir semuanya pegawai yang wajib memakai aplikasi absen, bukan pembeli (salah satunya menulis "kalo ga disuruh perusahaan kaga mau gua pake", 1★ 2026-05-29).

**Keluhan.**
- Clock in atau clock out gagal, loading, verifikasi lambat (26 persen): Play 1★ 2026-05-19 (48 jempol): "tiap mau clock in/clock out selalu muncul presensi anda sedang diverifikasi sistem", verifikasi selesai 13 menit kemudian. Jam pulang sore juga rawan (2★ 2026-04-22: "terutama jam 5 sore").
- Lokasi atau radius (15 persen): Play 1★ 2026-03-31: sudah di titik, "dibilang jarak anda terlalu jauh...150 meter". Play 2★ 2026-01-22: lokasi absen terbaca di "Samudera Atlantik".
- Akibat ke gaji (9 persen): Play 1★ 2026-08-10 (19 jempol): "banyak orang lapangan kepotong gaji nya, padahal absen masuk tidak terlambat". Play 2★ 2025-03-19 (16 jempol): "ketika sinyal dilapangan bermasalah apakah developer tahu dan peduli? apakah developer akan memberikan kompemsasi ketika gaji ... dipotong??"
- Login, OTP, logout paksa (7 persen): Play att 1★ 2020-12-17 (31 jempol): "Tiap satu hari ga berangkat harus login lagi". Play 2★ 2025-08-15 (10 jempol): "masih minta masukan kode OTP untuk bisa lihat slip gaji".
- Wajah tidak cocok (3 persen): Play 2★ 2025-04-15 (13 jempol): "muncul wajah tidak match, padahal saya sendiri yang ambil foto".
- Izin akses berubah setelah update: Play 1★ 2026-04-17 (19 jempol): "tidak bisa menginput cuti diri sendiri, harus di isikan orang lain atau atasan".
- Offline: tidak bisa absen di kebun, hutan, laut (§2.6). Dukungan: Play 1★ 2026-06-07, layar hitam dan "ternyata libur", padahal "dipakai untuk approval absensi karyawan".
- Setelah update: Play 1★ 2026-03-07 (pemindaian WiFi/Bluetooth), Apple 1★ 2026-03-10 (iOS 26.3.1).

**Pujian.** Lebih mudah absen, memantau, mengajukan; bukti kehadiran bisa dilihat (§2.3). Rating Play 4,49 dari 48.112; App Store 3,90 dari 5.676. G2/Capterra (⚠ ringkasan): otomatisasi payroll dan absensi, BPJS dan pajak "dependable", dukungan cepat; kontra: lambat di jam payroll, add-on berbayar, tidak ada lingkungan uji (UAT), geotag lambat memperbarui, satu pengulas sulit menyambung ke Coretax.

**Berhenti atau pindah.** Tidak relevan: pegawai tidak memilih. "Lebih Bagus Aplikasi Lain" (2★ 2026-01-22).

**Harga.** Tidak dipajang (halaman resmi); trial 14 hari; modul dan Public API add-on; eBupot DJP hanya di Plus (A).

**Keyakinan.** B untuk ulasan, ⚠ untuk G2/Capterra.

### 3.12 Gadjian

Sumber: [Play GadjianKu](https://play.google.com/store/apps/details?id=com.gadjian.gadjianku), [Play Gadjian Admin](https://play.google.com/store/apps/details?id=gadjian.user.app), [App Store GadjianKu](https://apps.apple.com/id/app/id1477130270). n=55 (anekdot; 8 berumur di bawah 12 bulan). Aplikasi pegawai (GadjianKu), bukan payroll admin. Halaman harga resmi di /harga 404 (R8d membacanya di /pricing). Gajihub adalah produk Kledo, bukan Gadjian, dan tidak dihitung di sini (lihat §3.3).

**Keluhan.** Aktivasi dan login (42 persen): Play 1★ 2020-11-13 (40 jempol): "sdh aktivasi segala, ini knp yaa Aplikasinya, susah bener". Play 1★ 2022-01-07 (19 jempol): tautan aktivasi "sudah tidak berlaku" tetapi saat login "akun anda belum di aktifkan". Layar hitam di perangkat baru (Poco X6 Pro 2024, Samsung S24 FE 2025). Setelah update: tidak bisa cek slip gaji (2025-03-03), cuti menjadi minus 1 (2025-10-20), batas radius absen (2026-10-08: "ga bisa absen diluar radius").

**Pujian.** Slip gaji langsung, pengajuan izin, sakit, cuti, pengumuman, absen (§2.3). Gadjian Admin (HP, 40 rating): "Akhirnya ada aplikasi admin nya jg ... sebelumnya buka lewat browser" (5★ 2022-05-19).

**Pembanding vendor (C ⚠).** Blog Gadjian membandingkan diri dengan kompetitor; tidak ada ulasan independen yang ketemu. KantorKu (pesaing) menyebut Gadjian kuat di payroll tetapi sempit.

**Keyakinan.** B, n kecil.

### 3.13 Odoo dan HashMicro (versi Indonesia)

**Odoo (aplikasi global, Play 3,48 dari 4.906; App Store 2,33 dari 33).** Sumber: [Play](https://play.google.com/store/apps/details?id=com.odoo.mobile), [App Store](https://apps.apple.com/id/app/id1272543640). n=33 ulasan bintang 1 dan 2 (Play 18, App Store 15). Banyak pengulasnya pegawai yang memakai Odoo milik perusahaan. Keluhan: layar putih setelah login (2021, 2022, 2023, 2024), login Google atau OTP berulang, loading sangat lama (Play 1★ 2025-06-04: "di klik 1 detik , loading nya 25 menit"), crash di perangkat genggam (2025-08-28). Satu cerita pembeli: Play 1★ 2026-09-18: membayar Rp2,8 juta setelah event "resmi dr odoo" dan omongan sales; saat butuh konsultasi hanya diberi tautan dukungan AI, "UJUNG2NYA KITA HARUS HIRE ORANG YG NGERTI" (satu orang, belum bisa dicek ⚠). Play 5★ 2025-02-22 (25 jempol): "untuk bisnis kecil, fitur² ERP systemnya kerasa agak overkill". Play 5★ 2020-12-08 (95 jempol): bintang 5 tetapi isinya "nda jadi pake Odoo karena terlalu kompleks dan kurang user friendly". Harga resmi per pengguna dalam dolar AS dengan Studio, multi-perusahaan, dan API hanya di paket Custom (R8d §2.2.2 ⚠ label tahunan atau bulanan). Keyakinan B, n kecil; bukan produk Indonesia.

**HashMicro.** Tidak ada kumpulan ulasan Indonesia yang bisa dibuka. Aplikasi HP yang ketemu di Play tampaknya aplikasi per klien (nama paket seperti `com.hashmicro.eva.akusara`, tidak saya buka satu per satu), jadi tampaknya tidak ada kumpulan ulasan publik umum. G2 (⚠ ringkasan): sekitar 4,4 dari 13 ulasan global; keluhan kurva belajar, kecepatan dukungan tidak konsisten, bug kecil saat absen; satu pengulas menilai biaya investasinya tidak sepadan dan tidak skalabel (parafrase). Tidak ada ulasan berbahasa Indonesia atau dari pengguna Indonesia. R4 §2.12 sudah mengutip thecfoclub (C). Blog HashMicro tentang pesaing adalah C, berkepentingan. Tidak terdokumentasi.

### 3.14 Excel dan Google Sheets

Tidak ada kumpulan ulasan yang khusus usaha kecil Indonesia, jadi saya ambil dari tiga jalur: ulasan Play untuk aplikasi Excel dan Sheets (600 ulasan bintang 1 dan 2 per aplikasi, urutan terbaru; Excel 2023-10 sampai 2026-10, Sheets 2021-09 sampai 2026-10; sekitar 170 dan 190 di antaranya berbahasa Indonesia menurut penyaring kata sederhana; C untuk relevansi bisnis karena pengulas campur pelajar dan individu), literatur akademik kecil, dan blog.

- **Alasan dipakai** (R4 §3.1 menyimpulkan serupa): murah dan sudah ada; fleksibel dengan rumus; pengguna tidak perlu ahli akuntansi (jurnal pengabdian Polsri dan Tadulako lewat ringkasan pencarian, ⚠). Studi pengabdian Nganjuk (TEKIBA 6(2), 2026, B): UMKM tanpa sistem stok memakai Google Sheets, rekap bulanan turun menjadi di bawah 30 menit, kepuasan 4,2 dari 5; abstrak tidak membahas aplikasi akuntansi.
- **Kekurangan Sheets untuk UMKM** (UKM Indonesia 2025-11-29, C): tidak dirancang untuk stok, invoice otomatis, piutang; "Semakin banyak transaksi, semakin besar kemungkinan terjadi salah input"; "Ketika tim ikut mencatat, risiko salah edit atau file rusak juga meningkat" (kedua kutipan lewat ringkasan WebFetch ⚠). Studi Nganjuk menyebut pencatatan terabaikan saat pesanan naik.
- **Ulasan aplikasi HP (Play, bahasa Indonesia, bintang 2)**: login akun Microsoft/Google gagal, kehilangan data setelah HP direset atau diganti, file tidak bisa dibuka, sinkron laptop dan HP tertinggal ("Spreadsheet android gak mau update, yang di Windows udah di ganti data tapi di android belum keganti datanya", Sheets 2★ 2022-01-15, 235 jempol), "pemilik file tpi gabisa ngedit cm bisa lihat" (Sheets 2★ 2025-05-13). Permintaan lokal yang konkret: rumus "terbilang" (Sheets 2★ 2022-05-21, 391 jempol: "Mohon untuk ditambahkan rumus "terbilang" supaya dapat memudahkan dan tidak perlu lagi ngetik banyak"). Ini sinyal bahwa pengguna Indonesia butuh fungsi lokal (angka dibaca dalam kata untuk kuitansi) yang tidak ada di alat global.
- **Alasan meninggalkan Excel yang ditulis pengguna**: tidak ditemukan. Hanya artikel vendor yang mengajak pindah (Kledo, Accurate, ACIS, BoA), kisah "kembali ke Excel" tidak ketemu.
- Panko (R4 §3.3): tingkat galat spreadsheet tinggi; tidak diulang di sini.

Keyakinan: C untuk relevansi, B untuk ulasan Play sebagai teks, ⚠ untuk jurnal lewat ringkasan.

## 4. Pertanyaan R7 yang sudah terjawab oleh sumber publik

Dasar: R7 versi 12 Oktober 2026. "Tinggalkan sebagai pertanyaan terbuka" artinya cukup dijadikan pemicu konfirmasi, bukan pertanyaan untuk menemukan.

**4.1 Pertanyaan per bagian R7**

| Bagian R7 | Pertanyaan | Status | Yang sudah diketahui dari sumber publik | Saran |
|---|---|---|---|---|
| A.3 | "Pernah coba aplikasi lain? Kenapa berhenti atau kenapa tidak jadi?" | Terjawab sebagian | Alasan umum: rusak setelah update, dukungan, harga, janji sales, terkunci (§2.4) | Ganti dengan: "Ceritakan minggu ketika Anda terakhir memutuskan berhenti atau tidak jadi. Apa yang terjadi persis?" Tanya pemicu, biaya, pengganti, bukan alasan umum |
| A.3 | "Kalau yang punya Excel itu tidak masuk, apa yang terjadi?" | Tidak terjawab | Tidak ada sumber publik | Tetap tanya |
| A.4 | "Bagian mana yang paling melelahkan atau paling sering salah?" | Tidak terjawab (tetap perlu kejadian nyata) | Pola publik: closing akhir bulan, stok selisih, data tidak sinkron | Pakai pola publik sebagai penelusur: "Pernah stok atau saldo berubah sendiri? Kapan?" |
| A.5 | "Sinyal di lokasi bagaimana?" | Belum | R8d dan R8a: tidak ada data sinyal di titik kerja. Ulasan: "jaringan bagus tapi loading terus" lebih sering daripada "butuh offline" | Tetap tanya dan minta peragaan: buka aplikasi di lokasi, lihat sinyal. Bedakan sinyal buruk dengan aplikasi lambat |
| A.5 | "Ada hal yang tidak mau diperlihatkan ke staf?" | Terjawab sebagian | Kontrol uang dan produk jarang diulas tetapi serius (§2.1 baris 12) | Tanya kejadian: "Pernah ada selisih kas atau harga yang berubah tanpa Anda tahu?" |
| A.5 | "Ada persetujuan (diskon, belanja, kasbon)? Lewat apa?" | Belum | Approval ada sebagai paket atas (Kledo Champion) dan menutup input HP di Accurate Lite | Tetap tanya |
| A.7 | "Berapa yang sekarang kamu keluarkan per bulan untuk alat-alat itu?" | Terjawab sebagian | Harga etalase publik (R8d). Yang tidak publik: harga bayar setelah diskon, add-on, PPN, MDR, perangkat | Tanya yang dibayar, termasuk perangkat dan biaya transaksi |
| A.7 | "Kalau harganya per orang, bagaimana?" | Belum | Nol keluhan kursi | Tetap tanya, tapi tanyakan unit: kursi, outlet, cabang, gudang, faktur |
| A.7 | "Siapa yang memutuskan membeli? Apa yang harus terbukti dulu?" | Terjawab sebagian | Ulasan menunjuk sales/marketing, teman, rekomendasi vendor untuk perangkat; "uji coba" salah dikira gratis | Tetap tanya |
| B.4 | "Mana yang Anda suruh klien pindah? Mana yang Anda hindari?" | Belum | Tidak ada suara akuntan di sumber publik. Hanya blog reseller (C) | Tanya |
| B.6 | "Coretax: apa yang bermasalah bagi klien Anda sekarang?" | Belum untuk aplikasi | Isu Coretax umum sudah di R4 §2.15. Tidak ada keluhan per aplikasi | Tanya terbuka. Jangan menyebut aplikasi tertentu |
| B.10 | "Data apa yang paling susah dibawa?" | Terjawab sebagian (C) | Panduan reseller: bagan akun, saldo awal, stok opname, cut-off, UAT | Pakai sebagai daftar penelusur setelah mereka menjawab |
| C | "Aplikasi apa, berapa lama, kenapa berhenti, pemicu persis" | Terjawab sebagian | §2.4 | Pertahankan, fokus pemicu |
| C | "Apa yang dibawa saat pindah? Berapa hari/jam/uang?" | Belum | Satu kasus: laporan terbengkalai 6 bulan (Jurnal Apple 2019). BukuKas: pengguna diminta mengunduh Excel sebelum 26 Mei 2023 | Tanya |
| C | "Apa yang harus berbeda supaya Anda mau mencoba lagi?" | Belum | Tidak ada | Tanya |

**4.2 Pertanyaan umum yang bisa dihapus dari wawancara terbuka**
Cukup dipakai sebagai verifikasi, tidak perlu ditanyakan untuk menemukan:
1. "Apakah aplikasi lama sering error atau lambat?" Jawabannya hampir pasti ya di semua aplikasi (§2.1 baris 1). Tanyakan kapan terakhir dan berapa lama pekerjaan terhenti.
2. "Apakah dukungan pelanggan lambat?" Sama (baris 4).
3. "Apakah harganya mahal?" Publik sudah mencatat pola (refund, MDR, kontrak, janji). Tanyakan harga yang dibayar.
4. "Apakah gampang daftar dan masuk?" Gerbang masuk adalah keluhan (baris 3).
5. "Apakah perangkat dan printer cocok?" Sudah ada pola untuk kasir (baris 10).

**4.3 Hipotesis R7 (tabel "Hipotesis yang diuji") setelah sumber publik**

| # | Hipotesis | Sumber publik | Catatan |
|---|---|---|---|
| 1 | Mereka mau mulai dari berkas Excel sendiri | Sebagian mendukung: ingin menyesuaikan seperti Excel (Zahir 2018), kategori sendiri (BukuWarung 196 jempol). Tidak ada ulasan yang menyebut impor dari Excel (0 sampai 2 persen menyebut impor/ekspor) | Tanya ke yang punya Excel terawat |
| 2 | Cukup satu proses dulu | Tidak dibantah: aplikasi terbesar (BukuWarung, Talenta) adalah satu proses; Majoo Apple 2★ 2026-02-02: "hal paling penting dari sistem POS sebenarnya bukan fitur yang canggih, tapi aplikasi bisa dipakai jualan dengan lancar kapan pun". Beban setup awal di Jurnal dan Gadjian | Tanya pemicu |
| 3 | Mengubah status atau kolom sendiri itu penting | Didukung sebagian: permintaan konkret ada (kategori, varian, komisi, split bill, format invoice); fleksibilitas dijual sebagai upgrade (Jurnal, Kledo) | Belum ada bukti "pernah minta vendor, lama atau mahal" |
| 5 | Harga per kursi menghalangi | Tidak ada data: satu keluhan batas kasir (Majoo Lite) | Pecah per unit harga |
| 6 | Offline penting | Lemah secara eksplisit, tetapi ada bukti kuat di lapangan (Talenta di kebun, hutan, laut), POS saat listrik mati, dan Majoo menjual server lokal di paket mahal | Tanya dengan peragaan sinyal |
| 8 | Laporan lari ke Excel | Tidak ada data. Laporan di app hanya muncul sebagai gagal diunduh (BukuWarung) dan kustomisasi laporan add-on (Jurnal) | Tanya |
| 9 | Izin per cabang atau nilai jadi masalah | Didukung sebagian: kasus spesifik 1 sampai 3 persen, tetapi dengan jempol tinggi (Accurate Lite 139) dan hak akses ditagih terpisah | Tanya kejadian kerugian |
| 11 | Takut sulit pindah | Didukung sebagian oleh anekdot (database terikat, min langganan, blokir saat telat, BukuKas). Tidak ada bukti "menolak aplikasi karena data terkunci" sebagai alasan sebelum beli | Tanya |

**4.4 Hipotesis baru dari sumber publik yang layak ditambahkan ke R7**
- **Update merusak** sebagai pemicu berhenti (tema 2). Tanya: "Pernah update mengubah cara kerja yang sudah Anda hafal? Apa yang Anda lakukan?"
- **Pintu masuk**: berapa langkah dan data pribadi yang diminta sebelum melihat nilai (tema 3, KTP/NPWP, OTP).
- **Biaya kesalahan ditanggung orang bawah**: tanya kasir atau pegawai lapangan, bukan hanya pemilik.
- **Aktivasi dan training sesudah bayar** sebagai pemicu kecewa.

## 5. Yang masih belum terdokumentasi dan harus ditanyakan

| # | Hal | Kenapa penting | Bagaimana mengisi |
|---|---|---|---|
| 1 | Biaya pindah nyata (jam, hari, rupiah, data yang hilang) | Tidak ada angka di sumber mana pun; hanya satu kisah 6 bulan dan satu penutupan layanan | Wawancara C (yang berhenti) dan akuntan B.10 |
| 2 | Berapa banyak yang diam-diam kembali ke Excel atau manual setelah bayar | Hipotesis R4 §4.3 belum bisa diuji; hanya 3 sampai 4 ulasan menyebutnya | Wawancara C; tanyakan "ada langganan yang masih jalan tetapi tidak dipakai?" |
| 3 | Siapa yang memutuskan membeli, dan peran akuntan atau teman | Ulasan hanya menunjuk sales; tidak ada suara pembeli | A.7 dan B.9 |
| 4 | Sinyal, perangkat, dan Android di titik kerja | Tidak ada data. Ulasan memperlihatkan tablet Android murah (Samsung A7/A8), Poco, Redmi, navigasi tertutup | Peragaan di lokasi. Catat merek dan versi |
| 5 | Kursi atau unit harga yang membuat pemilik menahan akses | Keluhan kursi nol | A.7 dengan unit |
| 6 | Pandangan akuntan: aplikasi mana yang dihindari, apa yang membuat angka dipercaya | Publik tidak punya suara akuntan | B.4 dan B.7 |
| 7 | Coretax per aplikasi (impor faktur, impor bupot, integrasi PJAP) | Tidak ada keluhan per aplikasi; klaim integrasi hanya dari vendor dan reseller | B.6; minta contoh kegagalan, jangan sebut aplikasi |
| 8 | Industri di luar F&B dan ritel: bengkel, kontraktor, klinik, produksi kecil | Bukti publik hampir nol; add-on Manufaktur Accurate Rp2,22 juta per bulan tidak punya ulasan sama sekali | Gunakan kuota 4 industri R7, mulai dari yang tidak ada di sini |
| 9 | Harga yang benar-benar dibayar (diskon, add-on, PPN, MDR, perangkat) | Etalase publik berbeda dari yang ditagih (Olsera 140 ke 218; Majoo MDR) | A.7 |
| 10 | Kejadian kerugian karena izin atau kontrol | Ulasan jarang tetapi jempol besar; tidak diketahui nilai rupiahnya | A.4 dan A.5 |
| 11 | Laporan yang lari ke Excel | Tidak ada data | A.4 "laporan apa yang sulit didapat" |
| 12 | Apakah tombol BukuWarung dan update Olsera Office sudah diperbaiki | Sampel berakhir 11 Oktober 2026; keluhan bisa sudah selesai | Cek ulang sebelum dikutip |
| 13 | Kondisi Jurnal, Accurate Online, dan Zahir web (produk inti) | Ulasan hanya aplikasi HP pendamping; G2 dan Capterra tidak terbuka | Browser biasa (daftar kerja R4 nomor 1); komunitas Mekari dan Accurate |
| 14 | Reddit, Kaskus, grup Facebook, YouTube, Trustpilot | Tidak terjangkau dari lingkungan ini | Cari manual dengan akses browser; simpan tautan dan tanggal |
| 15 | HashMicro dan Odoo mitra Indonesia | Hampir tidak ada ulasan Indonesia | Tanya akuntan dan pemilik menengah (3 sampai 5 orang di R7) |

## 6. Daftar sumber

Tingkat keyakinan: A resmi atau berita yang dibuka; B ulasan pengguna asli yang dibaca; C blog, vendor, pesaing; ⚠ ringkasan pencarian atau tidak dibuka.

### 6.1 Ulasan pengguna (B)
Semua diambil 12 Oktober 2026.
- Google Play (endpoint ulasan, urut terbaru, per bintang): [Jurnal](https://play.google.com/store/apps/details?id=id.jurnal.mobile), [Jurnal Touch](https://play.google.com/store/apps/details?id=id.jurnal.JurnalTouch), [Accurate Lite](https://play.google.com/store/apps/details?id=com.cpssoft.mobile.alpha), [Accurate POS](https://play.google.com/store/apps/details?id=com.cpssoft.mobile.titan), [Kledo](https://play.google.com/store/apps/details?id=com.kledo.app), [Kledo POS](https://play.google.com/store/apps/details?id=com.kledopos.app), [Zahir Apps](https://play.google.com/store/apps/details?id=com.zahironline), [Zahir Simply](https://play.google.com/store/apps/details?id=com.zahirsimplestart), [ZahirPOSX](https://play.google.com/store/apps/details?id=com.posx), [BukuWarung](https://play.google.com/store/apps/details?id=com.bukuwarung), [majoo](https://play.google.com/store/apps/details?id=com.klopos), [majoolite](https://play.google.com/store/apps/details?id=id.majoo.lite), [majoo Owner](https://play.google.com/store/apps/details?id=id.majoo.owner), [majoo Teams](https://play.google.com/store/apps/details?id=id.majoo.teams), [Moka](https://play.google.com/store/apps/details?id=com.mokapos.android), [Olsera POS](https://play.google.com/store/apps/details?id=com.olserapratama.pos), [Olsera Office](https://play.google.com/store/apps/details?id=com.olserapratama.office), [iSeller Admin](https://play.google.com/store/apps/details?id=iSeller.Android.v2), [iSeller Retail](https://play.google.com/store/apps/details?id=iSellerRetail.Android.v2), [Talenta](https://play.google.com/store/apps/details?id=co.talenta), [Talenta Attendance](https://play.google.com/store/apps/details?id=co.talenta.attendance), [GadjianKu](https://play.google.com/store/apps/details?id=com.gadjian.gadjianku), [Gadjian Admin](https://play.google.com/store/apps/details?id=gadjian.user.app), [Odoo](https://play.google.com/store/apps/details?id=com.odoo.mobile), [Excel](https://play.google.com/store/apps/details?id=com.microsoft.office.excel), [Google Sheets](https://play.google.com/store/apps/details?id=com.google.android.apps.docs.editors.sheets).
- App Store Indonesia (RSS ulasan pelanggan, pola `https://itunes.apple.com/id/rss/customerreviews/page=N/id=ID/sortby=mostrecent/json`), ID: Jurnal 1289636276, Accurate Lite 6446817668, Kledo 1586502518, Gajihub 1604540147, Zahir Apps 1504813555, ZahirPOSX 1367134082, majoo Kasir 1642259472, majoolite 1669605872, majoo Owner 6446137792, majoo Teams 1668913697, Olsera POS 1172633730, Olsera Office 1478712450, iSeller Admin 1279627776, Talenta 1459958693, GadjianKu 1477130270, Odoo 1272543640. Pencarian iTunes tidak menemukan BukuWarung, Moka, BukuKas di toko Indonesia. Rating dan jumlah dari iTunes Search API.

### 6.2 Halaman resmi dan berita (A)
- [Kledo harga](https://www.kledo.com/harga/), [Jurnal harga](https://www.jurnal.id/id/pricing/), [Accurate harga](https://accurate.id/harga/), [Accurate pengumuman harga data usaha 2026](https://accurate.id/informasi/pengguna/harga-data-usaha-2026/), [Zahir Online harga](https://www.zahironline.com/harga), [Majoo harga](https://majoo.id/harga) (100.000 dari 122.379 karakter terbaca), [Moka harga](https://www.mokapos.com/harga), [Talenta harga](https://www.talenta.co/harga/), [Odoo harga](https://www.odoo.com/id_ID/pricing) (label tahunan atau bulanan ⚠). Gadjian /harga 404, iSeller 503, Olsera tidak memuat harga (JavaScript). Semua tanpa tanggal terbit kecuali pengumuman Accurate.
- [CNBC Indonesia, BukuKas tutup (2023-05-15)](https://www.cnbcindonesia.com/tech/20230515080100-37-437245/bukukas-tutup-walau-dulu-punya-rp-114-triliun-nasib-lummo). A (berita arus utama), tanpa pernyataan resmi perusahaan.

### 6.3 Ringkasan pencarian, tidak dibuka (⚠)
- G2 Jurnal ([reviews](https://www.g2.com/products/jurnal-mekari-jurnal/reviews)), Capterra Talenta ([reviews](https://www.capterra.com/p/241697/Talenta/reviews/)), G2 HashMicro ([reviews](https://www.g2.com/products/hashmicro-erp/reviews)), Capterra Moka ([halaman](https://www.capterra.com/p/199872/Moka/)), Capterra Kledo ([halaman](https://www.capterra.com/p/10016663/Kledo/)). Semua 403 bila dibuka; isi dari ringkasan hasil pencarian. Skor dan jumlah ulasan tidak boleh dikutip.
- [Mekari Community](https://community.mekari.com/forums/topic/kendala-implementasi-coretax/) (judul utas Coretax dan "Cerita Bagaimana Akhirnya Saya Memilih Jurnal.id" dari pencarian; 403 saat dibuka).
- [DealStreetAsia, Lummo liquidation](https://media.dealstreetasia.com/stories/indonesia-lummo-liquidation-360554) (hasil pencarian).
- Quora (judul pertanyaan akuntansi UMKM, 403), Kaskus (utas 2012 dibuka, balasan tidak termuat; utas Majoo klinik hanya dari pencarian).

### 6.4 Blog, vendor, reseller (C)
- Perbandingan oleh Sales Executive Accurate: [doniirvan.id](https://www.doniirvan.id/accurate-online/perbandingan-software-akuntansi/). Reseller Accurate: [acisindonesia.com migrasi Accurate Online](https://www.acisindonesia.com/5-kesalahan-umum-saat-migrasi-data-ke-accurate-online-dan-cara-menghindarinya/).
- Vendor Kledo: [rekap webinar Kledo x EnforceA](https://kledo.com/blog/rekap-webinar-kledo-x-enforcea/) (PP 20 Tahun 2026 ⚠ belum dicek ke teks aturan).
- Agregator tanpa pemilik jelas: [quasa.io Jurnal vs Kledo](https://quasa.io/id/media/jurnal-atau-kledo-selisih-harga-besar-tetapi-gudang-bisa-membalik-pilihan) (dibuka, angka tidak dipakai).
- [ukmindonesia.id, alternatif Google Sheets (2025-11-29)](https://ukmindonesia.id/baca-deskripsi-posts/alternatif-google-sheets-untuk-umkm-aplikasi-pencatatan-digital-yang-praktis-untuk-laporan-usaha).
- Dari pencarian saja (⚠): penjualanonline.id (Accurate siap Coretax), kantorku.id dan gadjian.com (perbandingan HRIS), jurnal pengabdian Polsri dan Tadulako tentang Excel (PDF tidak terbaca), jurnal Unsoed dan UBP Karawang tentang BukuKas (PDF tidak terbaca).

### 6.5 Akademik
- [Kurniawati dkk., TEKIBA 6(2), 2026, Google Sheets stok UMKM Tienz](https://ejournal.unibabwi.ac.id/index.php/tekiba/article/view/8199) (abstrak, B).

### 6.6 Yang tidak terjangkau
Reddit, Trustpilot, Facebook, YouTube, forum Accurate/Kledo/Zahir, G2/Capterra penuh, Quora penuh, Kaskus balasan. Pencarian terbatas domain di Reddit ditolak oleh alat.

