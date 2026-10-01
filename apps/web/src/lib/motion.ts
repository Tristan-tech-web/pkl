"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registrasi plugin sekali di sisi klien.
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  if (process.env.NEXT_PUBLIC_MOTION_DEBUG === "1") {
    (window as unknown as { __gsap: typeof gsap }).__gsap = gsap;
  }
}

export { gsap, ScrollTrigger, useGSAP };
export const NO_REDUCE = "(prefers-reduced-motion: no-preference)";
export const REDUCE = "(prefers-reduced-motion: reduce)";
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Waktu dalam bingkai pada grid 60 fps.
export const f = (frames: number) => frames / 60;
