"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { haptic } from "@/lib/haptic";
import { useEffect, useRef, useState } from "react";
import { appealCase, practiceAnswer, practiceNext, reportItem, type Answered, type Integrity, type Next, type PracticeItem } from "@/app/dashboard/sekolah/[id]/latihan/actions";
import { FaceGuard, type FaceHandle } from "@/components/face-guard";
import { Mascot } from "@/components/three/mascot";
import { QuestionView } from "@/components/question-view";

const FLAG_TEXT: Record<string, string> = {
  terlalu_cepat: "Terlalu cepat, baca soalnya dulu ya. XP tidak dihitung.",
  ulang_cepat: "Soal ini baru saja kamu kuasai, jadi XP-nya berkurang.",
  belum_waktunya: "Belum waktunya diulang, XP berkurang.",
  batas_harian: "Batas XP latihan hari ini sudah tercapai. Lanjut besok!",
  bangkit: "Bangkit! Dulu salah, sekarang benar. Bonus XP!",
};

export function PracticeRunner({ schoolId, sessionId, backHref, initial, camera }: { schoolId: string; sessionId: string; backHref: string; initial: Next; camera: boolean }) {
  const first = initial.ok ? initial : null;
  const [item, setItem] = useState<PracticeItem | null>(first?.item ?? null);
  const [index, setIndex] = useState(first?.index ?? 1);
  const [total, setTotal] = useState(first?.total ?? 10);
  const [xp, setXp] = useState(first?.xp ?? 0);
  const [picked, setPicked] = useState<number | null>(null);
  const [res, setRes] = useState<Extract<Answered, { ok: true }> | null>(null);
  const [finished, setFinished] = useState(first?.done ?? false);
  const router = useRouter();
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
    if (r.done) { setFinished(true); setItem(null); router.refresh(); return; }
    setItem(r.item ?? null); setIndex(r.index ?? 1);
  }

  async function choose(i: number) {
    if (!item || picked !== null || busy) return;
    setPicked(i); setBusy(true);
    const r = await practiceAnswer(schoolId, sessionId, item.id, i, { blurs: blurs.current, cam: face.current?.drain() });
    setBusy(false);
    if (!r.ok) { setError(r.error); setPicked(null); return; }
    setRes(r); setXp(r.sessionXp); if (r.integrity) setIntegrity(r.integrity);
    haptic(r.correct ? "benar" : "salah");
    if (!r.correct) window.dispatchEvent(new Event("edusmart:oops"));
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
      {error ? <p role="alert" className="mt-4 rounded-box border border-bad/40 p-3 text-sm text-bad">{error} <button className="underline" onClick={() => (item ? setError(null) : load())}>Coba lagi</button></p> : null}
      {item ? (
        <div className="mt-2">
          <QuestionView index={index} total={total} xp={xp} stem={item.stem} options={item.options}
            picked={picked} answer={res ? res.answer : null} correct={res ? res.correct : null} gain={res?.xp} explanation={res?.explanation}
            notes={res ? res.flags.map((f) => FLAG_TEXT[f]).filter(Boolean) : []} busy={busy} reported={reported}
            nextLabel={res?.done ? "Lihat hasil" : "Lanjut"} onPick={choose} onNext={load}
            onReport={() => { setReported(true); void reportItem(schoolId, item.id); }} />
        </div>
      ) : !error ? <p className="mt-6 text-ink-soft" aria-live="polite">Memuat soal…</p> : null}
    </div>
  );
}
