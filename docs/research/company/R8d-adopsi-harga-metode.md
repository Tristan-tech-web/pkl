# R8d. Adopsi, harga, dan metode wawancara: yang sudah terdokumentasi publik

Tanggal riset: 12 Oktober 2026. Bagian D dari putaran riset meja R8. Melengkapi R4 §3 dan §4 (kenapa orang bertahan di Excel dan WhatsApp) dan dipakai untuk memperbaiki R7 (panduan wawancara). R4 dan R7 tidak diubah di sini. Usulan perubahan panduan ada di §5.

## 0. Cara membaca, dan batasnya

**Tingkat keyakinan** (sama dengan R4 §7).
- **A** = primer atau akademik yang dibuka langsung. Untuk harga, A berarti "angka ini memang tertulis di halaman resmi vendor pada tanggal itu", bukan "angka ini yang dibayar pelanggan".
- **B** = sedang. Laporan atau media arus utama yang dibuka, tetapi metodologi tidak lengkap, atau hanya abstrak, atau ringkasan buku oleh pihak ketiga.
- **C** = lemah. Blog, vendor atau pesaing yang berkepentingan, survei yang dijalankan vendor.
- **⚠** = hanya dari ringkasan hasil pencarian, atau halamannya tidak bisa dibuka. Jangan dikutip keluar sebelum dicek.

**Cara ambil data.**
- Halaman harga dibuka tanggal 12 Oktober 2026 lewat WebFetch (merangkum dengan model kecil) dan curl (HTML mentah). Untuk angka harga, saya cocokkan ke teks HTML mentah. Kalau hanya lewat ringkasan, ditandai di kolom sumber.
- Tidak bisa dibuka: Gartner Digital Markets (403), BusinessWire (galat), Opensignal (403), DOAJ (403), halaman harga resmi Olsera (dirender JavaScript, yang terbaca hanya judul "Olsera Backoffice"), tautan unduh laporan Meta dan BCG.
- Tidak dicakup: Reddit, ulasan Google Play, G2 (tetap ada di daftar kerja R4). Tidak ketemu: survei nasional UMKM tentang pembukuan dari Mekari, Katadata, OJK, BI atau BPS. Beberapa kali dicari dengan kata kunci berbeda, yang muncul hanya studi lokal berskala kecil.
- Harga adalah harga etalase. Ada diskon kontrak pertama (Jurnal), harga coret (Kledo, Odoo), PPN yang kadang belum termasuk, dan harga bisa beda per negara. Harga dolar tidak saya konversi ke rupiah karena kurs hari ini tidak saya ambil.
- Hitungan per tahun (bulanan x 12) adalah hitungan saya.

## 1. Ringkasan

1. **Biaya pindah.** Literatur akademik sepakat bahwa penghalang pindah terdiri dari risiko yang dirasakan dan nilai tenggelam di sistem lama (Chang 2020, 212 pemilik dan manajer puncak di Taiwan, A). Studi UMKM Indonesia menambahkan kebiasaan, pengetahuan dan pelatihan yang kurang, internet lemah, serta takut salah dan takut implikasi aturan (Badung 2026, 10 pelaku usaha, B). Yang **tidak ada**: angka jam atau rupiah untuk migrasi di UKM Indonesia, dan data berapa banyak yang berhenti berlangganan lalu kembali ke Excel.
2. **Niat tidak memprediksi pemakaian.** Survei UMKM Padang (2023) menemukan persepsi manfaat, persepsi kemudahan, dan niat memakai tidak berpengaruh pada pemakaian aplikasi akuntansi digital (B). Ini dukungan empiris untuk aturan 1 di R7 ("tanya yang sudah terjadi, bukan yang akan").
3. **Harga masuk di aplikasi akuntansi Indonesia** ada di kisaran Rp150.000 sampai Rp400.000 per bulan untuk paket berbayar terendah (Zahir Rp150.000, Kledo Pro Rp159.900, Accurate Rp333.000, Jurnal Rp359.100 sampai Rp399.000). Kasir (POS) ditagih per outlet (Rp249.000 sampai Rp999.000 per outlet per bulan). HR ditagih per karyawan (Rp12.500 sampai Rp20.000). Alat fleksibel ditagih per kursi (US$9 sampai US$45 per kursi per bulan). Tabel di §2.2.
4. **Per kursi di aplikasi akuntansi Indonesia tidak seperti di Airtable atau monday.** Kursi tambahan murah (Accurate Rp22.200, Kledo Rp69.900 per user tambahan) dan yang mengikat adalah batas user per paket serta unit lain: cabang, gudang, outlet, jumlah faktur. Hipotesis 5 di R7 perlu dipersempit: tanyakan unit mana yang membuat pemilik menahan akses, bukan hanya "kursi".
5. **Fleksibilitas dijual sebagai upgrade.** Custom field, alur persetujuan bertingkat, hak akses detail, dan izin per cabang ada di paket atas atau add-on berbayar (Jurnal, Kledo, Accurate). Ini bukti dari sisi penawaran untuk hipotesis 3 dan 9. Bukan bukti permintaan.
6. **Pembelian.** Pemilik biasanya pengambil keputusan, akuntan, teman, dan konsultan memengaruhi, uji coba gratis lazim dipakai (studi Thailand 2022, A). Survei 738 pembuat keputusan teknologi UKM Amerika (SMB Group 2024, B): 69 persen memutuskan sendiri, harga paling hemat (43 persen), cocok dengan sistem lama (34 persen), dan mudah dipakai (33 persen) adalah tiga alasan masuk daftar pendek. Tidak ada data siklus beli untuk Indonesia.
7. **Vendor sudah memperlakukan akuntan dan konsultan sebagai saluran penjualan** (program referral Kledo, Jurnal, Accurate, ⚠ dari ringkasan pencarian). Saat mewawancarai akuntan, tanyakan terbuka apakah mereka dapat komisi.
8. **Metode.** Empat kerangka baku (Mom Test, JTBD/Switch, Teresa Torres, Customer Development Steve Blank) dan Intuit Follow-Me-Home sejalan dengan aturan main R7. Tiga celah di R7: bagian 7 (harga dan keputusan membeli) berisi pertanyaan masa depan, pengguna harian (kasir, admin, gudang) tidak diwawancarai, dan komitmen belum bertingkat. Usulan di §5.
9. **Konektivitas.** Penetrasi internet nasional 80,66 persen (APJII 2025) dan 2.121 desa 0 persen 4G (BAKTI, Desember 2025). Tidak ada data sinyal di titik kerja (gudang, pasar, proyek), jadi hipotesis 6 tetap harus ditanya. WhatsApp: sekitar 9 dari 10 orang Indonesia aktif tiap bulan (We Are Social 2025). Tidak ada survei UKM tentang WhatsApp sebagai alat pencatatan internal.
10. **Paling berharga ditanyakan langsung** (§4): biaya pindah nyata, cerita berhenti, siapa yang memutuskan, unit harga yang masuk akal bagi mereka, dan sinyal di titik kerja.

## 2. Temuan per topik

### 2.1 Biaya pindah dan alasan bertahan di Excel, WhatsApp, buku

