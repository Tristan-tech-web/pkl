import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { Button, ErrorNote, InfoNote, Label, Select, Textarea } from "@/components/ui";
import { currentTerm, finalGrade, predicate } from "@/lib/grades";
import { enabledModuleCodes, requireModule } from "@/lib/modules";
import { first, getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { saveReportNote } from "../actions";

export const metadata = { title: "Rapor · EduSmart" };
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
type One<T> = T | T[] | null;

export default async function ReportCard({ params, searchParams }: { params: Promise<{ id: string; memberId: string }>; searchParams: Promise<{ term?: string; error?: string; info?: string }> }) {
  const { id, memberId } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "gradebook");
  const mods = await enabledModuleCodes(supabase, id);

  const { data: termRows } = await supabase.from("terms").select("id,name,starts_on,ends_on,academic_years(name)").eq("school_id", id).order("starts_on");
  const terms = ((termRows ?? []) as unknown as { id: string; name: string; starts_on: string; ends_on: string; academic_years: One<{ name: string }> }[]);
  const term = terms.find((t) => t.id === sp.term) ?? currentTerm(terms, today());
  const { data: member } = await supabase.from("school_members").select("id,display_name,roles(code)").eq("id", memberId).eq("school_id", id).maybeSingle();
  if (!member || !term) notFound();
  if (me.roleCode === "student" && me.memberId !== memberId) notFound();

  const [{ data: enr }, { data: school }, { data: gs }] = await Promise.all([
    supabase.from("class_group_students").select("class_groups(id,name,grade,homeroom_member_id)").eq("school_id", id).eq("member_id", memberId).limit(1).maybeSingle(),
    supabase.from("schools").select("name,city,province").eq("id", id).maybeSingle(),
    supabase.from("gradebook_settings").select("pass_mark").eq("school_id", id).maybeSingle(),
  ]);
  const cg = first((enr?.class_groups ?? null) as One<{ id: string; name: string; grade: number; homeroom_member_id: string | null }>);
  const { data: hr } = cg?.homeroom_member_id
    ? await supabase.from("school_members").select("display_name").eq("id", cg.homeroom_member_id).maybeSingle()
    : { data: null };
  const pass = (gs?.pass_mark as number | undefined) ?? 70;

  const [subs, sc, att, note] = await Promise.all([
    cg ? supabase.from("teaching_assignments").select("school_subjects(id,name,group_code)").eq("class_group_id", cg.id) : Promise.resolve({ data: [] }),
    supabase.from("assessment_scores").select("score,assessments!inner(weight,max_score,term_id,school_subject_id)").eq("member_id", memberId).eq("assessments.term_id", term.id),
    mods.has("attendance")
      ? supabase.from("attendance_records").select("status").eq("member_id", memberId).gte("on_date", term.starts_on).lte("on_date", term.ends_on)
      : Promise.resolve({ data: [] as { status: string }[] }),
    supabase.from("report_notes").select("note").eq("term_id", term.id).eq("member_id", memberId).maybeSingle(),
  ]);
  const subjects = new Map<string, string>();
  for (const r of (subs.data ?? []) as unknown as { school_subjects: One<{ id: string; name: string }> }[]) {
    const s = first(r.school_subjects);
    if (s) subjects.set(s.id, s.name);
  }
  const by = new Map<string, { weight: number; maxScore: number; score: number | null }[]>();
  for (const r of (sc.data ?? []) as unknown as { score: number | null; assessments: One<{ weight: number; max_score: number; school_subject_id: string }> }[]) {
    const a = first(r.assessments);
    if (!a) continue;
    by.set(a.school_subject_id, [...(by.get(a.school_subject_id) ?? []), { weight: a.weight, maxScore: Number(a.max_score), score: r.score === null ? null : Number(r.score) }]);
  }
  const rows = [...subjects.entries()].map(([sid, name]) => ({ name, grade: finalGrade(by.get(sid) ?? []) })).sort((a, b) => a.name.localeCompare(b.name));
  const counts: Record<string, number> = {};
  for (const r of att.data ?? []) counts[r.status as string] = (counts[r.status as string] ?? 0) + 1;
  const homeroom = (hr?.display_name as string | null | undefined) ?? "";
  const canWrite = MANAGEMENT_ROLES.has(me.roleCode) || (cg?.homeroom_member_id != null && cg.homeroom_member_id === me.memberId);
  const year = first(term.academic_years)?.name ?? "";
  const where = [school?.city, school?.province].filter(Boolean).join(", ");

  return (
    <article className="report">
      <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
        <a href={`/dashboard/sekolah/${id}/rapor`} className="text-sm font-semibold text-pen underline">← Daftar rapor</a>
        <div className="flex flex-wrap items-end gap-3">
          <form method="get" className="flex items-end gap-2">
            <label><Label>Semester</Label><Select name="term" defaultValue={term.id}>{terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></label>
            <Button type="submit" variant="ghost">Ganti</Button>
          </form>
          <PrintButton />
        </div>
      </div>
      <div className="no-print space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>

      <div className="mt-4 rounded-[6px] border border-line bg-card p-6 sm:p-8">
        <header className="border-b-2 border-ink pb-3 text-center">
          <p className="font-display text-2xl font-bold">{school?.name as string}</p>
          {where ? <p className="text-sm text-ink-soft">{where}</p> : null}
          <h1 className="mt-2 font-display text-xl font-bold tracking-wide">LAPORAN HASIL BELAJAR (RAPOR)</h1>
        </header>
        <dl className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <div className="flex gap-2"><dt className="w-28 text-ink-soft">Nama</dt><dd className="font-semibold">{member.display_name as string}</dd></div>
          <div className="flex gap-2"><dt className="w-28 text-ink-soft">Kelas</dt><dd className="font-semibold">{cg?.name ?? "–"}</dd></div>
          <div className="flex gap-2"><dt className="w-28 text-ink-soft">Semester</dt><dd className="font-semibold">{term.name}</dd></div>
          <div className="flex gap-2"><dt className="w-28 text-ink-soft">Tahun ajaran</dt><dd className="font-semibold">{year}</dd></div>
        </dl>

        <h2 className="mt-6 font-display text-lg font-bold">A. Nilai mata pelajaran</h2>
        <table className="mt-2 w-full text-left">
          <thead><tr className="border-b-2 border-ink text-sm"><th className="w-10 py-2">No</th><th>Mata pelajaran</th><th className="num text-right">Nilai akhir</th><th className="px-3 text-center">Predikat</th><th className="text-right">Keterangan</th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={5} className="py-4 text-ink-soft">Belum ada mata pelajaran untuk rombel ini.</td></tr> : rows.map((r, i) => (
              <tr key={r.name} className="border-b border-line">
                <td className="num py-2">{i + 1}</td><td className="font-semibold">{r.name}</td>
                <td className="num text-right font-bold">{r.grade ?? "–"}</td><td className="px-3 text-center font-semibold">{predicate(r.grade)}</td>
                <td className={`text-right text-sm ${r.grade !== null && r.grade < pass ? "font-semibold text-bad" : "text-ink-soft"}`}>{r.grade === null ? "Belum dinilai" : r.grade >= pass ? "Tuntas" : "Belum tuntas"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-ink-soft">Nilai akhir = rata-rata berbobot penilaian semester ini. Ambang ketuntasan sekolah: {pass}. Predikat memakai skala bawaan EduSmart (A ≥ 90, B ≥ 80, C ≥ 70, D lainnya).</p>

        {mods.has("attendance") ? (
          <>
            <h2 className="mt-6 font-display text-lg font-bold">B. Kehadiran</h2>
            <table className="mt-2 w-full max-w-md text-left">
              <tbody>
                {[["hadir", "Hadir"], ["terlambat", "Terlambat"], ["izin", "Izin"], ["sakit", "Sakit"], ["alpa", "Tanpa keterangan"]].map(([k, l]) => (
                  <tr key={k} className="border-b border-line"><td className="py-1.5">{l}</td><td className="num text-right font-semibold">{counts[k] ?? 0} hari</td></tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}

        <h2 className="mt-6 font-display text-lg font-bold">{mods.has("attendance") ? "C" : "B"}. Catatan wali kelas</h2>
        <p className="mt-2 min-h-12 whitespace-pre-wrap rounded-[6px] border border-line p-3">{(note.data?.note as string | undefined) ?? "–"}</p>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center text-sm">
          {[["Orang tua/wali", ""], ["Wali kelas", homeroom], ["Kepala sekolah", ""]].map(([role, name]) => (
            <div key={role}><p>{role}</p><div className="h-16" /><p className="border-t border-ink pt-1 font-semibold">{name || " "}</p></div>
          ))}
        </div>
      </div>

      {canWrite ? (
        <form action={saveReportNote.bind(null, id, memberId, term.id)} className="no-print mt-6 rounded-[6px] border border-line bg-card p-4">
          <label><Label>Catatan wali kelas</Label>
            <Textarea name="note" rows={3} maxLength={1000} defaultValue={(note.data?.note as string | undefined) ?? ""} placeholder="Perkembangan, kekuatan, dan saran untuk semester berikutnya" /></label>
          <div className="mt-3"><Button type="submit">Simpan catatan</Button></div>
        </form>
      ) : null}
    </article>
  );
}
