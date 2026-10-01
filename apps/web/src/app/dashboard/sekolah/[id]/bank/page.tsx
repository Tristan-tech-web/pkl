import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import { approvePassing, setItemStatus, startBank } from "./actions";

export const metadata = { title: "Bank soal · EduSmart" };
const PAGE = 20;
const STATUS: Record<string, string> = { draf: "Draf", siap: "Siap", ditinjau: "Perlu ditinjau", ditarik: "Ditarik" };
const CHK: Record<string, string> = { ok: "✓", beda: "✗ beda", tidak: "?", lemah: "lemah", tanpa: "tanpa" };

export default async function BankPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string; s?: string; mapel?: string; p?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id);
  await requireModule(supabase, id, "learning");
  const status = ["draf", "siap", "ditinjau", "ditarik"].includes(sp.s ?? "") ? sp.s! : "ditinjau";
  const page = Math.max(0, Number(sp.p) || 0);
  const [{ data: files }, { data: subjects }, { data: counts }, { data: jobs }] = await Promise.all([
    supabase.from("school_files").select("id,name,subject_id,category,text_content").eq("school_id", id).in("category", ["buku_paket", "lks", "kurikulum"]).order("created_at", { ascending: false }),
    supabase.from("school_subjects").select("id,name").eq("school_id", id).order("name"),
    supabase.from("bank_items").select("subject_id,status").eq("school_id", id).limit(20000),
    supabase.from("bank_jobs").select("id,made,target,status,created_at,school_subjects(name)").eq("school_id", id).order("created_at", { ascending: false }).limit(5),
  ]);
  let list = supabase.from("bank_items").select("id,stem,options,bloom,rating,attempts,correct,reports,source_quote,checks,status,bank_keys(answer,explanation),school_subjects(name)").eq("school_id", id).eq("status", status).order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
  if (sp.mapel) list = list.eq("subject_id", sp.mapel);
  const { data: items } = await list;
  const tally = new Map<string, number>();
  for (const c of counts ?? []) tally.set(c.status as string, (tally.get(c.status as string) ?? 0) + 1);
  const here = `/dashboard/sekolah/${id}/bank?s=${status}${sp.mapel ? `&mapel=${sp.mapel}` : ""}&p=${page}`;
  const readable = (files ?? []).filter((f) => String(f.text_content ?? "").trim().length >= 300);

  return (
    <>
      <SchoolNav schoolId={id} active="bank" />
      <h1 className="mb-1 font-display text-3xl font-bold tracking-tight">Bank soal</h1>
      <p className="text-ink-soft">AI membuat ratusan sampai ribuan soal dari buku paket atau LKS. Murid berlatih di menu Latihan untuk mengumpulkan XP; XP berkurang untuk soal yang diulang-ulang atau dijawab terlalu cepat.</p>
      <div className="mt-3 space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>

      <section className="mt-6 surface p-4" aria-label="Buat soal">
        <h2 className="font-display text-xl font-bold">Buat soal dari berkas</h2>
        {readable.length === 0 ? <p className="mt-2 text-sm text-ink-soft">Belum ada berkas buku paket, LKS, atau kurikulum yang terbaca. Unggah di menu Berkas.</p> : (
          <form action={startBank.bind(null, id)} className="mt-3 grid gap-3 sm:grid-cols-2">
            <label><Label>Berkas</Label><Select name="file_id" required>{readable.map((f) => <option key={f.id as string} value={f.id as string}>{f.name as string}</option>)}</Select></label>
            <label><Label>Mata pelajaran</Label><Select name="subject_id" required>{(subjects ?? []).map((s) => <option key={s.id as string} value={s.id as string}>{s.name as string}</option>)}</Select></label>
            <label><Label>Kelas</Label><Input name="grade" type="number" min={0} max={13} defaultValue={10} /></label>
            <label><Label hint="8–2000">Jumlah soal</Label><Input name="target" type="number" min={8} max={2000} defaultValue={80} /></label>
            <label className="flex min-h-11 items-center gap-2 sm:col-span-2"><input type="checkbox" name="auto" className="size-4" /> Terbitkan otomatis yang lolos semua pemeriksaan (tanpa saya setujui satu per satu)</label>
            <div className="sm:col-span-2"><Button type="submit">Mulai</Button></div>
          </form>
        )}
        {(jobs ?? []).length ? <p className="mt-3 text-sm text-ink-soft">Terakhir: {(jobs ?? []).map((j) => <a key={j.id as string} className="mr-3 underline" href={`/dashboard/sekolah/${id}/bank/${j.id as string}`}>{((Array.isArray(j.school_subjects) ? j.school_subjects[0] : j.school_subjects) as { name: string } | null)?.name} {j.made as number}/{j.target as number}</a>)}</p> : null}
      </section>

      <section className="mt-8" aria-label="Tinjau">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="tablist">
            {Object.entries(STATUS).map(([k, label]) => (
              <a key={k} href={`/dashboard/sekolah/${id}/bank?s=${k}${sp.mapel ? `&mapel=${sp.mapel}` : ""}`} aria-current={k === status ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-box border px-3 text-sm font-semibold ${k === status ? "border-pen bg-pen text-on-pen" : "border-line"}`}>{label} <span className="num ml-1.5">{tally.get(k) ?? 0}</span></a>
            ))}
          </div>
          {status === "draf" ? <form action={approvePassing.bind(null, id, sp.mapel ?? "")}><input type="hidden" name="back" value={here} /><Button type="submit">Setujui semua yang lolos pemeriksaan</Button></form> : null}
        </div>
        <form method="get" className="mt-3 flex items-end gap-2"><input type="hidden" name="s" value={status} />
          <label><Label>Mata pelajaran</Label><Select name="mapel" defaultValue={sp.mapel ?? ""}><option value="">Semua</option>{(subjects ?? []).map((s) => <option key={s.id as string} value={s.id as string}>{s.name as string}</option>)}</Select></label>
          <Button type="submit" variant="ghost">Saring</Button></form>
        <ul className="mt-4 space-y-3">
          {(items ?? []).map((it) => {
            const key = (Array.isArray(it.bank_keys) ? it.bank_keys[0] : it.bank_keys) as { answer: number; explanation: string | null } | null;
            const c = it.checks as { solver?: string; quote?: string; dup?: number };
            return (
              <li key={it.id as string} className="surface p-4">
                <p className="font-semibold">{it.stem as string}</p>
                <ol className="mt-2 list-[upper-alpha] space-y-0.5 pl-6 text-sm">{(it.options as string[]).map((o, i) => <li key={i} className={i === key?.answer ? "font-semibold text-ok" : ""}>{o}</li>)}</ol>
                {key?.explanation ? <p className="mt-2 text-sm text-ink-soft">{key.explanation}</p> : null}
                {it.source_quote ? <p className="mt-1 border-l-2 border-line pl-3 text-sm italic text-ink-soft">“{it.source_quote as string}”</p> : null}
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                  <span>Pemecah AI: {CHK[c.solver ?? "tidak"]}</span><span>Kutipan: {CHK[c.quote ?? "tanpa"]}</span><span className="capitalize">{it.bloom as string}</span>
                  <span className="num">tingkat {Math.round(Number(it.rating))}</span><span className="num">{it.correct as number}/{it.attempts as number} benar</span>{(it.reports as number) > 0 ? <span className="font-semibold text-bad">{it.reports as number} laporan</span> : null}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {status !== "siap" ? <form action={setItemStatus.bind(null, id, it.id as string, "siap")}><input type="hidden" name="back" value={here} /><Button type="submit">Setujui</Button></form> : null}
                  {status !== "ditarik" ? <form action={setItemStatus.bind(null, id, it.id as string, "ditarik")}><input type="hidden" name="back" value={here} /><Button type="submit" variant="ghost">Tarik</Button></form> : null}
                </div>
              </li>
            );
          })}
          {(items ?? []).length === 0 ? <li className="surface p-4 text-sm text-ink-soft">Tidak ada butir pada status ini.</li> : null}
        </ul>
        <div className="mt-4 flex gap-3 text-sm font-semibold">
          {page > 0 ? <a className="underline" href={`/dashboard/sekolah/${id}/bank?s=${status}${sp.mapel ? `&mapel=${sp.mapel}` : ""}&p=${page - 1}`}>← Sebelumnya</a> : null}
          {(items ?? []).length === PAGE ? <a className="underline" href={`/dashboard/sekolah/${id}/bank?s=${status}${sp.mapel ? `&mapel=${sp.mapel}` : ""}&p=${page + 1}`}>Berikutnya →</a> : null}
        </div>
      </section>
    </>
  );
}
