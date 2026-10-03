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

## 5. Status (2 Okt 2026)
Selesai dan terdorong:
- Landing "Pulau Belajar": adegan berlapis menurut jam WIB (`?tod=pagi|siang|sore|malam` untuk uji), paralaks gulir/penunjuk, judul raksasa dengan garis tangan, Pena di puncak jalan; perjalanan 6 pos dengan jalan setapak yang tergambar mengikuti gulir; kurva lupa; pemilih dunia langsung (tema dan gaya mengubah seluruh halaman); paket sebagai kartu stiker dengan tabel perbandingan dilipat.
- Peta belajar murid: empat wilayah (padang, hutan, pantai, gunung) dengan dekorasi deterministik, jalan melintasi simpul (bagian ditempuh berwarna hijau), Pena di simpul aktif, keterangan simpul berlatar kartu agar terbaca.
- Beranda murid: adegan pulau ringkas; beranda guru/pemilik: pita langit + ikon garis konsisten (menggantikan emoji); halaman masuk/daftar berlatar pulau.
- Aksesibilitas: axe kontras bersih (landing 9 tema × jam, beranda murid/guru 4 jam, masuk/daftar), paralaks dan gambar-jalan mati pada `prefers-reduced-motion`/`data-motion=kurangi`.

Belum: transisi layar antar-halaman bergaya "kamera", suara/haptik opsional, Pena bereaksi (state machine) pada hasil kuis, wilayah peta untuk mapel tertentu (bukan acak), uji performa pada HP Android lemah (lapisan SVG banyak + WebGL), halaman lain (nilai, jadwal, rapor) masih bergaya ringkas lama.

## 6. Tambahan (2 Okt, sesi suara)
- Panduan suara dan penegakannya untuk teks AI: `docs/design/voice-guide.md`, `apps/web/src/lib/voice.ts`.
- Pena bereaksi: melompat saat benar/lulus, miring dan menunduk saat salah/belum lulus (`edusmart:oops`); getar singkat di HP (`lib/haptic.ts`), mati bila hemat gerak.

