import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { Button, Label, Select } from "@/components/ui";
import { predicate } from "@/lib/grades";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

export const metadata = { title: "Rapor anak · EduSmart" };
type R = {
  name: string; class: string | null; homeroom: string | null; year: string | null; school: { name: string; city: string | null; province: string | null };
  subjects: string[]; term: { id: string; name: string } | null; attendance: Record<string, number> | null;
  grades: { subject: string; grade: number }[] | null; pass_mark: number | null; note: string | null;
};

// Rapor untuk wali: seluruh data datang dari RPC child_overview yang memeriksa perwalian dan modul.
export default async function ChildReport({ params, searchParams }: { params: Promise<{ id: string; childId: string }>; searchParams: Promise<{ term?: string }> }) {
  const { id, childId } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "parent_portal");
  if (me.roleCode !== "parent") notFound();
  const { data, error } = await supabase.rpc("child_overview", { p_school_id: id, p_child_id: childId, p_term_id: sp.term ?? null });
  if (error || !data) notFound();
  const r = data as R;
  if (!r.grades) notFound(); // modul nilai dan rapor tidak aktif di paket ini
  const { data: terms } = await supabase.from("terms").select("id,name").eq("school_id", id).order("starts_on");
  const pass = r.pass_mark ?? 70;
  const byName = new Map(r.grades.map((g) => [g.subject, g.grade]));
  const rows = [...new Set([...r.subjects, ...r.grades.map((g) => g.subject)])].sort().map((name) => ({ name, grade: byName.get(name) ?? null }));
  const where = [r.school.city, r.school.province].filter(Boolean).join(", ");
  const att = r.attendance;
  return (
    <article className="report">
      <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
        <a href={`/dashboard/sekolah/${id}`} className="text-sm font-semibold text-pen underline">← Beranda</a>
        <div className="flex flex-wrap items-end gap-3">
          <form method="get" className="flex items-end gap-2">
            <label><Label>Semester</Label><Select name="term" defaultValue={r.term?.id}>{(terms ?? []).map((t) => <option key={t.id as string} value={t.id as string}>{t.name as string}</option>)}</Select></label>
            <Button type="submit" variant="ghost">Ganti</Button>
          </form>
          <PrintButton />
        </div>
      </div>
      <div className="rounded-[6px] border border-line bg-card p-6 sm:p-8">
        <header className="border-b-2 border-ink pb-3 text-center">
          <p className="font-display text-2xl font-bold">{r.school.name}</p>
          {where ? <p className="text-sm text-ink-soft">{where}</p> : null}
          <h1 className="mt-2 font-display text-xl font-bold tracking-wide">LAPORAN HASIL BELAJAR (RAPOR)</h1>
        </header>
        <dl className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <div className="flex gap-2"><dt className="w-28 text-ink-soft">Nama</dt><dd className="font-semibold">{r.name}</dd></div>
          <div className="flex gap-2"><dt className="w-28 text-ink-soft">Kelas</dt><dd className="font-semibold">{r.class ?? "–"}</dd></div>
          <div className="flex gap-2"><dt className="w-28 text-ink-soft">Semester</dt><dd className="font-semibold">{r.term?.name ?? "–"}</dd></div>
          <div className="flex gap-2"><dt className="w-28 text-ink-soft">Tahun ajaran</dt><dd className="font-semibold">{r.year ?? "–"}</dd></div>
        </dl>
        <h2 className="mt-6 font-display text-lg font-bold">A. Nilai mata pelajaran</h2>
        <table className="mt-2 w-full text-left">
          <thead><tr className="border-b-2 border-ink text-sm"><th className="w-10 py-2">No</th><th>Mata pelajaran</th><th className="num text-right">Nilai akhir</th><th className="px-3 text-center">Predikat</th><th className="text-right">Keterangan</th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={5} className="py-4 text-ink-soft">Belum ada mata pelajaran.</td></tr> : rows.map((x, i) => (
              <tr key={x.name} className="border-b border-line">
                <td className="num py-2">{i + 1}</td><td className="font-semibold">{x.name}</td>
                <td className="num text-right font-bold">{x.grade ?? "–"}</td><td className="px-3 text-center font-semibold">{predicate(x.grade)}</td>
                <td className={`text-right text-sm ${x.grade !== null && x.grade < pass ? "font-semibold text-bad" : "text-ink-soft"}`}>{x.grade === null ? "Belum dinilai" : x.grade >= pass ? "Tuntas" : "Belum tuntas"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-ink-soft">Nilai akhir = rata-rata berbobot penilaian semester ini. Ambang ketuntasan sekolah: {pass}. Predikat memakai skala bawaan EduSmart (A ≥ 90, B ≥ 80, C ≥ 70, D lainnya).</p>
        {att ? (
          <>
            <h2 className="mt-6 font-display text-lg font-bold">B. Kehadiran</h2>
            <table className="mt-2 w-full max-w-md text-left"><tbody>
              {[["hadir", "Hadir"], ["terlambat", "Terlambat"], ["izin", "Izin"], ["sakit", "Sakit"], ["alpa", "Tanpa keterangan"]].map(([k, l]) => (
                <tr key={k} className="border-b border-line"><td className="py-1.5">{l}</td><td className="num text-right font-semibold">{att[k] ?? 0} hari</td></tr>
              ))}
            </tbody></table>
          </>
        ) : null}
        <h2 className="mt-6 font-display text-lg font-bold">{att ? "C" : "B"}. Catatan wali kelas</h2>
        <p className="mt-2 min-h-12 whitespace-pre-wrap rounded-[6px] border border-line p-3">{r.note ?? "–"}</p>
        <div className="mt-10 grid grid-cols-3 gap-4 text-center text-sm">
          {[["Orang tua/wali", ""], ["Wali kelas", r.homeroom ?? ""], ["Kepala sekolah", ""]].map(([role, name]) => (
            <div key={role}><p>{role}</p><div className="h-16" /><p className="border-t border-ink pt-1 font-semibold">{name || " "}</p></div>
          ))}
        </div>
      </div>
    </article>
  );
}
