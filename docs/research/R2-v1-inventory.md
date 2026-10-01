# R2 — Inventaris EduSmart v1 (bahan penulisan ulang)

Sumber: pembacaan kode `Tristan-IT/EduSmart` (SHA `35251b6`) oleh agen riset. Tidak ada yang dijalankan. Data siswa dan kredensial yang ada di repo lama tidak disalin ke sini dan tidak boleh dibawa ke v2.

## Kondisi v1 dalam satu paragraf
Ide-idenya kuat, tetapi banyak yang belum tersambung: hearts, liga, streak, dan achievement sisi klien hidup di localStorage; chat AI siswa dan rekomendasi di dashboard masih mock; alur editor konten tidak terhubung ke server; skema progres bergeser sehingga beberapa layanan membaca field lama. Ada 4 rute profil, 5 varian analitik guru, dan rute admin tanpa proteksi.

## Peran dan alur yang perlu ada di v2
- **Pemilik/kepala sekolah**: daftar → mendapat School ID → dashboard (siswa, guru, kelas, rata-rata XP; alert; distribusi per tingkat; kapasitas kelas) → kelola guru, kelas (wizard satuan dan massal), mata pelajaran, analitik, pengaturan akademik.
- **Guru**: daftar dengan School ID → dashboard (siswa, konten, penyelesaian, engagement; daftar siswa dengan XP/streak/level; **log intervensi** dengan jenis, prioritas, tenggat, status) → skill tree, konten, kalibrasi, analitik.
- **Siswa**: daftar dengan Class ID (validasi kelas penuh/aktif, nomor absen unik) → onboarding (minat, target, tes awal 10 soal, rekomendasi 7 hari) → dashboard (penguasaan, streak, target harian, rekomendasi, jalur, XP & liga, misi) → belajar, kuis, mentor AI.
- **Admin platform**: belum ada yang sungguhan.

## Aturan gamifikasi v1 (angka konkret; v2 memakai satu konfigurasi di server)
- Bintang node: skor ≥90 → 3, ≥75 → 2, ≥60 → 1. XP = dasar × (0,5 / 0,75 / 1,0 / 1,25) menurut bintang. Node berikutnya terbuka bila semua prasyarat selesai.
- XP kuis di server: ≥90 → 100, ≥75 → 75, ≥60 → 50, ≥40 → 25, selain itu 10; bonus 100% +50; bonus cepat +25.
- Level server: `floor(100 × level^1,5)` XP ke level berikutnya (v1 punya tiga rumus berbeda; pilih satu).
- Daily goal: tingkat Casual 10 / Regular 20 / Serious 50 / Intense 100 XP.
- Streak: <24 jam tetap, 24–48 jam +1, lebih dari itu reset; ada freeze dan repair.
- Hearts maksimum 5 (v1 hanya localStorage dan dua timer isi ulang yang bertentangan).
- Liga 6 tingkat (Bronze 0, Silver 500, Gold 1.500, Diamond 3.000, Platinum 5.000, Quantum 10.000 XP); 10 teratas naik, 10 terbawah turun, reset mingguan.
- Achievement sekitar 40 (streak, kesempurnaan, waktu belajar, penguasaan, per mata pelajaran, skill tree).

## Rekomendasi dan kalibrasi (ide yang layak diambil)
- Rekomendasi: skor 8 faktor (afinitas mapel, kecocokan kesulitan, prasyarat terpenuhi, kelanjutan jalur, waktu belajar, hadiah, streak, checkpoint) dengan **alasan yang terbaca manusia**.
- Kalibrasi kesulitan dari data: terlalu mudah (skor ≥90, selesai ≥85%, sempurna ≥40%) naik satu tingkat; terlalu sulit (skor <65, selesai <40%, dropout >50%, percobaan >3) turun satu tingkat; ada dry-run dan skor keyakinan (butuh ≥20 siswa).

## AI v1
Gateway kompatibel OpenAI dengan streaming. Nyata secara arsitektur: mentor chat berbasis konteks (progres, 5 kesalahan terbaru, node tersedia), umpan balik kuis (skor 0–100), ringkasan orang tua (cache 24 jam), insight guru, content copilot. Mock: chat AI siswa di dua halaman, rekomendasi dan quest di dashboard.

## Desain v1
Tema biru `#3B82F6` + hijau `#10B981`, Inter, kartu bulat dengan gradien dan emoji sebagai ikon, tiga komponen navigasi berbeda, 12 menu di sidebar siswa yang saling tumpang tindih. Hal yang bagus dan dipertahankan secara semangat: bahasa hangat ("kamu"), alasan rekomendasi yang transparan, checkpoint yang lebih besar, wizard bertahap dengan progres.

## 15 fitur yang dibawa ke v2 (urut prioritas)
1. Hierarki sekolah, kelas, peran, multi-tenant (sudah dikerjakan di M1).
2. Onboarding bertahap dengan kode sekolah/kelas.
3. Wizard kelas satuan dan massal dengan penamaan otomatis.
4. Skill tree dengan prasyarat, bintang, checkpoint, filter.
5. Template kurikulum SMK (perlu ditinjau ulang kualitasnya).
6. Kuis dinilai di server, jawaban tidak dikirim ke klien, petunjuk bertingkat, penjelasan wajib.
7. Progres per siswa per mata pelajaran (mastery, topik lemah/kuat).
8. Dashboard guru dengan peringatan dini dan log intervensi.
9. Gamifikasi inti di server (XP, level, streak, target harian, gems sebagai buku besar, achievement).
10. Liga mingguan dan leaderboard dihitung di server.
11. Rekomendasi transparan.
12. Mentor AI berbasis konteks dengan streaming dan jempol.
13. Content copilot, editor, versi, siklus draft→terbit→arsip, perpustakaan template.
14. Kalibrasi kesulitan otomatis.
15. Dashboard sekolah dan ringkasan mingguan orang tua.

## 10 hal yang tidak dibawa
Auth lokal dan token di localStorage; gamifikasi di localStorage; rumus ganda; mock yang berpura-pura nyata dan statistik palsu; halaman dan rute duplikat; rute tanpa proteksi; URL `localhost` hardcode; skema progres ganda dan enum bentrok; suara placeholder; data siswa nyata, kredensial, dan skrip debug di repo.
