# R5. Arsitektur fleksibel tanpa lambat, tidak aman, atau tak terpelihara

Status: draf riset, 2026-10-07. Bagian 4 dari riset pivot ke platform manajemen perusahaan.
Tumpukan yang sudah ada: Next.js 16 (App Router), Supabase (Postgres, Auth, RLS, tanpa service-role key), Vercel.

Catatan metode. Hanya sebagian sumber dibuka lewat pencarian pada sesi ini (ditandai [S] di daftar sumber). Sisanya berasal dari pengetahuan umum penulis tentang dokumentasi produk tersebut dan ditandai ⚠ bila ada angka atau klaim yang perlu dicek ulang. Tidak ada angka benchmark yang dikarang. Bila tidak ada angka bersumber, tertulis "harus diukur" dan eksperimennya ada di bagian 6.

---

## 0. Kesimpulan singkat

1. Pakai model **hibrid berlapis**. Inti kaku (ledger, stok, pajak, izin, audit) sebagai tabel Postgres biasa. Bidang kustom sebagai JSONB per entitas, dengan definisi bidang disimpan sebagai data. Alur kerja, tampilan, laporan, template: metadata (JSON terversi) yang divalidasi skema.
2. **Jangan** buat tabel per tenant lewat DDL di runtime pada tahap awal. **Jangan** pakai EAV murni sebagai penyimpanan utama.
3. Kekakuan di ledger itu fitur. Fleksibilitas ada di tepi: bidang, tampilan, alur, dokumen.
4. RLS dibuat dengan satu pola: `perusahaan_id` di setiap baris, daftar keanggotaan pengguna yang bisa di-cache dalam satu subquery `(select ...)`, dan atribut (cabang, departemen, batas nilai) dibaca dari klaim JWT atau tabel kecil yang di-index.
5. Bahaya terbesar bukan performa, tetapi "inner-platform effect": membangun bahasa pemrograman dan database kedua di dalam aplikasi. Batasi dengan daftar kemampuan yang sengaja dipotong dan jalur keluar ke kode.
6. Sebelum dikunci, ukur: JSONB dengan GIN vs kolom biasa, RLS dengan keanggotaan bertingkat, laporan atas JSONB, ledger di Postgres, dan biaya migrasi template.

---

## 1. Spektrum fleksibilitas

Lima titik pada spektrum, dari paling kaku ke paling cair. Untuk tiap titik: apa yang didapat, apa biayanya, batas performa, RLS, SQL/laporan, migrasi, pengalaman pengembang.

### 1.1 Tabel tetap (kolom biasa, skema ditulis tim)

- Kelebihan: tipe kuat, constraint (`NOT NULL`, `CHECK`, foreign key), planner Postgres punya statistik per kolom, index B-tree murah, laporan SQL paling mudah.
- Biaya: setiap permintaan "tambah kolom" butuh migrasi dan deploy. Pelanggan tidak bisa mengubah sendiri.
- Performa: terbaik. Tidak ada angka umum yang jujur untuk disebut; tergantung ukuran baris dan index. Ini patokan yang dipakai untuk membandingkan yang lain di bagian 6.
- RLS: paling sederhana. Satu kebijakan per tabel, kolom `perusahaan_id` ber-index.
- Laporan: SQL biasa, tool BI mana pun langsung bisa.
- Migrasi: alat standar (file migrasi, pgTAP). Sudah dipakai proyek ini.
- Pengembang: terbaik. Tipe dari `generate_typescript_types` akurat.

Cocok untuk: semua yang disentuh uang, stok, pajak, hak akses, audit.

### 1.2 Kolom kustom JSONB (tabel tetap + satu kolom `custom jsonb`)

Ini pola yang dipakai Frappe/ERPNext secara berbeda (Custom Field menambah kolom sungguhan di tabel; lihat 1.5), dan pola yang umum dipakai CRM berbasis Postgres.

- Kelebihan: pengguna menambah bidang tanpa DDL. Satu tabel, satu RLS, join normal. Index GIN atau index ekspresi pada kunci yang sering dicari.
- Biaya:
  - Tipe tidak dijaga database. Validasi harus di aplikasi atau lewat `CHECK` dengan fungsi (mis. `jsonb_matches_schema` dari ekstensi `pg_jsonschema`, tersedia di Supabase ⚠ cek versi).
  - Statistik planner untuk isi JSONB buruk: Postgres tidak menyimpan statistik per kunci di dalam JSONB, sehingga estimasi baris untuk `custom->>'x' = '...'` memakai tebakan default. Ini penyebab umum rencana query buruk ⚠ (diketahui luas di komunitas Postgres; dibuktikan lewat `EXPLAIN` pada spike E2).
  - Penulisan: mengubah satu kunci menulis ulang seluruh nilai JSONB karena MVCC. Dokumen besar berarti write amplification [S: pulse.support, Snowflake blog].
  - TOAST: bila baris melewati sekitar 2 KB, nilai dikompresi dan dipindah ke tabel TOAST; membaca satu kunci tetap harus mengambil dan mendekompresi seluruh nilai [S]. Jadi jaga `custom` kecil (puluhan bidang, bukan ratusan), dan letakkan blob besar di tabel lain.
- GIN: `jsonb_ops` (default) mendukung `@>`, `?`, `@?`, `@@`. `jsonb_path_ops` lebih kecil dan lebih cepat untuk `@>` saja [S]. Index GIN memperlambat INSERT/UPDATE; `fastupdate` dan `gin_pending_list_limit` mengatur ini. Besarnya penalti harus diukur (E1).
- RLS: tidak berubah, karena RLS bekerja di tingkat baris. Namun izin per bidang (bidang gaji hanya untuk HR) tidak bisa lewat RLS biasa. Opsi: view yang memfilter kunci, atau simpan bidang sensitif di tabel anak terpisah dengan RLS sendiri.
- Laporan: bisa, tapi `custom->>'x'` harus di-cast tiap kali, dan tool BI tidak mengenalinya. Solusi: view terwujud atau fungsi pembuat view yang membuka bidang kustom menjadi kolom (lihat 3.9).
- Migrasi: mengubah tipe bidang berarti migrasi data di JSON (skrip), bukan `ALTER`. Harus ada pengerjaan batch dan versi definisi.
- Pengembang: tipe TypeScript untuk `custom` tidak statis; harus dibangkitkan dari definisi bidang saat runtime (zod dari metadata).

### 1.3 EAV (entity-attribute-value)

Satu tabel `(entity_id, attribute_id, value_text/number/date...)`. Magento memakai ini untuk katalog; Odoo awalnya tidak.

- Kelebihan: bidang tak terbatas, bisa di-index per atribut dengan index parsial, bisa beri izin per bidang (baris per nilai punya RLS sendiri).
- Biaya: satu "baris bisnis" menjadi N baris; membaca satu entitas butuh N baris atau pivot; query filter multi-bidang butuh self-join atau agregasi, yang cepat memburuk. Constraint tipe lemah. Ini alasan utama EAV dijauhi untuk data transaksional ⚠ (pengetahuan umum; Magento punya riwayat masalah performa EAV, tidak dibuka sumbernya di sesi ini).
- Performa: tidak ada angka bersumber. Harus diukur (E1).
- RLS: bagus secara teori, tetapi kebijakan harus menurunkan `perusahaan_id` ke setiap baris nilai (denormalisasi) atau join ke induk, yang mahal.
- Laporan: buruk. Pivot dinamis.
- Migrasi: mudah menambah atribut, sulit mengubah tipe.
- Pengembang: sulit di-debug; satu bug menyebar ke banyak baris.

