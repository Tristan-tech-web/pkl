import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { authorityLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type Program = { id: string; name: string; form_code: string; grades: number[] };
type Pack = { name: string; code: string; version: string; verified: boolean };
type Sub = { plan_code: string; ai_mode: string };
type School = {
  id: string;
  name: string;
  authority: string;
  ownership: string;
  city: string | null;
  province: string | null;
  school_programs: Program[];
  school_subscriptions: Sub | Sub[] | null;
  curriculum_packs: Pack | Pack[] | null;
};

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

export default async function SchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("schools")
    .select(
      "id,name,authority,ownership,city,province,school_programs(id,name,form_code,grades),school_subscriptions(plan_code,ai_mode),curriculum_packs!schools_curriculum_pack_fk(name,code,version,verified)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const school = data as unknown as School;
  const pack = one(school.curriculum_packs);
  const sub = one(school.school_subscriptions);

  return (
    <>
      <Link href="/dashboard" className="text-sm text-pen underline">
        ← Semua sekolah
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{school.name}</h1>
      <p className="mt-1 text-ink-soft">
        {[school.city, school.province].filter(Boolean).join(", ") || "Lokasi belum diisi"} ·{" "}
        {authorityLabel(school.authority)} · {school.ownership === "negeri" ? "Negeri" : "Swasta"}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Program</h2>
          {school.school_programs.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Belum ada program.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {school.school_programs.map((p) => (
                <li key={p.id} className="flex justify-between gap-3 text-sm">
                  <span>{p.name}</span>
                  <span className="text-ink-soft">
                    {p.grades.length > 0 ? `Kelas ${Math.min(...p.grades)}–${Math.max(...p.grades)}` : "Kelas bebas"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Kurikulum</h2>
          {pack ? (
            <p className="mt-2 text-sm">
              {pack.name} ({pack.version})
              {!pack.verified ? (
                <span className="ml-2 text-xs text-warn">draf, belum diverifikasi</span>
              ) : null}
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">Belum dipilih.</p>
          )}
          <h2 className="mt-5 text-lg font-semibold">Paket</h2>
          <p className="mt-2 text-sm">
            {sub ? `${sub.plan_code} · AI: ${sub.ai_mode === "off" ? "nonaktif" : sub.ai_mode}` : "Belum ada langganan"}
          </p>
        </Card>
      </div>
    </>
  );
}
