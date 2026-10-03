"use client";

import { useEffect, useState } from "react";
import { playSound, setSound, soundOn } from "@/lib/sound";

// Sakelar bunyi jawaban. Mati bawaan, disimpan di peramban ini saja.
export function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(soundOn()), 0); return () => clearTimeout(t); }, []);
  return (
    <section className="surface p-4" aria-label="Bunyi">
      <h2 className="font-display text-lg font-bold">Bunyi jawaban</h2>
      <p className="mt-1 text-sm text-ink-soft">Nada pendek saat jawabanmu benar atau salah. Cocok kalau kamu belajar sendirian. Mati bawaan.</p>
      <label className="mt-3 flex min-h-11 items-center gap-3 font-semibold">
        <input type="checkbox" className="size-5" checked={on} onChange={(e) => { setOn(e.target.checked); setSound(e.target.checked); if (e.target.checked) playSound("benar"); }} />
        Nyalakan bunyi
      </label>
    </section>
  );
}
