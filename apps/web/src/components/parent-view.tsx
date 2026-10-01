import Link from "next/link";
import { LatestAnnouncements } from "@/components/module-links";
import { predicate } from "@/lib/grades";
import { enabledModuleCodes } from "@/lib/modules";
import { createClient } from "@/lib/supabase/server";

type Overview = {
  name: string; class: string | null; term: { id: string; name: string } | null;
  attendance: Record<string, number> | null; grades: { subject: string; grade: number }[] | null; pass_mark: number | null; note: string | null;
  learning: { level: number; xp: number; streak: number; done: number; total: number } | null;
};
const ATT = [["hadir", "Hadir"], ["terlambat", "Terlambat"], ["izin", "Izin"], ["sakit", "Sakit"], ["alpa", "Tanpa keterangan"]] as const;

function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="border-t-2 border-ink pt-3">
      <p className="num font-display text-3xl font-bold">{value}</p>
      <p className="text-sm font-semibold">{label}</p>
      {hint ? <p className="text-sm text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export async function ParentView({ schoolId }: { schoolId: string }) {
  const supabase = await createClient();
  const { data: kids } = await supabase.rpc("my_children", { p_school_id: schoolId });
  const children = (kids ?? []) as { student_id: string; name: string; class_name: string | null; relation: string }[];
  if (children.length === 0) {
    return (
      <div className="bg-grid rounded-box border border-dashed border-line p-6">
        <p className="font-semibold">Belum ada anak yang terhubung</p>
        <p className="mt-1 max-w-xl text-ink-soft">Minta tata usaha sekolah menghubungkan akun Anda dengan data anak. Setelah itu ringkasan kehadiran, nilai, dan belajar tampil di sini.</p>
      </div>
    );
  }
  const overviews = await Promise.all(children.map(async (c) => ({ c, o: ((await supabase.rpc("child_overview", { p_school_id: schoolId, p_child_id: c.student_id })).data ?? null) as Overview | null })));
  return (
    <>
      {overviews.map(({ c, o }) => {
        if (!o) return null;
        const att = o.attendance;
        const total = att ? Object.values(att).reduce((a, b) => a + b, 0) : 0;
        const present = att ? (att.hadir ?? 0) + (att.terlambat ?? 0) : 0;
        return (
          <section key={c.student_id} className="mt-2 mb-10" aria-label={`Ringkasan ${o.name}`}>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="font-display text-3xl font-bold tracking-tight">{o.name}</h2>
              <p className="text-ink-soft">{o.class ?? "Belum masuk rombel"}{o.term ? ` · ${o.term.name}` : ""}</p>
            </div>
            <div className="stagger mt-4 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {att ? <Tile label="Kehadiran" value={total ? `${Math.round((present / total) * 100)}%` : "–"} hint={`${total} hari tercatat`} /> : null}
              {o.learning ? <Tile label="Materi selesai" value={`${o.learning.done}/${o.learning.total}`} hint={`Level ${o.learning.level} · ${o.learning.streak} hari beruntun`} /> : null}
              {o.grades ? <Tile label="Mapel dinilai" value={o.grades.length} /> : null}
            </div>

            {o.grades ? (
              <div className="mt-6">
                <h3 className="font-display text-xl font-bold">Nilai semester ini</h3>
                {o.grades.length === 0 ? <p className="mt-2 text-ink-soft">Belum ada nilai.</p> : (
                  <ul className="mt-2 border-t border-line">
                    {o.grades.map((g) => (
                      <li key={g.subject} className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                        <span className="font-semibold">{g.subject}</span>
                        <span className="num"><span className={`font-bold ${o.pass_mark !== null && g.grade < o.pass_mark ? "text-bad" : ""}`}>{g.grade}</span> <span className="text-sm text-ink-soft">({predicate(g.grade)})</span></span>
                      </li>
                    ))}
                  </ul>
                )}
                {o.note ? <p className="mt-3 surface p-3"><span className="text-sm font-semibold">Catatan wali kelas: </span>{o.note}</p> : null}
              </div>
            ) : null}

            {o.grades ? (
              <p className="mt-4"><Link href={`/dashboard/sekolah/${schoolId}/anak/${c.student_id}`} className="press inline-flex min-h-11 items-center surface px-4 font-semibold hover:border-pen">Buka rapor (cetak)</Link></p>
            ) : null}
            {att && total > 0 ? (
              <div className="mt-6">
                <h3 className="font-display text-xl font-bold">Kehadiran</h3>
                <p className="num mt-1 text-ink-soft">{ATT.filter(([k]) => att[k]).map(([k, l]) => `${l} ${att[k]}`).join(" · ")}</p>
              </div>
            ) : null}
          </section>
        );
      })}
      <LatestAnnouncements schoolId={schoolId} />
      {(await enabledModuleCodes(supabase, schoolId)).has("fees") ? (
        <p className="mt-4"><Link href={`/dashboard/sekolah/${schoolId}/keuangan`} className="font-semibold text-pen underline">Lihat tagihan anak</Link></p>
      ) : null}
      <p className="mt-6 text-sm text-ink-soft">
        Rapor resmi tetap diberikan sekolah.{" "}
        <Link href={`/dashboard/sekolah/${schoolId}/pengumuman`} className="font-semibold text-pen underline">Lihat semua pengumuman</Link>
      </p>
    </>
  );
}
