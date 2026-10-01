import { FloatField } from "@/components/three/float-field";
import { Mascot } from "@/components/three/mascot";
import { loadStats } from "@/lib/learning";

// Sapaan murid: latar benda 3D melayang + maskot. Pada gaya Ringkas/3D mati, hanya latar warna dan maskot SVG.
export async function StudentHero({ name, stats }: { name: string; stats: Awaited<ReturnType<typeof loadStats>> }) {
  return (
    <section aria-label="Sapaan" className="surface relative isolate mb-6 overflow-hidden p-5 sm:p-7">
      <FloatField className="opacity-90" />
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">Ayo belajar</p>
          <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">Halo, {name}!</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="num rounded-btn bg-card/90 px-3 py-1 text-sm font-bold ring-1 ring-line">⭐ {stats.xp} XP</span>
            <span className="num rounded-btn bg-card/90 px-3 py-1 text-sm font-bold ring-1 ring-line">🔥 {stats.streak} hari</span>
            <span className="num rounded-btn bg-card/90 px-3 py-1 text-sm font-bold ring-1 ring-line">Level {stats.level}</span>
          </div>
        </div>
        <Mascot size={150} className="shrink-0" />
      </div>
    </section>
  );
}
