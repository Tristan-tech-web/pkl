import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { ReportSheet, type Extras } from "@/components/report-sheet";
import { Button, Label, Select } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { DEFAULT_REPORT_CONFIG, sanitizeConfig } from "@/lib/report-config";
import { getSchoolContext } from "@/lib/school";

export const metadata = { title: "Rapor anak · EduSmart" };
type R = {
  name: string; class: string | null; homeroom: string | null; year: string | null; school: { name: string; city: string | null; province: string | null };
  subjects: string[]; term: { id: string; name: string } | null; attendance: Record<string, number> | null;
  grades: { subject: string; grade: number }[] | null; pass_mark: number | null; note: string | null;
};
type X = { template: unknown; extras: Extras; assessments: { subject: string; items: { title: string; pct: number }[] }[] };

// Rapor untuk wali: seluruh data datang dari RPC (child_overview, child_report_extra) yang memeriksa perwalian dan modul.
export default async function ChildReport({ params, searchParams }: { params: Promise<{ id: string; childId: string }>; searchParams: Promise<{ term?: string }> }) {
  const { id, childId } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "parent_portal");
  if (me.roleCode !== "parent") notFound();
  const { data, error } = await supabase.rpc("child_overview", { p_school_id: id, p_child_id: childId, p_term_id: sp.term ?? null });
  if (error || !data) notFound();
  const r = data as R;
  if (!r.grades || !r.term) notFound(); // modul nilai dan rapor tidak aktif di paket ini
  const { data: xd } = await supabase.rpc("child_report_extra", { p_school_id: id, p_child_id: childId, p_term_id: r.term.id });
  const x = (xd ?? { template: null, extras: {}, assessments: [] }) as X;
  const { data: terms } = await supabase.from("terms").select("id,name").eq("school_id", id).order("starts_on");
  const config = x.template ? sanitizeConfig(x.template) : DEFAULT_REPORT_CONFIG;
  const grade = new Map(r.grades.map((g) => [g.subject, g.grade]));
  const items = new Map(x.assessments.map((a) => [a.subject, a.items]));
  const subjects = [...new Set([...r.subjects, ...r.grades.map((g) => g.subject)])].sort().map((name) => ({ name, grade: grade.get(name) ?? null, items: items.get(name) ?? [] }));
  return (
    <article className="report">
      <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
        <a href={`/dashboard/sekolah/${id}`} className="text-sm font-semibold text-pen underline">← Beranda</a>
        <div className="flex flex-wrap items-end gap-3">
          <form method="get" className="flex items-end gap-2">
            <label><Label>Semester</Label><Select name="term" defaultValue={r.term.id}>{(terms ?? []).map((t) => <option key={t.id as string} value={t.id as string}>{t.name as string}</option>)}</Select></label>
            <Button type="submit" variant="ghost">Ganti</Button>
          </form>
          <PrintButton />
        </div>
      </div>
      <ReportSheet
        school={r.school} student={{ name: r.name, className: r.class }} termName={r.term.name} year={r.year ?? "–"} homeroom={r.homeroom ?? ""} pass={r.pass_mark ?? 70}
        subjects={subjects} attendance={r.attendance} note={r.note} extras={x.extras ?? {}} config={config}
      />
    </article>
  );
}