Pakai EAV hanya untuk hal yang jarang dicari dan jarang dilaporkan, mis. properti tambahan pada konfigurasi, bukan untuk faktur atau pesanan.

### 1.4 Tabel dinamis per tenant (DDL di runtime)

Setiap perusahaan atau setiap entitas kustom mendapat tabel sungguhan (`CREATE TABLE tenant_x.pesanan`), atau skema per tenant.

- Kelebihan: tipe, constraint, index dan statistik asli. Laporan SQL penuh. Isolasi kuat (skema per tenant).
- Biaya: DDL butuh kunci tabel dan hak lebih tinggi. Katalog Postgres membengkak bila ada puluhan ribu tabel; pg_dump, migrasi, dan cache relasi melambat ⚠ (diketahui di komunitas; batas tepat harus diukur, E4). Migrasi template harus dijalankan N kali. Dengan Supabase tanpa service-role key, DDL dari aplikasi harus lewat fungsi `SECURITY DEFINER` yang sangat dibatasi, yang melemahkan prinsip "tanpa kunci tinggi". PostgREST juga memuat cache skema; skema/tabel baru butuh reload cache ⚠ (perilaku PostgREST; cek di dokumentasi Supabase).
- RLS: harus dibuat per tabel baru secara otomatis. Lupa satu kebijakan berarti kebocoran data. Perlu pengujian otomatis tiap tabel baru.
- Laporan: terbaik setelah tabel ada.
- Migrasi: paling mahal pada skala banyak tenant.
- Pengembang: tipe TypeScript tidak statis lagi.

Salesforce memakai pendekatan berbeda untuk memecahkan ini: semua tenant berbagi tabel "slot" generik (kolom `Value0..ValueN`) dan metadata memetakan nama; tabel fisik tidak dibuat per objek ⚠ (dari paparan arsitektur multitenant Salesforce, tidak dibuka ulang di sesi ini). Intinya mereka menghindari DDL per tenant. Mereka tetap membatasi: custom object per org berbeda menurut edisi, mis. 200 untuk Enterprise dan 2.000 untuk Unlimited/Performance [S: cheat sheet limit Salesforce], dan hanya 26 relasi master-detail per objek kustom menurut hasil pencarian [S].

Rekomendasi: jangan sebagai default. Pertimbangkan hanya sebagai "tingkat enterprise" untuk satu tenant besar dengan database/proyek sendiri.

### 1.5 Metadata-driven penuh (DocType/ir.model/Studio)

Struktur, tampilan, izin, alur, dan laporan semuanya data. Aplikasi adalah interpreter.

- **Frappe/ERPNext**: DocType mendeklarasikan field, validasi, izin, penamaan; framework membuat tabel, form, list view, dan endpoint REST dari deklarasi itu [S: ecosire]. Custom Field dan Property Setter disimpan di database dan sebagai lapisan di atas DocType standar, sehingga tidak tertimpa saat upgrade [S]. Tangga kustomisasi: Custom Field, Property Setter, Client Script, Server Script, lalu aplikasi kustom [S]. Perhatikan: Frappe membuat kolom sungguhan di tabel (DDL pada Custom Field) ⚠ (pengetahuan umum tentang Frappe, tidak diverifikasi di sesi ini).
- **Odoo**: model dan field juga tercatat di `ir.model` dan `ir.model.fields`; field kustom berawalan `x_` dan menjadi kolom sungguhan. Odoo Studio membuat modul kustom otomatis. Masalah upgrade terkenal: kustomisasi Studio dan modul pihak ketiga memperlambat dan memperumit migrasi versi mayor ⚠ (laporan komunitas luas; tidak dibuka sumber tertentu).
- **Salesforce**: metadata-driven; dua batasan penting adalah limit per edisi dan governor limit Apex per transaksi [S].
- **Airtable/NocoDB/Baserow/Teable**: NocoDB dan Baserow membuat tabel Postgres sungguhan lewat DDL di balik antarmuka; Baserow mengakui bahwa tabel dan field dibuat sebagai objek database nyata ⚠ (dari pemahaman umum; cek dokumentasi). Airtable punya limit baris per base dan per tabel menurut paket ⚠ (angka berubah, tidak dikutip).
- **Notion databases**: properti bertipe per database, relasi dan rollup; tidak ada transaksi akuntansi, jadi bukan model untuk uang.
- **Directus**: membungkus skema SQL yang ada, menyimpan metadata di tabel `directus_*`. Pendekatan "skema SQL tetap yang ditemani metadata" lebih dekat ke yang disarankan di sini ⚠.
- **Hasura**: metadata GraphQL/izin di atas Postgres; izin berbasis atribut sesi (`X-Hasura-*`) ⚠.

Penilaian umum metadata-driven penuh:
- Kelebihan: pelanggan mengubah hampir apa saja tanpa deploy.
- Biaya: mesin penerjemah besar; setiap fitur ditulis dua kali (sekali sebagai kemampuan, sekali sebagai UI konfigurasi); debug sulit karena perilaku ada di data.
- RLS: perlu satu model izin umum yang memadai untuk semua entitas kustom; layak karena semua entitas kustom bisa berbagi satu tabel fisik (bagian 3.1).

---

## 2. Apa yang kaku dan apa yang fleksibel

### 2.1 Tetap kaku

| Area | Alasan teknis |
|---|---|
| Ledger akuntansi | Invarian double-entry (jumlah debit = kredit per transaksi) harus dijaga database, bukan kode UI. Hanya tambah baris; koreksi lewat entri pembalik. TigerBeetle sengaja hanya punya dua tabel tetap (akun dan transfer) tanpa kolom bebas, dan menaruh metadata di database lain [S: docs TigerBeetle]. Skema bebas di ledger merusak jaminan audit. |
| Stok | Saldo stok adalah jumlah dari gerakan. Butuh kunci/serialisasi untuk mencegah stok negatif dan balapan. Tipe angka harus `numeric` dengan satuan jelas. Kustomisasi struktur gerakan stok menggandakan kasus uji. |
| Pajak | Aturan pajak punya masa berlaku dan sumber hukum. Ia harus tabel berversi dengan tanggal efektif, bukan formula bebas per pengguna. Klaim pajak Indonesia yang belum bersumber ditandai ⚠ dan bukan preset (sesuai aturan proyek). |
| Hak akses | Dasar keamanan; harus ditegakkan di database (RLS) dan diuji pgTAP. Bila izin ikut "fleksibel" tanpa batas, tidak ada yang bisa membuktikan isolasi tenant. |
| Audit | Append-only, tidak bisa diubah oleh peran aplikasi. Tidak boleh ditimpa kustomisasi. |
| Identitas dan keanggotaan | Siapa anggota perusahaan mana. Dasar semua RLS. |

Aturan praktis: bila kesalahan di area itu bisa menyebabkan angka keuangan salah atau kebocoran lintas perusahaan, ia kaku. Fleksibilitas diberikan pada data yang melekat ke ledger (mis. "tag", "proyek", "dimensi analitik"), bukan pada struktur ledger.

