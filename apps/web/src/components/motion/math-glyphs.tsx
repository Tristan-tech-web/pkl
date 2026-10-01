"use client";

import { useRef } from "react";
import { gsap, NO_REDUCE, useGSAP } from "@/lib/motion";

// Lapisan simbol matematika berkedalaman: bergeser lembut mengikuti kursor (paralaks), melayang pelan.
const GLYPHS = [
  { c: "π", x: 6, y: 14, s: 2.4, d: 0.5 },
  { c: "∑", x: 44, y: 6, s: 3.2, d: 0.9 },
  { c: "√", x: 90, y: 20, s: 2.8, d: 0.7 },
  { c: "x²", x: 20, y: 58, s: 2.2, d: 0.4 },
  { c: "∫", x: 52, y: 78, s: 3.6, d: 1.0 },
  { c: "Δ", x: 82, y: 66, s: 2.4, d: 0.6 },
  { c: "θ", x: 33, y: 30, s: 1.8, d: 0.3 },
  { c: "∞", x: 70, y: 40, s: 2.6, d: 0.8 },
  { c: "f(x)", x: 8, y: 86, s: 1.6, d: 0.35 },
  { c: "≈", x: 94, y: 88, s: 2.2, d: 0.55 },
];

export function MathGlyphs() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-depth]", root.current);
        const movers = items.map((el) => ({
          x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
          d: Number(el.dataset.depth),
        }));
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          for (const m of movers) {
            m.x(-nx * 46 * m.d);
            m.y(-ny * 34 * m.d);
          }
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        gsap.fromTo(items, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.4, ease: "expo.out", stagger: 0.08, delay: 0.4 });
        return () => window.removeEventListener("pointermove", onMove);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute hidden md:block inset-0 overflow-hidden">
      {GLYPHS.map((g, i) => (
        <span
          key={g.c}
          data-depth={g.d}
          className="glyph absolute select-none font-display font-bold text-pen"
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            fontSize: `${g.s}rem`,
            opacity: 0.1 + g.d * 0.06,
            filter: g.d < 0.5 ? "blur(1.5px)" : undefined,
          }}
        >
          <span className="glyph-drift" style={{ animationDuration: `${9 + i * 1.3}s`, animationDelay: `${-i * 1.7}s` }}>
            {g.c}
          </span>
        </span>
      ))}
    </div>
  );
}
