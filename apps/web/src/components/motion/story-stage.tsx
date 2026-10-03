"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, NO_REDUCE, REDUCE, clamp01 } from "@/lib/motion";

// Panggung bercerita: satu kurva, tiga mata pelajaran. Seluruh adegan digerakkan
// oleh satu objek keadaan `st` dan fungsi render(); timeline di-scrub oleh scroll.

const W = 400;
const H = 280;
const X0 = -6;
const X1 = 6;
const Y0 = -8;
const Y1 = 10;
const sx = (x: number) => ((x - X0) / (X1 - X0)) * W;
const sy = (y: number) => H - ((y - Y0) / (Y1 - Y0)) * H;

type State = {
  a: number;
  h: number;
  k: number;
  vertex: number;
  code: number;
  codeOp: number;
  ball: number;
  ballOp: number;
};

const START: State = { a: 1, h: 1, k: -4, vertex: 1, code: 0, codeOp: 0, ball: 0, ballOp: 0 };
const END: State = { a: -0.5, h: 0, k: 6, vertex: 0.25, code: 1, codeOp: 1, ball: 0.62, ballOp: 1 };

const fmt = (n: number) => (Math.round(n * 10) / 10).toString().replace("-", "−");

function curve(s: State) {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = X0 + ((X1 - X0) * i) / 60;
    const y = s.a * (x - s.h) ** 2 + s.k;
    pts.push(`${i === 0 ? "M" : "L"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`);
  }
  return pts.join(" ");
}

function codeText(s: State) {
  const lines = [
    "def y(x):",
    `    return ${fmt(s.a)} * (x - ${fmt(s.h)})**2 + ${fmt(s.k)}`,
    "",
    "titik = [(x, y(x)) for x in range(-6, 7)]",
    "# 13 titik, satu kurva",
  ];
  const full = lines.join("\n");
  return full.slice(0, Math.round(full.length * clamp01(s.code)));
}

const CAPS = [
  { tab: "Matematika", title: "Mulai dari bentuknya", body: "Geser a, h, dan k, lalu lihat puncak dan arah buka parabola ikut bergerak. Ini modul yang sudah berjalan." },
  { tab: "Koding", title: "Lalu tulis sebagai kode", body: "Rumus yang sama menjadi fungsi dan daftar titik. Rencana: editor dengan eksekusi di peramban." },
  { tab: "Fisika", title: "Akhirnya benda bergerak", body: "Bola mengikuti kurva yang sama sebagai lintasan. Rencana: simulasi gerak parabola." },
];

