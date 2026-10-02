"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { appealCase, practiceAnswer, practiceNext, reportItem, type Answered, type Integrity, type Next, type PracticeItem } from "@/app/dashboard/sekolah/[id]/latihan/actions";
import { FaceGuard, type FaceHandle } from "@/components/face-guard";
import { Mascot } from "@/components/three/mascot";

const FLAG_TEXT: Record<string, string> = {
  terlalu_cepat: "Terlalu cepat, baca soalnya dulu ya. XP tidak dihitung.",
  ulang_cepat: "Soal ini baru saja kamu kuasai, jadi XP-nya berkurang.",
  belum_waktunya: "Belum waktunya diulang, XP berkurang.",
  batas_harian: "Batas XP latihan hari ini sudah tercapai. Lanjut besok!",
  bangkit: "Bangkit! Dulu salah, sekarang benar. Bonus XP!",
};
const LETTER = ["A", "B", "C", "D", "E", "F"];

export function PracticeRunner({ schoolId, sessionId, backHref, initial, camera }: { schoolId: string; sessionId: string; backHref: string; initial: Next; camera: boolean }) {
  const first = initial.ok ? initial : null;
  const [item, setItem] = useState<PracticeItem | null>(first?.item ?? null);
  const [index, setIndex] = useState(first?.index ?? 1);
  const [total, setTotal] = useState(first?.total ?? 10);
  const [xp, setXp] = useState(first?.xp ?? 0);
  const [picked, setPicked] = useState<number | null>(null);
  const [res, setRes] = useState<Extract<Answered, { ok: true }> | null>(null);
  const [finished, setFinished] = useState(first?.done ?? false);
  const [error, setError] = useState<string | null>(initial.ok ? null : initial.error);
  const [busy, setBusy] = useState(false);
  const [reported, setReported] = useState(false);
  const blurs = useRef(0);
  const face = useRef<FaceHandle | null>(null);
  const [camOn, setCamOn] = useState<boolean | null>(camera ? null : false);
  const [integrity, setIntegrity] = useState<Integrity>(initial.ok ? (initial.integrity ?? null) : null);
  const [appeal, setAppeal] = useState("");
  const [appealState, setAppealState] = useState<"" | "kirim" | "terkirim" | string>("");

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") blurs.current += 1; };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  async function load() {
    setBusy(true); setError(null); setPicked(null); setRes(null); setItem(null); setReported(false); blurs.current = 0;
    const r = await practiceNext(schoolId, sessionId);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setTotal(r.total); setXp(r.xp);
    if (r.integrity) setIntegrity(r.integrity);
    if (r.done) { setFinished(true); setItem(null); return; }
    setItem(r.item ?? null); setIndex(r.index ?? 1);
  }

  async function choose(i: number) {
    if (!item || picked !== null || busy) return;
    setPicked(i); setBusy(true);
    const r = await practiceAnswer(schoolId, sessionId, item.id, i, { blurs: blurs.current, cam: face.current?.drain() });
    setBusy(false);
    if (!r.ok) { setError(r.error); setPicked(null); return; }
    setRes(r); setXp(r.sessionXp); if (r.integrity) setIntegrity(r.integrity);
    if (r.correct && r.xp > 0) window.dispatchEvent(new Event("edusmart:reward"));
  }

  async function sendAppeal() {
    if (!integrity?.case_id) return;
    setAppealState("kirim");
    const r = await appealCase(schoolId, integrity.case_id, appeal);
    setAppealState(r.ok ? "terkirim" : (r.error ?? "Gagal"));
  }

  if (finished) {
    const held = integrity && integrity.level !== "rendah";
    return (
      <div className="surface p-6 text-center">
        {held ? <p className="text-5xl" aria-hidden>🔎</p> : <div className="flex justify-center"><Mascot size={150} /></div>}
        <h2 className="mt-2 font-display text-2xl font-bold">Sesi selesai!</h2>
        {held ? (
          <div className="mt-2 text-left">
            <p className="font-bold">{integrity.level === "tinggi" ? "XP sesi ini dibatalkan." : "XP sesi ini sedang dicek guru."}</p>
            <p className="mt-1 text-sm text-ink-soft">Cara kamu menjawab tadi agak tidak biasa, misalnya terlalu cepat atau sering pindah halaman. Itu cuma dugaan komputer, belum tentu kamu salah. Kalau memang keliru, ceritakan di bawah. Guru akan melihatnya, dan XP bisa dikembalikan penuh.</p>
            {appealState === "terkirim" ? <p className="mt-3 rounded-box border border-ok p-3 text-sm font-semibold">Terkirim. Guru akan melihatnya.</p> : (
              <div className="mt-3">
                <label className="block text-sm font-semibold" htmlFor="appeal">Alasan banding</label>
                <textarea id="appeal" rows={3} value={appeal} onChange={(e) => setAppeal(e.target.value)} className="field mt-1 w-full" placeholder="Contoh: soal pertama mudah, saya sudah hafal materinya." />
                {appealState && appealState !== "kirim" ? <p role="alert" className="mt-1 text-sm text-bad">{appealState}</p> : null}
                <button type="button" onClick={sendAppeal} disabled={appealState === "kirim"} className="btn-solid mt-2 inline-flex min-h-11 items-center rounded-box px-5 font-bold">Kirim banding</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="num mt-1 text-xl font-bold text-pen">+{xp} XP</p>
            <p className="mt-1 text-ink-soft">Soal yang salah akan muncul lagi lebih cepat, yang benar diulang beberapa hari lagi. Begitulah otak jadi ingat lebih lama.</p>
          </>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-3"><Link href={backHref} className="btn-solid inline-flex min-h-11 items-center rounded-box px-5 font-bold">Pilih latihan lain</Link></div>
      </div>
    );
  }

  if (camOn === null) {
    return (
      <div className="surface p-5">
        <h2 className="font-display text-xl font-bold">Latihan dengan kamera?</h2>
        <p className="mt-2 text-sm">Sekolahmu mengizinkan kamera supaya latihan tetap adil. Kamera hanya menyala selama sesi ini. <strong>Tidak ada gambar atau video yang dikirim atau disimpan</strong>; komputermu hanya menghitung apakah wajah terlihat. Kamera tidak pernah menjadi satu-satunya alasan XP dikurangi.</p>
        <p className="mt-2 text-sm text-ink-soft">Kamu boleh menolak dan tetap berlatih tanpa kamera.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => setCamOn(true)} className="btn-solid inline-flex min-h-11 items-center rounded-box px-5 font-bold">Pakai kamera</button>
          <button type="button" onClick={() => setCamOn(false)} className="btn-ghost inline-flex min-h-11 items-center rounded-box px-5 font-bold">Tanpa kamera</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {camOn ? <FaceGuard handleRef={face} /> : null}
      <div className="flex items-center justify-between text-sm font-semibold"><span className="num flex items-center gap-2"><Mascot size={44} />Soal {index} dari {total}</span><span className="num text-pen">+{xp} XP</span></div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={index - 1} aria-valuemin={0} aria-valuemax={total} aria-label="Kemajuan sesi">
        <div className="h-full bg-pen transition-[width] duration-300" style={{ width: `${((index - 1 + (res ? 1 : 0)) / total) * 100}%` }} />
      </div>
      {error ? <p role="alert" className="mt-4 rounded-box border border-bad/40 p-3 text-sm text-bad">{error} <button className="underline" onClick={() => (item ? setError(null) : load())}>Coba lagi</button></p> : null}
      {item ? (
        <div className="mt-4">
          <h2 className="surface p-4 text-lg font-bold">{item.stem}</h2>
          <ul className="mt-3 grid gap-2">
            {item.options.map((o, i) => {
              const isAns = res && i === res.answer, isWrong = res && picked === i && !res.correct;
              return (
                <li key={i}>
                  <button type="button" disabled={picked !== null} onClick={() => choose(i)} aria-pressed={picked === i}
                    className={`press flex min-h-14 w-full items-center gap-3 rounded-box border-2 p-3 text-left font-semibold ${isAns ? "border-ok bg-ok/10" : isWrong ? "border-bad bg-bad/10" : picked === i ? "border-pen" : "border-line bg-card"}`}>
                    <span className="num inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line">{LETTER[i]}</span>
                    <span>{o}</span>{isAns ? <span aria-hidden className="ml-auto">✓</span> : isWrong ? <span aria-hidden className="ml-auto">✗</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {res ? (
            <div aria-live="polite" className={`mt-4 rounded-box border-2 p-4 ${res.correct ? "border-ok" : "border-bad"}`}>
              <p className="text-lg font-bold">{res.correct ? (res.xp > 0 ? `Benar! +${res.xp} XP` : "Benar!") : "Belum tepat"}</p>
              {res.explanation ? <p className="mt-1 text-sm">{res.explanation}</p> : null}
              {res.flags.map((f) => FLAG_TEXT[f] ? <p key={f} className="mt-1 text-sm text-ink-soft">{FLAG_TEXT[f]}</p> : null)}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="button" onClick={load} disabled={busy} className="btn-solid inline-flex min-h-11 items-center rounded-box px-5 font-bold">{res.done ? "Lihat hasil" : "Lanjut"}</button>
                <button type="button" disabled={reported} onClick={() => { setReported(true); void reportItem(schoolId, item.id); }} className="text-sm underline">{reported ? "Terima kasih, dilaporkan" : "Soal ini salah?"}</button>
              </div>
            </div>
          ) : null}
        </div>
      ) : !error ? <p className="mt-6 text-ink-soft" aria-live="polite">Memuat soal…</p> : null}
    </div>
  );
}
