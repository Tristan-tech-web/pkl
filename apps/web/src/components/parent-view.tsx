import Link from "next/link";
import { LatestAnnouncements } from "@/components/module-links";
import "./island/island.css";
import { predicate } from "@/lib/grades";
import { enabledModuleCodes } from "@/lib/modules";
import { createClient } from "@/lib/supabase/server";

type Overview = {
  name: string; class: string | null; term: { id: string; name: string } | null;
  attendance: Record<string, number> | null; grades: { subject: string; grade: number }[] | null; pass_mark: number | null; note: string | null;
  learning: { level: number; xp: number; streak: number; done: number; total: number } | null;
};
const ATT = [["hadir", "Hadir"], ["terlambat", "Terlambat"], ["izin", "Izin"], ["sakit", "Sakit"], ["alpa", "Tanpa keterangan"]] as const;

// Ringkasan satu paragraf dalam bahasa orang tua: apa kabar anak saya? Disusun dari data nyata, bukan karangan.
function kabar(o: Overview, first: string): string {
  const parts: string[] = [];
  const att = o.attendance; const total = att ? Object.values(att).reduce((a, b) => a + b, 0) : 0;
  if (att && total > 0) { const pct = Math.round((((att.hadir ?? 0) + (att.terlambat ?? 0)) / total) * 100); parts.push(pct >= 95 ? `${first} rajin masuk, hadir ${pct}% dari ${total} hari tercatat.` : `${first} hadir ${pct}% dari ${total} hari tercatat.`); }
  if (o.learning && o.learning.total > 0) parts.push(`${o.learning.done} dari ${o.learning.total} materi belajar sudah selesai.${o.learning.streak >= 3 ? ` Ia belajar ${o.learning.streak} hari berturut-turut.` : ""}`);
  if (o.grades && o.grades.length > 0) {
    const low = o.pass_mark === null ? [] : o.grades.filter((g) => g.grade < o.pass_mark!);
    parts.push(low.length ? `${low.map((g) => g.subject).join(" dan ")} masih di bawah batas tuntas, mungkin perlu ditemani sedikit.` : "Semua nilai mapel sudah di atas batas tuntas.");
  }
  return parts.join(" ") || `Belum ada data yang bisa diringkas untuk ${first}.`;
}

function Tile({ icon, label, value, hint }: { icon: string; label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-box border-2 border-line bg-card p-3">
      <span aria-hidden="true" className="text-2xl">{icon}</span>
      <p className="num font-display text-3xl font-extrabold leading-tight">{value}</p>
      <p className="text-sm font-bold">{label}</p>
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
            <div className="surface flex items-start gap-4 p-4">
              <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-pen font-display text-2xl font-extrabold text-on-pen">{o.name.trim()[0]?.toUpperCase()}</span>
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight">{o.name}</h2>
                <p className="text-sm text-ink-soft">{o.class ?? "Belum masuk rombel"}{o.term ? ` · ${o.term.name}` : ""}</p>
                <p className="mt-2 text-lg font-medium leading-relaxed">{kabar(o, o.name.trim().split(/\s+/)[0])}</p>
              </div>
            </div>
            <div className="stagger mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {att ? <Tile icon="✅" label="Kehadiran" value={total ? `${Math.round((present / total) * 100)}%` : "–"} hint={`${total} hari tercatat`} /> : null}
              {o.learning ? <Tile icon="🗺️" label="Materi selesai" value={`${o.learning.done}/${o.learning.total}`} hint={`Level ${o.learning.level} · ${o.learning.streak} hari beruntun`} /> : null}
              {o.grades ? <Tile icon="📊" label="Mapel dinilai" value={o.grades.length} /> : null}
            </div>

            {o.grades ? (
              <div className="mt-6">
                <h3 className="font-display text-xl font-bold">Nilai semester ini</h3>
                {o.grades.length === 0 ? <p className="mt-2 text-ink-soft">Belum ada nilai.</p> : (
                  <ul className="mt-2 grid gap-3 sm:grid-cols-2">
                    {o.grades.map((g) => {
                      const low = o.pass_mark !== null && g.grade < o.pass_mark;
                      return (
                        <li key={g.subject} className="surface flex items-center gap-3 p-3" style={{ borderColor: low ? "var(--warn)" : undefined }}>
                          <span className="grade-ring" style={{ ["--g" as string]: Math.min(100, g.grade), background: `conic-gradient(${low ? "var(--warn)" : "var(--ok)"} calc(var(--g) * 1%), var(--line) 0)` }} role="img" aria-label={`${g.subject}: nilai ${g.grade}, predikat ${predicate(g.grade)}`}><b className="font-display">{predicate(g.grade)}</b></span>
                          <span className="min-w-0"><span className="block font-bold leading-tight">{g.subject}</span><span className="num block text-2xl font-extrabold">{g.grade}</span>{low ? <span className="block text-sm font-semibold text-warn">Perlu ditemani</span> : null}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {o.note ? <p className="mt-3 surface p-3"><span className="text-sm font-semibold">Catatan wali kelas: </span>{o.note}</p> : null}
              </div>
            ) : null}

            {o.grades ? (
              <p className="mt-4"><Link href={`/dashboard/sekolah/${schoolId}/anak/${c.student_id}`} className="press inline-flex min-h-12 items-center surface px-5 font-bold hover:border-pen">📄 Buka rapor (cetak)</Link></p>
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
        <p className="mt-4"><Link href={`/dashboard/sekolah/${schoolId}/keuangan`} className="press inline-flex min-h-12 items-center surface px-5 font-bold hover:border-pen">💳 Lihat tagihan anak</Link></p>
      ) : null}
      <p className="mt-6 text-sm text-ink-soft">
        Rapor resmi tetap diberikan sekolah.{" "}
        <Link href={`/dashboard/sekolah/${schoolId}/pengumuman`} className="font-semibold text-pen underline">Lihat semua pengumuman</Link>
      </p>
    </>
  );
}
