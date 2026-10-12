# Bank data: masalah perusahaan (Indonesia)

Tujuan: satu sumber yang ringkas untuk dirujuk AI dan manusia, supaya tidak mengulang cerita wawancara setiap kali. Pakai ID (P01 sampai P16), jangan diubah.

**Cara pakai (untuk AI):** baca bagian 1 (indeks) dulu. Buka entri lengkap di bagian 2 hanya untuk ID yang dibutuhkan. Jangan memuat seluruh berkas bila cukup satu entri.

**Label bukti:**
- **W** = wawancara lapangan. Jumlah narasumber dan asalnya belum dicatat. Belum diverifikasi.
- **R** = riset publik (`docs/research/company/R*.md`).
- **H** = hipotesis penulis, belum diuji.

---

## 1. Indeks

| ID | Masalah | Modul Rangka | Bukti |
|---|---|---|---|
| P01 | Rekrutmen lambat, kandidat bagus diambil lebih dulu | Rekrutmen (pipeline, status) | W |
| P02 | Divisi dan jabatan tidak punya batas kerja, banyak "all role" | Organisasi, jabatan, RACI | W |
| P03 | Data pegawai tidak akurat, ada ghost pegawai yang tetap digaji | Data pegawai, cek silang | W |
| P04 | Absensi tidak tercatat rapi | Absensi | W |
| P05 | Perizinan (cuti, izin) lambat dan tidak terlacak | Izin dan persetujuan | W |
| P06 | Penggajian rumit (PPh 21, BPJS, lembur) | Penggajian (tarif bertanggal) | W, R |
| P07 | Surat menyurat: nomor surat bermasalah, skema tidak konsisten | Dokumen, seri nomor | W |
| P08 | Invoice salah atau telat | Dokumen transaksi, piutang | W |
| P09 | Mutasi dan resign mendadak, serah terima kacau | Serah terima (checklist) | W |
| P10 | Rotasi shift berkaitan dengan absensi, izin, dan tugas | Shift (kalender) | W |
| P11 | Pembagian tugas tidak adil: yang rajin dapat lebih banyak | Beban kerja, tugas | W |
| P12 | KPI sulit menilai kinerja secara adil | KPI (metrik, tinjauan) | W |
| P13 | Pajak: batas legal dan ilegal kabur; bentuk usaha (PT, CV, yayasan) berbeda aturan | Ledger, pajak bertanggal, peringatan kepatuhan | W, R |
| P14 | Magang: mentor tidak dibayar, pekerjaan tambah, peserta dipakai untuk pekerjaan di luar tugas | Magang (tugas, peran, penilaian) | W |
| P15 | HR internal tanpa kemampuan asesmen (psikolog, uji kompetensi) | Rekrutmen (penilaian) | W |
| P16 | Perusahaan tidak mau kontrak pembukuan bulanan, maunya akuntan lepasan | Ledger, tutup periode | W |

---

## 2. Entri lengkap

### P01 Rekrutmen lambat
- **Gejala:** kandidat bagus diambil perusahaan lain sebelum proses selesai. Konfirmasi dan pembaruan status lambat.
- **Yang dibutuhkan:** data kandidat terpusat, status yang bisa dilihat semua penilai, pengingat tindak lanjut.
- **Pertanyaan wawancara:** berapa hari dari lamaran sampai tawaran? Kandidat terakhir yang hilang, di tahap apa?
- **Ukuran yang berguna:** hari dari lamaran ke tawaran; tingkat kandidat yang menolak.

### P02 Divisi dan jabatan tanpa batas kerja
- **Gejala:** orang mengerjakan tugas di luar jabatannya ("all role"). Tidak jelas siapa bertanggung jawab atas apa.
- **Yang dibutuhkan:** deskripsi jabatan terstruktur, matriks tanggung jawab (RACI), peringatan saat tugas di luar jabatan dicatat.
- **Hubungan:** memperparah P11 dan P12.

