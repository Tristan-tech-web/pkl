"use client";

import { useId, useState } from "react";
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

export function ParabolaDemo() {
  const uid = useId();
  const [a, setA] = useState(1);
  const [b, setB] = useState(-2);
  const [c, setC] = useState(-3);
  const q = { a, b, c };

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
    <figure className="anim-rise rounded-[6px] border border-line bg-card" style={{ "--d": "200ms" } as React.CSSProperties}>
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

        <path d={pts.join(" ")} pathLength={1} className="draw-in morph-path" clipPath={`url(#${uid}-clip)`} fill="none" stroke="var(--pen)" strokeWidth="3" strokeLinejoin="round" />

        {r.filter((x) => inView(x, 0)).map((x) => (
          <circle key={`r${x}`} className="anim-pop" style={{ "--d": "1000ms", transformOrigin: `${sx(x)}px ${sy(0)}px` } as React.CSSProperties} cx={sx(x)} cy={sy(0)} r="5.5" fill="var(--hi)" stroke="var(--ink)" strokeWidth="1.5" />
        ))}
        {v && inView(v.x, v.y) ? (
          <g>
            <circle className="anim-pop" style={{ "--d": "1100ms", transformOrigin: `${sx(v.x)}px ${sy(v.y)}px` } as React.CSSProperties} cx={sx(v.x)} cy={sy(v.y)} r="6" fill="var(--margin)" stroke="var(--card)" strokeWidth="2" />
          </g>
        ) : null}
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
