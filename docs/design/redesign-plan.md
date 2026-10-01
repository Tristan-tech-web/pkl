# Redesign EduSmart: analisis kebutuhan, fleksibilitas, dan rencana kerja

Dasar: `docs/research/R2-learning-science.md`, `R3-gamification-integrity.md`, `R4-design-and-3d.md`. Status ditandai ☐ belum, ◐ sedang, ☑ selesai.

## 1. Audit kondisi sekarang (jujur)
| Area | Sekarang | Kekurangan |
|---|---|---|
| Tampilan | Satu gaya "kertas buku tulis", terang/gelap. Gerak GSAP di hero dan hadiah kuis. 3D hanya demo parabola. | Tidak ada tema, tidak ada identitas sekolah, tidak ada nuansa anak/remaja, murid dan guru melihat desain yang sama. |
| Peta belajar | Daftar kartu vertikal berkelompok per tingkat prasyarat. Simpul: `competency_nodes` + `competency_prerequisites`, status draf/terbit. | Bukan jalur ala Duolingo; tidak ada unit, jenis simpul (persiapan, latihan, boss), tidak ada jadwal buka, tidak ada jalur ulang berjarak. |
| Guru membuat skill tree | Bisa membuat simpul, prasyarat, pelajaran, soal secara manual; draf AI dari berkas; "rencana belajar" AI (bab, strategi, jadwal) sudah ada. | Rencana belum menjadi **pohon simpul bertanggal**; tidak ada editor visual; tidak ada pratinjau "begini tampilan murid". **Jawaban: belum seperti Duolingo.** |
| Bank soal | Soal hanya melekat pada satu simpul (≤ puluhan). | Tidak ada bank ribuan soal, tidak ada penjadwal ulang, tidak ada kalibrasi kesulitan. |
| XP | Diberikan dari percobaan kuis; tak ada batas harian, tak ada pengembalian menurun; kuis bisa diulang menimbun XP. | Rentan farming; tidak ada deteksi kecurangan. |
| Halaman murid | Peta, kuis, liga, jadwal, nilai, tutor, ujian. | Tidak ada beranda "hari ini", misi harian, profil/avatar, kustomisasi, hitung mundur simpul berikutnya. |
| Halaman guru | Banyak modul (nilai, absensi, rapor, berkas, rencana, ujian). | Tidak ada beranda "hari ini + siapa perlu perhatian", tidak ada antrean integritas, navigasi ramai untuk usia lanjut. |

## 2. Persona dan kebutuhan
| Persona | Kebutuhan utama | Prinsip desain |
|---|---|---|
| Murid SD | Cepat paham, tombol besar, suara dan gerak lucu, tidak membaca banyak | Ceria; 1 aksi per layar; maskot memandu |
| Murid SMP–SMA | Status, tantangan, kustomisasi, liga, tidak merasa "kekanak-kanakan" | Seru; padat tapi rapi; pilihan tampilan banyak |
| Guru (banyak usia lanjut) | Tahu "hari ini apa", membuat materi tanpa ribet, sedikit klik | Ringkas; teks besar; label jelas; bantuan AI satu tombol |
| Kepala sekolah/staf | Ringkasan, persetujuan, laporan | Ringkas; angka besar; 1 tugas per layar |
| Orang tua | Lihat perkembangan anak, rapor, tagihan | Ringkas; bahasa sederhana |

## 3. Fleksibilitas: siapa memilih apa
- **Sekolah** (pengelola): tema/warna sekolah, paket tema yang diizinkan, pengalaman bawaan per peran dan jenjang, kunci mode Ringkas untuk staf, aktif/tidaknya 3D, suara, kamera pengawas, aturan jendela buka (H-1 / H-2 / bebas), batas XP harian, kebijakan integritas (catat saja / tahan / kurangi).
- **Guru**: untuk kelasnya: jendela buka per mapel, tingkat pengawasan per kuis (tanpa / perilaku / +kamera), pengecualian siswa; untuk dirinya: tema, ukuran huruf, kepadatan.
- **Murid**: paket tema (dari yang diizinkan), avatar/maskot, ukuran huruf, gerak, suara, 3D on/off, mode santai (tanpa hati/streak).
- **Otomatis**: perangkat lemah, hemat data, `reduced-motion` → turunkan efek tanpa mengubah fungsi.
Penyimpanan: `school_appearance` (kebijakan) dan `user_preferences` (pilihan), digabung di server menjadi **tema efektif** yang dirender sebagai atribut `data-*` + variabel CSS (tanpa kedip).

