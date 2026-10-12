# R7. Panduan wawancara pemilik usaha dan akuntan

Tujuan: menguji 12 pernyataan masalah di R4 §6.1, memilih industri awal, dan menentukan urutan prioritas fitur sebelum desain dibekukan (`docs/design/company/05-roadmap.md`). Ini panduan, bukan skrip kaku. Semua angka dan klaim yang muncul dari narasumber dicatat sebagai pengakuan mereka, bukan fakta.

## Aturan main
1. **Tanya yang sudah terjadi, bukan yang akan.** "Ceritakan transaksi terakhir kemarin" lebih jujur daripada "Kalau ada aplikasi X, kamu mau pakai?". Orang pasti bilang mau.
2. **Jangan jualan.** Jangan sebut Rangka atau fitur. Kalau diminta, jawab "masih riset".
3. **Minta lihat, bukan cuma cerita.** Buku nota, Excel, grup WhatsApp, layar aplikasi yang dipakai. Minta versi yang datanya disamarkan.
4. **Diam setelah bertanya.** Biarkan jeda. Jangan mengisi jawaban untuk mereka.
5. **Cari kejadian nyata dan biayanya:** kapan terakhir salah, berapa rupiah atau jam hilang, apa yang dilakukan setelahnya.
6. **Izin dan privasi.** Minta izin sebelum merekam. Jangan catat data pelanggan atau karyawan mereka (nama, KTP, gaji per orang). Cukup pola dan angka kasar. Nama narasumber disamarkan di catatan.
7. **Catat kata-kata mereka persis** untuk keluhan. Itu bahan teks UI dan pemasaran nanti.

## Siapa yang diwawancarai
| Kelompok | Jumlah | Catatan |
|---|---|---|
| Pemilik usaha kecil (1 sampai 20 orang) | 12 sampai 15 | Sebar minimal 4 industri (toko/distributor, bengkel/jasa, F&B, kontraktor kecil, klinik, produksi kecil). Maksimal 3 per industri di putaran pertama |
| Pemilik/manajer usaha menengah (20 sampai 200) | 3 sampai 5 | Untuk menilai apakah fase M layak |
| Akuntan atau konsultan pajak (internal dan eksternal) | 5 | Minimal 2 yang melayani banyak klien kecil |
| Kontrol: yang pernah **berhenti** memakai aplikasi akuntansi/ERP | 2 sampai 3 | Paling kaya informasi tentang biaya pindah |

Campur: yang sudah pakai aplikasi, yang masih Excel, yang masih buku/WhatsApp. Hindari hanya teman dekat (jawabannya terlalu sopan).

## A. Wawancara pemilik usaha (45 sampai 60 menit)

**1. Pemanasan dan profil (5 menit)**
- Usahanya apa, sudah berapa lama, berapa orang, berapa cabang/lokasi?
- Kamu sendiri sehari-hari mengerjakan apa?
- Bentuk usahanya (perorangan, CV, PT)? Ada NPWP/NIB? (hanya ya/tidak)

**2. Satu hari dan satu transaksi (10 menit)**
- Ceritakan transaksi terakhir dari awal sampai uangnya masuk. Siapa yang mencatat, di mana, kapan?
- Terakhir kali kamu ingin tahu "hari ini untung berapa" atau "siapa belum bayar", kamu cari di mana, berapa lama?
- Barang/stok: bagaimana tahu sisa stok? Kapan terakhir stok di catatan tidak sama dengan di rak?

**3. Alat yang dipakai sekarang (10 menit)**
- Tunjukkan alat atau berkas yang kamu pakai (buku, Excel, aplikasi kasir, aplikasi akuntansi, WhatsApp).
- Siapa yang membuatnya, kapan terakhir diubah, siapa yang berani mengubahnya?
- Kalau yang punya Excel itu tidak masuk, apa yang terjadi?
- Pernah coba aplikasi lain? Kenapa berhenti atau kenapa tidak jadi? Apa yang akhirnya dilakukan?

**4. Rasa sakit dan biayanya (10 menit)**
- Bagian mana yang paling melelahkan atau paling sering salah?
- Kejadian terakhir: apa yang terjadi, berapa rupiah/jam hilang, bagaimana diselesaikan?
- Laporan apa yang kamu butuhkan tapi sulit didapat? Dibuat oleh siapa, berapa lama?
- Pernah ada selisih kas/stok/tagihan yang lama tidak ketahuan?

**5. Orang dan akses (5 menit)**
- Siapa saja yang mencatat? Pakai HP apa? Sinyal di lokasi bagaimana?
- Ada hal yang tidak mau diperlihatkan ke staf (harga modal, gaji, laba)? Bagaimana sekarang menjaganya?
- Ada persetujuan (diskon, belanja, kasbon)? Siapa yang menyetujui dan lewat apa?

**6. Pajak, gaji, dan akuntan (5 menit)**
- Siapa yang mengurus pajak dan pembukuan? Seberapa sering? Berapa biayanya (kisaran)?
- Apa yang kamu serahkan ke akuntan setiap bulan, dalam bentuk apa?
- Faktur pajak, gaji karyawan, BPJS: dikerjakan sendiri atau pihak lain?

