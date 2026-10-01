# R2 — Ilmu belajar untuk skill tree, jadwal buka, dan bank soal

Tujuan: menentukan aturan yang membuat belajar siswa lebih efisien (bukan sekadar lebih ramai), lalu menerjemahkannya menjadi aturan produk. Klaim bersumber ditautkan; hal yang saya simpulkan sendiri ditandai **(inferensi)**; yang belum bersumber untuk konteks Indonesia ditandai ⚠.

## Temuan

| # | Temuan | Sumber | Dampak ke produk |
|---|---|---|---|
| 1 | Dari 10 teknik belajar, yang paling efektif adalah **latihan terdistribusi (spaced)** dan **latihan mengingat/tes (retrieval)**; meta-analisis 242 studi, 169 ribu partisipan mereplikasi Dunlosky 2013. | [Hattie & Donoghue 2021 via ringkasan](https://evidencebased.education/resource/retrieval-and-spaced-practice-study-strategies-that-must-be-combined/) | Bank soal adalah mesin utama belajar, bukan hiasan; jadwalnya terdistribusi. |
| 2 | Retrieval berjarak > retrieval menumpuk (g = 0,74, 29 studi); latihan retrieval di kelas menurunkan kecemasan ujian. | [ringkasan meta-analisis](https://eprints.whiterose.ac.uk/id/eprint/229807) | Kuis rutin kecil berisiko rendah (XP, bukan nilai) justru mengurangi cemas. |
| 3 | **Efek pretes**: menjawab pertanyaan *sebelum* belajar, walau salah, meningkatkan belajar sesudahnya dibanding membaca lebih lama. | [Richland, Kornell & Kao 2009](https://learninglab.uchicago.edu/Pre-Testing_files/RichlandKornellKao.pdf) | Simpul "Persiapan" sebelum pelajaran berisi 3–5 pertanyaan pancingan, bukan bacaan panjang. |
| 4 | **Tidur memadatkan memori**: pada siswa 10–15 tahun, uji sebelum pelajaran + tidur membuat gain bertahan sampai 5 hari. | [Naps in school, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4042263/) | Persiapan dikerjakan **malam sebelum** pelajaran; hindari mendorong belajar larut malam. **(inferensi)**: jendela buka sore hari, bukan tengah malam. |
| 5 | **Jarak optimal** antar sesi ≈ 10–40% dari waktu sampai tes (kurva U terbalik); makin jauh tesnya, makin kecil rasio optimal (5–10% untuk 1 tahun). | [Cepeda dkk. 2008](https://www.cambridge.org/core/product/C833408A4C3BAD939CA39EA734423BB7) | Penjadwal ulang: interval ulang dihitung dari tanggal ulangan, bukan angka tetap. Contoh: ulangan 30 hari lagi → ulang tiap 3–12 hari. |
| 6 | Model **half-life regression** Duolingo memperkirakan peluang ingat p = 2^(−Δ/h) dan menurunkan galat >45% dibanding baseline. | [Settles & Meeder 2016](https://preview.aclanthology.org/landing_page/P16-1174) | Skor "kekuatan ingatan" per siswa per keterampilan; pilih soal yang hampir lupa. Mulai dari versi sederhana (Leitner + faktor kesulitan), latih HLR bila data cukup. |
| 7 | **Kesulitan yang diinginkan**: spacing, interleaving, tes, variasi kondisi menyulitkan tetapi memperkuat retensi/transfer. Interleaving: +0,28 SD pada tes jangka pendek di sekolah dasar Nigeria, tanpa efek pada tes akhir tahun kumulatif; keuntungan terbesar pada siswa berprestasi rendah. | [Bjork & Bjork](https://sites.lifesci.ucla.edu/psych-bjorklab/wp-content/uploads/sites/13/2020/01/BjorkBjorkEducatinMythChapterPublishedFormSept2019.pdf), ringkasan studi lapangan | Sesi latihan mencampur topik lama; jangan berlebihan. Jangan menjanjikan efek besar pada ujian akhir. |
| 8 | Hadiah ekstrinsik berlebihan mengikis motivasi intrinsik (overjustification); gamifikasi "dangkal" (poin/lencana/papan peringkat saja) sering gagal. | [Deci, Koestner & Ryan 1999](https://journals.sagepub.com/doi/10.3102/00346543071001001), [Gamification Equilibrium](https://journal.seriousgamessociety.org/~serious/index.php/IJSG/article/view/633) | XP harus mencerminkan **upaya dan penguasaan**, dengan cerita/pilihan/kerja sama, bukan menimbun angka. |

## Aturan produk turunan

1. **Skill tree terikat jadwal pelajaran.** Tiap simpul "Persiapan" terikat satu pertemuan (slot jadwal + tanggal). Terbuka **H-1 pukul 15.00 WIB** (default sekolah, dapat diganti: H-1 sore / H-2 / bebas) dan tetap terbuka sesudahnya. Alasan: temuan 3 dan 4. Siswa yang ingin belajar duluan tidak dihukum: guru boleh memilih "bebas" (otonomi).
2. **Isi Persiapan = pretes ringan** (3–5 soal pancingan, salah itu wajar, tanpa penalti) + ringkasan 2 menit. Total ≤ 8 menit.
3. **Setelah pertemuan**: simpul **Latihan** otomatis muncul pada +1, +3, +7, +14 hari (disesuaikan rasio 10–40% menuju tanggal ulangan, temuan 5). Isi dipilih per siswa dari butir yang hampir lupa (temuan 6) dan dicampur topik lama (temuan 7).
4. **Checkpoint/Boss** sebelum ulangan: kuis kumulatif berjarak, tanpa tekanan nilai.
5. **Dosis harian kecil**: sesi 5–10 menit; XP punya pengembalian menurun setelah ±30 soal/hari (juga anti-farming, lihat R3). Tidak ada notifikasi larut malam.
6. **Tidak mengunci balik**: simpul lama tetap bisa dikerjakan; yang berubah hanya bonus ketepatan waktu.

## Batasan yang harus dijujurkan
- Sebagian bukti berasal dari mahasiswa/laboratorium; efek di kelas lebih kecil. Jangan mengklaim "meningkatkan nilai X%".
- Jendela H-1 adalah **hipotesis desain** berdasar temuan 3–4, belum diuji pada konteks sekolah Indonesia ⚠. Rencanakan uji A/B kecil (kelas dengan dan tanpa jendela) dan ukur penyelesaian serta skor kuis pertama.
