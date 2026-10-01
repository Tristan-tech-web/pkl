import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { Stars } from "@/components/stars";
import type { MapNode } from "@/lib/learning";

const ICON: Record<string, string> = { materi: "📖", persiapan: "🌱", latihan: "💪", ulang: "🔁", checkpoint: "🚩", boss: "👾", proyek: "🛠️", cerita: "📚" };
const KIND_LABEL: Record<string, string> = { materi: "Materi", persiapan: "Persiapan", latihan: "Latihan", ulang: "Ulang", checkpoint: "Checkpoint", boss: "Tantangan", proyek: "Proyek", cerita: "Cerita" };
// Pergeseran kiri-kanan membentuk jalur berkelok (satuan: persen dari lebar jalur).
const WAVE = [0, 18, 28, 18, 0, -18, -28, -18];

type Group = { key: string; title: string | null; position: number; nodes: MapNode[] };

export function groupByUnit(nodes: MapNode[]): Group[] {
  const g = new Map<string, Group>();
  for (const n of nodes) {
    const key = n.unitId ?? "_";
    if (!g.has(key)) g.set(key, { key, title: n.unitTitle, position: n.unitPosition, nodes: [] });
    g.get(key)!.nodes.push(n);
  }
  const list = [...g.values()].sort((a, b) => a.position - b.position);
  for (const x of list) x.nodes.sort((a, b) => a.position - b.position);
  return list;
}

const when = (iso: string) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function Node({ n, schoolId, offset, current, preview }: { n: MapNode; schoolId: string; offset: number; current: boolean; preview: boolean }) {
  const locked = !preview && (n.state === "terkunci" || n.state === "dijadwalkan");
  const big = n.kind === "boss" || n.kind === "checkpoint";
  const cls = `path-node ${big ? "path-node-big" : ""} ${n.state === "selesai" ? "is-done" : locked ? "is-locked" : "is-open"} ${current ? "is-current" : ""}`;
  const inner = (
    <>
      <span className={cls} aria-hidden="true">
        <span className="path-node-face">{n.state === "selesai" ? "✓" : locked ? (n.state === "dijadwalkan" ? "⏳" : "🔒") : ICON[n.kind] ?? "📖"}</span>
      </span>
      <span className="mt-2 block max-w-[11rem] text-center text-sm font-bold leading-tight">{n.title}</span>
      <span className="num block text-center text-xs text-ink-soft">{KIND_LABEL[n.kind] ?? "Materi"}{!locked && n.state !== "selesai" ? ` · +${n.xpReward} XP` : ""}</span>
      {n.state === "selesai" ? <span className="mt-0.5 flex justify-center"><Stars n={n.stars} /></span> : null}
      {n.state === "dijadwalkan" && n.opensAt && !preview ? (
        <span className="mt-1 block text-center text-xs font-semibold text-ink-soft">Terbuka {when(n.opensAt)}<br /><Countdown until={n.opensAt} className="num" /></span>
      ) : null}
      {n.state === "terkunci" && !preview ? <span className="mt-0.5 block text-center text-xs text-ink-soft">Selesaikan materi sebelumnya</span> : null}
      {current ? <span className="path-here" aria-hidden="true">MULAI</span> : null}
    </>
  );
  const style = { transform: `translateX(${offset}%)` } as React.CSSProperties;
  return (
    <li className="relative flex justify-center py-3" style={style}>
      {locked ? (
        <div className="relative flex flex-col items-center opacity-90" aria-disabled="true" aria-label={`${n.title}, terkunci`}>{inner}</div>
      ) : (
        <Link href={`/dashboard/sekolah/${schoolId}/belajar/${n.id}`} className="relative flex flex-col items-center" aria-label={`${n.title}${current ? ", lanjutkan di sini" : ""}`}>{inner}</Link>
      )}
    </li>
  );
}

/** Jalur belajar per mata pelajaran: unit → simpul berkelok, status terlihat dari jauh. `preview` = tampilan guru (semua terbuka). */
export function PathMap({ nodes, schoolId, preview = false }: { nodes: MapNode[]; schoolId: string; preview?: boolean }) {
  const groups = groupByUnit(nodes);
  const currentId = nodes.find((n) => n.state === "tersedia")?.id;
  let idx = 0;
  return (
    <div className="mx-auto max-w-md space-y-8">
      {groups.map((g) => (
        <section key={g.key} aria-label={g.title ?? "Materi"}>
          {g.title ? (
            <div className="path-banner">
              <p className="text-xs font-bold uppercase tracking-[0.1em] opacity-80">Unit</p>
              <h3 className="font-display text-xl font-extrabold leading-tight">{g.title}</h3>
            </div>
          ) : null}
          <ol className="relative mt-3">
            {g.nodes.map((n) => <Node key={n.id} n={n} schoolId={schoolId} offset={WAVE[idx++ % WAVE.length]} current={n.id === currentId && !preview} preview={preview} />)}
          </ol>
        </section>
      ))}
    </div>
  );
}
