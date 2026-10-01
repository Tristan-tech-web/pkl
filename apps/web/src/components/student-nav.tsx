"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "", label: "Beranda", icon: "🏠" },
  { slug: "/belajar", label: "Jalur", icon: "🗺️" },
  { slug: "/latihan", label: "Latihan", icon: "💪" },
  { slug: "/liga", label: "Liga", icon: "🏆" },
  { slug: "/profil", label: "Profil", icon: "🙂" },
];

// Navigasi murid: bilah bawah di HP, rel kiri di layar lebar. Tombol besar (≥ 56px) untuk jari anak-anak.
export function StudentNav({ schoolId }: { schoolId: string }) {
  const path = usePathname();
  const base = `/dashboard/sekolah/${schoolId}`;
  return (
    <nav aria-label="Menu murid" className="s-nav no-print">
      <ul>
        {TABS.map((t) => {
          const href = `${base}${t.slug}`;
          const on = t.slug === "" ? path === base : path === href || path.startsWith(`${href}/`);
          return (
            <li key={t.slug}>
              <Link href={href} aria-current={on ? "page" : undefined} className="s-tab" data-on={on ? "true" : "false"}>
                <span className="s-tab-icon" aria-hidden="true">{t.icon}</span>
                <span className="s-tab-label">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
