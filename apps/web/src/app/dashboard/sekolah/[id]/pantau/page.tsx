import { notFound } from "next/navigation";
import { SchoolNav } from "@/components/school-nav";
import { BackLink } from "@/components/role-views";
import { Button, ErrorNote, InfoNote, Input, Label, Select, Textarea } from "@/components/ui";
import { first, getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { createIntervention, setInterventionStatus } from "./actions";

export const metadata = { title: "Pantau belajar · EduSmart" };

const KIND_LABEL: Record<string, string> = { remedial: "Remedial", bimbingan: "Bimbingan", teman_sebaya: "Tutor sebaya", orang_tua: "Hubungi orang tua", lainnya: "Lainnya" };
const TEACHING = new Set(["teacher", "homeroom", "counselor"]);
const DAY = 86400000;
const nowMs = () => Date.now();

type Row = { id: string; name: string; className: string };

export default async function PantauPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { id } = await params;
  const { error, info } = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  const management = MANAGEMENT_ROLES.has(me.roleCode);
  if (!management && !TEACHING.has(me.roleCode)) notFound();

  // Rombel yang dipantau: semua untuk manajemen, hanya yang diajar untuk guru.
  let classIds: string[] | null = null;
  if (!management) {
    const { data } = await supabase.from("teaching_assignments").select("class_group_id").eq("school_id", id).eq("teacher_member_id", me.memberId);
    classIds = [...new Set((data ?? []).map((r) => r.class_group_id as string))];
  }
  const roster = await (classIds && classIds.length === 0
    ? Promise.resolve({ data: [] as unknown[] })
    : (classIds
        ? supabase.from("class_group_students").select("member_id,class_groups(name),school_members(display_name)").eq("school_id", id).in("class_group_id", classIds)
        : supabase.from("class_group_students").select("member_id,class_groups(name),school_members(display_name)").eq("school_id", id)));
  const students: Row[] = ((roster.data ?? []) as unknown as {
    member_id: string;
    class_groups: { name: string } | { name: string }[] | null;
    school_members: { display_name: string | null } | { display_name: string | null }[] | null;
  }[]).map((r) => ({
    id: r.member_id,
    name: first(r.school_members)?.display_name ?? "Tanpa nama",
    className: first(r.class_groups)?.name ?? "",
  }));

  const ids = students.map((s) => s.id);
  const [prog, stats, nodes, ivs] = await Promise.all([
    ids.length ? supabase.from("node_progress").select("member_id,node_id,best_score,stars,attempts,completed_at").eq("school_id", id).in("member_id", ids) : { data: [] },
    ids.length ? supabase.from("student_stats").select("member_id,xp,level,streak,last_activity_date").eq("school_id", id).in("member_id", ids) : { data: [] },
    supabase.from("competency_nodes").select("id", { count: "exact", head: true }).eq("school_id", id).eq("status", "published"),
    supabase.from("interventions").select("id,student_member_id,kind,priority,note,due_on,status,created_at").eq("school_id", id).order("created_at", { ascending: false }),
  ]);
  const totalNodes = nodes.count ?? 0;
  const statBy = new Map((stats.data ?? []).map((s) => [s.member_id as string, s]));
  const now = nowMs();

  const rows = students.map((s) => {
    const p = (prog.data ?? []).filter((x) => x.member_id === s.id);
    const done = p.filter((x) => x.completed_at !== null).length;
    const failing = p.filter((x) => x.completed_at === null && (x.attempts as number) >= 1).length;
    const avg = p.length ? Math.round(p.reduce((a, x) => a + (x.best_score as number), 0) / p.length) : null;
    const st = statBy.get(s.id);
    const last = st?.last_activity_date ? new Date(st.last_activity_date as string).getTime() : null;
    const idleDays = last ? Math.floor((now - last) / DAY) : null;
    const reasons: string[] = [];
    if (!last) reasons.push("Belum mulai belajar");
    else if ((idleDays ?? 0) >= 7) reasons.push(`Tidak aktif ${idleDays} hari`);
    if (failing > 0) reasons.push(`${failing} materi belum lulus`);
    if (avg !== null && avg < 60) reasons.push(`Rata-rata nilai ${avg}`);
    return { ...s, done, avg, xp: (st?.xp as number | undefined) ?? 0, streak: (st?.streak as number | undefined) ?? 0, idleDays, reasons };
  });
  rows.sort((a, b) => b.reasons.length - a.reasons.length || a.name.localeCompare(b.name));
  const atRisk = rows.filter((r) => r.reasons.length > 0).length;
  const nameOf = new Map(students.map((s) => [s.id, s.name]));
  const open = (ivs.data ?? []).filter((i) => i.status === "baru" || i.status === "berjalan");

  return (
    <>
      {management ? <SchoolNav schoolId={id} active="pantau" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Pantau belajar</h1>
        <p className="mt-1 text-ink-soft">Siswa dengan tanda risiko tampil paling atas. Aturan: belum mulai, tidak aktif 7 hari, ada materi belum lulus, atau rata-rata nilai di bawah 60.</p>
      </header>
      <div className="space-y-3">
        <ErrorNote message={error} />
        <InfoNote message={info} />
      </div>
      <section aria-label="Ringkasan" className="stagger mt-4 grid grid-cols-3 gap-6">
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-4xl font-bold">{rows.length}</p><p className="text-sm font-semibold">Siswa</p></div>
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-4xl font-bold">{atRisk}</p><p className="text-sm font-semibold">Perlu perhatian</p></div>
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-4xl font-bold">{open.length}</p><p className="text-sm font-semibold">Tindak lanjut terbuka</p></div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">Progres siswa</h2>
        {rows.length === 0 ? (
          <p className="mt-4 rounded-box border border-dashed border-line p-6 text-ink-soft">Belum ada siswa di rombel yang Anda pantau.</p>
        ) : (
          <ul className="stagger mt-4 border-t border-line">
            {rows.map((r) => (
              <li key={r.id} className="border-b border-line py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-lg font-bold">
                    {r.name} <span className="text-sm font-normal text-ink-soft">{r.className}</span>
                  </p>
                  <p className="num text-sm text-ink-soft">
                    {r.done}/{totalNodes} materi · rata-rata {r.avg ?? "–"} · {r.xp} XP · {r.streak} hari beruntun
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full border border-line bg-paper" role="progressbar" aria-valuemin={0} aria-valuemax={totalNodes} aria-valuenow={r.done} aria-label={`Progres ${r.name}`}>
                  <div className="h-full bg-pen" style={{ width: `${totalNodes ? (r.done / totalNodes) * 100 : 0}%` }} />
                </div>
                {r.reasons.length > 0 ? (
                  <p className="mt-2 text-sm font-semibold text-bad">⚠ {r.reasons.join(" · ")}</p>
                ) : (
                  <p className="mt-2 text-sm text-ok">Sesuai jalur</p>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-semibold text-pen underline">Buat tindak lanjut</summary>
                  <form action={createIntervention.bind(null, id)} className="mt-3 grid gap-3 surface p-4 sm:grid-cols-2">
                    <input type="hidden" name="student_id" value={r.id} />
                    <label><Label>Jenis</Label>
                      <Select name="kind" defaultValue="bimbingan">{Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
                    </label>
                    <label><Label>Prioritas</Label>
                      <Select name="priority" defaultValue={r.reasons.length > 1 ? "tinggi" : "sedang"}><option value="rendah">Rendah</option><option value="sedang">Sedang</option><option value="tinggi">Tinggi</option></Select>
                    </label>
                    <label className="sm:col-span-2"><Label>Catatan</Label>
                      <Textarea name="note" rows={2} required minLength={3} maxLength={1000} placeholder="Apa yang akan dilakukan?" />
                    </label>
                    <label><Label hint="boleh kosong">Batas waktu</Label><Input type="date" name="due_on" /></label>
                    <div className="flex items-end"><Button type="submit">Simpan</Button></div>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">Tindak lanjut</h2>
        {(ivs.data ?? []).length === 0 ? (
          <p className="mt-4 rounded-box border border-dashed border-line p-6 text-ink-soft">Belum ada tindak lanjut.</p>
        ) : (
          <ul className="mt-4 border-t border-line">
            {(ivs.data ?? []).map((i) => (
              <li key={i.id as string} className="flex flex-wrap items-start justify-between gap-3 border-b border-line py-3">
                <div>
                  <p className="font-semibold">
                    {nameOf.get(i.student_member_id as string) ?? "Siswa"} · {KIND_LABEL[i.kind as string] ?? i.kind}{" "}
                    <span className={`ml-1 rounded-full border px-2 py-0.5 text-xs ${i.priority === "tinggi" ? "border-bad text-bad" : "border-line text-ink-soft"}`}>{i.priority as string}</span>
                  </p>
                  <p className="text-ink-soft">{i.note as string}</p>
                  <p className="num text-sm text-ink-soft">Status: {i.status as string}{i.due_on ? ` · batas ${i.due_on as string}` : ""}</p>
                </div>
                {i.status === "baru" || i.status === "berjalan" ? (
                  <div className="flex gap-2">
                    {i.status === "baru" ? <form action={setInterventionStatus.bind(null, id, i.id as string, "berjalan")}><Button type="submit" variant="ghost">Mulai</Button></form> : null}
                    <form action={setInterventionStatus.bind(null, id, i.id as string, "selesai")}><Button type="submit" variant="ghost">Selesai</Button></form>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
