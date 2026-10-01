"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Hitung mundur menuju waktu buka. Saat tiba, halaman dimuat ulang agar simpul terbuka tanpa menekan apa pun.
export function Countdown({ until, className = "" }: { until: string; className?: string }) {
  const router = useRouter();
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const t = new Date(until).getTime();
    const tick = () => {
      const s = Math.max(0, Math.round((t - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) router.refresh();
    };
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, [until, router]);
  if (left === null) return <span className={className}>…</span>;
  const d = Math.floor(left / 86400), h = Math.floor((left % 86400) / 3600), m = Math.floor((left % 3600) / 60);
  const text = d > 0 ? `${d} hari ${h} jam` : h > 0 ? `${h} jam ${m} menit` : `${Math.max(1, m)} menit`;
  return <span className={className} aria-label={`Terbuka dalam ${text}`}>⏳ {text}</span>;
}
