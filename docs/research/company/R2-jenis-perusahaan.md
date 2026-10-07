# R2: Jenis Perusahaan di Indonesia

Riset bagian 1 untuk platform manajemen perusahaan yang fleksibel. Tanggal riset: 7 Oktober 2026. Tanda ⚠ berarti klaim belum punya sumber kuat, atau sumbernya berupa blog/berita sekunder, atau tanggal berlakunya perlu dicek ke aturan asli. Angka tanpa tahun sumber tidak dipakai.

Cara membaca: bagian 1 memberi tiga sumbu taksonomi. Bagian 2 menguraikan 21 industri. Bagian 3 adalah tabel industri × modul. Bagian 4 memisahkan inti platform dari plugin. Bagian 5 berisi sumber.

---

## 1. Taksonomi dari tiga sumbu

Satu perusahaan selalu punya tiga atribut sekaligus: bentuk hukum (sumbu A), jenis usaha (sumbu B), dan ukuran (sumbu C). Ketiganya harus disimpan sebagai data terpisah, bukan satu "tipe perusahaan". Contoh: "PT, hotel, menengah" dan "CV, hotel, mikro" butuh modul yang sama tapi pajak dan pembukuan berbeda.

### 1A. Bentuk badan hukum

| Bentuk | Badan hukum? | Pemilik | Ciri penting untuk sistem |
|---|---|---|---|
| Perorangan/UMKM tanpa badan | Tidak | Satu orang, tanggung jawab pribadi | Harta usaha dan pribadi campur. NPWP pribadi. NIB tetap bisa dibuat lewat OSS. Pembukuan boleh sederhana (pencatatan, bukan pembukuan penuh, bila omzet di bawah Rp4,8 miliar) ⚠ |
| Firma | Tidak | Beberapa sekutu, tanggung jawab renteng | Jarang dipakai. Ada akta notaris. Bagi hasil antar sekutu |
| CV (persekutuan komanditer) | Tidak | Sekutu aktif (pengurus) dan sekutu pasif (modal) | Sangat umum untuk kontraktor kecil dan tender pemerintah. Sekutu aktif menanggung pribadi. Bagi hasil sesuai akta |
| PT | Ya | Pemegang saham | Modal dasar, modal disetor, saham, direksi, komisaris, RUPS. Perlu akta notaris dan SK Kemenkumham. Laporan keuangan formal |
| PT Perorangan (PT UMK) | Ya | Satu orang WNI, min. 17 tahun | Tanpa akta notaris, cukup surat pernyataan pendirian lewat AHU Online. Hanya untuk usaha mikro dan kecil. Tidak ada modal dasar minimum. Satu orang merangkap direktur dan pemegang saham. Wajib naik jadi PT biasa bila melewati batas kecil |
| Koperasi | Ya | Anggota (satu anggota satu suara) | Simpanan pokok, wajib, sukarela. SHU dibagi menurut jasa anggota (UU 25/1992 pasal 5). RAT tahunan. Jenis: simpan pinjam, konsumen, produsen, jasa. Koperasi Merah Putih (program desa 2025) menambah banyak koperasi baru |
| Yayasan | Ya | Tidak ada pemilik. Pembina, pengurus, pengawas | Nirlaba. Tidak boleh membagi laba. Usaha lewat badan usaha lain, penyertaan maksimal 25% dari kekayaan (UU 28/2004). Sering menaungi sekolah, klinik, panti |
| Perkumpulan | Ya (bila terdaftar) | Anggota | Organisasi nirlaba berbasis anggota: asosiasi, klub, komunitas. Iuran anggota, kegiatan, laporan ke anggota |
| BUMDes / BUMDes bersama | Ya (sejak sertifikat pendaftaran elektronik Kemenkumham) | Desa (dan modal masyarakat) | PP 11/2021. Dibentuk lewat musyawarah desa. Unit usaha bisa berbadan hukum terpisah. Laporan ke pemerintah desa |
| BUMN/BUMD | Ya | Negara/daerah | Di luar target awal. Pengadaan dan pelaporan ke pemerintah. Cukup dicatat sebagai segmen masa depan |
| Cabang perusahaan asing | Bukan badan hukum Indonesia | Perusahaan induk di luar negeri | KPPA (kantor perwakilan) tidak boleh mencari laba. Kegiatan komersial lewat PT PMA atau Bentuk Usaha Tetap (BUT). PT PMA: pemegang saham asing, laporan penanaman modal berkala (LKPM) ⚠ |

Catatan hukum per bentuk (pembukuan dan pajak):

- **Perorangan, CV, Firma, PT, Koperasi** yang omzetnya di bawah Rp4,8 miliar setahun boleh memakai PPh final 0,5% dari omzet (PP 55/2022). Wajib pajak orang pribadi: omzet sampai Rp500 juta bebas PPh. Batas waktu pemakaian tarif ini: 7 tahun untuk orang pribadi, 4 tahun untuk CV, koperasi, dan firma, 3 tahun untuk PT. Berita Desember 2024 menyebut tambahan satu tahun sampai akhir 2025 bagi yang sudah memakai 7 tahun. Kelanjutan setelah 2025 ⚠ perlu dicek ke aturan terbaru.
- Setelah batas waktu atau omzet melewati Rp4,8 miliar, wajib memakai PPh pasal 17 dengan pembukuan, dan laporan keuangan sesuai standar. Sistem harus bisa menghitung "tahun ke berapa pakai tarif final" per entitas.
- **PKP (PPN)**: wajib dikukuhkan bila omzet kumulatif tahun berjalan melewati Rp4,8 miliar (PMK 197/2013). Laporan Bank Dunia Juli 2026 mengusulkan turun ke Rp500 juta. Belum jadi aturan ⚠. Batas harus berupa konfigurasi.
- **Standar akuntansi**: SAK EMKM (mikro, kecil, menengah: laporan posisi keuangan, laba rugi, catatan), SAK EP (entitas privat, mengganti SAK ETAP), SAK untuk koperasi (SAK ETAP/EP ditambah aturan khusus) ⚠, ISAK 35 untuk entitas nirlaba (yayasan, perkumpulan) ⚠. Platform perlu bagan akun (COA) dan bentuk laporan berbeda per jenis.
- **Koperasi**: bunga simpanan anggota kena PPh final (0% sampai Rp240.000 per bulan, 10% di atasnya). SHU yang dibagi ke anggota bukan lagi objek pajak (berita DDTC 2026, ⚠ cek pasal rujukannya).
- **Yayasan**: tidak ada "laba" dan "ekuitas pemilik". Ada aset neto dengan pembatasan atau tanpa pembatasan, dan dana terikat dari donor.
- **PT Perorangan**: tetap wajib laporan keuangan. Pendirian lewat AHU Online, biaya PNBP sekitar Rp50.000 dan 3 sampai 5 hari kerja (sumber blog, ⚠).
- **Perizinan semua bentuk**: NIB lewat OSS, dengan kode KBLI. Risiko rendah cukup NIB. Menengah rendah: NIB + sertifikat standar tanpa verifikasi. Menengah tinggi: sertifikat standar dengan verifikasi. Tinggi: NIB + izin (PP 28/2025). Satu pelaku usaha satu NIB, banyak KBLI. KBLI 2025 menggantikan KBLI 2020 ⚠ cek masa transisi.

### 1B. Industri dan model bisnis

Daftar 21 kelompok yang dibahas di bagian 2 (satu perusahaan sering punya lebih dari satu):

