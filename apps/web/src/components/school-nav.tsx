import Link from "next/link";
import { enabledModuleCodes } from "@/lib/modules";
import { createClient } from "@/lib/supabase/server";

// `module`: item hanya tampil bila modul itu aktif di paket sekolah. Dikelompokkan agar tidak perlu menggulir ke samping.
type Item = { slug: string; label: string; module?: string };
const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Sekolah",
    items: [
      { slug: "", label: "Ringkasan" },
      { slug: "rombel", label: "Rombel" },
      { slug: "anggota", label: "Anggota" },
      { slug: "mapel", label: "Mata pelajaran" },
      { slug: "berkas", label: "Berkas", module: "data_hub" },
      { slug: "paket", label: "Paket dan modul" },
    ],
  },
  {
    label: "Belajar",
    items: [
      { slug: "materi", label: "Materi", module: "learning" },
      { slug: "pantau", label: "Pantau", module: "learning" },
      { slug: "analitik", label: "Analitik", module: "analytics" },
      { slug: "liga", label: "Liga", module: "learning" },
      { slug: "ujian", label: "Ujian", module: "exams" },
      { slug: "ai", label: "Tutor AI", module: "ai_tutor" },
    ],
  },
  {
    label: "Administrasi",
    items: [
      { slug: "absensi", label: "Absensi", module: "attendance" },
      { slug: "jadwal", label: "Jadwal", module: "schedule" },
      { slug: "nilai", label: "Nilai", module: "gradebook" },
      { slug: "rapor", label: "Rapor", module: "gradebook" },
      { slug: "administrasi", label: "Data dan surat", module: "admin_records" },
      { slug: "keuangan", label: "Keuangan", module: "fees" },
    ],
  },
  { label: "Komunikasi", items: [{ slug: "pengumuman", label: "Pengumuman", module: "announcements" }] },
];

export async function SchoolNav({ schoolId, active }: { schoolId: string; active: string }) {
  const supabase = await createClient();
  const on = await enabledModuleCodes(supabase, schoolId);
  return (
    <nav aria-label="Pengelolaan sekolah" className="mb-8 grid gap-x-8 gap-y-3 border-b border-line pb-4 sm:grid-cols-2 lg:grid-cols-4">
      {GROUPS.map((g) => {
        const items = g.items.filter((i) => !i.module || on.has(i.module));
        if (items.length === 0) return null;
        return (
          <div key={g.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{g.label}</p>
            <ul className="mt-1 flex flex-wrap gap-x-1 gap-y-0.5">
              {items.map((i) => {
                const current = i.slug === active;
                return (
                  <li key={i.slug}>
                    <Link
                      href={`/dashboard/sekolah/${schoolId}${i.slug ? `/${i.slug}` : ""}`}
                      aria-current={current ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center rounded-[6px] px-2.5 text-sm font-semibold ${
                        current ? "bg-pen text-on-pen" : "text-ink-soft hover:bg-card hover:text-ink"
                      }`}
                    >
                      {i.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