| Sumber | Apa yang diteliti | Temuan yang relevan | Kunci |
|---|---|---|---|
| Studi kasus akuntansi cloud di UKM Thailand, 2022 (PMC9209838) | 17 informan (6 pakar, 5 vendor, 6 entri pemilik UKM), wawancara 45 sampai 75 menit, Agustus sampai September 2020 | Pemilik adalah pengambil keputusan di semua tahap (mulai, menilai, uji coba, memilih, membeli). Konsultasi ke teman, keluarga, akuntan, instansi, konsultan IT. Uji coba gratis lazim. Satu pemilik pernah berhenti karena fitur buruk lalu kembali setelah teman melaporkan perbaikan. Hambatan: kerumitan, kompetensi teknologi rendah, internet desa lambat, kebiasaan kertas, sebagian lebih suka perangkat lunak terpasang karena takut biaya bulanan dan keamanan. Penulis memperkirakan 5 sampai 10 persen UKM berbadan hukum di Thailand sudah memakai akuntansi cloud. Sampel kecil | A |
| Chang 2020, Journal of Enterprise Information Management 33(3) | Survei 212 pemilik dan manajer puncak di Taiwan, pemodelan persamaan struktural | Biaya pindah = risiko yang dirasakan terhadap ERP cloud ditambah nilai tenggelam di ERP lama (kepuasan dan keluasan pakai). Biaya pindah menurunkan niat pindah, manfaat pindah menaikkannya | A (abstrak dan ringkasan halaman penerbit) |
| Gardiner dan Andoh-Baidoo, HICSS-52, 2019 | Perusahaan menengah di Ghana, teori bias status quo, biaya pindah, keengganan rugi | Peneliti menyatakan kekuatan psikologis yang membuat orang bertahan di keadaan sekarang kurang diteliti. Hanya abstrak yang dibaca | B |
| Badung 2026, COSTING 9(1) | Wawancara mendalam 10 pelaku UMKM pedesaan | Kebiasaan, pengetahuan dan pelatihan terbatas, internet lemah dan perangkat terbatas, takut salah dan takut implikasi regulasi. Mereka mengakui manfaatnya. Kesimpulan penulis: masalahnya ekosistem pendamping yang lemah, bukan penolakan teknologi | B |
| Padang 2023, Akuntansi dan Manajemen 18(2) | Survei UMKM yang sudah dan belum memakai aplikasi akuntansi digital (TAM dan UTAUT) | Persepsi kegunaan, kemudahan, niat, dan sikap tidak berpengaruh pada pemakaian | B (PDF dibaca, ukuran sampel tidak saya catat) |
| Banyumas 2025, Tekmapro 20(1) | Dinamika sistem dari tinjauan pustaka dan wawancara semi terstruktur | Kendala sumber daya, resistensi, dan biaya implementasi. Tiga pendorong: dukungan pemerintah, ERP hemat biaya, pelatihan. Jumlah responden tidak dinyatakan | B |
| Can Tho (Vietnam) 2025 | Survei tatap muka 148 direktur dan kepala akuntan UKM | Enam faktor memilih perangkat lunak akuntansi: fitur, kebutuhan pengguna, biaya, keandalan vendor, dukungan vendor, layanan purna jual | B (abstrak) |
| Hamzah dkk., Jurnal Akuntansi 27(3), 2023 | Survei 276 responden UKM Indonesia, SmartPLS | Signifikan: kompleksitas, keamanan, dukungan manajemen puncak, sumber daya, tekanan pesaing dan mitra dagang, tekanan pemaksa, dukungan pemerintah, dukungan penyedia. Tidak signifikan: kecocokan, keunggulan relatif, kompetensi TI | ⚠ ringkasan pencarian, DOAJ 403 |
| Survei iplicit (vendor akuntansi), 2024 | 1.000 pengambil keputusan keuangan organisasi menengah di Inggris | 42 persen takut kehilangan data historis saat ganti perangkat lunak akuntansi, 32 persen menyebut biaya lisensi "right to use" hanya untuk melihat data lama | C (vendor, bukan UKM kecil, bukan Indonesia) |
| Bench Accounting tutup, Desember 2024 | Pembukuan daring Amerika, ditutup mendadak, pelanggan diberi waktu unduh sampai 7 Maret | Contoh nyata risiko "data terkunci di vendor". Jumlah pelanggan beda antar blog | C ⚠ |

**Yang bisa dipegang.**
1. Biaya pindah dalam literatur adalah penjumlahan "takut rugi" dan "sudah terlanjur investasi di sistem lama". Cocok dengan temuan R4 §3.2, tetapi tidak ada ukuran rupiah.
2. Di Indonesia, pelaku UMKM yang masih manual umumnya bukan menolak aplikasi. Mereka kekurangan pendampingan, waktu, dan keberanian (Badung 2026). Ini mendukung desain "masuk lewat berkas Excel sendiri dengan pendampingan" di R4 §3.4.
3. Pemilik kecil di Thailand mengutamakan harga murah dan mudah dipakai dibanding kelengkapan fitur, dan pembayaran fleksibel dianggap hemat. Satu studi kecil, tetapi searah dengan data harga di §2.2.
4. Studi Thailand dan Padang memberi alasan memakai uji coba nyata sebagai ukuran, bukan pernyataan minat.

**Tidak ditemukan.** Angka jam atau rupiah migrasi di UKM Indonesia. Data churn atau alasan berhenti pengguna Jurnal, Accurate, Kledo, Zahir (sudah dicari, yang muncul hanya studi kasus penggunaan). Survei nasional UMKM yang masih manual (satu jurnal pengabdian menyebut sekitar 70 persen dengan merujuk Bank Indonesia 2023, belum dicek ke sumber asli ⚠).

### 2.2 Harga dan model tagihan

Semua diambil 12 Oktober 2026. "Mentah" = angka dicocokkan ke teks HTML mentah.

#### 2.2.1 Aplikasi Indonesia

| Produk | Paket dan harga etalase | Catatan | Sumber, keyakinan |
|---|---|---|---|
| **Mekari Jurnal** (paket dengan batas user) | Essentials: harga normal Rp399.000, tertulis "diskon 10%" Rp359.100 per bulan, 3 user. Plus: Rp899.000, "diskon 30%" Rp629.300 per bulan, 5 user. Jurnal 360: hubungi sales, 10 user | Belum termasuk PPN. Harga diskon adalah "harga khusus kontrak pertama, dibayar per tahun". Ada tombol "per tahun / per kuarter" tetapi harga kuartal tidak tampil. Harga user tambahan tidak ditampilkan. Pelatihan dan pendampingan implementasi gratis untuk semua paket (tertulis di halaman). Tidak ada penalti putus kontrak, tetapi pembayaran yang sudah masuk tidak dikembalikan. Per tahun (hitungan saya): Essentials Rp4.309.200 diskon atau Rp4.788.000 normal. Custom field, custom report, API, dan integrasi lain lewat "WhatsApp sales" tanpa harga | https://www.jurnal.id/id/pricing/ (dialihkan ke /id/harga/). A, mentah |
| **Accurate Online** (satu paket dasar + add-on) | Paket Dasar Rp333.000 per bulan, 1 data usaha, 1 akses pengguna, gratis 30 hari. Add-on per bulan: Manufaktur Rp2,22 juta, Multi Branch/Cabang Rp99.900, Cost & Profit Center Rp111.000, Pengguna Back Office Rp22.200, Accurate POS Rp222.000, Trade Portal (beta) gratis | Paket Dasar tertulis "sudah termasuk PPN 11%", status PPN add-on tidak tertulis. Ditagih bulanan, tidak ada tahunan (bisa deposit saldo yang dipotong otomatis). Setiap tambahan cabang kena add-on Multi Branch tiap bulan. Add-on Multi Branch menyebut "hak akses karyawan per cabang". Per tahun paket dasar (hitungan saya): Rp3.996.000 | https://accurate.id/harga/ . A, mentah |
| **Kledo** (paket dengan batas user, gudang, faktur) | Harga per bulan, format "dibayar per tahun / dibayar per 3 bulan". Free Rp0 (1 user, 1.000 faktur dan 1.000 produk per bulan). Pro Rp159.900 / Rp246.000 (3 user, 1 gudang, 3.000 faktur). Elite Rp279.900 / Rp430.615 (5 user, 10 gudang, 6.000 faktur). Champion Rp399.900 / Rp615.231 (7 user, 20 gudang, 8.000 faktur) | Belum termasuk PPN. Jumlah user di atas untuk langganan tahunan (bulanan lebih sedikit). Add-on (periode tagih tidak tertulis ⚠): tambah user Rp69.900, tambah gudang Rp29.900, custom invoice Rp349.900, tambah faktur Rp99.900 (5.000 faktur), marketplace Rp49.900, tambah produk Rp39.900 (1.000 produk), payroll dan absensi Rp6.900 "per jumlah karyawan", e-meterai Rp10.000, saldo WhatsApp Rp29.900. Custom field dan hak akses detail per user mulai Elite. Approval bertingkat dan budgeting hanya Champion. Uji coba 14 hari, bantuan personal "100% gratis". Per tahun tahunan (hitungan saya): Pro Rp1.918.800, Elite Rp3.358.800, Champion Rp4.798.800 (angka yang sama muncul di artikel pembanding quasa.io, C ⚠) | https://kledo.com/harga/ , https://kledo.com/ . A, mentah |
| **Zahir Online** (paket dengan batas user) | Small Business Rp150.000 per bulan (1 user). Professional Rp878.750 (3 user, latihan 6 jam). Enterprise Rp1,5 juta (5 user, latihan 6 jam). ERP Cloud Rp150 juta per tahun (10 user, server dedicated, implementasi IT onsite, latihan 18 jam) | Semua "berlangganan 1 tahun" dan "sudah termasuk PPN". Add-on opsional: Zahir HR (payroll dan absensi) Rp2 juta per tahun untuk 10 karyawan, pendampingan profesional Zahir Accounting Services Rp5 juta per bulan. Per tahun (hitungan saya): Small Business Rp1.800.000 | https://zahironline.com/harga (dialihkan ke /harga-produk/). A, mentah |
| **Majoo** (POS, per outlet) | Starter Rp249.000, Advance Rp499.000, Prime Rp999.000 per outlet per bulan. Prime+ hubungi sales | Belum termasuk PPN. Starter: 1 outlet, maksimal 2 terminal dan 1 akses pengelola utama. Advance: multi outlet, 3 terminal, 2 akses. Prime: 5 terminal, 5 akses. Paket langganan dua tahun harganya tepat 24 x bulanan (Starter Rp5.976.000). Ada paket "Akuntansi" terkemas (Dasar Rp1.699.000, Lengkap Rp2.599.000, Full Service Rp4.999.000 per bulan, tertulis "termasuk langganan per bulan", isinya terlihat seperti jasa pembukuan, arti persisnya belum jelas ⚠) | https://majoo.id/harga . A, mentah |
| **Moka** (POS, per outlet) | Basic Rp299.000, Pro Rp499.000, Enterprise Rp799.000 per outlet per bulan | Karyawan per outlet: sampai 5, 10, 20. Lewat kuota kena Rp10.000 per slot karyawan. PPN tidak disebut di halaman. Baris account manager menyebut "minimum 5 outlet" tanpa jelas paket mana | https://www.mokapos.com/harga . A, mentah |
| **Olsera** (POS) | Basic Rp1.288.000 per tahun (tahunan) atau Rp1.888.000 tanpa komitmen tahunan, Premium Rp1.988.000, Pro Rp2.688.000, semua sebelum PPN, uji coba 14 hari | Periode tagih Premium dan Pro tidak jelas. Halaman resmi tidak terbaca. Tanggal cek di sumber: 28 Agustus 2026 | https://www.take.app/alternatives/olsera . C ⚠ (situs pesaing) |
| **Mekari Talenta** (HRIS) | Paket Essential, Plus, Talenta 360. **Harga tidak dipajang**, tombol "WhatsApp sales" | Uji coba 14 hari tanpa kartu kredit, "tanpa biaya implementasi", modul seperti rekrutmen dijual terpisah tanpa harga | https://talenta.co/harga . A (fakta: tidak ada harga) |
| **Gadjian** (HRIS, per karyawan) | Standar Rp12.500, Sukses Rp20.000, Apresiasi Kinerja Rp6.000 per karyawan per bulan | Standar: mulai 6 karyawan, 5 karyawan pertama gratis. Sukses: minimal 6. Apresiasi Kinerja: minimal 20 karyawan dan 6 bulan. Persentase diskon 6 dan 12 bulan kosong di teks halaman. PPN tidak disebut. Demo 14 hari | https://www.gadjian.com/pricing . A, mentah |
| **BukuWarung** | Aplikasi gratis. Halaman utama tidak menampilkan langganan | Halaman menyebut komisi agen PPOB 1 sampai 5 persen, penjualan mesin EDC, dan plafon pinjaman sampai Rp50 juta. Artinya uang datang dari transaksi, bukan langganan (kesimpulan saya ⚠) | https://bukuwarung.com/ . A (halaman dibaca lewat ringkasan) |