1. Ritel toko/minimarket
2. F&B: restoran, kafe, cloud kitchen
3. Manufaktur: make-to-stock, make-to-order, job shop
4. Jasa profesional, agensi, konsultan
5. Kontraktor/konstruksi
6. Distributor/grosir
7. Logistik/ekspedisi
8. Klinik/kesehatan (termasuk apotek)
9. Pendidikan swasta
10. Pertanian/perikanan/agribisnis
11. Properti, kos, sewa
12. Hospitality: hotel, villa, tur
13. Startup/software house
14. NGO/nirlaba
15. Franchise (pewaralaba dan terwaralaba)
16. Holding multi-entitas
17. Seller marketplace/e-commerce
18. Bengkel/otomotif
19. Salon/spa
20. Percetakan/konveksi
21. Event organizer

### 1C. Ukuran usaha

Dasar: PP 7/2021 (kriteria UMKM, menggantikan angka UU 20/2008). Modal dipakai untuk pendirian/pendaftaran baru, omzet untuk usaha berjalan dan program pemberdayaan. Modal tidak termasuk tanah dan bangunan tempat usaha.

| Ukuran | Modal usaha | Omzet tahunan |
|---|---|---|
| Mikro | sampai Rp1 miliar | sampai Rp2 miliar |
| Kecil | Rp1 sampai 5 miliar | Rp2 sampai 15 miliar |
| Menengah | Rp5 sampai 10 miliar | Rp15 sampai 50 miliar |
| Besar | di atas Rp10 miliar | di atas Rp50 miliar |

⚠ Hukumonline (artikel 2026) masih memakai angka PP 7/2021 dan tidak menyebut perubahan. Saya tidak menemukan aturan yang menggantikannya, tapi belum memeriksa teks resmi di JDIH. Ambang untuk "usaha besar" (di atas batas menengah) adalah turunan, bukan kutipan.

Ambang lain yang berpengaruh ke sistem:

| Ambang | Nilai | Dampak |
|---|---|---|
| PPh final UMKM | omzet di bawah Rp4,8 miliar/tahun | tarif 0,5% dari omzet |
| Bebas PPh orang pribadi | omzet sampai Rp500 juta/tahun | tidak bayar PPh |
| PKP | omzet di atas Rp4,8 miliar | wajib pungut PPN, faktur pajak lewat Coretax ⚠ |
| PT Perorangan | hanya mikro dan kecil | harus naik ke PT bila lewat batas kecil |
| Marketplace pungut PPh 22 | 0,5% dari transaksi merchant, bebas bila omzet di bawah Rp500 juta dengan surat pernyataan (PMK 37/2025) | seller perlu menyimpan surat dan bukti potong |

Ukuran juga menentukan kebutuhan sistem, bukan hanya pajak: mikro butuh catat kas dan stok lewat HP, kecil butuh stok dan gaji, menengah butuh persetujuan berlapis dan multi-cabang, besar butuh multi-entitas dan audit. Satu platform harus tumbuh dengan satu perusahaan tanpa pindah sistem.

---

## 2. Profil per industri

Format tiap industri: Proses inti, Data utama, Peran, Persetujuan, Laporan pemilik, Istilah, 3 kerumitan. Sumber umumnya pengetahuan domain dan praktik umum. Hanya klaim hukum yang diberi sumber di bagian 5. Rincian yang tidak bersumber diberi ⚠ bila berupa angka atau aturan.

### 2.1 Ritel toko/minimarket

- **Proses inti**: beli dari pemasok, terima barang, simpan di rak/gudang, jual lewat kasir, setor uang, stok opname, retur.
- **Data utama**: SKU/barcode, satuan (pcs, dus, lusin), harga beli dan jual (bertingkat), stok per lokasi, nota penjualan, shift kasir, pemasok, utang dagang, diskon dan promo, pelanggan/member.
- **Peran**: pemilik, kepala toko, kasir, pramuniaga, gudang, admin pembelian.
- **Persetujuan**: diskon manual, void/retur, selisih kas, penyesuaian stok, perubahan harga.
- **Laporan**: omzet harian per toko, laba kotor per produk, barang paling laku dan mati, stok kritis, selisih opname, kas hilang per kasir, umur utang.
- **Istilah**: kulakan, nota, struk, opname, kasbon, retur, titip jual/konsinyasi, tutup kasir, HPP, margin, PO.
- **Kerumitan**:
  1. Satu barang banyak satuan jual (beli per dus, jual per pcs, per renteng) dengan harga bertingkat (eceran, grosir, member).
  2. Kasir harus jalan saat internet putus lalu sinkron tanpa menggandakan transaksi atau merusak stok.
  3. Konsinyasi dan tanggal kedaluwarsa (FEFO) serta barang berkode timbang atau kode curah.

### 2.2 F&B: restoran, kafe, cloud kitchen

- **Proses inti**: terima pesanan (meja, bawa pulang, ojol), kirim ke dapur/bar, masak, saji, bayar, tutup shift, belanja bahan, olah bahan.
- **Data utama**: menu, varian dan modifier (level pedas, tambahan), resep/BOM per menu, bahan baku dan satuannya, pesanan per meja, pembayaran terpisah (split bill), pajak restoran, service charge, limbah, pemasok.
- **Peran**: pemilik, manajer, kasir, pelayan, koki/barista, gudang bahan, kurir.
- **Persetujuan**: void item, diskon, komplimen, pembelian bahan di atas batas, pembuangan bahan.
- **Laporan**: penjualan per jam dan per menu, food cost %, laba per menu, penjualan per kanal (dine-in, GoFood, GrabFood, ShopeeFood), selisih stok bahan, komisi platform.
- **Istilah**: PB1, service charge, split bill, void, komplimen, kitchen display, food cost, bahan baku, dapur pusat, outlet, takeaway, sertifikat halal, SLHS.
- **Kerumitan**:
  1. Stok bahan berkurang lewat resep, bukan per menu, dengan satuan campur (gram, sendok, porsi) dan susut.
  2. Pajak restoran daerah (PBJT, tarif maksimum 10% ditetapkan perda) dan service charge masuk dasar pajak, berbeda per daerah. Dasar pengenaan memuat service charge ⚠ cek perda tiap kota.
  3. Penjualan lewat aplikasi pesan antar memotong komisi dan mencairkan uang beberapa hari kemudian, perlu rekonsiliasi per kanal. Pesanan yang sama masuk dari beberapa sumber.
- **Aturan baru**: sertifikasi halal wajib bagi produk makanan minuman usaha mikro-kecil berlaku bertahap, tonggak 17 sampai 19 Oktober 2026 (tanggal tepat berbeda antar sumber, dan ada berita penundaan) ⚠. Sistem sebaiknya menyimpan nomor sertifikat dan tanggal kedaluwarsa per produk/outlet.

### 2.3 Manufaktur

Tiga mode, sering dalam satu pabrik:

- **Make-to-stock (MTS)**: produksi berdasarkan ramalan, jual dari stok. Contoh: air minum kemasan, snack, pupuk.
- **Make-to-order (MTO)**: produksi setelah ada pesanan. Contoh: mebel pesanan, seragam.
- **Job shop**: tiap pesanan unik, rute kerja berbeda. Contoh: bengkel las, CNC, percetakan.