export function StoryStage() {
  const root = useRef<HTMLElement>(null);
  const pathEl = useRef<SVGPathElement>(null);
  const vertexEl = useRef<SVGGElement>(null);
  const vertexLabel = useRef<SVGTextElement>(null);
  const codeEl = useRef<HTMLPreElement>(null);
  const ballEl = useRef<SVGGElement>(null);
  const trailEl = useRef<SVGPathElement>(null);
  const velEl = useRef<SVGLineElement>(null);
  const gravEl = useRef<SVGLineElement>(null);
  const dotsEl = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      const st: State = { ...START };

      const render = () => {
        pathEl.current?.setAttribute("d", curve(st));
        const vx = sx(st.h);
        const vy = sy(st.k);
        if (vertexEl.current) {
          vertexEl.current.setAttribute("transform", `translate(${vx.toFixed(1)} ${vy.toFixed(1)})`);
          vertexEl.current.style.opacity = String(st.vertex);
        }
        if (vertexLabel.current) vertexLabel.current.textContent = `puncak (${fmt(st.h)}, ${fmt(st.k)})`;
        if (codeEl.current) {
          codeEl.current.textContent = codeText(st);
          codeEl.current.style.opacity = String(st.codeOp);
        }
        // titik-titik hasil kode muncul berurutan mengikuti kemajuan ketikan
        if (dotsEl.current) {
          const dots = dotsEl.current.children;
          const shown = Math.round(13 * clamp01(st.code));
          for (let i = 0; i < dots.length; i++) {
            const x = -6 + i;
            const y = st.a * (x - st.h) ** 2 + st.k;
            const d = dots[i] as SVGCircleElement;
            d.setAttribute("cx", sx(x).toFixed(1));
            d.setAttribute("cy", sy(y).toFixed(1));
            d.style.opacity = i < shown ? "1" : "0";
          }
        }
        // bola: lintasan dari x=-5 sampai x=5
        const bx = -5 + 10 * st.ball;
        const by = st.a * (bx - st.h) ** 2 + st.k;
        if (ballEl.current) {
          ballEl.current.setAttribute("transform", `translate(${sx(bx).toFixed(1)} ${sy(by).toFixed(1)})`);
          ballEl.current.style.opacity = String(st.ballOp);
        }
        if (trailEl.current) {
          const p: string[] = [];
          const n = Math.max(2, Math.round(st.ball * 30));
          for (let i = 0; i <= n; i++) {
            const x = -5 + (10 * st.ball * i) / n;
            const y = st.a * (x - st.h) ** 2 + st.k;
            p.push(`${i === 0 ? "M" : "L"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`);
          }
          trailEl.current.setAttribute("d", p.join(" "));
          trailEl.current.style.opacity = String(st.ballOp);
        }
        // kecepatan menyinggung kurva, gravitasi ke bawah
        const slope = 2 * st.a * (bx - st.h);
        const len = 34;
        const mag = Math.hypot(1, -slope * (H / (Y1 - Y0)) / (W / (X1 - X0)));
        const dxp = (len / mag) * 1;
        const dyp = (len / mag) * (slope * (H / (Y1 - Y0)) / (W / (X1 - X0)));
        const bxp = sx(bx);
        const byp = sy(by);
        if (velEl.current) {
          velEl.current.setAttribute("x1", bxp.toFixed(1));
          velEl.current.setAttribute("y1", byp.toFixed(1));
          velEl.current.setAttribute("x2", (bxp + dxp).toFixed(1));
          velEl.current.setAttribute("y2", (byp - dyp).toFixed(1));
          velEl.current.style.opacity = String(st.ballOp);
        }
        if (gravEl.current) {
          gravEl.current.setAttribute("x1", bxp.toFixed(1));
          gravEl.current.setAttribute("y1", byp.toFixed(1));
          gravEl.current.setAttribute("x2", bxp.toFixed(1));
          gravEl.current.setAttribute("y2", (byp + 28).toFixed(1));
          gravEl.current.style.opacity = String(st.ballOp);
        }
      };

      const mm = gsap.matchMedia();

      mm.add(NO_REDUCE, () => {
        const rootEl = root.current;
        if (!rootEl) return;
        const caps = gsap.utils.toArray<HTMLElement>(".story-cap", rootEl);
        const tabs = gsap.utils.toArray<HTMLElement>(".subject-tab", rootEl);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: render,
          scrollTrigger: { trigger: rootEl, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });

        // morf bentuk di sepanjang cerita
        tl.to(st, { a: END.a, h: END.h, k: END.k, duration: 3, ease: "power1.inOut" }, 0);
        // babak 2: kode
        tl.to(st, { codeOp: 1, duration: 0.25 }, 0.85);
        tl.to(st, { code: 1, duration: 0.9 }, 1.05);
        tl.to(st, { vertex: 0.25, duration: 0.3 }, 0.9);
        tl.to(st, { codeOp: 0.0, duration: 0.2 }, 2.1);
        // babak 3: bola
        tl.to(st, { ballOp: 1, duration: 0.2 }, 1.95);
        tl.to(st, { ball: END.ball, duration: 0.95, ease: "power1.in" }, 2.05);

        caps.forEach((cap, i) => {
          gsap.set(cap, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 18 });
          if (i > 0) tl.to(cap, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" }, i - 0.12);
          if (i < caps.length - 1) tl.to(cap, { autoAlpha: 0, y: -14, duration: 0.15, ease: "power2.in" }, i + 0.88);
        });
        // tab aktif mengikuti babak
        const setTab = (idx: number) =>
          tabs.forEach((t, i) => t.setAttribute("data-active", String(i === idx)));
        tl.eventCallback("onUpdate", () => {
          render();
          setTab(Math.min(2, Math.floor(tl.progress() * 3)));
        });
        render();
        setTab(0);
        ScrollTrigger.refresh();
      });

      // gerak berkurang: tampilkan ketiganya statis tanpa pin
      mm.add(REDUCE, () => {
        root.current?.classList.add("is-static");
        Object.assign(st, END);
        render();
        root.current?.querySelectorAll(".subject-tab").forEach((t) => t.setAttribute("data-active", "false"));
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="story border-b border-line" aria-labelledby="story-title">
      <div className="story-stick">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:px-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">Satu kurva, tiga mata pelajaran</p>
            <h2 id="story-title" className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">
              Belajar jadi nyambung ketika konsepnya dilihat dari banyak sisi.
            </h2>
            <div className="mt-5 flex gap-5 border-b border-line text-sm font-medium text-ink-soft" role="list">
              {CAPS.map((c, i) => (
                <span key={c.tab} role="listitem" className="subject-tab relative pb-2" data-active={i === 0 ? "true" : "false"}>
                  {c.tab}
                </span>
              ))}
            </div>
            <div className="story-caps relative mt-5 min-h-[7.5rem]">
              {CAPS.map((c, i) => (
                <div key={c.tab} className="story-cap absolute inset-x-0 top-0" style={i === 0 ? undefined : { opacity: 0 }}>
                  <h3 className="font-display text-xl font-semibold">{c.title}</h3>
                  <p className="mt-1 text-ink-soft">{c.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-ink-soft">
              Jujur: saat ini hanya modul Matematika yang sudah berjalan. Koding dan Fisika masih rencana.
            </p>
          </div>

          <div className="relative rounded-xl border border-line bg-card p-3 shadow-sm">
            <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Parabola yang berubah bentuk dan dipakai sebagai kurva, kode, dan lintasan bola">
              <g stroke="var(--grid)" strokeWidth="1">
                {Array.from({ length: 13 }, (_, i) => (
                  <line key={`v${i}`} x1={sx(X0 + i)} x2={sx(X0 + i)} y1="0" y2={H} />
                ))}
                {Array.from({ length: 10 }, (_, i) => (
                  <line key={`h${i}`} y1={sy(Y0 + 2 * i)} y2={sy(Y0 + 2 * i)} x1="0" x2={W} />
                ))}
              </g>
              <line x1={sx(0)} x2={sx(0)} y1="0" y2={H} stroke="var(--ink-soft)" strokeWidth="1" />
              <line x1="0" x2={W} y1={sy(0)} y2={sy(0)} stroke="var(--ink-soft)" strokeWidth="1" />
              <path ref={trailEl} d="" fill="none" stroke="var(--margin)" strokeWidth="3" strokeLinecap="round" opacity="0" />
              <path ref={pathEl} d={curve(START)} fill="none" stroke="var(--pen)" strokeWidth="2.5" strokeLinecap="round" />
              <g ref={dotsEl} fill="var(--pen-strong)">
                {Array.from({ length: 13 }, (_, i) => (
                  <circle key={i} r="3.2" cx={sx(-6 + i)} cy={sy(START.a * (-6 + i - START.h) ** 2 + START.k)} opacity="0" />
                ))}
              </g>
              <g ref={vertexEl} transform={`translate(${sx(START.h)} ${sy(START.k)})`}>
                <circle r="5" fill="var(--hi)" stroke="var(--ink)" strokeWidth="1.5" />
                <text ref={vertexLabel} x="9" y="16" fontSize="11" fill="var(--ink)" fontFamily="var(--font-mono)">
                  puncak (1, −4)
                </text>
              </g>
              <line ref={gravEl} stroke="var(--bad)" strokeWidth="2" strokeLinecap="round" opacity="0" markerEnd="url(#arr-bad)" />
              <line ref={velEl} stroke="var(--ok)" strokeWidth="2" strokeLinecap="round" opacity="0" markerEnd="url(#arr-ok)" />
              <g ref={ballEl} opacity="0">
                <circle r="7" fill="var(--margin)" stroke="var(--ink)" strokeWidth="1.5" />
              </g>
              <defs>
                <marker id="arr-bad" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                  <path d="M0 0 L6 3 L0 6 z" fill="var(--bad)" />
                </marker>
                <marker id="arr-ok" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                  <path d="M0 0 L6 3 L0 6 z" fill="var(--ok)" />
                </marker>
              </defs>
            </svg>
            <pre
              ref={codeEl}
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-3 right-3 overflow-hidden rounded-lg border border-line bg-paper/95 p-3 font-mono text-[11px] leading-relaxed text-ink opacity-0 md:text-xs"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
