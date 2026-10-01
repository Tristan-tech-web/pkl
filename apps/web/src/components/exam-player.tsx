"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Q = { id: string; kind: "mcq" | "multi" | "short" | "essay"; prompt: string; options: string[]; points: number };
type Phase = "loading" | "running" | "frozen" | "done" | "error";
type Native = { lock?: () => string; done?: () => void };
declare global {
  interface Window { EduSmartNative?: Native; edusmartReport?: (kind: string, detail?: unknown) => void }
}

async function api<T>(op: string, token: string, body: unknown = {}): Promise<T> {
  const r = await fetch(`/api/ujian/${op}`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error((j as { error?: string }).error ?? "gagal"), { status: r.status });
  return j as T;
}
const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function ExamPlayer() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [msg, setMsg] = useState("");
  const [title, setTitle] = useState("");
  const [qs, setQs] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [saved, setSaved] = useState<"ok" | "pending" | "error">("ok");
  const [warn, setWarn] = useState("");
  const [confirmEnd, setConfirmEnd] = useState(false);
  const token = useRef("");
  const offset = useRef(0);
  const deadline = useRef(0);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const native = typeof window !== "undefined" ? window.EduSmartNative : undefined;

  const submit = useCallback(async () => {
    try {
      await api("kumpul", token.current);
      setPhase("done");
    } catch (e) { setWarn((e as Error).message); }
  }, []);

  const report = useCallback(async (kind: string, detail?: unknown) => {
    if (!token.current) return;
    try {
      const r = await api<{ status: string; violations?: number; max?: number; on_violation?: string }>("peristiwa", token.current, { kind, detail });
      if (r.status === "dibekukan") setPhase("frozen");
      else if (r.violations) setWarn(`Pelanggaran tercatat (${r.violations}${r.max ? `/${r.max}` : ""}). Tetap di halaman ujian.`);
    } catch { /* jaringan: akan dicatat saat pulih */ }
  }, []);

  useEffect(() => {
    window.edusmartReport = (k, d) => { void report(k, d); };
    return () => { delete window.edusmartReport; };
  }, [report]);

  useEffect(() => {
    const m = /(?:^|[#&])t=([^&]+)/.exec(window.location.hash);
    let t = m ? decodeURIComponent(m[1]) : "";
    if (t) { try { sessionStorage.setItem("esx", t); } catch { /* abaikan */ } history.replaceState(null, "", window.location.pathname); }
    else { try { t = sessionStorage.getItem("esx") ?? ""; } catch { /* abaikan */ } }
    if (!t) { queueMicrotask(() => { setPhase("error"); setMsg("Ujian dibuka dari halaman Ujian di EduSmart."); }); return; }
    token.current = t;
    let lock: unknown = { secure: false };
    try { if (window.EduSmartNative?.lock) lock = JSON.parse(window.EduSmartNative.lock()); } catch { /* tidak terkunci */ }
    api<{ status: string; reason?: string; now: string; deadline_at: string; title: string; questions: Q[]; answers: Record<string, unknown> }>("main", t, { lock })
      .then((r) => {
        if (r.status === "dibekukan") { setPhase("frozen"); return; }
        offset.current = new Date(r.now).getTime() - Date.now();
        deadline.current = new Date(r.deadline_at).getTime();
        setTitle(r.title); setQs(r.questions); setAnswers(r.answers ?? {}); setPhase("running");
      })
      .catch((e: Error) => { setPhase("error"); setMsg(e.message); });
  }, []);

  // Timer berbasis jam server.
  useEffect(() => {
    if (phase !== "running") return;
    const tick = () => {
      const s = Math.max(0, Math.round((deadline.current - (Date.now() + offset.current)) / 1000));
      setLeft(s);
      if (s <= 0) void submit();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, submit]);

  // Pantau status (pembekuan/dilanjutkan pengawas) dan detak.
  useEffect(() => {
    if (phase !== "running" && phase !== "frozen") return;
    const id = setInterval(async () => {
      try {
        const r = await api<{ status: string; deadline_at: string; now: string }>("status", token.current);
        offset.current = new Date(r.now).getTime() - Date.now();
        if (r.status === "dibekukan") setPhase("frozen");
        else if (r.status === "berjalan") { deadline.current = new Date(r.deadline_at).getTime(); setPhase((p) => (p === "frozen" ? "running" : p)); }
        else if (r.status === "selesai") setPhase("done");
      } catch { /* abaikan */ }
    }, 8000);
    return () => clearInterval(id);
  }, [phase]);

  // Penjagaan di peramban (cadangan; aplikasi terkunci melaporkan sendiri lewat edusmartReport).
  useEffect(() => {
    if (phase !== "running") return;
    const onVis = () => { if (document.hidden) void report("keluar_fokus", { via: "web" }); };
    const onOff = () => void report("jaringan_putus");
    const onOn = () => void report("jaringan_pulih");
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("offline", onOff); window.addEventListener("online", onOn);
    document.addEventListener("copy", block); document.addEventListener("paste", block); document.addEventListener("contextmenu", block);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("offline", onOff); window.removeEventListener("online", onOn);
      document.removeEventListener("copy", block); document.removeEventListener("paste", block); document.removeEventListener("contextmenu", block);
    };
  }, [phase, report]);

  const save = useCallback((qid: string, value: unknown, delay = 0) => {
    setAnswers((a) => ({ ...a, [qid]: value }));
    setSaved("pending");
    clearTimeout(timers.current[qid]);
    timers.current[qid] = setTimeout(async () => {
      try { await api("simpan", token.current, { question: qid, answer: value }); setSaved("ok"); }
      catch (e) {
        if ((e as Error & { status?: number }).status === 401) { setPhase("error"); setMsg("Sesi ujian berakhir."); }
        else setSaved("error");
      }
    }, delay);
  }, []);

  const q = qs[idx];
  const answered = useMemo(() => qs.map((x) => { const a = answers[x.id]; return a !== undefined && a !== null && a !== "" && !(Array.isArray(a) && a.length === 0); }), [qs, answers]);
  const remaining = answered.filter((x) => !x).length;

  if (phase === "loading") return <Shell><p role="status" className="text-center text-ink-soft">Menyiapkan ujian…</p></Shell>;
  if (phase === "error") return <Shell><div role="alert" className="rounded-[6px] border border-bad/40 bg-card p-6 text-center"><h1 className="font-display text-2xl font-bold">Ujian tidak bisa dibuka</h1><p className="mt-2 text-ink-soft">{msg}</p></div></Shell>;
  if (phase === "done") return (
    <Shell>
      <div className="rounded-[6px] border border-ok/40 bg-card p-8 text-center">
        <h1 className="font-display text-3xl font-bold">Jawabanmu sudah terkumpul</h1>
        <p className="mt-2 text-ink-soft">Terima kasih. Nilai akan diumumkan oleh gurumu.</p>
        <button type="button" className="mt-6 min-h-11 rounded-[6px] bg-pen px-6 font-semibold text-on-pen" onClick={() => { try { sessionStorage.removeItem("esx"); } catch { /* abaikan */ } if (native?.done) native.done(); else router.push("/dashboard"); }}>Selesai</button>
      </div>
    </Shell>
  );
  if (phase === "frozen") return (
    <Shell>
      <div role="alert" className="rounded-[6px] border border-bad/50 bg-card p-8 text-center">
        <h1 className="font-display text-3xl font-bold text-bad">Ujian dibekukan</h1>
        <p className="mt-2 text-ink-soft">Ada pelanggaran aturan ujian. Angkat tangan dan hubungi pengawas; ujian dilanjutkan setelah pengawas mengizinkan. Jawabanmu aman.</p>
      </div>
    </Shell>
  );

  return (
    <Shell wide>
      <header className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3">
        <h1 className="truncate font-display text-lg font-bold">{title}</h1>
        <div className="flex items-center gap-3">
          <span role="status" aria-live="polite" className="text-xs text-ink-soft">{saved === "ok" ? "Tersimpan" : saved === "pending" ? "Menyimpan…" : "Gagal menyimpan, mencoba lagi"}</span>
          <span className={`num rounded-[6px] border px-3 py-1 font-bold ${left < 300 ? "border-bad text-bad" : "border-line"}`} aria-label="Sisa waktu" role="timer">{fmt(left)}</span>
        </div>
      </header>
      {warn ? <p role="alert" className="mb-3 rounded-[6px] border border-warn/50 p-3 text-sm">{warn}</p> : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        <section aria-label={`Soal ${idx + 1} dari ${qs.length}`} className="rounded-[6px] border border-line bg-card p-5">
          <p className="text-sm text-ink-soft">Soal {idx + 1} dari {qs.length} · {q.points} poin</p>
          <p className="mt-2 whitespace-pre-wrap text-lg font-semibold">{q.prompt}</p>
          <div className="mt-4 space-y-2">
            {q.kind === "mcq" && q.options.map((o, i) => (
              <label key={i} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[6px] border border-line px-3 has-[:checked]:border-pen has-[:checked]:bg-pen/10">
                <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => save(q.id, i)} className="size-4" /> {o}
              </label>
            ))}
            {q.kind === "multi" && q.options.map((o, i) => {
              const cur = (Array.isArray(answers[q.id]) ? (answers[q.id] as number[]) : []);
              return (
                <label key={i} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[6px] border border-line px-3 has-[:checked]:border-pen has-[:checked]:bg-pen/10">
                  <input type="checkbox" checked={cur.includes(i)} onChange={(e) => save(q.id, e.target.checked ? [...cur, i].sort() : cur.filter((x) => x !== i))} className="size-4" /> {o}
                </label>
              );
            })}
            {q.kind === "short" && <input value={String(answers[q.id] ?? "")} onChange={(e) => save(q.id, e.target.value, 500)} aria-label="Jawaban" className="min-h-11 w-full rounded-[6px] border border-line bg-paper px-3" autoComplete="off" />}
            {q.kind === "essay" && <textarea value={String(answers[q.id] ?? "")} onChange={(e) => save(q.id, e.target.value, 700)} rows={9} aria-label="Jawaban uraian" className="w-full rounded-[6px] border border-line bg-paper p-3" />}
          </div>
          <div className="mt-6 flex justify-between gap-3">
            <button type="button" className="min-h-11 rounded-[6px] border border-line px-4 font-semibold disabled:opacity-40" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Sebelumnya</button>
            {idx < qs.length - 1
              ? <button type="button" className="min-h-11 rounded-[6px] bg-pen px-4 font-semibold text-on-pen" onClick={() => setIdx(idx + 1)}>Berikutnya</button>
              : <button type="button" className="min-h-11 rounded-[6px] bg-pen px-4 font-semibold text-on-pen" onClick={() => setConfirmEnd(true)}>Kumpulkan</button>}
          </div>
        </section>
        <aside aria-label="Navigasi soal" className="rounded-[6px] border border-line bg-card p-4">
          <div className="grid grid-cols-5 gap-2">
            {qs.map((x, i) => (
              <button key={x.id} type="button" onClick={() => setIdx(i)} aria-label={`Soal ${i + 1}${answered[i] ? ", terjawab" : ", belum dijawab"}`} aria-current={i === idx}
                className={`num min-h-11 rounded-[6px] border font-semibold ${i === idx ? "border-pen bg-pen text-on-pen" : answered[i] ? "border-ok/60 bg-ok/10" : "border-line"}`}>{i + 1}</button>
            ))}
          </div>
          <button type="button" className="mt-4 min-h-11 w-full rounded-[6px] border border-pen font-semibold text-pen" onClick={() => setConfirmEnd(true)}>Kumpulkan ujian</button>
        </aside>
      </div>
      {confirmEnd ? (
        <div role="dialog" aria-modal="true" aria-label="Konfirmasi kumpulkan" className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-[6px] bg-card p-6">
            <h2 className="font-display text-xl font-bold">Kumpulkan sekarang?</h2>
            <p className="mt-2 text-ink-soft">{remaining > 0 ? `${remaining} soal belum dijawab. ` : "Semua soal sudah dijawab. "}Setelah dikumpulkan, jawaban tidak bisa diubah.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="min-h-11 rounded-[6px] border border-line px-4 font-semibold" onClick={() => setConfirmEnd(false)}>Kembali</button>
              <button type="button" className="min-h-11 rounded-[6px] bg-pen px-4 font-semibold text-on-pen" onClick={() => void submit()}>Ya, kumpulkan</button>
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return <main id="isi" className={`mx-auto min-h-dvh w-full px-4 py-6 ${wide ? "max-w-5xl" : "max-w-xl"}`}>{children}</main>;
}
