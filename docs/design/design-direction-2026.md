# Arah desain 2026: "Pulau Belajar"

Dokumen ini menggantikan penilaian visual sebelumnya. Dibuat setelah (1) membaca pemenang Awwwards Site of the Day akhir September–awal Oktober 2026 dan Apple Design Awards 2026, (2) menilai layar EduSmart sendiri seperti orang yang baru membukanya.

## 1. Apa yang dilakukan desainer profesional (bahan riset)

| Sumber | Yang dipelajari |
|---|---|
| Messenger (abeto, Site of the Year 2025) | Satu dunia kecil dengan cerita ("planet kecil, ada kiriman yang harus diantar"), karakter bisa diatur, palet hanya 2 warna lembut, gerak diberi nilai 9/10. Situs terasa seperti game, bukan brosur. |
| Colonia Zacamil (SOTD 1 Okt) | Navigasi berupa peta; sakelar siang/malam dan "dulu/kini" mengubah seluruh suasana. Palet dua warna. |
| The Tie-break (SOTD 25 Sep) | Belanja diganti permainan; transisi layar penuh bernilai 9,2/10. |
| Butter, Milledollars | Dua warna saja (arang + putih tulang), semua kekuatan ada di tipografi, ritme, dan video/gerak. |
| By-Kin, Uncommon, Mat Voyce | Tipografi besar yang bergerak mengikuti gulir; transisi diperlakukan sebagai gerak kamera; 3D hanya sebagai suasana, bukan pamer. |
| Apple Design Awards 2026 (Sago Mini Jinja's Garden, grug, (Not Boring) Camera) | Anak 3–6 tahun bisa memakai tanpa membaca: gestur geser, tombol raksasa, haptik, kejutan kecil (Easter egg). Karya "Delight" selalu punya kepribadian satu orang, bukan templat. |
| Duolingo | Karakter yang bereaksi (state machine), bentuk bulat sederhana, ekspresi di mata. |
| Prinsip umum juri | "Art direction memberi alasan, gerak terarah memberi hidup, performa menjaga tetap hidup di perangkat nyata." Aksesibilitas adalah nilai terendah hampir semua pemenang (6–6,6/10): ini celah yang bisa kita menangkan. |

## 2. Penilaian jujur terhadap EduSmart sebelum perubahan ini

- **Landing**: bentuknya templat SaaS (latar putih, tombol biru, kartu seragam, tabel harga). Tidak ada satu pun momen yang diingat. Maskot kecil di pojok, hero berupa daftar kartu. Tidak ada cerita, tidak ada dunia.
- **Jalur belajar murid**: ide benar (simpul berkelok), tetapi bundaran melayang di latar polos. Tidak ada tanah, jalan, pemandangan, atau rasa "aku sedang berjalan ke suatu tempat". Maskot hanya menempel di kartu.
- **Seluruh aplikasi**: warna ditaruh sebagai tema, bukan sebagai dunia. Gerak ada, tetapi tidak terarah.

## 3. Konsep: Pulau Belajar

Murid adalah penjelajah di sebuah pulau kecil yang hidup; **Pena** (burung hantu) adalah pemandu. Setiap mata pelajaran adalah wilayah di pulau itu; jalur belajar adalah jalan setapak yang benar-benar melintasi pemandangan. Kemajuan = jarak yang ditempuh di peta, bukan angka di kartu.

Landing menjadi **perjalanan turun**: dari langit (hero), menyusuri jalan setapak yang tergambar saat digulir, melewati "pos" (murid, guru, ilmu belajar, AI, tampilan, sekolah) sampai ke gerbang daftar.

### Prinsip
1. **Satu dunia, bukan kumpulan kartu.** Elemen utama adalah ilustrasi berlapis (langit, bukit, jalan, pohon, air) dengan paralaks, bukan kotak berbayang.
2. **Palet sempit per adegan** (2–3 warna + satu aksen), mengikuti tema yang dipilih; langit berubah menurut jam WIB (pagi, siang, sore, malam).
3. **Tipografi sebagai arsitektur**: judul sangat besar, kata-kata naik satu per satu, angka pos berukuran raksasa.
4. **Gerak sebagai kamera**: gulir menggerakkan lapisan dengan kecepatan berbeda; jalan setapak tergambar mengikuti gulir; tidak ada gerak yang tidak punya makna.
5. **Permainan, bukan penjelasan**: elemen bisa disentuh (ganti dunia/tema langsung di landing, Pena menoleh ke kursor, simpul berbunyi/bergetar).
6. **Tanpa membaca bila bisa**: ikon, bentuk, dan warna membawa makna; teks pendamping.
7. **Aksesibilitas adalah keunggulan**: kontras lolos axe di semua tema, `prefers-reduced-motion` mematikan paralaks dan gambar-jalan, semua ilustrasi `aria-hidden`, fokus papan ketik terlihat.
8. **Ringan**: ilustrasi SVG/CSS tanpa unduhan gambar; 3D hanya Pena (sudah ada gerbang kemampuan perangkat).

## 4. Urutan kerja
1. Hero landing "Pulau": langit berjam, bukit berlapis, jalan, Pena, judul raksasa.
2. Perjalanan landing: jalan setapak tergambar saat gulir, pos-pos editorial, pemilih dunia langsung.
3. Jalur belajar murid: lanskap di balik simpul, jalan melintasi simpul, Pena berdiri di simpul aktif.
4. Beranda murid dan guru: satu momen unggulan per layar, bukan deretan kartu.
5. Peninjauan visual tiap langkah (400px dan 1280px), uji axe, uji gerak-berkurang.
