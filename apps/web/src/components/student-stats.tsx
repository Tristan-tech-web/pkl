import { loadStats } from "@/lib/learning";

export async function StudentStats({ stats }: { stats: Awaited<ReturnType<typeof loadStats>> }) {
  const pct = Math.min(100, Math.round((stats.into / stats.need) * 100));
  return (
    <section aria-label="Kemajuanmu" className="rounded-[6px] border border-line bg-card p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Level</p>
          <p className="num font-display text-4xl font-bold leading-none">{stats.level}</p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">XP</p>
            <p className="num text-xl font-bold">{stats.xp}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Beruntun</p>
            <p className="num text-xl font-bold">{stats.streak} hari</p>
          </div>
        </div>
      </div>
      <div className="mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={stats.need} aria-valuenow={stats.into} aria-label="XP menuju level berikutnya">
        <div className="h-2.5 overflow-hidden rounded-full border border-line bg-paper">
          <div className="h-full rounded-full bg-pen" style={{ width: `${pct}%` }} />
        </div>
        <p className="num mt-1 text-sm text-ink-soft">
          {stats.into} / {stats.need} XP menuju level {stats.level + 1}
        </p>
      </div>
    </section>
  );
}
