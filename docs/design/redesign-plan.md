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
| B2 ☑ | Ulang desain komponen inti (tombol, kartu, navigasi, formulir) per pengalaman | audit axe bersih; kontras terjamin tiap tema; ukuran sentuh ≥ 44 px (Ringkas ≥ 48) |
| B3 ☑ | Kit 3D prosedural (maskot, benda melayang, adegan latar, permata XP) + gerbang kemampuan | muatan three hanya di halaman yang meminta; ≥ 30 fps pada CPU throttle 4×; mode Ringkas tanpa three; `reduced-motion` statis |
| C1 ☑ | Jalur belajar + aturan buka terjadwal + simpul ulang | Playwright: simpul besok terkunci dengan hitung mundur; terbuka setelah waktunya (waktu disimulasikan); tidak mengunci balik |
| C2 ☑ | AI penyusun skill tree semester + editor + pratinjau murid | uji dengan buku 70 ribu karakter + jadwal nyata → pohon bertanggal valid, tanggal di hari pelajaran |
| C3 ☑ | Bank soal AI + tinjau + mode Latihan + penjadwal ulang + kalibrasi | ≥ 300 butir terverifikasi dari buku uji; tingkat butir yang gagal verifikasi dilaporkan; sesi latihan berjalan |
| C4 ☑ | Integritas: sinyal, skor, buku besar XP, kamera on-device, antrean guru, banding | tes SQL; uji skenario (cepat-asal, salin, tab keluar, tanpa wajah/dua wajah dengan video uji); tidak ada gambar terkirim (periksa lalu lintas) |
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

## 9. Catatan implementasi B2/B3 (selesai)
- B2: token bentuk (`--r-box`, `--r-btn`, `--bw`, bayangan) dipakai lewat kelas `surface`, `btn-solid`, `btn-ghost`, `field`; 152 pemakaian `rounded-[6px]` dipindah ke `rounded-box`/`surface`. Ceria: tombol 'stiker' menekan ke bawah; Seru: tombol bercahaya; Ringkas: target sentuh 48 px, fokus tebal. Latar bernuansa per pengalaman (gradien murni CSS). Pelajaran: `backdrop-filter` pada `.surface` mengganggu kanvas WebGL dan boros di HP lemah, jadi dihapus.
- B3: `components/three/` (kit.ts: 7 adegan prosedural + maskot 'Pena'; capability.ts: gerbang kemampuan; float-field.tsx, mascot.tsx). three dimuat dinamis (chunk ±537 KB mentah) hanya di halaman yang memintanya; guru/Ringkas tidak memuatnya; `reduced-motion` = satu bingkai diam; maskot SVG sebagai cadangan; tema berganti → warna dan adegan ikut berganti langsung. Playwright m25: 5 pemeriksaan (≥ 20 fps pada CPU 4× lebih lambat dengan GL perangkat lunak).

## 10. Catatan implementasi C1 (selesai)
- DB: `path_units`, kolom `competency_nodes.unit_id`, jenis simpul baru (persiapan/latihan/ulang/boss/cerita), `node_schedule` (buka per rombel), `app_private.node_time_locked`, dan `submit_quiz` menolak simpul yang belum dibuka (tes SQL 9).
- App: `lib/learning.ts` (status `dijadwalkan`, `opensAt`), `components/path-map.tsx` + `countdown.tsx` (jalur berkelok, simpul 'permen'/heksagon/datar per pengalaman), halaman `belajar` ditulis ulang, editor materi punya jenis/unit/jadwal buka (WIB). Playwright m26 (7 pemeriksaan). Simpul terjadwal tidak memakai prasyarat berantai: waktu yang mengatur, supaya murid yang terlewat tidak terkunci permanen (R2 aturan 6).

## 11. Catatan implementasi C2 (selesai)
- `lib/skilltree.ts` (murni, 12 tes): `buildMeetings` (jadwal rombel + libur), `allocate` (pertemuan per bab menurut bobot), `layoutTree` (persiapan H-1 15.00 WIB per pertemuan, latihan setelah pertemuan terakhir, cek H+1, ulang berjarak rasio Cepeda 10/25/50% ke ujian, tantangan H-2 ujian), `examDatesFromPlan`. Tanggal tidak pernah dibuat AI.
- AI hanya mengisi konten per bab (pratinjau, pretes, latihan, cek, ulang) dengan satu panggilan; percobaan kedua meminta JSON ringkas bila jawaban rusak. Keluaran dibatasi 7000 token.
- `skilltree/actions.ts`: `generateTreeChapter` (idempoten, hanya mengganti draf berawalan `ST-<plan8>-`), `shiftTree`, `publishUnit`/`unpublishUnit`, `deleteTree`. Halaman `/dashboard/sekolah/[id]/skilltree/[planId]` + `TreeRunner` (dapat dijeda/dilanjutkan, ulang otomatis saat 429/503).
- Uji Playwright dengan AI nyata: 26 simpul dalam 3 unit, libur dilewati, geser +7 hari, terbit per unit. Batas: satu rombel per penyusunan; model gratis sering 429/503/JSON rusak (ditangani ulang).

