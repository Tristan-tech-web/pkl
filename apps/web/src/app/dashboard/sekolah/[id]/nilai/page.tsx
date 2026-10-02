import "@/components/island/island.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/role-views";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { currentTerm, finalGrade, KIND_LABEL, predicate } from "@/lib/grades";
import { requireModule } from "@/lib/modules";
import { first, getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { createAssessment } from "./actions";

export const metadata = { title: "Nilai · EduSmart" };
const TEACHING = new Set(["teacher", "homeroom", "counselor"]);
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
type SP = { pair?: string; term?: string; error?: string; info?: string };
type Terms = { id: string; name: string; starts_on: string; ends_on: string }[];

export default async function NilaiPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "gradebook");
  const { data: termRows } = await supabase.from("terms").select("id,name,starts_on,ends_on").eq("school_id", id).order("starts_on");
  const terms = (termRows ?? []) as Terms;
  const term = terms.find((t) => t.id === sp.term) ?? currentTerm(terms, today());
  if (me.roleCode === "student") return <StudentGrades schoolId={id} memberId={me.memberId} terms={terms} term={term} />;
  const management = MANAGEMENT_ROLES.has(me.roleCode);
  if (!management && !TEACHING.has(me.roleCode)) notFound();

  let q = supabase.from("teaching_assignments").select("class_group_id,school_subject_id,class_groups(name),school_subjects(name)").eq("school_id", id);
  if (!management) q = q.eq("teacher_member_id", me.memberId);
  const { data: ta } = await q;
  const seen = new Set<string>();
  const pairs = ((ta ?? []) as unknown as { class_group_id: string; school_subject_id: string; class_groups: { name: string } | { name: string }[] | null; school_subjects: { name: string } | { name: string }[] | null }[])
    .map((r) => ({ key: `${r.class_group_id}:${r.school_subject_id}`, classId: r.class_group_id, subjectId: r.school_subject_id, label: `${first(r.class_groups)?.name ?? "?"} · ${first(r.school_subjects)?.name ?? "?"}` }))
    .filter((p) => (seen.has(p.key) ? false : (seen.add(p.key), true)))
    .sort((a, b) => a.label.localeCompare(b.label));
  const pair = pairs.find((p) => p.key === sp.pair) ?? pairs[0];

  let assessments: { id: string; title: string; kind: string; weight: number; max_score: number; held_on: string | null }[] = [];
  let students: { id: string; name: string }[] = [];
  const scores = new Map<string, Map<string, number | null>>();
  if (pair && term) {
    const [a, roster] = await Promise.all([
      supabase.from("assessments").select("id,title,kind,weight,max_score,held_on").eq("class_group_id", pair.classId).eq("school_subject_id", pair.subjectId).eq("term_id", term.id).order("created_at"),
      supabase.from("class_group_students").select("member_id,school_members(display_name)").eq("class_group_id", pair.classId),
    ]);
    assessments = (a.data ?? []) as typeof assessments;
    students = ((roster.data ?? []) as unknown as { member_id: string; school_members: { display_name: string | null } | { display_name: string | null }[] | null }[])
      .map((r) => ({ id: r.member_id, name: first(r.school_members)?.display_name ?? "Tanpa nama" })).sort((x, y) => x.name.localeCompare(y.name));
    if (assessments.length) {
      const { data: sc } = await supabase.from("assessment_scores").select("assessment_id,member_id,score").in("assessment_id", assessments.map((x) => x.id));
      for (const s of sc ?? []) {
        const m = scores.get(s.member_id as string) ?? new Map();
        m.set(s.assessment_id as string, s.score === null ? null : Number(s.score));
        scores.set(s.member_id as string, m);
      }
    }
  }
  const { data: gs } = await supabase.from("gradebook_settings").select("pass_mark").eq("school_id", id).maybeSingle();
  const pass = (gs?.pass_mark as number | undefined) ?? 70;

  return (
    <>
      {management ? <SchoolNav schoolId={id} active="nilai" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Nilai</h1>
        <p className="mt-1 text-ink-soft">Buat penilaian per rombel, mapel, dan semester. Nilai akhir = rata-rata berbobot dari nilai yang sudah terisi. Ambang ketuntasan sekolah: <span className="num font-semibold">{pass}</span>.</p>
      </header>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      {pairs.length === 0 || !term ? (
        <p className="mt-6 rounded-box border border-dashed border-line p-6 text-ink-soft">
          {pairs.length === 0 ? "Belum ada penugasan mengajar." : "Belum ada semester. Pengelola perlu membuat tahun ajaran dulu."}
        </p>
      ) : (
        <>
          <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
            <label><Label>Rombel dan mapel</Label>
              <Select name="pair" defaultValue={pair.key}>{pairs.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</Select></label>
            <label><Label>Semester</Label>
              <Select name="term" defaultValue={term.id}>{terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></label>
            <Button type="submit" variant="ghost">Tampilkan</Button>
          </form>

          <section className="mt-8">
            <h2 className="font-display text-2xl font-bold tracking-tight">Penilaian</h2>
            {assessments.length === 0 ? (
              <p className="mt-3 rounded-box border border-dashed border-line p-5 text-ink-soft">Belum ada penilaian untuk pilihan ini.</p>
            ) : (
              <ul className="stagger mt-3 border-t border-line">
                {assessments.map((a) => (
                  <li key={a.id} className="border-b border-line">
                    <Link href={`/dashboard/sekolah/${id}/nilai/${a.id}`} className="flex flex-wrap items-baseline justify-between gap-3 py-3 hover:text-pen">
                      <span className="font-semibold">{a.title} <span className="font-normal text-ink-soft">· {KIND_LABEL[a.kind]}</span></span>
                      <span className="num text-sm text-ink-soft">bobot {a.weight} · maks {Number(a.max_score)}{a.held_on ? ` · ${a.held_on}` : ""}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <form action={createAssessment.bind(null, id)} className="mt-4 grid gap-3 surface p-4 sm:grid-cols-6">
              <input type="hidden" name="class_id" value={pair.classId} />
              <input type="hidden" name="subject_id" value={pair.subjectId} />
              <input type="hidden" name="term_id" value={term.id} />
              <label className="sm:col-span-2"><Label>Judul</Label><Input name="title" required minLength={2} maxLength={120} placeholder="mis. Ulangan harian 1" /></label>
              <label><Label>Jenis</Label><Select name="kind" defaultValue="tugas">{Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></label>
              <label><Label>Bobot</Label><Input name="weight" type="number" min={1} max={100} defaultValue={1} /></label>
              <label><Label>Maks</Label><Input name="max_score" type="number" min={1} max={1000} defaultValue={100} /></label>
              <label><Label>Tanggal</Label><Input name="held_on" type="date" /></label>
              <div className="sm:col-span-6"><Button type="submit">Buat penilaian</Button></div>
            </form>
          </section>

          {students.length > 0 && assessments.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold tracking-tight">Nilai akhir sementara</h2>
              <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Nilai akhir sementara">
                <table className="w-full min-w-[28rem] text-left">
                  <thead><tr className="border-b-2 border-ink text-sm"><th className="py-2 pr-3">Siswa</th><th className="num px-2 text-right">Terisi</th><th className="num px-2 text-right">Nilai akhir</th><th className="px-2 text-right">Predikat</th></tr></thead>
                  <tbody>
                    {students.map((s) => {
                      const m = scores.get(s.id);
                      const g = finalGrade(assessments.map((a) => ({ weight: a.weight, maxScore: Number(a.max_score), score: m?.get(a.id) ?? null })));
                      const filled = assessments.filter((a) => m?.get(a.id) != null).length;
                      return (
                        <tr key={s.id} className="border-b border-line">
                          <td className="py-2 pr-3 font-semibold">{s.name}</td>
                          <td className="num px-2 text-right text-ink-soft">{filled}/{assessments.length}</td>
                          <td className={`num px-2 text-right font-bold ${g !== null && g < pass ? "text-bad" : ""}`}>{g ?? "–"}</td>
                          <td className="px-2 text-right font-semibold">{predicate(g)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      )}
    </>
  );
}

// Kalimat penyemangat yang konkret: berapa poin lagi ke predikat berikutnya.
function gradeHint(g: number | null): string {
  if (g === null) return "Belum ada nilai akhir.";
  if (g >= 90) return "Predikat tertinggi. Pertahankan.";
  const next = g >= 80 ? [90, "A"] : g >= 70 ? [80, "B"] : [70, "C"];
  return `Tinggal ${Math.ceil(Number(next[0]) - g)} poin lagi ke ${next[1]}.`;
}

async function StudentGrades({ schoolId, memberId, terms, term }: { schoolId: string; memberId: string; terms: Terms; term: Terms[number] | undefined }) {
  const { supabase } = await getSchoolContext(schoolId);
  const { data } = term
    ? await supabase.from("assessment_scores").select("score,assessments!inner(id,title,kind,weight,max_score,term_id,school_subject_id,school_subjects(name))").eq("member_id", memberId).eq("assessments.term_id", term.id)
    : { data: [] };
  type Row = { score: number | null; assessments: { id: string; title: string; kind: string; weight: number; max_score: number; school_subjects: { name: string } | { name: string }[] | null } | { id: string; title: string; kind: string; weight: number; max_score: number; school_subjects: { name: string } | { name: string }[] | null }[] };
  const bySubject = new Map<string, { title: string; kind: string; weight: number; max: number; score: number | null }[]>();
  for (const r of (data ?? []) as unknown as Row[]) {
    const a = first(r.assessments);
    if (!a) continue;
    const name = first(a.school_subjects)?.name ?? "Mata pelajaran";
    bySubject.set(name, [...(bySubject.get(name) ?? []), { title: a.title, kind: a.kind, weight: a.weight, max: Number(a.max_score), score: r.score === null ? null : Number(r.score) }]);
  }
  return (
    <>
      <BackLink />
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Nilaiku</h1>
        <p className="mt-1 text-ink-soft">Nilai akhir tiap mapel dihitung dari semua penilaian, sesuai bobotnya.</p>
        <form method="get" className="mt-3 flex items-end gap-3">
          <label><Label>Semester</Label><Select name="term" defaultValue={term?.id}>{terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></label>
          <Button type="submit" variant="ghost">Tampilkan</Button>
        </form>
      </header>
      {bySubject.size === 0 ? (
        <p className="rounded-box border border-dashed border-line p-6 text-ink-soft">Belum ada nilai di semester ini.</p>
      ) : (
        [...bySubject.entries()].map(([subject, items]) => {
          const g = finalGrade(items.map((i) => ({ weight: i.weight, maxScore: i.max, score: i.score })));
          return (
            <section key={subject} className="surface mt-5 p-4">
              <div className="flex items-center gap-4">
                <span className="grade-ring" style={{ ["--g" as string]: Math.max(0, Math.min(100, g ?? 0)) }} role="img" aria-label={g === null ? "Belum ada nilai akhir" : `Nilai akhir ${g}, predikat ${predicate(g)}`}>
                  <b className="font-display">{predicate(g)}</b>
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-extrabold leading-tight">{subject}</h2>
                  <p className="num text-2xl font-extrabold">{g ?? "–"}</p>
                  <p className="text-sm font-semibold text-ink-soft">{gradeHint(g)}</p>
                </div>
              </div>
              <ul className="mt-3">{items.map((i) => (
                <li key={i.title} className="border-t border-line py-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span>{i.title} <span className="text-sm text-ink-soft">· {KIND_LABEL[i.kind]} · bobot {i.weight}</span></span>
                    <span className="num font-semibold">{i.score ?? "–"}<span className="font-normal text-ink-soft">/{i.max}</span></span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true"><div className="h-full rounded-full bg-pen" style={{ width: `${i.score === null ? 0 : Math.min(100, (i.score / i.max) * 100)}%` }} /></div>
                </li>
              ))}</ul>
            </section>
          );
        })
      )}
    </>
  );
}