**7. Harga dan keputusan membeli (5 menit)**
- Berapa yang sekarang kamu keluarkan per bulan untuk alat-alat itu?
- Berapa orang yang kamu mau pakai sistem? Kalau harganya per orang, bagaimana?
- Siapa yang memutuskan membeli? Apa yang harus terbukti dulu?

**8. Penutup (3 menit)**
- Kalau satu hal saja bisa kamu perbaiki minggu ini, apa?
- Siapa lagi yang sebaiknya saya ajak bicara? (pemilik lain, akuntan Anda)
- Boleh saya lihat contoh berkas/laporan Anda (data disamarkan)? Boleh dihubungi lagi?

## B. Wawancara akuntan / konsultan pajak (45 menit)
1. Berapa klien, jenis usahanya apa, ukuran kira-kira?
2. Data klien sampai ke Anda dalam bentuk apa (foto nota, Excel, ekspor aplikasi, WhatsApp)? Berapa persen yang siap pakai?
3. Kesalahan paling sering di data klien? Contoh terakhir dan berapa jam memperbaikinya.
4. Aplikasi yang Anda pakai dan yang dipakai klien. Mana yang Anda suruh klien pindah? Kenapa? Mana yang Anda hindari?
5. Pajak: PPh final UMKM, PPN, PPh 21, faktur pajak. Bagian mana yang paling sering berubah atau membingungkan? Bagaimana mengikuti perubahan aturan? (catat sumber yang mereka percaya, jangan terima angka tanpa teks aturan)
6. Coretax: apa yang bermasalah bagi klien Anda sekarang?
7. Apa yang harus ada supaya Anda **percaya** angka dari sistem klien: jejak audit, periode terkunci, ekspor tertentu, akses baca sendiri?
8. Seberapa penting Anda bisa mengakses banyak klien dari satu login?
9. Bagaimana Anda dibayar dan apakah alat yang membuat klien lebih rapi mengurangi atau menambah pekerjaan Anda?
10. Kalau klien keluar dari aplikasinya, data apa yang paling susah dibawa?

## C. Wawancara yang pernah berhenti memakai aplikasi (30 menit)
- Aplikasi apa, berapa lama, kenapa mulai, kenapa berhenti? Pemicu berhentinya apa persisnya?
- Apa yang dibawa saat pindah (data apa, hilang apa)? Berapa hari/jam/uang?
- Apa yang sekarang dipakai pengganti?
- Apa yang harus berbeda supaya Anda mau mencoba lagi?

## Hipotesis yang diuji (cocokkan dengan R4 §6.1)
| # | Hipotesis | Sinyal kuat | Sinyal membantah |
|---|---|---|---|
| 1 | Mereka mau mulai dari berkas Excel sendiri | Menunjukkan Excel yang dipelihara bertahun-tahun, takut kehilangan "caranya" | Excel hanya dibuat asal dan tak dipakai |
| 2 | Cukup satu proses dulu | Menyebut satu proses spesifik (tagih, stok, kasir) sebagai pemicu | Ingin "semuanya sekaligus" |
| 3 | Mengubah status/kolom sendiri itu penting | Pernah minta vendor/konsultan ubah hal kecil, lama atau mahal | Tak pernah butuh mengubah |
| 5 | Harga per kursi menghalangi | Staf lapangan tetap pakai WhatsApp karena tak ada kursi | Jumlah pemakai memang sedikit |
| 6 | Offline penting | Sinyal buruk menghambat pencatatan | Sinyal sudah cukup |
| 8 | Laporan lari ke Excel | Mengekspor lalu membuat laporan sendiri tiap bulan | Puas dengan laporan bawaan |
| 11 | Takut sulit pindah | Menolak aplikasi karena "datanya terkunci" | Tak peduli |
| 9 | Izin per cabang/nilai jadi masalah | Memberi akses terlalu sedikit/terlalu banyak | Cukup pemilik dan kasir |

## Setelah wawancara
- Catat per wawancara: profil singkat (industri, ukuran), alat, 3 kejadian nyata beserta biaya, kutipan, hipotesis yang didukung/dibantah. Simpan di `docs/research/company/wawancara/` dengan nama samaran (tanpa data pribadi).
- Setelah 8 wawancara, berhenti dan sintesis: apa yang berulang minimal 3 kali? Itu yang masuk prioritas. Sekali saja = anekdot.
- Putuskan: industri awal, 3 fitur MVP, apakah per-kursi vs per-perusahaan layak, dan perbarui `05-roadmap.md`.
- Pemberi harga: tanyakan **tindakan** (mau ikut uji coba 2 minggu dengan data nyata?), bukan janji. Janji itu murah.

## Kesalahan yang sering terjadi
- Bertanya "Apakah kamu mau fitur X?" (jawabannya selalu ya).
- Hanya mewawancarai orang yang mirip kamu.
- Menganggap keluhan tentang aplikasi kompetitor sama dengan kemauan pindah (R4 §6.2).
- Mencatat angka pajak dari narasumber sebagai fakta. Cek ke teks resmi dulu.