### P03 Data pegawai dan ghost pegawai
- **Gejala:** ada orang yang masih digaji tetapi tidak jelas bekerja di mana.
- **Yang dibutuhkan:** master pegawai yang diperiksa silang dengan absensi, akses sistem, kontrak aktif, dan kepesertaan BPJS.
- **Aturan cek (deterministik, bukan AI):** gaji dibayar tapi tidak ada absensi N hari; akun aktif tapi tidak ada gaji; kontrak habis tapi masih digaji; rekening sama untuk dua pegawai.
- **Pertanyaan wawancara:** terakhir kali ada orang yang ternyata tidak ada di kantor, bagaimana ketahuan?

### P04 Absensi
- **Gejala:** absensi tercatat di buku, grup chat, atau tidak dicatat sama sekali.
- **Yang dibutuhkan:** pencatatan yang sederhana (HP, bisa offline), koreksi yang tercatat siapa yang mengubah.
- **Hubungan:** dasar untuk P03, P06, P10.

### P05 Perizinan
- **Gejala:** cuti dan izin lewat chat, lama disetujui, tidak tercatat di gaji.
- **Yang dibutuhkan:** pengajuan, persetujuan bertingkat, saldo cuti, tautan ke absensi.

### P06 Penggajian
- **Gejala:** perhitungan PPh 21, BPJS, lembur, dan THR rumit dan sering salah.
- **Yang dibutuhkan:** tarif dan rumus bertanggal dengan sumber (⚠ belum ada yang diverifikasi untuk rumus lembur, PKWT, dan pesangon). Naskah UU Pelindungan Ketenagakerjaan (disahkan DPR 6 Okt 2026) belum beredar (R8c).
- **Jangan:** menulis rumus gaji ke kode sebelum diverifikasi ke teks resmi.

### P07 Surat menyurat dan penomoran
- **Gejala:** nomor surat ganda atau loncat, skema penomoran tidak konsisten antar-bagian.
- **Yang dibutuhkan:** seri nomor per jenis dokumen, dengan aturan yang bisa diatur sebagai data (urutan, reset tahunan, kode unit).
- **Hubungan:** sama dengan P08 (invoice pakai seri yang sama).

### P08 Invoice
- **Gejala:** invoice salah, telat dikirim, atau tidak tercatat di piutang.
- **Yang dibutuhkan:** invoice dari data transaksi, nomor seri, status bayar otomatis.
- **Catatan pajak:** faktur pajak punya aturan sendiri (R8c, Coretax). Jangan dianggap sama dengan invoice biasa.

### P09 Mutasi dan resign
- **Gejala:** orang pergi tanpa pamit. Mutasi tidak diketahui kapan, tugas tidak dipindah, akses sistem tidak dicabut.
- **Yang dibutuhkan:** checklist serah terima per jabatan (tugas, akun, berkas, klien), tanggal efektif, pencabutan akses otomatis di tanggal itu.
- **Hubungan:** P03 (ghost pegawai bisa muncul dari sini), P02.

### P10 Shift
- **Gejala:** rotasi shift tidak jelas, tertukar, atau berbenturan dengan izin dan absensi.
- **Yang dibutuhkan:** kalender shift per unit, tukar shift dengan persetujuan, dampak otomatis ke absensi dan gaji.

### P11 Pembagian tugas tidak adil
- **Gejala:** yang rajin diberi lebih banyak tugas, yang lambat diberi sedikit. Gaji tidak adil, tetapi operasional terbantu karena cepat.
- **Yang dibutuhkan:** beban kerja per orang yang terlihat, distribusi tugas yang bisa dilihat pemimpin.
- **Hipotesis (H):** ketidakadilan ini mendorong orang rajin keluar. Belum diuji.

### P12 KPI
- **Gejala:** penilaian kinerja subjektif, sulit dibandingkan antar-orang.
- **Yang dibutuhkan:** metrik per peran yang dihitung dari data (tugas selesai, waktu, kualitas bila ada), dan tinjauan manusia di atasnya.
- **Hati-hati:** metrik yang hanya menghitung jumlah tugas mendorong P11. Gabungkan dengan beban kerja.