Dimensi analitik adalah jalan tengah yang baik: ledger kaku tetapi tiap baris jurnal punya `dimensi jsonb` atau kolom FK ke dimensi (proyek, departemen, cabang) yang daftarnya fleksibel. Odoo memakai akun analitik untuk tujuan serupa ⚠.

### 2.2 Boleh sangat fleksibel

- Bidang kustom pada entitas bisnis (pelanggan, proyek, aset, tugas, dokumen).
- Entitas kustom baru (objek "Kendaraan", "Izin Kerja") yang tidak menyentuh uang atau stok.
- Tampilan: daftar, kanban, kalender, formulir, dasbor.
- Alur kerja dan persetujuan (status, transisi, aturan).
- Template dokumen (cetak, PDF, surat) dan penomoran.
- Laporan buatan pengguna (dengan batas biaya, lihat 3.9).
- Template industri (paket konfigurasi: entitas, bidang, alur, laporan, bagan akun awal).

Alasan teknis: semuanya tidak mengubah invarian. Kesalahan konfigurasi merusak satu tampilan atau satu alur, bukan angka buku besar. Semuanya bisa divalidasi sebagai data (skema JSON) dan di-rollback sebagai versi.

---

## 3. Pola desain

### 3.1 Entitas kustom dengan bidang bertipe

Tabel metadata (semua dengan `perusahaan_id` dan RLS):

```
entity_type(id, perusahaan_id, kunci, nama, versi, aktif)
field_def(id, entity_type_id, kunci, label, tipe, wajib, opsi jsonb, urutan, versi_dari, versi_sampai)
record(id, perusahaan_id, entity_type_id, data jsonb, dibuat_oleh, dibuat_pada, versi_skema int)
```

- Satu tabel fisik `record` untuk semua entitas kustom. Tidak ada DDL. Pembatas: satu tabel besar, jadi partisi menurut `perusahaan_id` bila perlu (hash partition) setelah diukur (E1).
- Tipe bidang dibatasi daftar kecil yang sengaja dipilih: teks, angka (numeric), tanggal, boolean, pilihan tunggal, pilihan ganda, relasi, pengguna, berkas, formula. Tiap tipe punya validator di satu tempat (zod dibangkitkan dari `field_def`) dan dijaga lagi di database lewat `CHECK` dengan `pg_jsonschema` atau trigger `BEFORE INSERT/UPDATE` ⚠ (cek ketersediaan ekstensi di proyek Supabase lewat `list_extensions`).
- Entitas inti (pelanggan, pemasok, produk, karyawan) tetap tabel biasa dengan kolom `custom jsonb` untuk tambahan. Entitas kustom murni memakai `record`.
- Bidang sering-dicari: index ekspresi parsial per bidang yang dipromosikan: `CREATE INDEX ... ON record ((data->>'plat')) WHERE entity_type_id = '...'`. Pembuatan index per bidang dilakukan lewat fungsi `SECURITY DEFINER` terbatas, dengan batas jumlah index per tenant. Ini DDL kecil, bukan tabel baru.
- "Promosi bidang": bila bidang kustom ternyata dipakai di banyak laporan dan filter, pindahkan jadi kolom biasa lewat migrasi tim. Ini jalur dari fleksibel ke kaku yang tidak merusak data.

Perhatian: JSONB tidak menjaga integritas referensial. Relasi harus ditangani sendiri (3.2).

### 3.2 Relasi kustom

Dua pilihan:

1. Bidang bertipe "relasi" menyimpan UUID rekaman tujuan di JSONB. Mudah, tapi tak ada FK; rekaman tujuan yang dihapus meninggalkan referensi menggantung.
2. Tabel `record_link(perusahaan_id, dari_id, ke_id, tipe_relasi_id, urutan)` dengan FK nyata ke `record`/tabel inti dan index di kedua arah. Mendukung banyak-ke-banyak, integritas, dan kueri balik ("semua tugas milik proyek ini").

Pilih opsi 2 untuk relasi yang dikueri dari dua sisi; opsi 1 hanya untuk rujukan sekali baca. Hapus rekaman dengan soft delete (`dihapus_pada`) agar relasi tidak menggantung, dan beri aturan kaskade yang dipilih per tipe relasi (blokir, lepas, kaskade). Batasi kedalaman rollup lintas relasi (mis. maksimum dua lompatan) untuk menjaga biaya.

Catatan Salesforce: batas 26 relasi master-detail per objek kustom [S] menunjukkan bahwa vendor matang pun membatasi relasi; tetapkan batas yang jelas sejak awal.

### 3.3 Formula dan bidang turunan

Pilihan mesin:

- **JSONLogic**: aturan sebagai JSON, aman (tanpa eksekusi kode), mudah disimpan dan dibuat lewat UI. Ekspresivitas terbatas; mudah dibaca mesin tapi sulit dibaca manusia ⚠.
- **CEL (Common Expression Language)**: dirancang Google untuk ekspresi aman, tipe kuat, terbatas waktu dan tanpa efek samping, dipakai di Kubernetes dan Firebase rules ⚠. Ada implementasi JS (`cel-js`) dengan kematangan beragam ⚠ perlu dicek.
- **expr-eval / mathjs**: ringan untuk rumus gaya spreadsheet; perlu tinjau keamanan (ada kerentanan historis pada pustaka evaluasi ekspresi JS, termasuk expr-eval ⚠ cek CVE sebelum dipakai).
- **HyperFormula**: mesin spreadsheet headless dengan sintaks Excel, bagus bila pengguna sudah mengenal Excel; lisensi non-komersial/komersial ⚠ cek.

Rekomendasi awal: subset ekspresi sendiri kecil atau CEL, dengan tipe kuat, tanpa loop, batas langkah dan waktu. Alasan: lebih mudah dikunci keamanannya dan dijalankan di dua tempat dengan hasil sama.

Pertanyaan desain yang menentukan: **di mana formula dihitung**.
- Dihitung saat tulis dan disimpan (bidang tersimpan): cepat dibaca, bisa di-index dan dilaporkan. Biaya: harus dihitung ulang saat input berubah (grafik ketergantungan).
- Dihitung saat baca: tidak pernah basi, tapi mahal untuk daftar besar dan tak bisa difilter di SQL.

Saran: formula default dihitung saat tulis dan disimpan di JSONB (dengan `versi_formula`), dihitung ulang oleh pekerjaan latar untuk perubahan definisi. Formula lintas rekaman (rollup) dihitung oleh pekerjaan latar dan ditandai "segar sampai" waktu tertentu. Siklus ketergantungan ditolak saat definisi disimpan.

Untuk uang: formula tidak boleh menulis ke ledger. Formula hanya menghitung nilai di dokumen; posting ke buku besar lewat fungsi kaku.

### 3.4 Status dan alur persetujuan (mesin status deklaratif)

Model data:

```
workflow(id, perusahaan_id, entity_type_id, versi, definisi jsonb)
-- definisi: states[], transitions[{dari, ke, peran/ekspresi izin, kondisi, aksi[]}]
workflow_instance(record_id, workflow_id, versi, status_sekarang)
transition_log(record_id, dari, ke, oleh, pada, komentar)   -- append-only
approval(record_id, langkah, pemberi, status, batas_waktu)
```

