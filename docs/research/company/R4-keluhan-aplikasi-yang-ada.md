# R4. Keluhan pengguna terhadap aplikasi manajemen perusahaan yang sudah ada

Tanggal riset: 7 Oktober 2026. Bagian 3 dari riset arah baru (platform manajemen perusahaan yang sangat fleksibel, fokus Indonesia, pola global).

## 0. Cara membaca dokumen ini, dan batasnya

Tiga hal perlu dibaca dulu supaya klaim di bawah tidak dipakai berlebihan.

1. **Kutipan.** Banyak halaman ulasan (G2, Reddit, Google Play) tidak bisa dibuka langsung dari lingkungan riset ini (G2 mengembalikan 403, Reddit tidak muncul di hasil pencarian). Isi halaman didapat lewat ringkasan otomatis. Karena itu, teks dalam tanda kutip hanya dipakai bila ringkasan menyebutnya sebagai kutipan langsung, dan tetap ditandai ⚠ (belum dicocokkan kata per kata). Sisanya ditulis sebagai **parafrase**.
2. **Bias sumber.** Sebagian besar artikel "kekurangan produk X" di Indonesia ditulis vendor pesaing atau konsultan reseller (HashMicro, Gadjian, Nutapos, Kaspoint, Equiperp, dan sejenisnya). Mereka punya kepentingan. Pola keluhannya masih berguna, angka dan nada kerasnya tidak. Ditandai "sumber berkepentingan".
3. **Angka kegagalan ERP.** Hampir semua angka berasal dari blog konsultan yang mengutip Gartner, Panorama, Standish atau McKinsey tanpa tautan ke laporan asli. Semuanya ⚠ sampai laporan asli dibaca.

Yang belum tercakup: Reddit (r/smallbusiness, r/erp, r/Accounting, r/indonesia), forum SAP, ulasan App Store, dan Qiscus/Medium. Yang tersedia hanya Hacker News, forum Frappe, G2/Capterra lewat ringkasan, dan blog. Bagian 7 memuat daftar kerja lanjutan.

## 1. Ringkasan inti

- Keluhan paling sering bukan "fitur kurang". Keluhannya: **sistem tidak mau berubah mengikuti cara kerja kita, dan sekali mau berubah harganya mahal dan harus lewat pihak ketiga.**
- Dua kutub yang sama-sama gagal. ERP besar (SAP B1, NetSuite, Dynamics) terlalu kaku di inti dan mahal di tepi. Alat fleksibel (Notion, Airtable, monday, ClickUp, Excel) terlalu bebas: tidak ada akuntansi, tidak ada audit, tidak ada pajak, lambat bila data besar, dan harga per kursi naik cepat.
- Aplikasi Indonesia (Accurate, Jurnal, Zahir, Kledo) bagus untuk pajak dan pembukuan lokal, tetapi sempit: akuntansi di tengah, modul lain menempel. Laporan dan tampilan sulit diubah, payroll dan operasional terpisah.
- UMKM bertahan di Excel, WhatsApp dan buku tulis karena **biaya pindah dirasakan lebih besar daripada biaya masalah sekarang**, dan karena aplikasi yang pernah dicoba menambah pekerjaan pencatatan.
- Angka kegagalan ERP yang beredar (50 sampai 75 persen gagal sebagian atau seluruhnya) lemah sumbernya, tetapi penyebab yang disebut konsisten: proses bisnis tidak dipahami sebelum konfigurasi, adopsi tim, jadwal terlalu ketat, dan kustomisasi tidak terkendali.

## 2. Tema keluhan

Format tiap tema: gejala, bukti, produk yang paling sering, akar masalah, kebutuhan sebenarnya.

### 2.1 Kaku: sistem memaksa cara kerja vendor

**Gejala.** Perusahaan harus mengubah proses agar cocok dengan sistem. Bila tidak mau, harus kustomisasi.

**Bukti.**
- Ulasan SAP Business One di Capterra/G2 (ringkasan): sistem "tidak fleksibel dan tidak cocok untuk beberapa jenis bisnis", kustomisasi sulit dan mempersulit upgrade. Parafrase. https://www.capterra.com/p/153505/SAP-Business-One/ dan https://capterra.com/p/214667/SAP-Business-One/reviews/
- NetSuite: pengguna menyebut fleksibel, tetapi kustomisasi butuh "kurva belajar curam" dan keterlibatan developer. ⚠ kutipan via ringkasan. https://www.capterra.com/p/135757/NetSuite/
- Accurate Online: tampilan dan laporan tidak bisa dikustomisasi, tidak mencakup operasional penuh seperti payroll (sumber berkepentingan, ringkasan hasil pencarian dari situs perbandingan). Parafrase. https://trainingaccurate.com/blog/accurate-online-vs-software-akuntansi-lain/ , https://akuntansiterbaik.com/
- Mekari Talenta: kustomisasi payroll dan laporan terbatas, rumus gaji khusus butuh bantuan tim support. Parafrase, sumber berkepentingan (kompetitor). https://www.jibble.io/id/review/mekari-talenta
- Zoho Inventory: tidak mendukung gudang bertingkat dengan alur persetujuan, dan penerimaan barang terhadap beberapa PO sekaligus tidak bisa. Parafrase dari ringkasan G2. https://g2.com/products/zoho-inventory/reviews?page=2
- Lidl membatalkan proyek SAP bernilai sekitar 500 juta euro setelah tujuh tahun. Salah satu sebab yang dikutip: tidak mau mengubah proses agar sesuai praktik vendor, dan perbedaan metode harga. ⚠ sekunder. https://www.panorama-consulting.com/top-10-erp-failures/

**Produk paling sering dikeluhkan:** SAP B1, NetSuite, Accurate, Zoho Inventory, Talenta.

**Akar masalah.**
1. Model data inti dibuat sekali oleh vendor (dokumen penjualan, jurnal, stok) dengan asumsi industri tertentu. Bidang dan alur baru harus lewat "titik perluasan" yang sempit.
2. Logika bisnis ditulis sebagai kode, bukan sebagai data. Mengubah alur berarti mengubah kode, jadi harus programmer.
3. Vendor menjual "praktik terbaik" sebagai alasan. Sebagian benar, tetapi sebagian lagi hanya cara mengurangi biaya dukungan mereka.

**Kebutuhan sebenarnya.** Bukan kebebasan total. Pengguna ingin tiga hal: menambah bidang dan status sendiri, mengubah alur persetujuan sendiri, dan tetap mendapat jurnal akuntansi yang benar. Artinya inti yang kuat (buku besar, stok, izin) dengan lapisan konfigurasi sebagai data.

### 2.2 Kustomisasi mahal dan bergantung pada konsultan

**Bukti.**
- Odoo Community: upgrade versi bukan otomatis, menjadi proyek developer berbayar. Modul kustom sering rusak di versi baru. Satu perusahaan Odoo Enterprise v15 dengan 24 pengguna dan kustomisasi minim menerima penawaran sekitar 272 jam dari mitra. Biaya modul kustom USD 1.500 sampai 10.000 lebih, adaptasi saat upgrade USD 10.000 sampai 40.000. ⚠ angka dari blog vendor/mitra Odoo (sumber berkepentingan). https://silentinfotech.com/blog/odoo-1/odoo-community-vs-enterprise-true-cost-comparison-2026-461 , https://dev.to/webbycrownsolutions/upgrading-odoo-expensive-or-cheaper-144c
- Odoo: ada implementasi yang bergantung pada 5 sampai 15 aplikasi pihak ketiga, USD 1.000 sampai 22.500 per tahun yang tidak ada di anggaran awal. ⚠ sama, sumber berkepentingan.
- SAP B1: harga awal berbeda jauh dengan harga setelah ditambah add-on agar sesuai bisnis (sumber berkepentingan: HashMicro). https://www.hashmicro.com/blog/sap-business-one-issues/
- Business Central: implementasi dijual sebagai "inti murah", lalu ditambah pelatihan, modifikasi, integrasi, modul. Biaya naik dari USD 15.000 ke lebih dari 50.000 dan lebih dari 12 bulan. ⚠ blog mitra. https://www.powergponline.com/blog/top-10-things-customers-hate-after-moving-from-dynamics-gp-to-dynamics-365-business-central/
- Komentar Hacker News pada kasus Birmingham City Council (Oracle, sekitar 100 juta pound): orang yang pernah menjual implementasi ERP mengaku senang "melempar tagihan" ke pembeli yang tidak paham. ⚠ kutipan via ringkasan. https://news.ycombinator.com/item?id=40158424
- Komentar lain di utas yang sama (parafrase): organisasi menuntut kustomisasi agar mirip sistem lama, dan itu yang menaikkan biaya berlipat.

