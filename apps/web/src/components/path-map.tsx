import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { Stars } from "@/components/stars";
import type { MapNode } from "@/lib/learning";
import { Mascot } from "@/components/three/mascot";
import { Road } from "@/components/island/road";
import { Scenery, BIOMES, hash } from "@/components/island/scenery";

const ICON: Record<string, string> = { materi: "📖", persiapan: "🌱", latihan: "💪", ulang: "🔁", checkpoint: "🚩", boss: "👾", proyek: "🛠️", cerita: "📚" };
const KIND_LABEL: Record<string, string> = { materi: "Materi", persiapan: "Persiapan", latihan: "Latihan", ulang: "Ulang", checkpoint: "Checkpoint", boss: "Tantangan", proyek: "Proyek", cerita: "Cerita" };
// Pergeseran kiri-kanan membentuk jalur berkelok (satuan: persen dari lebar jalur).
const WAVE = [0, 14, 22, 14, 0, -14, -22, -14];

// Tiap mata pelajaran punya wilayah sendiri supaya murid hafal "ini daerah Matematika"; yang tak dikenali bergilir.
const REGION: [RegExp, (typeof BIOMES)[number]][] = [
  [/pplg|informatika|komputer|program|tik|rpl|tkj/i, "padang"],
  [/\bmat|statistik|aljabar|geometri/i, "gunung"],
  [/ipa|fisika|kimia|biologi|sains|alam/i, "hutan"],
  [/bahasa|indo|ing|arab|jawa|sastra|seni|musik/i, "pantai"],
];
const biomeFor = (subject: string, seed: number) => REGION.find(([re]) => re.test(subject))?.[1] ?? BIOMES[seed % BIOMES.length];

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
      <span className={cls} aria-hidden="true" data-node data-state={n.state === "selesai" ? "done" : current ? "now" : locked ? "lock" : "open"}>
        <span className="path-node-face">{n.state === "selesai" ? "✓" : locked ? (n.state === "dijadwalkan" ? "⏳" : "🔒") : ICON[n.kind] ?? "📖"}</span>
      </span>
      <span className="path-caption">
      <span className="block max-w-[9rem] break-words text-center text-sm font-bold leading-tight">{n.title}</span>
      <span className="num block text-center text-xs text-ink-soft">{KIND_LABEL[n.kind] ?? "Materi"}{!locked && n.state !== "selesai" ? ` · +${n.xpReward} XP` : ""}</span>
      {n.state === "selesai" ? <span className="mt-0.5 flex justify-center"><Stars n={n.stars} /></span> : null}
      {n.state === "dijadwalkan" && n.opensAt && !preview ? (
        <span className="mt-1 block text-center text-xs font-semibold text-ink-soft">Terbuka {when(n.opensAt)}<br /><Countdown until={n.opensAt} className="num" /></span>
      ) : null}
      {n.state === "terkunci" && !preview ? <span className="mt-0.5 block text-center text-xs text-ink-soft">Selesaikan materi sebelumnya</span> : null}
      </span>
      {current ? <span className="path-here" aria-hidden="true">MULAI</span> : null}
    </>
  );
  const style = { marginLeft: `${Math.max(0, offset * 2)}%`, marginRight: `${Math.max(0, -offset * 2)}%` } as React.CSSProperties;
  return (
    <li className="relative flex justify-center py-3" style={style}>
      {current ? <Mascot size={92} className={`path-pena ${offset > 0 ? "left-[calc(50%-9rem)]" : "left-[calc(50%+4rem)]"}`} /> : null}
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
    <div className="mx-auto max-w-md space-y-6">
      {groups.map((g, gi) => {
        const biome = biomeFor(g.nodes[0]?.subjectName ?? "", hash(g.key) + gi);
        return (
          <section key={g.key} aria-label={g.title ?? "Materi"} className="biome" data-biome={biome}>
            {g.title ? (
              <div className="path-banner biome-banner">
                <p className="text-xs font-bold uppercase tracking-[0.1em] opacity-80">Unit</p>
                <h3 className="font-display text-xl font-extrabold leading-tight">{g.title}</h3>
              </div>
            ) : null}
            <Scenery biome={biome} seed={hash(g.key) + gi} slots={g.nodes.length} />
            <Road>
              <ol className="relative mt-3">
                {g.nodes.map((n) => <Node key={n.id} n={n} schoolId={schoolId} offset={WAVE[idx++ % WAVE.length]} current={n.id === currentId && !preview} preview={preview} />)}
              </ol>
            </Road>
          </section>
        );
      })}
    </div>
  );
}
