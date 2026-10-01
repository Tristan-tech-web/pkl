import Link from "next/link";
import { BackLink } from "@/components/role-views";
import { PathMap } from "@/components/path-map";
import { StudentStats } from "@/components/student-stats";
import { Mascot } from "@/components/three/mascot";
import { loadMap, loadStats, type MapNode } from "@/lib/learning";
import { getSchoolContext } from "@/lib/school";

export const metadata = { title: "Peta belajar · EduSmart" };

export default async function BelajarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, me } = await getSchoolContext(id);
  const isStudent = me.roleCode === "student";
  const [nodes, stats] = await Promise.all([loadMap(supabase, id, me.memberId, { ignoreSchedule: !isStudent }), loadStats(supabase, id, me.memberId)]);
  const bySubject = new Map<string, MapNode[]>();
  for (const n of nodes) bySubject.set(n.subjectName, [...(bySubject.get(n.subjectName) ?? []), n]);
  const next = nodes.find((n) => n.state === "tersedia");
  const soon = nodes.filter((n) => n.state === "dijadwalkan" && n.opensAt).sort((a, b) => (a.opensAt! < b.opensAt! ? -1 : 1))[0];

  return (
    <>
      <BackLink />
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Peta belajar</h1>
        <p className="mt-1 text-ink-soft">
          {isStudent ? "Ikuti jalurnya satu per satu. Persiapan terbuka sehari sebelum pelajaran supaya otakmu sudah \"panas\" saat guru mulai." : "Pratinjau jalur seperti yang dilihat murid. Semua simpul terbuka untuk Anda."}
        </p>
      </header>
      {isStudent ? <StudentStats stats={stats} /> : null}
      {isStudent && next ? (
        <Link href={`/dashboard/sekolah/${id}/belajar/${next.id}`} className="press surface mt-4 flex items-center justify-between gap-3 border-2 !border-pen p-4">
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-pen">Lanjutkan</span>
            <span className="block text-lg font-bold">{next.title}</span>
            <span className="num block text-sm text-ink-soft">{next.subjectName} · +{next.xpReward} XP{next.minutes ? ` · ±${next.minutes} menit` : ""}</span>
          </span>
          <Mascot size={84} className="shrink-0" />
        </Link>
      ) : isStudent && soon ? (
        <p className="surface mt-4 p-4 text-ink-soft">Belum ada yang terbuka sekarang. Berikutnya: <span className="font-bold text-ink">{soon.title}</span>, terbuka sebelum pelajaran {soon.subjectName}.</p>
      ) : null}
      {nodes.length === 0 ? <p className="mt-8 rounded-box border border-dashed border-line p-6 text-ink-soft">Belum ada materi yang terbit.</p> : null}
      {[...bySubject.entries()].map(([subject, list]) => (
        <section key={subject} className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">{subject}</h2>
          <div className="mt-4"><PathMap nodes={list} schoolId={id} preview={!isStudent} /></div>
        </section>
      ))}
    </>
  );
}