**Produk paling sering:** Odoo, SAP B1, NetSuite, Business Central.

**Akar masalah.** Model bisnis mitra. Vendor menjual lisensi murah, mitra mendapat uang dari jam kerja. Insentifnya adalah sistem yang butuh dikerjakan, bukan sistem yang bisa diubah sendiri. Ditambah: kustomisasi berupa kode yang menyentuh inti sehingga setiap upgrade menjadi proyek (Odoo tahunan, NAV ke BC dari C/AL ke AL).

**Kebutuhan sebenarnya.** Perubahan yang bisa dilakukan staf operasional atau orang IT satu orang, tanpa kode inti, dan tidak rusak saat sistem diperbarui. Konfigurasi harus ikut berpindah saat versi naik.

### 2.3 Terlalu rumit dan kurva belajar

**Bukti.**
- SAP B1: antarmuka lama, kurva belajar curam, sulit bagi non-akuntan. Parafrase ringkasan Capterra/G2.
- NetSuite: butuh admin khusus dan perencanaan lebih banyak dari perkiraan. Parafrase.
- Notion: terlalu banyak fitur membuat pengguna kewalahan. Parafrase. https://unstar.app/blog/productivity-app-reviews-what-power-users-complain-about-2026 (blog agregator, ⚠ lemah)
- Penelitian akademik UMKM: pencatatan di aplikasi dianggap kurang praktis, sebagian pemilik kembali ke buku tulis. Parafrase, tinjauan pustaka tesis. http://repo.darmajaya.ac.id/18270/5/BAB%20II.pdf (PDF tidak terbaca otomatis, kalimat ini diambil dari ringkasan hasil pencarian, perlu dibuka manual ⚠)

**Produk:** SAP B1, NetSuite, Notion, Odoo (bila banyak modul aktif).

**Akar masalah.** Antarmuka dirancang untuk tim yang punya spesialis (akuntan, purchasing). Satu layar menampilkan semua bidang yang mungkin, karena sistem tidak tahu peran dan konteks pengguna. Bahasa istilah akuntansi bocor ke pengguna non-akuntan (debit, kredit, PO, GRN).

**Kebutuhan sebenarnya.** Antarmuka berlapis. Pemilik toko melihat "uang masuk, uang keluar, stok". Akuntan melihat jurnal. Data dasarnya sama.

### 2.4 Tarif tidak terduga dan harga per kursi

**Bukti.**
- Airtable: tagihan tak terduga ketika memberi akses edit menambah kursi berbayar, penambahan di tengah siklus ditagih tetapi pengurangan tidak dikembalikan. Lompatan dari Team (USD 20) ke Business (USD 45 per kursi per bulan, tahunan) dan batas rekaman 50.000 ke 125.000 per basis. ⚠ angka dari blog pesaing (Baserow) dan agregator. https://baserow.io/blog/airtable-pricing , https://www.eesel.ai/blog/airtable-pricing
- NetSuite: satu studi kasus perpanjangan naik hingga hampir USD 30.000 per tahun untuk enam pengguna. ⚠ satu kasus, sumber blog. https://unanswered.io/guide/netsuite-disadvantages
- QuickBooks dan Xero: kenaikan harga berulang tanpa fitur baru. Angka "21 persen pada 2025" dan "64 persen kumulatif lima tahun" ⚠ sekunder, belum diverifikasi. https://www.merchantmaverick.com/reviews/xero-review
- Majoo: harga yang dipajang belum termasuk PPN, jadi angka perbandingan bukan yang dibayar. Moka: multi-outlet dan sinkronisasi stok antarcabang di paket lebih mahal. Parafrase, sumber berkepentingan (pesaing POS). https://www.nusantek.com/blog/moka-vs-majoo , https://news.dailysocial.id/post/mokapos-vs-majoo/
- Jurnal: sekitar Rp 5,3 juta per tahun dianggap berat bagi UMKM kecil, e-Faktur lewat Klikpajak berlangganan terpisah, tidak ada paket bulanan (komitmen minimal per kuartal). ⚠ satu blog konsultan (parafrase), harga bisa sudah berubah. https://frconsultantindonesia.com/blog/keuangan/fr-Bl31V/review-jurnal-id--mekari-jurnal--2026--kelebihan--kekurangan--dan-panduan-penggunaan (halaman ini timeout saat dibuka langsung, isi dari ringkasan pencarian)
- Zahir Online dinilai paling mahal dari empat (Kledo, Accurate, Jurnal, Zahir) menurut satu ulasan, sedangkan blog lain (trusvation) menyebut Jurnal paling mahal (Rp 299 ribu per bulan) dan Zahir paling murah (Rp 165 ribu). Dua sumber bertentangan: harga berubah cepat dan tidak bisa dijadikan fakta tetap. https://trusvation.id/software-akuntansi-umkm-jurnal-accurate-zahir/

**Akar masalah.** Harga per kursi menghukum perusahaan yang ingin semua orang ikut memakai (staf lapangan, sales, gudang). Tier dibuat memaksa naik: fitur yang dibutuhkan sehari-hari (multi-cabang, izin, API) ditaruh di tier atas. Biaya tambahan (pajak, integrasi, add-on) tidak ada di halaman harga.

**Kebutuhan sebenarnya.** Harga yang bisa diperkirakan sebelum membeli, dan tidak menghukum penambahan pengguna ringan (hanya mengisi, hanya melihat).

### 2.5 Implementasi lama dan mahal

**Bukti.**
- Panorama (laporan 2024, via blog): lebih dari 50 persen proyek melewati anggaran dan sekitar 60 persen melewati jadwal. ⚠ sekunder. https://meltingspot.io/en/blog/erp-implementation-failure-why-70-percent-of-projects-fail
- Kasus: Hershey 1999, Nike sekitar 2001, National Grid 2012, Revlon 2018, Lidl 2018, LeasePlan 2019. Rinci di bagian 4.
- Rastonbury (HN): perusahaan sejenis menyelesaikan proyek dengan 30 sampai 50 persen biaya Birmingham. Parafrase.

**Akar masalah.** (1) Implementasi dimulai dari modul, bukan dari proses. (2) Semua dikerjakan serentak ("big bang"), jadi satu kesalahan menghentikan semua. (3) Data lama harus dibersihkan di tengah proyek. (4) Tidak ada jalur kecil: pelanggan tidak bisa memulai dari satu proses dan menambah sedikit demi sedikit.

**Kebutuhan sebenarnya.** Hari pertama sudah ada nilai (satu proses jalan dalam hitungan hari), lalu bertambah. Impor data dengan pratinjau dan perbaikan.

### 2.6 Migrasi data

