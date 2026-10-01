import Link from "next/link";
import { enabledModuleCodes } from "@/lib/modules";
import { createClient } from "@/lib/supabase/server";

type Item = { slug: string; label: string; module: string };
const STUDENT: Item[] = [
  { slug: "jadwal", label: "Jadwal kelasku", module: "schedule" },
  { slug: "absensi", label: "Kehadiranku", module: "attendance" },
  { slug: "nilai", label: "Nilaiku", module: "gradebook" },
  { slug: "rapor", label: "Rapor", module: "gradebook" },
  { slug: "pengumuman", label: "Pengumuman", module: "announcements" },
];
const TEACHER: Item[] = [
  { slug: "jadwal", label: "Jadwal mengajarku", module: "schedule" },
  { slug: "absensi", label: "Absensi", module: "attendance" },
  { slug: "nilai", label: "Nilai", module: "gradebook" },
  { slug: "rapor", label: "Rapor", module: "gradebook" },
  { slug: "materi", label: "Materi dan soal", module: "learning" },
  { slug: "pengumuman", label: "Pengumuman", module: "announcements" },
];

// Pintasan modul yang aktif di paket sekolah, sesuai peran.
export async function ModuleLinks({ schoolId, role }: { schoolId: string; role: "student" | "teacher" }) {
  const on = await enabledModuleCodes(await createClient(), schoolId);
  const items = (role === "student" ? STUDENT : TEACHER).filter((i) => on.has(i.module));
  if (items.length === 0) return null;
  return (
    <nav aria-label="Menu" className="stagger mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((i) => (
        <Link key={i.slug} href={`/dashboard/sekolah/${schoolId}/${i.slug}`} className="press flex min-h-14 items-center rounded-[6px] border border-line bg-card px-3 font-semibold hover:border-pen">
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

export async function LatestAnnouncements({ schoolId }: { schoolId: string }) {
  const supabase = await createClient();
  const on = await enabledModuleCodes(supabase, schoolId);
  if (!on.has("announcements")) return null;
  const { data } = await supabase.from("announcements").select("id,title,body,pinned,created_at").eq("school_id", schoolId).order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(3);
  if (!data || data.length === 0) return null;
  return (
    <section aria-label="Pengumuman terbaru" className="mt-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold">Pengumuman</h2>
        <Link href={`/dashboard/sekolah/${schoolId}/pengumuman`} className="text-sm font-semibold text-pen underline">Semua</Link>
      </div>
      <ul className="mt-2 border-t border-line">
        {data.map((a) => (
          <li key={a.id as string} className="border-b border-line py-2.5">
            <p className="font-semibold">{a.pinned ? "📌 " : ""}{a.title as string}</p>
            <p className="line-clamp-2 text-ink-soft">{a.body as string}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
