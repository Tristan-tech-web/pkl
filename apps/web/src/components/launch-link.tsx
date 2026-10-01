"use client";

import { useEffect, useState } from "react";

// Tautan dalam ke aplikasi ujian. Mencoba membuka otomatis sekali; tombol tersedia bila gagal.
export function LaunchLink({ code }: { code: string }) {
  const [host, setHost] = useState("");
  useEffect(() => { queueMicrotask(() => setHost(window.location.origin)); }, []);
  const href = host ? `edusmart-ujian://mulai?kode=${encodeURIComponent(code)}&host=${encodeURIComponent(host)}` : "#";
  useEffect(() => { if (host) window.location.assign(href); }, [host, href]);
  return (
    <div className="mt-4">
      <a href={href} aria-disabled={!host} className="press inline-flex min-h-11 items-center rounded-box bg-pen px-5 font-semibold text-on-pen">Buka aplikasi ujian</a>
      <p className="mt-2 text-sm text-ink-soft">Bila aplikasi tidak terbuka, pastikan sudah terpasang, lalu tekan tombol di atas.</p>
    </div>
  );
}
