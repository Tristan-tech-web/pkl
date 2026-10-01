import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/role-views";
import { SchoolNav } from "@/components/school-nav";
import { AutoAnalyze } from "@/components/auto-analyze";
import { UploadZone } from "@/components/upload-zone";
import { Button, ErrorNote, InfoNote, Input, Select } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABEL, type Category } from "@/lib/intake";
import { requireModule } from "@/lib/modules";
import { getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { startPlan } from "../rencana/actions";
import { deleteFile, draftMateri, reanalyze, setCategory } from "./actions";

export const metadata = { title: "Berkas · EduSmart" };
export const maxDuration = 120;
const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const TABLE_CATS = new Set<Category>(["siswa", "guru"]);
const TEACHER_CATS: Category[] = ["kurikulum", "buku_paket", "lks", "lainnya"];

export default async function BerkasPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kategori?: string; q?: string; error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "data_hub");
  const management = MANAGEMENT_ROLES.has(me.roleCode);
  if (!management && !["teacher", "homeroom"].includes(me.roleCode)) notFound();
  const kategori = (CATEGORIES as readonly string[]).includes(sp.kategori ?? "") ? (sp.kategori as Category) : null;

  let query = supabase.from("school_files").select("id,name,size_bytes,category,category_source,ai_status,ai_summary,ai_confidence,status,subject_id,scope,created_at,extracted,school_subjects(name)").eq("school_id", id).order("created_at", { ascending: false }).limit(200);
  if (kategori) query = query.eq("category", kategori);
  const term = (sp.q ?? "").trim().replace(/[%,()]/g, " ").slice(0, 60);
  if (term) query = query.or(`name.ilike.%${term}%,ai_summary.ilike.%${term}%,text_content.ilike.%${term}%`);
  const [{ data: files }, { data: subjects }, { data: all }] = await Promise.all([
    query,
    supabase.from("school_subjects").select("id,name").eq("school_id", id).order("name"),
    supabase.from("school_files").select("category").eq("school_id", id),
  ]);
  const counts = new Map<string, number>();
  for (const r of all ?? []) counts.set(r.category as string, (counts.get(r.category as string) ?? 0) + 1);
  type F = { id: string; name: string; size_bytes: number; category: Category; category_source: string; ai_status: string; ai_summary: string | null; ai_confidence: number | null; status: string; scope: string; created_at: string; extracted: { via?: string; notes?: string; table?: { total_rows: number } } | null; school_subjects: { name: string } | { name: string }[] | null };
  const rows = (files ?? []) as unknown as F[];
  const pending = rows.filter((r) => r.ai_status === "belum").map((r) => ({ id: r.id, createdAt: r.created_at })).slice(0, 10);
  const subjectOpts = (subjects ?? []).map((s) => ({ value: s.id as string, label: s.name as string }));

  return (
    <>
      {management ? <SchoolNav schoolId={id} active="berkas" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">{management ? "Pusat data dan berkas" : "Berkas kurikulum dan buku"}</h1>
        <p className="mt-1 max-w-3xl text-ink-soft">
          {management
            ? "Taruh saja berkas sekolah, guru, siswa, keuangan, kurikulum, dan peraturan. Sistem memilah dan memetakan otomatis; data siswa dan guru baru masuk setelah Anda menyetujui pratinjaunya."
            : "Taruh kurikulum, buku paket, LKS, atau bahan ajar Anda. Sistem memilah dan merangkumnya; sekolah dan tutor AI bisa memakainya."}
        </p>
      </header>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      <div className="mt-4">
        <UploadZone
          schoolId={id}
          scope={management ? "sekolah" : "guru"}
          categories={management ? undefined : TEACHER_CATS.map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))}
          subjects={management ? undefined : subjectOpts}
        />
      </div>

      <AutoAnalyze schoolId={id} items={pending} />
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">Berkas <span className="num text-ink-soft">({(all ?? []).length})</span></h2>
          <a href={`/dashboard/sekolah/${id}/rencana`} className="inline-flex min-h-11 items-center font-semibold text-pen underline">Rencana belajar saya</a>
          <form method="get" className="flex gap-2">
            {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
            <Input name="q" defaultValue={term} placeholder="Cari nama, ringkasan, isi" aria-label="Cari berkas" className="w-56" />
            <Button type="submit" variant="ghost">Cari</Button>
          </form>
        </div>
        <nav aria-label="Saring kategori" className="mt-3 flex flex-wrap gap-1.5 text-sm font-semibold">
          <Link href="?" aria-current={!kategori ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-3 ${!kategori ? "border-pen bg-pen text-on-pen" : "border-line"}`}>Semua</Link>
          {CATEGORIES.filter((c) => counts.get(c)).map((c) => (
            <Link key={c} href={`?kategori=${c}`} aria-current={kategori === c ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-3 ${kategori === c ? "border-pen bg-pen text-on-pen" : "border-line"}`}>
              {CATEGORY_LABEL[c]} <span className="num ml-1 font-normal opacity-80">{counts.get(c)}</span>
            </Link>
          ))}
        </nav>
        {rows.length === 0 ? (
          <p className="mt-4 rounded-box border border-dashed border-line p-6 text-ink-soft">{term || kategori ? "Tidak ada berkas yang cocok." : "Belum ada berkas."}</p>
        ) : (
          <ul className="stagger mt-4 space-y-3">
            {rows.map((f) => {
              const subj = Array.isArray(f.school_subjects) ? f.school_subjects[0]?.name : f.school_subjects?.name;
              return (
                <li key={f.id} className="surface p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="min-w-0 break-words font-semibold">{f.name}</p>
                    <p className="num text-sm text-ink-soft">{fmtSize(Number(f.size_bytes))} · {new Date(f.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}</p>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full border border-pen/40 bg-pen/10 px-2.5 py-0.5 font-semibold text-pen">{CATEGORY_LABEL[f.category]}</span>
                    {subj ? <span className="rounded-full border border-line px-2.5 py-0.5">{subj}</span> : null}
                    <span className="text-ink-soft">
                      {f.ai_status === "gagal" ? "Gagal dibaca" : f.ai_status === "selesai" ? `${f.category_source === "ai" ? (f.extracted?.via === "ai" ? "Dipilah AI" : "Dipilah aturan dasar") : "Dipilih manual"}${f.ai_confidence ? ` · yakin ${Math.round(Number(f.ai_confidence) * 100)}%` : ""}` : "Belum dianalisis"}
                      {f.status === "diimpor" ? " · sudah diimpor" : ""}
                    </span>
                  </p>
                  {f.ai_summary ? <p className="mt-2 text-ink-soft">{f.ai_summary}</p> : null}
                  {f.extracted?.notes ? <p className="mt-1 text-sm text-ink-soft">Catatan: {f.extracted.notes}</p> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    {management && TABLE_CATS.has(f.category) && f.extracted?.table ? (
                      <Link href={`/dashboard/sekolah/${id}/berkas/${f.id}`} className="press inline-flex min-h-11 items-center rounded-box bg-pen px-4 font-semibold text-on-pen hover:bg-pen-strong">{f.status === "diimpor" ? "Impor ulang" : `Tinjau dan impor (${f.extracted.table.total_rows} baris)`}</Link>
                    ) : null}
                    {management && f.category === "keuangan" && f.extracted?.table ? (
                      <Link href={`/dashboard/sekolah/${id}/berkas/${f.id}/keuangan`} className="press inline-flex min-h-11 items-center rounded-box bg-pen px-4 font-semibold text-on-pen hover:bg-pen-strong">{f.status === "diimpor" ? "Impor ulang tagihan" : `Tinjau tagihan (${f.extracted.table.total_rows} baris)`}</Link>
                    ) : null}
                    {["kurikulum", "buku_paket", "lks"].includes(f.category) && f.ai_status === "selesai" && subjectOpts.length > 0 ? (
                      <details className="w-full">
                        <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-pen underline">Rencana belajar lengkap (seluruh berkas)</summary>
                        <form action={startPlan.bind(null, id, f.id)} className="mt-2 grid gap-2 sm:grid-cols-4">
                          <Select name="subject_id" aria-label="Mata pelajaran">{subjectOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
                          <Input name="grade" type="number" min={0} max={13} defaultValue={10} aria-label="Kelas" />
                          <Input name="weeks" type="number" min={4} max={40} defaultValue={18} aria-label="Minggu efektif" />
                          <Button type="submit">Buat rencana</Button>
                        </form>
                        <p className="mt-1 text-sm text-ink-soft">Membaca seluruh isi, memilih cara belajar tiap elemen, dan menyusun jadwal ulangan dan tugas dengan alasannya. Bisa pakai AI Anda sendiri.</p>
                      </details>
                    ) : null}
                    {["kurikulum", "buku_paket", "lks"].includes(f.category) && f.ai_status === "selesai" && subjectOpts.length > 0 ? (
                      <details className="w-full">
                        <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-pen underline">Buat draf materi dengan AI</summary>
                        <form action={draftMateri.bind(null, id, f.id)} className="mt-2 grid gap-2 sm:grid-cols-4">
                          <Select name="subject_id" aria-label="Mata pelajaran">{subjectOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
                          <Input name="grade" type="number" min={0} max={13} defaultValue={10} aria-label="Kelas" />
                          <Input name="max_nodes" type="number" min={1} max={8} defaultValue={4} aria-label="Jumlah materi" />
                          <Button type="submit">Susun draf</Button>
                        </form>
                        <p className="mt-1 text-sm text-ink-soft">Hasilnya berstatus draf dan baru terlihat siswa setelah Anda terbitkan.</p>
                      </details>
                    ) : null}
                    <a href={`/dashboard/sekolah/${id}/berkas/${f.id}/unduh`} className="inline-flex min-h-11 items-center font-semibold text-pen underline">Unduh</a>
                    <form action={reanalyze.bind(null, id, f.id)}><button type="submit" className="inline-flex min-h-11 items-center font-semibold text-pen underline">Analisis ulang</button></form>
                    <details>
                      <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-pen underline">Ubah kategori</summary>
                      <form action={setCategory.bind(null, id, f.id)} className="mt-2 flex flex-wrap items-end gap-2">
                        <Select name="category" defaultValue={f.category} aria-label="Kategori">{CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}</Select>
                        <Select name="subject_id" defaultValue="" aria-label="Mata pelajaran"><option value="">Tanpa mapel</option>{subjectOpts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select>
                        <Button type="submit" variant="ghost">Simpan</Button>
                      </form>
                    </details>
                    <form action={deleteFile.bind(null, id, f.id)}><button type="submit" className="inline-flex min-h-11 items-center font-semibold text-bad underline">Hapus</button></form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
