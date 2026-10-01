import { notFound } from "next/navigation";
import { Button, ErrorNote, InfoNote, Input, Label, Select, Textarea } from "@/components/ui";
import { getSchoolContext } from "@/lib/school";
import { NODE_KINDS } from "@/lib/learning";
import { addQuestion, deleteQuestion, saveNode } from "../actions";

export const metadata = { title: "Sunting materi · EduSmart" };

export default async function EditNodePage({ params, searchParams }: { params: Promise<{ id: string; nodeId: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id, nodeId } = await params;
  const { error, info } = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  if (!["owner", "admin", "curriculum_lead", "teacher"].includes(me.roleCode)) notFound();
  const [node, lesson, questions, keys, others, reqs, unitsQ, classesQ, schedQ] = await Promise.all([
    supabase.from("competency_nodes").select("id,code,title,summary,status,xp_reward,estimated_minutes,subject_id,kind,unit_id").eq("id", nodeId).eq("school_id", id).maybeSingle(),
    supabase.from("lessons").select("body_md,objectives,visual_module").eq("node_id", nodeId).maybeSingle(),
    supabase.from("quiz_questions").select("id,kind,prompt,options,position").eq("node_id", nodeId).order("position"),
    supabase.from("quiz_answer_keys").select("question_id,answer,explanation").eq("school_id", id),
    supabase.from("competency_nodes").select("id,code,title,subject_id").eq("school_id", id).neq("id", nodeId).order("position"),
    supabase.from("competency_prerequisites").select("requires_id").eq("node_id", nodeId),
    supabase.from("path_units").select("id,title,subject_id").eq("school_id", id).order("position"),
    supabase.from("class_groups").select("id,name").eq("school_id", id).order("name"),
    supabase.from("node_schedule").select("class_group_id,unlock_at").eq("node_id", nodeId),
  ]);
  if (!node.data) notFound();
  const n = node.data;
  const keyBy = new Map((keys.data ?? []).map((k) => [k.question_id as string, k]));
  const chosen = new Set((reqs.data ?? []).map((r) => r.requires_id as string));
  const units = (unitsQ.data ?? []).filter((u) => u.subject_id === n.subject_id);
  const schedBy = new Map((schedQ.data ?? []).map((r) => [r.class_group_id as string, r.unlock_at as string]));
  // nilai datetime-local dalam WIB
  const toWib = (iso: string) => new Date(new Date(iso).getTime() + 7 * 3600e3).toISOString().slice(0, 16);
  const sameSubject = (others.data ?? []).filter((o) => o.subject_id === n.subject_id);

  return (
    <>
      <a href={`/dashboard/sekolah/${id}/materi`} className="text-sm font-semibold text-pen underline">← Semua materi</a>
      <header className="mt-3 mb-6">
        <p className="num text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{n.code as string}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">{n.title as string}</h1>
      </header>
      <div className="space-y-3"><ErrorNote message={error} /><InfoNote message={info} /></div>

      <form action={saveNode.bind(null, id, nodeId)} className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block"><Label>Judul</Label><Input name="title" defaultValue={n.title as string} required minLength={2} maxLength={160} /></label>
          <label className="block"><Label>Ringkasan</Label><Input name="summary" defaultValue={(n.summary as string | null) ?? ""} maxLength={300} /></label>
          <div className="grid grid-cols-3 gap-3">
            <label><Label>Status</Label>
              <Select name="status" defaultValue={n.status as string}><option value="draft">Draf</option><option value="published">Terbit</option><option value="archived">Arsip</option></Select></label>
            <label><Label>XP</Label><Input name="xp_reward" type="number" min={0} max={1000} defaultValue={n.xp_reward as number} /></label>
            <label><Label>Menit</Label><Input name="estimated_minutes" type="number" min={1} max={600} defaultValue={(n.estimated_minutes as number | null) ?? ""} /></label>
          </div>
          <label className="block"><Label hint="satu per baris">Tujuan belajar</Label>
            <Textarea name="objectives" rows={3} defaultValue={((lesson.data?.objectives as string[] | undefined) ?? []).join("\n")} /></label>
          <label className="block"><Label>Visual</Label>
            <Select name="visual_module" defaultValue={(lesson.data?.visual_module as string | null) ?? ""}><option value="">Tanpa visual</option><option value="parabola">Grafik fungsi kuadrat</option></Select></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label><Label>Jenis simpul</Label>
              <Select name="kind" defaultValue={n.kind as string}>{NODE_KINDS.map((k) => <option key={k} value={k}>{({ materi: "Materi", persiapan: "Persiapan (sebelum pelajaran)", latihan: "Latihan", ulang: "Ulang berjarak", checkpoint: "Checkpoint", boss: "Tantangan (boss)", proyek: "Proyek", cerita: "Cerita" } as Record<string, string>)[k]}</option>)}</Select></label>
            <label><Label>Unit (bab)</Label>
              <Select name="unit_id" defaultValue={(n.unit_id as string | null) ?? ""}><option value="">Tanpa unit</option>{units.map((u) => <option key={u.id as string} value={u.id as string}>{u.title as string}</option>)}</Select></label>
            <label className="sm:col-span-2"><Label hint="atau buat unit baru">Nama unit baru</Label><Input name="new_unit" maxLength={120} placeholder="mis. Bab 3 Fungsi Kuadrat" /></label>
          </div>
          <fieldset className="surface p-3">
            <legend className="px-1 text-sm font-semibold">Jadwal buka per rombel <span className="font-normal text-ink-soft">(WIB; kosong = langsung terbuka)</span></legend>
            <p className="mb-2 text-sm text-ink-soft">Disarankan sore hari sebelum pelajaran (mis. pukul 15.00): persiapan malam sebelum kelas membuat belajar lebih menempel.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(classesQ.data ?? []).map((c) => (
                <label key={c.id as string}><Label>{c.name as string}</Label><Input type="datetime-local" name={`sched_${c.id as string}`} defaultValue={schedBy.has(c.id as string) ? toWib(schedBy.get(c.id as string)!) : ""} /></label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1 text-sm font-semibold">Prasyarat <span className="font-normal text-ink-soft">(harus lulus dulu)</span></legend>
            {sameSubject.length === 0 ? <p className="text-ink-soft">Belum ada materi lain.</p> : sameSubject.map((o) => (
              <label key={o.id as string} className="flex min-h-9 items-center gap-2">
                <input type="checkbox" name="requires" value={o.id as string} defaultChecked={chosen.has(o.id as string)} className="size-4" />
                <span className="num text-sm text-ink-soft">{o.code as string}</span> {o.title as string}
              </label>
            ))}
          </fieldset>
        </div>
        <label className="block"><Label hint="## judul, - daftar, **tebal**, `kode`">Isi pelajaran</Label>
          <Textarea name="body_md" rows={18} className="font-mono text-sm" defaultValue={(lesson.data?.body_md as string | undefined) ?? ""} /></label>
        <div className="lg:col-span-2"><Button type="submit">Simpan materi</Button></div>
      </form>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">Soal <span className="num text-ink-soft">({questions.data?.length ?? 0})</span></h2>
        <ol className="mt-3 border-t border-line">
          {(questions.data ?? []).map((qn, i) => {
            const k = keyBy.get(qn.id as string);
            const opts = (qn.options as string[]) ?? [];
            const ans = qn.kind === "mcq" ? opts[Number(k?.answer)] : Array.isArray(k?.answer) ? (k?.answer as string[]).join(" / ") : String(k?.answer ?? "");
            return (
              <li key={qn.id as string} className="flex flex-wrap items-start justify-between gap-3 border-b border-line py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{i + 1}. {qn.prompt as string}</p>
                  <p className="text-sm text-ink-soft">{qn.kind === "mcq" ? `Pilihan: ${opts.join(" | ")}` : "Isian singkat"}</p>
                  <p className="text-sm text-ok">Jawaban: {ans}</p>
                </div>
                <form action={deleteQuestion.bind(null, id, nodeId, qn.id as string)}><Button type="submit" variant="ghost">Hapus</Button></form>
              </li>
            );
          })}
        </ol>
        <form action={addQuestion.bind(null, id, nodeId)} className="mt-5 grid gap-3 surface p-4 sm:grid-cols-2">
          <h3 className="font-display text-lg font-bold sm:col-span-2">Tambah soal</h3>
          <label><Label>Jenis</Label><Select name="kind" defaultValue="mcq"><option value="mcq">Pilihan ganda</option><option value="short">Isian singkat</option></Select></label>
          <label className="sm:col-span-2"><Label>Pertanyaan</Label><Input name="prompt" required minLength={3} maxLength={1000} /></label>
          <label><Label hint="satu per baris, untuk pilihan ganda">Pilihan</Label><Textarea name="options" rows={4} /></label>
          <div className="space-y-3">
            <label className="block"><Label hint="nomor, mis. 2">Jawaban benar (pilihan ganda)</Label><Input name="correct" type="number" min={1} max={6} /></label>
            <label className="block"><Label hint="pisahkan koma">Jawaban diterima (isian singkat)</Label><Input name="accepted" placeholder="3, x=3" /></label>
          </div>
          <label className="sm:col-span-2"><Label>Pembahasan</Label><Textarea name="explanation" rows={2} required minLength={3} /></label>
          <div className="sm:col-span-2"><Button type="submit">Tambah soal</Button></div>
        </form>
      </section>
    </>
  );
}
