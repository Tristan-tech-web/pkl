"use client";

import { useState } from "react";
import { appealCase, type Integrity } from "@/app/dashboard/sekolah/[id]/latihan/actions";

// Pesan netral saat XP ditahan/dibatalkan + formulir banding. Dipakai di hasil kuis.
export function IntegrityNotice({ schoolId, integrity }: { schoolId: string; integrity: Integrity }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"" | "kirim" | "terkirim" | string>("");
  if (!integrity || integrity.level === "rendah" || !integrity.case_id) return null;
  const send = async () => {
    setState("kirim");
    const r = await appealCase(schoolId, integrity.case_id as string, text);
    setState(r.ok ? "terkirim" : (r.error ?? "Gagal"));
  };
  return (
    <section className="mt-6 rounded-box border-2 border-warn bg-warn-bg p-4" aria-label="Pemeriksaan XP">
      <p className="font-bold">{integrity.level === "tinggi" ? "XP kuis ini dibatalkan." : "XP kuis ini sedang dicek guru."}</p>
      <p className="mt-1 text-sm">Cara kamu mengerjakan tadi agak tidak biasa, misalnya terlalu cepat atau sering pindah halaman. Itu cuma dugaan komputer, belum tentu kamu salah. Kalau memang keliru, ceritakan di bawah. Guru akan melihatnya, dan XP bisa dikembalikan penuh.</p>
      {state === "terkirim" ? <p className="mt-3 font-semibold text-ok">Terkirim. Guru akan melihatnya.</p> : (
        <div className="mt-3">
          <label htmlFor="appeal-quiz" className="block text-sm font-semibold">Alasan banding</label>
          <textarea id="appeal-quiz" rows={3} value={text} onChange={(e) => setText(e.target.value)} className="field mt-1 w-full" />
          {state && state !== "kirim" ? <p role="alert" className="mt-1 text-sm text-bad">{state}</p> : null}
          <button type="button" onClick={send} disabled={state === "kirim"} className="btn-solid mt-2 inline-flex min-h-11 items-center rounded-btn px-5 font-bold">Kirim banding</button>
        </div>
      )}
    </section>
  );
}
