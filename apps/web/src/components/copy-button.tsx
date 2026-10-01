"use client";

import { useState } from "react";

// Menyalin teks (atau tautan lengkap bila `path` diberikan). Bila clipboard ditolak, teks dipilih agar bisa disalin manual.
export function CopyButton({ text, path, label = "Salin" }: { text?: string; path?: string; label?: string }) {
  const [state, setState] = useState<"idle" | "ok" | "gagal">("idle");
  async function copy() {
    const value = path ? `${window.location.origin}${path}` : (text ?? "");
    try {
      await navigator.clipboard.writeText(value);
      setState("ok");
    } catch {
      setState("gagal");
    }
    setTimeout(() => setState("idle"), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-11 items-center surface px-3 text-sm font-semibold hover:border-pen"
    >
      {state === "ok" ? "Tersalin" : state === "gagal" ? "Salin manual" : label}
    </button>
  );
}
