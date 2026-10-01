# Integrasi (Dapodik, SSO, pembayaran): rancangan awal

Status: **rancangan, belum dibangun**. Semua klaim tentang sistem eksternal di bawah ditandai ⚠ sampai diverifikasi dengan dokumentasi resmi atau pihak sekolah.

## 1. Dapodik (data pokok pendidikan)
- ⚠ Dapodik dikelola Kemendikdasmen dan, sejauh yang diketahui, tidak menyediakan API publik untuk aplikasi pihak ketiga; yang lazim adalah ekspor berkas (Excel) dari aplikasi Dapodik sekolah. Verifikasi dulu apakah ada jalur resmi.
- Jalur realistis tanpa API: **impor berkas ekspor Dapodik** lewat Pusat Data yang sudah ada (pemetaan kolom otomatis + pratinjau). Tambahan yang dibutuhkan: preset pemetaan kolom Dapodik (NISN, NIK ⚠ data sensitif, nama, tempat/tanggal lahir, rombel, nama ibu/wali), dan aturan bahwa NIK tidak disimpan kecuali sekolah memintanya.
- Pekerjaan: preset di `lib/intake.ts` (`guessMapping`), tes dengan berkas contoh sintetis. Tidak butuh migrasi.

## 2. SSO (masuk dengan akun yang sudah dimiliki)
- Supabase Auth mendukung OAuth/OIDC; kandidat: Google Workspace for Education dan Microsoft 365 Education (banyak sekolah memakainya). ⚠ Akun belajar.id (Kemendikdasmen) perlu dicek apakah menyediakan OIDC untuk pihak ketiga.
- Alur: tombol "Masuk dengan Google/Microsoft" di `/masuk`; setelah masuk, pengguna tanpa keanggotaan diarahkan ke `/gabung` (kode undangan) seperti sekarang. Tidak ada pembuatan sekolah otomatis dari domain email.
- Risiko: pencocokan akun berdasarkan email harus memerlukan email terverifikasi; domain sekolah tidak boleh otomatis memberi peran apa pun.
- Pekerjaan: konfigurasi provider di dashboard Supabase (butuh client ID/secret dari pemilik sekolah), tombol di UI, tes pengalihan. Tidak bisa diuji penuh tanpa akun provider.

## 3. Pembayaran online
- Saat ini pembayaran dicatat manual. Gerbang pembayaran (⚠ Midtrans/Xendit/QRIS) butuh akun merchant sekolah dan webhook bertanda tangan; tagihan sudah punya `payments` sehingga webhook cukup menambah baris pembayaran lewat RPC khusus yang memeriksa tanda tangan.
- Pekerjaan setelah ada akun sandbox: tabel `payment_intents`, route webhook, tes tanda tangan.

## 4. Urutan yang disarankan
1. Preset Dapodik (murah, bernilai tinggi, bisa diuji lokal).
2. SSO Google (setelah ada client ID).
3. Pembayaran (setelah ada akun sandbox).
