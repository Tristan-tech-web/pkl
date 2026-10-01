"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { generateTreeChapter } from "@/app/dashboard/sekolah/[id]/skilltree/actions";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";

type ClassOpt = { id: string; name: string };

// Menyusun skill tree bab demi bab dari browser; tiap bab satu panggilan pendek, boleh dijeda dan dilanjutkan.
export function TreeRunner({ schoolId, planId, chapters, classes }: { schoolId: string; planId: string; chapters: number; classes: ClassOpt[] }) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [start, setStart] = useState(() => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10));
  const [holidays, setHolidays] = useState("");
  const [pct, setPct] = useState(0);
  const [label, setLabel] = useState("Belum mulai");
  const [warn, setWarn] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [, startT] = useTransition();
  const next = useRef(0);
  const stop = useRef(false);

  async function run(fromStart: boolean) {
    if (fromStart) next.current = 0;
    setRunning(true); setError(null); stop.current = false;
    let fails = 0;
    while (next.current <= chapters) {
      if (stop.current) break;
      const r = await generateTreeChapter(schoolId, planId, { classId, start, holidays }, next.current);
      if (!r.ok) {
        if (/Jadwal|jadwal|terbit|Tanggal|Rencana/.test(r.error) || ++fails >= 5) { setError(r.error); break; }
        setLabel(`Menunggu AI, mencoba lagi (${fails}/4)…`); await new Promise((res) => setTimeout(res, 8000 * fails)); continue;
      }
      fails = 0; next.current += 1;
      setPct(r.pct); setLabel(r.label); if (r.warnings?.length) setWarn(r.warnings);
      if (r.done) { startT(() => router.refresh()); break; }
    }
    setRunning(false);
  }

  return (
    <div className="surface p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label><Label>Rombel</Label><Select value={classId} onChange={(e) => setClassId(e.target.value)} disabled={running}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></label>
        <label><Label hint="Pertemuan pertama mapel ini">Tanggal mulai semester</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} disabled={running} /></label>
        <label className="sm:col-span-2"><Label hint="Format 2026-12-25, pisahkan dengan koma atau baris baru. Pertemuan di tanggal ini dilewati.">Tanggal libur</Label><Textarea rows={2} value={holidays} onChange={(e) => setHolidays(e.target.value)} disabled={running} /></label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => run(next.current === 0 || pct >= 100)} disabled={running || !classId || !start}>{running ? "Sedang menyusun…" : pct > 0 && pct < 100 ? "Lanjutkan" : "Susun skill tree"}</Button>
        {running ? <Button type="button" variant="ghost" onClick={() => { stop.current = true; }}>Jeda</Button> : null}
        <span role="status" aria-live="polite" className="text-sm text-ink-soft">{label}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan">
        <div className="h-full bg-pen transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      {warn.map((w, i) => <p key={i} className="mt-2 rounded-box border border-warn/40 p-3 text-sm">{w}</p>)}
      {error ? <p role="alert" className="mt-3 rounded-box border border-bad/40 p-3 text-sm text-bad">{error}</p> : null}
    </div>
  );
}
