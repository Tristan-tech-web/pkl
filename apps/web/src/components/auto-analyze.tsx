"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { analyzeFile } from "@/app/dashboard/sekolah/[id]/berkas/actions";

// Berkas yang masuk lewat MCP belum dianalisis; analisisnya dijalankan di sini saat halaman Berkas dibuka.
export function AutoAnalyze({ schoolId, items }: { schoolId: string; items: { id: string; createdAt: string }[] }) {
  const router = useRouter();
  const started = useRef(false);
  const [left, setLeft] = useState(0);
  useEffect(() => {
    // Hanya berkas yang menunggu > 2 menit (berkas unggahan web dianalisis langsung oleh formulirnya).
    const ids = items.filter((i) => Date.now() - new Date(i.createdAt).getTime() > 120_000).map((i) => i.id);
    if (started.current || ids.length === 0) return;
    started.current = true;
    setLeft(ids.length);
    (async () => {
      for (const id of ids) {
        await analyzeFile(schoolId, id).catch(() => null);
        setLeft((n) => n - 1);
      }
      router.refresh();
    })();
  }, [items, schoolId, router]);
  if (left <= 0) return null;
  return <p role="status" aria-live="polite" className="mt-3 surface p-3 text-sm">Memilah {left} berkas yang dikirim lewat AI Anda…</p>;
}