- Validasi definisi saat disimpan: semua state terjangkau, ada minimal satu state akhir, tak ada transisi yatim, kondisi lolos parse.
- Transisi dijalankan oleh **satu fungsi Postgres** (`aplikasikan_transisi(record_id, transisi_id)`) yang memeriksa izin, kondisi, dan menulis log dalam satu transaksi. Alasan: aturan tegak di database walau klien dimodifikasi.
- Persetujuan: berurutan, paralel, atau "salah satu dari peran X". Delegasi dan batas nilai ("di atas 50 juta butuh direktur") dinyatakan sebagai kondisi pada transisi. Ekspresi memakai mesin formula yang sama.
- Frappe punya Workflow DocType dengan state dan transition dengan peran dan kondisi, yang memberi gambaran struktur ini ⚠ (pengetahuan umum).
- Alur panjang dengan penantian berhari-hari (SLA, pengingat, eskalasi): simpan `batas_waktu` dan biarkan pekerjaan terjadwal (`pg_cron`) memicu eskalasi. Temporal/Camunda memberi durabilitas dan versi proses yang kuat tetapi menambah layanan terpisah yang harus dijalankan; tidak cocok sebagai tahap awal di Vercel + Supabase ⚠. Bila nanti butuh proses lintas sistem berjam-jam, Temporal Cloud atau n8n bisa menjadi tahap dua. Prinsip dari Temporal yang layak ditiru: definisi proses berversi, instance lama tetap berjalan di versi lamanya ⚠.
- Versi: instance yang sedang berjalan menyimpan `versi` definisi yang dipakainya. Perubahan definisi hanya berlaku untuk instance baru, kecuali ada migrasi eksplisit.

### 3.5 Aturan otomatis (pemicu, kondisi, aksi)

```
automation(id, perusahaan_id, pemicu jsonb, kondisi jsonb, aksi jsonb[], aktif, versi)
automation_run(id, automation_id, event_id, status, mulai, selesai, galat, input_hash)
```

- Pemicu: rekaman dibuat/diubah/berpindah status, jadwal, webhook masuk, tombol manual.
- Aksi dibatasi daftar tertutup: ubah bidang, buat rekaman, kirim notifikasi/email, panggil webhook keluar, mulai persetujuan. Tanpa kode bebas pada tahap awal. Server Script Frappe menunjukkan kekuatan kode bebas dan sekaligus sumber risiko upgrade dan keamanan [S: tangga kustomisasi].
- Eksekusi: event ditulis ke tabel `outbox` dalam transaksi yang sama dengan perubahan data. Pekerja (Supabase Edge Function terjadwal atau antrean seperti `pgmq`) membaca outbox dan menjalankan aturan. Ini menghindari "perubahan tersimpan tapi aturan tak jalan". Eksekusi harus **idempoten**: kunci `(automation_id, event_id)` unik.
- Pencegah liar: batas kedalaman rantai (aturan memicu aturan), batas eksekusi per menit per tenant, sirkuit pemutus setelah N galat, dan log yang bisa dilihat pengguna ("mengapa aturan ini jalan").
- Perbandingan: n8n cocok sebagai alat integrasi pihak luar, bukan inti aturan multi-tenant karena model data dan izinnya tidak dibuat untuk RLS per perusahaan ⚠.

### 3.6 Tampilan

Satu tabel `view_def(id, perusahaan_id, entity_type_id, jenis, konfigurasi jsonb, dibagikan_ke, pemilik)`.

- Jenis: `daftar` (kolom, urutan, filter, pengelompokan), `kanban` (bidang pengelompokan = pilihan tunggal/status, kartu), `kalender` (bidang tanggal mulai/selesai), `formulir` (tata letak, bagian, aturan tampil bersyarat), `dasbor` (kisi widget; widget merujuk laporan tersimpan).
- Filter disimpan sebagai pohon ekspresi terstruktur, diterjemahkan ke SQL parametris oleh satu penerjemah di server, bukan teks SQL dari pengguna. Penerjemah itu menjadi satu-satunya jalur kueri dinamis dan harus diuji fuzz.
- Paginasi pakai keyset (cursor), bukan OFFSET, untuk daftar besar.
- Pengguna boleh punya tampilan pribadi; tampilan bersama diatur izin.
- Gaya Airtable/Notion (banyak tampilan atas satu data) sudah jadi harapan pengguna; bagian rumit ada di penerjemah filter dan pengurutan atas JSONB (butuh index ekspresi untuk bidang yang sering dipakai).

### 3.7 Impor dan ekspor

- Impor: unggah CSV/XLSX ke Storage, pemetaan kolom ke bidang, tahap **pratinjau dan validasi** (kesalahan per baris tanpa menulis), lalu penulisan dalam batch lewat pekerjaan latar dengan `import_job` yang bisa dilanjutkan. Kunci idempotensi (`kunci_eksternal`) agar impor ulang tidak menggandakan.
- Impor ke ledger bukan impor biasa: saldo awal dimasukkan sebagai jurnal pembuka lewat fungsi posting kaku.
- Ekspor: CSV streaming dari view yang sudah menerapkan RLS, bukan dari kunci tinggi. Ekspor besar lewat pekerjaan latar dan tautan unduh bertanda tangan waktu.
- Migrasi data pelanggan dari sistem lama: sediakan "adaptor" per sumber (Excel, Accurate, Jurnal, dsb.) sebagai template pemetaan. Pekerjaan ini besar dan layak dijadikan produk sendiri; ⚠ nama dan format ekspor produk Indonesia belum diteliti di sini.

### 3.8 Versi dan lingkungan uji (sandbox) per perusahaan

Pisahkan **konfigurasi** dari **data**.

- Konfigurasi (entity_type, field_def, workflow, automation, view_def, laporan, template dokumen) disimpan dengan kolom `versi` dan `status` (draf, terbit, arsip). Satu `config_release(perusahaan_id, nomor, dibuat_oleh, ringkasan, snapshot_hash)` mengikat satu set versi menjadi satu rilis yang bisa di-rollback.
- Sandbox: dua pendekatan.
  1. **Sandbox logis**: kolom `lingkungan` ('produksi' | 'uji') di tabel konfigurasi dan data, atau perusahaan kloning terpisah (`perusahaan.induk_id`). Perusahaan kloning dengan data sintetis atau salinan terpilih paling sederhana dan memakai RLS yang sama.
  2. **Branch database** Supabase: berguna untuk pengujian tim kami, bukan untuk pelanggan, karena biayanya per cabang dan siklus hidupnya untuk pengembang ⚠ (cek harga/limit di dokumentasi Supabase).
- Alur: ubah konfigurasi di sandbox, jalankan uji (data contoh, alur, formula), lalu "terbitkan" sebagai rilis ke produksi. Penerbitan memeriksa kompatibilitas: tidak boleh menghapus bidang yang masih dipakai rekaman atau laporan tanpa jalur migrasi.
- Perubahan tipe bidang diperlakukan seperti migrasi: butuh transformasi eksplisit dan pekerjaan latar, dengan `versi_skema` per rekaman agar data lama tetap terbaca.
- Pola "expand and contract" dari praktik migrasi skema aman berlaku: tambah dulu (kompatibel), pindahkan data, baru hapus setelah rilis berikutnya.

### 3.9 Laporan buatan pengguna

Ini area penyebab lambat paling umum. Pilihan:

