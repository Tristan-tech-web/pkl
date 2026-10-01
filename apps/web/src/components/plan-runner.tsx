"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { advancePlan } from "@/app/dashboard/sekolah/[id]/rencana/actions";
import { Button } from "@/components/ui";

// Menjalankan analisis bertahap dari browser: tiap langkah satu panggilan pendek, kemajuan tersimpan di server.
export function PlanRunner({ schoolId, planId }: { schoolId: string; planId: string }) {
  const router = useRouter();
  const [pct, setPct] = useState(0);
  const [label, setLabel] = useState("Belum mulai");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [, start] = useTransition();
  const stop = useRef(false);

  async function run() {
    setRunning(true); setError(null); stop.current = false;
    let fails = 0;
    for (;;) {
      if (stop.current) break;
      const r = await advancePlan(schoolId, planId);
      if (!r.ok) {
        // Batas laju atau gangguan sesaat: tunggu lalu coba lagi sebelum menyerah.
        if (++fails < 5) { setLabel(`Menunggu AI, mencoba lagi (${fails}/4)…`); await new Promise((res) => setTimeout(res, 8000 * fails)); continue; }
        setError(r.error); break;
      }
      fails = 0;
      setPct(r.pct); setLabel(r.label);
      if (r.done) { start(() => router.refresh()); break; }
    }
    setRunning(false);
  }

  return (
    <div className="rounded-[6px] border border-line bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={run} disabled={running}>{running ? "Sedang menganalisis…" : pct > 0 || error ? "Lanjutkan" : "Mulai analisis"}</Button>
        {running ? <Button type="button" variant="ghost" onClick={() => { stop.current = true; }}>Jeda</Button> : null}
        <span role="status" aria-live="polite" className="text-sm text-ink-soft">{label}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan analisis">
        <div className="h-full bg-pen transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      {error ? <p role="alert" className="mt-3 rounded-[6px] border border-bad/40 p-3 text-sm text-bad">{error}</p> : null}
    </div>
  );
}