#### 2.2.2 Alat fleksibel dan ERP terbuka

| Produk | Paket dan harga etalase (USD) | Catatan | Sumber, keyakinan |
|---|---|---|---|
| **Airtable** (per kursi) | Free. Team US$20 per user per bulan. Business US$45 per user per bulan, keduanya "billed annually". Enterprise Scale: custom | Harga bulanan tidak tampil di teks halaman. Batas rekaman tidak disebut di halaman ini (angka 50.000 dan 125.000 di R4 berasal dari blog pesaing). 10 kursi tahunan (hitungan saya): Team US$200, Business US$450 per bulan | https://airtable.com/pricing . A, mentah |
| **Notion** (per kursi) | Free US$0. Plus US$10. Business US$20 per member per bulan. Enterprise custom | Ada tombol bayar bulanan atau tahunan, "hemat sampai 20 persen dengan tahunan", teks tidak menegaskan angka mana milik mode mana ⚠. Domain kustom US$8 per bulan (tahunan) atau US$10 (bulanan). Kredit agen US$10 per 1.000 kredit | https://www.notion.com/pricing . A, mentah |
| **monday.com** (per kursi, minimal 3) | Work management, ditagih tahunan: Basic US$9, Standard US$12, Pro US$19 per kursi per bulan. Free sampai 2 kursi. Enterprise custom | "Plans start from 3 users." CRM: Basic US$12, Standard US$17, Pro US$28. 10 kursi Pro (hitungan halaman) US$190 per bulan. Harga bulanan lebih tinggi, selisihnya tidak saya catat | https://monday.com/pricing . A, mentah |
| **Odoo** (per user) | One App Free US$0 (satu aplikasi, user tanpa batas). Standard US$24,90 (tahunan) atau US$31,10 (bulanan) per user per bulan. Custom US$49,00 (tahunan) atau US$61,10 (bulanan). Light user US$8,90 | Pembacaan tahunan atau bulanan dari urutan tombol, label tidak eksplisit ⚠. Angka coret US$31,10 / 38,90 (Standard) dan 61,00 / 76,20 (Custom) adalah harga tanpa diskon, diskon "valid 12 bulan untuk user awal". Hosting Odoo.sh biaya tambahan, implementasi dan pemeliharaan kode kustom tidak termasuk. Dua kali baca lewat ringkasan memberi angka berbeda, jadi saya pakai HTML mentah | https://www.odoo.com/pricing . A, mentah (label ⚠) |
| **Zoho Books** (per organisasi, edisi AS) | Per org per bulan, tahunan / bulanan: Free US$0 (1 user + 1 akuntan). Standard US$15 / 20 (3 user). Professional US$40 / 50 (5 user). Premium US$60 / 70 (10 user). Elite US$120 / 150 (10 user). Ultimate US$240 / 275 (15 user). User tambahan US$2,50 (tahunan) atau US$3 (bulanan) | Belum termasuk pajak lokal. Halaman edisi Indonesia (/id/) tidak ada (404). Jadi ini harga AS, bukan harga yang dilihat pelanggan Indonesia ⚠ | https://www.zoho.com/us/books/pricing/ . A, mentah |

#### 2.2.3 Model tagihan, siapa yang memakai, dan akibatnya

| Model | Dipakai oleh | Pengamatan |
|---|---|---|
| Per kursi | Airtable, Notion, monday, Odoo | Harga total naik lurus dengan jumlah orang yang diberi akses. Cocok dengan keluhan R4 §2.4 |
| Per organisasi dengan paket berbatas user | Zoho Books, Jurnal, Zahir, Kledo | Jumlah user sudah ada di dalam paket (3, 5, 10). Naik paket bila user, gudang, atau faktur melewati batas |
| Satu dasar + add-on per modul, cabang, user | Accurate | Dasar murah, tambahan per cabang dan per modul menumpuk. User tambahan Rp22.200 per bulan murah, Manufaktur Rp2,22 juta per bulan mahal |
| Per outlet | Majoo, Moka | Biaya naik lurus dengan lokasi. Lima outlet Majoo Prime Rp4.995.000 per bulan (hitungan saya). Moka juga membatasi jumlah karyawan per outlet |
| Per karyawan | Gadjian, add-on payroll Kledo | Biaya mengikuti jumlah yang digaji, bukan jumlah pemakai |
| Kuota transaksi atau dokumen | Kledo (faktur per bulan, e-meterai, saldo WhatsApp), Notion (kredit agen) | Harga per unit kecil, kuota bisa jadi pemicu naik paket |
| Gratis lalu transaksi | BukuWarung | Uang dari transaksi dan produk keuangan, bukan langganan |
| Tidak dipajang, lewat sales | Talenta, Jurnal 360, Majoo Prime+, Odoo Light user | Sesuai keluhan SMB Group: 46 persen pembeli ingin harga yang transparan di situs vendor |

#### 2.2.4 Pembacaan