- **Proses inti**: pesanan/ramalan, rencana produksi, kebutuhan bahan (MRP), beli bahan, perintah kerja (SPK/work order), produksi per tahap, QC, barang jadi, kirim, tagih.
- **Data utama**: BOM (daftar bahan) berlapis, routing (urutan proses dan mesin), work order, batch/lot, mesin dan jam kerja, bahan baku, WIP (barang setengah jadi), hasil dan reject, biaya produksi (bahan, tenaga kerja, overhead).
- **Peran**: pemilik, manajer pabrik, PPIC (perencana), operator, QC, gudang, pembelian, sales.
- **Persetujuan**: rilis work order, pengeluaran bahan di luar BOM, penerimaan hasil, rework/reject, perubahan BOM.
- **Laporan**: produksi vs rencana, HPP per produk, rendemen/yield, reject rate, utilisasi mesin, bahan kurang, WIP, pesanan telat.
- **Istilah**: SPK, BOM/resep, PPIC, WIP, rendemen, reject, rework, lot/batch, mesin, shift, lembur, borongan/upah per potong, subkon/maklon.
- **Kerumitan**:
  1. Satu bahan menghasilkan lebih dari satu keluaran (produk sampingan dan sisa), dan hasil nyata berbeda dari BOM.
  2. Maklon/subkontrak: bahan dikirim keluar, barang jadi kembali, biaya jasa dan stok di pihak ketiga harus dilacak.
  3. Upah borongan per potong atau per tahap harus masuk ke biaya produksi dan gaji sekaligus.

### 2.4 Jasa profesional, agensi, konsultan

- **Proses inti**: prospek, proposal, kontrak/SOW, kerjakan proyek, catat jam kerja, tagih (termin atau jam), tagih ulang biaya, terima bayar.
- **Data utama**: klien, proposal, kontrak, proyek dan tugas, timesheet, tarif per orang/peran, tagihan per termin, biaya yang ditagih ulang (reimbursable), retainer bulanan, utilisasi.
- **Peran**: partner/direktur, manajer proyek, konsultan/desainer, admin keuangan, freelancer.
- **Persetujuan**: proposal dan harga, timesheet, tagihan, pengeluaran, kontrak freelancer.
- **Laporan**: pendapatan dan margin per proyek, utilisasi, tagihan belum dibayar (AR aging), proyeksi pendapatan, WIP belum ditagih.
- **Istilah**: SOW, termin, DP, retainer, timesheet, invoice, bukti potong PPh 23, PO klien, BAST.
- **Kerumitan**:
  1. Klien memotong PPh 23 (jasa 2%, ⚠ tarif per jenis jasa berbeda) sehingga uang masuk lebih kecil dari tagihan. Bukti potong harus dicocokkan.
  2. Termin tagihan terkait milestone yang disetujui klien (BAST), bukan tanggal.
  3. Jam kerja orang yang sama tersebar ke banyak proyek dengan tarif berbeda, plus freelancer yang dibayar per proyek.

### 2.5 Kontraktor/konstruksi

- **Proses inti**: ikut tender/penawaran, kontrak, RAB (rencana anggaran biaya), jadwal, beli bahan dan sewa alat, kerja lapangan, progres fisik, tagih termin (opname), retensi, serah terima (PHO, FHO).
- **Data utama**: proyek, RAB/BoQ per item pekerjaan, progres fisik per item, subkontraktor dan mandor, bahan dan alat di lokasi, kasbon lapangan, termin dan retensi, jaminan (bank garansi), dokumen SBU/SKK.
- **Peran**: direktur, manajer proyek, pelaksana lapangan, QS/estimator, logistik proyek, admin proyek, mandor.
- **Persetujuan**: RAB, pembelian proyek, opname subkon, kasbon, termin, perubahan pekerjaan (addendum/CCO).
- **Laporan**: biaya vs RAB per proyek, progres vs jadwal, cashflow proyek, piutang termin, retensi tertahan, laba proyek.
- **Istilah**: RAB, BoQ, RKS, termin, opname, bobot pekerjaan, kurva S, retensi (biasanya 5%, ⚠), PHO/FHO, addendum, bank garansi, SBU/SKK, LPSE/tender, pekerjaan tambah kurang.
- **Kerumitan**:
  1. PPh final khusus konstruksi: 1,75% (kualifikasi kecil atau sertifikat kompetensi), 2,65% (menengah, besar, spesialis), 4% (tanpa sertifikat), PP 9/2022. Tarif tergantung sertifikat badan usaha pemberi/penerima.
  2. Pengakuan pendapatan berdasarkan progres, dengan retensi yang ditahan beberapa bulan dan uang muka yang dipotong tiap termin.
  3. Biaya lapangan kecil dan tunai (kasbon, upah harian, bon bahan) banyak dan sulit dibuktikan. Subkon dibayar berdasarkan opname bukan faktur.

### 2.6 Distributor/grosir

- **Proses inti**: beli dari pabrik/prinsipal, gudang, kanvas dan taking order (sales keliling), kirim, tagih (tunai atau tempo), setor, retur, klaim ke prinsipal.
- **Data utama**: SKU banyak satuan, outlet/pelanggan beserta rute, plafon kredit, faktur dan tempo, giro/cek, stok per gudang dan per mobil, target dan insentif sales, promo/diskon prinsipal, klaim program.
- **Peran**: pemilik, manajer gudang, supervisor sales, salesman (kanvas/taking order), driver, kolektor/penagih, admin faktur.
- **Persetujuan**: plafon kredit, diskon di luar harga, retur, penghapusan piutang, pengeluaran barang.
- **Laporan**: penjualan per sales/area/produk, piutang dan umur piutang, outlet aktif, fill rate, stok dan perputaran, margin per prinsipal, klaim terbayar.
- **Istilah**: kanvas, taking order, TO, tempo/TOP, giro mundur, kontra bon, plafon, prinsipal, tukar faktur, klaim, bonus barang, rute.
- **Kerumitan**:
  1. Piutang tempo dengan pembayaran sebagian, giro mundur yang bisa tolak, dan tagihan lewat kolektor.
  2. Diskon berlapis dan bonus barang (beli 10 gratis 1) dari prinsipal yang diklaim kembali dan harus diproses sebagai pendapatan atau pengurang HPP.
  3. Stok di mobil sales (kanvas) yang harus direkonsiliasi tiap hari, dan nota fisik yang dibawa sales.

### 2.7 Logistik/ekspedisi

- **Proses inti**: terima barang (pickup/drop), buat resi, sortir di gudang/hub, angkut, antar, bukti terima (POD), COD dan setoran, retur, tagih klien.
- **Data utama**: resi/AWB, pengirim dan penerima, berat dan volume, rute/hub, armada dan driver, status pelacakan, COD, tarif per rute dan berat, kontrak klien, klaim kerusakan.
- **Peran**: pemilik, manajer cabang, admin gudang, sopir/kurir, kolektor, CS, finance.
- **Persetujuan**: tarif khusus, klaim ganti rugi, pembayaran uang jalan, penghapusan selisih COD.
- **Laporan**: pengiriman per rute dan klien, ketepatan waktu, biaya per kilometer/pengiriman, piutang klien, saldo COD belum setor, klaim.
- **Istilah**: resi/AWB, POD, COD, uang jalan, hub, transit, last mile, kubikasi, freight forwarder, BL, surat jalan, retur.
- **Kerumitan**:
  1. Perlakuan PPN khusus: jasa angkutan umum darat dan air dibebaskan PPN (UU HPP pasal 16B). Freight forwarding memakai PPN efektif 1,1% (PMK 11/2025 ⚠ cek). PPh 23 untuk jasa angkutan/ekspedisi 2% kecuali bagian reimbursement.
  2. COD: uang pembeli dipegang kurir, disetor ke cabang, lalu dicairkan ke pengirim. Banyak titik selisih.
  3. Satu resi punya banyak status, banyak tangan, dan tarif dari matriks rute × berat × layanan.

