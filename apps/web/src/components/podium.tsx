import "./island/island.css";

type Row = { rank: number; label: string; xp: number; is_me: boolean };
const MEDAL = ["", "🥇", "🥈", "🥉"];

/** Podium tiga teratas; slot kosong tetap tampak supaya liga terasa sedang menunggu temanmu. */
export function Podium({ rows, staff }: { rows: Row[]; staff: boolean }) {
  const by = (n: number) => rows.find((r) => r.rank === n) ?? rows[n - 1];
  const slots = [by(2), by(1), by(3)];
  const order = [2, 1, 3];
  const me = rows.find((r) => r.is_me);
  const above = me ? [...rows].filter((r) => Number(r.xp) > Number(me.xp)).sort((a, b) => Number(a.xp) - Number(b.xp))[0] : null;
  const gap = me && above ? Number(above.xp) - Number(me.xp) + 1 : 0;
  const note = staff ? null : !me ? "Kumpulkan XP pekan ini untuk masuk daftar." : me.rank === 1 ? (rows.length > 1 ? "Kamu di puncak pekan ini. Pertahankan." : "Kamu sendirian di puncak. Ajak temanmu berlatih supaya ramai.") : `Tinggal ${gap} XP untuk menyalip ${above?.label ?? "peringkat di atasmu"}.`;
  return (
    <section aria-label="Tiga teratas" className="podium-wrap">
      <ol className="podium">
        {slots.map((r, i) => (
          <li key={order[i]} className={`podium-col r${order[i]} ${r ? "" : "empty"} ${r?.is_me ? "me" : ""}`}>
            {r ? (
              <>
                <span className="podium-avatar" aria-hidden="true">{r.label.trim()[0]?.toUpperCase() ?? "?"}{order[i] === 1 ? <i className="podium-crown">👑</i> : null}</span>
                <span className="podium-name">{r.label}{r.is_me ? " (kamu)" : ""}</span>
                <span className="podium-xp num">{Number(r.xp)} XP</span>
              </>
            ) : (
              <>
                <span className="podium-avatar" aria-hidden="true">?</span>
                <span className="podium-name">Masih kosong</span>
              </>
            )}
            <span className="podium-step" aria-hidden="true"><b>{MEDAL[order[i]]}</b></span>
          </li>
        ))}
      </ol>
      {note ? <p className="podium-note">{note}</p> : null}
    </section>
  );
}