1. **Kursi bukan penghalang utama di aplikasi akuntansi Indonesia, tetapi bisa jadi di alat fleksibel.** Contoh 10 kursi: Airtable Business US$450 per bulan, Zoho Books Premium US$60 per bulan untuk 10 user. Itu produk berbeda, jadi bukan perbandingan fungsi, hanya perbandingan cara tagih. Untuk Kledo, Pro (3 user) ditambah 2 user kira-kira Rp299.700 per bulan bila add-on user ditagih bulanan, sedikit di atas Elite 5 user (Rp279.900). Hitungan saya, periode add-on tidak tertulis ⚠. Pola ini mendorong naik paket.
2. **Fleksibilitas yang diminta di R4 dijual sebagai upgrade.** Jurnal: custom field add-on di Essentials, terbatas 1 sampai 3 field di paket atas (pembacaan tabel perbandingan, pemetaan kolom ⚠), custom report add-on. Kledo: custom field dan hak akses detail mulai Elite, approval hanya Champion, custom invoice add-on Rp349.900. Accurate: hak akses per cabang lewat add-on Multi Branch. Ini mendukung dari sisi penawaran bahwa perubahan kecil (satu kolom, satu langkah persetujuan, satu izin) memang barang berbayar. Belum bukti bahwa pembeli merasakannya sebagai masalah.
3. **Biaya pindah dijawab vendor dengan pelatihan gratis.** Jurnal: pelatihan dan pendampingan implementasi gratis di semua paket. Kledo: bantuan personal gratis dan "impor data otomatis" di beranda. Zahir: latihan 6 jam (Professional dan Enterprise), 18 jam (ERP Cloud). Talenta: tanpa biaya implementasi. Jam pelatihan menjadi unit penjualan, bukan angka migrasi.
4. **Selaras dengan R4.** R4 §2.4 mencatat dua sumber yang bertentangan soal paling mahal dan paling murah. Sekarang bisa disatukan: harga berubah. Di antara paket berbayar terendah, Zahir (Rp150.000) dan Kledo Pro (Rp159.900) murah, Accurate (Rp333.000) menengah, Jurnal (Rp359.100 sampai Rp399.000) paling mahal. Isi paket tidak setara. Angka "Jurnal sekitar Rp5,3 juta per tahun" di R4 sudah tidak sama dengan etalase sekarang (Rp4,3 juta sampai Rp4,8 juta per tahun untuk Essentials).
5. **Jasa pembukuan terkemas oleh vendor** menjadi patokan biaya "pakai akuntan": Majoo Rp1,7 juta sampai Rp5 juta per bulan, Zahir Accounting Services Rp5 juta per bulan. Ini harga etalase vendor, bukan harga pasar jasa akuntan.
6. **Kesediaan membayar: tidak ada data.** Dua pencarian dengan kata kunci Indonesia, UMKM, dan aplikasi pencatatan tidak menemukan survei kesediaan membayar. Yang ada hanya harga yang ditawarkan dan paket gratis. Gratis itu nyata: Kledo Free, Zoho Books Free, BukuWarung gratis, Odoo One App Free.

### 2.3 Cara UKM membeli: siapa memutuskan, apa yang dibuktikan dulu, siklus

**Data terkuat yang ketemu: SMB Group, "2024 SMB Technology Buying Journey" (B).** Survei web Juni 2024, 738 wawancara selesai, sampel acak UKM Amerika, responden pembuat keputusan atau pemberi pengaruh keuangan dan teknologi, 57 pertanyaan. Isinya perangkat lunak dan teknologi umum, bukan akuntansi. Peringatan: Amerika, vendor sebagai pembaca sasaran, perusahaan sangat kecil dan menengah dicampur. Halaman rujukan dari PDF 177 halaman (ekstraksi teks) dan eBook bagian dua.

| Pertanyaan | Temuan | Halaman |
|---|---|---|
| Siapa memutuskan | 69 persen pembuat keputusan tunggal, 28 persen bersama, 3 persen hanya memberi pengaruh | 7 |
| Alasan masuk daftar pendek | Paling hemat biaya 43 persen, cocok dengan sistem lama 34 persen, lebih mudah dipakai 33 persen, fitur dan teknologi unggul 31 persen, mudah disesuaikan 24 persen, cepat dipasang 24 persen. Makin kecil perusahaan, makin sering "hemat" dan "mudah" masuk tiga besar | 14 |
| Tantangan memilih | Privasi dan keamanan data 47 persen, sulit tahu solusi mana yang cocok 45 persen, integrasi 44 persen, kurang anggaran 32 persen, lama sampai produktif 28 persen, tidak ada waktu mencoba 25 persen. UKM di bawah 20 orang paling sering menyebut "sulit tahu mana yang cocok" | 10 |
| Perbaikan dari vendor | Jelaskan manfaat untuk tujuan kami 56 persen, harga transparan di situs 46 persen, luangkan waktu memahami kebutuhan kami 44 persen | 14 |
| Sumber informasi | Pencarian web 54 persen, marketplace aplikasi vendor 39 persen, situs vendor 36 persen. Panduan: konsultan teknologi 44 persen, penasihat bisnis 40 persen, penasihat vendor 38 persen. UKM di bawah 50 orang lebih sering mengandalkan teman dan keluarga | 15 sampai 16 |
| Proses sebelum menghubungi vendor | 13 persen kurang dari 25 persen proses selesai, sepertiga 25 sampai 49 persen, sepertiga 50 sampai 75 persen, 17 persen lebih dari 75 persen. UKM di bawah 50 orang lebih sering menyelesaikan lebih dari 75 persen sebelum menghubungi vendor | 16 |
| Layanan yang dibutuhkan saat membeli | Migrasi data: sekitar 23 persen selalu dan 30 persen sering butuh (urutan angka di grafik dicocokkan ke urutan label ⚠). UKM di bawah 50 orang jauh lebih jarang butuh layanan tambahan dan lebih memilih produk swalayan | eBook bagian 2, hlm. 10 |
| Evaluasi ulang sistem | 41 persen tiap tahun, 22 persen kalau perlu, 17 persen lebih dari sekali setahun. UKM kecil lebih sering ad hoc | 12 |

**Data pendukung.**
- **Thailand 2022 (A).** Pemilik adalah pengambil keputusan; yang memengaruhi: teman, keluarga, akuntan profesional, instansi, konsultan IT, perusahaan jasa akuntansi. Uji coba gratis lazim dipakai untuk menguji kecocokan. Orang yang kecewa bisa kembali setelah kabar baik dari teman.
- **Gartner Digital Markets 2025, ⚠ ringkasan pencarian, halaman 403.** Disebut 62 persen pembeli menilai uji coba produk sebagai faktor utama keputusan akhir dan 59 persen menyesal atas minimal satu pembelian dalam 18 bulan. Ringkasan lain menyebut pembeli yang puas lebih sering melakukan uji coba (72 persen vs 51 persen di survei Capterra Inggris). Sampel dan definisi UKM tidak jelas.
- **Yankee Group via CPA Trendlines, 2006, C ⚠.** UKM menilai pendapat akuntan lebih tinggi daripada konsultan teknologi, terutama di bawah 100 karyawan. Sumber lama.
- **Vendor Indonesia memperlakukan konsultan sebagai saluran** (⚠ ringkasan pencarian, halaman belum dibuka): Kledo membayar Rp150.000 per penjualan berhasil dan memberi diskon 22 persen langganan tahunan ke yang dirujuk, Jurnal komisi sampai 15 persen, Accurate punya program "Connect & Earn" untuk konsultan. Accurate juga punya jalur sertifikasi dan implementasi (Accurate Campus, terlihat di menu halaman harga).
- **Siklus beli:** tidak ada angka yang bisa dipegang. Satu ringkasan pencarian menyebut 6 sampai 13 bulan dari sumber lama (Channel Insider), tidak dibuka, kemungkinan untuk pembelian besar ⚠. Jangan dipakai.

**Apa yang dibuktikan dulu (rangkuman).** Harga dan transparansinya, kecocokan dengan sistem lama atau cara kerja sekarang, kemudahan, dan uji coba nyata. Pembuktian lewat orang yang dipercaya (akuntan, teman) lebih sering muncul daripada ulasan resmi pada UKM kecil. Semua dari sumber di atas dan hampir seluruhnya bukan Indonesia.

### 2.4 Metodologi wawancara yang sudah baku