### 2.8 Klinik/kesehatan (termasuk apotek)

- **Proses inti**: pendaftaran, antrean, pemeriksaan, rekam medis, resep, obat/tindakan, kasir (umum, asuransi, BPJS), klaim.
- **Data utama**: pasien dan NIK, kunjungan, rekam medis elektronik (RME), diagnosa (ICD), tindakan, resep dan obat (batch, kedaluwarsa), tarif tindakan, penjamin (umum, asuransi, BPJS), klaim, jadwal dokter.
- **Peran**: pemilik/penanggung jawab, dokter, perawat/bidan, apoteker, petugas pendaftaran, kasir, petugas klaim.
- **Persetujuan**: diskon pasien, penjaminan asuransi, klaim, pengeluaran narkotika/psikotropika.
- **Laporan**: kunjungan per dokter, pendapatan per penjamin, klaim tertunda, pemakaian obat, stok kedaluwarsa, 10 besar diagnosa.
- **Istilah**: RME, SATUSEHAT, BPJS, kapitasi, INA-CBG, resep, racikan, SIP, SIPA, apoteker penanggung jawab, rujukan, penjamin.
- **Kerumitan**:
  1. Data pasien sangat sensitif. RME wajib terhubung ke SATUSEHAT (Permenkes 24/2022, ⚠ cek tenggat per jenis fasilitas). Tidak boleh dicampur dengan data keuangan biasa tanpa pembatasan akses.
  2. Pembayaran oleh beberapa pihak untuk satu kunjungan (BPJS kapitasi/klaim, asuransi, pasien), tarif bukan satu angka.
  3. Obat punya batch, kedaluwarsa, dan golongan khusus (narkotika, psikotropika) dengan pelaporan sendiri. Jasa medis dokter dibagi dengan skema bagi hasil per tindakan.
- **Pajak**: jasa pelayanan kesehatan medis tertentu dibebaskan PPN, penjualan obat tetap kena (rinci ⚠).

### 2.9 Pendidikan swasta

(Sudah diriset di proyek EduSmart v2 lama, dirangkum di `docs/research/R1-school-domain.md`.) Ringkas untuk platform perusahaan:

- **Proses inti**: penerimaan siswa, tagihan SPP/uang pangkal, belajar, penilaian, pembayaran, penggajian guru, laporan ke dinas.
- **Data utama**: siswa/wali, kelas, tagihan berulang, beasiswa, guru dan jam mengajar, aset (gedung, buku), dana BOS bila ada.
- **Peran**: ketua yayasan, kepala sekolah/direktur, bendahara, guru, TU, orang tua.
- **Persetujuan**: keringanan biaya, pengeluaran yayasan, kenaikan gaji.
- **Laporan**: tagihan tertunggak, pemasukan per jenjang, rasio guru-siswa, laporan yayasan (nirlaba).
- **Istilah**: SPP, uang pangkal, yayasan, BOS, dapodik, rapor, tunggakan, beasiswa.
- **Kerumitan**:
  1. Pemilik berupa yayasan (nirlaba), jadi tidak ada "laba" dan ada pelaporan dana terikat.
  2. Tagihan berulang per siswa dengan keringanan dan cicilan yang berbeda-beda, ditagih ke wali.
  3. Dua sistem sekaligus: data akademik (modul sekolah) dan keuangan yayasan. Cocok sebagai plugin, bukan inti.
- Bebas PPN untuk jasa pendidikan (UU HPP pasal 16B).

### 2.10 Pertanian/perikanan/agribisnis

- **Proses inti**: siapkan lahan/kolam, tanam/tebar, rawat (pupuk, pakan, obat), panen, sortir, jual (tengkulak, pabrik, pasar, ekspor), pembayaran.
- **Data utama**: lahan/blok/kolam dan luasnya, siklus tanam, input (benih, pupuk, pakan) per blok, tenaga harian, hasil panen (kg, grade), harga harian, petani mitra (plasma), kontrak, kendaraan angkut.
- **Peran**: pemilik, manajer kebun, mandor, buruh harian, petani mitra, pembeli/pengepul, penyuluh.
- **Persetujuan**: pembelian input, pembayaran mitra, penjualan di bawah harga tertentu.
- **Laporan**: biaya dan hasil per siklus per blok, HPP per kg, panen vs target, utang petani, tren harga.
- **Istilah**: musim tanam, panen raya, plasma/inti, tengkulak, rendemen, grade, HOK (hari orang kerja), gagal panen, pupuk subsidi, RDKK.
- **Kerumitan**:
  1. Biaya dan hasil terjadi di siklus yang panjang (bulan sampai tahun) dan pendapatannya musiman, bukan tiap hari.
  2. Hasil dinilai dari kualitas dan kadar air, harga berubah harian, dan satuan lokal (ikat, karung, blek).
  3. Petani mitra dan pembayaran lewat tunai di desa tanpa sinyal, perlu aplikasi offline. Sebagian hasil pertanian dasar bebas PPN (UU HPP 16B, ⚠ rincian per komoditas).

### 2.11 Properti, kos, sewa

- **Proses inti**: pasarkan unit, kontrak sewa, tagih berkala, catat pembayaran, pemeliharaan, perpanjang/akhiri, kembalikan deposit.
- **Data utama**: properti dan unit, penyewa, kontrak (mulai, selesai, harga, deposit), tagihan bulanan, meteran listrik/air, perbaikan, biaya properti, dokumen (sertifikat, PBB).
- **Peran**: pemilik, pengelola/penjaga kos, penyewa, teknisi, agen.
- **Persetujuan**: harga sewa khusus, pengembalian deposit, biaya perbaikan.
- **Laporan**: tingkat hunian, tunggakan, pendapatan per unit, biaya perawatan, jatuh tempo kontrak, ROI per properti.
- **Istilah**: kos, kontrakan, deposit, uang muka, token listrik, IPL, PBB, sertifikat (SHM, HGB), perpanjangan.
- **Kerumitan**:
  1. PPh final 10% atas sewa tanah dan bangunan (PP 34/2017), dasar termasuk biaya perawatan, keamanan, dan service charge. Yang memotong adalah penyewa bila penyewa pemotong, bila tidak, pemilik menyetor sendiri.
  2. Tagihan campuran: sewa tetap ditambah pemakaian listrik/air dari meteran, dan deposit yang bisa dipotong.
  3. Banyak properti dengan banyak pemilik/pengelola, bagi hasil ke investor, dan pemilik pribadi yang menyewakan lewat PT.

### 2.12 Hospitality: hotel, villa, tur (Bali relevan)

