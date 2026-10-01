import { notFound } from "next/navigation";
import { CopyBox } from "@/components/copy-box";
import { PlanRunner } from "@/components/plan-runner";
import { Button, ErrorNote, InfoNote, Label, Textarea } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import { KIND_LABEL, TYPE_LABEL, bridgePrompt, type Plan } from "@/lib/study-plan";
import { deletePlan, draftFromChapter, importBridge } from "../actions";

export const metadata = { title: "Rencana belajar · EduSmart" };
export const maxDuration = 120;
const BRIDGE_MAX = 120_000;
const DIFF = ["", "mudah", "sedang", "sulit"];

export default async function PlanPage({ params, searchParams }: { params: Promise<{ id: string; planId: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id, planId } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id);
  await requireModule(supabase, id, "data_hub");
  const { data: p } = await supabase.from("study_plans").select("id,title,status,weeks,grade,file_id,plan,school_subjects(name)").eq("id", planId).eq("school_id", id).maybeSingle();
  if (!p) notFound();
  const plan = p.plan as Plan | null;
  const sj = p.school_subjects as { name: string } | { name: string }[] | null;
  const subject = (Array.isArray(sj) ? sj[0]?.name : sj?.name) ?? "Pelajaran";
  let prompt = "";
  if (!plan) {
    const { data: f } = await supabase.from("school_files").select("text_content").eq("id", p.file_id as string).maybeSingle();
    const text = String(f?.text_content ?? "");
    prompt = bridgePrompt({ subject, grade: p.grade as number, weeks: p.weeks as number, text: text.slice(0, BRIDGE_MAX) });
  }
  const byWeek = new Map<number, Plan["schedule"]>();
  for (const s of plan?.schedule ?? []) byWeek.set(s.week, [...(byWeek.get(s.week) ?? []), s]);

  return (
    <>
      <a href={`/dashboard/sekolah/${id}/rencana`} className="text-sm font-semibold text-pen underline">← Rencana belajar</a>
      <h1 className="mt-3 mb-1 font-display text-3xl font-bold tracking-tight">{p.title as string}</h1>
      <p className="text-ink-soft">Kelas {p.grade as number} · {p.weeks as number} minggu efektif</p>
      <div className="mt-3 space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>

      {!plan ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section aria-label="Analisis otomatis">
            <h2 className="font-display text-xl font-bold">A. Analisis otomatis</h2>
            <p className="mt-1 mb-3 text-sm text-ink-soft">Membaca seluruh berkas bertahap (bisa puluhan halaman), lalu menyusun rencana. Memakai kunci AI Anda (menu AI saya), kunci sekolah, atau kunci demo. Boleh ditinggal dan dilanjutkan.</p>
            <PlanRunner schoolId={id} planId={planId} />
          </section>
          <section aria-label="Pakai AI saya sendiri">
            <h2 className="font-display text-xl font-bold">B. Pakai AI milik Anda</h2>
            <p className="mt-1 mb-3 text-sm text-ink-soft">Tanpa kunci API: salin prompt, kirim ke ChatGPT, Claude, atau Gemini Anda, lalu tempel jawaban JSON-nya di bawah.</p>
            <CopyBox text={prompt} note={prompt.length >= BRIDGE_MAX ? "Berkas sangat panjang, hanya bagian awalnya yang dimuat. Untuk seluruh berkas pakai opsi A." : undefined} />
            <form action={importBridge.bind(null, id, planId)} className="mt-4">
              <label><Label>Jawaban dari AI Anda</Label><Textarea name="result" rows={6} required placeholder='{"chapters": [...], "schedule": [...]}' /></label>
              <div className="mt-2"><Button type="submit">Muat jawaban</Button></div>
            </form>
          </section>
        </div>
      ) : (
        <>
          <p className="mt-4 flex flex-wrap gap-x-6 text-sm"><span className="num font-semibold">{plan.chapters.length} bab</span><span className="num">{plan.chapters.reduce((a, c) => a + c.elements.length, 0)} elemen</span><span className="num">{plan.schedule.length} jadwal</span></p>
          <p className="mt-4"><a href={`/dashboard/sekolah/${id}/skilltree/${planId}`} className="btn-solid inline-flex min-h-11 items-center rounded-box px-4 font-semibold">Susun skill tree semester</a></p>
          {plan.notes ? <p className="mt-3 max-w-3xl surface p-3 text-sm">{plan.notes}</p> : null}

          <h2 className="mt-8 mb-3 font-display text-2xl font-bold">Bab dan cara belajarnya</h2>
          <div className="space-y-3">
            {plan.chapters.map((c, i) => (
              <details key={i} className="surface" open={i === 0}>
                <summary className="flex min-h-11 cursor-pointer flex-wrap items-center justify-between gap-2 p-4 font-semibold">
                  <span><span className="num text-ink-soft">{i + 1}.</span> {c.title}</span>
                  <span className="text-sm font-normal text-ink-soft">{c.elements.length} elemen{c.minutes ? ` · ${c.minutes} menit` : ""}</span>
                </summary>
                <div className="border-t border-line p-4">
                  {c.summary ? <p className="text-ink-soft">{c.summary}</p> : null}
                  {c.prerequisites.length ? <p className="mt-1 text-sm">Prasyarat: {c.prerequisites.join(", ")}</p> : null}
                  <ul className="mt-3 space-y-3">
                    {c.elements.map((e, j) => (
                      <li key={j} className="rounded-box border border-line p-3">
                        <p className="flex flex-wrap items-center gap-2"><span className="font-semibold">{e.name}</span><span className="rounded-full border border-line px-2 text-xs">{TYPE_LABEL[e.type]}</span><span className="text-xs text-ink-soft">{DIFF[e.difficulty]}</span></p>
                        <p className="mt-1 text-sm"><span className="font-semibold">Cara belajar:</span> {e.method}</p>
                        <p className="text-sm text-ink-soft"><span className="font-semibold text-ink">Kenapa:</span> {e.why}</p>
                        {e.activities.length ? <ul className="mt-1 list-disc pl-5 text-sm">{e.activities.map((a, k) => <li key={k}>{a}</li>)}</ul> : null}
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {c.formatif ? <div><dt className="font-semibold">Penilaian formatif</dt><dd>{c.formatif}</dd></div> : null}
                    {c.sumatif ? <div><dt className="font-semibold">Penilaian sumatif</dt><dd>{c.sumatif}</dd></div> : null}
                    {c.assessment_why ? <div className="sm:col-span-2 text-ink-soft"><dt className="font-semibold text-ink">Alasan</dt><dd>{c.assessment_why}</dd></div> : null}
                    {c.tasks.length ? <div className="sm:col-span-2"><dt className="font-semibold">Tugas</dt><dd><ul className="list-disc pl-5">{c.tasks.map((t, k) => <li key={k}>{t}</li>)}</ul></dd></div> : null}
                  </dl>
                  <form action={draftFromChapter.bind(null, id, planId, i)} className="mt-3"><Button type="submit" variant="ghost">Jadikan draf materi dengan AI</Button></form>
                </div>
              </details>
            ))}
          </div>

          <h2 className="mt-8 mb-3 font-display text-2xl font-bold">Jadwal ulangan dan tugas</h2>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Jadwal">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead><tr className="border-b-2 border-ink"><th className="py-2 pr-3">Minggu</th><th className="pr-3">Kegiatan</th><th className="pr-3">Bab</th><th>Alasan</th></tr></thead>
              <tbody>
                {[...byWeek.entries()].map(([w, items]) => items.map((s, i) => (
                  <tr key={`${w}-${i}`} className="border-b border-line align-top">
                    <td className="num py-2 pr-3 font-semibold">{i === 0 ? w : ""}</td>
                    <td className="pr-3"><span className="font-semibold">{KIND_LABEL[s.kind]}</span><br />{s.what}</td>
                    <td className="pr-3">{s.chapter}</td>
                    <td className="text-ink-soft">{s.why}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

          {plan.spaced.length ? (
            <>
              <h2 className="mt-8 mb-3 font-display text-2xl font-bold">Pengulangan berjarak</h2>
              <ul className="space-y-1 text-sm">{plan.spaced.map((s, i) => <li key={i}><span className="num font-semibold">+{s.after_days} hari</span> · {s.chapter}: {s.what}</li>)}</ul>
            </>
          ) : null}
        </>
      )}
      <form action={deletePlan.bind(null, id, planId)} className="mt-10"><Button type="submit" variant="ghost">Hapus rencana</Button></form>
    </>
  );
}
