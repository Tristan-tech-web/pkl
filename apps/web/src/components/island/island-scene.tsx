"use client";

import { useEffect, useRef } from "react";
import "./island.css";

type Tod = "pagi" | "siang" | "sore" | "malam";

/** Jam WIB → waktu hari. Bisa dipaksa lewat ?tod= (untuk uji visual). */
function todNow(): Tod {
  const forced = new URLSearchParams(window.location.search).get("tod");
  if (forced === "pagi" || forced === "siang" || forced === "sore" || forced === "malam") return forced;
  const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", hour: "numeric", hour12: false }).format(new Date())) % 24;
  return h >= 5 && h < 10 ? "pagi" : h >= 10 && h < 15 ? "siang" : h >= 15 && h < 18 ? "sore" : "malam";
}

const STARS = Array.from({ length: 36 }, (_, i) => ({ x: (i * 53 + 11) % 100, y: (i * 37 + 7) % 46, s: 1 + (i % 3) }));

function Tree({ x, y, s = 1, c = "var(--is-tree)" }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-4" width="6" height="26" rx="2" fill="var(--is-trunk)" />
      <circle cx="0" cy="-22" r="22" fill={c} />
      <circle cx="-13" cy="-10" r="14" fill={c} />
      <circle cx="13" cy="-9" r="14" fill={c} />
      <circle cx="-7" cy="-30" r="8" fill="#fff" opacity=".1" />
    </g>
  );
}
function Flower({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0v14" stroke="var(--is-tree)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="0" cy="-2" r="5.5" fill="var(--is-flower)" />
      <circle cx="0" cy="-2" r="2.2" fill="#ffe27a" />
    </g>
  );
}

export function IslandScene({ children, pena, header, compact = false }: { children: React.ReactNode; pena: React.ReactNode; header?: React.ReactNode; compact?: boolean }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.dataset.tod = todNow();
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "kurangi";
    if (calm) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => { tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; onScroll(); };
    const tick = () => {
      raf = 0;
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      el.style.setProperty("--p", String(Math.min(window.scrollY, el.offsetHeight)));
      el.style.setProperty("--mx", cx.toFixed(3));
      el.style.setProperty("--my", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    tick();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onMove); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const layer = (k: number, m: number) => ({ transform: `translate3d(calc(var(--mx) * ${m}px), calc(var(--p) * ${k}px + var(--my) * ${m / 2}px), 0)` });

  return (
    <section ref={root} data-tod="siang" className={compact ? "island island-mini" : "island"} aria-label="Pulau Belajar">
      <div className="island-stars" aria-hidden="true">{STARS.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s + 1, height: s.s + 1 }} />)}</div>
      <div className="island-sun" aria-hidden="true" style={{ right: "12%", top: "16%", ...layer(0.55, -10) }} />
      {[{ c: "c1", t: "9%", w: 1 }, { c: "c2", t: "22%", w: 0.7 }, { c: "c3", t: "34%", w: 1.15 }].map((c) => (
        <div key={c.c} className={`island-cloud ${c.c}`} aria-hidden="true" style={{ top: c.t, scale: String(c.w) }}>
          <svg viewBox="0 0 200 80" fill="currentColor"><path d="M30 70a24 24 0 0 1 2-47 36 36 0 0 1 68-8 30 30 0 0 1 52 14 22 22 0 0 1 10 41z" /></svg>
        </div>
      ))}

      {header}
      <div className="island-text">{children}</div>

      {/* Lapis jauh → dekat. Semuanya memakai viewBox sama sehingga skala dan posisi pohon selalu konsisten. */}
      <div className="island-layer" aria-hidden="true" style={layer(0.5, -6)}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice">
          <path d="M0 330 Q180 190 360 300 T700 270 T1060 300 T1440 230 V600 H0Z" fill="var(--is-far)" opacity=".85" />
        </svg>
      </div>
      <div className="island-layer" aria-hidden="true" style={layer(0.32, -12)}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice">
          <path d="M0 380 Q240 270 480 350 T900 330 T1440 340 V600 H0Z" fill="var(--is-h1)" />
          <Tree x={1250} y={330} s={1.1} c="var(--is-tree2)" /><Tree x={1330} y={345} s={0.7} c="var(--is-tree2)" />
          {/* pondok kecil */}
          <g transform="translate(1040 322)"><rect x="-22" y="-14" width="44" height="30" fill="#fff6e6" /><path d="M-28 -14 0 -40 28 -14Z" fill="var(--is-flower)" /><rect x="-6" y="-2" width="12" height="18" fill="var(--is-trunk)" /></g>
        </svg>
      </div>
      <div className="island-layer" aria-hidden="true" style={layer(0.2, -20)}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice">
          <path d="M0 440 Q300 340 620 410 T1200 400 T1440 420 V600 H0Z" fill="var(--is-h2)" />
          <Tree x={560} y={398} s={0.8} c="var(--is-tree2)" /><Tree x={1180} y={405} s={1.3} /><Tree x={1360} y={420} s={0.9} c="var(--is-tree2)" />
          <Flower x={400} y={440} /><Flower x={440} y={446} /><Flower x={1020} y={420} /><Flower x={1060} y={428} />
        </svg>
      </div>
      <div className="island-layer" aria-hidden="true" style={layer(0.1, -32)}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice">
          <path d="M0 500 Q360 410 760 470 T1440 450 V600 H0Z" fill="var(--is-h3)" />
          {/* jalan setapak melebar ke arah penonton */}
          <path d="M790 446 C760 470 690 480 640 515 C595 548 560 578 500 600 L730 600 C760 574 800 552 845 532 C895 508 920 485 858 448Z" fill="var(--is-path)" />
          <path d="M822 452 C800 478 720 492 672 524 C640 546 610 575 590 600" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 14" fill="none" />
          <Flower x={300} y={515} /><Flower x={340} y={522} /><Flower x={1130} y={500} /><Flower x={1180} y={508} /><Flower x={1230} y={500} />
          <Tree x={1330} y={480} s={1.6} c="var(--is-tree)" />
        </svg>
      </div>
      <div className="island-layer" aria-hidden="true" style={{ ...layer(0.04, -40) }}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice">
          <path d="M0 565 Q420 520 840 560 T1440 540 V600 H0Z" fill="var(--is-h4)" />
        </svg>
      </div>

      {pena}
      {compact ? null : <a href="#perjalanan" className="island-cue" aria-label="Mulai perjalanan, gulir ke bawah">
        <span>Gulir untuk berjalan</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </a>}
    </section>
  );
}
