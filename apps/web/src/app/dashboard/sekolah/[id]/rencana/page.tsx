import Link from "next/link";
import { BackLink } from "@/components/role-views";
import { ErrorNote, InfoNote } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

export const metadata = { title: "Rencana belajar · EduSmart" };

export default async function PlansPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id);
  await requireModule(supabase, id, "data_hub");
  const { data } = await supabase.from("study_plans").select("id,title,status,weeks,grade,created_at").eq("school_id", id).order("created_at", { ascending: false }).limit(50);
  return (
    <>
      <BackLink />
      <h1 className="mt-3 mb-1 font-display text-3xl font-bold tracking-tight">Rencana belajar</h1>
      <p className="max-w-2xl text-ink-soft">Analisis lengkap kurikulum atau buku: bab, cara belajar tiap elemen, serta jadwal ulangan dan tugas beserta alasannya. Mulai dari menu Berkas pada berkas kurikulum atau buku.</p>
      <div className="mt-3 space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      <ul className="mt-6 divide-y divide-line surface">
        {(data ?? []).length === 0 ? <li className="p-4 text-ink-soft">Belum ada rencana. Buka <Link href={`/dashboard/sekolah/${id}/berkas`} className="font-semibold text-pen underline">Berkas</Link>, pilih berkas kurikulum/buku, lalu “Rencana belajar lengkap”.</li> : null}
        {(data ?? []).map((p) => (
          <li key={p.id as string} className="flex flex-wrap items-center justify-between gap-2 p-4">
            <Link href={`/dashboard/sekolah/${id}/rencana/${p.id}`} className="font-semibold text-pen underline">{p.title as string}</Link>
            <span className="text-sm text-ink-soft">Kelas {p.grade as number} · {p.weeks as number} minggu · <span className={p.status === "selesai" ? "font-semibold text-ok" : ""}>{p.status === "selesai" ? "Selesai" : "Belum selesai"}</span></span>
          </li>
        ))}
      </ul>
    </>
  );
}
