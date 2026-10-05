"use client";

import { useEffect, useId, useRef } from "react";
import { Birds, Bush, Campfire, Fence, Flower, House, Lantern, Mushroom, Pine, Rock, Tree, Tuft, Windmill } from "./island-art";
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

export type Growth = { level: number; streak: number };

/** `growth` membuat pulau murid tumbuh: makin tinggi level, makin ramai; streak menyalakan api unggun. Tanpa `growth` (landing) semuanya tampil. */
export function IslandScene({ children, pena, header, compact = false, strip = false, bare = false, growth, fixedTod }: { children: React.ReactNode; pena: React.ReactNode; header?: React.ReactNode; compact?: boolean; strip?: boolean; bare?: boolean; growth?: Growth; fixedTod?: Tod }) {
  const g = growth ?? { level: 99, streak: 3 };
  const root = useRef<HTMLElement>(null);
  const uid = useId().replace(/:/g, "");
  const grad = (name: string, v: string) => (
    <linearGradient id={`${uid}-${name}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: `color-mix(in oklab, ${v} 84%, #fff)` }} /><stop offset="0.55" style={{ stopColor: v }} /><stop offset="1" style={{ stopColor: `color-mix(in oklab, ${v} 80%, #000)` }} /></linearGradient>
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.dataset.tod = fixedTod ?? todNow();
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "kurangi";
    if (calm) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0, on = true;
    // Adegan di luar layar tidak perlu menghitung paralaks (hemat CPU di HP lambat).
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) onScroll(); }, { rootMargin: "80px" });
    io.observe(el);
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => { tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; onScroll(); };
    const tick = () => {
      raf = 0;
      if (!on) return;
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      el.style.setProperty("--p", String(Math.min(Math.max(0, -el.getBoundingClientRect().top), el.offsetHeight)));
      el.style.setProperty("--mx", cx.toFixed(3));
      el.style.setProperty("--my", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    tick();
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onMove); if (raf) cancelAnimationFrame(raf); };
  }, [fixedTod]);

  const layer = (k: number, m: number) => ({ transform: `translate3d(calc(var(--mx) * ${m}px), calc(var(--p) * ${k}px + var(--my) * ${m / 2}px), 0)` });

  return (
    <section ref={root} data-tod="siang" className={strip ? "island island-strip" : compact ? "island island-mini" : bare ? "island island-bare" : "island"} aria-label="Pulau Belajar">
      <div className="island-stars" aria-hidden="true">{STARS.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s + 1, height: s.s + 1 }} />)}</div>
      <div className="island-sun" aria-hidden="true" style={{ right: "12%", top: "16%", ...layer(0.55, -10) }} />
      {[{ c: "c1", t: "9%", w: 1 }, { c: "c2", t: "22%", w: 0.7 }, { c: "c3", t: "34%", w: 1.15 }].map((c) => (
        <div key={c.c} className={`island-cloud ${c.c}`} aria-hidden="true" style={{ top: c.t, scale: String(c.w) }}>
          <svg viewBox="0 0 200 80" fill="currentColor"><path d="M30 70a24 24 0 0 1 2-47 36 36 0 0 1 68-8 30 30 0 0 1 52 14 22 22 0 0 1 10 41z" /></svg>
        </div>
      ))}

      {header}
      <div className="island-text">{children}</div>

      {/* Lapis jauh → dekat. Semuanya memakai viewBox sama sehingga skala dan posisi elemen selalu konsisten.
          Setiap lapis punya "rok" di bawah viewBox (rect lebih panjang) agar geser paralaks tidak membuka celah di dasar adegan. */}
      <div className="island-layer" aria-hidden="true" style={layer(0.5, -6)}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" overflow="visible">
          <defs>{grad("far", "var(--is-far)")}</defs>
          <Birds />
          <path d="M0 330 Q180 190 360 300 T700 270 T1060 300 T1440 230 V600 H0Z" fill={`url(#${uid}-far)`} opacity=".9" />
          <path d="M0 330 Q180 190 360 300 T700 270 T1060 300 T1440 230" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" />
          <rect x="-200" y="599" width="1840" height="240" fill="var(--is-far)" />
        </svg>
      </div>
      <div className="island-layer" aria-hidden="true" style={layer(0.32, -12)}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" overflow="visible">
          <defs>{grad("h1", "var(--is-h1)")}</defs>
          <path d="M0 380 Q240 270 480 350 T900 330 T1440 340 V600 H0Z" fill={`url(#${uid}-h1)`} />
          <path d="M0 380 Q240 270 480 350 T900 330 T1440 340" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="3" />
          <rect x="-200" y="599" width="1840" height="240" fill="var(--is-h1)" />
          {g.level >= 3 ? <><Pine x={150} y={372} s={0.9} /><Pine x={196} y={384} s={0.65} /><Tree x={1250} y={332} s={1.05} v={2} /><Tree x={1330} y={347} s={0.7} v={2} /></> : null}
          {g.level >= 6 ? <Windmill x={700} y={340} s={1} /> : null}
          {g.level >= 4 ? <House x={1040} y={330} s={1.1} /> : null}
        </svg>
      </div>
      <div className="island-layer" aria-hidden="true" style={layer(0.2, -20)}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" overflow="visible">
          <defs>{grad("h2", "var(--is-h2)")}</defs>
          <path d="M0 440 Q300 340 620 410 T1200 400 T1440 420 V600 H0Z" fill={`url(#${uid}-h2)`} />
          <path d="M0 440 Q300 340 620 410 T1200 400 T1440 420" fill="none" stroke="#fff" strokeOpacity=".32" strokeWidth="3" />
          <rect x="-200" y="599" width="1840" height="240" fill="var(--is-h2)" />
          {g.level >= 3 ? <><Tree x={560} y={398} s={0.8} v={2} /><Bush x={470} y={418} s={0.9} /></> : null}
          <Tree x={1180} y={405} s={1.3} />{g.level >= 3 ? <Tree x={1360} y={420} s={0.9} v={2} /> : null}
          {g.level >= 2 ? <><Flower x={400} y={440} /><Flower x={440} y={446} c="#fff" /><Flower x={1020} y={420} /><Flower x={1060} y={428} c="#ffe27a" /><Tuft x={350} y={448} /><Tuft x={1100} y={432} s={1.2} /></> : null}
        </svg>
      </div>
      <div className="island-layer" aria-hidden="true" style={layer(0.1, -32)}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" overflow="visible">
          <defs>{grad("h3", "var(--is-h3)")}</defs>
          <path d="M0 500 Q360 410 760 470 T1440 450 V600 H0Z" fill={`url(#${uid}-h3)`} />
          <path d="M0 500 Q360 410 760 470 T1440 450" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="3" />
          <rect x="-200" y="599" width="1840" height="240" fill="var(--is-h3)" />
          {/* jalan setapak melebar ke arah penonton: tepi gelap, badan terang, garis putus-putus */}
          <path d="M790 446 C760 470 690 480 640 515 C595 548 560 578 500 600 L730 600 C760 574 800 552 845 532 C895 508 920 485 858 448Z" fill="#000" opacity=".12" transform="translate(2 4)" />
          <path d="M790 446 C760 470 690 480 640 515 C595 548 560 578 500 600 L730 600 C760 574 800 552 845 532 C895 508 920 485 858 448Z" fill="var(--is-path)" />
          <path d="M790 446 C760 470 690 480 640 515 C595 548 560 578 500 600 L520 600 C570 578 610 548 650 518 C700 484 770 470 800 448Z" fill="#000" opacity=".06" />
          <path d="M822 452 C800 478 720 492 672 524 C640 546 610 575 590 600" stroke="#fff" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 14" fill="none" />
          {g.level >= 2 ? <><Flower x={300} y={515} /><Flower x={340} y={522} c="#fff" /><Flower x={1130} y={500} /><Flower x={1180} y={508} c="#ffe27a" /><Flower x={1230} y={500} /><Tuft x={250} y={530} s={1.3} /><Tuft x={1000} y={490} /><Mushroom x={880} y={520} s={1.1} /></> : null}
          {g.level >= 2 ? <Fence x={870} y={452} n={3} s={0.85} /> : null}
          {g.level >= 3 ? <><Bush x={180} y={505} s={1.3} v={1} /><Rock x={940} y={480} s={1} /></> : null}
          {g.level >= 5 ? <><Lantern x={690} y={500} /><Lantern x={600} y={548} /></> : null}
          {g.streak >= 1 ? <Campfire x={985} y={520} size={0.75 + Math.min(g.streak, 10) * 0.06} /> : null}
          {g.level >= 3 ? <Tree x={1330} y={480} s={1.6} /> : null}
        </svg>
      </div>
      <div className="island-layer" aria-hidden="true" style={{ ...layer(0.04, -40) }}>
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" overflow="visible">
          <defs>{grad("h4", "var(--is-h4)")}</defs>
          <path d="M0 565 Q420 520 840 560 T1440 540 V600 H0Z" fill={`url(#${uid}-h4)`} />
          <path d="M0 565 Q420 520 840 560 T1440 540" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="3" />
          <rect x="-200" y="599" width="1840" height="240" fill="var(--is-h4)" />
          {g.level >= 2 ? <><Tuft x={120} y={585} s={1.6} /><Tuft x={1280} y={578} s={1.5} /><Tuft x={760} y={590} s={1.4} /></> : null}
        </svg>
      </div>

      {pena}
      {compact || strip || bare ? null : <a href="#perjalanan" className="island-cue" aria-label="Mulai perjalanan, gulir ke bawah">
        <span>Gulir untuk berjalan</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </a>}
    </section>
  );
}
