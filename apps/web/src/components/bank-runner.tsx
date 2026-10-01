"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { advanceBank } from "@/app/dashboard/sekolah/[id]/bank/actions";
import { Button } from "@/components/ui";

// Menjalankan pembuatan bank soal bertahap dari browser (satu putaran per panggilan; boleh dijeda).
export function BankRunner({ schoolId, jobId, startPct, startLabel }: { schoolId: string; jobId: string; startPct: number; startLabel: string }) {
  const router = useRouter();
  const [pct, setPct] = useState(startPct);
  const [label, setLabel] = useState(startLabel);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [, start] = useTransition();
  const stop = useRef(false);

  async function run() {
    setRunning(true); setError(null); stop.current = false;
    let fails = 0;
    for (;;) {
      if (stop.current) break;
      const r = await advanceBank(schoolId, jobId);
      if (!r.ok) {
        if (++fails < 6) { setLabel(`Menunggu AI, mencoba lagi (${fails}/5)…`); await new Promise((res) => setTimeout(res, 6000 * fails)); continue; }
        setError(r.error); break;
      }
      fails = 0; setPct(r.pct); setLabel(r.label);
      if (r.done) { start(() => router.refresh()); break; }
    }
    setRunning(false);
  }

  return (
    <div className="surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={run} disabled={running || pct >= 100}>{running ? "Sedang membuat soal…" : pct >= 100 ? "Selesai" : pct > 0 ? "Lanjutkan" : "Mulai buat soal"}</Button>
        {running ? <Button type="button" variant="ghost" onClick={() => { stop.current = true; }}>Jeda</Button> : null}
        <span role="status" aria-live="polite" className="text-sm text-ink-soft">{label}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan">
        <div className="h-full bg-pen transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      {error ? <p role="alert" className="mt-3 rounded-box border border-bad/40 p-3 text-sm text-bad">{error}</p> : null}
    </div>
  );
}
