# Aplikasi ujian: build, pemasangan, dan uji perangkat

Tiga cangkang tipis (`apps/exam-android`, `apps/exam-ios`, `apps/exam-windows`) membungkus pemutar ujian web (`/ujian/main`). Cangkang hanya mengunci perangkat dan melaporkan pelanggaran; soal, timer, dan penilaian ada di server. Rancangan: `docs/design/exam-app.md`.

## Status verifikasi (jujur)
| Cangkang | Dikompilasi di CI/sesi ini | Diuji di perangkat |
|---|---|---|
| Android | Ya (`assembleDebug`, APK 0,8 MB) | **Belum** |
| Windows | Ya (`dotnet build`, target Windows di Linux) | **Belum** |
| iOS | **Tidak** (butuh Xcode/macOS) | **Belum** |

Backend dan pemutar web sudah diuji end-to-end (SQL 21, Playwright m22). Perilaku penguncian (pin layar, sesi penilaian Apple, kait keyboard, proteksi tangkapan layar) harus diuji di perangkat nyata sebelum dipakai ujian sungguhan.

## Alur
1. Siswa membuka ujian di web → halaman `.../ujian/<id>/mulai` membuat kode sekali pakai (5 menit) dan membuka `edusmart-ujian://mulai?kode=…&host=https://…`.
2. Aplikasi mengunci perangkat, menukar kode dengan token sesi (`POST /api/ujian/mulai`), lalu memuat `/ujian/main#t=<token>`.
3. Pemutar menyimpan jawaban tiap perubahan, timer mengikuti jam server, pelanggaran dilaporkan (`/api/ujian/peristiwa`) dan kebijakan ujian (catat/bekukan) berlaku di server. Pengawas melanjutkan siswa dari halaman guru.

## Android (`apps/exam-android`)
- Build: pasang Android SDK 34 lalu `ANDROID_HOME=… ./gradlew assembleDebug` (atau `assembleRelease` dengan keystore sekolah).
- Penguncian: `startLockTask()`. Tanpa device owner, Android meminta siswa mengonfirmasi **screen pinning** dan siswa masih bisa melepasnya dengan kombinasi tombol; aplikasi mendeteksi (`kunci_lepas`), mengunci ulang, dan melaporkan.
- **Kiosk penuh** (disarankan untuk perangkat sekolah): jadikan aplikasi device owner pada perangkat baru/reset:
  `adb shell dpm set-device-owner id.edusmart.ujian/.ExamAdminReceiver` → aplikasi mengizinkan dirinya di lock task dan mematikan Home, Recents, dan notifikasi tanpa dialog.
- `FLAG_SECURE` memblokir tangkapan/rekaman layar dan pratinjau Recents; `setHideOverlayWindows` (Android 12+) dan pemeriksaan sentuhan tertutup menangani jendela melayang; `resizeableActivity=false` menolak layar terbagi.
- Distribusi: unggah APK ke hosting sekolah/Play Console (internal), lalu isi `EXAM_APP_ANDROID_URL` pada Vercel.

## iOS (`apps/exam-ios`)
- Butuh Mac, Xcode 15+, akun Apple Developer, dan **entitlement `com.apple.developer.automatic-assessment-configuration`** (minta ke Apple lewat formulir "Automatic Assessment Configuration Entitlement Request"; untuk aplikasi edukasi).
- `brew install xcodegen && cd apps/exam-ios && xcodegen generate` lalu buka proyek, pilih tim, dan jalankan. Kode belum pernah dikompilasi: cocokkan nama properti `AEAssessmentConfiguration` dengan SDK terpasang.
- Sesi penilaian Apple memblokir aplikasi lain, tangkapan dan rekaman layar, Siri, dan papan klip. Tanpa entitlement penguncian gagal dan ujian tidak dimulai (sengaja).
- Distribusi: TestFlight/App Store atau Apple Business/School Manager; isi `EXAM_APP_IOS_URL`.

## Windows (`apps/exam-windows`)
- Build: `dotnet build -c Release` (butuh .NET 8 SDK; di Windows jalankan `dotnet publish -c Release -r win-x64 --self-contained`). WebView2 Runtime harus terpasang (bawaan Windows 11).
- Daftarkan tautan: `powershell -ExecutionPolicy Bypass -File install.ps1 -Exe "<path EduSmartUjian.exe>"`.
- Penguncian: layar penuh selalu di atas, kait keyboard tingkat rendah (Win, Alt+Tab, Alt+F4, Alt+Esc, Ctrl+Esc, Ctrl+Shift+Esc, PrintScreen), `SetWindowDisplayAffinity` (jendela tak muncul di tangkapan layar/berbagi layar), monitor kedua ditutup hitam, penjaga fokus, menolak mesin virtual/remote desktop, dan menolak mulai bila ada aplikasi perekam/remote/pesan berjalan.
- Keterbatasan: Ctrl+Alt+Del tidak bisa diblokir (dideteksi sebagai hilang fokus). Untuk penguncian kuat gunakan **Windows Assigned Access (kiosk)** pada perangkat sekolah dengan aplikasi ini sebagai satu-satunya aplikasi.
- Distribusi: paket zip/MSI hosting sekolah; isi `EXAM_APP_WINDOWS_URL`.

## Keterbatasan lintas platform
- Tidak ada penguncian 100% pada perangkat milik siswa. Klaim "terkunci" dari aplikasi belum diverifikasi attestation (Play Integrity, App Attest, tanda tangan aplikasi); siswa teknis dapat memalsukan klien. Langkah berikut yang disarankan: attestation per platform dan penolakan token tanpa bukti.
- Foto layar dengan kamera tidak bisa dicegah; kombinasikan dengan pengawas kelas untuk ujian bertaruhan tinggi.
- Daftar uji perangkat minimal: (1) coba keluar dengan Home/Recents/notifikasi, (2) tangkap dan rekam layar, (3) jendela melayang/layar terbagi, (4) cabut jaringan lalu sambungkan lagi (jawaban utuh), (5) matikan aplikasi paksa lalu buka lagi dari tautan (lanjut dengan sisa waktu server), (6) pembekuan dan pelanjutan oleh pengawas.