- **Proses inti**: kelola ketersediaan kamar, terima reservasi (langsung, OTA), check-in, layanan (F&B, laundry, spa), check-out dan tagih, housekeeping, laporan harian. Tur: paket, vendor, jadwal, pemandu, transportasi.
- **Data utama**: tipe kamar dan inventaris, tarif musiman (high/low season, hari libur), reservasi dan tamu, folio (tagihan tamu), OTA (Booking, Agoda, Traveloka) dan komisi, housekeeping, vendor tur, kontrak agen, pemilik villa dan bagi hasil.
- **Peran**: general manager, front office, housekeeping, F&B, revenue manager, finance, pemilik villa, pemandu, agen.
- **Persetujuan**: diskon kamar, upgrade, komplimen, penghapusan tagihan, kontrak vendor.
- **Laporan**: okupansi, ADR, RevPAR, pendapatan per kanal dan per departemen, laporan harian malam (night audit), pembayaran ke pemilik villa, komisi OTA, forecast.
- **Istilah**: okupansi, ADR, RevPAR, folio, night audit, channel manager, OTA, allotment, high/low season, service charge, PHR/PB1, villa management, owner statement, pemandu, DMC.
- **Kerumitan**:
  1. Pajak daerah: PBJT atas jasa perhotelan maksimum 10% menurut perda, dan service charge dibagi ke karyawan. Di Bali ditambah pungutan wisatawan asing Rp150.000 (Perda Bali 6/2023, diubah 2/2025), dibayar tamu lewat Love Bali, bukan oleh hotel, tapi tamu sering bertanya ke hotel.
  2. Satu kamar dijual di beberapa kanal sekaligus (channel manager), dengan tarif berbeda per kanal, risiko double booking, dan komisi OTA yang dipotong.
  3. Villa kelolaan: pemilik villa menerima laporan bagi hasil bulanan setelah dipotong biaya dan fee manajemen. Satu pengelola, banyak pemilik, banyak mata uang (USD, EUR, IDR). Tamu asing dan banyak pembayaran kartu.

### 2.13 Startup/software house

- **Proses inti**: tentukan produk/proyek, kembangkan (sprint), rilis, penagihan (langganan atau proyek), dukungan, perekrutan, pendanaan.
- **Data utama**: proyek dan backlog, sprint, jam kerja, klien, langganan (MRR/ARR), tagihan, biaya server dan SaaS, kontrak, ESOP/cap table, runway.
- **Peran**: founder, CTO, developer, desainer, PM, sales, finance, investor.
- **Persetujuan**: kontrak klien, biaya cloud, rekrutmen, pembayaran kontraktor.
- **Laporan**: MRR/ARR, churn, burn rate dan runway, margin per proyek, utilisasi developer, piutang.
- **Istilah**: MRR, ARR, burn, runway, sprint, SOW, retainer, cap table, seed, pitch, vesting.
- **Kerumitan**:
  1. Pendapatan berulang (langganan) harus diakui per periode, dengan upgrade, downgrade, dan kredit.
  2. Banyak mata uang dan pembayaran cloud/SaaS dolar (PPN impor jasa digital). ⚠ perlakuan pajak per kasus.
  3. Biaya pengembangan kadang dikapitalisasi, dan karyawan kerja jarak jauh, kontraktor luar negeri.

### 2.14 NGO/nirlaba

- **Proses inti**: dapatkan hibah/donasi, program, belanja sesuai anggaran hibah, laporan ke donor, audit.
- **Data utama**: donor, hibah (dana terikat), anggaran per hibah, program, belanja yang dialokasikan ke hibah, relawan, penerima manfaat, laporan naratif dan keuangan.
- **Peran**: direktur, manajer program, staf lapangan, finance, relawan, donor, auditor.
- **Persetujuan**: belanja terhadap anggaran hibah, perubahan anggaran, perjalanan dinas.
- **Laporan**: realisasi vs anggaran per donor, sisa dana terikat, dampak program, laporan donor sesuai format donor.
- **Istilah**: hibah, donor, dana terikat, LFA/logframe, laporan naratif, penerima manfaat, program, overhead/indirect cost.
- **Kerumitan**:
  1. Satu belanja dibagi ke beberapa hibah dengan persentase (alokasi biaya bersama) dan tiap donor menuntut format laporan sendiri.
  2. Dana terikat tidak boleh dipakai di luar tujuan, jadi akuntansi dana (fund accounting), bukan akuntansi laba rugi biasa (ISAK 35, ⚠).
  3. Mata uang asing dan dokumen bukti yang ketat untuk audit donor.

### 2.15 Franchise

- **Proses inti (pewaralaba)**: rekrut mitra, kontrak (biaya awal, royalti), pelatihan, pasok bahan/standar, pantau outlet, tagih royalti. **Terwaralaba**: buka outlet, beli dari pusat, laporan penjualan ke pusat.
- **Data utama**: mitra/outlet, kontrak waralaba, royalti dan biaya pemasaran, penjualan outlet, standar (SOP, audit), pasokan, pelatihan, wilayah eksklusif.
- **Peran**: pemilik merek, tim pengembangan, supervisor area, mitra/terwaralaba, staf outlet.
- **Persetujuan**: calon mitra, lokasi, perubahan menu/harga, audit.
- **Laporan**: penjualan per outlet, royalti terhutang dan terbayar, kepatuhan SOP, outlet bermasalah, pasokan.
- **Istilah**: waralaba, pewaralaba, terwaralaba, royalti, franchise fee, STPW (surat tanda pendaftaran waralaba, ⚠), outlet, area manager.
- **Kerumitan**:
  1. Sistem multi-tenant dua sisi: pusat melihat semua outlet, tiap mitra hanya melihat dirinya, dengan data dan akun pembukuan terpisah.
  2. Royalti dihitung dari penjualan outlet (persen, minimum, bertingkat), sehingga penjualan harus terintegrasi atau diverifikasi.
  3. Standar yang sama (menu, harga, pasokan) tapi tiap outlet punya penyimpangan lokal.

### 2.16 Holding multi-entitas

- **Proses inti**: beberapa badan hukum dalam satu kelompok, transaksi antar-entitas, konsolidasi, laporan grup, pengelolaan kas bersama.
- **Data utama**: entitas dan kepemilikan (persentase saham), COA per entitas dan COA grup, transaksi antar-perusahaan (intercompany), pinjaman antar entitas, laporan konsolidasi, direksi/komisaris per entitas.
- **Peran**: pemilik/keluarga, CFO grup, finance tiap entitas, direktur anak usaha, auditor.
- **Persetujuan**: pinjaman antar entitas, dividen, investasi, transaksi afiliasi.
- **Laporan**: laporan konsolidasi, kontribusi per entitas, saldo intercompany, posisi kas grup, dividen.
- **Istilah**: induk, anak usaha, afiliasi, konsolidasi, eliminasi, dividen, transaksi pihak berelasi, pemegang saham.
- **Kerumitan**:
  1. Pemilik bisa satu orang yang punya banyak PT dan CV (sangat umum di UMKM Indonesia) tanpa konsolidasi resmi, hanya tampilan gabungan.
  2. Eliminasi transaksi antar entitas dan perbedaan COA/standar antar entitas.
  3. Setiap entitas punya NPWP, pajak, dan laporan sendiri. Orang yang sama punya peran berbeda di tiap entitas.

### 2.17 Seller marketplace/e-commerce

- **Proses inti**: unggah produk di beberapa toko (Shopee, Tokopedia, TikTok Shop, Lazada), terima pesanan, kemas, kirim lewat kurir, uang dicairkan marketplace, retur.
- **Data utama**: produk dan varian per kanal, stok bersama, pesanan, resi, biaya platform (komisi, ongkir, voucher), pencairan dana, retur, iklan.
- **Peran**: pemilik, admin toko, packer, CS, pengelola iklan, dropshipper/reseller.
- **Persetujuan**: retur dan refund, harga promo, penarikan dana.
- **Laporan**: laba bersih per pesanan dan per produk setelah biaya platform, stok, retur, ROAS iklan, pencairan vs pesanan.
- **Istilah**: marketplace, resi, dropship, reseller, saldo penjual, voucher, retur, flash sale, fulfilment, ROAS.
- **Kerumitan**:
  1. Stok sama dijual di banyak toko, harus sinkron, supaya tidak oversell.
  2. Pencairan dana dipotong banyak komponen (komisi, ongkir, voucher), jadi pencocokan pesanan dengan dana masuk rumit.
  3. Marketplace memungut PPh 22 sebesar 0,5% dari transaksi (PMK 37/2025), kecuali merchant orang pribadi beromzet di bawah Rp500 juta dengan surat pernyataan. Perlu menyimpan bukti potong.

