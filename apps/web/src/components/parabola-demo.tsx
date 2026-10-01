"use client";

import { useEffect, useId, useRef, useState } from "react";
import { f, gsap, NO_REDUCE, useGSAP } from "@/lib/motion";
import { equation, formatNumber, roots, vertex } from "@/lib/math";

const X_MIN = -6;
const X_MAX = 6;
const Y_MIN = -8;
const Y_MAX = 8;
const W = 440;
const H = 330;
const PAD = { l: 34, r: 14, t: 14, b: 30 };

const sx = (x: number) => PAD.l + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD.l - PAD.r);
const sy = (y: number) => PAD.t + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * (H - PAD.t - PAD.b);

const X_TICKS = [-6, -4, -2, 0, 2, 4, 6];
const Y_TICKS = [-8, -4, 0, 4, 8];

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr_3.5rem] items-center gap-3">
      <label htmlFor={id} className="num text-base font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full accent-[var(--pen)]"
      />
      <output htmlFor={id} className="num text-right text-sm">
        {formatNumber(value)}
      </output>
    </div>
  );
}

export function ParabolaDemo({ hero = true }: { hero?: boolean }) {
  const uid = useId();
  const [a, setA] = useState(1);
  const [b, setB] = useState(-2);
  const [c, setC] = useState(-3);
  const q = { a, b, c };
  const figure = useRef<HTMLElement>(null);
  const pathEl = useRef<SVGPathElement>(null);
  const pen = useRef<SVGGElement>(null);
  const penBlur = useRef<SVGFEGaussianBlurElement>(null);
  const [intro, setIntro] = useState(true);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const pointRefs = useRef<SVGGElement[]>([]);

  // Koreografi pena (shot 4-5, 8). Hanya berjalan sekali saat dimuat.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const path = pathEl.current;
        const nib = pen.current;
        if (!path || !nib) return;
        const len = path.getTotalLength();
        const dash = { p: 0 };
        let last = { x: 0, y: 0 };
        gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(nib, { opacity: 0 });
        const inPlot = (x: number, y: number) => x >= PAD.l && x <= W - PAD.r && y >= PAD.t && y <= H - PAD.b;

        const tl = gsap.timeline({ delay: f(48) });
        tl.to(dash, {
          p: 1,
          duration: f(92),
          ease: "power3.inOut",
          onUpdate() {
            const pt = path.getPointAtLength(dash.p * len);
            const speed = Math.hypot(pt.x - last.x, pt.y - last.y);
            const wobble = Math.sin(dash.p * 38) * 1.1;
            gsap.set(path, { strokeDashoffset: 1 - dash.p });
            gsap.set(nib, { x: pt.x, y: pt.y, rotation: -8 + wobble, opacity: inPlot(pt.x, pt.y) ? 1 : 0 });
            // Kabur gerak: sudut rana 180 derajat, sebanding kecepatan.
            penBlur.current?.setAttribute("stdDeviation", `${Math.min(3.2, speed * 0.28).toFixed(2)} 0`);
            last = { x: pt.x, y: pt.y };
          },
        });
        // Keluar lewat busur dengan overshoot (follow-through).
        const end = path.getPointAtLength(len);
        tl.to(nib, { x: end.x + 26, y: end.y - 54, rotation: 12, duration: f(22), ease: "power2.out" }, ">")
          .to(nib, { x: end.x + 36, y: end.y - 70, rotation: 6, opacity: 0, duration: f(16), ease: "power2.in" }, ">-0.02");

        // Penanda muncul dengan squash/stretch + riak; dipicu saat pena selesai menulis.
        tl.add(() => {
          pointRefs.current.forEach((g, i) => {
            if (!g) return;
            const marker = g.querySelector("[data-marker]");
            const ring = g.querySelector("[data-ring]");
            if (marker) {
              gsap.fromTo(marker, { scaleX: 0, scaleY: 0, transformOrigin: "50% 50%" }, { keyframes: [
                { scaleX: 1.4, scaleY: 0.65, duration: f(5), ease: "power2.out" },
                { scaleX: 0.88, scaleY: 1.2, duration: f(6), ease: "sine.inOut" },
                { scaleX: 1, scaleY: 1, duration: f(8), ease: "sine.out" },
              ], delay: i * f(5) });
            }
            if (ring) {
              gsap.fromTo(ring, { scale: 0.4, opacity: 0.7, transformOrigin: "50% 50%" }, { scale: 2.6, opacity: 0, duration: f(34), ease: "expo.out", delay: i * f(5) });
            }
          });
          setIntro(false);
        }, f(92) + f(8));

        // Shot 8: ajakan. Slider a bergerak sendiri sekali; berhenti saat pengguna menyentuh.
        const hint = { v: 1 };
        const stop = () => {
          tweenRef.current?.kill();
          tweenRef.current = null;
        };
        const fig = figure.current;
        fig?.addEventListener("pointerdown", stop, { once: true });
        fig?.addEventListener("keydown", stop, { once: true });
        tweenRef.current = gsap.to(hint, {
          v: 1.9,
          duration: f(48),
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
          delay: f(48 + 92 + 90),
          onUpdate: () => setA(Math.round(hint.v * 20) / 20),
        });
        return () => {
          stop();
          fig?.removeEventListener("pointerdown", stop);
          fig?.removeEventListener("keydown", stop);
        };
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        setIntro(false);
      });
      return () => mm.revert();
    },
    { scope: figure },
  );

  useEffect(
    () => () => {
      tweenRef.current?.kill();
    },
    [],
  );

  const pts: string[] = [];
  for (let x = X_MIN; x <= X_MAX + 1e-9; x += 0.1) {
    const y = a * x * x + b * x + c;
    pts.push(`${pts.length === 0 ? "M" : "L"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`);
  }
  const v = vertex(q);
  const r = roots(q);
  const inView = (x: number, y: number) => x >= X_MIN && x <= X_MAX && y >= Y_MIN && y <= Y_MAX;

  const shape = a === 0 ? "garis lurus" : a > 0 ? "membuka ke atas" : "membuka ke bawah";
  const rootText =
    r.length === 0
      ? "tidak ada akar real"
      : r.length === 1
        ? `akar x = ${formatNumber(r[0])}`
        : `akar x = ${formatNumber(r[0])} dan ${formatNumber(r[1])}`;

  return (
    <figure ref={figure} {...(hero ? { "data-hero": "card" } : {})} className={`${hero ? "hero-item " : ""}rounded-[6px] border border-line bg-card`}>
      <figcaption className="border-b border-line px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
          Contoh modul visual · Matematika, fungsi kuadrat
        </p>
        <p className="num mt-1 text-xl font-semibold" aria-live="polite">
          {equation(q)}
        </p>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Grafik ${equation(q)}, ${shape}${v ? `, puncak di ${formatNumber(v.x)}, ${formatNumber(v.y)}` : ""}`}
        className="block w-full bg-grid"
      >
        <defs>
          <clipPath id={`${uid}-clip`}>
            <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} />
          </clipPath>
        </defs>
        {X_TICKS.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} x2={sx(t)} y1={PAD.t} y2={H - PAD.b} stroke="var(--line)" strokeWidth={t === 0 ? 0 : 1} />
            <text x={sx(t)} y={H - 10} textAnchor="middle" className="num" fontSize="12" fill="var(--ink-soft)">
              {t}
            </text>
          </g>
        ))}
        {Y_TICKS.map((t) => (
          <g key={`y${t}`}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(t)} y2={sy(t)} stroke="var(--line)" strokeWidth={t === 0 ? 0 : 1} />
            <text x={PAD.l - 8} y={sy(t) + 4} textAnchor="end" className="num" fontSize="12" fill="var(--ink-soft)">
              {t}
            </text>
          </g>
        ))}
        <line x1={sx(0)} x2={sx(0)} y1={PAD.t} y2={H - PAD.b} stroke="var(--ink)" strokeWidth="1.5" />
        <line x1={PAD.l} x2={W - PAD.r} y1={sy(0)} y2={sy(0)} stroke="var(--ink)" strokeWidth="1.5" />

        <path ref={pathEl} d={pts.join(" ")} pathLength={1} className="morph-path" clipPath={`url(#${uid}-clip)`} fill="none" stroke="var(--pen)" strokeWidth="3" strokeLinejoin="round" />

        <defs>
          <filter id={`${uid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur ref={penBlur} stdDeviation="0 0" />
          </filter>
        </defs>
        {[0, 1].map((i) => {
          const x = r[i];
          const show = x !== undefined && inView(x, 0);
          return (
            <g key={`r${i}`} ref={(el) => { if (el) pointRefs.current[i] = el; }} style={{ display: show ? undefined : "none" }}>
              <circle data-ring cx={show ? sx(x) : 0} cy={sy(0)} r="9" fill="none" stroke="var(--hi)" strokeWidth="2" opacity="0" />
              <circle data-marker cx={show ? sx(x) : 0} cy={sy(0)} r="5.5" fill="var(--hi)" stroke="var(--ink)" strokeWidth="1.5" className={intro ? "marker-hidden" : ""} />
            </g>
          );
        })}
        {v && inView(v.x, v.y) ? (
          <g ref={(el) => { if (el) pointRefs.current[2] = el; }}>
            <circle data-ring cx={sx(v.x)} cy={sy(v.y)} r="10" fill="none" stroke="var(--margin)" strokeWidth="2" opacity="0" />
            <circle data-marker cx={sx(v.x)} cy={sy(v.y)} r="6" fill="var(--margin)" stroke="var(--card)" strokeWidth="2" className={intro ? "marker-hidden" : ""} />
          </g>
        ) : null}
        <g ref={pen} style={{ pointerEvents: "none" }}>
          <g filter={`url(#${uid}-blur)`}>
            <path d="M0 0 L5 -9 L19 -26 L26 -20 L10 -5 Z" fill="var(--ink)" />
            <path d="M0 0 L5 -9 L10 -5 Z" fill="var(--pen)" />
            <path d="M19 -26 L26 -20 L29 -25 L23 -31 Z" fill="var(--margin)" />
          </g>
        </g>
      </svg>

      <div className="flex flex-col gap-1 px-4 pt-3">
        <Slider id={`${uid}-a`} label="a" value={a} min={-3} max={3} step={0.1} onChange={setA} />
        <Slider id={`${uid}-b`} label="b" value={b} min={-6} max={6} step={0.5} onChange={setB} />
        <Slider id={`${uid}-c`} label="c" value={c} min={-6} max={6} step={0.5} onChange={setC} />
      </div>

      <p className="px-4 pb-4 pt-2 text-sm text-ink-soft" aria-live="polite">
        Grafik {shape}
        {v ? (
          <>
            , puncak di <span className="num text-ink">({formatNumber(v.x)}; {formatNumber(v.y)})</span>
          </>
        ) : null}
        ; {rootText}.
        <span className="ml-1 inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="4.5" fill="var(--margin)" /></svg> puncak
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="4.5" fill="var(--hi)" stroke="var(--ink)" /></svg> akar
          </span>
        </span>
      </p>
    </figure>
  );
}