## 7. Catatan putaran: "kalau aku murid, apakah ini terasa spesial?" (2 Okt, malam)
Ditambahkan: pulau tumbuh menurut level dan streak (bunga mulai level 2, pohon 3, rumah 4, lentera jalan 5, kincir angin 6, api unggun menyala bila streak ≥ 1 dan membesar sampai 10 hari); Pena bicara sesuai keadaan nyata (`lib/pena-says.ts`, 6 tes); paralaks dihitung dari posisi kartu sendiri.
Penilaian jujur:
- Terasa spesial: beranda (ada "rumahku" yang tumbuh, Pena menyapa dengan kalimat yang masuk akal), peta belajar (daerah per mapel), landing.
- Belum cukup: layar kuis dan latihan (inti belajarnya) masih bergaya kartu biasa; momen naik level dan lencana belum dirayakan secara layar penuh; belum ada suara; jadwal, nilai, rapor masih datar.
- Putaran berikutnya: layar kuis/latihan sebagai "petualangan" (progres berupa langkah di jalan, soal sebagai pos), layar naik level, suara opsional (mati bawaan), jadwal/nilai/rapor.
- Layar soal latihan (`components/question-view.tsx`): jalan setapak kecil per soal (titik hijau berjejak, titik berdenyut, bendera di ujung), soal berhuruf display, opsi tombol besar yang tertekan (gaya Ceria), salah = tombol bergetar dan umpan balik kuning "Belum tepat. Tidak apa-apa." (bukan merah menghukum), benar = pop + "+10 XP" melayang. Kontras bersih 9 tema × 2 gaya. Belum: layar kuis jalur belajar (`quiz-runner.tsx`, banyak jenis soal) belum memakai komponen ini.
- Kuis jalur belajar: jejak soal dan opsi tombol besar yang sama dengan latihan; layar hasil menjadi adegan pulau (skor besar, bintang, spanduk "Naik level!" kuning, Pena melompat bila lulus dan miring bila belum). Tahap berikutnya: pembahasan per soal bergaya kartu hangat, suara opsional, jadwal/nilai/rapor.
- Liga: podium tiga teratas dengan slot kosong ("Masih kosong") dan kalimat posisi yang konkret ("Tinggal 40 XP untuk menyalip Budi S."). Kontras bersih di 9 tema.
- Pembahasan kuis jadi kartu hangat ("Yuk, bahas satu-satu"; hijau bila benar, kuning "Belum tepat. Jawabannya: ..."); Jadwal murid: kartu "Berikutnya · 2 hari lagi", hari ini ditandai, jalur warna per mapel; Nilaiku: cincin nilai per mapel, bar per penilaian, kalimat "Tinggal 10 poin lagi ke A.". Kontras bersih di 9 tema.
- Beranda orang tua: pita langit "Halo, Ibu", kartu anak dengan ringkasan satu paragraf yang disusun dari data nyata (kehadiran, materi, nilai; mapel di bawah batas tuntas disebut dengan lembut "mungkin perlu ditemani sedikit"), nilai per mapel berupa cincin; kontras bersih 9 tema. Tinjauan ulang landing 1280px: kuat; kincir angin dekat teks hero tapi tidak menimpa.
- Halaman guru yang sibuk: Pantau belajar membuka dengan vonis satu kalimat ("Semua siswa sesuai jalur..." hijau, atau "3 dari 28 siswa perlu perhatian. Mulai dari ..." kuning), aturan penandaan dilipat; Absensi berwarna per status (hadir hijau, terlambat kuning, izin biru, sakit aksen, alpa merah). Kontras bersih di 9 tema.
- Regresi teks sangat besar di 360px untuk guru, pemilik, orang tua, dan murid pada 27 halaman: satu luapan ditemukan (administrasi murid, baris data diri) dan diperbaiki; sisanya bersih.
- Profil: Pena dipajang di panggung kecil (langit, bukit, bayangan) saat didandani.
- Keadaan kosong: komponen `Empty` (Pena kecil + kalimat mengajak) menggantikan kotak putus-putus di 13 halaman; kalimat notifikasi menjadi "Sepi dulu. ...".
- Tinjauan landing "apa yang masih generik?": logo diganti Pena mini (topi toga, mata, paruh) menggantikan simbol parabola; penutup "Siap berangkat?" menjadi adegan senja (`fixedTod="sore"`) bukan blok biru polos; kincir angin digeser agar tidak menimpa teks.
- Identitas: favicon `icon.svg` (Pena mini), gambar pratinjau tautan `opengraph-image.tsx` (pulau, matahari, Pena), 404 bergaya pulau malam ("Waduh, jalannya buntu."), layar menunggu `loading.tsx` (Pena mengangguk, "Sebentar ya, Pena lagi menyiapkan.").
- Performa: adegan pulau berhenti menggambar ulang saat di luar layar (IntersectionObserver), jadi dua adegan di landing tidak bersaing. Pena 3D sudah berhenti di luar layar sejak awal. Ukur gulir landing di peramban tanpa GPU (CPU x1): rata-rata ~20 ms/frame; angka ini dibebani render WebGL perangkat lunak, belum mewakili HP nyata. Tetap perlu uji Android sungguhan.
- Halaman pengelola (pengumuman, keuangan, bank soal, rapor, ujian, materi) kontras axe bersih di 9 tema (pemilik, 54 pemeriksaan). Kata-kata halaman itu sudah dirapikan sesuai panduan suara.
- Halaman guru (nilai, form nilai, pantau, absensi, jadwal, pengumuman) kontras axe bersih di 9 tema. Form nilai di 400px dicek lewat tangkapan layar; bilah simpan memakai warna latar halaman supaya tidak terlihat seperti kotak putih.
- Transisi halaman: `template.tsx` di area sekolah membuat tiap halaman masuk dengan geser ringan dari kanan (260 ms), seperti kamera berpindah. Mati pada gerak-berkurang. Belum memakai View Transitions bawaan peramban; itu langkah berikut bila perlu.
- Gambar pratinjau tautan memakai font display yang sama dengan situs (Bricolage Grotesque ExtraBold, lisensi OFL, berkas lokal di `src/app/_og/`), bukan font bawaan generik.
- Bunyi jawaban opsional: nada pendek (benar naik, salah turun lembut, selesai tiga nada) lewat WebAudio, tanpa berkas audio. Mati bawaan; sakelar "Nyalakan bunyi" ada di Profil murid, disimpan di peramban itu saja (`lib/sound.ts`, `components/sound-toggle.tsx`). Belum diuji di perangkat nyata.
- Ukur ulang gulir landing (3 Okt, peramban tanpa GPU): CPU x1 rata-rata 16,6 ms, p95 16,8 ms (stabil 60 fps); CPU x4 rata-rata 18,9 ms, p95 33 ms. Ukuran sebelumnya (20 ms) kemungkinan noise lingkungan; pengamat layar tetap dipertahankan. Uji HP Android nyata masih perlu.
- Pemeriksaan akhir putaran (3 Okt): axe kontras 9 tema bersih untuk murid (7 halaman), pemilik (6), orang tua (3), dan guru (6). Loop desain dihentikan karena butir besar selesai; sisanya butuh pengguna: uji HP Android nyata, jalankan `supabase/pending/20261002010100_policy_split.sql`, nyalakan Leaked password protection, ganti kunci Gemini.
