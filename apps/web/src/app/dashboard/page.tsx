import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { authorityLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard · EduSmart" };

type SchoolRow = {
  id: string;
  name: string;
  city: string | null;
  province: string | null;
  authority: string;
  school_programs: { id: string; name: string }[];
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("schools")
    .select("id,name,city,province,authority,school_programs(id,name)")
    .order("created_at", { ascending: false });
  const schools = (data ?? []) as SchoolRow[];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">Sekolah Anda</h1>
        <LinkButton href="/dashboard/sekolah-baru">Buat sekolah</LinkButton>
      </div>
      {schools.length === 0 ? (
        <Card>
          <h2 className="text-lg font-semibold">Belum ada sekolah</h2>
          <p className="mt-2 text-ink-soft">
            Buat sekolah pertama Anda. Anda cukup memilih bentuk pendidikan dan paket kurikulum;
            sisanya bisa diatur nanti.
          </p>
          <div className="mt-4">
            <LinkButton href="/dashboard/sekolah-baru">Buat sekolah</LinkButton>
          </div>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {schools.map((s) => (
            <li key={s.id}>
              <Link href={`/dashboard/sekolah/${s.id}`} className="block rounded-2xl focus-visible:outline-3 focus-visible:outline-pen">
                <Card className="transition hover:border-pen">
                  <h2 className="text-lg font-semibold">{s.name}</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    {[s.city, s.province].filter(Boolean).join(", ") || "Lokasi belum diisi"} ·{" "}
                    {authorityLabel(s.authority)}
                  </p>
                  <p className="mt-3 text-sm">
                    {s.school_programs.length > 0
                      ? s.school_programs.map((p) => p.name).join(" · ")
                      : "Belum ada program"}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
