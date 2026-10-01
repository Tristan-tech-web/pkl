import { notFound } from "next/navigation";
import { BankRunner } from "@/components/bank-runner";
import { Button } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import { deleteJob } from "../actions";

export const metadata = { title: "Membuat bank soal · EduSmart" };
export const maxDuration = 120;

export default async function BankJobPage({ params }: { params: Promise<{ id: string; jobId: string }> }) {
  const { id, jobId } = await params;
  const { supabase } = await getSchoolContext(id);
  await requireModule(supabase, id, "learning");
  const { data: j } = await supabase.from("bank_jobs").select("target,made,rejected,status,auto_publish,school_subjects(name),school_files(name)").eq("id", jobId).eq("school_id", id).maybeSingle();
  if (!j) notFound();
  const one = <T,>(v: T | T[] | null) => (Array.isArray(v) ? v[0] : v);
  const pct = Math.min(100, Math.round(((j.made as number) / (j.target as number)) * 100));
  return (
    <>
      <a href={`/dashboard/sekolah/${id}/bank`} className="text-sm font-semibold text-pen underline">← Bank soal</a>
      <h1 className="mt-3 mb-1 font-display text-3xl font-bold tracking-tight">Membuat bank soal</h1>
      <p className="text-ink-soft">{(one(j.school_subjects) as { name: string } | null)?.name} dari {(one(j.school_files) as { name: string } | null)?.name}. Target {j.target as number} butir. Tiap butir diperiksa: bentuk soal, duplikat, kutipan di buku, dan dijawab ulang tanpa kunci. {j.auto_publish ? "Yang lolos semua langsung terbit." : "Yang lolos masuk draf untuk Anda setujui sekaligus."} Boleh ditinggal dan dilanjutkan.</p>
      <div className="mt-4"><BankRunner schoolId={id} jobId={jobId} startPct={pct} startLabel={j.status === "selesai" ? "Selesai" : `${j.made as number} butir sejauh ini`} /></div>
      <p className="mt-4"><a href={`/dashboard/sekolah/${id}/bank`} className="btn-ghost inline-flex min-h-11 items-center rounded-box px-4 font-semibold">Tinjau butir</a></p>
      <form action={deleteJob.bind(null, id, jobId)} className="mt-8"><Button type="submit" variant="ghost">Hapus pekerjaan ini (butir tetap ada)</Button></form>
    </>
  );
}
