import Link from "next/link";
import { enabledModuleCodes } from "@/lib/modules";
import { createClient } from "@/lib/supabase/server";

// `module`: item hanya tampil bila modul itu aktif di paket sekolah.
const ITEMS: { slug: string; label: string; module?: string }[] = [
  { slug: "", label: "Ringkasan" },
  { slug: "rombel", label: "Rombel" },
  { slug: "anggota", label: "Anggota" },
  { slug: "mapel", label: "Mata pelajaran" },
  { slug: "materi", label: "Materi", module: "learning" },
  { slug: "pantau", label: "Pantau belajar", module: "learning" },
  { slug: "absensi", label: "Absensi", module: "attendance" },
  { slug: "jadwal", label: "Jadwal", module: "schedule" },
  { slug: "pengumuman", label: "Pengumuman", module: "announcements" },
  { slug: "nilai", label: "Nilai", module: "gradebook" },
  { slug: "rapor", label: "Rapor", module: "gradebook" },
  { slug: "ai", label: "Tutor AI", module: "ai_tutor" },
  { slug: "administrasi", label: "Administrasi", module: "admin_records" },
  { slug: "paket", label: "Paket dan modul" },
];

export async function SchoolNav({ schoolId, active }: { schoolId: string; active: string }) {
  const supabase = await createClient();
  const on = await enabledModuleCodes(supabase, schoolId);
  return (
    <nav aria-label="Pengelolaan sekolah" className="mb-8 overflow-x-auto border-b border-line">
      <ul className="flex min-w-max gap-1">
        {ITEMS.filter((i) => !i.module || on.has(i.module)).map((i) => {
          const current = i.slug === active;
          return (
            <li key={i.slug}>
              <Link
                href={`/dashboard/sekolah/${schoolId}${i.slug ? `/${i.slug}` : ""}`}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center border-b-2 px-3 font-semibold ${
                  current ? "border-pen text-pen" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