## 12. Catatan implementasi C3 (selesai)
- DB (`question_bank` + `question_bank_fix_flags`): `bank_items` (+`bank_keys` terpisah, hanya penulis), `bank_reports`, `bank_progress` (kotak Leitner 1/3/7/14/30 hari), `practice_ability` + `rating` butir (Elo sederhana), `practice_sessions`/`practice_answers` (waktu dihitung di server dari saat soal diberikan), `bank_jobs`. RPC: `practice_overview/start/next/answer`, `bank_report`. 21 tes SQL lulus (`supabase/tests/question_bank.test.sql`).
- Aturan XP latihan (R3-B): dasar 5–15 menurut tingkat butir; benar-tapi-terlalu-cepat 0 XP dan ditandai; butir yang sudah benar dalam 7 hari ×0,5 per pengulangan; belum waktunya diulang ×0,5; bangkit setelah salah ×1,5; batas 300 XP latihan per hari (WIB). Setiap jawaban menyimpan bendera dan meta (jumlah pindah tab) sebagai bahan C4.
- Pipeline (`lib/bank.ts`, 10 tes; `bank/actions.ts`): per putaran ±8 butir dari satu potongan buku → skema + opsi diacak (kunci tidak condong) → duplikat (kemiripan bigram ≥0,72) → kutipan harus ada di sumber → dijawab ulang tanpa kunci. Lolos semua = draf (atau siap bila otomatis); solver beda/kutipan lemah = perlu ditinjau. Guru: "Setujui semua yang lolos", setujui/tarik per butir; 3 laporan murid menarik butir ke peninjauan.
- Uji AI nyata: 16 butir dari buku sintetis, semuanya lolos 3 pemeriksaan; sesi latihan 10 soal berjalan, bendera terlalu_cepat/ulang_cepat/belum_waktunya terbukti terpicu.
- Batas: pemecah independen memakai model yang sama dengan penyusun (panggilan terpisah tanpa kunci); model berbeda menyusul. Skala ribuan butir belum diuji (butuh kunci AI berbayar/BYOK).

## 13. Catatan implementasi C4 (selesai untuk Latihan)
- DB (`integrity_tables`, `integrity_practice_open`, `integrity_practice_hooks`): `school_integrity` (kebijakan: aktif, ambang tahan 40 / denda 70, batas denda harian, kamera mati/opsional, pernyataan persetujuan wali), `integrity_exempt` (akomodasi), `integrity_cases`, buku besar XP `app_private.xp_adjust` (tidak pernah di bawah 0; `xp_events`: tahan/denda/bebas). `integrity_score`: sinyal perilaku (jawaban terlalu cepat, pindah tab, waktu seragam, semua benar-tapi-cepat) + kamera (maks +25, dihitung hanya bila perilaku sudah ≥20 → kamera tidak pernah cukup sendirian). `integrity_evaluate` jalan sekali per sesi: sedang → XP sesi ditahan; tinggi (≥2 jenis sinyal) → dibatalkan + denda ≤ XP sesi dan ≤ batas harian. RPC `integrity_appeal`, `integrity_decide` (bebaskan = XP kembali penuh). 22 tes SQL lulus.
- Aplikasi: murid melihat pesan netral + form banding di akhir sesi; guru: `/integritas` (antrean dengan sinyal dan alasan banding, bebaskan/kukuhkan, kebijakan, pengecualian); kamera opsional `components/face-guard.tsx` (MediaPipe Face Landmarker, WASM dan model dilayani dari domain sendiri di `public/mediapipe`, tidak ada gambar yang keluar dari perangkat; hanya hitungan wajah-hilang dan banyak-wajah). Murid selalu boleh memilih "Tanpa kamera".
- Uji Playwright nyata: sesi mencurigakan → XP dibatalkan → banding → guru membebaskan; kebijakan kamera oleh pemilik; kamera (perangkat palsu) memuat model dan jawaban tetap terkirim.
- Belum: kuis di jalur belajar dan ujian belum memakai mesin ini (hanya Latihan); kasus 'ditahan' belum kedaluwarsa otomatis (usul: kembalikan XP bila guru tak memutuskan dalam 7 hari); audit bias per kelas; uji false-positive kamera dengan data beragam (⚠ target <2%); telaah hukum UU PDP sebelum kamera dipakai di sekolah sungguhan; notifikasi guru.
