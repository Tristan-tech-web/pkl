"use client";

import { useEffect, useRef, useState } from "react";
import { THEMES } from "@/lib/themes";
import { detectCapability } from "./capability";
import type { SceneId } from "./kit";

const sceneOf = (theme: string | undefined) => (THEMES.find((t) => t.id === theme)?.scene ?? "kertas") as SceneId;

/** Benda 3D melayang di belakang konten. Tidak memuat three bila 3D dimatikan atau perangkat lemah. */
export function FloatField({ className = "", scene }: { className?: string; scene?: SceneId }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const cap = detectCapability();
    if (!cap.ok) return;
    let stage: import("./kit").Stage | null = null;
    let obs: MutationObserver | null = null;
    let dead = false;
    import("./kit").then((k) => {
      if (dead || !ref.current) return;
      setOn(true);
      const html = document.documentElement;
      stage = k.createFloatField(ref.current, { scene: scene ?? sceneOf(html.dataset.theme), still: cap.still, quality: cap.quality === 2 ? 2 : 1, palette: k.readPalette(), onSlow: () => { stage?.dispose(); stage = null; setOn(false); } });
      obs = new MutationObserver(() => { stage?.setPalette(k.readPalette()); if (!scene) stage?.setScene(sceneOf(html.dataset.theme)); });
      obs.observe(html, { attributes: true, attributeFilter: ["data-theme", "style"] });
    }).catch(() => setOn(false));
    return () => { dead = true; obs?.disconnect(); stage?.dispose(); };
  }, [scene]);
  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-0 size-full ${on ? "" : "hidden"} ${className}`} />;
}