**Bukti.**
- Business Central: proyek dijual sebagai inti tanpa memigrasi riwayat, integrasi, kustomisasi. ⚠ blog mitra (lihat 2.2).
- Odoo: upgrade versi besar tahunan, banyak bisnis tertinggal 2 sampai 3 versi karena mahal. ⚠ sumber berkepentingan.
- ERPNext: di forum Frappe, pengguna yang pindah dari Odoo mencari sistem dengan upgrade lebih mulus, dan menanyakan resource server. Jawaban: `bench update` sederhana, namun penyiapan produksi Docker "dirancang untuk skala, bukan kesederhanaan". Parafrase, forum. https://discuss.frappe.io/t/transitioning-from-odoo-to-erpnext-deployment-and-upgrade-concerns/137481
- Coretax (Januari 2025): faktur pajak yang dibatalkan di e-Faktur Desktop masih aktif di Coretax, status PKP berbeda antara sistem lama dan baru. Parafrase. https://pajakku.com/artikel/status-faktur-pajak-di-e-faktur-dan-coretax-tidak-sinkron-begini-cara-mengatasinya , https://www.pajak.go.id/sites/default/files/2025-01/PENYELESAIAN%20ISU%20PASCAIMPLEMENTASI%20CORETAX%20DJP%20VERSI%20TANGGAL%2012%20JANUARI%202025.pdf

**Akar masalah.** Data tersimpan dalam struktur khas vendor. Ekspor biasanya tidak membawa hubungan antar data (jurnal ke dokumen ke stok). Tiap pindah sistem, pelanggan menilai riwayat tidak berharga cukup untuk dibawa, atau dibawa tetapi rusak.

**Kebutuhan sebenarnya.** Ekspor dan impor yang mempertahankan hubungan, dan pindah yang bisa dibalik. Tanpa ini pelanggan takut masuk (lihat bagian 3 soal terkunci).

### 2.7 Adopsi tim

**Bukti.**
- Rand Group (konsultan): penyebab gagal termasuk kurang pelatihan dan penolakan karyawan, dan kurang dukungan pimpinan. https://www.randgroup.com/insights/services/solution-implementation/what-percentage-of-erp-implementations-fail/
- Indonesia: resistensi perubahan karena karyawan nyaman dengan proses manual, proses bisnis tidak terdokumentasi, pelatihan kurang. Parafrase blog konsultan. https://8thinktank.com/implementasi-erp-gagal/ , https://kreasibinar.id/mengapa-implementasi-erp-gagal-9-penyebab-kritis/
- Ulasan advertorial Appverse tentang Jurnal sendiri menyebut: tanpa pemetaan proses dan pemilik yang jelas, aplikasi hanya menjadi lapisan input data tambahan. Parafrase. https://appverse.id/blog/review-mekari-jurnal-untuk-operasional-bisnis

**Akar masalah.** Orang yang memasukkan data (kasir, gudang, admin) bukan orang yang mendapat manfaat (pemilik, akuntan). Aplikasi menambah ketikan bagi mereka. Tidak ada imbalan pribadi untuk disiplin input.

**Kebutuhan sebenarnya.** Input di titik kerja (HP, scan, WhatsApp) dengan usaha paling kecil, dan pekerja langsung mendapat sesuatu (daftar tugas hari ini, slip gaji, bukti kerja).

### 2.8 Lambat

**Bukti.**
- NetSuite: "frustratingly slow" saat memuat laporan atau memproses transaksi. ⚠ kutipan via ringkasan. https://www.capterra.com/p/135757/NetSuite/
- Zahir: performa cenderung lebih lambat. Jurnal: lag untuk data besar (laporan forum komunitas, ⚠ lemah). Parafrase.
- ClickUp: lambat, lag, beku. Notion: "kuat tetapi lambat" untuk ruang kerja besar. monday: papan besar terasa berat. Parafrase dari agregator. https://unstar.app/blog/productivity-app-reviews-what-power-users-complain-about-2026 , https://www.capterra.com/p/158833/ClickUp/reviews/?rating=4
- Business Central: kustomisasi berlebihan bisa membuat lag. Parafrase.

**Akar masalah.** (1) Laporan dihitung dari transaksi mentah setiap kali dibuka, tanpa ringkasan terhitung. (2) Model data "semua adalah halaman/rekaman fleksibel" (Notion, Airtable) membuat kueri dan indeks mahal. (3) Kustomisasi menambah pemicu dan kueri di jalur transaksi.

**Kebutuhan sebenarnya.** Layar kerja harian cepat meski data bertahun-tahun, dengan laporan berat dihitung di latar.

### 2.9 Mobile buruk

**Bukti.**
- Notion mobile disebut seperti "penampil baca saja". ClickUp: ulasan negatif soal mobile sekitar 40 persen (⚠ angka dari agregator). https://unstar.app/blog/productivity-app-reviews-what-power-users-complain-about-2026
- Jurnal: sebagian fitur mobile terbatas, penagihan dan modul tertentu hanya di desktop. Parafrase, ⚠ blog konsultan.
- Moka: aplikasi memburuk setelah pembaruan, tidak bisa masuk sehingga operasional berhenti. Pesanan layanan antar masuk ke kasir beberapa jam setelah pembayaran. Parafrase, ulasan pengguna yang dikutip situs pesaing. https://www.hashmicro.com/id/blog/review-aplikasi-moka-pos/ (sumber berkepentingan)
- Talenta: absen langsung (geotag) sering error. Parafrase, sumber kompetitor.

**Akar masalah.** Aplikasi mobile dibuat sebagai tambahan setelah desktop, memakai subset fitur. Offline dan sinkronisasi sulit, sehingga banyak yang tidak menyediakan. Di Indonesia sinyal tidak merata (gudang, pasar, lapangan).

**Kebutuhan sebenarnya.** Mobile sebagai antarmuka utama untuk pekerja lapangan, dengan mode offline dan antrean sinkronisasi.

### 2.10 Laporan tidak bisa disesuaikan

**Bukti.**
- Accurate: laporan dan tampilan tidak bisa dikustomisasi (sumber berkepentingan).
- Talenta: pelaporan payroll terbatas, sebagian proses manual.
- NetSuite dan SAP: laporan khusus butuh developer atau add-on (parafrase Capterra).
- Airtable dan Excel dipilih justru karena bebas membuat tampilan sendiri. Parafrase dari tema "yang disukai" (bagian 5).

**Akar masalah.** Laporan dibuat sebagai templat tetap berdasarkan struktur tabel vendor. Alat laporan bebas (pivot, rumus) berada di luar sistem, jadi orang mengekspor ke Excel. Excel akhirnya menjadi lapisan pelaporan sungguhan.

**Kebutuhan sebenarnya.** Pengguna biasa bisa membuat pivot, filter, dan kolom hitung sendiri dari data yang sama, tersimpan dan dibagikan, tanpa mengekspor.

### 2.11 Integrasi

**Bukti.**
- SAP B1: masalah integrasi membuat pemasangan rumit. Parafrase.
- Kledo: integrasi dengan platform lain masih terbatas, rekonsiliasi bank belum sepenuhnya otomatis. Parafrase, sumber berkepentingan. https://www.paper.id/blog/tips-dan-nasihat-umkm/rekomendasi-software-akuntansi/ , https://www.bee.id/blog/rekomendasi-software-akuntansi-online-terbaik/
- ERPNext: integrasi pihak ketiga lebih sedikit (blog, ⚠ lemah). https://dev.to/chinmaybansod/comprehensive-review-of-erpnext-a-comprehensive-erp-solution-for-modern-businesses-4iio
- Jurnal: e-Faktur terpisah. Moka: pesanan layanan antar terlambat masuk. Lihat 2.4 dan 2.9.
- UMKM: data keuangan tersebar di Excel, WhatsApp, dan mesin kasir sederhana (satu tinjauan akademik, parafrase). https://ejournal.sisfokomtek.org/index.php/jpkm/article/download/3488/2427/25820

