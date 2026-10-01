"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Tautan kembali: di dalam sekolah menuju Beranda sekolah itu, selain itu ke daftar sekolah.
export function BackLink() {
  const path = usePathname();
  const m = path.match(/^\/dashboard\/sekolah\/([0-9a-f-]{36})\/.+/);
  return (
    <Link href={m ? `/dashboard/sekolah/${m[1]}` : "/dashboard"} className="back-link text-sm font-semibold text-pen underline">
      ← {m ? "Beranda" : "Semua sekolah"}
    </Link>
  );
}