Catatan jujur tentang "terbukti": yang baku di sini adalah kesepakatan praktisi dan buku yang banyak dipakai, bukan eksperimen terkendali. Daftar pertanyaan yang diuji khusus untuk perangkat lunak akuntansi UKM tidak ketemu. Pertanyaan di bawah adalah pertanyaan umum dari kerangka, diterjemahkan dan disesuaikan oleh saya.

| Kerangka | Inti | Pertanyaan atau aturan contoh | Kecocokan untuk B2B kecil | Sumber, keyakinan |
|---|---|---|---|---|
| **The Mom Test** (Rob Fitzpatrick) | Tiga aturan: bicara tentang hidup mereka, bukan ideamu; tanya hal spesifik di masa lalu, bukan opini masa depan; bicara sedikit, dengar banyak. Tiga tanda data buruk: pujian, kabur ("biasanya", "akan", "mungkin"), permintaan fitur. Komitmen (waktu, reputasi, uang) dan kemajuan (langkah berikut) adalah ukuran nyata | "Bagaimana Anda menangani ini sekarang?", "Alternatif apa yang sudah Anda coba?", "Berapa biaya masalah ini bagi Anda?" (bukan "berapa mau bayar"), "Siapa lagi yang sebaiknya saya ajak bicara?", "Ada hal lain yang seharusnya saya tanyakan?". Dua orang per pertemuan (satu memimpin, satu mencatat), catatan kertas, kutip persis. Tiga pertanyaan terpenting disepakati dulu. Berhenti saat tidak ada hal baru. Kalau sepuluh orang menjawab berbeda, sempitkan segmen | Contoh buku banyak konsumen dan startup. Aturan komitmen berlaku baik. Pertanyaan tentang anggaran dan proses beli perusahaan tidak ketemu di ringkasan yang saya buka ⚠ | B (ringkasan pihak ketiga, buku tidak dibuka) |
| **Switch interview, JTBD** (Bob Moesta dan Chris Spiek) | Pindah terjadi bila dorongan (push) dan tarikan (pull) lebih besar dari kecemasan (anxiety) dan kebiasaan (habit). Wawancara menyusun ulang linimasa pembelian nyata | Wawancara orang yang pindah dalam 30 sampai 90 hari terakhir, termasuk yang hampir pindah tapi batal. Urutan: pikiran pertama, melihat pasif, peristiwa, mencari aktif, peristiwa, keputusan, beli. Prompt: "Kapan pertama kali kamu mulai memikirkan ini?", "Lalu apa yang terjadi?", "Di mana kamu waktu itu? Siapa yang bersamamu? Apa yang kamu lakukan sesudahnya?". Jangan tanya "apa kekuatan-kekuatannya"; muncul sendiri dari peristiwa. Durasi 45 sampai 90 menit. Catat frasa persis | Paling cocok untuk biaya pindah (H11) dan kelompok kontrol R7 bagian C | B |
| **Continuous Discovery Habits** (Teresa Torres) | Pisahkan pertanyaan riset (yang ingin diketahui) dari pertanyaan wawancara (yang ditanyakan). Minta cerita spesifik. Satu ringkasan per wawancara. Rutin mingguan, bukan jumlah tetap | "Ceritakan terakhir kali kamu ..." dengan cakupan disesuaikan tujuan: lebar untuk mencari peluang, sempit untuk mengoptimalkan. Untuk B2B: pembeli dan pengguna akhir adalah dua kelompok. UKM kecil sebaiknya fokus satu peran per kuartal agar tidak "bolak-balik" | Langsung relevan: pemilik (pembeli) berbeda dengan kasir dan gudang (pengguna) | B |
| **Customer Development** (Steve Blank) | Keluar gedung, uji hipotesis tentang siapa pelanggan, masalah, solusi, harga. Pendiri sendiri yang bertanya | Ringkasan kuliah CMU: tatap muka paling baik, sekitar 15 menit, 5 sampai 7 pertanyaan, dilarang membahas idemu, siapkan lima pertanyaan utama dan cadangan ⚠ | Cocok untuk cegat singkat (warung, bengkel) sebelum wawancara panjang | B (halaman Kauffman), ⚠ (rincian 15 menit dari ringkasan pencarian) |
| **Follow-Me-Home** (Intuit, Scott Cook) | Amati pelanggan memakai produk di tempatnya. Intuit percaya pelanggan sering tidak menyadari atau tidak melaporkan masalah saat diminta mengingat | Duduk di sebelah pemilik saat mereka mengerjakan rekap atau tutup buku | Cocok: pembukuan kecil, kebiasaan yang sudah "mengendap" | ⚠ ringkasan pencarian (blog Intuit dan Business Insider) |

**Bias sopan di wawancara Indonesia (R7 menyebut "jawabannya terlalu sopan").** Tidak ketemu studi yang meneliti istilah seperti "sungkan" atau "ewuh pakewuh" dalam bias survei. Yang ada hanya studi bias keinginan sosial berskala kecil di psikologi dan hotel Indonesia (B). Jadi mitigasi di §5 adalah praktik yang masuk akal, bukan temuan terbukti.

### 2.5 Offline dan konektivitas lapangan, WhatsApp sebagai alat bisnis

| Topik | Temuan | Kunci |
|---|---|---|
| Penetrasi internet | APJII 2025: 80,66 persen (sekitar 229 juta), naik dari 79,50 persen; Jawa 84,69 persen, Maluku dan Papua 69,26 persen; 8.700 responden di 38 provinsi. Pemerataan masih jadi masalah. Tidak ada data kualitas sinyal atau perbandingan kota dan desa di artikel yang saya buka | B (media, laporan 131 halaman tidak dibuka) |
| Desa tanpa sinyal 4G | Direktur Utama BAKTI Komdigi, 10 Desember 2025: 2.121 desa di wilayah 3T "blankspot", artinya 0 persen cakupan 4G. Ringkasan lain: sekitar 2.000 desa (Agustus 2026, kebanyakan Papua) dan 12.500 desa (Juli 2025). Definisi berbeda, belum ada pernyataan resmi yang menyelaraskan | B untuk 2.121 (dibuka), ⚠ untuk dua lainnya |
| Kualitas jaringan | Opensignal punya laporan Indonesia (terbaru Juli 2026) tetapi 403 saat dibuka, jadi tidak ada angka ketersediaan dan kualitas yang saya pegang. Angka 4G yang muncul di ringkasan pencarian berasal dari 2019 dan tidak dipakai | ⚠ |
| Studi offline-first di Indonesia | Hanya artikel praktisi, satu studi aplikasi web belajar jarak jauh offline-first di Gunungkidul (52 siswa dan guru, bukan lapangan usaha), dan portofolio vendor tentang pelaporan tambang batu bara (swalaporan). Tidak ada studi terukur untuk pekerja lapangan UKM | ⚠ C |
| Studi Asia lain yang menyentuh | Thailand 2022: internet lambat di desa dan tidak punya komputer atau internet menghambat adopsi (A). Badung 2026: internet lemah menghambat (B) | A, B |
| WhatsApp di Indonesia | We Are Social Digital 2026: sembilan dari sepuluh orang Indonesia aktif tiap bulan, rata-rata 1 jam 52 menit per hari (persentase terhadap penduduk, bukan pengguna internet) | B |
| WhatsApp dan bisnis kecil | Meta Indonesia (WhatsApp MSME Summit, 27 Juni 2023, kutipan detikInet): "dua pertiga UKM di Indonesia mengatakan WhatsApp membantu bisnis mereka" dari survei singkat Meta; 89 persen warga Indonesia mengirim pesan ke bisnis minimal seminggu sekali (survei Meta). Laporan Meta dan BCG "5 Business Messaging Success Factors from Indonesia's Industry Leaders": survei 400 bisnis dan wawancara 30 lebih pemimpin industri, 9 dari 10 konsumen Indonesia lebih suka berkirim pesan dengan bisnis. Tahun terbit tidak tertulis di halaman, laporan lengkap tidak dibuka | C (vendor) |
| WhatsApp sebagai sistem pencatatan internal | Tidak ketemu survei. Klaim "alur kerja ada di WhatsApp" di R4 §3.1 nomor 5 tetap penalaran, belum temuan | belum terdokumentasi |

