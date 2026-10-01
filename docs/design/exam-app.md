# Aplikasi ujian terkunci (Android, iOS, Windows)

Tujuan: siswa membuka ujian di web EduSmart, diarahkan ke aplikasi ujian khusus yang mengunci perangkat, lalu mengerjakan sampai selesai. Dokumen ini mencatat hasil riset, arsitektur, batas kemampuan yang jujur, dan urutan kerja.

## Cara aplikasi ujian lain bekerja (riset)

| Platform | Mekanisme resmi | Yang dicegah | Batas |
|---|---|---|---|
| iOS / iPadOS / macOS | **AEAssessmentSession** (framework Automatic Assessment Configuration). Butuh entitlement `com.apple.developer.automatic-assessment-configuration`, diminta lewat formulir ke Apple. | Aplikasi lain, tangkapan layar dan rekaman layar, Siri, media, Handoff, jaringan hanya untuk aplikasi, papan klip dibersihkan. | Tanpa entitlement tidak berjalan; persetujuan Apple untuk aplikasi edukasi ujian. Cadangan: Guided Access (diaktifkan siswa/MDM). |
| Android | **Lock task mode** (kiosk). Penuh bila aplikasi jadi *device owner*/DPC dan masuk allowlist (`setLockTaskPackages`). Tanpa itu hanya *screen pinning* (siswa bisa keluar dengan kombinasi tombol). `FLAG_SECURE` memblokir tangkapan dan rekaman layar serta pratinjau Recents. | Aplikasi lain, notifikasi, tombol Home/Recents (pada lock task penuh), tangkapan layar. | Kunci penuh butuh perangkat disiapkan (provisioning DPC/MDM). Screen pinning dapat dilepas siswa; aplikasi harus mendeteksi dan melaporkan. |
| Windows | **Safe Exam Browser (SEB)**: membuka desktop sendiri, menangkap pintasan sistem (Alt+F4, Alt+Tab, Win+Tab, Print Screen, Ctrl+Alt+Del), memblokir proses terlarang, mendeteksi mesin virtual, URL filter. Windows memberi `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)` untuk menyembunyikan jendela dari tangkapan layar/berbagi layar. Windows *Assigned Access (kiosk)* mengunci akun ke satu aplikasi. | Pindah aplikasi, tangkapan layar, VM, remote desktop (dideteksi). | Tanpa mode kiosk OS, pengunci tingkat aplikasi bisa dilewati pengguna mahir; kunci kuat = Assigned Access. Foto layar dengan kamera tak bisa dicegah. |
| Layanan sertifikasi (Pearson OnVUE, Microsoft) | Aplikasi desktop pengunci + pemeriksaan lingkungan (kamera, ruangan, proses berjalan, monitor ganda) + pengawas manusia/AI. | Banyak lapis. | Mengandalkan pengawasan, bukan hanya penguncian. |

Kesimpulan: **tidak ada penguncian 100% di perangkat milik siswa.** Yang realistis: kunci OS resmi bila tersedia (iOS AEAssessmentSession, Android device owner, Windows Assigned Access), ditambah deteksi dan bukti (log pelanggaran, penanda waktu, pembekuan ujian), ditambah kebijakan sekolah (pengawas kelas, perangkat sekolah).

## Arsitektur

Satu pemutar ujian di web (halaman `/ujian/main`) dibungkus **cangkang tipis** per platform. Cangkang hanya melakukan penguncian dan pelaporan; soal, timer, dan penilaian tetap di server.

```
Web EduSmart  --(tautan dalam: edusmart-ujian://mulai?kode=...)-->  Aplikasi ujian (cangkang)
                                                                    |  1. tukar kode sekali pakai -> sesi ujian (token pendek)
                                                                    |  2. pasang kunci OS, laporkan hasil ke server
                                                                    |  3. WebView memuat pemutar ujian dengan token sesi
Server (Supabase + Next.js): jadwal ujian, soal tanpa kunci jawaban, timer sisi server,
simpan jawaban berkala, log peristiwa integritas, pembekuan/lanjut oleh pengawas.
```

Prinsip:
- Timer dan batas waktu **dipaksa server**; klien hanya menampilkan.
- Kunci jawaban tidak pernah dikirim ke klien (tabel terpisah seperti kuis).
- Kode peluncuran sekali pakai, berumur menit, terikat ke siswa dan ujian.
- Peristiwa integritas (app keluar fokus, layar dibagi, VM, screenshot, kunci OS gagal) dicatat dengan waktu server; kebijakan sekolah menentukan: catat saja, peringatan, atau bekukan ujian.
- Mode cadangan: pemutar web biasa (tanpa kunci) hanya bila sekolah mengizinkan dan ditandai "tidak terkunci" di hasil.

## Yang bisa dan tidak bisa diverifikasi di lingkungan ini

- Backend (skema, RLS, RPC, API peluncuran) dan pemutar web: dapat dibangun dan diuji penuh (SQL, Playwright).
- Kode cangkang Android (Kotlin), iOS (Swift), Windows (.NET): ditulis sebagai proyek lengkap, tetapi **tidak bisa dikompilasi dan dijalankan di sini** (tidak ada Android SDK/Xcode/.NET, dan uji kunci butuh perangkat fisik). Perlu build, penandatanganan, dan uji di perangkat nyata; iOS butuh entitlement dari Apple dan akun developer.

## Urutan kerja
1. Skema ujian + RLS + tes (jadwal, soal, sesi, jawaban, peristiwa).
2. API peluncuran dan sesi (kode sekali pakai, token sesi, simpan jawaban, peristiwa).
3. Pemutar ujian web + halaman guru (buat ujian, pantau, bekukan) + halaman unduh aplikasi.
4. Cangkang Android, iOS, Windows + dokumen build dan uji perangkat.
