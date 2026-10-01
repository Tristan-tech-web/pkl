import { SchoolNav } from "@/components/school-nav";
import { BackLink } from "@/components/role-views";
import { requireModule } from "@/lib/modules";
import { getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { notFound } from "next/navigation";

export const metadata = { title: "Analitik · EduSmart" };
const DAY = 86400000;
const nowMs = () => Date.now();
const jakartaDay = (d: Date) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(d);

function Bars({ rows, max, unit = "", good }: { rows: { label: string; value: number; hint?: string }[]; max: number; unit?: string; good?: (v: number) => boolean }) {
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 sm:grid-cols-[minmax(0,14rem)_1fr_auto]">
          <span className="truncate text-sm font-semibold" title={r.label}>{r.label}</span>
          <span className="h-3 overflow-hidden rounded-full border border-line bg-paper" role="img" aria-label={`${r.label}: ${r.value}${unit}`}>
            <span className={`block h-full ${good ? (good(r.value) ? "bg-ok" : "bg-bad") : "bg-pen"}`} style={{ width: `${Math.min(100, (r.value / Math.max(1, max)) * 100)}%` }} />
          </span>
          <span className="num min-w-14 text-right text-sm font-semibold">{r.value}{unit}{r.hint ? <span className="ml-1 font-normal text-ink-soft">{r.hint}</span> : null}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AnalitikPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "analytics");
  if (me.roleCode === "student" || me.roleCode === "parent") notFound();
  const management = MANAGEMENT_ROLES.has(me.roleCode);
  const since = jakartaDay(new Date(nowMs() - 13 * DAY));
  const since30 = jakartaDay(new Date(nowMs() - 29 * DAY));
  const [att, prog, nodes, stats, classes, roster, att30] = await Promise.all([
    supabase.from("quiz_attempts").select("created_at,score").eq("school_id", id).gte("created_at", `${since}T00:00:00+07:00`),
    supabase.from("node_progress").select("node_id,best_score,attempts,completed_at").eq("school_id", id),
    supabase.from("competency_nodes").select("id,code,title").eq("school_id", id).eq("status", "published").order("position"),
    supabase.from("student_stats").select("member_id,last_activity_date,xp").eq("school_id", id),
    supabase.from("class_groups").select("id,name").eq("school_id", id).order("name"),
    supabase.from("class_group_students").select("class_group_id,member_id").eq("school_id", id),
    supabase.from("attendance_records").select("class_group_id,status").eq("school_id", id).gte("on_date", since30),
  ]);

  // Aktivitas 14 hari
  const days: { label: string; value: number; avg: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = jakartaDay(new Date(nowMs() - i * DAY));
    const list = (att.data ?? []).filter((a) => jakartaDay(new Date(a.created_at as string)) === d);
    days.push({ label: d.slice(5), value: list.length, avg: list.length ? Math.round(list.reduce((s, a) => s + (a.score as number), 0) / list.length) : 0 });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.value));

  // Materi: rata-rata nilai terbaik dan penyelesaian
  const title = new Map((nodes.data ?? []).map((n) => [n.id as string, `${n.code as string} ${n.title as string}`]));
  const byNode = new Map<string, { sum: number; n: number; done: number; attempts: number }>();
  for (const p of prog.data ?? []) {
    const e = byNode.get(p.node_id as string) ?? { sum: 0, n: 0, done: 0, attempts: 0 };
    e.sum += p.best_score as number; e.n += 1; e.attempts += p.attempts as number; if (p.completed_at) e.done += 1;
    byNode.set(p.node_id as string, e);
  }
  const hardest = [...byNode.entries()].filter(([k]) => title.has(k)).map(([k, e]) => ({ label: title.get(k)!, value: Math.round(e.sum / e.n), hint: `${e.attempts} percobaan` })).sort((a, b) => a.value - b.value).slice(0, 6);

  // Distribusi nilai terbaik
  const buckets = [["0–59", 0, 59], ["60–74", 60, 74], ["75–89", 75, 89], ["90–100", 90, 100]] as const;
  const dist = buckets.map(([label, lo, hi]) => ({ label, value: (prog.data ?? []).filter((p) => (p.best_score as number) >= lo && (p.best_score as number) <= hi).length }));

  // Aktif 7 hari
  const cut = jakartaDay(new Date(nowMs() - 6 * DAY));
  const students = stats.data ?? [];
  const active = students.filter((s) => s.last_activity_date && (s.last_activity_date as string) >= cut).length;

  // Kehadiran 30 hari per rombel
  const cname = new Map((classes.data ?? []).map((c) => [c.id as string, c.name as string]));
  const attBy = new Map<string, { p: number; t: number }>();
  for (const r of att30.data ?? []) {
    const e = attBy.get(r.class_group_id as string) ?? { p: 0, t: 0 };
    e.t += 1; if (r.status === "hadir" || r.status === "terlambat") e.p += 1;
    attBy.set(r.class_group_id as string, e);
  }
  const attRows = [...attBy.entries()].map(([k, e]) => ({ label: cname.get(k) ?? "Rombel", value: Math.round((e.p / e.t) * 100) })).sort((a, b) => a.label.localeCompare(b.label));
  const totalStudents = new Set((roster.data ?? []).map((r) => r.member_id as string)).size;

  return (
    <>
      {management ? <SchoolNav schoolId={id} active="analitik" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Analitik belajar</h1>
        <p className="mt-1 text-ink-soft">Ringkasan 14 hari terakhir dan keseluruhan materi. Angka diambil langsung dari kuis dan absensi.</p>
      </header>
      <section aria-label="Ringkasan" className="stagger grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-4xl font-bold">{totalStudents}</p><p className="text-sm font-semibold">Siswa di rombel</p></div>
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-4xl font-bold">{active}</p><p className="text-sm font-semibold">Aktif 7 hari</p></div>
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-4xl font-bold">{days.reduce((s, d) => s + d.value, 0)}</p><p className="text-sm font-semibold">Kuis dikerjakan</p></div>
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-4xl font-bold">{(prog.data ?? []).filter((p) => p.completed_at).length}</p><p className="text-sm font-semibold">Materi lulus</p></div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">Aktivitas kuis per hari</h2>
        <div className="mt-4 flex h-40 items-end gap-1.5 border-b border-line" role="img" aria-label="Jumlah kuis per hari, 14 hari terakhir">
          {days.map((d) => (
            <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.label}: ${d.value} kuis, rata-rata ${d.avg}`}>
              <span className="num text-xs text-ink-soft">{d.value || ""}</span>
              <span className="w-full rounded-t-[3px] bg-pen" style={{ height: `${(d.value / maxDay) * 100}%`, minHeight: d.value ? 3 : 0 }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-1.5">{days.map((d) => <span key={d.label} className="num flex-1 text-center text-[10px] text-ink-soft">{d.label.slice(3)}</span>)}</div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight">Materi tersulit</h2>
          <p className="mb-3 text-sm text-ink-soft">Rata-rata nilai terbaik paling rendah. Pertimbangkan penjelasan ulang atau remedial.</p>
          {hardest.length === 0 ? <p className="text-ink-soft">Belum ada data.</p> : <Bars rows={hardest} max={100} good={(v) => v >= 75} />}
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight">Sebaran nilai terbaik</h2>
          <p className="mb-3 text-sm text-ink-soft">Jumlah pasangan siswa-materi per rentang nilai.</p>
          <Bars rows={dist} max={Math.max(1, ...dist.map((d) => d.value))} />
        </section>
      </div>

      {attRows.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">Kehadiran 30 hari per rombel</h2>
          <div className="mt-3"><Bars rows={attRows} max={100} unit="%" good={(v) => v >= 90} /></div>
        </section>
      ) : null}
    </>
  );
}