### P13 Pajak dan bentuk usaha
- **Gejala:** perusahaan mencari cara membayar pajak lebih kecil, dan batas antara legal dan ilegal kabur. Aturan PT, CV, dan yayasan berbeda.
- **Fakta (R8c):** PP 20/2026 (terbit 22 April 2026) mengubah siapa yang berhak PPh final 0,5 persen. Teks PP masih ⚠ untuk dibaca langsung.
- **Yang dibutuhkan (legal):** perbandingan konsekuensi pajak per bentuk usaha dari data bertanggal, dan penjelasan dasar hukum yang bisa diperiksa akuntan.
- **Batas:** sistem tidak membantu merancang penghindaran pajak secara ilegal (faktur fiktif, pemecahan omzet untuk menghindari batas). Yang bisa dilakukan sistem: memberi peringatan pada pola yang berisiko dan mencatatnya.
- **Pertanyaan wawancara:** keputusan bentuk usaha terakhir dibuat berdasarkan apa? Siapa yang menasihati?

### P14 Magang dan biaya mentor
- **Gejala:** peserta magang dianggap calon karyawan dan harus diajari, tetapi mentor tidak dibayar untuk itu dan pekerjaannya bertambah. Peserta juga kadang dipakai di luar tugas magangnya.
- **Biaya tersembunyi:** waktu mentor. Belum ada angka.
- **Yang dibutuhkan:** rencana magang tertulis (tujuan, tugas, penilaian), catatan waktu mentor, dan dana rekrutmen atau pelatihan yang jelas.
- **Hipotesis (H):** tanpa dana untuk mentor, mentor enggan mengajar dan kualitas magang turun.

### P15 Kompetensi HR internal
- **Gejala:** HR sering orang dalam, tanpa kemampuan menilai kandidat. Rekrutmen dianggap remeh, padahal dampaknya besar.
- **Yang dibutuhkan:** rubrik penilaian per jabatan, uji kerja singkat, dan pihak luar (psikolog atau asesor) untuk posisi kunci.
- **Hubungan:** P01, P12.

### P16 Akuntansi lepasan (bukan kontrak bulanan)
- **Gejala:** perusahaan tidak mau mengikat bagan akun dan maunya akuntan saat perlu saja.
- **Pembelajaran:** yang dibeli adalah hasil per periode atau per tutup buku, bukan kehadiran.
- **Hubungan:** P13. Harga per periode (lihat R8d tentang unit harga). Ukuran yang berguna: hari dari akhir periode sampai laporan siap.
- **Pertanyaan wawancara:** berapa kali setahun butuh akuntan? Apa yang dikerjakan saat itu? Berapa lama?

---

## 3. Lintas masalah
- **Data pegawai (P03) menopang** P04, P06, P09, P12. Satu master yang benar mengurangi banyak masalah sekaligus.
- **Jabatan tanpa batas (P02)** memicu P11 dan P12. Perbaiki P02 dulu bila ingin P11 dan P12 terukur.
- **Dana magang (P14)** dan **HR tanpa asesmen (P15)** adalah faktor biaya yang sering tidak terlihat di laporan keuangan.

## 4. Kesenjangan dan ⚠
- Semua bukti dari W belum diverifikasi, jumlah narasumber belum dicatat. Catat n dan asal sebelum dipakai untuk keputusan.
- Belum ada data tentang seberapa sering ghost pegawai terjadi (P03). Perlu dicari di wawancara HR dan akuntan.
- Rumus gaji dan pesangon (P06) ⚠ sampai naskah UU baru beredar.
- Hubungan P11 dan P12 dengan turnover masih hipotesis (H).

## 5. Batas
Tidak ada entri yang membantu menghindari pajak secara ilegal. Isi P13 membatasi diri pada kepatuhan dan perbandingan legal.
