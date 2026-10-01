"use client";

import { useEffect, useRef, useState } from "react";
import { detectCapability } from "./capability";

/** Maskot 3D "Pena". Bila 3D tidak tersedia, tampil versi SVG sederhana (gambar yang sama, tanpa gerak). */
export function Mascot({ size = 180, className = "" }: { size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"loading" | "3d" | "svg">("loading");
  useEffect(() => {
    const cap = detectCapability();
    if (!cap.ok) { queueMicrotask(() => setMode("svg")); return; }
    let m: { dispose: () => void; jump: () => void; setPalette: (p: import("./kit").Palette) => void } | null = null;
    let obs: MutationObserver | null = null;
    let dead = false;
    const onReward = () => m?.jump();
    Promise.all([import("./kit"), import("./pena")]).then(([k, pena]) => {
      if (dead || !ref.current) return;
      m = pena.createPena(ref.current, { still: cap.still, quality: cap.quality === 2 ? 2 : 1, palette: k.readPalette() });
      setMode("3d");
      obs = new MutationObserver(() => m?.setPalette(k.readPalette()));
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style"] });
      window.addEventListener("edusmart:reward", onReward);
    }).catch(() => setMode("svg"));
    return () => { dead = true; obs?.disconnect(); window.removeEventListener("edusmart:reward", onReward); m?.dispose(); };
  }, []);
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <canvas ref={ref} className={mode === "3d" ? "size-full" : "hidden"} />
      {mode === "svg" || mode === "loading" ? (
        <svg viewBox="0 0 100 100" className="size-full" role="img">
          <ellipse cx="50" cy="93" rx="26" ry="4.5" fill="#0a0a1e" opacity=".18" />
          <path d="M16 62c-2 14 10 28 34 28s36-14 34-28c-2-20-12-38-34-38S18 42 16 62z" fill="var(--pen)" stroke="#1b1a3a" strokeWidth="1.6" />
          <ellipse cx="14" cy="64" rx="6" ry="15" fill="var(--pen)" stroke="#1b1a3a" strokeWidth="1.6" transform="rotate(8 14 64)" />
          <ellipse cx="86" cy="64" rx="6" ry="15" fill="var(--pen)" stroke="#1b1a3a" strokeWidth="1.6" transform="rotate(-8 86 64)" />
          <path d="M30 66c0 12 8 20 20 20s20-8 20-20c-6-4-14-5-20-5s-14 1-20 5z" fill="#fff1db" />
          <g fill="#0d2a7a" opacity=".45"><ellipse cx="38" cy="56" rx="5" ry="2.4" /><ellipse cx="50" cy="57" rx="5" ry="2.4" /><ellipse cx="62" cy="56" rx="5" ry="2.4" /></g>
          <ellipse cx="50" cy="40" rx="30" ry="15" fill="#fff1db" />
          <circle cx="37" cy="40" r="12.5" fill="var(--hi)" /><circle cx="63" cy="40" r="12.5" fill="var(--hi)" />
          <circle cx="37" cy="40" r="10.5" fill="#fff" /><circle cx="63" cy="40" r="10.5" fill="#fff" />
          <circle cx="38" cy="41" r="7" fill="#1b1a3a" /><circle cx="62" cy="41" r="7" fill="#1b1a3a" />
          <circle cx="36" cy="38" r="2.6" fill="#fff" /><circle cx="60" cy="38" r="2.6" fill="#fff" /><circle cx="40" cy="44" r="1.2" fill="#fff" /><circle cx="64" cy="44" r="1.2" fill="#fff" />
          <path d="M47.5 41h5" stroke="var(--hi)" strokeWidth="2" />
          <path d="M46 49h8l-4 7z" fill="var(--hi)" stroke="#1b1a3a" strokeWidth="1" strokeLinejoin="round" />
          <ellipse cx="25" cy="51" rx="4.5" ry="3" fill="var(--accent)" opacity=".5" /><ellipse cx="75" cy="51" rx="4.5" ry="3" fill="var(--accent)" opacity=".5" />
          <path d="M33 90l-3 4h8zM67 90l3 4h-8z" fill="var(--hi)" stroke="#1b1a3a" strokeWidth="1" strokeLinejoin="round" />
          <g transform="translate(0 -10)">
          <path d="M26 27l24-12 24 12-24 11z" fill="#14183f" stroke="#1b1a3a" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M36 31v8c0 3 6 5 14 5s14-2 14-5v-8l-14 6z" fill="#1a2058" />
          <path d="M74 27v13" stroke="var(--hi)" strokeWidth="1.6" /><circle cx="74" cy="42" r="2.4" fill="var(--hi)" />
          </g>
        </svg>
      ) : null}
    </div>
  );
}