- **Lapisan semantik**: definisi ukuran dan dimensi sebagai data (Cube, Metabase model, dbt semantic layer). Pengguna merakit laporan dari ukuran/dimensi yang disetujui, bukan SQL bebas. Cube bisa jadi mesin ini tetapi menambah layanan dan model izinnya perlu dihubungkan ke RLS per tenant (Cube mendukung `securityContext` untuk filter per tenant ⚠ cek dokumentasi).
- **Pembangun laporan internal**: penerjemah (seperti filter tampilan) menghasilkan SQL agregasi parametris atas satu entitas dengan maksimum N relasi.
- Pengaman biaya: `statement_timeout` per peran, batas baris hasil, antrean laporan berat ke pekerjaan latar, hasil di-cache per (laporan, parameter, versi data), kuota laporan per perusahaan.
- Bidang kustom dalam laporan: untuk entitas yang sering dilaporkan, buat **view terwujud per entitas** yang membuka bidang kustom jadi kolom, dibangun ulang saat definisi bidang berubah dan di-refresh terjadwal. Atau tabel "baca" (read model) terpisah yang diisi dari outbox. Kedua opsi harus diukur (E3).
- Metabase embed memakai kunci tinggi untuk membaca; bila dipakai, hanya dengan peran database baca-saja yang tunduk RLS, atau di replika terpisah. Ini keputusan keamanan, bukan sekadar kenyamanan ⚠.
- Laporan keuangan standar (neraca, laba rugi, buku besar) tetap SQL ditulis tim di atas ledger kaku, bukan dari pembangun laporan.

### 3.10 Template industri yang bisa dipasang dan diperbarui

Template = paket konfigurasi berversi: entitas, bidang, alur, aturan, tampilan, laporan, bagan akun awal, dokumen.

Masalah inti: pembaruan template tidak boleh menimpa kustomisasi pelanggan. Pola yang bekerja (analog Custom Field/Property Setter Frappe, yang tersimpan sebagai lapisan terpisah dan tidak tertimpa upgrade [S]):

- Setiap objek konfigurasi punya `sumber` ('template:<nama>@<versi>' atau 'kustom') dan `kunci_stabil` yang tidak berubah antar versi template.
- Kustomisasi pelanggan disimpan sebagai **lapisan tambalan** (patch/overlay) di atas objek template, bukan pengeditan langsung. Objek efektif = dasar template + tambalan pelanggan.
- Pembaruan template: hitung diff antara versi lama dan baru. Tiga hasil per objek: (a) tak ada tambalan: otomatis diperbarui; (b) tambalan tidak bertabrakan: gabung otomatis; (c) bertabrakan: tampil di antrean tinjauan, tidak diterapkan sampai disetujui. Ini three-way merge sederhana (versi lama, versi baru, versi pelanggan).
- Pengguna boleh "putuskan dari template" untuk satu objek (menjadi kustom penuh), dengan peringatan bahwa objek itu tak lagi menerima pembaruan.
- Template diuji di CI: pasang ke perusahaan kosong, jalankan skenario, pasang pembaruan ke perusahaan yang punya tambalan contoh. Ini mencegah masalah upgrade yang menimpa banyak instalasi Odoo dan ERPNext, tempat kustomisasi tak terlacak menumpuk [S: ecosire; ⚠ Odoo].
- Template kontribusi pihak ketiga (marketplace) ditunda; butuh tinjauan keamanan sendiri.

---

## 4. Multi-tenant dan multi-entitas

### 4.1 Model

```
perusahaan(id, nama, ...)                    -- tenant (batas isolasi data)
entitas_hukum(id, perusahaan_id, nama, npwp, mata_uang_dasar, ...)
unit(id, perusahaan_id, entitas_id, induk_id, jenis, nama, path ltree)  -- cabang, departemen
pengguna_anggota(pengguna_id, perusahaan_id, status)
peran(id, perusahaan_id, nama, izin text[])
anggota_peran(pengguna_id, perusahaan_id, peran_id, cakupan_unit_id null)
atribut_pengguna(pengguna_id, perusahaan_id, kunci, nilai)   -- batas nilai, dll
```

- **Satu pengguna di banyak perusahaan**: identitas di `auth.users`, keanggotaan di tabel terpisah. Perusahaan aktif dipilih per sesi dan masuk ke klaim JWT (`app_metadata.perusahaan_aktif` lewat hook Auth Supabase) atau dikirim sebagai parameter dan diverifikasi terhadap keanggotaan. Jangan percaya klaim yang bisa diedit pengguna (`user_metadata`); pakai `app_metadata` ⚠ (cek dokumen Supabase).
- **Banyak entitas hukum**: tabel ledger punya `entitas_hukum_id`. Satu perusahaan (tenant) bisa punya beberapa buku. Cabang adalah `unit` di bawah entitas hukum atau dimensi analitik, bergantung pada apakah cabang berdiri sendiri secara hukum/pajak. Ini keputusan domain yang harus dijawab R-domain akuntansi; ⚠ belum bersumber di sini.
- **Konsolidasi**: laporan konsolidasi adalah **kueri baca** di atas beberapa entitas hukum dalam satu perusahaan, ditambah tabel eliminasi antar-perusahaan (intercompany) dan kurs. Jangan menyimpan hasil konsolidasi sebagai data utama; hitung dan cache per periode. Penutupan periode mengunci jurnal.
- **Antar-perusahaan (tenant berbeda)**: jangan campur isolasi; transaksi antar tenant lewat dokumen yang dikirim, bukan join.

### 4.2 Pola RLS yang tetap cepat

Prinsip dari panduan Supabase [S]: bungkus fungsi JWT dalam `(select ...)` agar menjadi initPlan yang di-cache, dan beri index pada kolom yang dipakai kebijakan; peningkatan lebih dari 100x dilaporkan pada tabel jutaan baris (⚠ hasil dari dokumen Supabase untuk kasus tertentu; ukur sendiri).

**Pola A: keanggotaan sebagai himpunan perusahaan (dasar).**

```sql
-- Fungsi stabil, SECURITY DEFINER, mengembalikan himpunan perusahaan milik pengguna.
create function app.perusahaan_saya() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select perusahaan_id from public.pengguna_anggota
  where pengguna_id = (select auth.uid()) and status = 'aktif'
$$;

create policy baca on public.record for select to authenticated
using ( perusahaan_id in (select app.perusahaan_saya()) );
-- index: (perusahaan_id, entity_type_id, ...) pada record
```

Fungsi tidak mengambil kolom baris sebagai argumen, jadi planner dapat menjalankannya sekali per kueri. Bila fungsi mengambil nilai baris, panduan Supabase memperingatkan agar diuji performanya karena tak bisa di-cache [S].

**Pola B: perusahaan aktif dari JWT (paling cepat).**

```sql
using ( perusahaan_id = ((select auth.jwt()) -> 'app_metadata' ->> 'perusahaan_aktif')::uuid
        and exists (select 1 from ... keanggotaan ... ) )  -- pemeriksaan ringan ulang
```

Cepat karena satu nilai konstan per kueri. Risiko: klaim basi setelah keanggotaan dicabut sampai token diperbarui. Mitigasi: umur token pendek dan pemeriksaan `exists` pada keanggotaan (diindeks) untuk operasi tulis.

**Pola C: atribut (cabang, departemen, batas nilai).**

Peran memberi aksi (baca/tulis/setujui); atribut membatasi **cakupan**. Simpan cakupan sebagai himpunan unit dan hitung sekali:

