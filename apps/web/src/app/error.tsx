"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl" aria-hidden="true">🛠️</p>
      <h1 className="font-display text-3xl font-bold">Ada yang tidak beres</h1>
      <p className="text-ink-soft">Halaman ini gagal dimuat. Data Anda aman. Coba lagi, atau kembali ke beranda.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => retry()} className="btn-solid inline-flex min-h-11 items-center rounded-box px-5 font-semibold">Coba lagi</button>
        <Link href="/dashboard" className="btn-ghost inline-flex min-h-11 items-center rounded-box px-5 font-semibold">Ke beranda</Link>
      </div>
    </main>
  );
}
