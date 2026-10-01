import { notFound } from "next/navigation";
import { Button, ErrorNote, InfoNote, Input } from "@/components/ui";
import { KIND_LABEL } from "@/lib/grades";
import { requireModule } from "@/lib/modules";
import { first, getSchoolContext } from "@/lib/school";
import { deleteAssessment, saveScores } from "../actions";

export const metadata = { title: "Isi nilai · EduSmart" };

export default async function ScoreGridPage({ params, searchParams }: { params: Promise<{ id: string; assessmentId: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id, assessmentId } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "gradebook");
  if (me.roleCode === "student") notFound();
  const { data: a } = await supabase.from("assessments").select("id,title,kind,weight,max_score,class_group_id,school_subject_id,term_id,class_groups(name),school_subjects(name)").eq("id", assessmentId).maybeSingle();
  if (!a) notFound();
  const [roster, sc] = await Promise.all([
    supabase.from("class_group_students").select("member_id,school_members(display_name)").eq("class_group_id", a.class_group_id as string),
    supabase.from("assessment_scores").select("member_id,score,note").eq("assessment_id", assessmentId),
  ]);
  const have = new Map((sc.data ?? []).map((r) => [r.member_id as string, r]));
  const students = ((roster.data ?? []) as unknown as { member_id: string; school_members: { display_name: string | null } | { display_name: string | null }[] | null }[])
    .map((r) => ({ id: r.member_id, name: first(r.school_members)?.display_name ?? "Tanpa nama" })).sort((x, y) => x.name.localeCompare(y.name));
  const cls = first(a.class_groups as { name: string } | { name: string }[] | null)?.name;
  const subj = first(a.school_subjects as { name: string } | { name: string }[] | null)?.name;
  return (
    <>
      <a href={`/dashboard/sekolah/${id}/nilai?pair=${a.class_group_id}:${a.school_subject_id}&term=${a.term_id}`} className="text-sm font-semibold text-pen underline">← Semua penilaian</a>
      <header className="mt-3 mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">{cls} · {subj}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">{a.title as string}</h1>
        <p className="num text-ink-soft">{KIND_LABEL[a.kind as string]} · bobot {a.weight as number} · maks {Number(a.max_score)}</p>
      </header>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      <form action={saveScores.bind(null, id, assessmentId)} className="mt-4">
        <ul className="border-t border-line">
          {students.map((s) => (
            <li key={s.id} className="grid grid-cols-[1fr_6rem] items-center gap-3 border-b border-line py-2 sm:grid-cols-[1fr_6rem_1fr]">
              <span className="font-semibold">{s.name}</span>
              <Input name={`score:${s.id}`} inputMode="decimal" defaultValue={have.get(s.id)?.score ?? ""} placeholder="–" aria-label={`Nilai ${s.name}`} className="num text-right" />
              <Input name={`note:${s.id}`} defaultValue={(have.get(s.id)?.note as string | null) ?? ""} placeholder="Catatan" maxLength={300} aria-label={`Catatan ${s.name}`} className="col-span-2 sm:col-span-1" />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-3"><Button type="submit">Simpan nilai</Button></div>
      </form>
      <form action={deleteAssessment.bind(null, id, assessmentId)} className="mt-8">
        <Button type="submit" variant="ghost">Hapus penilaian ini</Button>
      </form>
    </>
  );
}
