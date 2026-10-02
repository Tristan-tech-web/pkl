import "./island/island.css";

const LETTER = ["A", "B", "C", "D", "E", "F"];
const YES = ["Benar!", "Mantap.", "Tepat sekali.", "Nah, begitu.", "Betul!"];
const NO = ["Belum tepat. Tidak apa-apa.", "Hampir! Lihat penjelasannya.", "Yang ini memang licin.", "Belum pas. Ini jawabannya."];

export type QuestionViewProps = {
  index: number; total: number; xp: number;
  stem: string; options: string[];
  picked: number | null; answer: number | null; correct: boolean | null;
  gain?: number; explanation?: string | null; notes?: string[];
  busy?: boolean; reported?: boolean;
  nextLabel: string;
  onPick: (i: number) => void; onNext: () => void; onReport?: () => void;
};

/** Jalan setapak kecil: satu titik per soal. Yang sudah dilewati hijau, yang sedang dikerjakan berdenyut, ujungnya bendera. */
function Trail({ index, total, answered }: { index: number; total: number; answered: boolean }) {
  const done = index - 1 + (answered ? 1 : 0);
  return (
    <ol className="qv-trail" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-label={`Soal ${index} dari ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <li key={i} className={i < done ? "done" : i === index - 1 ? "now" : ""} aria-hidden="true">{i < done ? "✓" : ""}</li>
      ))}
      <li className="flag" aria-hidden="true">🏁</li>
    </ol>
  );
}

export function QuestionView(p: QuestionViewProps) {
  const answered = p.correct !== null;
  const yes = YES[(p.index + (p.gain ?? 0)) % YES.length], no = NO[p.index % NO.length];
  return (
    <div className="qv">
      <div className="qv-top">
        <span className="num qv-count">Soal {p.index} dari {p.total}</span>
        <span key={p.xp} className="num qv-xp xp-chip">⭐ {p.xp} XP</span>
      </div>
      <Trail index={p.index} total={p.total} answered={answered} />
      <h2 className="qv-stem">{p.stem}</h2>
      <ul className="qv-opts">
        {p.options.map((o, i) => {
          const isAns = answered && i === p.answer, isWrong = answered && p.picked === i && !p.correct;
          return (
            <li key={i}>
              <button type="button" disabled={p.picked !== null} onClick={() => p.onPick(i)} aria-pressed={p.picked === i}
                className={`qv-opt press ${isAns ? "ok" : isWrong ? "no" : p.picked === i ? "sel" : ""} ${answered && !isAns && !isWrong ? "dim" : ""}`}>
                <span className="qv-letter num">{LETTER[i]}</span>
                <span className="qv-text">{o}</span>
                {isAns ? <span aria-hidden="true" className="qv-mark">✓</span> : isWrong ? <span aria-hidden="true" className="qv-mark">✗</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
      {answered ? (
        <aside aria-live="polite" className={`qv-fb ${p.correct ? "ok" : "no"}`}>
          {p.correct && (p.gain ?? 0) > 0 ? <span className="qv-gain num" aria-hidden="true">+{p.gain} XP</span> : null}
          <p className="qv-head"><span aria-hidden="true">{p.correct ? "🎉" : "💡"}</span> {p.correct ? ((p.gain ?? 0) > 0 ? `${yes} +${p.gain} XP` : yes) : no}</p>
          {p.explanation ? <p className="qv-expl">{p.explanation}</p> : null}
          {(p.notes ?? []).map((n) => <p key={n} className="qv-note">{n}</p>)}
          <div className="qv-actions">
            <button type="button" onClick={p.onNext} disabled={p.busy} className="btn-solid qv-next">{p.nextLabel}</button>
            {p.onReport ? <button type="button" disabled={p.reported} onClick={p.onReport} className="text-sm underline">{p.reported ? "Terima kasih, dilaporkan" : "Soal ini salah?"}</button> : null}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
