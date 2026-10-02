"use client";

import { useEffect, useState } from "react";
import { THEMES } from "@/lib/themes";

const STYLES = [
  { id: "ceria", label: "Ceria", note: "bulat, besar, seperti stiker" },
  { id: "seru", label: "Seru", note: "tegas dan bercahaya" },
  { id: "ringkas", label: "Ringkas", note: "rapi dan datar" },
];

/** Mengganti tema dan gaya seluruh halaman secara langsung (hanya atribut pada <html>; tidak disimpan). */
export function ThemePlayground() {
  const [theme, setTheme] = useState("kertas");
  const [style, setStyle] = useState("ringkas");
  useEffect(() => {
    queueMicrotask(() => {
      setTheme(document.documentElement.dataset.theme || "kertas");
      setStyle(document.documentElement.dataset.experience || "ringkas");
    });
  }, []);
  const pickTheme = (id: string) => { document.documentElement.setAttribute("data-theme", id); setTheme(id); };
  const pickStyle = (id: string) => { document.documentElement.setAttribute("data-experience", id); setStyle(id); };
  return (
    <div className="grid gap-5">
      <fieldset>
        <legend className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-soft">Dunia</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEMES.map((t) => (
            <button key={t.id} type="button" onClick={() => pickTheme(t.id)} aria-pressed={theme === t.id}
              className="press group flex min-h-14 items-center gap-3 rounded-box border-2 border-line bg-card p-2 text-left font-semibold aria-pressed:border-pen aria-pressed:shadow-pop">
              <span aria-hidden="true" className="size-10 shrink-0 rounded-full border border-line" style={{ background: `conic-gradient(${t.tokens.paper} 0 25%, ${t.tokens.pen} 0 50%, ${t.tokens.accent} 0 75%, ${t.tokens.card} 0)` }} />
              <span className="leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-soft">Gaya</legend>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button key={s.id} type="button" onClick={() => pickStyle(s.id)} aria-pressed={style === s.id}
              className="press min-h-11 rounded-btn border-2 border-line bg-card px-4 font-bold aria-pressed:border-pen aria-pressed:bg-pen aria-pressed:text-on-pen">
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-soft" aria-live="polite">{STYLES.find((s) => s.id === style)?.note}. Sekolah menetapkan batasnya; murid dan guru memilih di dalamnya.</p>
      </fieldset>
    </div>
  );
}
