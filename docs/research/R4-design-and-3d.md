# R4 — Desain untuk anak, remaja, dan guru senior; teknologi 3D; personalisasi

## Pengguna dan konteks
- Hampir semua siswa memakai **HP Android** (survei Indonesia: 99,1% siswa memiliki ponsel Android; 83% sekolah punya Wi-Fi) — [JPPI/DOAJ](https://doaj.org/article/6451e223d2f74f55a931d5f7314d13fe), [Statista](https://www.statista.com/topics/5020/smartphones-in-indonesia). Spesifikasi RAM/GPU tidak terdata dalam sumber yang saya temukan ⚠ → asumsikan banyak perangkat menengah-bawah dan koneksi tidak stabil. Rancang **degradasi bertahap**: 3D penuh → 3D ringan → 2D animasi → statis.
- Guru dan kepala sekolah: mayoritas usia lanjut (permintaan produk). Pedoman usia lanjut: teks ≥16 px (idealnya lebih besar, ukuran dapat diatur), target sentuh besar (~40 mm), kontras ≥4,5:1 (lebih baik ≥7:1), satu tugas per layar, ikon selalu berlabel, umpan balik jelas pada setiap ketukan, sans-serif — [uxdesign.cc](https://uxdesign.cc/a-guide-to-interface-design-for-older-adults-31109468d46d), [Netguru](https://netguru.com/blog/accessible-design-senior-users).

## Tiga "pengalaman" (bukan sekadar warna)
| | **Ceria** (SD, ±6–12 th) | **Seru** (SMP–SMA, ±12–18 th) | **Ringkas** (guru, kepala sekolah, staf, orang tua) |
|---|---|---|---|
| Rasa | Permen, bulat, besar, maskot, suara lucu, gerak pantul | Neon/gelap/komik, identitas dan status (liga, peringkat, kustomisasi), gerak cepat dan tajam | Tenang, terang, kontras tinggi, rapi, hampir tanpa gerak |
| Kepadatan | Longgar, 1 aksi utama | Sedang, banyak "kartu" kecil | Longgar tapi informatif, 1 tugas per layar |
| 3D | Maskot 3D, benda melayang, pulau di peta | Latar 3D bertema, permata XP, efek | **Tidak ada** (ikon datar) |
| Teks | 18 px dasar | 16 px | 18–20 px dasar, dapat 150% |
| Gerak | Penuh | Penuh | Minimal, tanpa pergeseran tak perlu |

Dasar pilihan (otonomi): kustomisasi estetika mendukung rasa otonomi/keterkaitan, bukti campuran — jadi dibuat **pilihan**, bukan paksaan.

## Lapisan personalisasi (urutan prioritas)
1. **Bawaan platform** → 2. **Kebijakan sekolah** (tema/identitas sekolah, paket tema yang diizinkan, mengunci mode untuk staf, mematikan 3D/kamera) → 3. **Pilihan pengguna** (paket tema, ukuran huruf, kepadatan, gerak, 3D, suara, avatar) → 4. **Penyesuaian otomatis perangkat** (`prefers-reduced-motion`, `prefers-color-scheme`, Save-Data, kemampuan WebGL, FPS terukur).
Default berdasar peran dan jenjang kelas: kelas ≤6 → Ceria; ≥7 → Seru; guru/kepala/staf/orang tua → Ringkas. Semua bisa diubah dalam batas yang diizinkan sekolah.

## Paket tema yang disediakan (token warna + bentuk + gerak + adegan 3D + maskot)
Kertas (bawaan sekarang), Luar Angkasa, Hutan, Laut, Kota Neon, Pixel Retro, Permen, Gelap Fokus, Kontras Tinggi (aksesibilitas), dan **Warna Sekolah** (satu warna merek sekolah menurunkan seluruh palet dengan kontras terjamin).

## 3D yang realistis untuk web
- **Three.js** langsung (tanpa wrapper) dimuat **dinamis** hanya di halaman yang meminta; `@react-three/fiber` menambah ±50 KB gzip, build three kustom dapat ±88 KB gzip — [diskusi three.js](https://discourse.threejs.org/t/three-js-file-size-when-importing-via-npm-and-bundling-with-webpack/8904), [ukuran r3f](https://mcp.depscope.dev/pkg/npm/@react-three/fiber). Pilihan: three langsung + helper kecil buatan sendiri; ukur ukuran sebenarnya saat implementasi.
- **Anggaran perangkat lemah**: dpr ≤ 1–1,5, ≤ ~50 ribu segitiga, tanpa SkinnedMesh/aset berat, tekstur terkompresi bila perlu, target 30 fps — [panduan optimasi mobile](https://www.technetexperts.com/react-three-fiber-skinnedmesh-mobile-fix/).
- **Prosedural, tanpa aset unduhan**: maskot dan benda dari geometri sederhana (low-poly, materi toon/flat), sehingga muatan kecil dan seragam. Animasi lewat GSAP/ticker yang sudah ada.
- **Aturan**: render hanya saat terlihat (IntersectionObserver) dan tab aktif; hentikan di `reduced-motion`; pantau FPS dan turunkan kualitas otomatis; jangan pernah memblokir konten di balik 3D; mode Ringkas tidak memuat three sama sekali.
