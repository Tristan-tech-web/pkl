"use client";

import { useRef } from "react";
import { f, gsap, NO_REDUCE, useGSAP } from "@/lib/motion";

// Koreografi pembuka hero mengikuti docs/design/motion-spec.md (grid 60 fps).
// Konten sudah dirender server; di sini hanya gerak.
export function HeroMotion({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const q = gsap.utils.selector(root);
        const tl = gsap.timeline();

        // Shot 2: hook. Tiap kata: antisipasi turun, naik melewati posisi, mengendap.
        const words = q(".wi");
        // Posisi sembunyi awal dari CSS (properti `translate`) diserahkan ke GSAP.
        words.forEach((el) => ((el as HTMLElement).style.translate = "none"));
        words.forEach((el, i) => {
          const t = f(9 + i * 5);
          tl.fromTo(el, { yPercent: 115, rotate: 4 }, { yPercent: 118, rotate: 5, duration: f(3), ease: "power1.out" }, t)
            .to(el, { yPercent: -5, rotate: -0.6, duration: f(16), ease: "expo.out" }, t + f(3))
            .to(el, { yPercent: 0, rotate: 0, duration: f(10), ease: "sine.inOut" }, t + f(19));
        });
        const lastLand = f(9 + (words.length - 1) * 5 + 29);

        // Stabilo menyapu setelah kata terakhir mendarat (follow-through).
        tl.to(q(".highlight"), { backgroundSize: "100% 100%", duration: f(26), ease: "power3.out" }, lastLand + f(6));

        // Teks pendukung: ritme "manfaat = sedang, ajakan = paling lama bertahan".
        tl.fromTo(q("[data-hero='eyebrow']"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: f(30), ease: "expo.out" }, f(4))
          .fromTo(q("[data-hero='lede']"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: f(44), ease: "expo.out" }, f(44))
          .fromTo(q("[data-hero='cta']"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: f(50), ease: "expo.out" }, f(56));

        // Shot 3: kartu grafik, 3D yang mengendap, lebih lambat dari teks.
        tl.fromTo(
          q("[data-hero='card']"),
          { opacity: 0, y: 40, rotateX: -12, rotateY: 5, transformPerspective: 1100, transformOrigin: "50% 100%" },
          { opacity: 1, y: 0, rotateX: 0, rotateY: 0, duration: f(66), ease: "expo.out" },
          f(15),
        );

        // Shot 7: gelembung. Masuk beruntun, lalu gelombang menandai lembar jawaban.
        tl.fromTo(q(".bubble"), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: f(30), ease: "back.out(2)", stagger: f(2.5) }, f(70));
        const fills = q(".bubble i");
        fills.forEach((el, i) => {
          const t = f(112 + i * 4);
          tl.to(el, { scale: 1.15, duration: f(7), ease: "power2.out" }, t)
            .to(el, { scale: 1, duration: f(6), ease: "sine.inOut" }, t + f(7))
            .to(el, { scale: 0, duration: f(26), ease: "power2.inOut" }, t + f(22));
        });
        tl.add(() => {
          gsap.set(q(".bubble, .bubble i"), { clearProps: "transform,opacity" });
        });

        // Elemen yang tidak dianimasikan lewat tween tetap harus terlihat saat selesai.
        tl.set(q(".hero-item"), { opacity: 1 }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
