# Spesifikasi Gerak EduSmart

Dikerjakan seperti produksi video motion graphics, tetapi seluruhnya kode (GSAP + SVG/Canvas). Grid waktu **60 fps** (1 detik = 60 bingkai; `f(n) = n/60`). Setiap perubahan gerak ditinjau lewat *playblast* (kontak sheet bingkai) sebelum dianggap selesai.

## Prinsip yang dipakai
1. **Staging**: satu hal penting bergerak pada satu waktu; yang lain diam atau lebih lemah.
2. **Anticipation dan follow-through**: gerak besar didahului gerak kecil berlawanan arah dan diakhiri overshoot yang mengendap.
3. **Overlapping action**: bagian-bagian tidak berhenti serempak; selisih 2–5 bingkai.
4. **Slow in / slow out**: tidak ada gerak linear. Ease dipilih per gerakan (tabel di bawah), bukan satu untuk semua.
5. **Arcs**: benda organik (pena, bola) bergerak mengikuti busur, bukan garis lurus.
6. **Squash and stretch**: penanda dan bola menggepeng/memanjang searah kecepatan, volume dijaga.
7. **Secondary action**: riak, bayangan, dan getar kecil mendukung gerak utama tanpa merebut perhatian.
8. **Motion blur**: kabur sebanding kecepatan (sudut rana 180°: panjang kabur = kecepatan × setengah bingkai).
9. **Ritme**: jeda sama penting dengan gerak. Hook tercepat, manfaat sedang, klaim berhenti sejenak, ajakan bertahan paling lama.
10. **Keterbacaan lebih dulu**: teks tidak berputar, tidak berkedip; teks selalu terbaca penuh di bingkai akhir.
11. **Aksesibilitas**: `prefers-reduced-motion` mematikan seluruh koreografi; keadaan akhir langsung tampil.

## Token ease (setara kurva Graph Editor)
| Nama | Ekspresi GSAP | Dipakai untuk |
|---|---|---|
| `snap` | `expo.out` | masuk cepat, mengendap lama (kata, kartu) |
| `glide` | `power3.inOut` | perjalanan jarak jauh (pena, kamera) |
| `settle` | `back.out(1.5)` | overshoot lalu diam (penanda, gelembung) |
| `exit` | `power2.in` | keluar, 75% durasi masuk |
| `scrub` | `none` | dikendalikan scroll (kemudian dihaluskan `scrub: 0.6`) |

## Storyboard: pembuka hero (≈ 4,2 detik)
| Bingkai | Shot | Isi |
|---|---|---|
| 0–8 | 0. Tahan | Hanya kertas kosong. "Napas" sebelum gerak. |
| 6–40 | 1. Grid menyala | Kisi kertas terbuka dari titik fokus (kartu grafik) keluar, `snap`. |
| 9–72 | 2. Hook | Setiap kata naik dari topeng: antisipasi turun 6 px (3f) → naik melewati posisi (-4%) → mengendap. Selisih antar kata 5f. Stabilo menyapu 14f setelah kata terakhir mendarat (follow-through). |
| 15–75 | 3. Kartu | Kartu grafik masuk dengan kemiringan 3D yang mengendap, lebih lambat dari teks (manfaat = sedang). |
| 48–140 | 4. Pena | Pena menulis kurva dengan `glide`; pena bergetar ±1° (sekunder); kabur gerak sebanding kecepatan. |
| 140–175 | 5. Keluar pena | Pena meninggalkan kertas lewat busur, overshoot lalu menghilang. Bersamaan, penanda akar dan puncak muncul dengan squash/stretch + riak. |
| 175–215 | 6. Tahan | Jeda ±0,6 detik. Tidak ada yang bergerak selain gelembung. |
| 100–200 | 7. Gelembung | Gelombang "menandai lembar jawaban" berurutan, tiap gelembung: antisipasi 0,9 → 1,12 → 1. |
| 220+ | 8. Ajakan | Slider `a` bergerak sendiri sekali, lalu berhenti begitu pengguna menyentuhnya. |

## Storyboard: adegan scroll "Satu kurva, tiga mata pelajaran" (diskrub scroll)
Satu scene graph (`st`) dengan satu fungsi `render()`; seluruh timeline hanya menggerakkan angka-angka `st`.
| Progres | Adegan |
|---|---|
| 0.00–0.32 | Matematika: kurva digambar, penanda muncul, persamaan diketik. |
| 0.32–0.66 | Pemrograman: kurva meredup, panel kode masuk, perulangan mengisi 13 titik satu per satu sambil baris kode menyala. |
| 0.66–1.00 | Fisika: parameter `a`, `k` bermorf (kurva terbalik), kurva menjadi lintasan; bola bergerak dengan jejak, panah kecepatan, dan panah gravitasi. |

## Playblast
`NEXT_PUBLIC_MOTION_DEBUG=1` mengekspos `window.__gsap`. Skrip uji menghentikan timeline global, melompat ke setiap 6 bingkai, memotret area hero, lalu menyusunnya menjadi kontak sheet untuk ditinjau.
