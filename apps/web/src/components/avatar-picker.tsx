"use client";

import { useEffect, useState, useTransition } from "react";
import { saveAvatar } from "@/app/dashboard/sekolah/[id]/profil/actions";
import { COLORS, COLOR_HEX, COLOR_LABEL, HATS, HAT_LABEL, encodeAvatar, type Avatar } from "@/lib/avatar";
import "./island/island.css";
import { Mascot } from "@/components/three/mascot";

// Pratinjau langsung: mengubah data-avatar di <html> sehingga maskot di halaman ini berubah seketika; Simpan menyimpannya ke akun.
export function AvatarPicker({ schoolId, initial }: { schoolId: string; initial: Avatar }) {
  const [a, setA] = useState<Avatar>(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = (patch: Partial<Avatar>) => { setA((cur) => ({ ...cur, ...patch })); setSaved(false); };
  useEffect(() => { document.documentElement.dataset.avatar = encodeAvatar(a); }, [a]);
  return (
    <section className="surface p-4" aria-label="Kustomisasi maskot">
      <h2 className="font-display text-xl font-extrabold">Dandani Pena</h2>
      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
        <div className="pena-stage shrink-0"><Mascot size={190} /></div>
        <div className="w-full space-y-3">
          <fieldset><legend className="mb-1 text-sm font-bold">Topi</legend>
            <div className="flex flex-wrap gap-2">{HATS.map((h) => <button key={h} type="button" aria-pressed={a.hat === h} onClick={() => set({ hat: h })} className={`min-h-11 rounded-btn border-2 px-3 text-sm font-bold ${a.hat === h ? "border-pen bg-pen text-on-pen" : "border-line bg-card"}`}>{HAT_LABEL[h]}</button>)}</div></fieldset>
          <fieldset><legend className="mb-1 text-sm font-bold">Kacamata</legend>
            <div className="flex gap-2">{[true, false].map((g) => <button key={String(g)} type="button" aria-pressed={a.glasses === g} onClick={() => set({ glasses: g })} className={`min-h-11 rounded-btn border-2 px-3 text-sm font-bold ${a.glasses === g ? "border-pen bg-pen text-on-pen" : "border-line bg-card"}`}>{g ? "Pakai 👓" : "Tanpa"}</button>)}</div></fieldset>
          <fieldset><legend className="mb-1 text-sm font-bold">Warna badan</legend>
            <div className="flex flex-wrap gap-2">{COLORS.map((c) => (
              <button key={c} type="button" aria-pressed={a.color === c} aria-label={COLOR_LABEL[c]} onClick={() => set({ color: c })} className={`grid size-11 place-items-center rounded-full border-4 ${a.color === c ? "border-ink" : "border-line"}`}
                style={{ background: c === "tema" ? "conic-gradient(var(--pen), var(--accent), var(--hi), var(--ok), var(--pen))" : COLOR_HEX[c] }}>{a.color === c ? <span aria-hidden="true" className="text-white drop-shadow">✓</span> : null}</button>
            ))}</div></fieldset>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" disabled={pending} onClick={() => start(async () => { await saveAvatar(schoolId, a); setSaved(true); })} className="btn-solid inline-flex min-h-11 items-center rounded-btn px-5 font-bold">{pending ? "Menyimpan…" : "Simpan"}</button>
        {saved ? <span role="status" className="text-sm font-semibold text-ok">Tersimpan!</span> : null}
      </div>
    </section>
  );
}
