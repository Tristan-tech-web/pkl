# R1 — Domain Sekolah di Indonesia

Tujuan: memahami apa itu "sekolah" supaya model data EduSmart tidak terkunci pada SD/SMP/SMA/SMK.

Legenda: ✔ = ada sumber dari riset sesi ini; ⚠ = pengetahuan umum yang **belum diverifikasi**, harus dicek sebelum dijadikan aturan.

## 1. Jenis satuan pendidikan

| Kelompok | Bentuk | Status |
|---|---|---|
| PAUD | TK (formal, 4–6 th), KB (nonformal, 2–6 th) | ✔ [PP 17/2010](https://jdih.bkn.go.id/common/dokumen/PP%20NOMOR%2017%20TAHUN%202010@PENGELOLAAN%20DAN%20PENYELENGGARAAN%20PENDIDIKAN.pdf) |
| Dasar | SD, MI, SMP, MTs | ✔ PP 17/2010 |
| Menengah | SMA, MA, SMK, MAK | ✔ PP 17/2010 |
| Khusus | SLB: TKLB, SDLB, MILB, SMPLB, MTsLB, SMALB, MALB | ✔ PP 17/2010 |
| Kesetaraan | Paket A (setara SD), B (SMP), C (SMA), umumnya lewat PKBM | ✔ jurnal PKBM (lihat Sumber) |
| Pesantren | Pesantren dengan satuan formal atau nonformal di dalamnya (mis. PKBM di ma'had) | ✔ sebagian; status muadalah ⚠ |
| Internasional | Satuan Pendidikan Kerja Sama (SPK), kurikulum Cambridge/IB | ⚠ belum ada sumber dari riset ini |
| Lainnya | Homeschooling | ⚠ |

**Implikasi:** "jenjang" bukan daftar tertutup empat nilai. Satu yayasan bisa punya beberapa satuan (SD-SMP-SMA terpadu), dan satu satuan bisa memuat beberapa program (pesantren + madrasah + PKBM).

## 2. Dua rezim pengelola

- **Kemendikdasmen**: SD, SMP, SMA, SMK, SLB.
- **Kemenag**: madrasah (MI, MTs, MA, MAK). Kurikulum PAI dan Bahasa Arab diatur [KMA 183/2019 dan KMA 184/2019](https://babel.antaranews.com/berita/155318/madrasah-gunakan-kurikulum-pai-baru-2020-2021) ✔. Mata pelajaran agamanya: Al-Qur'an Hadis, Akidah Akhlak, Fikih, SKI, dan Bahasa Arab ✔.
- Sekolah juga berbeda berdasarkan **negeri/swasta** ⚠.

**Implikasi:** pengelola menentukan paket kurikulum default, format rapor, dan sistem pelaporan. Ini harus menjadi atribut satuan pendidikan.

## 3. Kurikulum yang hidup berdampingan

- **K13 dan Kurikulum Merdeka berjalan bersamaan.** [Permendikdasmen 13/2025 bukan kurikulum baru](https://www.jpnn.com/news/kemendikdasmen-mapel-koding-dan-kecerdasan-artifisial-berlaku-tahun-ini-dimulai-sd), melainkan pendekatan **pembelajaran mendalam** yang bisa dipakai di keduanya ✔.
- **Koding dan AI** menjadi mata pelajaran **pilihan** secara bertahap di kelas 5 SD, 7 SMP, 10 SMA/SMK mulai 2025/2026, hanya untuk sekolah yang siap ✔.
- **Struktur Kurikulum Merdeka:** capaian pembelajaran (CP) per fase A–F → tujuan pembelajaran (TP) → alur tujuan pembelajaran (ATP). Struktur terdiri dari intrakurikuler, P5, dan ekstrakurikuler. **Tidak ada KKM**, guru menentukan ketercapaian ✔ ([sumber](https://eprints.umm.ac.id/id/eprint/14621/3/BAB%202.pdf)).
- **SMA:** Fase E (kelas X) dan Fase F (XI–XII); tanpa penjurusan IPA/IPS/Bahasa, siswa memilih 4–5 mapel pilihan di kelas XI–XII ✔ ([CNN Indonesia](https://www.cnnindonesia.com/nasional/20240724134432-20-1124973/melihat-sma-di-jakarta-yang-sudah-hapus-jurusan-ipa-ips-dan-bahasa)). ⚠ Kebijakan penjurusan ini sedang berubah dan harus dicek ulang; itu sendiri alasan konfigurasi harus berupa data, bukan kode.
- **SMK:** kelompok mata pelajaran **Umum** dan **Kejuruan**; ada bidang keahlian → program keahlian → **konsentrasi keahlian yang ditentukan sekolah bersama mitra industri**; PKL; beban jam bisa per tahun atau per semester/**sistem blok** ✔ ([Quipper](https://www.quipper.com/id/blog/info-guru/struktur-kurikulum-belajar-smk/)).
- **SLB:** pembelajaran diindividualisasi lewat **Program Pembelajaran Individual (PPI)**; capaian tidak seragam ✔ ([contoh jurnal](https://journal.uny.ac.id/index.php/jpk/article/download/65206/pdf)).

## 4. Data nasional (Dapodik)

Empat entitas ✔ ([panduan Dapodik 2024](https://cdn-dapodik.kemdikbud.go.id/panduan/Panduan_Lengkap_Aplikasi_Dapodik_versi_2024.pdf)):
1. **Satuan Pendidikan** (identitas, lokasi, sarana)
2. **PTK** (pendidik dan tenaga kependidikan)
3. **Peserta Didik**
4. **Substansi Pendidikan** (rombongan belajar, pembelajaran, anggota rombel, jadwal)

**Implikasi:** memakai istilah dan struktur yang selaras (rombel, pembelajaran) memudahkan impor data sekolah nyata dan membuat guru langsung paham.

## 5. Kesenjangan EduSmart saat ini

| Temuan di kode | Realitas | Dampak |
|---|---|---|
| `schoolTypes: "SD"\|"SMP"\|"SMA"\|"SMK"` tertulis di sekitar 502 tempat | Ada madrasah, SLB, PAUD, kesetaraan, pesantren, SPK | Sekolah tersebut tidak bisa dimodelkan |
| `smaSpecializations: ["IPA","IPS","Bahasa"]` | Kurikulum Merdeka tanpa penjurusan; kebijakan berubah | Data cepat usang |
| `smkMajors` berupa daftar string (`code`, `name`) | Hierarki bidang → program → konsentrasi | Tidak bisa analitik per program |
| Tidak ada model kurikulum | K13, Merdeka, KMA, Cambridge hidup bersamaan | Konten dan AI tidak tahu "apa yang seharusnya diajarkan" |
| Penilaian bergaya skor/XP | Merdeka tanpa KKM, berbasis TP; SLB berbasis PPI | Rapor dan analitik tidak sesuai |
| Peran: pemilik, guru, siswa | Wali kelas, wakasek kurikulum, guru BK, orang tua | Alur kerja nyata tidak terwakili |
| Kategori mapel `WAJIB/PEMINATAN/MUATAN_LOKAL/EKSTRAKURIKULER` | Merdeka: intrakurikuler/P5/ekskul; SMK: Umum/Kejuruan; madrasah: kelompok agama | Perlu kelompok yang bisa dikonfigurasi |

## 6. Pertanyaan terbuka (perlu diverifikasi sebelum jadi aturan)
1. Status terbaru penjurusan SMA 2025/2026 dan Tes Kemampuan Akademik.
2. Struktur kurikulum madrasah terbaru (setelah KMA 2019) dan jam pelajaran per jenjang.
3. SPK dan kurikulum internasional: struktur dan pelaporan.
4. PAUD: capaian perkembangan dan penilaian.
5. Format rapor Kurikulum Merdeka dan perbedaannya antar jenjang.
6. Wawancara 2–3 guru/wakasek dari jenis sekolah berbeda: alur kerja nyata yang dirasa paling merepotkan.

## Sumber
- [PP 17/2010](https://jdih.bkn.go.id/common/dokumen/PP%20NOMOR%2017%20TAHUN%202010@PENGELOLAAN%20DAN%20PENYELENGGARAAN%20PENDIDIKAN.pdf)
- [Permendikdasmen 13/2025 dan koding/AI (JPNN)](https://www.jpnn.com/news/kemendikdasmen-mapel-koding-dan-kecerdasan-artifisial-berlaku-tahun-ini-dimulai-sd)
- [Struktur Kurikulum Merdeka (UMM)](https://eprints.umm.ac.id/id/eprint/14621/3/BAB%202.pdf)
- [SMA tanpa penjurusan (CNN Indonesia)](https://www.cnnindonesia.com/nasional/20240724134432-20-1124973/melihat-sma-di-jakarta-yang-sudah-hapus-jurusan-ipa-ips-dan-bahasa)
- [Struktur kurikulum SMK (Quipper)](https://www.quipper.com/id/blog/info-guru/struktur-kurikulum-belajar-smk/)
- [KMA 183/184 tahun 2019 (Antara)](https://babel.antaranews.com/berita/155318/madrasah-gunakan-kurikulum-pai-baru-2020-2021)
- [Panduan Dapodik 2024](https://cdn-dapodik.kemdikbud.go.id/panduan/Panduan_Lengkap_Aplikasi_Dapodik_versi_2024.pdf)
- [PKBM dan kesetaraan (jurnal UNDIKSHA)](https://eproceeding.undiksha.ac.id/index.php/SENADIMAS/article/download/619/398/3675)
- [Kurikulum SLB dan PPI (UNY)](https://journal.uny.ac.id/index.php/jpk/article/download/65206/pdf)
