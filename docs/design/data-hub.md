# Pusat Data dan Berkas (rencana)

Masalah: sekolah tidak mau mengetik ulang ratusan siswa, guru, keuangan, kurikulum, dan peraturan. Format tiap sekolah berbeda (rapor, daftar siswa, LKS).

## Prinsip
1. **Satu tempat unggah** untuk semua berkas (xlsx, csv, docx, pdf, gambar, txt). Sekolah menaruh, sistem memilah.
2. **AI memilah dan memetakan, manusia menyetujui.** AI mengklasifikasi berkas, merangkum, dan memetakan kolom tabel; sekolah melihat pratinjau dan galat sebelum apa pun masuk. Tidak ada impor diam-diam.
3. **Kunci AI milik sekolah.** Berkas sekolah nyata hanya lewat kunci BYOK sekolah. Sekolah demo boleh kunci platform (data sintetis). Tanpa kunci, pemilahan manual tetap bisa dan impor CSV/XLSX dengan pemetaan kolom heuristik tetap jalan.
4. **Tabel besar tidak dikirim utuh ke AI.** Kirim judul kolom + sampel baris, AI mengembalikan pemetaan, pemetaan diterapkan lokal ke semua baris.
5. **Data terpadu.** Siswa/guru hasil impor menjadi `roster_people` (belum punya akun) lengkap dengan data induk; kode undangan otomatis per orang; saat ditebus, data induk, rombel, dan peran tersambung. Sekolah melihat semuanya di satu daftar.
6. **Dokumen (peraturan, kurikulum, buku paket, LKS) disimpan, diindeks teksnya, dan bisa dicari.** Fase berikut: draf peta belajar dari berkas kurikulum, tutor AI berpijak pada buku sekolah.

## Fase
- Fase 1 (ini): penyimpanan, kategori, unggah massal, AI memilah, impor siswa/guru ke roster + undangan, pencarian berkas.
- Fase 2: draf materi/graf kompetensi dari berkas kurikulum dan buku; tutor memakai teks buku sekolah; impor keuangan (LKS dll.) dengan pencocokan nama/NIS.
- Fase 3: templat rapor yang bisa diatur per sekolah (kolom, kelompok mapel, sikap, ekskul, deskripsi capaian) dan usulan templat dari contoh rapor yang diunggah.

## Keamanan
- Bucket privat `school-files`, jalur `{school_id}/{sekolah|guru}/...`; RLS storage mengikuti kapabilitas (pengelola membaca semua; guru hanya ruang `guru`).
- Berkas dan tabel roster memuat data pribadi anak: tidak pernah ke repo, hanya ke AI milik sekolah, dengan batas ukuran dan jenis berkas.
