import { notFound } from "next/navigation";
import { LaunchLink } from "@/components/launch-link";
import { Button, ErrorNote } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import { startInBrowser } from "../../actions";

export const metadata = { title: "Mulai ujian · EduSmart" };

export default async function LaunchPage({ params }: { params: Promise<{ id: string; examId: string }> }) {
  const { id, examId } = await params;
  const { supabase } = await getSchoolContext(id);
  await requireModule(supabase, id, "exams");
  const { data: e } = await supabase.from("exams").select("title,instructions,duration_minutes,secure_required").eq("id", examId).eq("school_id", id).maybeSingle();
  if (!e) notFound();
  const { data: code, error } = await supabase.rpc("exam_issue_launch", { p_exam: examId });
  return (
    <>
      <a href={`/dashboard/sekolah/${id}/ujian`} className="text-sm font-semibold text-pen underline">← Ujian</a>
      <h1 className="mt-3 mb-1 font-display text-3xl font-bold tracking-tight">{e.title as string}</h1>
      <p className="text-ink-soft">{e.duration_minutes as number} menit. Waktu dihitung server sejak kamu menekan Mulai di aplikasi.</p>
      {error || !code ? <div className="mt-4"><ErrorNote message="Ujian belum bisa dimulai. Pastikan ujian sedang dibuka dan belum kamu kumpulkan." /></div> : (
        <section className="mt-6 rounded-[6px] border border-line bg-card p-5" aria-label="Buka aplikasi ujian">
          <h2 className="font-display text-xl font-bold">1. Buka aplikasi ujian</h2>
          <p className="mt-1 text-sm text-ink-soft">Aplikasi akan mengunci perangkat: tidak bisa membuka aplikasi lain, tangkapan layar, atau jendela melayang selama ujian. Kode ini berlaku 5 menit dan sekali pakai.</p>
          <LaunchLink code={code as string} />
          <h2 className="mt-6 font-display text-xl font-bold">Belum punya aplikasinya?</h2>
          <p className="mt-1"><a href="/ujian/aplikasi" className="font-semibold text-pen underline">Unduh aplikasi ujian (Android, iOS, Windows)</a></p>
          {e.instructions ? <><h2 className="mt-6 font-display text-xl font-bold">Petunjuk</h2><p className="mt-1 whitespace-pre-wrap text-ink-soft">{e.instructions as string}</p></> : null}
          {!e.secure_required ? (
            <form action={startInBrowser.bind(null, id, examId)} className="mt-6 border-t border-line pt-4">
              <p className="text-sm text-ink-soft">Ujian ini boleh dikerjakan di peramban (tanpa penguncian perangkat); hasilnya ditandai “tidak terkunci”.</p>
              <Button type="submit" variant="ghost">Kerjakan di peramban</Button>
            </form>
          ) : null}
        </section>
      )}
    </>
  );
}