```sql
create function app.unit_boleh(p_perusahaan uuid) returns uuid[]
language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(u.id), '{}')
  from public.anggota_peran ap
  join public.unit u on u.perusahaan_id = ap.perusahaan_id
   and ( ap.cakupan_unit_id is null
         or u.path <@ (select path from public.unit where id = ap.cakupan_unit_id) )
  where ap.pengguna_id = (select auth.uid()) and ap.perusahaan_id = p_perusahaan
$$;

using ( perusahaan_id in (select app.perusahaan_saya())
        and unit_id = any ((select app.unit_boleh(perusahaan_id)))  )
```

Catatan: argumen `perusahaan_id` berasal dari baris, jadi fungsi tidak bisa di-cache sebagai initPlan. Alternatif: gunakan perusahaan aktif dari JWT sebagai konstanta, sehingga `app.unit_boleh((select app.perusahaan_aktif()))` menjadi initPlan sekali jalan. Hirarki unit memakai `ltree` dengan index GiST, atau tabel penutup (closure table) bila kedalaman perlu dikueri murah. Mana yang lebih cepat harus diukur (E2).

**Pola D: batas nilai transaksi.** Jangan diletakkan di RLS baca. Batas nilai berlaku pada **aksi** (menyetujui, memposting). Taruh di fungsi transisi/posting: `if nilai > (select batas from atribut ...) then raise ...`. RLS membatasi siapa melihat; fungsi kaku membatasi siapa boleh melakukan. Ini juga menjaga kebijakan RLS sederhana dan cepat.

**Pola E: izin per bidang.** Gunakan view `security_invoker = true` yang menyembunyikan bidang sensitif, atau tabel anak untuk bidang sensitif dengan kebijakan sendiri. Memfilter kunci JSONB di RLS tidak bisa; RLS bekerja per baris.

**Izin berbasis atribut dan relasi (OPA, Cedar, Zanzibar/OpenFGA).** Mesin eksternal memberi ekspresivitas (relasi bertingkat, izin per dokumen) tetapi tidak dapat difilter langsung oleh Postgres: daftar boleh-lihat harus dihitung di luar lalu dimasukkan ke SQL, yang sulit untuk daftar besar dan paginasi ⚠ (masalah "list filtering" yang diakui di dokumentasi Zanzibar-style; cek OpenFGA `ListObjects`). Untuk tahap awal, model peran + cakupan unit + atribut sederhana dalam Postgres cukup dan bisa dibuktikan dengan pgTAP. Pertimbangkan OpenFGA hanya bila muncul kebutuhan berbagi per dokumen yang rumit.

**Aturan keselamatan yang tegas:**
- Semua tabel tenant punya `perusahaan_id not null` dan RLS aktif (`force row level security` untuk pemilik tabel). Uji pgTAP otomatis yang memindai katalog: tabel di skema publik tanpa RLS atau tanpa kolom `perusahaan_id` membuat CI gagal.
- Kebijakan `with check` pada insert/update, bukan hanya `using`, agar pengguna tak memindahkan baris ke perusahaan lain.
- Fungsi `SECURITY DEFINER` hanya di skema non-terekspos, `search_path` dikunci, dan dicek `get_advisors` (sesuai aturan proyek).
- View memakai `security_invoker`, kalau tidak akan melewati RLS.

### 4.3 Sorotan performa RLS untuk skema dinamis

- Satu tabel `record` untuk semua tenant berarti index selalu diawali `perusahaan_id`. Partisi hash menurut `perusahaan_id` memotong ukuran index per partisi tetapi memperumit RLS dan migrasi; hanya bila ukuran menuntut (E1).
- Kebijakan dengan banyak `OR` dan subquery per baris adalah sumber kelambatan umum ⚠. Hindari kebijakan terpisah per peran yang digabung OR; satu kebijakan dengan satu himpunan cakupan lebih mudah dioptimalkan.
- Pencarian teks: `tsvector` bergenerasi + GIN per tabel inti; untuk bidang kustom, bangun satu kolom `cari tsvector` yang diisi oleh trigger dari bidang bertanda "dapat dicari". Pencarian semantik/fuzzy lewat `pg_trgm`. Mesin terpisah (Typesense/Meilisearch) menambah masalah sinkron dan izin; tunda sampai terukur tak cukup.

### 4.4 Offline-first

PowerSync dan ElectricSQL menyinkronkan subset Postgres ke klien. Aturan sinkronisasi (bucket/shape) adalah **mesin izin kedua** di luar RLS; harus dijaga selaras ⚠ (pemahaman umum, belum dibaca ulang dokumentasinya sesi ini). Dengan skema JSONB dinamis, sinkronisasi per bentuk jadi lebih rumit. Rekomendasi: tunda offline-first ke fase lapangan (aplikasi mobile, gudang) dan tetapkan dulu apakah hanya modul tertentu (stok keliling, absensi) yang butuh. Tabel ledger tidak disinkron dua arah; klien membuat "draf" yang diposting server.

---

## 5. Jebakan platform serba bisa

| Jebakan | Gejala | Pengurangan |
|---|---|---|
| Inner-platform effect | Kita membangun bahasa, database, dan IDE kedua yang lebih buruk dari aslinya | Daftar kemampuan tertutup. Setiap permintaan kustomisasi diklasifikasi: konfigurasi, ekstensi kode terisolasi, atau tidak didukung. Sediakan jalur keluar: ekspor SQL/API ke alat lain, bukan menambah fitur ke bahasa formula tanpa batas. |
| Kustomisasi tak terpelihara | Upgrade menakutkan; hanya satu konsultan yang paham | Semua perubahan konfigurasi berversi dengan penulis, alasan, diff. Overlay, bukan edit langsung (3.10). Laporan "kustomisasi yang tak dipakai 90 hari". Hal ini sesuai peringatan umum tentang ERPNext/Odoo tempat tweak tak terlacak menumpuk [S: ecosire; ⚠ Odoo]. |
| Laporan lambat | Pengguna membuat laporan dengan lima join dan filter JSONB | Penerjemah laporan dengan batas lompatan, `statement_timeout`, antrean, cache, view terwujud untuk entitas panas, read model terpisah (3.9). |
| Limit tak jelas | Tenant menabrak batas tanpa peringatan | Batas eksplisit dan terlihat: bidang per entitas, entitas per perusahaan, aturan aktif, index kustom, ukuran dokumen JSONB, baris per tabel. Salesforce menerbitkan batas per edisi [S], dan itu bagian dari kontrak produk mereka. Jadikan halaman "penggunaan dan batas" di aplikasi. |
| Sulit di-debug | Perilaku ada di data, bukan kode | Log eksekusi alur dan aturan yang bisa dibaca pengguna; mode "jelaskan" untuk formula; `automation_run` dan `transition_log`; ID korelasi di setiap permintaan; ekspor konfigurasi sebagai berkas teks yang bisa di-diff. |
| Tetangga berisik | Satu tenant memonopoli sumber daya | Kuota per tenant, `statement_timeout`, antrean pekerjaan dengan keadilan, batas laju API. Salesforce memakai governor limit karena alasan ini [S]. |
| Keamanan lewat konfigurasi | Pengguna menulis ekspresi atau webhook berbahaya | Ekspresi di sandbox tanpa efek samping, tanpa akses jaringan; webhook keluar lewat daftar izin (SSRF); tanpa kode bebas di tahap awal. |
| Migrasi data pelanggan jadi proyek tak berujung | Setiap pelanggan berbeda | Pemetaan impor berversi, pratinjau, impor idempoten, alat rekonsiliasi saldo awal. |
| Drift antara tipe TypeScript dan data dinamis | Bug runtime yang lolos typecheck | Validator dibangkitkan dari metadata di batas (API, form), tipe statis hanya untuk inti. Uji properti pada definisi acak. |
| Lock-in ke alat low-code | Retool/Appsmith/Budibase cepat memulai, tetapi izin dan logika tersebar di UI mereka | Untuk alat internal tim mungkin cocok; untuk produk multi-tenant inti, logika dan izin harus di database dan API kita. |

