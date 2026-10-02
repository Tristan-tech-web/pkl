# Panduan suara EduSmart

Berlaku untuk semua teks yang dibaca orang: halaman, tombol, pesan galat, dan keluaran AI (tutor, soal, pratinjau, saran rencana). Implementasi untuk AI ada di `apps/web/src/lib/voice.ts` (`VOICE_RULES` dan `scrubAi`).

## 1. Suara kita
Seperti kakak kelas atau guru muda yang menjelaskan di samping meja: **jelas dulu, lucu belakangan.** Santai tapi tidak sok akrab, hangat tapi tidak lebay. Kalau ragu antara jelas dan menghibur, pilih jelas.

- **Murid:** "kamu", kalimat pendek, boleh jenaka tipis. Contoh: "Belum waktunya diulang, XP berkurang."
- **Guru dan kepala sekolah:** "Anda", to the point, tanpa basa-basi. Mereka sibuk. Contoh: "3 soal draf siap disetujui."
- **Orang tua:** "Anda", tenang dan terang. Hindari istilah sekolah dan gim.
- **Nada ikut situasi.** Sukses: rayakan sebentar. Galat: bantu, jangan menyalahkan. Kosong: ajak mulai. Peringatan integritas: jelaskan dengan tenang, ada jalan banding.

Pelajaran dari panduan Mailchimp yang kami adopsi: *plainspoken* (tanpa jargon dan hype), *genuine*, *translator* (menyederhanakan, bukan memperumit), humor kering dan hanya bila pas.

## 2. Ciri tulisan AI yang kami buang
Dirangkum dari katalog Wikipedia "Signs of AI writing" dan beberapa artikel Indonesia (Jawa Pos, Eraspace).

**Pembuka dan penutup**
- "Tentu!", "Pertanyaan bagus!", "Pernahkah Anda bertanya-tanya...", "Di era digital saat ini...", "Berikut adalah..."
- Penutup ringkasan, "Semoga membantu!", "Jangan ragu untuk bertanya", "Ada hal lain yang bisa saya bantu?"

**Pola kalimat**
- Paralelisme negatif: "bukan hanya X, tetapi juga Y", "bukan X, melainkan Y".
- Daftar tiga hal yang terlalu rapi (*rule of three*), judul tebal dan poin-poin untuk hal sederhana.
- Tanda pisah panjang (—) di mana-mana. Di Indonesia kebanyakan orang memakai koma atau titik.
- Kalimat seragam panjangnya, selalu positif, selalu "benar", tanpa keraguan.
- Menjelaskan hal yang sudah jelas (*over-explaining*), definisi di awal ("X adalah...").
- Pengganti "adalah" yang bergaya: "berfungsi sebagai", "menjadi bukti", "menawarkan".

**Kata dan klaim**
- Kata kesayangan: krusial, esensial, holistik, komprehensif, memfasilitasi, mengoptimalkan, tak terpisahkan, ekosistem, "menyelami", "perjalanan belajar".
- Atribusi kabur: "para ahli sepakat", "banyak orang percaya".
- Promosi berlebihan: revolusioner, inovatif, solusi lengkap.
- Penutup bab "tantangan dan masa depan".

## 3. Cara menulis yang kami pakai
1. **Konkret.** Sebut hal yang bisa dibayangkan: "begadang bikin soal", "jajan di kantin", "dua menit sebelum bel".
2. **Satu ide per kalimat.** Campur kalimat pendek dan sedang. Boleh mulai dengan "Kalau", "Jadi", "Nah".
3. **Kata kerja, bukan kata benda berimbuhan.** "Pilih tema" lebih baik dari "Pemilihan tema".
4. **Tombol = kata kerja + objek.** "Mulai petualangan", "Daftarkan sekolah", bukan "Mari Memulai".
5. **Akui yang sulit.** "Soal ini memang licin." Jangan memuji berlebihan.
6. **Jangan menjanjikan yang belum ada.** Hal yang belum terverifikasi tetap bertanda ⚠ di dokumen, dan di layar ditulis apa adanya.
7. **Emoji secukupnya**, satu per momen, tidak di tengah kalimat serius.

## 4. Sebelum dan sesudah
| Sebelum | Sesudah |
|---|---|
| Tentu! Berikut adalah penjelasan tentang diskriminan. Diskriminan merupakan komponen krusial... Semoga membantu! | Diskriminan itu angka kecil di dalam rumus ABC yang memberi tahu berapa akar yang bakal kamu dapat. |
| Platform ini tidak hanya menyederhanakan administrasi, tetapi juga memberdayakan guru. | Absen, nilai, dan jadwal ada di satu tempat. Guru tidak perlu lagi membuka lima aplikasi. |
| Pola jawabanmu terlihat tidak biasa. Ini hanya dugaan komputer, bukan tuduhan. | Cara kamu menjawab tadi agak tidak biasa. Itu cuma dugaan komputer, belum tentu kamu salah. |
| Tutor memberi petunjuk, bukan jawaban kuis. | Tutor kasih petunjuk dulu. Jawaban kuis tidak. |

## 5. Penegakan
- Setiap prompt AI yang hasilnya dibaca orang menyertakan `VOICE_RULES` (tutor, bank soal, skill tree, rencana belajar, draf kurikulum).
- Setiap keluaran AI melewati `scrubAi` di pembersih (sanitizer) sebelum disimpan; tutor memakai mode `plain` (tanpa huruf tebal dan miring).
- Tes: `src/lib/voice.test.ts`. Tambah pola baru di sana bila menemukan kebiasaan model yang lolos.
- Teks UI baru: baca keras-keras. Kalau terdengar seperti brosur, tulis ulang.

## Sumber
Wikipedia: Signs of AI writing; Jawa Pos dan Eraspace (ciri tulisan AI berbahasa Indonesia); Mailchimp Content Style Guide (voice and tone).
