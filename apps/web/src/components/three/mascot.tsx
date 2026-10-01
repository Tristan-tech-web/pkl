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
    import("./kit").then((k) => {
      if (dead || !ref.current) return;
      m = k.createMascot(ref.current, { still: cap.still, quality: cap.quality === 2 ? 2 : 1, palette: k.readPalette() });
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
          <ellipse cx="50" cy="56" rx="38" ry="35" fill="var(--pen)" />
          <ellipse cx="50" cy="66" rx="25" ry="20" fill="var(--card)" />
          <circle cx="38" cy="48" r="8" fill="#fff" /><circle cx="62" cy="48" r="8" fill="#fff" />
          <circle cx="39" cy="49" r="4" fill="#14213d" /><circle cx="61" cy="49" r="4" fill="#14213d" />
          <circle cx="27" cy="60" r="4" fill="var(--accent)" /><circle cx="73" cy="60" r="4" fill="var(--accent)" />
          <path d="M43 62q7 7 14 0" stroke="#14213d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M22 28l8 14M78 28l-8 14" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
          <path d="M42 22l8-12 8 12z" fill="var(--hi)" />
        </svg>
      ) : null}
    </div>
  );
}