Satu aturan pembeda: tambahkan kemampuan baru ke metadata hanya bila (1) dipakai oleh lebih dari satu template industri atau pelanggan nyata, dan (2) bisa diuji otomatis. Selain itu, tulis sebagai kode di aplikasi.

---

## 6. Rekomendasi tumpukan untuk proyek ini

### 6.1 Rekomendasi

1. **Postgres sebagai satu-satunya penyimpanan utama.** Skema inti kaku (ledger, stok, pajak, izin, audit), skema `config` untuk metadata, skema `data` untuk `record` JSONB. Alasan: tim sudah memakai Supabase, RLS, dan pgTAP; memecah ke banyak penyimpan menambah masalah izin.
2. **JSONB per entitas + definisi bidang sebagai data**, tanpa DDL per tenant dan tanpa EAV utama. Promosi bidang panas ke kolom lewat migrasi tim.
3. **Ledger double-entry di Postgres** dengan tabel `jurnal` dan `baris_jurnal`: hanya INSERT (cabut UPDATE/DELETE dari semua peran aplikasi), trigger penegak keseimbangan per transaksi (constraint trigger tertunda saat commit), `numeric` untuk jumlah, kolom mata uang, `entitas_hukum_id`, periode terkunci, entri pembalik untuk koreksi, kunci idempotensi per posting. TigerBeetle bukan pilihan awal: ia layanan terpisah dengan model hanya akun dan transfer, ditujukan ke volume yang jauh di atas kebutuhan ERP biasa [S], dan menambah satu sistem untuk dioperasikan di luar Supabase. Tinjau lagi bila ada beban transaksi tinggi (E5). Pola Modern Treasury/Stripe (ledger tak terubah, entri berpasangan, versi, idempotensi) ⚠ cukup ditiru sebagai prinsip; dokumentasinya tidak dibaca ulang sesi ini.
4. **Audit**: tabel `audit_log` append-only, diisi trigger generik (peran, perubahan sebelum dan sesudah, ID permintaan), dipartisi menurut waktu. Bukan event sourcing penuh. Event sourcing menambah kompleksitas proyeksi dan perubahan skema event; hanya ledger (yang secara alami append-only) dan transition_log yang berperilaku seperti log kejadian ⚠.
5. **RLS pola A+B (dan C untuk cakupan unit)**, batas nilai di fungsi aksi, uji pgTAP pemindai katalog di CI, `get_advisors` tiap migrasi.
6. **Formula/ekspresi**: satu mesin ekspresi tertutup yang sama untuk formula, kondisi alur, kondisi aturan, dan filter tampilan. Pilih antara CEL dan JSONLogic setelah spike (E6). Hindari eval kode JS.
7. **Pekerjaan latar**: `pg_cron` + outbox + `pgmq` (bila tersedia di Supabase ⚠ cek `list_extensions`) + Edge Function. Tunda Temporal/Camunda.
8. **Laporan**: pembangun laporan internal atas penerjemah SQL terkontrol + view terwujud untuk entitas panas. Laporan keuangan baku ditulis sebagai SQL. Cube hanya bila lapisan semantik terbukti perlu.
9. **Pencarian**: `tsvector` + `pg_trgm` di Postgres dahulu.
10. **Aplikasi**: Next.js 16 Server Components dan server actions memanggil Supabase dengan token pengguna (tanpa service-role). Satu penerjemah metadata di server membangun form dan daftar; komponen UI dikontrol registri tipe bidang.
11. **Template industri** sebagai paket JSON berversi di repositori (diuji di CI), dipasang lewat fungsi yang menulis objek konfigurasi dengan lapisan overlay (3.10).
12. **Offline-first** ditunda; rancang agar posting ledger selalu server-side.

### 6.2 Yang harus dibuktikan sebelum dikunci (spike/uji beban)

Setiap eksperimen: tulis skrip dapat diulang, simpan hasil mentah dan versi Postgres (`select version()`), jalankan di proyek Supabase dengan ukuran instance yang akan dipakai sungguhan, dan catat apakah RLS aktif (peran `authenticated`, bukan `postgres`).

| ID | Pertanyaan | Cara ukur | Ambang keputusan (usulan, ubah bila perlu) |
|---|---|---|---|
| E1 | Berapa selisih biaya JSONB+GIN vs kolom biasa vs EAV untuk daftar terfilter dan penulisan? | Tabel `record` 1 juta dan 10 juta baris, 200 tenant dengan distribusi miring (satu tenant 30%), 20 bidang kustom per entitas. Ukur p50/p95 untuk: daftar 50 baris dengan 2 filter, hitung total, urut menurut bidang kustom, insert, update satu bidang. Bandingkan: tanpa index, GIN `jsonb_ops`, GIN `jsonb_path_ops`, index ekspresi parsial, kolom biasa, EAV. Ukur juga ukuran index dan laju tulis dengan GIN. | p95 daftar di bawah 200 ms pada 1 juta baris/tenant terbesar; penalti tulis GIN dapat diterima. |
| E2 | Apakah RLS pola A, B, C tetap cepat dengan hirarki unit? | Tiga bentuk kebijakan di tabel dari E1 dengan 1.000 pengguna, 50 unit per tenant, kedalaman hirarki 4. `EXPLAIN (ANALYZE, BUFFERS)` dengan peran `authenticated` dan JWT sungguhan. Bandingkan `ltree` GiST vs closure table vs array cakupan. Cek bahwa fungsi menjadi initPlan. | Overhead RLS kurang dari 20% dibanding kueri tanpa RLS pada daftar terfilter; tak ada seq scan pada tabel besar. |
| E3 | Laporan atas bidang kustom: view terwujud vs kueri langsung vs read model | 10 laporan representatif (agregasi per bulan, per cabang, per bidang kustom) pada data E1. Ukur waktu kueri langsung, view terwujud (waktu refresh dan keterlambatan), read model dari outbox. | Laporan interaktif di bawah 3 detik p95; refresh view tidak memblokir. |
| E4 | Batas DDL per tenant (hanya bila masih dipertimbangkan) | Buat 1.000, 10.000, 50.000 tabel kecil; ukur waktu `CREATE TABLE`, `pg_dump`, `\d`, memori koneksi, perilaku PostgREST saat reload cache, waktu migrasi massal. | Hanya untuk memutuskan menolak atau menerima jalur tabel-per-tenant tier enterprise. |
| E5 | Ledger di Postgres: throughput dan konsistensi | Skrip posting jurnal dua sampai sepuluh baris, N koneksi paralel, 1 sampai 100 akun panas (kontensi), constraint trigger keseimbangan aktif, saldo dihitung via agregasi vs tabel saldo berkas. Uji invarian setelah beban: total debit = total kredit, tak ada jurnal tak seimbang, idempotensi saat percobaan ulang. | Tentukan transaksi per detik yang tercapai dan bandingkan dengan beban target perusahaan terbesar yang direncanakan; bila jauh di atas, baru tinjau TigerBeetle. |
| E6 | Mesin ekspresi | Implementasikan 30 formula/kondisi nyata (pajak sederhana, diskon bertingkat, batas persetujuan) di CEL, JSONLogic, subset sendiri. Ukur waktu evaluasi 10.000 rekaman, ukuran bundle, kemudahan pesan galat, uji fuzz untuk loop/eksplosi memori, tinjau CVE. | Pilih yang lolos fuzz dan mudah dijelaskan ke pengguna non-teknis. |
| E7 | Migrasi template dan overlay | 5 tenant dengan kustomisasi acak di atas template v1; pasang v2. Hitung persentase otomatis, bentrok, dan pelanggaran data. Uji rollback rilis. | Nol kehilangan data; bentrok masuk antrean tinjauan, bukan menimpa. |
| E8 | Alur dan aturan di bawah beban | 100 aturan aktif per tenant, 50 tenant, 100 event/detik gabungan. Ukur keterlambatan outbox ke eksekusi, duplikasi, perilaku setelah restart pekerja. | Keterlambatan p95 dalam batas yang disepakati; nol duplikasi efek berkat idempotensi. |
| E9 | Isolasi tenant | Uji pgTAP untuk setiap tabel: pengguna tenant A tak bisa select/insert/update/delete data tenant B, termasuk lewat view, fungsi, dan RPC. Uji dengan peran dan token nyata. | Nol pelanggaran; CI memblokir bila ada tabel tanpa RLS. |
| E10 | Pencarian | Pencarian `tsvector` + `pg_trgm` pada 1 juta rekaman dengan RLS. | Jika p95 melewati batas, evaluasi mesin pencarian terpisah dengan pemfilteran izin. |
| E11 | Biaya penulisan JSONB besar | Dokumen `custom` 0,5 KB, 2 KB, 8 KB, 32 KB: waktu update satu kunci, ukuran tabel dan WAL, efek TOAST. | Tetapkan batas ukuran `custom` per entitas. |

