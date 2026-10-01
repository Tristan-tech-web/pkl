# R3 — Gamifikasi yang sehat, anti-farming XP, dan deteksi kecurangan ringan

## A. Gamifikasi (anak dan remaja)
- **Teori determinasi diri**: motivasi tahan lama datang dari tiga kebutuhan: kompetensi, otonomi, keterkaitan. Lencana/papan peringkat/grafik kemajuan memenuhi *kompetensi*; avatar, cerita, dan tim memenuhi *keterkaitan*; pilihan kosmetik dapat mendukung *otonomi* (bukti campuran, kebanyakan mahasiswa) — [NSF PAR](https://par.nsf.gov/biblio/10591267-advancing-gamification-research-practice-three-underexplored-ideas-self-determination-theory).
- **Pola Duolingo** yang layak ditiru: jalur (path) dengan unit kecil, latihan ditanam di jalur, panduan per unit, streak, hati (batas salah per sesi), liga mingguan — [blog Duolingo](https://blog.duolingo.com/new-duolingo-home-screen-design/). Yang perlu hati-hati: hati/streak bisa memicu cemas; beri "bekukan streak" dan mode santai.
- **Aturan XP**: XP ∝ upaya + penguasaan, bukan jumlah klik. Komponen: kebenaran × kesulitan × kebaruan × ketepatan jarak ulang; **pengembalian menurun** per butir dan per hari; bonus untuk soal yang sebelumnya salah lalu benar (belajar nyata).

## B. Cara XP bisa "ditanam" (farming) dan penangkalnya
| Serangan | Penangkal |
|---|---|
| Mengulang soal yang sama sampai hafal kunci | Butir yang sudah dijawab benar menunda XP (interval ulang); XP butir turun 50% tiap pengulangan dalam 7 hari. |
| Menjawab asal cepat untuk menimbun | Waktu jawab minimum per jenis soal; jawaban < batas → tidak ada XP dan dihitung sinyal. |
| Salin jawaban teman / bagikan kunci | Urutan butir dan urutan opsi diacak per siswa; deteksi kemiripan jawaban salah (lihat C). |
| Banyak akun / dibantu AI | Satu perangkat–satu sesi aktif; deteksi pola waktu seragam; pengawasan opsional. |
| Bot/skrip | Pembatas laju, token sesi, waktu jawab tidak manusiawi. |

## C. Deteksi kecurangan: lapisan dari ringan ke berat
1. **Perilaku (server, tanpa kamera, selalu aktif)**: waktu jawab vs median kelas dan vs waktu baca; kecocokan jawaban salah antar siswa (indeks kemiripan jawaban — jawaban salah yang sama lebih bermakna daripada jawaban benar yang sama); pola "semua cepat lalu semua benar"; kehilangan fokus tab; tempel (paste); multi-login. Dasar: analitik waktu respons dan indeks penyalinan jawaban — [ringkasan metode](https://testlify.com/detect-cheating-in-exams-using-analytics/), [paket aberrance](https://cran.r-project.org/web/packages/aberrance/refman/aberrance.html).
2. **Kehadiran kamera di perangkat (opsional per kuis/bank soal)**: model wajah ringan yang berjalan **di browser** (MediaPipe Face Landmarker, WebAssembly/GPU, hingga 2 wajah, keluaran landmark 3D untuk estimasi arah kepala) — [MediaPipe di browser](https://dev.to/kenzic/real-time-face-tracking-in-the-browser-with-mediapipe-22c9). Sinyal: tidak ada wajah > N detik, ≥2 wajah, kepala menoleh lama. **Tidak ada video/gambar yang keluar dari perangkat**; server hanya menerima hitungan peristiwa.
3. **Skor risiko gabungan** → tindakan bertingkat (tabel D).

### Risiko keadilan dan privasi (wajib ditangani)
- Sistem proctoring AI terbukti lebih sering gagal/menandai pada kulit lebih gelap, berkacamata, dan siswa disabilitas — [ringkasan](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2022.881449/epub), [kasus Proctorio](https://www.vice.com/en/article/proctorio-is-using-racist-algorithms-to-detect-faces/). Maka: **kamera saja tidak pernah cukup untuk mengurangi XP**; selalu perlu sinyal perilaku yang sejalan; ada jalur banding; guru dapat memberi pengecualian (akomodasi) per siswa; sekolah mengaudit tingkat penandaan per kelas.
- Hukum: UU PDP No. 27/2022 menggolongkan **data biometrik dan data anak sebagai data pribadi spesifik** dan memerlukan persetujuan sah, untuk anak persetujuan orang tua/wali (Pasal 25) — [Pasal.id](https://pasal.id/akn/id/act/uu/2022/27), [ringkasan akademik](https://ejurnal.umri.ac.id/index.php/JEQ/article/view/9214). Standar persetujuan biometrik/pengenalan wajah belum rinci ⚠ → butuh telaah hukum sebelum dipakai di sekolah sungguhan. Desain mitigasi: pemrosesan di perangkat, tanpa penyimpanan gambar, tanpa pengenalan identitas (hanya "ada wajah / berapa / arah"), persetujuan orang tua tercatat, dapat dimatikan sekolah, bisa diganti jalur tanpa kamera.

## D. Kebijakan XP "minus" (permintaan produk) dengan pengaman
| Skor risiko | Tindakan |
|---|---|
| Rendah | Tidak ada. |
| Sedang | XP sesi **ditahan (tertunda)**; guru melihat antrean; siswa diberi tahu netral ("sedang dicek"). |
| Tinggi (≥2 sinyal berbeda, termasuk perilaku) | XP sesi dibatalkan **dan** dikurangi paling banyak sebesar XP yang diperoleh sesi itu (dasar 0, tidak jadi negatif total); notifikasi guru; siswa dapat banding. |
| Banding diterima | XP dikembalikan penuh + tanda "ditinjau". |
Setiap perubahan tercatat di buku besar XP (alasan, sinyal, siapa yang memutuskan). Hukuman tidak pernah otomatis lebih dari batas harian.

## E. Penerjemah ke teknologi
- Server: tabel `integrity_signals`, `integrity_sessions` (skor, status), buku besar `xp_events` yang sudah ada (jumlah negatif diperbolehkan lewat alasan 'koreksi').
- Klien: modul kamera dimuat dinamis hanya bila kuis meminta, dengan layar persetujuan, indikator "kamera aktif" yang jelas, dan tombol "tanpa kamera (minta guru)".
- Uji: set video sintetis/semi (berbagai warna kulit, kacamata, pencahayaan) untuk mengukur false positive **sebelum** dipakai; target false positive per sinyal kamera < 2% ⚠ (angka target saya, harus diverifikasi dengan data nyata).
