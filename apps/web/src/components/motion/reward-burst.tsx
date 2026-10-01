"use client";

import { useEffect, useRef } from "react";

// Konfeti kanvas dengan fisika sederhana (gravitasi, hambatan udara, putar). Dimatikan saat kurangi gerak.
type P = { x: number; y: number; vx: number; vy: number; w: number; h: number; r: number; vr: number; c: string; life: number };

export function RewardBurst({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
    };
    resize();
    const css = getComputedStyle(document.documentElement);
    const colors = ["--pen", "--hi", "--margin", "--ok"].map((v) => css.getPropertyValue(v).trim() || "#2a4bd7");
    const count = Math.round(90 * intensity);
    const ox = cv.width / 2;
    const oy = cv.height * 0.35;
    const ps: P[] = Array.from({ length: count }, () => {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const sp = (6 + Math.random() * 12) * dpr;
      return {
        x: ox, y: oy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        w: (6 + Math.random() * 6) * dpr, h: (3 + Math.random() * 4) * dpr,
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        c: colors[Math.floor(Math.random() * colors.length)], life: 1,
      };
    });
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(2, (now - last) / 16.67);
      last = now;
      ctx.clearRect(0, 0, cv.width, cv.height);
      let alive = 0;
      for (const p of ps) {
        p.vy += 0.38 * dpr * dt;
        p.vx *= Math.pow(0.985, dt);
        p.vy *= Math.pow(0.992, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.r += p.vr * dt;
        p.life -= 0.0075 * dt;
        if (p.life <= 0 || p.y > cv.height + 20) continue;
        alive++;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.scale(1, Math.abs(Math.cos(p.r * 1.3)) * 0.8 + 0.2); // berputar 3D semu
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive > 0) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, cv.width, cv.height);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [intensity]);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