### 2.18 Bengkel/otomotif

- **Proses inti**: kendaraan masuk, estimasi, persetujuan pelanggan, kerjakan, ganti suku cadang, QC, serah, bayar, jadwal servis berikutnya.
- **Data utama**: pelanggan dan kendaraan (plat, odometer), work order, jasa dan suku cadang, mekanik, stok suku cadang, supplier, riwayat servis, garansi.
- **Peran**: pemilik, service advisor, kepala mekanik, mekanik, kasir, gudang suku cadang.
- **Persetujuan**: estimasi tambahan ("tambah pekerjaan" sebelum dikerjakan), diskon, garansi.
- **Laporan**: pendapatan jasa vs suku cadang, produktivitas mekanik, margin suku cadang, pengingat servis, stok lambat.
- **Istilah**: SPK/work order, estimasi, spare part, jasa, flat rate, odometer, tune up, garansi, klaim asuransi.
- **Kerumitan**:
  1. Riwayat melekat ke kendaraan, bukan ke orang (kendaraan berpindah pemilik).
  2. Pekerjaan tambahan ditemukan di tengah servis dan harus disetujui pelanggan sebelum dikerjakan. Pelanggan bengkel asuransi dan fleet punya penagihan sendiri.
  3. Suku cadang punya banyak merek/kualitas dan kode berbeda, serta pembagian komisi mekanik per pekerjaan.

### 2.19 Salon/spa

- **Proses inti**: booking, layanan oleh terapis, produk tambahan, bayar, paket/membership, komisi terapis.
- **Data utama**: layanan dan durasi, terapis dan jadwal, booking, pelanggan dan preferensi, paket/membership dan sisa sesi, produk retail, komisi, tip.
- **Peran**: pemilik, resepsionis, terapis/kapster, kasir.
- **Persetujuan**: diskon, refund paket, perubahan jadwal.
- **Laporan**: pendapatan per terapis, okupansi jadwal, komisi, paket aktif dan kedaluwarsa, retensi pelanggan.
- **Istilah**: kapster, terapis, paket, membership, komisi, tip, walk-in, reservasi.
- **Kerumitan**:
  1. Jadwal ganda: satu terapis dan satu ruangan harus bebas pada waktu yang sama.
  2. Paket prabayar (beli 10 sesi) adalah kewajiban (liabilitas), bukan pendapatan langsung, dan bisa dipakai di cabang lain.
  3. Komisi terapis dihitung per layanan dan per produk, dengan tip dibagi.

### 2.20 Percetakan/konveksi

- **Proses inti**: permintaan/penawaran, desain/proof, DP, produksi (cetak, potong, jahit, finishing), QC, kirim, pelunasan.
- **Data utama**: pesanan dan spesifikasi (ukuran, bahan, warna, jumlah), mockup/approval desain, kalkulasi harga per spesifikasi, bahan (kertas, kain), mesin, tahapan produksi, upah borongan, DP dan pelunasan.
- **Peran**: pemilik, admin order, desainer, operator mesin/penjahit, QC, kurir.
- **Persetujuan**: desain/proof dari pelanggan, harga khusus, reject dan cetak ulang.
- **Laporan**: pesanan dalam proses, margin per pesanan, pemakaian bahan, upah borongan, piutang, order telat.
- **Istilah**: DP, proof, mockup, plong, finishing, lusin, size run, borongan, ongkos jahit, sablon, DTF.
- **Kerumitan**:
  1. Harga dihitung dari spesifikasi (ukuran, bahan, finishing, jumlah) yang berbeda tiap pesanan, bukan daftar harga tetap.
  2. Upah borongan per potong per tahap dan pembayaran mingguan, bercampur dengan gaji tetap.
  3. Perubahan di tengah jalan dan reject (cetak ulang) yang menanggung biaya sendiri atau pelanggan.

### 2.21 Event organizer

- **Proses inti**: briefing klien, proposal dan anggaran, kontrak, kelola vendor, hari-H, penagihan, laporan.
- **Data utama**: acara, anggaran dan realisasi, vendor, kontrak, run-down, kru/freelance, peserta/tiket, DP dan pelunasan klien.
- **Peran**: direktur, project manager, koordinator, vendor, kru lepas, finance, klien.
- **Persetujuan**: anggaran, pembayaran vendor, pengeluaran lapangan.
- **Laporan**: laba per acara, anggaran vs realisasi, pembayaran vendor, piutang klien, peserta/tiket terjual.
- **Istilah**: run-down, vendor, rundown, DP, kru lepas, GR (guest relation), loading, hari-H, TOR.
- **Kerumitan**:
  1. Anggaran terdiri dari banyak vendor dengan DP dan pelunasan bertahap, sering tunai di lapangan.
  2. Pendapatan terkonsentrasi di sekitar hari-H, sedangkan biaya keluar jauh sebelumnya (arus kas negatif dulu).
  3. Kru lepas harian banyak, bukan karyawan tetap (PPh 21 pekerja lepas, ⚠ cek perlakuan).

---

## 3. Tabel industri × modul

Kode: ● dibutuhkan inti, ○ kadang/opsional, kosong tidak perlu. Penilaian ini hasil analisis, bukan data survei ⚠.

Modul: Keu = keuangan/akuntansi, Jual = penjualan/invoice, Beli = pembelian, Stok = persediaan, Prod = produksi, SDM = SDM dan gaji, Proy = proyek, Aset = aset tetap, CRM, POS = kasir, Dok = dokumen/kontrak, Res = reservasi/jadwal, Izin = perizinan/kepatuhan.

| Industri | Keu | Jual | Beli | Stok | Prod | SDM | Proy | Aset | CRM | POS | Dok | Res | Izin |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Ritel | ● | ● | ● | ● |  | ● |  | ○ | ○ | ● | ○ |  | ○ |
| F&B | ● | ● | ● | ● | ○ | ● |  | ○ | ○ | ● |  | ○ | ● |
| Manufaktur | ● | ● | ● | ● | ● | ● | ○ | ● | ○ |  | ○ |  | ● |
| Jasa profesional | ● | ● | ○ |  |  | ● | ● | ○ | ● |  | ● | ○ |  |
| Konstruksi | ● | ● | ● | ● |  | ● | ● | ● | ○ |  | ● |  | ● |
| Distributor | ● | ● | ● | ● |  | ● |  | ○ | ● | ○ | ○ |  | ○ |
| Logistik | ● | ● | ○ | ○ |  | ● |  | ● | ● |  | ● | ○ | ● |
| Klinik/apotek | ● | ● | ● | ● |  | ● |  | ● | ● | ● | ● | ● | ● |
| Pendidikan swasta | ● | ● | ○ |  |  | ● |  | ● | ● |  | ● | ● | ● |
| Pertanian | ● | ● | ● | ● | ○ | ● | ○ | ● |  |  | ○ |  | ● |
| Properti/kos | ● | ● |  |  |  | ○ |  | ● | ● |  | ● | ○ | ○ |
| Hospitality | ● | ● | ● | ● |  | ● |  | ● | ● | ● | ● | ● | ● |
| Startup/software | ● | ● | ○ |  |  | ● | ● | ○ | ● |  | ● |  |  |
| NGO | ● | ○ | ● |  |  | ● | ● | ○ | ● |  | ● |  | ○ |
| Franchise | ● | ● | ○ | ○ |  | ● |  | ○ | ● | ○ | ● |  | ● |
| Holding | ● | ○ |  |  |  | ○ |  | ● | ○ |  | ● |  | ● |
| Seller e-commerce | ● | ● | ● | ● |  | ○ |  |  | ○ | ○ |  |  |  |
| Bengkel | ● | ● | ● | ● |  | ● |  | ○ | ● | ● |  | ○ |  |
| Salon/spa | ● | ● | ○ | ○ |  | ● |  |  | ● | ● |  | ● | ○ |
| Percetakan/konveksi | ● | ● | ● | ● | ● | ● | ○ | ● | ○ |  | ○ |  |  |
| Event organizer | ● | ● | ● |  |  | ○ | ● |  | ● |  | ● | ○ |  |