## 4. Spesifikasi fitur belajar

### 4.1 Jalur belajar bergaya Duolingo (C1)
- **Unit** = bab (dari rencana belajar). **Simpul** berjenis: `persiapan` (pretes + ringkas), `latihan` (soal dari bank), `ulang` (berjarak, otomatis), `checkpoint` (kumulatif), `boss` (ulangan mini sebelum ulangan sungguhan), `cerita` (opsional).
- Tampilan jalur: kolom berkelok, simpul bulat besar, status (terkunci/terbuka/selesai/emas), hitung mundur "terbuka besok 15.00", mahkota/bintang, titik "Anda di sini". Variasi per tema (jalan setapak, jalur planet, sungai).
- **Aturan buka** (`unlock_rule`): `after_prereq` (selesai simpul sebelumnya) **dan** `not_before` (tanggal/jam; default H-1 15.00 WIB sebelum pertemuan jadwal mapel itu). Simpul `ulang` dibuat otomatis oleh penjadwal.
- Skema (rancangan): `path_units`, `path_nodes` (memakai `competency_nodes` yang ada + kolom `unit_id`, `node_type`, `meeting_date`, `unlock_at`, `unlock_mode`), `path_progress`, `review_state` (per siswa per butir: kotak Leitner/half-life, `due_at`).

### 4.2 AI penyusun skill tree semester (C2)
Masukan: rencana belajar (bab, elemen, jadwal), jadwal mapel (hari/jam), kalender akademik (hari libur), tanggal ulangan. Keluaran: unit → simpul bertanggal (persiapan sebelum tiap pertemuan, latihan setelahnya, ulang berjarak, checkpoint, boss), dengan **pratinjau kalender** dan editor. Guru meninjau, menggeser tanggal, menghapus/menambah, lalu **Terbitkan per unit**. Semua keluaran AI berstatus draf. Tanggal dihitung deterministik (kode), bukan oleh AI; AI hanya mengisi isi.

### 4.3 Bank soal AI (C3)
- Sumber: berkas buku/LKS/kurikulum yang sudah dibaca (potongan teks), per simpul/elemen.
- Pipeline berstep (seperti rencana belajar): potongan → butir (stem, opsi, kunci, penjelasan, tingkat Bloom, kesulitan awal, kutipan sumber) → **verifikasi**: skema, duplikat (kemiripan n-gram), **pemecahan independen oleh AI kedua** (kunci harus sama), kutipan sumber harus memuat bukti → status `draf`.
- Persetujuan: guru meninjau sampel/yang ditandai; butir "disetujui" masuk bank; murid bisa melapor soal; butir dengan laporan atau tingkat benar yang janggal ditarik.
- Skala: ribuan butir per mapel; kalibrasi kesulitan dari respons (Elo sederhana); pemilihan butir adaptif + berjarak.
- Mode siswa **Latihan** (farming XP): sesi 10 butir, campur topik, XP sesuai aturan R3-B.

### 4.4 Integritas (C4)
Sinyal perilaku (selalu), kamera di perangkat (opsional), skor risiko, tahan/batalkan/kurangi XP, banding, audit (lihat R3-C/D). Tingkat pengawasan dipilih per kuis/bank oleh guru dalam batas kebijakan sekolah.

## 5. Inventaris halaman yang dirancang ulang
- **Murid**: Beranda (misi hari ini, streak, simpul berikutnya + hitung mundur, ujian), Jalur belajar, Latihan (bank soal), Liga, Profil & Tampilan (avatar, tema), Jadwal, Tugas/Ujian, Rapor, Pengumuman, Tutor.
- **Guru**: Beranda "Hari ini" (kelas, absensi belum, perlu perhatian, antrean integritas), Skill tree (generator + editor + pratinjau murid), Bank soal (hasilkan, tinjau, setujui), Kelas (siapa tertinggal), Ujian, Nilai/Absensi/Rapor (disederhanakan).
- **Kepala sekolah/admin**: Ringkasan, Tampilan sekolah (kebijakan), Pengguna, Paket, Berkas, Keuangan.
- **Umum**: landing, masuk/daftar, halaman kosong dan galat yang ramah.

