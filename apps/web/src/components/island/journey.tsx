"use client";

import { useEffect, useRef } from "react";
import "./island.css";

/**
 * Jalan setapak yang tergambar mengikuti gulir. Posisi simpul diukur dari DOM (selektor [data-station]),
 * jadi jalan selalu lewat tepat di tengah tiap simpul di lebar layar apa pun. Tanpa gerak (reduced motion):
 * jalan langsung penuh dan semua simpul menyala.
 */
export function Journey({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const base = useRef<SVGPathElement>(null);
  const prog = useRef<SVGPathElement>(null);
  const dot = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = root.current, sv = svg.current, b = base.current, p = prog.current, d = dot.current;
    if (!el || !sv || !b || !p || !d) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "kurangi";
    let pts: { x: number; y: number; n: HTMLElement }[] = [];
    let len = 0, H = 0, raf = 0, lastOff = -1;

    // Tabel titik sepanjang jalan, dibuat sekali saat ukuran berubah. getPointAtLength mahal bila dipanggil
    // belasan kali tiap frame gulir, jadi posisi dicari dari tabel ini dengan interpolasi.
    let tab: { l: number; x: number; y: number }[] = [];
    const sample = () => {
      const n = Math.min(700, Math.max(80, Math.round(len / 8)));
      tab = Array.from({ length: n + 1 }, (_, i) => { const l = (len * i) / n; const q = p.getPointAtLength(l); return { l, x: q.x, y: q.y }; });
    };
    const pointAt = (L: number) => {
      const f = Math.min(Math.max(L / len, 0), 1) * (tab.length - 1);
      const i = Math.min(Math.floor(f), tab.length - 2), t = f - i;
      return { x: tab[i].x + (tab[i + 1].x - tab[i].x) * t, y: tab[i].y + (tab[i + 1].y - tab[i].y) * t };
    };
    const lenAtY = (y: number) => {
      let lo = 0, hi = tab.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (tab[mid].y < y) lo = mid + 1; else hi = mid; }
      if (lo === 0) return 0;
      const a = tab[lo - 1], c = tab[lo], t = c.y === a.y ? 0 : (y - a.y) / (c.y - a.y);
      return a.l + (c.l - a.l) * Math.min(Math.max(t, 0), 1);
    };
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const reach = calm ? H : Math.min(H, Math.max(0, window.innerHeight * 0.6 - r.top));
      const L = calm ? len : lenAtY(reach);
      const off = Math.round((len - L) * 2) / 2;
      if (off !== lastOff) { lastOff = off; p.style.strokeDashoffset = String(off); }
      const pt = pointAt(L);
      d.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      d.style.opacity = !calm && reach > 4 && reach < H - 4 ? "1" : "0";
      for (const s of pts) s.n.classList.toggle("on", calm || s.y <= reach);
    };
    const build = () => {
      const r = el.getBoundingClientRect();
      H = el.offsetHeight;
      const W = el.clientWidth;
      pts = [...el.querySelectorAll<HTMLElement>("[data-station]")].map((n) => {
        const q = n.getBoundingClientRect();
        return { x: q.left - r.left + q.width / 2, y: q.top - r.top + q.height / 2, n };
      });
      if (pts.length < 2) return;
      const amp = Math.min(90, W * 0.09);
      let dd = `M ${pts[0].x} 0 L ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], c = pts[i], s = i % 2 ? 1 : -1, k = (c.y - a.y) * 0.4;
        dd += ` C ${a.x + s * amp} ${a.y + k}, ${c.x - s * amp} ${c.y - k}, ${c.x} ${c.y}`;
      }
      const last = pts[pts.length - 1];
      dd += ` L ${last.x} ${H}`;
      sv.setAttribute("viewBox", `0 0 ${W} ${H}`);
      sv.setAttribute("height", String(H));
      b.setAttribute("d", dd); p.setAttribute("d", dd);
      len = p.getTotalLength();
      sample();
      p.style.strokeDasharray = String(len);
      update();
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Munculkan konten saat masuk layar (hanya bila JS aktif dan gerak diizinkan).
    el.classList.add("js");
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    el.querySelectorAll("[data-reveal]").forEach((n) => (calm ? n.classList.add("in") : io.observe(n)));
    return () => { ro.disconnect(); io.disconnect(); window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={root} className="journey">
      <svg ref={svg} className="journey-svg" aria-hidden="true" width="100%">
        <path ref={base} className="journey-base" />
        <path ref={prog} className="journey-prog" />
        <g ref={dot} className="journey-dot"><circle r="16" className="halo" /><circle r="8" /></g>
      </svg>
      {children}
    </div>
  );
}