Hasil yang sudah ada di sumber luar tidak menggantikan E1, E2, E5: angka tepat sangat tergantung bentuk data dan ukuran instance, dan tidak ada angka lintas-proyek yang jujur untuk dikutip.

### 6.3 Urutan pengerjaan yang disarankan

1. E9 dan kerangka multi-tenant (perusahaan, keanggotaan, RLS A/B) dengan pemindai CI.
2. Ledger kaku dan E5.
3. `entity_type`/`field_def`/`record`, penerjemah filter, E1, E2.
4. Tampilan dan formulir dari metadata.
5. Alur kerja dan aturan (outbox), E8.
6. Laporan, E3.
7. Template dan overlay, E7.
8. Sandbox/rilis konfigurasi.

---

## 7. Daftar sumber

[S] = muncul di hasil pencarian sesi ini (isi ringkas dilihat dari hasil pencarian, halaman tidak dibuka penuh). Tanpa [S] = pengetahuan penulis, belum dibuka ulang; klaim darinya ditandai ⚠ di teks.

Frappe / ERPNext
- [S] https://ecosire.com/blog/erpnext-customization-frappe-framework (blog pihak ketiga, bukan dokumentasi resmi; ⚠ kualitas sedang)
- https://docs.frappe.io/framework (DocType, Customize Form, Workflow) ⚠ belum dibuka

Odoo
- https://www.odoo.com/documentation/ (ORM, ir.model, Studio, upgrade) ⚠ belum dibuka

Salesforce
- [S] https://resources.docs.salesforce.com/254/latest/en-us/sfdc/pdf/salesforce_app_limits_cheatsheet.pdf (limit per edisi; angka 200/2.000 custom object dan 26 master-detail berasal dari ringkasan hasil pencarian, cek ke PDF sebelum dipakai ⚠)
- [S] https://developer.salesforce.com/docs/atlas.en-us.262.0.api_rest.meta/api/resources_limits.htm

Postgres JSONB / TOAST / GIN
- [S] https://www.snowflake.com/en/engineering-blog/postgres-jsonb-columns-and-toast
- [S] https://pulse.support/kb/postgresql-jsonb-performance (blog; ⚠)
- [S] https://dev.to/franckpachot/postgresql-jsonb-size-limits-to-prevent-toast-slicing-9e8 (⚠ blog)
- https://www.postgresql.org/docs/current/datatype-json.html (jsonb_ops dan jsonb_path_ops) ⚠ belum dibuka
- https://www.postgresql.org/docs/current/storage-toast.html ⚠ belum dibuka

Supabase RLS
- [S] https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv
- [S] https://github.com/orgs/supabase/discussions/14576
- [S] https://makerkit.dev/blog/tutorials/supabase-rls-best-practices (⚠ blog)
- https://supabase.com/docs/guides/database/postgres/row-level-security ⚠ belum dibuka
- https://supabase.com/docs/guides/auth/auth-hooks ⚠ belum dibuka (hook klaim JWT)

Ledger
- [S] https://docs.tigerbeetle.com/coding/data-modeling/
- [S] https://docs.tigerbeetle.com/coding/system-architecture/
- [S] https://tigerbeetle.com/blog/2023-01-30-series-seed-announcement/
- [S] https://dev.to/aivarsk/ledgers-are-simple-stop-spreading-fud-4ia9 (⚠ opini; berguna sebagai pandangan tandingan bahwa ledger di SQL cukup)
- https://docs.moderntreasury.com/ledgers/docs/ledgers-quickstart ⚠ belum dibuka
- https://stripe.com/blog/ledger ⚠ belum dibuka

Izin, ekspresi, alur, laporan, offline (semuanya belum dibuka, tandai ⚠ pada klaim)
- https://www.openpolicyagent.org/docs
- https://www.cedarpolicy.com/
- https://openfga.dev/docs
- https://cel.dev/
- https://jsonlogic.com/
- https://hyperformula.handsontable.com/
- https://docs.temporal.io/
- https://docs.camunda.io/
- https://docs.n8n.io/
- https://cube.dev/docs
- https://www.metabase.com/docs/latest/
- https://hasura.io/docs
- https://docs.directus.io/
- https://docs.baserow.io/ dan https://docs.nocodb.com/
- https://docs.powersync.com/ dan https://electric-sql.com/docs

### Ringkasan klaim lemah

- Angka limit Salesforce: dari ringkasan pencarian, bukan dibaca di PDF.
- Hampir semua klaim tentang Odoo, Baserow/NocoDB, Hasura, Directus, Cedar/OPA/OpenFGA, PowerSync/Electric: dari pengetahuan umum, perlu verifikasi.
- Tidak ada angka performa Postgres lintas-proyek yang dikutip. Semua ambang di bagian 6.2 adalah usulan keputusan, bukan fakta.
- "Magento memakai EAV dan punya masalah performa": pengetahuan umum, tidak diperiksa.
- Ketersediaan `pg_jsonschema`, `pgmq`, `pg_cron`, `ltree` di proyek `qxxicvqncftuktblezud`: cek `list_extensions` sebelum bergantung.