**Kesimpulan.** Data publik menunjukkan sebagian besar penduduk online dan memakai WhatsApp. Data publik tidak menjawab dua hal yang dibutuhkan hipotesis 6 (offline) dan R4 §3.1 nomor 5 (WhatsApp sebagai alat kerja): seberapa sering sinyal putus **di titik kerja** (gudang, pasar, proyek, basement) dan apakah WhatsApp dipakai untuk mencatat transaksi dan stok. Keduanya harus ditanyakan.

## 3. Pertanyaan R7 yang sudah terjawab oleh sumber publik

"Terjawab" di sini berarti sudah ada patokan publik, jadi waktu wawancara bisa dipakai untuk hal lain. Tidak ada yang terjawab penuh untuk Indonesia.

| Bagian R7 | Yang sudah ada di sumber publik | Keyakinan | Saran |
|---|---|---|---|
| §7 "Berapa yang kamu keluarkan per bulan untuk alat-alat itu?" | Patokan harga paket terendah aplikasi akuntansi, POS per outlet, HR per karyawan (§2.2). Pengeluaran **mereka** tetap harus ditanyakan | A | Tetap tanya angka mereka. Pakai tabel §2.2 hanya sebagai pembanding saat sintesis. Jangan tampilkan harga vendor saat wawancara sebagai umpan |
| §7 "Kalau harganya per orang, bagaimana?" | Di aplikasi akuntansi Indonesia kursi tambahan murah dan yang mengikat batas user, cabang, gudang, outlet, faktur (§2.2.4) | A untuk sisi penawaran | Ganti dengan cerita nyata: kapan terakhir kamu menambah atau menahan akses, dan kenapa. Lihat §5 butir 1 |
| §7 "Siapa yang memutuskan membeli?" | Pemilik memutuskan, akuntan, teman, konsultan memengaruhi (Thailand A, SMB Group B) | A, B | Satu baris verifikasi saja, selebihnya ambil dari linimasa pembelian terakhir |
| §7 "Apa yang harus terbukti dulu?" | Uji coba gratis lazim, lalu harga, kecocokan sistem lama, kemudahan (Thailand, SMB Group, Gartner DM ⚠) | A, B, ⚠ | Jangan tanya sebagai opini. Tanya: "Sebelum bayar terakhir kali, apa yang kamu cek atau coba?" |
| §3 "Pernah coba aplikasi lain? Kenapa berhenti?" | Alasan umum: kebiasaan, pengetahuan dan pelatihan kurang, internet, kerumitan, biaya (§2.1). Tidak ada cerita rinci | B | Tetap tanya, dengan kerangka Switch (§5 butir 1 dan 2) |
| §5 "Sinyal di lokasi bagaimana?" | Angka nasional dan desa 0 persen 4G (§2.5) | B | Tetap tanya titik kerja, ini yang tak terdokumentasi |
| Hipotesis 3 (ubah status dan kolom sendiri) | Custom field, custom report, custom invoice, dan approval adalah add-on atau paket atas di Jurnal dan Kledo | A (sisi penawaran) | Sinyal pasokan sudah kuat. Wawancara fokus ke kejadian: pernah minta ubah hal kecil, berapa lama atau mahal |
| Hipotesis 5 (per kursi menghalangi) | Lihat §2.2.4 butir 1 | A (penawaran) | Persempit menjadi "unit mana yang menahan akses" |
| Hipotesis 9 (izin per cabang atau nilai) | Accurate menjual hak akses per cabang lewat add-on Multi Branch. Kledo: hak akses detail per user mulai Elite | A (penawaran) | Tanya apa yang disembunyikan dari staf dan caranya sekarang |
| Hipotesis 11 (takut sulit pindah) | Teori (Chang 2020, A). Satu survei vendor Inggris 42 persen takut data historis hilang (C). Belum ada angka Indonesia | A, C | Tetap diuji, terutama di kelompok kontrol bagian C |
| Hipotesis 6 (offline penting) | Tidak terjawab (§2.5) | | Tetap diuji |
| Hipotesis 1 (mulai dari Excel sendiri) | Thailand: dua kelompok adopter, salah satunya pengguna Excel pindah ke perangkat lunak daring. Kledo dan Jurnal menawarkan impor data dan pendampingan. Itu bukan bukti permintaan | A, A | Tetap diuji |
| Hipotesis 8 (laporan lari ke Excel) | Tidak terjawab. Custom report berbayar di Jurnal hanya petunjuk | | Tetap diuji |
| B §4 "Mana yang kamu suruh klien pindah? Kenapa?" | Vendor membayar komisi ke konsultan (⚠). Rekomendasi akuntan bisa terpengaruh | ⚠ | Tambah pertanyaan keterbukaan (§5 butir 11) |
| A §6 "Berapa biaya akuntan?" | Hanya harga etalase jasa terkemas vendor (Majoo, Zahir) | A (penawaran) | Tetap tanya biaya nyata |

## 4. Yang masih belum terdokumentasi dan harus ditanyakan

1. **Biaya pindah nyata di UKM Indonesia.** Jam dan rupiah untuk memindahkan saldo awal, stok, piutang, daftar pelanggan dari Excel atau buku ke aplikasi. Siapa yang mengerjakan, apa yang tidak ikut. Tanya lewat linimasa pembelian terakhir dan wawancara bagian C. Catat jam, bukan perkiraan.
2. **Cerita berhenti.** Aplikasi mana, berapa bulan, pemicu persisnya, apa pengganti. Tidak ada data churn publik. Paling berharga: yang membayar langganan tetapi tim kembali ke Excel ("ditinggalkan diam-diam", R4 §4.3).
3. **Siapa memutuskan di UKM Indonesia 5 sampai 50 orang.** Pemilik, pasangan atau anak, akuntan luar, atau reseller. Apakah akuntan eksternal pernah menyarankan atau menolak aplikasi. Peran Accurate Campus, mitra implementasi, dan program referral.
4. **Siklus beli dalam hari.** Dari pikiran pertama sampai bayar pertama, dan sampai dipakai rutin. Tidak ada angka Indonesia.
5. **Unit harga yang diterima.** Kebiasaan bayar (bulanan atau tahunan, transfer, kartu, cicilan seperti opsi Tokopedia di Jurnal), kepekaan terhadap PPN yang belum termasuk, apakah mereka pernah menahan akses karena biaya. Jangan tanya "berapa mau bayar"; tanya yang pernah dibayar dan alasan berhenti.
6. **WhatsApp sebagai sistem pencatatan.** Apa yang dicatat di grup (pesanan, bukti transfer, stok, absen), siapa yang membaca ulang, apa yang hilang.
7. **Sinyal di titik kerja.** Gudang, pasar, proyek, basement, kendaraan. Apakah pencatatan tertunda karena sinyal, dan apa yang dilakukan (foto, catat di kertas, tunggu).
8. **Pengguna harian.** Kasir, admin gudang, sales lapangan, mandor. Tidak ada sumber yang mewawancarai mereka. Apa yang membuat mereka mau mengetik atau tidak (R4 §2.7).
9. **Permintaan nyata untuk custom field, status, izin, dan persetujuan.** Kejadian terakhir yang diminta diubah, siapa yang menolak atau menagih, berapa lama.
10. **Impor dari Excel.** Apakah Excel mereka bersih atau berantakan, siapa yang menjaga, kolom apa yang dianggap suci.
11. **Perilaku laporan.** Apakah laporan bawaan dipakai atau diekspor ke Excel tiap bulan, dan oleh siapa.
12. **UKM menengah (20 sampai 200 orang).** Panitia pembelian dan siklus. Satu ringkasan pencarian (survei Bredin, Amerika) menyebut panitia pembelian membesar ⚠, tidak ada data Indonesia.
13. **Harga yang tidak dipajang** (Talenta, Jurnal 360, Olsera resmi, Majoo Prime+). Hanya didapat dengan meminta penawaran, bisa dilakukan sebagai "pembeli misterius" yang jujur bila perlu.

**Daftar kerja lanjutan khusus bagian ini.** (a) Buka laporan Opensignal dan laporan Meta/BCG lewat browser biasa. (b) Buka ulang Gartner Digital Markets 2025 untuk sampel dan definisi UKM. (c) Buka halaman referral Kledo, Jurnal, Accurate langsung. (d) Cek jurnal Hamzah dkk. 2023 (DOI 10.24912/ja.v27i3.1520 menurut ringkasan ⚠) dan studi Denpasar (cloud accounting, 90 responden menurut ringkasan ⚠). (e) Cari data churn lewat ulasan Google Play berbintang 1 sampai 2 (tetap di daftar R4). (f) Cari rilis resmi Mekari atau Katadata Insight Center tentang pembukuan UMKM dengan kata kunci lain.