**Akar masalah.** Integrasi dibuat satu per satu oleh vendor sesuai permintaan terbanyak, bukan lewat model data dan event yang terbuka. Marketplace, bank, ekspedisi, dan pajak berubah sendiri, dan vendor tidak sanggup mengikuti semuanya.

**Kebutuhan sebenarnya.** Penghubung standar (webhook, impor CSV/bank, pemetaan bidang yang bisa diatur pengguna) dan kemampuan menambah penghubung tanpa menunggu vendor.

### 2.12 Dukungan

**Bukti.**
- NetSuite: bug dan permintaan fitur lama belum selesai, tiket bisa seminggu. ⚠ kutipan via ringkasan. https://www.capterra.com/p/135757/NetSuite/
- Zoho Books: dukungan lambat untuk masalah rumit. Parafrase dari G2. https://g2.com/survey_responses/zoho-books-review-6825996
- HashMicro: respons dukungan lebih lambat dari harapan, onboarding agak sulit (satu ulasan, parafrase). https://thecfoclub.com/tools/hashmicro-review/
- Jurnal: obrolan langsung dengan CS harus ditutup manual, kode verifikasi login lewat email mengganggu (G2, parafrase, tema kecil tetapi menunjukkan gesekan harian).

**Akar masalah.** Dukungan berjenjang: lini pertama tidak bisa memeriksa konfigurasi pelanggan, jadi masalah berputar. Konfigurasi yang unik per pelanggan (akibat kustomisasi) membuat dukungan umum tidak berguna.

**Kebutuhan sebenarnya.** Alat diagnosis sendiri (log perubahan, "kenapa angka ini begini", riwayat konfigurasi) agar pengguna tidak perlu tiket untuk hal yang bisa dilihat.

### 2.13 Terkunci vendor

**Bukti.**
- Airtable: bagi pengguna, biaya naik di skala yang sulit ditinggalkan bila data dan otomatisasi sudah ada di dalamnya. Parafrase.
- Odoo Community: pengguna merasa terpaksa membayar mitra karena upgrade sendiri terlalu sulit. ⚠ sumber berkepentingan.
- Waste Management vs SAP (2005 sampai 2010): perusahaan menggugat karena vendor dituduh melebih-lebihkan kemampuan dan menyebut kustomisasi minimal. Penyelesaian di luar pengadilan, USD 100 sampai 500 juta menurut ringkasan. ⚠ sekunder. https://www.panorama-consulting.com/top-10-erp-failures/
- Forum Frappe: orang pindah Odoo ke ERPNext salah satunya karena upgrade. Parafrase.

**Akar masalah.** Data, formula, dan alur hanya masuk akal di dalam sistem vendor. Ekspor mengubah hubungan data menjadi tabel datar. Mengganti vendor berarti mengulang implementasi.

**Kebutuhan sebenarnya.** Ekspor penuh dengan skema terdokumentasi, dan bila memungkinkan opsi hosting sendiri. Ini juga menurunkan rasa takut saat membeli.

### 2.14 Tidak cocok industri

**Bukti.**
- SAP B1 dan NetSuite: kurang cocok untuk industri sangat khusus (parafrase). https://softwareconnect.com/reviews/netsuite/
- Zoho Books dan Xero: inventaris dan payroll dasar, tidak cukup untuk manufaktur atau multi-lokasi. Parafrase. https://www.merchantmaverick.com/reviews/xero-review
- Jurnal: cocok untuk SMB yang berfokus ke Indonesia, tetapi saat bisnis bertambah rumit mungkin perlu solusi yang lebih besar. Parafrase blog konsultan.
- Accurate dinilai kuat untuk persediaan dan manufaktur, tetapi antarmuka lama (trusvation, parafrase, ⚠).

**Akar masalah.** Industri berbeda punya satuan, siklus, dan dokumen berbeda (tebusan padi, sewa alat, jam servis, sesi klinik, termin proyek). Vendor memilih kelompok target lalu memotong sisanya. "Vertikalisasi" dijual sebagai produk terpisah dengan data terpisah.

**Kebutuhan sebenarnya.** Satu inti, banyak templat industri sebagai data yang bisa dimodifikasi.

### 2.15 Pajak dan regulasi lokal tidak pas

**Bukti.**
- ERP global (NetSuite, SAP, Xero, QuickBooks) tidak membawa PPh 21 (TER), BPJS, e-Faktur/Coretax, e-Bupot, atau format NPWP/NIK secara bawaan. Ini sebagian kesimpulan dari fakta bahwa pemain lokal justru menjual hal ini sebagai keunggulan. Parafrase, inferensi, ⚠ belum diuji langsung.
- Talenta: belum mendukung integrasi langsung e-Bupot DJP untuk PPh 21 otomatis (sumber kompetitor, ⚠ bisa sudah usang). https://www.jibble.io/id/review/mekari-talenta
- Coretax sejak 1 Januari 2025: login gagal, server lambat, error saat menyimpan faktur pajak, kesulitan penandatanganan, validasi wajah untuk sertifikat digital. DJP sendiri mendata puluhan kendala. Parafrase. https://muc.co.id/id/article/teridentifikasi-djp-inilah-22-kendala-coretax-yang-dikeluhkan-wp , https://www.liputan6.com/bisnis/read/5879871/coretax-masih-diragukan-pengusaha-banyak-pertanyaan-belum-terjawab
- Jurnal: e-Faktur berlangganan Klikpajak terpisah. Parafrase.

**Akar masalah.** Aturan pajak berubah tiap tahun dan format integrasi pemerintah berubah di tengah jalan. Vendor global tidak punya alasan bisnis mengikuti pasar sekecil Indonesia. Vendor lokal mengikuti, tetapi menanggung biaya itu sebagai biaya inti sehingga fitur lain tertinggal.

**Kebutuhan sebenarnya.** Aturan pajak sebagai data yang diperbarui terpisah dari kode (tarif, kode objek pajak, format berkas), versi per tanggal berlaku, dan keluaran yang bisa diperiksa akuntan.

### 2.16 Silo antar modul

