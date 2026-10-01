import Link from "next/link";
import { BackLink } from "@/components/role-views";
import { Stars } from "@/components/stars";
import { StudentStats } from "@/components/student-stats";
import { loadMap, loadStats, type MapNode } from "@/lib/learning";
import { getSchoolContext } from "@/lib/school";

export const metadata = { title: "Peta belajar · EduSmart" };

function tiers(nodes: MapNode[]) {
  const depth = new Map<string, number>();
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const d = (n: MapNode): number => {
    const cached = depth.get(n.id);
    if (cached !== undefined) return cached;
    depth.set(n.id, 0);
    const v = n.requires.length ? 1 + Math.max(...n.requires.map((r) => (byId.get(r) ? d(byId.get(r)!) : 0))) : 0;
    depth.set(n.id, v);
    return v;
  };
  nodes.forEach(d);
  const out: MapNode[][] = [];
  for (const n of nodes) (out[depth.get(n.id)!] ??= []).push(n);
  return out.filter(Boolean);
}

export default async function BelajarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, me } = await getSchoolContext(id);
  const [nodes, stats] = await Promise.all([loadMap(supabase, id, me.memberId), loadStats(supabase, id, me.memberId)]);
  const bySubject = new Map<string, MapNode[]>();
  for (const n of nodes) bySubject.set(n.subjectName, [...(bySubject.get(n.subjectName) ?? []), n]);
  const isStudent = me.roleCode === "student";
  const next = nodes.find((n) => n.state === "tersedia");

  return (
    <>
      <BackLink />
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Peta belajar</h1>
        <p className="mt-1 text-ink-soft">Selesaikan materi satu per satu. Materi berikutnya terbuka setelah prasyaratnya lulus.</p>
      </header>
      {isStudent ? <StudentStats stats={stats} /> : null}
      {next ? (
        <Link
          href={`/dashboard/sekolah/${id}/belajar/${next.id}`}
          className="press mt-4 flex items-center justify-between gap-3 rounded-box border-2 border-pen bg-card p-4"
        >
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-pen">Lanjutkan</span>
            <span className="block text-lg font-bold">{next.title}</span>
          </span>
          <span aria-hidden="true" className="text-2xl text-pen">→</span>
        </Link>
      ) : null}
      {nodes.length === 0 ? (
        <p className="mt-8 rounded-box border border-dashed border-line p-6 text-ink-soft">Belum ada materi yang terbit.</p>
      ) : null}
      {[...bySubject.entries()].map(([subject, list]) => (
        <section key={subject} className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">{subject}</h2>
          <ol className="stagger relative mt-4">
            {tiers(list).map((tier, ti, all) => (
              <li key={ti} className="relative grid grid-cols-[2.25rem_1fr] gap-x-3 pb-5 last:pb-0">
                <span aria-hidden="true" className="relative flex flex-col items-center">
                  <span
                    className={`z-10 mt-4 size-5 shrink-0 rounded-full border-2 ${
                      tier.every((n) => n.state === "selesai") ? "border-ok bg-ok" : tier.some((n) => n.state === "tersedia") ? "border-pen bg-card" : "border-line bg-paper"
                    }`}
                  />
                  {ti < all.length - 1 ? <span className="absolute top-9 -bottom-5 w-0.5 bg-line" /> : null}
                </span>
                <div className={`grid gap-3 ${tier.length > 1 ? "md:grid-cols-2" : ""}`}>
                  {tier.map((n) => (
                    <NodeCard key={n.id} n={n} schoolId={id} names={new Map(list.map((x) => [x.id, x.title]))} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}

function NodeCard({ n, schoolId, names }: { n: MapNode; schoolId: string; names: Map<string, string> }) {
  const locked = n.state === "terkunci";
  const body = (
    <div
      className={`rounded-box border p-4 ${
        locked ? "border-line bg-paper opacity-70" : n.state === "selesai" ? "border-ok/40 bg-card" : "border-pen bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="num text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
            {n.code} {n.kind === "checkpoint" ? "· Checkpoint" : ""}
          </p>
          <h3 className="mt-0.5 text-lg font-bold leading-snug">{n.title}</h3>
        </div>
        {n.state === "selesai" ? <Stars n={n.stars} /> : null}
      </div>
      {n.summary ? <p className="mt-1 text-ink-soft">{n.summary}</p> : null}
      <p className="num mt-3 text-sm text-ink-soft">
        {locked ? (
          <>🔒 Selesaikan dulu: {n.requires.map((r) => names.get(r) ?? "materi lain").join(", ")}</>
        ) : (
          <>
            +{n.xpReward} XP{n.minutes ? ` · ±${n.minutes} menit` : ""}
            {n.state === "selesai" ? ` · nilai terbaik ${n.bestScore}` : ""}
          </>
        )}
      </p>
    </div>
  );
  if (locked) return <div aria-disabled="true">{body}</div>;
  return (
    <Link href={`/dashboard/sekolah/${schoolId}/belajar/${n.id}`} className="press block">
      {body}
    </Link>
  );
}
