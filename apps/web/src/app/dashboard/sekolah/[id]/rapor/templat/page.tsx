import { ReportSheet } from "@/components/report-sheet";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select, Textarea } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { DEFAULT_REPORT_CONFIG, groupsToText, sanitizeConfig, scaleToText } from "@/lib/report-config";
import { getSchoolContext } from "@/lib/school";
import { deleteReportTemplate, proposeTemplate, saveReportTemplate, setDefaultTemplate, useBuiltIn } from "./actions";

export const metadata = { title: "Templat rapor · EduSmart" };
export const maxDuration = 120;

const Check = ({ name, label, on }: { name: string; label: string; on: boolean }) => (
  <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name={name} defaultChecked={on} className="size-4" /> {label}</label>
);

export default async function TemplatPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string; error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id, { management: true });
  await requireModule(supabase, id, "gradebook");
  const [{ data: list }, { data: samples }] = await Promise.all([
    supabase.from("report_templates").select("id,name,config,is_default,source_file_id").eq("school_id", id).order("created_at", { ascending: false }),
    supabase.from("school_files").select("id,name").eq("school_id", id).eq("category", "rapor_contoh").order("created_at", { ascending: false }),
  ]);
  const templates = list ?? [];
  const editing = templates.find((t) => t.id === sp.edit);
  const cfg = editing ? sanitizeConfig(editing.config) : DEFAULT_REPORT_CONFIG;
  const sample = {
    school: { name: "Nama Sekolah Anda", city: "Kota", province: "Provinsi" }, student: { name: "Nama Siswa Contoh", className: "X-1", nis: "2601", nisn: "0098765001" },
    termName: "Semester Ganjil", year: "2026/2027", homeroom: "Nama Wali Kelas", pass: 70,
    subjects: [
      { name: "Matematika", grade: 86.5, items: [{ title: "UH 1", pct: 92 }, { title: "UTS", pct: 66 }] }, { name: "Bahasa Indonesia", grade: 78, items: [{ title: "Tugas", pct: 78 }] },
      { name: "Dasar-dasar PPLG", grade: 94, items: [{ title: "Praktik", pct: 94 }] }, { name: "Seni Budaya", grade: 64, items: [{ title: "Proyek", pct: 64 }] },
    ],
    attendance: { hadir: 40, izin: 1, sakit: 2, alpa: 0 }, note: "Contoh catatan wali kelas.",
    extras: { sikap: { spiritual: "Baik", sosial: "Sangat baik", deskripsi: "Santun dan bertanggung jawab." }, ekskul: { items: [{ nama: "Pramuka", predikat: "Baik", keterangan: "Aktif" }] }, prestasi: { items: ["Juara 2 lomba coding tingkat kota"] }, p5: { items: [{ tema: "Gaya hidup berkelanjutan", deskripsi: "Mampu bekerja sama dalam tim." }] } },
    config: cfg,
  };
  return (
    <>
      <SchoolNav schoolId={id} active="rapor" />
      <a href={`/dashboard/sekolah/${id}/rapor`} className="text-sm font-semibold text-pen underline">← Rapor</a>
      <h1 className="mt-3 mb-2 font-display text-4xl font-bold tracking-tight">Templat rapor</h1>
      <p className="max-w-3xl text-ink-soft">Atur tampilan rapor sekolah: judul, kolom, kelompok mata pelajaran, bagian (sikap, ekstrakurikuler, projek, prestasi), tanda tangan, dan skala predikat. Templat yang dipilih dipakai di semua rapor, termasuk yang dilihat orang tua.</p>
      <div className="mt-4 space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-6">
          <section className="rounded-[6px] border border-line bg-card p-4">
            <h2 className="font-display text-lg font-bold">Templat sekolah</h2>
            <ul className="mt-2 border-t border-line">
              <li className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
                <span className="font-semibold">Tampilan bawaan{!templates.some((t) => t.is_default) ? <span className="ml-2 rounded-full border border-ok/40 bg-ok-bg px-2 py-0.5 text-xs text-ok">dipakai</span> : null}</span>
                {templates.some((t) => t.is_default) ? <form action={useBuiltIn.bind(null, id)}><button type="submit" className="inline-flex min-h-11 items-center text-sm font-semibold text-pen underline">Pakai</button></form> : null}
              </li>
              {templates.map((t) => (
                <li key={t.id as string} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
                  <span className="font-semibold">{t.name as string}{t.is_default ? <span className="ml-2 rounded-full border border-ok/40 bg-ok-bg px-2 py-0.5 text-xs text-ok">dipakai</span> : null}</span>
                  <span className="flex items-center gap-3 text-sm">
                    <a href={`?edit=${t.id}`} className="inline-flex min-h-11 items-center font-semibold text-pen underline">Sunting</a>
                    {!t.is_default ? <form action={setDefaultTemplate.bind(null, id, t.id as string)}><button type="submit" className="inline-flex min-h-11 items-center font-semibold text-pen underline">Pakai</button></form> : null}
                    <form action={deleteReportTemplate.bind(null, id, t.id as string)}><button type="submit" className="inline-flex min-h-11 items-center font-semibold text-bad underline">Hapus</button></form>
                  </span>
                </li>
              ))}
            </ul>
            <a href="?" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-pen underline">+ Templat baru</a>
          </section>

          <section className="rounded-[6px] border border-line bg-card p-4">
            <h2 className="font-display text-lg font-bold">Buat dari contoh rapor (AI)</h2>
            <p className="mt-1 text-sm text-ink-soft">Unggah contoh rapor sekolah di menu Berkas (kategori “Contoh rapor”), lalu pilih di sini. AI mengusulkan templat; Anda memeriksa sebelum memakainya.</p>
            {(samples ?? []).length === 0 ? <p className="mt-2 text-sm">Belum ada contoh rapor. <a href={`/dashboard/sekolah/${id}/berkas`} className="font-semibold text-pen underline">Unggah di Berkas</a>.</p> : (
              <form action={proposeTemplate.bind(null, id)} className="mt-2 flex flex-wrap items-end gap-2">
                <Select name="file_id" aria-label="Contoh rapor">{(samples ?? []).map((f) => <option key={f.id as string} value={f.id as string}>{f.name as string}</option>)}</Select>
                <Button type="submit">Usulkan templat</Button>
              </form>
            )}
          </section>

          <form action={saveReportTemplate.bind(null, id)} className="grid gap-3 rounded-[6px] border border-line bg-card p-4">
            <h2 className="font-display text-lg font-bold">{editing ? "Sunting templat" : "Templat baru"}</h2>
            {editing ? <input type="hidden" name="id" value={editing.id as string} /> : null}
            <label><Label>Nama templat</Label><Input name="name" required minLength={2} maxLength={80} defaultValue={(editing?.name as string | undefined) ?? "Rapor sekolah"} /></label>
            <label><Label>Judul rapor</Label><Input name="title" maxLength={80} defaultValue={cfg.title} /></label>
            <label><Label hint="boleh kosong">Subjudul</Label><Input name="subtitle" maxLength={120} defaultValue={cfg.subtitle} /></label>
            <fieldset><legend className="mb-1 text-sm font-semibold">Kolom nilai</legend>
              <Check name="c_nilai" label="Nilai akhir" on={cfg.columns.nilai} /><Check name="c_predikat" label="Predikat" on={cfg.columns.predikat} />
              <Check name="c_deskripsi" label="Deskripsi capaian otomatis" on={cfg.columns.deskripsi} /><Check name="c_ketuntasan" label="Keterangan tuntas" on={cfg.columns.ketuntasan} /></fieldset>
            <fieldset><legend className="mb-1 text-sm font-semibold">Bagian</legend>
              <Check name="s_kehadiran" label="Kehadiran" on={cfg.sections.kehadiran} /><Check name="s_sikap" label="Sikap (spiritual, sosial)" on={cfg.sections.sikap} />
              <Check name="s_ekskul" label="Ekstrakurikuler" on={cfg.sections.ekskul} /><Check name="s_p5" label="Projek penguatan profil pelajar" on={cfg.sections.p5} />
              <Check name="s_prestasi" label="Prestasi" on={cfg.sections.prestasi} /><Check name="s_catatan" label="Catatan wali kelas" on={cfg.sections.catatan} /></fieldset>
            <label><Label hint="satu per baris: Nama kelompok: mapel; mapel">Kelompok mata pelajaran</Label><Textarea name="groups" rows={4} defaultValue={groupsToText(cfg.groups)} placeholder={"Kelompok Umum: Matematika; Bahasa Indonesia\nKelompok Kejuruan: Dasar-dasar PPLG"} /></label>
            <label><Label hint="satu per baris">Tanda tangan</Label><Textarea name="signatures" rows={3} defaultValue={cfg.signatures.join("\n")} /></label>
            <label><Label hint="nilai minimum=predikat, pisah koma">Skala predikat</Label><Input name="scale" defaultValue={scaleToText(cfg.scale)} /></label>
            <label><Label hint="boleh kosong">Catatan kaki</Label><Input name="footnote" maxLength={300} defaultValue={cfg.footnote} /></label>
            <div><Button type="submit">Simpan templat</Button></div>
          </form>
        </div>

        <section aria-label="Pratinjau rapor">
          <h2 className="mb-2 font-display text-lg font-bold">Pratinjau (data contoh)</h2>
          <ReportSheet {...sample} />
        </section>
      </div>
    </>
  );
}