## 5. Perbaikan metode untuk panduan R7

Yang sudah bagus di R7 dan dipertahankan: aturan 1 sampai 7, campuran pemakai aplikasi, Excel, dan buku, kelompok kontrol yang pernah berhenti, "tanyakan tindakan bukan janji", ambang "berulang minimal 3 kali". Berikut perubahan yang saya usulkan, urut dari yang paling berdampak. Semua ditulis sebagai usulan; R7 belum diubah.

1. **Ganti inti bagian 7 dengan linimasa pembelian terakhir** (Switch interview, Mom Test aturan 2). Bagian 7 sekarang bertanya "kalau harganya per orang, bagaimana?" dan "apa yang harus terbukti dulu?". Dua-duanya masa depan dan hipotetis, melanggar aturan 1 R7. Rumusan pengganti: "Ceritakan alat terakhir yang kamu bayar atau ganti (kasir, aplikasi, langganan apa pun). Kapan pertama kali kepikiran? Apa yang terjadi? Siapa yang ikut? Apa yang kamu coba atau lihat sebelum bayar? Apa yang hampir membuatmu batal? Berapa hari dari kepikiran sampai bayar, dan sampai dipakai rutin?" Urutan Switch: pikiran pertama, melihat pasif, peristiwa, mencari aktif, peristiwa, keputusan, beli, mulai pakai. Catat tanggal kasar dan nama orang (disamarkan).
2. **Kode empat kekuatan sesudah wawancara, jangan ditanyakan** (JTBD). Dorongan (push), tarikan (pull), kecemasan (anxiety), kebiasaan (habit). Tambah lembar pengodean per wawancara. Ini cara menguji hipotesis 11 (takut pindah = kecemasan) dan 1, 2, 3 (tarikan) dengan perilaku, bukan opini.
3. **Rekrut kelompok kontrol lebih banyak dan lebih segar.** Switch interview menyarankan yang pindah atau berhenti dalam 30 sampai 90 hari terakhir, termasuk yang hampir pindah lalu batal, karena ingatan memudar. R7 menargetkan hanya 2 sampai 3 orang. Naikkan ke 5 bila bisa (campur: berhenti dari aplikasi akuntansi, berhenti dari POS, hampir pindah). Kalau mereka berhenti lebih dari 90 hari, tetap diambil tetapi catat "ingatan lama".
4. **Tambahkan kelompok pengguna harian** (Torres: pembeli dan pengguna akhir berbeda). R7 hanya mewawancarai pemilik, manajer, akuntan. R4 §2.7 menduga akar kegagalan adopsi justru di orang yang mengetik. Tambahkan 4 sampai 5 kasir, admin gudang, sales lapangan, atau mandor, di putaran kedua setelah putaran pemilik selesai (jangan bolak-balik terus). Pertanyaan inti: "Ceritakan terakhir kali kamu mencatat X hari ini, dari awal sampai selesai. Apa yang menyulitkan? Apa yang kamu dapat dari mencatat?"
5. **Tambah pengamatan, bukan hanya cerita** (Intuit Follow-Me-Home). Aturan 3 R7 "minta lihat" dikembangkan jadi "lihat dikerjakan": di 3 sampai 5 tempat, duduk 30 sampai 60 menit saat mereka merekap harian atau menutup bulan. Orang tidak melaporkan masalah yang sudah mengendap jadi kebiasaan. Catat apa yang dibuka, dalam urutan apa, dan di mana mereka berhenti.
6. **Pisahkan "wajib" dan "kalau sempat".** Bagian A memuat sekitar 40 pertanyaan untuk 45 sampai 60 menit. Mom Test menyuruh menyepakati tiga pertanyaan terpenting; Blank memakai 5 sampai 7 pertanyaan; Torres satu cerita. Usul lima wajib: (a) transaksi terakhir dari awal sampai uang masuk (§2), (b) kejadian salah terakhir beserta biaya (§4), (c) cerita pindah atau berhenti (§3), (d) linimasa pembelian terakhir (butir 1), (e) pengeluaran alat sekarang (§7). Sisanya diambil bila waktu ada.
7. **Komitmen bertingkat, bukan satu ajakan** (Mom Test: waktu, reputasi, uang). "Mau ikut uji coba 2 minggu dengan data nyata?" meminta komitmen besar untuk produk yang belum ada. Pakai tangga: (a) waktu: sesi kedua 30 menit untuk melihat Excel mereka bersama atau mock layar; (b) reputasi: memperkenalkan akuntan atau pemilik lain, atau mengirim contoh berkas disamarkan; (c) uang: uji coba berbayar kecil atau pesan di muka saat produk sudah ada. Catat komitmen tertinggi yang benar-benar terjadi per wawancara. Permintaan yang ditolak juga informasi. Yang gagal hanya tidak pernah meminta.
8. **Buka dengan bingkai lima bagian dan pakai dua orang** (Mom Test): visi (kami mencoba memahami masalah, bukan menjual), bingkai (tahap kami), kelemahan (Anda bisa membantu satu hal spesifik), podium (mengapa Anda yang paling tahu), permintaan (minta bantuan secara eksplisit). Satu memimpin, satu mencatat di kertas atau laptop. Ini juga membantu izin rekam (aturan 6 R7) karena catatan kertas lebih diterima pemilik yang segan direkam.
9. **Ringkasan satu halaman per wawancara** (Torres, interview snapshot). Selaraskan "Setelah wawancara" R7 dengan kolom: profil singkat, kutipan persis, 3 kejadian dengan biaya, alat, kekuatan empat arah (butir 2), komitmen tertinggi (butir 7), hipotesis didukung atau dibantah, dan **dasar bukti**: dilihat langsung (berkas atau layar) atau hanya cerita. Hipotesis yang hanya didukung cerita diberi bobot lebih kecil.
10. **Hitung pengulangan per segmen, dan buat dua gelombang.** R7: setelah 8 wawancara, sintesis, berulang minimal 3 kali. Dengan empat industri, tiga pengulangan bisa kebetulan antar industri. Usul: gelombang 1 delapan wawancara lebar; pilih satu atau dua industri; gelombang 2 lima wawancara dalam industri itu. Mom Test: kalau sepuluh orang menjawab berbeda, sempitkan segmen; berhenti saat tidak ada hal baru. Torres menekankan ritme mingguan daripada jumlah total.
11. **Keterbukaan di wawancara akuntan.** Vendor membayar komisi ke konsultan (⚠). Tambahkan di B: "Apakah Anda atau kantor Anda mendapat komisi atau insentif dari aplikasi yang Anda rekomendasikan?" dan "Kapan terakhir Anda menyarankan klien tidak memakai aplikasi, dan kenapa?" Catat jawabannya sebagai pengakuan, bukan fakta.
12. **Tangani sungkan lewat desain, bukan asumsi.** Tidak ada sumber terbukti (§2.4). Praktik: minta berkas dan layar, bukan pendapat; tanya kejadian dan angka kecil yang bisa diperiksa silang; tanya "orang lain di usahamu bagaimana mengerjakannya?"; ucapkan "kami belum punya produk, yang membantu justru kalau Anda bilang apa yang salah"; usahakan pewawancara yang tidak dikenal pemilik. Hindari pertanyaan ya atau tidak.
13. **Tanya pengeluaran dan unit harga mereka sendiri, bukan kesediaan membayar** (Mom Test: tanya biaya masalah). Tambahkan: "Terakhir kali kamu melihat harga aplikasi seperti ini, apa yang kamu lakukan sesudahnya?" dan catat unit yang mereka pakai sendiri saat bicara harga: per outlet, per bulan, per tahun, per orang, per cabang. Pasar Indonesia sudah memakai unit berbeda tergantung produk (§2.2.3), jadi unit yang spontan mereka sebut adalah data.
14. **Tambah satu blok pertanyaan titik kerja untuk hipotesis 6.** "Ceritakan terakhir kali sinyal membuatmu tidak bisa mencatat atau mengirim sesuatu. Di mana? Apa yang kamu lakukan? Berapa lama sampai terkirim?" Tanya di lokasi bila bisa.
15. **Saring sebelum jadwal (Blank).** Untuk menjaring industri awal cepat, sebelum wawancara panjang, lakukan cegat 15 menit dengan 5 sampai 7 pertanyaan (⚠ rincian dari ringkasan pencarian) di 10 sampai 15 tempat. Hasilnya menentukan siapa yang layak dapat wawancara 45 menit.

