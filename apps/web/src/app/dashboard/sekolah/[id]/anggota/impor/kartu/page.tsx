import { CopyButton } from "@/components/copy-button";
import { PrintButton } from "@/components/print-button";
import { csvEscape } from "@/lib/csv";
import { first, getSchoolContext } from "@/lib/school";

export const metadata = { title: "Kartu kode · EduSmart" };

export default async function KartuPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ n?: string }> }) {
  const { id } = await params;
  const { n } = await searchParams;
  const { supabase, school } = await getSchoolContext(id, { management: true });
  const count = Math.min(300, Math.max(1, Number(n) || 1));
  const { data } = await supabase
    .from("invites")
    .select("code,label,expires_at,roles(name),class_groups(name)")
    .eq("school_id", id)
    .not("label", "is", null)
    .order("created_at", { ascending: false })
    .limit(count);
  type Row = { code: string; label: string; expires_at: string; roles: { name: string } | { name: string }[] | null; class_groups: { name: string } | { name: string }[] | null };
  const rows = ((data ?? []) as unknown as Row[]).reverse();
  const csv = ["nama,peran,kelas,kode,berlaku_sampai", ...rows.map((r) => [r.label, first(r.roles)?.name ?? "", first(r.class_groups)?.name ?? "", r.code, r.expires_at.slice(0, 10)].map(csvEscape).join(","))].join("\n");
  return (
    <article className="report">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <a href={`/dashboard/sekolah/${id}/anggota`} className="text-sm font-semibold text-pen underline">← Anggota</a>
        <div className="flex gap-3"><CopyButton text={csv} label="Salin sebagai CSV" /><PrintButton /></div>
      </div>
      <h1 className="no-print font-display text-3xl font-bold tracking-tight">{rows.length} kode undangan dibuat</h1>
      <p className="no-print mb-6 mt-1 text-ink-soft">Cetak kartu ini dan bagikan satu per orang. Kode hanya berlaku sekali.</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
        {rows.map((r) => (
          <li key={r.code} className="break-inside-avoid rounded-[6px] border border-line bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{school.name}</p>
            <p className="mt-1 text-lg font-bold">{r.label}</p>
            <p className="text-sm text-ink-soft">{first(r.roles)?.name}{first(r.class_groups)?.name ? ` · ${first(r.class_groups)?.name}` : ""}</p>
            <p className="num mt-2 font-display text-3xl font-bold tracking-[0.15em]">{r.code}</p>
            <p className="num mt-1 text-xs text-ink-soft">Berlaku sampai {r.expires_at.slice(0, 10)} · masukkan di halaman Gabung</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
