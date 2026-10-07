# 04. UX dan identitas visual

Identitas "Pulau Belajar" tidak dipakai. Ini arahan, bukan desain final. Palet dan komponen dikunci setelah uji dengan pemilik usaha.

## Nada
Tenang, jelas, cepat. Alat kerja, bukan permainan. Bahasa Indonesia sehari-hari: "Tagihan belum dibayar", bukan "Piutang usaha"; istilah akuntansi muncul sebagai keterangan kedua untuk akuntan. Tanpa gamifikasi.

## Prinsip UX (dari keluhan R4)
1. **Layar pertama = angka hari ini**: kas, penjualan, tagihan jatuh tempo, stok menipis. Satu layar, satu HP.
2. **Mulai dari impor**: layar kosong menawarkan "Unggah Excel kamu" sebagai tombol utama.
3. **Tambah kolom, status, langkah persetujuan dari layar yang sama** tempat datanya dilihat (menu "Ubah tampilan ini"), bukan dari menu admin tersembunyi.
4. **Akuntansi di belakang layar**: orang mencatat "Jual", "Bayar", "Beli"; jurnal terbentuk sendiri dan bisa dibuka akuntan.
5. **Pratinjau sebelum rilis**: setiap ubahan konfigurasi ada tombol "Coba dulu" (sandbox), lalu "Terapkan", dan "Batalkan" untuk versi sebelumnya.
6. **Galat yang bisa diperbaiki**: pesan menyebut baris dan kolom, bukan kode.
7. **Cetak**: nota/faktur A4 dan thermal 58/80 mm, tanggal dan rupiah format Indonesia.
8. **Satu bahasa antar peran**: tampilan menyesuaikan peran (kasir hanya lihat kasir).

## Peta layar (MVP)
Beranda (angka hari ini) · Penjualan (daftar, buat, nota) · Pembelian · Stok · Kas & Bank · Pihak (pelanggan/pemasok) · Laporan · Impor · Pengaturan (perusahaan, orang & izin, modul, template, versi konfigurasi) · Mode akuntan (jurnal, periode, ekspor pajak, audit).

## Peran dan tampilan
Pemilik, Admin, Kasir/Staf lapangan (layar sangat sederhana, tombol besar), Akuntan (lintas klien, beralih perusahaan), Manajer unit.

## Visual (usulan awal)
- Tipografi: sans yang jelas untuk angka (tabular figures aktif). Satu keluarga huruf.
- Warna: netral hangat + satu aksen. Status memakai warna dan ikon/teks (jangan hanya warna).
- Kerapatan: dua mode, nyaman (HP) dan padat (tabel akuntan di desktop).
- Mobile-first, target Android kelas menengah ke bawah. PWA, tombol aksi di jangkauan ibu jari.
- Aksesibilitas: kontras AA, target sentuh minimal 44 px, tes axe di CI.
- Gerak: minim, hormati `prefers-reduced-motion`.
- Tidak ada 3D atau maskot. Kinerja HP murah lebih penting.

## Uji
Wawancara 15 sampai 20 pemilik usaha dan 5 akuntan sebelum desain dibekukan (R4 §6.2). Prototipe kertas/Figma-kasar untuk tiga alur: impor Excel, catat penjualan + nota, ubah status/kolom.