## 6. Daftar sumber

Format: sumber, tautan, keyakinan. Tanggal buka 12 Oktober 2026 kecuali dinyatakan lain.

### Halaman harga (vendor, A untuk fakta etalase)
- Mekari Jurnal: https://www.jurnal.id/id/pricing/ (A, mentah)
- Accurate Online: https://accurate.id/harga/ (A, mentah)
- Kledo: https://kledo.com/harga/ dan https://kledo.com/ (A, mentah)
- Zahir Online: https://zahironline.com/harga (A, mentah)
- Majoo: https://majoo.id/harga (A, mentah)
- Moka: https://www.mokapos.com/harga (A, mentah)
- Mekari Talenta: https://talenta.co/harga (A, tidak ada harga)
- Gadjian: https://www.gadjian.com/pricing (A, mentah)
- BukuWarung: https://bukuwarung.com/ (A, lewat ringkasan)
- Airtable: https://airtable.com/pricing (A, mentah)
- Notion: https://www.notion.com/pricing (A, mentah)
- monday.com: https://monday.com/pricing (A, mentah)
- Odoo: https://www.odoo.com/pricing (A, mentah)
- Zoho Books (edisi AS): https://www.zoho.com/us/books/pricing/ (A, mentah)
- Olsera (pesaing yang mencatat): https://www.take.app/alternatives/olsera (C ⚠)
- Pembanding Kledo dan Jurnal: https://quasa.io/id/media/jurnal-atau-kledo-selisih-harga-besar-tetapi-gudang-bisa-membalik-pilihan (C ⚠, ringkasan pencarian)
- Program referral: https://kledo.com/referral-program/ , https://www.jurnal.id/id/partnership/referral/ , https://accurate.id/ace/ (⚠, ringkasan pencarian, belum dibuka)

### Adopsi dan biaya pindah
- UKM Thailand, akuntansi cloud: https://pmc.ncbi.nlm.nih.gov/articles/PMC9209838/ (A, dibaca 100.000 dari 125.000 karakter)
- Chang 2020, switching to cloud ERP: http://www.emerald.com/jeim/article/33/3/600-626/197895 (A, DOI 10.1108/JEIM-06-2019-0148)
- Gardiner dan Andoh-Baidoo 2019: https://aisel.aisnet.org/hicss-52/os/enterprise_system_integration/4 (B, abstrak)
- Badung 2026: https://journal.ipm2kpe.or.id/index.php/COSTING/article/view/18575 (B)
- Padang 2023: https://akuntansi.pnp.ac.id/jam/index.php/jam/article/download/238/147 (B)
- Banyumas 2025: https://tekmapro.upnjatim.ac.id/index.php/tekmapro/article/view/880 (B)
- Can Tho 2025: https://vjol.info.vn/tcdhnamcantho/article/view/115194 (B)
- Hamzah dkk. 2023 (Jurnal Akuntansi): https://doaj.org/article/4ec66f0f421a4711961bce3282e9efc1 (⚠, 403)
- Denpasar, cloud accounting: https://jra.politala.ac.id/index.php/JRA/article/view/139/64 (⚠, hanya judul terbaca)
- Studi Malaysia (UUM) dan Vietnam (VJOL): https://etd.uum.edu.my/12155/ , https://vjol.vista.gov.vn/isscr/en/article/view/78042 (⚠)
- Tesis Taiwan 303 perusahaan: https://etd.lib.ncu.edu.tw/detail/5c916f41f1a7b5de4f60f8ced9159a90 (⚠)
- Survei iplicit: https://www.iplicit.com/blog/five-good-reasons-for-not-switching-accounting-software (C)
- Bench Accounting tutup: https://blog.accountingprose.com/bench-accounting-shuts-down (C ⚠)
- Studi lokal pembukuan UMKM (ringkasan pencarian): https://journal.universitaspahlawan.ac.id/index.php/cdj/article/download/36055/23662/119239 (⚠)

### Pembelian
- SMB Group, 2024 SMB Technology Buying Journey: https://smb-gr.com/wp-content/uploads/2024/08/2024-SMB-Buying-Journey-Final.pdf (B)
- SMB Group bagian dua: https://smb-gr.com/wp-content/uploads/2024/10/The-SMB-Technology-Buying-Journey_Part-Two_final.pdf (B)
- Gartner Digital Markets 2025: https://gcom.pdo.aws.gartner.com/en/digital-markets/insights/2025-software-buying-trends (⚠, 403 saat dibuka)
- CPA Trendlines 2006 (Yankee Group): https://cpatrendlines.com/2006/07/24/cpas-needed-on-the-technology-frontline/ (C ⚠)
- Bredin via Channel Dive: https://www.channeldive.com/news/smb-purchasing-is-slowing-partners-can-help-bredin-cloud9/826400/ (⚠)

### Metodologi
- Mom Test (ringkasan buku): https://mtlynch.io/book-reports/the-mom-test/ (B). Buku: Rob Fitzpatrick, The Mom Test (2013), tidak dibuka
- Torres, pertanyaan wawancara: https://www.producttalk.org/best-customer-interview-questions/ (B)
- Torres, siapa yang dihitung pelanggan: https://www.producttalk.org/who-counts-as-a-customer/ (B)
- Torres, interview snapshot: https://www.producttalk.org/interview-snapshot.md (⚠ ringkasan pencarian)
- Switch interview: https://jobstobedone.org/switch-interview/ (B)
- Pull dan anxiety: https://jobstobedone.org/radio/pull-and-anxiety/ (B)
- Customer Development (Kauffman): https://www.entrepreneurship.org/learning-paths/the-lean-approach/getting-out-of-the-building-customer-development (B)
- Deck CMU tentang customer discovery: https://www.cmu.edu/swartz-center-for-entrepreneurship/assets/connects-fall-2019/customer-discovery.pdf (⚠ ringkasan pencarian)
- Intuit Follow-Me-Home: https://blogs.a.intuit.com/?p=32419 , https://www.businessinsider.in/intuits-cfo-wants-to-follow-you-home-and-watch-you-work/articleshow/50211513.cms (⚠ ringkasan pencarian)
- Bias keinginan sosial di Indonesia: https://journal.uii.ac.id/Psikologika/article/view/8426 (⚠ ringkasan pencarian)

### Offline, konektivitas, WhatsApp
- APJII 2025 lewat Selular.ID: https://selular.id/2025/08/apjii-penetrasi-internet-indonesia-capai-8066-di-2025/ (B). Laporan: https://goodstats.id/publication/survei-penetrasi-internet-dan-perilaku-pengguna-internet-2025-7SF3g (⚠, tidak dibuka)
- BAKTI, 2.121 desa blankspot: https://finance.detik.com/berita-ekonomi-bisnis/d-8252690/duh-komdigi-ungkap-2-121-desa-blankspot-belum-teraliri-internet (B)
- Desa blankspot lain: https://investortrust.id/national/112616/sebanyak-2000-desa-di-indonesia-masih-blankspot-mayoritas-di-papua , https://investortrust.id/business/71813/bye-bye-blank-spot-kemenkomdigi-gandeng-operator-hidupkan-12500-desa-tanpa-sinyal (⚠)
- Opensignal Indonesia: https://insights.opensignal.com/reports/2026/07/indonesia/mobile-network-experience , https://insights.opensignal.com/reports/2025/12/indonesia/mobile-network-experience (⚠, 403)
- We Are Social, Digital 2026 Indonesia: https://wearesocial.com/id/blog/2025/11/digital-2026-top-digital-and-social-media-trends-in-indonesia/ (B)
- Meta dan BCG, business messaging Indonesia: https://whatsappbusiness.com/resources/resource-library/business-messaging-indonesia-bcg/ (C, halaman saja)
- WhatsApp MSME Summit 2023 (detikInet): https://inet.detik.com/cyberlife/d-6795612/jurus-whatsapp-business-raup-200-juta-pengguna-dalam-5-tahun (B untuk kutipan, C untuk angka vendor)
- Offline-first, belajar jarak jauh Gunungkidul: https://openjournal.unpam.ac.id/index.php/informatika/article/download/53720/30040/159028 (⚠)