## 6. Daftar tugas dan kriteria selesai
| # | Tugas | Selesai bila |
|---|---|---|
| A1–A8 | Riset dan analisis (dokumen ini + R2–R4) | ☑ dokumen di repo |
| B1 ☑ | Arsitektur tema: token, 3 pengalaman, 9+ paket, tema efektif tanpa kedip, tabel kebijakan sekolah dan preferensi pengguna, halaman pengaturan (murid/guru/sekolah) | tes SQL RLS; Playwright: pilih tema → bertahan setelah muat ulang; kebijakan sekolah membatasi pilihan; tangkapan layar tiap tema |
| B2 | Ulang desain komponen inti (tombol, kartu, navigasi, formulir) per pengalaman | audit axe bersih; kontras terjamin tiap tema; ukuran sentuh ≥ 44 px (Ringkas ≥ 48) |
| B3 | Kit 3D prosedural (maskot, benda melayang, adegan latar, permata XP) + gerbang kemampuan | muatan three hanya di halaman yang meminta; ≥ 30 fps pada CPU throttle 4×; mode Ringkas tanpa three; `reduced-motion` statis |
| C1 | Jalur belajar + aturan buka terjadwal + simpul ulang | Playwright: simpul besok terkunci dengan hitung mundur; terbuka setelah waktunya (waktu disimulasikan); tidak mengunci balik |
| C2 | AI penyusun skill tree semester + editor + pratinjau murid | uji dengan buku 70 ribu karakter + jadwal nyata → pohon bertanggal valid, tanggal di hari pelajaran |
| C3 | Bank soal AI + tinjau + mode Latihan + penjadwal ulang + kalibrasi | ≥ 300 butir terverifikasi dari buku uji; tingkat butir yang gagal verifikasi dilaporkan; sesi latihan berjalan |
| C4 | Integritas: sinyal, skor, buku besar XP, kamera on-device, antrean guru, banding | tes SQL; uji skenario (cepat-asal, salin, tab keluar, tanpa wajah/dua wajah dengan video uji); tidak ada gambar terkirim (periksa lalu lintas) |
| D1 | Redesign murid | semua halaman murid di 3 pengalaman × (HP, desktop) ditinjau tangkapan layar |
| D2 | Redesign guru dan kepala sekolah | uji "tugas utama dalam ≤ 3 klik"; teks 150% tanpa patah |
| D3 | Landing, masuk, orang tua | tangkapan layar ditinjau |
| E | Regresi lintas peran, performa, aksesibilitas, dokumentasi | lint/typecheck/tes hijau; PROGRESS diperbarui |

Urutan: B1 → B2 → B3 → C1 → C2 → C3 → C4 → D1 → D2 → D3 → E. B1–B3 lebih dulu karena semua halaman bergantung pada sistem tema.

## 7. Risiko dan keputusan terbuka
- **Kamera + biometrik anak (UU PDP)**: perlu telaah hukum ⚠; default **mati**, hanya aktif bila sekolah menyalakan dan orang tua menyetujui.
- **XP minus**: berisiko tidak adil; pengaman R3-D wajib; mulai dengan "tahan" sebelum "kurangi".
- **Jendela H-1**: hipotesis; sediakan mode lain dan ukur.
- **Kualitas soal AI**: distraktor sering bermasalah; verifikasi dua tahap + tinjau guru.
- **Kinerja 3D di HP lemah**: gerbang kemampuan + anggaran ketat; 3D tidak pernah menjadi satu-satunya cara memahami layar.

## 8. Catatan implementasi B1 (selesai)
- Tema: `src/lib/themes.ts` (10 paket, sumber tunggal) → `scripts/gen-themes.mjs` → `src/app/themes.generated.css`; tes kontras WCAG per tema (41 tes) dan tes sinkron CSS.
- Tampilan efektif: `src/lib/appearance.ts` (bawaan ← kebijakan sekolah ← pilihan pengguna), cookie `es_look` + skrip `<head>` tanpa kedip, `AppearanceApply` pada layout `sekolah/[id]` (layout `dashboard` tidak dirender ulang antar-navigasi, jadi tidak dipakai untuk ini).
- Halaman: `/dashboard/tampilan` (pilihan pengguna, pratinjau langsung) dan `/dashboard/sekolah/[id]/tampilan` (kebijakan: warna sekolah, gaya per kelompok, tema yang diizinkan, 3D/suara/kustomisasi). Tabel `school_appearance`, `user_preferences` (tes SQL 8). Playwright m24 (8 pemeriksaan).
- Belum: komponen belum memakai token bentuk (B2); 3D belum ada (B3).