Pola yang terlihat: kolom Keu, Jual, SDM, Dok, CRM hampir selalu terisi. Kolom Prod, Res, dan POS hanya untuk sebagian industri.

---

## 4. Pola yang sama versus yang spesifik

### 4.1 Kandidat inti platform (ada di hampir semua perusahaan)

1. **Entitas dan tenant**: perusahaan (satu atau banyak per pemilik), cabang/outlet/lokasi, bentuk hukum, NPWP, NIB, KBLI sebagai data.
2. **Orang dan akses**: pengguna, peran, izin per entitas dan cabang, undangan, log aktivitas. Satu orang bisa punya peran berbeda di entitas berbeda.
3. **Pihak (party)**: pelanggan, pemasok, karyawan, mitra, sebagai satu tabel pihak dengan peran. Ini dasar CRM, piutang, utang.
4. **Akuntansi inti**: bagan akun yang bisa diganti per bentuk hukum (PT/CV/koperasi/yayasan), jurnal ganda, periode, mata uang, pajak sebagai aturan data (PPN, PPh final, PPh 23), laporan laba rugi, neraca, arus kas, utang piutang dan umur.
5. **Dokumen transaksi umum**: penawaran, pesanan, faktur, bukti bayar, nota debit/kredit, dengan status dan penomoran per seri.
6. **Barang dan jasa (katalog)**: item dengan satuan, harga bertingkat, pajak. Stok sebagai opsi per item.
7. **Persetujuan (workflow)**: aturan "siapa menyetujui apa di atas nilai berapa" sebagai data. Hampir tiap industri butuh (diskon, pembelian, retur, kasbon).
8. **Kas dan bank**: rekening, kas kecil, kasbon, rekonsiliasi, pembayaran, setoran.
9. **SDM dan gaji dasar**: karyawan, kontrak, absensi, cuti, gaji, THR, BPJS, PPh 21 (TER), lembur. Aturan: UMP/UMK, THR satu bulan gaji untuk masa kerja 12 bulan ke atas, JHT 3,7% pemberi kerja dan 2% pekerja, JP 2% dan 1%, JKK 0,24 sampai 1,74%, JKM 0,3% (sumber 2026, ⚠ cek aturan tiap komponen).
10. **Aset tetap dan penyusutan**.
11. **Dokumen dan kontrak**: penyimpanan, versi, tanggal jatuh tempo, pengingat (kontrak, izin, sertifikat).
12. **Kepatuhan dan kalender**: pengingat pajak bulanan dan tahunan, izin kedaluwarsa, NIB/KBLI.
13. **Laporan dan dasbor yang bisa disusun**: angka harian pemilik dari data inti.
14. **Offline dan HP**: pemilik UMKM bekerja dari ponsel, jaringan tak stabil.
15. **Bahasa dan format Indonesia**: rupiah, tanggal, istilah, faktur/nota, cetak thermal.

### 4.2 Kandidat plugin/template (spesifik industri)

| Plugin/template | Industri utama | Isi |
|---|---|---|
| Kasir (POS) dan shift | ritel, F&B, salon, bengkel | antarmuka cepat, offline, struk, tutup shift |
| Resep/BOM bahan baku | F&B, manufaktur, konveksi | stok berkurang lewat komposisi |
| Produksi dan work order | manufaktur, percetakan, konveksi | routing, WIP, upah borongan |
| Satuan ganda dan harga bertingkat | ritel, distributor | konversi dus-pcs, harga per level |
| Kanvas dan tagihan sales | distributor | rute, plafon, giro, kolektor |
| RAB, progres, termin, retensi | konstruksi, EO | pengakuan pendapatan per progres |
| Timesheet dan tagih per proyek | jasa, agensi, software | jam per tarif, termin |
| Reservasi, kalender kamar/sumber daya | hospitality, salon, klinik | ketersediaan, tarif musiman, channel manager |
| Folio dan night audit | hotel | tagihan tamu, penutupan harian |
| Rekam medis dan penjamin | klinik | RME, BPJS, SATUSEHAT, batch obat |
| Tagihan berulang dan kontrak sewa | properti, sekolah | deposit, meteran, tunggakan |
| Resi, rute, COD | logistik | AWB, POD, setoran |
| Siklus tanam dan panen | pertanian | blok, input, hasil, grade |
| Akuntansi dana dan hibah | NGO, yayasan | alokasi biaya ke donor |
| Royalti dan multi-outlet | franchise | royalti dari penjualan |
| Konsolidasi dan intercompany | holding | eliminasi, laporan grup |
| Integrasi marketplace | seller online, F&B | sinkron stok, rekonsiliasi pencairan |
| Pajak khusus | konstruksi, sewa, hotel, restoran | PPh final konstruksi, PPh sewa 10%, PBJT |
| Koperasi (simpanan, SHU, RAT) | koperasi | anggota, simpanan, pembagian SHU |
| Kepatuhan halal/SLHS/izin sektoral | F&B, klinik, pertanian | masa berlaku dan dokumen |

Aturan praktis memilah: bila fitur dipakai lebih dari separuh industri dan tidak mengubah model data inti, masuk inti. Bila ia menambah tabel dan layar baru yang tidak dipakai industri lain, jadikan plugin. Pajak khusus sebaiknya sebagai paket aturan (data), bukan kode.

---

## 5. Sumber

Aturan dan pajak:

