-- Seed demo (data sintetis): Matematika Fase E, unit "Fungsi Kuadrat" untuk SMK Nusantara Contoh.
-- Konten ini contoh buatan, bukan salinan buku resmi.
do $$
declare
  v_school uuid; v_subj uuid;
  n1 uuid; n2 uuid; n3 uuid; n4 uuid; n5 uuid;
begin
  select id into v_school from public.schools where name = 'SMK Nusantara Contoh';
  select id into v_subj from public.school_subjects where school_id = v_school and code = 'MAT';
  if v_school is null or v_subj is null then raise exception 'sekolah demo tidak ditemukan'; end if;
  if exists (select 1 from public.competency_nodes where school_id = v_school and subject_id = v_subj) then return; end if;

  insert into public.competency_nodes (school_id, subject_id, grade, code, title, summary, kind, position, xp_reward, estimated_minutes)
  values (v_school, v_subj, 10, 'FK-1', 'Bentuk umum fungsi kuadrat', 'Mengenali y = ax² + bx + c dan arti koefisiennya.', 'materi', 1, 50, 10) returning id into n1;
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, summary, kind, position, xp_reward, estimated_minutes)
  values (v_school, v_subj, 10, 'FK-2', 'Grafik dan titik puncak', 'Arah buka parabola dan letak puncaknya.', 'materi', 2, 60, 12) returning id into n2;
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, summary, kind, position, xp_reward, estimated_minutes)
  values (v_school, v_subj, 10, 'FK-3', 'Akar-akar dan diskriminan', 'Titik potong dengan sumbu x.', 'materi', 3, 70, 15) returning id into n3;
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, summary, kind, position, xp_reward, estimated_minutes)
  values (v_school, v_subj, 10, 'FK-4', 'Sumbu simetri dan titik balik', 'Mencari x = −b/2a dan nilai puncaknya.', 'materi', 4, 70, 15) returning id into n4;
  insert into public.competency_nodes (school_id, subject_id, grade, code, title, summary, kind, position, xp_reward, estimated_minutes)
  values (v_school, v_subj, 10, 'FK-5', 'Checkpoint fungsi kuadrat', 'Gabungan akar, puncak, dan sumbu simetri.', 'checkpoint', 5, 120, 12) returning id into n5;

  insert into public.competency_prerequisites (school_id, node_id, requires_id) values
    (v_school, n2, n1), (v_school, n3, n2), (v_school, n4, n2), (v_school, n5, n3), (v_school, n5, n4);

  insert into public.lessons (node_id, school_id, objectives, visual_module, body_md) values
  (n1, v_school, array['Menyebut bentuk umum fungsi kuadrat','Menunjuk nilai a, b, dan c'], 'parabola',
$md$## Apa itu fungsi kuadrat?
Fungsi kuadrat adalah fungsi yang pangkat tertinggi variabelnya **dua**. Bentuk umumnya:

`y = ax² + bx + c`  dengan  `a ≠ 0`

- **a** mengatur arah dan lebar lengkungan.
- **b** ikut menentukan letak puncak.
- **c** adalah titik potong dengan sumbu y.

## Kenapa a tidak boleh nol?
Kalau a = 0, suku x² hilang dan yang tersisa `y = bx + c`: garis lurus, bukan parabola.

## Coba sendiri
Geser a, b, dan c pada grafik di bawah. Perhatikan bentuk apa yang muncul saat a mendekati nol.$md$),
  (n2, v_school, array['Menentukan arah buka parabola dari tanda a','Menemukan letak titik puncak'], 'parabola',
$md$## Arah buka
- Jika **a > 0**, parabola membuka **ke atas** dan puncaknya adalah titik terendah.
- Jika **a < 0**, parabola membuka **ke bawah** dan puncaknya adalah titik tertinggi.

## Titik puncak
Koordinat x puncak: `x = −b / 2a`. Masukkan nilai itu ke fungsi untuk mendapat y.

Contoh: `y = x² − 4x + 3` → x = 4/2 = **2**, y = 4 − 8 + 3 = **−1**.$md$),
  (n3, v_school, array['Mencari akar dengan pemfaktoran','Membaca diskriminan D = b² − 4ac'], 'parabola',
$md$## Akar-akar
Akar adalah nilai x yang membuat y = 0, yaitu titik potong grafik dengan sumbu x.

Contoh: `x² − 5x + 6 = 0` → `(x − 2)(x − 3) = 0` → x = **2** atau x = **3**.

## Diskriminan
`D = b² − 4ac`
- D > 0: dua titik potong.
- D = 0: menyinggung sumbu x di satu titik.
- D < 0: tidak memotong sumbu x.$md$),
  (n4, v_school, array['Menghitung sumbu simetri','Menghitung nilai y di titik balik'], 'parabola',
$md$## Sumbu simetri
Parabola simetris terhadap garis tegak `x = −b / 2a`. Titik puncak selalu berada di garis ini.

## Contoh
`y = x² − 6x + 5`
1. x puncak = 6 / 2 = **3**
2. y puncak = 9 − 18 + 5 = **−4**
3. Titik balik: **(3, −4)**$md$),
  (n5, v_school, array['Menggabungkan akar, puncak, dan sumbu simetri'], null,
$md$## Checkpoint
Soal di sini menggabungkan semuanya. Ingat urutan kerja: cari **akar**, cari **sumbu simetri**, lalu hitung **puncak**.

Tips: sumbu simetri selalu tepat di tengah dua akar.$md$);

  -- Soal + kunci. options berupa array teks; jawaban mcq = indeks (angka); isian = daftar jawaban yang diterima.
  with q as (
    insert into public.quiz_questions (school_id, node_id, kind, prompt, options, difficulty, position) values
    (v_school,n1,'mcq','Manakah yang merupakan fungsi kuadrat?','["y = 2x + 3","y = x² − 4x + 1","y = 5","y = 1/x"]',1,1),
    (v_school,n1,'short','Pada y = 3x² − 5x + 2, berapa nilai c?','[]',1,2),
    (v_school,n1,'mcq','Mengapa a tidak boleh nol pada y = ax² + bx + c?','["Grafiknya menjadi garis lurus","Grafiknya menjadi lebih lebar","Akarnya hilang","Puncaknya pindah ke sumbu y"]',2,3),
    (v_school,n2,'mcq','Fungsi y = −2x² + 1 membuka ke arah…','["atas","bawah","kiri","kanan"]',1,1),
    (v_school,n2,'mcq','Koordinat x puncak y = x² − 4x + 3 adalah…','["2","−2","4","1"]',2,2),
    (v_school,n2,'short','Grafik y = x² + 5x − 7 memotong sumbu y di y = …','[]',2,3),
    (v_school,n3,'short','Akar positif dari x² − 9 = 0 adalah…','[]',1,1),
    (v_school,n3,'mcq','Akar-akar x² − 5x + 6 = 0 adalah…','["2 dan 3","−2 dan −3","1 dan 6","−1 dan 6"]',2,2),
    (v_school,n3,'mcq','Jika diskriminan D < 0, grafik…','["tidak memotong sumbu x","memotong sumbu x di dua titik","menyinggung sumbu x","pasti membuka ke bawah"]',2,3),
    (v_school,n4,'short','Persamaan sumbu simetri y = x² − 6x + 5 adalah x = …','[]',1,1),
    (v_school,n4,'mcq','Nilai y di puncak y = x² − 6x + 5 adalah…','["−4","4","−13","5"]',2,2),
    (v_school,n4,'mcq','Titik balik y = −x² + 4x adalah…','["(2, 4)","(−2, 4)","(2, −4)","(4, 0)"]',3,3),
    (v_school,n5,'mcq','Akar-akar y = x² − 2x − 3 adalah…','["3 dan −1","−3 dan 1","3 dan 1","−3 dan −1"]',2,1),
    (v_school,n5,'short','Nilai y di puncak y = x² − 2x − 3 adalah…','[]',2,2),
    (v_school,n5,'mcq','Parabola membuka ke bawah dengan puncak di atas sumbu x. Ia memotong sumbu x di…','["dua titik","tidak ada titik","satu titik","tak hingga titik"]',3,3),
    (v_school,n5,'mcq','Dua akar suatu parabola adalah 2 dan 8. Sumbu simetrinya…','["x = 5","x = 10","x = 6","x = 3"]',2,4)
    returning id, node_id, position
  )
  insert into public.quiz_answer_keys (question_id, school_id, answer, explanation)
  select q.id, v_school, k.answer::jsonb, k.expl from q
  join (values
    (n1,1,'1','Hanya y = x² − 4x + 1 yang pangkat tertingginya dua.'),
    (n1,2,'["2","2,0"]','c adalah suku tanpa x, yaitu +2.'),
    (n1,3,'0','Tanpa suku x², fungsi menjadi y = bx + c yang berupa garis lurus.'),
    (n2,1,'1','Koefisien a = −2 (negatif), jadi parabola membuka ke bawah.'),
    (n2,2,'0','x = −b/2a = 4/2 = 2.'),
    (n2,3,'["-7","−7"]','Titik potong sumbu y selalu bernilai c, yaitu −7.'),
    (n3,1,'["3"]','x² = 9 sehingga x = 3 atau x = −3; yang positif adalah 3.'),
    (n3,2,'0','(x − 2)(x − 3) = 0 memberi x = 2 atau x = 3.'),
    (n3,3,'0','D negatif berarti tidak ada akar real, jadi tidak ada titik potong dengan sumbu x.'),
    (n4,1,'["3","x=3","x = 3"]','x = −b/2a = 6/2 = 3.'),
    (n4,2,'0','Untuk x = 3: 9 − 18 + 5 = −4.'),
    (n4,3,'0','x = −4/(2·(−1)) = 2, y = −4 + 8 = 4, sehingga (2, 4).'),
    (n5,1,'0','(x − 3)(x + 1) = 0 memberi x = 3 atau x = −1.'),
    (n5,2,'["-4","−4"]','x puncak = 1, y = 1 − 2 − 3 = −4.'),
    (n5,3,'0','Puncak tertinggi di atas sumbu x dan grafik membuka ke bawah, sehingga memotong sumbu x di dua titik.'),
    (n5,4,'0','Sumbu simetri tepat di tengah: (2 + 8)/2 = 5.')
  ) as k(node_id, pos, answer, expl) on k.node_id = q.node_id and k.pos = q.position;
end $$;
