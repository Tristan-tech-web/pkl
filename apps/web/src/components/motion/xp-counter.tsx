"use client";

import { useRef } from "react";
import { gsap, NO_REDUCE, useGSAP } from "@/lib/motion";

// Hitung naik: angka berhenti lembut (expo.out) dan sedikit "membal" saat tiba.
export function XpCounter({ to, prefix = "", suffix = "", delay = 0.2, className = "" }: { to: number; prefix?: string; suffix?: string; delay?: number; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const node = el.current;
        if (!node) return;
        const o = { v: 0 };
        node.textContent = `${prefix}0${suffix}`;
        gsap.to(o, {
          v: to,
          duration: 1.3,
          delay,
          ease: "expo.out",
          onUpdate: () => (node.textContent = `${prefix}${Math.round(o.v)}${suffix}`),
          onComplete: () => {
            node.textContent = `${prefix}${to}${suffix}`;
            gsap.fromTo(node, { scale: 1.18 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
          },
        });
      });
      return () => mm.revert();
    },
    { scope: el, dependencies: [to] },
  );
  return (
    <span ref={el} className={`num inline-block ${className}`}>
      {prefix}
      {to}
      {suffix}
    </span>
  );
}
