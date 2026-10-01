import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { ReportSheet, type Extras } from "@/components/report-sheet";
import { Button, ErrorNote, InfoNote, Input, Label, Select, Textarea } from "@/components/ui";
import { currentTerm, finalGrade } from "@/lib/grades";
import { enabledModuleCodes, requireModule } from "@/lib/modules";
import { DEFAULT_REPORT_CONFIG, sanitizeConfig } from "@/lib/report-config";
import { first, getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { saveExtras, saveReportNote } from "../actions";

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
  const terms = (termRows ?? []) as unknown as { id: string; name: string; starts_on: string; ends_on: string; academic_years: One<{ name: string }> }[];
  const term = terms.find((t) => t.id === sp.term) ?? currentTerm(terms, today());
  const { data: member } = await supabase.from("school_members").select("id,display_name").eq("id", memberId).eq("school_id", id).maybeSingle();
  if (!member || !term) notFound();
  if (me.roleCode === "student" && me.memberId !== memberId) notFound();

  const [{ data: enr }, { data: school }, { data: gs }, { data: tpl }, { data: prof }] = await Promise.all([
    supabase.from("class_group_students").select("class_groups(id,name,homeroom_member_id)").eq("school_id", id).eq("member_id", memberId).limit(1).maybeSingle(),
    supabase.from("schools").select("name,city,province").eq("id", id).maybeSingle(),
    supabase.from("gradebook_settings").select("pass_mark").eq("school_id", id).maybeSingle(),
    supabase.from("report_templates").select("config").eq("school_id", id).eq("is_default", true).maybeSingle(),
    mods.has("admin_records") ? supabase.from("member_profiles").select("nis,nisn").eq("member_id", memberId).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const cg = first((enr?.class_groups ?? null) as One<{ id: string; name: string; homeroom_member_id: string | null }>);
  const { data: hr } = cg?.homeroom_member_id ? await supabase.from("school_members").select("display_name").eq("id", cg.homeroom_member_id).maybeSingle() : { data: null };
  const pass = (gs?.pass_mark as number | undefined) ?? 70;
  const config = tpl?.config ? sanitizeConfig(tpl.config) : DEFAULT_REPORT_CONFIG;

  const [subs, sc, att, note, ex] = await Promise.all([
    cg ? supabase.from("teaching_assignments").select("school_subjects(id,name)").eq("class_group_id", cg.id) : Promise.resolve({ data: [] }),
    supabase.from("assessment_scores").select("score,assessments!inner(title,weight,max_score,term_id,school_subject_id)").eq("member_id", memberId).eq("assessments.term_id", term.id),
    mods.has("attendance") ? supabase.from("attendance_records").select("status").eq("member_id", memberId).gte("on_date", term.starts_on).lte("on_date", term.ends_on) : Promise.resolve({ data: [] as { status: string }[] }),
    supabase.from("report_notes").select("note").eq("term_id", term.id).eq("member_id", memberId).maybeSingle(),
    supabase.from("report_extras").select("section,data").eq("term_id", term.id).eq("member_id", memberId),
  ]);
  const names = new Map<string, string>();
  for (const r of (subs.data ?? []) as unknown as { school_subjects: One<{ id: string; name: string }> }[]) { const s = first(r.school_subjects); if (s) names.set(s.id, s.name); }
  const by = new Map<string, { weight: number; maxScore: number; score: number | null; title: string }[]>();
  for (const r of (sc.data ?? []) as unknown as { score: number | null; assessments: One<{ title: string; weight: number; max_score: number; school_subject_id: string }> }[]) {
    const a = first(r.assessments); if (!a) continue;
    by.set(a.school_subject_id, [...(by.get(a.school_subject_id) ?? []), { weight: a.weight, maxScore: Number(a.max_score), score: r.score === null ? null : Number(r.score), title: a.title }]);
  }
  const subjects = [...names.entries()].map(([sid, name]) => {
    const list = by.get(sid) ?? [];
    return { name, grade: finalGrade(list), items: list.filter((x) => x.score !== null).map((x) => ({ title: x.title, pct: Math.round(((x.score as number) / x.maxScore) * 1000) / 10 })) };
  }).sort((a, b) => a.name.localeCompare(b.name));
  const counts: Record<string, number> = {};
  for (const r of att.data ?? []) counts[r.status as string] = (counts[r.status as string] ?? 0) + 1;
  const extras: Extras = {};
  for (const r of (ex.data ?? []) as { section: string; data: unknown }[]) (extras as Record<string, unknown>)[r.section] = r.data;
  const canWrite = MANAGEMENT_ROLES.has(me.roleCode) || (cg?.homeroom_member_id != null && cg.homeroom_member_id === me.memberId);
  const year = first(term.academic_years)?.name ?? "";

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
      <div className="mt-4">
        <ReportSheet
          school={{ name: school?.name as string, city: (school?.city as string | null) ?? null, province: (school?.province as string | null) ?? null }}
          student={{ name: (member.display_name as string) ?? "Siswa", className: cg?.name ?? null, nis: (prof?.nis as string | null) ?? null, nisn: (prof?.nisn as string | null) ?? null }}
          termName={term.name} year={year} homeroom={(hr?.display_name as string | undefined) ?? ""} pass={pass}
          subjects={subjects} attendance={mods.has("attendance") ? counts : null} note={(note.data?.note as string | undefined) ?? null} extras={extras} config={config}
        />
      </div>

      {canWrite ? (
        <div className="no-print mt-6 space-y-4">
          {config.sections.catatan ? (
            <form action={saveReportNote.bind(null, id, memberId, term.id)} className="surface p-4">
              <label><Label>Catatan wali kelas</Label><Textarea name="note" rows={3} maxLength={1000} defaultValue={(note.data?.note as string | undefined) ?? ""} placeholder="Perkembangan, kekuatan, dan saran untuk semester berikutnya" /></label>
              <div className="mt-3"><Button type="submit">Simpan catatan</Button></div>
            </form>
          ) : null}
          {config.sections.sikap ? (
            <form action={saveExtras.bind(null, id, memberId, term.id, "sikap")} className="grid gap-3 surface p-4 sm:grid-cols-2">
              <h2 className="font-display text-lg font-bold sm:col-span-2">Sikap</h2>
              <label><Label>Spiritual</Label><Input name="spiritual" defaultValue={extras.sikap?.spiritual ?? ""} placeholder="mis. Baik" maxLength={30} /></label>
              <label><Label>Sosial</Label><Input name="sosial" defaultValue={extras.sikap?.sosial ?? ""} placeholder="mis. Sangat baik" maxLength={30} /></label>
              <label className="sm:col-span-2"><Label>Deskripsi</Label><Textarea name="deskripsi" rows={2} defaultValue={extras.sikap?.deskripsi ?? ""} maxLength={600} /></label>
              <div className="sm:col-span-2"><Button type="submit">Simpan sikap</Button></div>
            </form>
          ) : null}
          {config.sections.ekskul ? (
            <form action={saveExtras.bind(null, id, memberId, term.id, "ekskul")} className="surface p-4">
              <h2 className="font-display text-lg font-bold">Ekstrakurikuler</h2>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="mt-2 grid gap-2 sm:grid-cols-[2fr_1fr_3fr]">
                  <Input name={`nama_${i}`} defaultValue={extras.ekskul?.items?.[i]?.nama ?? ""} placeholder="Kegiatan" aria-label={`Kegiatan ${i + 1}`} />
                  <Input name={`predikat_${i}`} defaultValue={extras.ekskul?.items?.[i]?.predikat ?? ""} placeholder="Predikat" aria-label={`Predikat ${i + 1}`} />
                  <Input name={`keterangan_${i}`} defaultValue={extras.ekskul?.items?.[i]?.keterangan ?? ""} placeholder="Keterangan" aria-label={`Keterangan ${i + 1}`} />
                </div>
              ))}
              <div className="mt-3"><Button type="submit">Simpan ekstrakurikuler</Button></div>
            </form>
          ) : null}
          {config.sections.p5 ? (
            <form action={saveExtras.bind(null, id, memberId, term.id, "p5")} className="surface p-4">
              <label><Label hint="satu per baris: Tema: deskripsi capaian">Projek penguatan profil pelajar</Label><Textarea name="items" rows={3} defaultValue={(extras.p5?.items ?? []).map((x) => `${x.tema}: ${x.deskripsi ?? ""}`).join("\n")} /></label>
              <div className="mt-3"><Button type="submit">Simpan projek</Button></div>
            </form>
          ) : null}
          {config.sections.prestasi ? (
            <form action={saveExtras.bind(null, id, memberId, term.id, "prestasi")} className="surface p-4">
              <label><Label hint="satu per baris">Prestasi</Label><Textarea name="items" rows={3} defaultValue={(extras.prestasi?.items ?? []).join("\n")} /></label>
              <div className="mt-3"><Button type="submit">Simpan prestasi</Button></div>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
