import Link from "next/link";
import { SchoolNav } from "@/components/school-nav";
import { loadModules } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

export const metadata = { title: "Paket dan modul · EduSmart" };
const CATEGORY: Record<string, string> = { belajar: "Belajar", administrasi: "Administrasi sekolah", komunikasi: "Komunikasi", keuangan: "Keuangan", integrasi: "Integrasi" };

export default async function PaketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getSchoolContext(id, { management: true });
  const { plan, modules } = await loadModules(supabase, id);
  const groups = new Map<string, typeof modules>();
  for (const m of modules) groups.set(m.category, [...(groups.get(m.category) ?? []), m]);
  return (
    <>
      <SchoolNav schoolId={id} active="paket" />
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">Paket sekolah</p>
        <h1 className="font-display text-4xl font-bold tracking-tight">{plan.name}</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Modul yang aktif mengikuti paket. Modul bertanda “segera” sedang disiapkan. Untuk ganti paket atau menyusun paket khusus,{" "}
          <Link href="/#paket" className="font-semibold text-pen underline">hubungi tim dev</Link>.
        </p>
      </header>
      {[...groups.entries()].map(([cat, list]) => (
        <section key={cat} className="mt-8">
          <h2 className="font-display text-xl font-bold">{CATEGORY[cat] ?? cat}</h2>
          <ul className="stagger mt-3 border-t border-line">
            {list.map((m) => (
              <li key={m.code} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line py-3">
                <div className="max-w-xl">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-ink-soft">{m.description}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                    m.enabled && m.status === "tersedia" ? "border-ok/40 bg-ok-bg text-ok" : m.enabled ? "border-line text-ink-soft" : "border-line text-ink-soft"
                  }`}
                >
                  {m.enabled ? (m.status === "tersedia" ? "Aktif" : "Di paketmu · segera") : m.status === "tersedia" ? "Tidak di paketmu" : "Segera"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