- Kriteria UMKM PP 7/2021: https://www.hukumonline.com/klinik/a/kriteria-umkm-terbaru-lt697a59963bdc9/ dan https://news.ddtc.co.id/jokowi-resmi-membarui-kriteria-umkm-begini-perinciannya-27949 (hasil pencarian, ringkasan; data tahun 2021)
- PT Perorangan: https://www.hukumonline.com/berita/a/pahami--ini-poin-poin-penting-pendirian-pt-perorangan-lt604c87bb647da/ , https://www.hukumonline.com/berita/a/ingin-mendirikan-pt-perorangan-7-hal-ini-harus-disiapkan-lt611a41f984552 , https://smartlegal.id/badan-usaha/2025/07/17/pt-perorangan-apakah-ada-akta-pendirian-ini-dokumen-legalitas-yang-harus-ada-sl/ (biaya dan waktu AHU dari blog, ⚠)
- PPh final UMKM PP 55/2022 (0,5%, Rp500 juta, batas waktu 7/4/3 tahun): https://news.ddtc.co.id/berita/nasional/1794989/omzet-umkm-di-bawah-rp500-juta-tak-perlu-bayar-pajak-djp-ingatkan-ini , https://pajak.go.id/sites/default/files/2024-01/SP-3_2024%20DJP%20Perjelas%20Teknis%20Pengaturan%20Pajak%20UMKM.pdf
- Perpanjangan insentif sampai akhir 2025 (berita 16 Desember 2024): https://jabar.antaranews.com/berita/566641/pemerintah-resmi-memperpanjang-masa-berlaku-pph-final-05-persen-bagi-umkm
- Batas PKP Rp4,8 miliar dan usul Bank Dunia (Juli 2026): https://news.ddtc.co.id/djp-kembali-wacanakan-ubah-batas-omzet-pkp-rp48-m-bakal-diturunkan-42665 , https://ikpi.or.id/bank-dunia-usul-ambang-batas-pkp-dipangkas-jadi-rp-500-juta/
- Marketplace pungut PPh 22 (PMK 37/2025): https://news.ddtc.co.id/berita/nasional/1820176/ini-kriteria-pedagang-online-di-marketplace-yang-akan-dipungut-pajak , https://ikpi.or.id/en/pedagang-online-tak-perlu-repot-pajak-kini-dipungut-otomatis-oleh-marketplace/
- PPh final jasa konstruksi (PP 9/2022): https://www.pajak.go.id/en/node/84969 , https://news.ddtc.co.id/berita/nasional/37286/jenis-jasa-konstruksi-yang-kena-pph-final-disesuaikan-simak-detailnya
- PPh final sewa tanah dan bangunan 10% (PP 34/2017): https://news.ddtc.co.id/berita/nasional/1802655/ingat-biaya-service-charge-masuk-dalam-hitungan-pajak-sewa-bangunan , https://news.ddtc.co.id/literasi/kelas-pajak/39122/pajak-atas-persewaan-tanah-danatau-bangunan
- Barang dan jasa bebas PPN (UU HPP): https://www.online-pajak.com/tentang-efaktur-ppn/jasa-yang-tidak-dikenakan-ppn/ , https://www.pajak.com/pajak/ketentuan-barang-dan-jasa-yang-tidak-kena-ppn/
- Pajak ekspedisi/freight forwarding (PMK 11/2025, PPh 23): https://klikpajak.id/blog/pajak-jasa-freight-forwarding/ , https://klikpajak.id/blog/ketahui-ppn-dan-pph-pasal-23-atas-pajak-usaha-ekspedisi/ (blog, ⚠)
- Pajak restoran dan hotel, PBJT maksimum 10%, service charge: https://klikpajak.id/blog/pajak-restoran-pengertian-tarif-hitung-bayar-dan-lapor-pb1/ , https://klikpajak.id/blog/pajak-usaha-hotel (blog, ⚠ tarif aktual per perda)
- Pungutan wisatawan asing Bali (Perda 6/2023, diubah Perda 2/2025): https://news.ddtc.co.id/berita/daerah/1809649/pungutan-turis-asing-gubernur-setiap-desa-adat-kini-dapat-rp300-juta , https://berkas.dpr.go.id/pusaka/files/info_singkat/Info%20Singkat-XVII-19-I-P3DI-Oktober-2025-246.pdf
- Koperasi (pajak, SHU, Koperasi Merah Putih): https://news.ddtc.co.id/berita/nasional/1809792/simak-lagi-ketentuan-tarif-pajak-atas-bunga-simpanan-koperasi , https://pajak.go.id/sites/default/files/2026-07/Aspek%20Perpajakan%20Koperasi%20Merah%20Putih.pdf , https://tirto.id/mengenal-sisa-hasil-usaha-shu-cara-pembagian-dan-contohnya-gnKJ
- BUMDes (PP 11/2021): https://www.hukumonline.com/klinik/a/begini-tata-cara-pendirian-bum-desa-lt64ca33c75b530/
- Yayasan dan usaha (UU 28/2004): https://www.hukumonline.com/klinik/a/yayasan-dan-usaha-lt4fe2cf33e850f/ , https://smartlegal.id/badan-usaha/pendirian-yayasan/2021/03/29/panduan-bagi-yayasan-untuk-menjalankan-bisnis/
- KPPA, PT PMA, BUT: https://izin.co.id/blog/penjelasan-pma-pmdn-kppa/ , https://smartlegal.id/badan-usaha/2024/07/09/menilik-apa-saja-perbedaan-antara-pt-pma-dengan-kppa/ (blog, angka modal PMA ⚠ bisa sudah berubah)
- Perizinan berbasis risiko, NIB, KBLI (PP 28/2025): https://dpb.unpad.ac.id/wp-content/uploads/2026/06/Sosialisasi-PP-28-Tahun-2025-Perizinan-Berusaha-Berbasis-Risiko-dan-Perizinan-Berusaha-Untuk-Menunjang-Kegiatan-Usaha-PB-UMKU.pdf , https://izin.co.id/blog/panduan-lengkap-perizinan-usaha-di-indonesia/
- Sertifikasi halal wajib (tonggak Oktober 2026): https://bpjph.halal.go.id/read/sambut-wajib-halal-oktober-2026-kepala-bpjph-serukan-tertib-halal-sebagai-strategi-penguatan-bisnis , https://www.kompas.tv/info-publik/646130/oktober-2026-wajib-halal-berlaku-ini-daftar-produk-yang-harus-bersertifikat , https://babel.antaranews.com/berita/408924/menag-penundaan-sertifikasi-halal-bentuk-keberpihakan-pemerintah (tanggal tepat dan penundaan: ⚠)
- Standar akuntansi SAK EMKM, ETAP, EP: https://www.jurnal.id/id/blog/standar-akuntansi-keuangan-sak/
- Kesehatan (SATUSEHAT, RME): https://govinsider.asia/indo-en/article/ata-riwayat-kesehatan-di-dalam-genggaman , https://www.jpnn.com/news/infokes-hadirkan-aplikasi-rekam-medis-elektronik-eclinic-leap
- Gaji, THR, BPJS, UMP 2026: https://www.gadjian.com/blog/2026/01/22/konsultasi-hr-pedoman-payroll-compliance-2026/ , https://www.secondtalent.com/resources/indonesia-payroll-benefits-tax/ (sumber sekunder, ⚠ cek ke BPJS Ketenagakerjaan dan Kemnaker)

Bagian tanpa sumber web (pengetahuan domain/analisis, seluruh "proses inti, data utama, peran, persetujuan, laporan, istilah, kerumitan" kecuali klaim hukum yang tercantum di atas): perlu validasi lewat wawancara dengan pelaku usaha tiap industri sebelum dijadikan spesifikasi.

## 6. Daftar ⚠ yang harus ditutup sebelum dipakai

1. Kelanjutan PPh final 0,5% setelah 2025 dan kondisi saat ini (Oktober 2026).
2. Apakah ada aturan baru pengganti PP 7/2021 untuk kriteria UMKM.
3. Tanggal pasti wajib halal tahap UMK dan apakah ada penundaan.
4. KBLI 2025 menggantikan KBLI 2020: tanggal transisi.
5. Tarif PBJT hotel, restoran, dan service charge per daerah (khusus Bali: perda kabupaten).
6. PMK 11/2025 PPN 1,1% freight forwarding dan tarif PPh 23 per jenis jasa.
7. Modal minimum PT PMA dan kewajiban LKPM.
8. Perlakuan SAK koperasi dan ISAK 35 untuk yayasan/NGO.
9. Retensi konstruksi (5%) dan syarat SBU/SKK terbaru.
10. Perlakuan PPh 21 untuk pekerja lepas harian.
