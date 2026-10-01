# Rancangan Model Data Sekolah Fleksibel untuk EduSmart

Berdasarkan [R1](../research/R1-school-domain.md). Status: **draf untuk ditinjau**, belum ada kode.

## Prinsip
1. **Data, bukan enum.** Jenjang, kurikulum, kelompok mapel, dan penilaian adalah baris data yang bisa ditambah tanpa mengubah kode.
2. **Paket kurikulum (Curriculum Pack) yang berversi.** Sekolah memilih paket (mis. Kurikulum Merdeka, K13, Madrasah KMA, Cambridge, Kustom), lalu bisa menimpa sebagian.
3. **Satu graf kompetensi** sebagai jangkar untuk skill tree, kuis, AI, dan visualisasi, apa pun kurikulumnya.
4. **Istilah selaras Dapodik** (satuan pendidikan, rombongan belajar, pembelajaran) agar impor data nyata mudah.
5. **Kompatibel mundur.** Field lama tetap dibaca; migrasi bertahap.

## Entitas

```
EducationUnit (satuan pendidikan)
  npsn?, name, authority: KEMENDIKDASMEN | KEMENAG | LAINNYA
  ownership: NEGERI | SWASTA
  programs: [Program]            # satu satuan bisa banyak program (mis. pesantren + madrasah + PKBM)
  curriculumPackId, overrides{}

Program (jenjang/bentuk)
  formCode  -> tabel EducationForm (SD, MI, SMP, MTs, SMA, MA, SMK, MAK, SLB-*, PAKET_A/B/C, TK, KB, KUSTOM...)
  grades: [..], phases: [..]

EducationForm (tabel referensi, bisa ditambah)
  code, name, defaultAuthority, defaultGrades

CurriculumPack (berversi, mis. "kurmer-2022", "k13", "kma-2019-agama", "cambridge-igcse", "kustom")
  gradeToPhase{}                 # Merdeka: A–F; paket lain: mapping sendiri
  subjectGroups[]                # Umum, Kejuruan, Agama, Pilihan, Muatan Lokal, P5, Ekskul (bisa diatur)
  assessmentScheme               # lihat di bawah
  reportTemplateId

SubjectDefinition (katalog global)    SchoolSubject (instance per sekolah)
  code, name, group, packId             subjectDefinitionId?, hoursPerWeek|blockHours,
  recommendedModules[]                  overrides{}, enabledModules[]

CompetencyNode (graf kompetensi)
  framework: CP | TP | KI_KD | SILABUS_CUSTOM
  parents[], subjectDefinitionId, phase, text
  # skill tree, kuis, AI, dan visualisasi menempel di sini

Track (peminatan/keahlian; hierarki)
  type: PEMINATAN | SMK_BIDANG | SMK_PROGRAM | SMK_KONSENTRASI | PROGRAM_PESANTREN
  parentId?, code, name           # menggantikan smkMajors / smaSpecializations

AcademicCalendar
  termModel: SEMESTER | TRIMESTER | BLOK | KUSTOM, terms[], holidays[]

ClassGroup (rombongan belajar)
  grade, trackId?, homeroomTeacherId, studentIds[]

Assignment (pembelajaran: guru x mapel x rombel x jam)

AssessmentScheme (di pack)
  type: KKM | TUJUAN_PEMBELAJARAN | SKALA_NILAI | INDIVIDUAL_PLAN
  scale, rules, report fields

Role (konfigurable per sekolah)
  owner, wakasek-kurikulum, wali-kelas, guru-mapel, BK, orang-tua, siswa, admin
  # permission = daftar kemampuan

IndividualLearningPlan (PPI, untuk SLB/inklusif)
  studentId, goals[], accommodations[], reviewDate

P5Project / ProjectBasedUnit (opsional per pack)

VisualModule (registry modul visual)
  id, type: MATH_GRAPH | GEOMETRY | CODE_RUNNER | SCIENCE_SIM ..., tags[]
  # dipasang ke SubjectDefinition / CompetencyNode, dipilih sekolah
```

## Pemetaan dari model sekarang

| Sekarang | Menjadi |
|---|---|
| `School.schoolTypes/schoolType` | `EducationUnit.programs[].formCode`; field lama dibiarkan dan diisi otomatis |
| `smaSpecializations` | `Track(type=PEMINATAN)`, boleh kosong (Merdeka tanpa penjurusan) |
| `smkMajors[]` | `Track` hierarki (bidang → program → konsentrasi) |
| `Subject.category` (WAJIB/PEMINATAN/...) | `subjectGroups` di `CurriculumPack`; migrasi lewat skrip yang sudah ada (`migrateSubjects.ts`) sebagai dasar |
| `SkillTreeNode` | tetap, tetapi diberi referensi `competencyNodeId` |
| Penilaian XP/skor | tetap untuk gamifikasi; ditambah `AssessmentScheme` untuk rapor |

## Alur penyiapan sekolah (wizard)
1. Pilih bentuk satuan pendidikan (dengan preset), bisa lebih dari satu program.
2. Pilih paket kurikulum per program, atau mulai dari kosong.
3. Pilih mata pelajaran dan kelompoknya dari katalog; tambahkan mapel kustom.
4. Atur peminatan/program keahlian dan kalender akademik.
5. Aktifkan modul visual yang relevan per mapel.
6. Impor guru, siswa, dan rombel (CSV, format mendekati Dapodik).

## Keputusan teknis
- **Tetap MongoDB + Mongoose.** Skema dokumen cocok untuk konfigurasi yang bervariasi; validasi per pack lewat Zod. Tidak perlu pindah ke Supabase untuk ini.
- Paket kurikulum disimpan sebagai dokumen berversi (`packId@versi`), sehingga perubahan kebijakan (mis. penjurusan SMA) hanya menambah versi baru.
- API baru: `/education-forms`, `/curriculum-packs`, `/competencies`, `/tracks`; endpoint lama dibungkus.

## Tahapan dan kriteria selesai
1. **M1 (fondasi):** entitas `EducationForm`, `CurriculumPack`, `Track` + migrasi non-destruktif; sekolah yang ada tetap berfungsi. *Selesai bila:* seluruh tes backend lama lulus dan satu sekolah SMK dan satu madrasah contoh bisa dibuat lewat data.
2. **M2 (wizard):** onboarding sekolah memakai preset. *Selesai bila:* pembuatan sekolah baru tanpa menyentuh kode.
3. **M3 (graf kompetensi):** `CompetencyNode` dengan data awal Matematika Fase E sebagai contoh; skill tree menempel.
4. **M4:** modul visual dan AI memakai graf kompetensi.

## Risiko
- 502 referensi enum lama: lakukan refactor bertahap dengan lapisan kompatibilitas, jangan sekaligus.
- Data kurikulum resmi besar dan berubah: mulai dari satu paket dan satu mapel, tambah bertahap, beri penanda sumber dan versi.
- Klaim kebijakan yang masih ⚠ harus diverifikasi sebelum jadi preset.
- Data siswa adalah data anak: jangan pernah menaruh data nyata di repo atau fixture (lihat temuan keamanan di EduSmart).