**Bukti.**
- Accurate tidak mencakup payroll. Talenta (HR) terpisah dari Jurnal (akuntansi), Qontak (CRM) juga produk Mekari yang terpisah. Parafrase, dari struktur produk. https://www.talenta.co/blog/software-hris-mekari-talenta-vs-kompetitor/
- Hershey 1999: integrasi SAP R/3, Siebel, Manugistics runtuh saat beban datang. ⚠ sekunder.
- Nike: i2 tidak terintegrasi dengan sistem yang ada. ⚠ sekunder (https://dynamics.folio3.com/blog/?p=15254, sumber berkepentingan).
- UMKM: data tersebar di Excel, WhatsApp, kasir.

**Akar masalah.** Produk dibangun atau diakuisisi terpisah, dengan data pelanggan, karyawan, dan produk masing-masing. Satu "suite" sering hanya satu login dan satu tagihan.

**Kebutuhan sebenarnya.** Satu data pelanggan, karyawan, dan barang yang dipakai semua alur, dengan perubahan di satu tempat terlihat di semua.

### 2.17 Izin akses

**Bukti.** Bukti langsung paling tipis untuk tema ini.
- Airtable: memberi akses edit menambah kursi berbayar, jadi tim membatasi akses karena biaya, bukan karena kebijakan. Parafrase. https://baserow.io/blog/airtable-pricing
- Zoho Inventory: tidak mendukung alur persetujuan sebelum barang dikeluarkan atau diterima di gudang bertingkat. Parafrase.
- Pelaporan G2/Capterra untuk SAP dan NetSuite mengakui izin sangat terperinci tetapi rumit dikonfigurasi. ⚠ kesimpulan umum, tidak ada kutipan spesifik yang saya dapat.
- Hacker News Birmingham: kota kehilangan jejak audit transaksi keuangan setelah rollout Oracle. Parafrase. https://news.ycombinator.com/item?id=40158424

**Akar masalah.** Izin biasanya berbasis modul dan peran tetap. Kebutuhan nyata bersifat kontekstual: "kepala cabang A hanya melihat cabang A, sampai Rp 5 juta, dan hanya untuk kategori ini". Alat fleksibel (Notion, Airtable) punya izin yang tidak cukup untuk keuangan, sedangkan ERP punya izin yang tidak bisa diubah oleh non-ahli.

**Kebutuhan sebenarnya.** Izin per cabang, per nilai, per bidang, dengan jejak audit, dan bisa diatur lewat antarmuka oleh pemilik bisnis.

## 3. Mengapa pengguna bertahan di Excel, WhatsApp, dan buku tulis

### 3.1 Alasan yang terdokumentasi

1. **Murah dan sudah ada.** Excel dipilih karena biayanya murah, mudah dipakai, dan bisa mengikuti kebutuhan pemilik. Parafrase dari tinjauan akademik UMKM. https://fv.um.ac.id/2025/05/merancang-aplikasi-keuangan-berbasis-microsoft-excel-pada-umkm-dealer-untung-jaya-motor/
2. **Pernah mencoba dan kecewa.** Setelah memakai aplikasi pembukuan, sebagian pemilik UMKM merasa pencatatan kurang praktis lalu kembali ke buku tulis. ⚠ parafrase dari tinjauan pustaka tesis (http://repo.darmajaya.ac.id/18270/5/BAB%20II.pdf), perlu dibuka manual.
3. **Pengetahuan akuntansi terbatas.** Pemilik tidak tahu apa yang harus dicatat atau bagaimana membaca laporan, dan transisi butuh pendampingan. Parafrase. https://tekno.kompas.com/read/2022/02/21/17450017/daftar-aplikasi-catatan-keuangan-gratis-untuk-umkm-?page=all , https://journal.steipress.org/index.php/progresif/article/download/252/110/1031
4. **Tidak ada manfaat langsung.** Pemilik kecil tidak diwajibkan laporan lengkap oleh siapa pun. Pajak UMKM berbasis omzet, jadi pembukuan lengkap tidak mengurangi pajak yang dibayar. (Penalaran saya dari aturan PPh final UMKM; angka tarif tidak saya verifikasi di riset ini ⚠.)
5. **Alur kerja sebenarnya ada di WhatsApp.** Pesanan datang lewat WhatsApp, bukti transfer lewat WhatsApp, koordinasi dengan karyawan lewat WhatsApp. Memindahkannya berarti memutus kebiasaan pelanggan juga. Ini penalaran, bukan temuan survei ⚠.
6. **Kendali.** Di Excel, pemilik bisa membuat kolom, rumus, dan tampilan sendiri tanpa izin siapa pun (lihat tema 2.1 dan 2.10).

### 3.2 Apa yang menghalangi pindah

- Biaya pindah dirasakan di muka, manfaat terlambat. Perlu input ulang data, belajar, dan jeda operasional.
- Takut kehilangan data atau salah hitung selama peralihan.
- Tidak ada orang yang bertanggung jawab. Di UMKM, pemilik adalah semua peran.
- Langganan bulanan berjalan terus, sedangkan Excel gratis.
- Aplikasi bergantung internet, padahal sinyal tidak merata (Jurnal "memerlukan koneksi stabil" menurut trusvation).
- Aplikasi gratis (BukuWarung, BukuKas, TemanBisnis) menyelesaikan satu hal, yaitu catatan utang piutang atau kas, dan berhenti di situ. https://www.idntimes.com/tech/trend/jubaedah-haryani/aplikasi-pembukuan-keuangan-gratis-umkm-c1c2

### 3.3 Risiko tetap di Excel

Penelitian Panko (1995 sampai 2004, banyak studi): sekitar 94 persen spreadsheet operasional berisi galat, dan tingkat galat sel rata-rata 5,2 persen. http://panko.shidler.hawaii.edu/SSR/Mypapers/whatknow.htm , http://mba.tuck.dartmouth.edu/spreadsheet/product_pubs_files/literature.pdf (angka dari ringkasan hasil pencarian, sumber primer akademik, ⚠ cek kebenaran angka sebelum dikutip keluar). Risiko lain: tidak ada izin akses, tidak ada jejak audit, satu orang memegang berkas, versi ganda lewat WhatsApp.

### 3.4 Implikasi desain

Pengganti Excel/WhatsApp harus (a) bisa dimulai dari berkas Excel yang ada, (b) menerima masukan dari WhatsApp tanpa memindahkan pelanggan, (c) memberi tampilan seperti tabel yang boleh diubah pemilik, (d) berjalan di HP dan offline, (e) gratis atau sangat murah di awal. Itu bukan fitur akuntansi, itu cara masuk.

## 4. Data kegagalan implementasi ERP

Semua angka di bawah berasal dari sumber sekunder, kecuali dinyatakan lain. Ketidakkonsistenan definisi "gagal" (melewati anggaran, melewati jadwal, tidak mencapai tujuan, dibatalkan) membuat angka tidak bisa dibandingkan satu sama lain.

### 4.1 Angka agregat

| Klaim | Tahun | Sumber yang mengutip | Catatan |
|---|---|---|---|
| 55 sampai 75 persen proyek ERP tidak memenuhi tujuan | tidak disebut | Gartner, via Rand Group https://www.randgroup.com/insights/services/solution-implementation/what-percentage-of-erp-implementations-fail/ | ⚠ tahun dan laporan asli tidak disebut |
| Lebih dari 70 persen inisiatif ERP baru tidak memenuhi tujuan bisnis penuh pada 2027, hingga 25 persen gagal total | prakiraan 2024 | Gartner, via hasil pencarian dan https://meltingspot.io/en/blog/erp-implementation-failure-why-70-percent-of-projects-fail | ⚠ prakiraan, bukan hasil terukur |
| Lebih dari 50 persen melewati anggaran, sekitar 60 persen melewati jadwal | 2024 | Panorama, via blog | ⚠ |
| 65 persen proyek melewati anggaran 20 persen atau lebih | 2023 | Panorama, via msdynamicsworld https://msdynamicsworld.com/story/erp-horror-stories-creeping-scope-and-ransomware-beyond-technological-grave | ⚠ |
| 73 persen proyek ERP manufaktur diskret tidak memenuhi tujuan, overrun biaya rata-rata 215 persen | 2025 | "Panorama ERP Report 2025", via hasil pencarian | ⚠ angka mencolok, perlu cek laporan |
| Dari 640 proyek: 32 persen sesuai anggaran, 27 persen tepat go-live | tidak jelas | hasil pencarian tanpa nama audit | ⚠ lemah |
| 30 sampai 35 persen organisasi melaporkan manfaat penuh | tidak jelas | hasil pencarian | ⚠ lemah |
| Sekitar 28 persen implementasi ERP gagal, 55 persen perusahaan tidak mendapat ROI yang diharapkan | tidak jelas | Panorama, via blog Indonesia (https://8thinktank.com/implementasi-erp-gagal/) | ⚠ bertentangan dengan angka lain karena definisi beda |
| Satu dari tiga perusahaan menilai implementasi ERP-nya tidak berhasil | tidak jelas | blog Indonesia, hasil pencarian | ⚠ |
| 60 persen klien Rand Group datang setelah proyek gagal di tempat lain | tidak jelas | Rand Group, pengakuan sendiri | ⚠ sumber berkepentingan |

Kesimpulan jujur: **"70 persen ERP gagal" adalah klaim yang beredar, bukan temuan yang terverifikasi.** Yang bisa dipegang: kelebihan anggaran dan jadwal adalah hal biasa, dan hanya sepertiga atau kurang yang melaporkan manfaat penuh. Untuk dokumen produk, tulis "sebagian besar proyek ERP melewati anggaran atau jadwal ⚠" dan jangan menyebut satu persen pasti.

### 4.2 Kasus bernama

| Kasus | Tahun | Biaya/dampak | Penyebab yang disebut |
|---|---|---|---|
| Hershey (SAP R/3, Siebel, Manugistics) | 1999 | pesanan sekitar USD 100 juta tidak terpenuhi, saham turun sekitar 8 persen | jadwal 48 bulan dipadatkan menjadi 30, uji dan pelatihan dipotong, go-live saat musim ramai |
| Nike (i2) | sekitar 2000 sampai 2001 | investasi USD 400 juta, kerugian penjualan sekitar USD 100 juta, saham turun sekitar 20 persen | ramalan keliru, pelatihan kurang, integrasi buruk, jadwal terlalu pendek |
| Waste Management vs SAP | 2005 sampai 2010 | penyelesaian USD 100 sampai 500 juta | klaim vendor soal kustomisasi minimal terbukti salah |
| MillerCoors | 2014 sampai 2015 | proyek dihentikan sebulan setelah go-live | 50 cacat diketahui saat go-live |
| National Grid | 2009 sampai 2014 | pemulihan sekitar USD 585 juta, 850 kontraktor | go-live dipaksakan 2012, kesalahan payroll dan faktur |
| Lidl (SAP) | 2011 sampai 2018 | sekitar 500 juta euro | tidak mau mengubah proses lama, metode harga tidak selaras |
| Revlon (SAP) | 2018 | penjualan bersih hilang sekitar USD 64 juta, rugi bersih kuartal IV USD 70,3 juta | gagal pada manufaktur dan rantai pasok |
| Haribo | 2018 | penjualan turun sekitar 25 persen (menurut sumber) | visibilitas persediaan hilang |
| LeasePlan | 2006 sampai 2019 | sekitar USD 119 juta | menggabungkan 35 sistem ke satu platform |
| Birmingham City Council (Oracle) | sekitar 2022 sampai 2024 | sekitar 100 juta pound | kustomisasi mengikuti sistem lama, audit trail hilang |
| US Navy | 1998 sampai sekarang | lebih dari USD 1 miliar | ruang lingkup berubah, manajemen proyek lemah |

Sumber untuk tabel ini: https://www.panorama-consulting.com/top-10-erp-failures/ (Panorama, konsultan ERP, berkepentingan), https://dynamics.folio3.com/blog/?p=15254, https://lemonlearning.com/blog/erp-implementation-failure, https://news.ycombinator.com/item?id=40158424. ⚠ Semua dikutip dari blog tentang kasus, bukan dari laporan keuangan perusahaan. Angka bisa berselisih antar blog.

### 4.3 Pola penyebab

Dari kasus dan blog, penyebab yang berulang:
1. Jadwal dipadatkan, uji dan pelatihan dipotong (Hershey, Nike, National Grid, MillerCoors).
2. Go-live besar sekaligus pada waktu sibuk.
3. Perusahaan tidak mau menyederhanakan proses (Lidl) atau sebaliknya memaksa sistem meniru proses lama (Birmingham).
4. Vendor menjanjikan kustomisasi minimal lalu ternyata besar (Waste Management).
5. Kebutuhan bisnis tidak dianalisis sebelum memilih sistem (blog konsultan Indonesia, tanpa angka).
6. Adopsi pengguna dan dukungan pimpinan lemah.
7. Pemilihan mitra yang keliru.

Catatan: ini semua kasus perusahaan besar. Untuk UMKM dan menengah di Indonesia, tidak ada data kegagalan yang bisa diverifikasi dalam riset ini. Kegagalan di segmen itu kemungkinan berupa "diam-diam ditinggalkan": langganan berlanjut tetapi tim kembali ke Excel. Ini hipotesis dari bagian 3, ⚠ perlu wawancara.

## 5. Yang disukai pengguna dari tiap kelas produk (jangan dibuang)

### 5.1 ERP besar (SAP B1, NetSuite, Dynamics BC)
- Satu sumber data untuk keuangan, stok, penjualan, pembelian; multi-entitas dan multi-mata uang.
- Kontrol dan jejak audit. Itu alasan auditor dan investor tenang.
- Fleksibilitas bagi yang sanggup membayar (NetSuite: "fleksibel" berulang disebut). Parafrase ulasan Capterra.
- Ekosistem add-on dan mitra yang bisa memperluas (Business Central: pengguna memuji fleksibilitas ekstensi untuk integrasi kustom). Parafrase.
- Model ekstensi AL (BC) yang tidak menyentuh kode inti, hal yang benar secara arsitektur (klaim dari blog mitra, ⚠). https://archerpoint.com/debunking-myths-surrounding-an-upgrade-to-microsoft-dynamics-365-business-central/

### 5.2 Open source (Odoo, ERPNext)
- Bisa dimodifikasi dan dihosting sendiri. Biaya awal rendah.
- Banyak modul terhubung (Odoo). ERPNext: `bench update` sederhana menurut jawaban forum, DocType yang bisa diubah dari antarmuka.
- Komunitas besar. Parafrase.

### 5.3 Akuntansi cloud global (QuickBooks, Xero, Zoho Books)
- Mudah dipakai, faktur cepat, rekonsiliasi bank otomatis, ekosistem aplikasi. Zoho Books: otomatisasi, faktur, integrasi data (G2, parafrase). https://g2.com/survey_responses/zoho-books-review-821405

### 5.4 Aplikasi Indonesia (Accurate, Jurnal, Zahir, Kledo)
- Paham pajak, format laporan Indonesia, bahasa Indonesia. Jurnal: lebih dari 40 templat laporan, integrasi bank dan marketplace (iklan Jurnal sendiri di CNBC Indonesia, advertorial, ⚠). https://www.cnbcindonesia.com/tech/20240828121455-57-567063/review-lengkap-software-akuntansi-mekari-jurnal
- Jurnal: bahasanya lebih dekat dengan cara tim Indonesia memahami masalah (advertorial Appverse, parafrase).
- Accurate: persediaan dan manufaktur kuat, multi-cabang (trusvation, ⚠). Zahir: lokal, mudah dipahami pemula, paling murah menurut trusvation. Kledo: paket gratis dan antarmuka sederhana (sumber berkepentingan).
- Jaringan akuntan dan konsultan yang sudah paham produknya, yang berarti ada orang yang bisa dimintai tolong.

### 5.5 POS dan HRIS Indonesia (Majoo, Moka, Olsera, Talenta, Gadjian)
- Kasir cepat, struk, laporan penjualan harian, integrasi pembayaran digital. Talenta: perhitungan otomatis PPh 21, BPJS, lembur, cuti.
- Gadjian: dipuji akurat untuk PPh 21 dan BPJS, revisi payroll turun (kutipan pengguna pada blog Gadjian sendiri, sumber berkepentingan, ⚠). https://www.gadjian.com/blog/2026/02/20/hris-terbaik-tepercaya/

### 5.6 Alat fleksibel (Notion, Airtable, monday, ClickUp, Smartsheet, Asana)
- Bentuk data dan tampilan bisa dibuat sendiri tanpa programmer, dalam hitungan jam.
- Tampilan ganda (tabel, papan, kalender) atas data yang sama.
- Mudah dipelajari tim yang tidak teknis, ekosistem templat besar.
- Otomatisasi sederhana dan formulir.

### 5.7 Excel dan Google Sheets
- Nol biaya belajar, paling cepat untuk "coba dulu".
- Rumus dan pivot yang dikenal semua orang. Kolaborasi di Sheets.
- Pemilik merasa memegang kendali penuh (lihat 3.1).

Pelajaran desain: yang harus dipertahankan ada tiga. Jejak audit dan satu sumber data dari ERP. Pajak dan format lokal dari aplikasi Indonesia. Model data bebas dan tampilan ganda dari Airtable/Notion. Dan satu hal yang hanya Excel punya: orang biasa bisa mengubah dan menghitung sendiri tanpa izin.

## 6. Celah pasar

Kombinasi yang tidak dilayani siapa pun (atau sangat sedikit), disusun dari tema di atas. Ini analisis saya, bukan temuan sumber. Klaim "tidak ada yang melayani" belum diuji dengan survei produk menyeluruh ⚠ dan perlu dicek ulang terhadap produk yang tidak masuk cakupan (misalnya Odoo + lokalisasi Indonesia dari mitra, HashMicro, atau ERP vertikal).

Peta kasar kelas produk terhadap lima kebutuhan:

| Kelas | Pajak dan pembukuan lokal | Model data bebas | Izin dan audit kuat | Mudah dimulai dari Excel | Mobile/offline utama |
|---|---|---|---|---|---|
| ERP besar | lemah (lokalisasi ditambah mitra) | sedang, lewat developer | kuat | lemah | lemah |
| Odoo/ERPNext | sedang (modul lokal komunitas) | sedang | sedang | lemah | sedang |
| Aplikasi akuntansi Indonesia | kuat | lemah | sedang | sedang | sedang |
| Alat fleksibel (Notion, Airtable) | tidak ada | kuat | lemah | kuat | lemah |
| Excel/WhatsApp | manual | kuat | tidak ada | n/a | sedang |

Penilaian sel di atas adalah penilaian saya dari bukti bagian 2, bukan skor terukur.

### 6.1 Sepuluh pernyataan masalah

1. **Pemilik usaha yang bisa memakai Excel tidak bisa mendapat sistem yang mulai dari berkas Excel-nya, mengubah kolom sendiri, dan tetap menghasilkan jurnal serta laporan pajak yang benar.** Mereka harus memilih antara bebas tanpa akuntansi (Excel, Airtable) atau akuntansi tanpa kebebasan (Accurate, Jurnal).
2. **Perusahaan yang sebenarnya hanya butuh satu proses berjalan dulu (misal penagihan atau stok) dipaksa membeli implementasi satu suite penuh.** Tidak ada ERP yang bisa dimulai dengan satu alur dalam hitungan hari dan tumbuh tanpa proyek ulang.
3. **Perubahan kecil seperti satu status baru, satu kolom, satu langkah persetujuan memerlukan konsultan, kode, atau tiket vendor.** Pemilik atau staf operasional tidak punya cara sah dan aman mengubahnya.
4. **Konfigurasi dan kustomisasi rusak atau perlu ditulis ulang tiap upgrade versi,** jadi perusahaan menunda upgrade dan berakhir di versi usang (Odoo, NAV ke BC).
5. **Tarif per kursi menghukum perusahaan yang ingin seluruh stafnya memakai sistem,** sehingga pekerja lapangan, kasir, dan gudang tetap memakai WhatsApp dan kertas, dan data tidak pernah lengkap.
6. **Pekerja lapangan di tempat dengan sinyal buruk tidak punya aplikasi yang bekerja penuh offline,** padahal merekalah yang menghasilkan data paling berharga (stok, kunjungan, kehadiran, pengiriman).
7. **Aturan pajak, BPJS, dan faktur pajak Indonesia berubah tiap tahun (Coretax 2025 contohnya),** sementara ERP global tidak mengikutinya, dan aplikasi lokal menanggungnya dengan mengorbankan fleksibilitas.
8. **Laporan yang dibutuhkan pemilik dibuat di Excel dari hasil ekspor, karena laporan di dalam aplikasi tidak bisa disesuaikan.** Sistem resmi menjadi sumber data, dan pengambilan keputusan terjadi di luar sistem tanpa kontrol.
9. **Izin akses tidak bisa mengikuti struktur nyata (cabang, nilai transaksi, bidang tertentu) tanpa ahli,** jadi pemilik memilih memberi akses terlalu sedikit (data tidak masuk) atau terlalu banyak (risiko).
10. **Data pelanggan, karyawan, barang, dan uang hidup di produk terpisah (HR sendiri, CRM sendiri, akuntansi sendiri, POS sendiri),** sehingga perusahaan menjadi pekerja integrasi: menyalin angka antar layar.
11. **Perusahaan tidak bisa meninggalkan vendor tanpa mengulang implementasi karena ekspor menghilangkan hubungan antar data,** jadi takut masuk dan terpaksa bertahan.
12. **Setiap industri (klinik, bengkel, kontraktor, pertanian, jasa, pabrik kecil) dijual produk vertikal terpisah dengan data terpisah,** padahal 70 persen kebutuhannya sama dan 30 persen unik. Tidak ada satu inti dengan templat industri yang bisa dimodifikasi pengguna.

(Jumlah 12 sesuai batas atas permintaan. Kalau perlu 8, yang paling tajam dan paling mudah dibuktikan dari sumber: nomor 1, 3, 4, 5, 6, 8, 10, 11.)

Catatan: "70 persen sama, 30 persen unik" pada nomor 12 adalah perumpamaan saya, bukan angka dari sumber.

### 6.2 Apa yang tidak boleh disimpulkan

- Dari keluhan tidak berarti pengguna mau pindah. Biaya pindah (bagian 3.2) tetap tinggi, jadi produk harus menurunkan biaya masuk lebih dulu daripada menambah fitur.
- Banyak keluhan datang dari pesaing. Perlu wawancara langsung 15 sampai 20 pemilik usaha (toko, bengkel, kontraktor, klinik, produksi kecil) untuk memastikan urutan prioritas.
- Fleksibel juga punya biaya: alat fleksibel menang di tahap awal lalu kewalahan di tahap besar (lambat, kursi mahal). Produk baru harus punya jawaban untuk skala (data besar, banyak pengguna) sejak awal, atau akan mengulang keluhan yang sama.

## 7. Daftar sumber dan tingkat keyakinan

Keterangan: A = kuat (primer atau akademik), B = sedang (ulasan pengguna di platform, via ringkasan), C = lemah (blog konsultan atau pesaing, agregator). ⚠ menandai klaim yang tidak boleh dikutip keluar tanpa verifikasi.

### Ulasan platform dan forum
- NetSuite, Capterra: https://www.capterra.com/p/135757/NetSuite/ (B, kutipan via ringkasan ⚠)
- SAP Business One, Capterra dan G2: https://www.capterra.com/p/153505/SAP-Business-One/ , https://capterra.com/p/214667/SAP-Business-One/reviews/ , https://g2.com/products/sap-business-one/reviews?page=10 (B)
- ClickUp, Capterra: https://www.capterra.com/p/158833/ClickUp/reviews/?rating=4 (B)
- Zoho Inventory dan Books, G2: https://g2.com/products/zoho-inventory/reviews?page=2 , https://g2.com/survey_responses/zoho-books-review-6825996 , https://g2.com/survey_responses/zoho-books-review-821405 (B)
- Jurnal Mekari, G2 (403 saat dibuka, isi dari ringkasan pencarian): https://www.g2.com/products/jurnal-mekari-jurnal/reviews (B ⚠)
- Xero, G2 dan Capterra: https://g2.com/products/xero/reviews?page=2 , https://www.capterra.com/p/120109/Xero/reviews/?page=4 (B, tidak dibuka langsung)
- Forum Frappe: https://discuss.frappe.io/t/transitioning-from-odoo-to-erpnext-deployment-and-upgrade-concerns/137481 (B)
- Hacker News, Birmingham Oracle: https://news.ycombinator.com/item?id=40158424 (B, kutipan ⚠); utas lama https://news.ycombinator.com/item?id=815077 (tidak dibaca)
- Google Play Jurnal dan BukuWarung (tidak dibuka, hanya muncul di hasil): https://play.google.com/store/apps/details?id=id.jurnal.mobile , https://play.google.com/store/apps/details?id=com.bukuwarung

### Blog, laporan, dan situs perbandingan
- Rand Group (Gartner dikutip): https://www.randgroup.com/insights/services/solution-implementation/what-percentage-of-erp-implementations-fail/ (C ⚠)
- Meltingspot: https://meltingspot.io/en/blog/erp-implementation-failure-why-70-percent-of-projects-fail (C ⚠)
- Panorama, 10 kegagalan ERP: https://www.panorama-consulting.com/top-10-erp-failures/ (C, berkepentingan)
- Folio3, Lemon Learning, MS Dynamics World: https://dynamics.folio3.com/blog/?p=15254 , https://lemonlearning.com/blog/erp-implementation-failure , https://msdynamicsworld.com/story/erp-horror-stories-creeping-scope-and-ransomware-beyond-technological-grave (C)
- Blog biaya Odoo: https://silentinfotech.com/blog/odoo-1/odoo-community-vs-enterprise-true-cost-comparison-2026-461 , https://dev.to/webbycrownsolutions/upgrading-odoo-expensive-or-cheaper-144c (C ⚠ berkepentingan)
- Power GP (BC): https://www.powergponline.com/blog/top-10-things-customers-hate-after-moving-from-dynamics-gp-to-dynamics-365-business-central/ , ArcherPoint: https://archerpoint.com/debunking-myths-surrounding-an-upgrade-to-microsoft-dynamics-365-business-central/ (C ⚠)
- Airtable: https://baserow.io/blog/airtable-pricing , https://www.eesel.ai/blog/airtable-pricing (C ⚠ pesaing)
- Agregator keluhan alat produktivitas: https://unstar.app/blog/productivity-app-reviews-what-power-users-complain-about-2026 (C ⚠)
- NetSuite harga: https://unanswered.io/guide/netsuite-disadvantages (C ⚠)
- Xero/QuickBooks: https://www.merchantmaverick.com/reviews/xero-review (C)
- HashMicro tentang SAP B1 dan Moka: https://www.hashmicro.com/blog/sap-business-one-issues/ , https://www.hashmicro.com/id/blog/review-aplikasi-moka-pos/ (C, pesaing)
- HashMicro review: https://thecfoclub.com/tools/hashmicro-review/ (C)

### Indonesia
- Jurnal: https://appverse.id/blog/review-mekari-jurnal-untuk-operasional-bisnis (advertorial, C), https://www.cnbcindonesia.com/tech/20240828121455-57-567063/review-lengkap-software-akuntansi-mekari-jurnal (advertorial, C), https://frconsultantindonesia.com/blog/keuangan/fr-Bl31V/review-jurnal-id--mekari-jurnal--2026--kelebihan--kekurangan--dan-panduan-penggunaan (C ⚠ tidak dibuka langsung), https://community.mekari.com/forums/topic/cerita-bagaimana-akhirnya-saya-memilih-jurnal-id/ (tidak dibuka)
- Perbandingan akuntansi: https://trusvation.id/software-akuntansi-umkm-jurnal-accurate-zahir/ (C), https://akuntansiterbaik.com/ (C, tidak terbuka saat dicoba), https://trainingaccurate.com/blog/accurate-online-vs-software-akuntansi-lain/ (C, reseller Accurate), https://www.paper.id/blog/tips-dan-nasihat-umkm/rekomendasi-software-akuntansi/ , https://www.bee.id/blog/rekomendasi-software-akuntansi-online-terbaik/ (C)
- POS: https://news.dailysocial.id/post/mokapos-vs-majoo/ , https://www.nusantek.com/blog/moka-vs-majoo (C)
- HRIS: https://www.jibble.io/id/review/mekari-talenta (C, kompetitor), https://www.gadjian.com/blog/2026/02/20/hris-terbaik-tepercaya/ (C, vendor), https://www.talenta.co/blog/software-hris-mekari-talenta-vs-kompetitor/ (C, vendor)
- Coretax: https://pajakku.com/artikel/status-faktur-pajak-di-e-faktur-dan-coretax-tidak-sinkron-begini-cara-mengatasinya , https://www.pajak.go.id/sites/default/files/2025-01/PENYELESAIAN%20ISU%20PASCAIMPLEMENTASI%20CORETAX%20DJP%20VERSI%20TANGGAL%2012%20JANUARI%202025.pdf (primer DJP, A, tidak dibuka penuh), https://muc.co.id/id/article/teridentifikasi-djp-inilah-22-kendala-coretax-yang-dikeluhkan-wp , https://www.liputan6.com/bisnis/read/5879871/coretax-masih-diragukan-pengusaha-banyak-pertanyaan-belum-terjawab (B), https://www.tempo.co/ekonomi/sederet-masalah-coretax-yang-sering-dikeluhkan-menurut-ditjen-pajak--1211669 (403, hanya judul)
- Kegagalan ERP Indonesia: https://8thinktank.com/implementasi-erp-gagal/ , https://kreasibinar.id/mengapa-implementasi-erp-gagal-9-penyebab-kritis/ , https://indonesiasafetycenter.org/studi-kasus-erp-di-indonesia-ini-faktor-penyebab-keberhasilan-dan-kegagalan/ (tidak terbuka) (C ⚠)
- UMKM dan Excel: https://fv.um.ac.id/2025/05/merancang-aplikasi-keuangan-berbasis-microsoft-excel-pada-umkm-dealer-untung-jaya-motor/ , http://repo.darmajaya.ac.id/18270/5/BAB%20II.pdf , https://ejournal.sisfokomtek.org/index.php/jpkm/article/download/3488/2427/25820 , https://journal.steipress.org/index.php/progresif/article/download/252/110/1031 , https://tekno.kompas.com/read/2022/02/21/17450017/daftar-aplikasi-catatan-keuangan-gratis-untuk-umkm-?page=all , https://www.idntimes.com/tech/trend/jubaedah-haryani/aplikasi-pembukuan-keuangan-gratis-umkm-c1c2 (B/C, akademik tingkat rendah)
- Galat spreadsheet: http://panko.shidler.hawaii.edu/SSR/Mypapers/whatknow.htm , http://mba.tuck.dartmouth.edu/spreadsheet/product_pubs_files/literature.pdf (A, angka via ringkasan ⚠)

### Daftar kerja lanjutan
1. Buka langsung dan kutip ulasan G2/Capterra (perlu browser biasa).
2. Cari utas Reddit (r/smallbusiness, r/erp, r/Accounting, r/indonesia) lewat akses langsung dan simpan tautan serta tanggal.
3. Baca ulasan Google Play untuk Jurnal, Accurate, Kledo, Moka, Majoo, BukuWarung, Talenta, dengan filter bintang 1 sampai 2 dan hitung tema.
4. Cari laporan primer Panorama, Gartner, dan Standish, ganti semua angka ⚠ di bagian 4.
5. Cari data resmi UMKM Indonesia (Kemenkop UKM, BPS, BI) tentang pencatatan keuangan.
6. Wawancara 15 sampai 20 pemilik usaha dan 5 akuntan/konsultan implementasi, uji 12 pernyataan masalah.
7. Cari produk yang mungkin sudah mengisi celah (Odoo Indonesia, HashMicro, ERP vertikal, Kledo) untuk memeriksa klaim bagian 6.
