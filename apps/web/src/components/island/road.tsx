"use client";

import { useEffect, useRef } from "react";
import "./island.css";

/** Jalan yang melintasi simpul peta belajar. Diukur dari DOM ([data-node]); bagian yang sudah ditempuh berwarna. */
export function Road({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const edge = useRef<SVGPathElement>(null);
  const bed = useRef<SVGPathElement>(null);
  const dash = useRef<SVGPathElement>(null);
  const walked = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = root.current, sv = svg.current, e = edge.current, b = bed.current, d = dash.current, w = walked.current;
    if (!el || !sv || !e || !b || !d || !w) return;
    const build = () => {
      const r = el.getBoundingClientRect();
      const nodes = [...el.querySelectorAll<HTMLElement>("[data-node]")];
      if (nodes.length < 2) { for (const p of [e, b, d, w]) p.setAttribute("d", ""); return; }
      const pts = nodes.map((n) => { const q = n.getBoundingClientRect(); return { x: q.left - r.left + q.width / 2, y: q.top - r.top + q.height / 2, done: n.dataset.state === "done" || n.dataset.state === "now" }; });
      let dd = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], c = pts[i], k = (c.y - a.y) * 0.5;
        dd += ` C ${a.x} ${a.y + k}, ${c.x} ${c.y - k}, ${c.x} ${c.y}`;
      }
      sv.setAttribute("viewBox", `0 0 ${el.clientWidth} ${el.offsetHeight}`);
      for (const p of [e, b, d, w]) p.setAttribute("d", dd);
      // bagian yang sudah ditempuh: sampai simpul terakhir yang selesai/sedang berjalan
      let lastDone = -1; pts.forEach((p, i) => { if (p.done) lastDone = i; });
      const total = w.getTotalLength();
      let lo = 0, hi = total; const targetY = lastDone >= 0 ? pts[lastDone].y : 0;
      for (let i = 0; i < 16; i++) { const mid = (lo + hi) / 2; if (w.getPointAtLength(mid).y < targetY) lo = mid; else hi = mid; }
      w.style.strokeDasharray = String(total);
      w.style.strokeDashoffset = String(total - (lastDone >= 0 ? hi : 0));
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={root} className="road-root">
      <svg ref={svg} className="road-svg" aria-hidden="true" width="100%">
        <path ref={edge} className="road-edge" />
        <path ref={bed} className="road-bed" />
        <path ref={dash} className="road-dash" />
        <path ref={walked} className="road-walked" />
      </svg>
      {children}
    </div>
  );
}
