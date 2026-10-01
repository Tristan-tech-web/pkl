"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

// Jembatan ke AI milik pengguna: salin prompt, tempel di AI favorit, bawa jawabannya kembali.
export function CopyBox({ text, label = "Salin prompt", note }: { text: string; label?: string; note?: string }) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
    } catch {
      setState("err");
    }
    setTimeout(() => setState("idle"), 3000);
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={copy}>{label}</Button>
        <span role="status" aria-live="polite" className="text-sm text-ink-soft">
          {state === "ok" ? "Tersalin. Tempel di AI Anda." : state === "err" ? "Gagal menyalin; salin manual dari kotak di bawah." : `${text.length.toLocaleString("id-ID")} karakter`}
        </span>
      </div>
      {note ? <p className="mt-1 text-sm text-ink-soft">{note}</p> : null}
      <textarea readOnly value={text} rows={4} aria-label="Isi prompt" className="mt-2 w-full rounded-[6px] border border-line bg-paper p-2 font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
    </div>
  );
}
