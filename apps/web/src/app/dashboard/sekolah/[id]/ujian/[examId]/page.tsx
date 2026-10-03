import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/auto-refresh";
import { Button, ErrorNote, InfoNote, Input, Label, Select, Textarea } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import { addExamQuestion, deleteExamQuestion, setExamStatus, unfreezeSession } from "../actions";

export const metadata = { title: "Kelola ujian · EduSmart" };
const wib = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });
const KIND: Record<string, string> = { mcq: "Pilihan ganda", multi: "Banyak jawaban", short: "Isian singkat", essay: "Uraian" };
const SESS: Record<string, string> = { menunggu: "Belum mulai", berjalan: "Mengerjakan", dibekukan: "Dibekukan", selesai: "Selesai" };

export default async function ExamDetail({ params, searchParams }: { params: Promise<{ id: string; examId: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id, examId } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id);
  await requireModule(supabase, id, "exams");
  const { data: e } = await supabase.from("exams").select("id,title,status,starts_at,ends_at,duration_minutes,secure_required,on_violation,max_violations,instructions,class_group_id,class_groups(name),school_subjects(name)").eq("id", examId).eq("school_id", id).maybeSingle();
  if (!e) notFound();
  const [{ data: qs }, { data: keys }, { data: sessions }, { data: roster }] = await Promise.all([
    supabase.from("exam_questions").select("id,kind,prompt,options,points,position").eq("exam_id", examId).order("position"),
    supabase.from("exam_answer_keys").select("question_id,answer").eq("school_id", id),
    supabase.from("exam_sessions").select("id,status,violations,score,manual_pending,platform,secure,submitted_at,frozen_reason,member_id,school_members(display_name)").eq("exam_id", examId),
    supabase.from("class_group_students").select("member_id,school_members(display_name)").eq("class_group_id", e.class_group_id as string),
  ]);
  const keyOf = new Map((keys ?? []).map((k) => [k.question_id as string, k.answer]));
  const sessIds = (sessions ?? []).map((s) => s.id as string);
  const { data: events } = sessIds.length ? await supabase.from("exam_events").select("session_id,kind,at").in("session_id", sessIds).order("at", { ascending: false }).limit(200) : { data: [] };
  const evBy = new Map<string, { kind: string; at: string }[]>();
  for (const ev of events ?? []) evBy.set(ev.session_id as string, [...(evBy.get(ev.session_id as string) ?? []), ev as { kind: string; at: string }]);
  const nm = (v: unknown) => (Array.isArray(v) ? v[0]?.display_name ?? v[0]?.name : (v as { display_name?: string; name?: string } | null)?.display_name ?? (v as { name?: string } | null)?.name) ?? "";
  const started = new Set((sessions ?? []).map((s) => s.member_id as string));
  const notYet = (roster ?? []).filter((r) => !started.has(r.member_id as string));
  const status = e.status as string;
  const here = `/dashboard/sekolah/${id}/ujian`;
  const live = status === "terbit";
  return (
    <>
      {live ? <AutoRefresh seconds={10} /> : null}
      <a href={here} className="text-sm font-semibold text-pen underline">← Ujian</a>
      <h1 className="mt-3 mb-1 font-display text-3xl font-bold tracking-tight">{e.title as string}</h1>
      <p className="text-ink-soft">{nm(e.school_subjects)} · {nm(e.class_groups)} · {wib.format(new Date(e.starts_at as string))} – {wib.format(new Date(e.ends_at as string))} WIB · {e.duration_minutes as number} menit</p>
      <p className="mt-1 text-sm text-ink-soft">{e.secure_required ? "Wajib aplikasi terkunci" : "Boleh di peramban"} · {e.on_violation === "bekukan" ? `dibekukan setelah ${e.max_violations as number} pelanggaran` : "pelanggaran hanya dicatat"}</p>
      <div className="mt-3 space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>

      <div className="mt-4 flex flex-wrap gap-3">
        {status !== "terbit" ? <form action={setExamStatus.bind(null, id, examId, "terbit")}><Button type="submit">Terbitkan</Button></form> : null}
        {status === "terbit" ? <form action={setExamStatus.bind(null, id, examId, "ditutup")}><Button type="submit" variant="ghost">Tutup ujian</Button></form> : null}
        {status === "terbit" && (sessions ?? []).length === 0 ? <form action={setExamStatus.bind(null, id, examId, "draf")}><Button type="submit" variant="ghost">Kembalikan ke draf</Button></form> : null}
        <span className="inline-flex min-h-11 items-center rounded-full border border-line px-3 text-sm">Status: {status === "draf" ? "Draf" : status === "terbit" ? "Terbit" : "Ditutup"}</span>
      </div>

      <section className="mt-8" aria-labelledby="mon">
        <h2 id="mon" className="font-display text-2xl font-bold">Pemantauan</h2>
        <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Pemantauan siswa">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead><tr className="border-b-2 border-ink"><th className="py-2 pr-3">Siswa</th><th className="pr-3">Status</th><th className="pr-3">Pelanggaran</th><th className="pr-3">Perangkat</th><th className="pr-3">Nilai</th><th>Aksi</th></tr></thead>
            <tbody>
              {(sessions ?? []).map((s) => (
                <tr key={s.id as string} className="border-b border-line align-top">
                  <td className="py-2 pr-3 font-semibold">{nm(s.school_members)}</td>
                  <td className={`pr-3 ${s.status === "dibekukan" ? "font-bold text-bad" : ""}`}>{SESS[s.status as string]}</td>
                  <td className="pr-3"><span className="num">{s.violations as number}</span>{(evBy.get(s.id as string) ?? []).length ? <details><summary className="cursor-pointer text-pen underline">rincian</summary><ul className="text-xs">{(evBy.get(s.id as string) ?? []).slice(0, 8).map((ev, i) => <li key={i}>{wib.format(new Date(ev.at))}: {ev.kind}</li>)}</ul></details> : null}{s.frozen_reason ? <p className="text-xs text-bad">{s.frozen_reason as string}</p> : null}</td>
                  <td className="pr-3">{(s.platform as string | null) ?? "–"}{s.secure ? " · terkunci" : s.status === "menunggu" ? "" : " · tidak terkunci"}</td>
                  <td className="num pr-3">{s.score === null ? "–" : `${s.score as number}${s.manual_pending ? " + uraian" : ""}`}</td>
                  <td>{s.status === "dibekukan" ? <form action={unfreezeSession.bind(null, id, examId, s.id as string)} className="flex items-center gap-2"><Input name="extra" type="number" min={0} max={60} defaultValue={5} aria-label="Tambahan menit" className="w-20" /><Button type="submit">Lanjutkan</Button></form> : null}</td>
                </tr>
              ))}
              {notYet.map((r) => <tr key={r.member_id as string} className="border-b border-line text-ink-soft"><td className="py-2 pr-3">{nm(r.school_members)}</td><td colSpan={5}>Belum membuka ujian</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="soal">
        <h2 id="soal" className="font-display text-2xl font-bold">Soal <span className="num text-ink-soft">({(qs ?? []).length})</span></h2>
        <ol className="mt-3 space-y-3">
          {(qs ?? []).map((x, i) => (
            <li key={x.id as string} className="surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-soft">{i + 1}. {KIND[x.kind as string]} · {x.points as number} poin</p>
                  <p className="mt-1 whitespace-pre-wrap font-semibold">{x.prompt as string}</p>
                  {(x.options as string[]).length ? <ul className="mt-1 list-disc pl-5 text-sm">{(x.options as string[]).map((o, j) => <li key={j}>{o}</li>)}</ul> : null}
                  <p className="mt-1 text-sm text-ok">Kunci: {keyOf.has(x.id as string) ? JSON.stringify(x.kind === "mcq" ? (keyOf.get(x.id as string) as number) + 1 : x.kind === "multi" ? (keyOf.get(x.id as string) as number[]).map((n) => n + 1) : keyOf.get(x.id as string)) : "dinilai guru"}</p>
                </div>
                {status === "draf" ? <form action={deleteExamQuestion.bind(null, id, examId, x.id as string)}><Button type="submit" variant="ghost">Hapus</Button></form> : null}
              </div>
            </li>
          ))}
        </ol>
        {status === "draf" ? (
          <form action={addExamQuestion.bind(null, id, examId)} className="mt-4 grid gap-3 surface p-4 sm:grid-cols-2">
            <h3 className="font-display text-lg font-bold sm:col-span-2">Tambah soal</h3>
            <label><Label>Jenis</Label><Select name="kind"><option value="mcq">Pilihan ganda</option><option value="multi">Banyak jawaban benar</option><option value="short">Isian singkat</option><option value="essay">Uraian (dinilai guru)</option></Select></label>
            <label><Label>Poin</Label><Input name="points" type="number" min={0.5} max={100} step={0.5} defaultValue={1} /></label>
            <label className="sm:col-span-2"><Label>Pertanyaan</Label><Textarea name="prompt" rows={3} required /></label>
            <label><Label hint="satu per baris">Pilihan</Label><Textarea name="options" rows={4} /></label>
            <div className="grid gap-3">
              <label><Label hint="nomor, mis. 2 atau 1,3">Jawaban benar (pilihan)</Label><Input name="correct" /></label>
              <label><Label hint="pisahkan koma">Jawaban diterima (isian)</Label><Input name="accepted" /></label>
            </div>
            <label className="sm:col-span-2"><Label hint="boleh kosong">Pembahasan</Label><Input name="explanation" /></label>
            <div className="sm:col-span-2"><Button type="submit">Tambah soal</Button></div>
          </form>
        ) : <p className="mt-3 text-sm text-ink-soft">Soal terkunci setelah diterbitkan. Kembalikan ke draf untuk mengubah (hanya bila belum ada siswa yang mulai).</p>}
      </section>
    </>
  );
}
