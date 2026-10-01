import { describeAchievement, gradeLabel, type ReportConfig } from "@/lib/report-config";

export type SheetSubject = { name: string; grade: number | null; items: { title: string; pct: number }[] };
export type Extras = {
  sikap?: { spiritual?: string; sosial?: string; deskripsi?: string };
  ekskul?: { items?: { nama: string; predikat?: string; keterangan?: string }[] };
  prestasi?: { items?: string[] };
  p5?: { items?: { tema: string; deskripsi?: string }[] };
};
export type SheetProps = {
  school: { name: string; city: string | null; province: string | null };
  student: { name: string; className: string | null; nis?: string | null; nisn?: string | null };
  termName: string; year: string; homeroom: string; pass: number;
  subjects: SheetSubject[]; attendance: Record<string, number> | null; note: string | null; extras: Extras; config: ReportConfig;
};

const ATT: [string, string][] = [["hadir", "Hadir"], ["terlambat", "Terlambat"], ["izin", "Izin"], ["sakit", "Sakit"], ["alpa", "Tanpa keterangan"]];

// Satu tampilan rapor untuk semua peran; isi dan susunan mengikuti templat sekolah.
export function ReportSheet(p: SheetProps) {
  const c = p.config;
  const where = [p.school.city, p.school.province].filter(Boolean).join(", ");
  const byName = new Map(p.subjects.map((s) => [s.name.toLowerCase(), s]));
  const used = new Set<string>();
  const groups: { name: string | null; rows: SheetSubject[] }[] = [];
  for (const g of c.groups) {
    const rows = g.subjects.map((n) => byName.get(n.toLowerCase())).filter((s): s is SheetSubject => !!s);
    rows.forEach((r) => used.add(r.name.toLowerCase()));
    if (rows.length) groups.push({ name: g.name, rows });
  }
  const rest = p.subjects.filter((s) => !used.has(s.name.toLowerCase()));
  if (rest.length || groups.length === 0) groups.push({ name: groups.length ? "Lainnya" : null, rows: rest });
  const sec = ["nilai", c.sections.kehadiran && "kehadiran", c.sections.sikap && "sikap", c.sections.ekskul && "ekskul", c.sections.p5 && "p5", c.sections.prestasi && "prestasi", c.sections.catatan && "catatan"].filter(Boolean) as string[];
  const letter = (k: string) => String.fromCharCode(65 + sec.indexOf(k));
  const showDesc = c.columns.deskripsi;
  const cols = 2 + (c.columns.nilai ? 1 : 0) + (c.columns.predikat ? 1 : 0) + (c.columns.ketuntasan ? 1 : 0) + (showDesc ? 1 : 0);
  let n = 0;

  return (
    <div className="surface p-6 sm:p-8">
      <header className="border-b-2 border-ink pb-3 text-center">
        <p className="font-display text-2xl font-bold">{p.school.name}</p>
        {where ? <p className="text-sm text-ink-soft">{where}</p> : null}
        <h1 className="mt-2 font-display text-xl font-bold tracking-wide">{c.title}</h1>
        {c.subtitle ? <p className="text-sm text-ink-soft">{c.subtitle}</p> : null}
      </header>
      <dl className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
        <div className="flex gap-2"><dt className="w-28 text-ink-soft">Nama</dt><dd className="font-semibold">{p.student.name}</dd></div>
        <div className="flex gap-2"><dt className="w-28 text-ink-soft">Kelas</dt><dd className="font-semibold">{p.student.className ?? "–"}</dd></div>
        {p.student.nis || p.student.nisn ? <div className="flex gap-2"><dt className="w-28 text-ink-soft">NIS / NISN</dt><dd className="num font-semibold">{[p.student.nis, p.student.nisn].filter(Boolean).join(" / ")}</dd></div> : null}
        <div className="flex gap-2"><dt className="w-28 text-ink-soft">Semester</dt><dd className="font-semibold">{p.termName}</dd></div>
        <div className="flex gap-2"><dt className="w-28 text-ink-soft">Tahun ajaran</dt><dd className="font-semibold">{p.year}</dd></div>
      </dl>

      <h2 className="mt-6 font-display text-lg font-bold">{letter("nilai")}. Nilai mata pelajaran</h2>
      <div className="mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label="Tabel nilai">
        <table className="w-full min-w-[28rem] text-left">
          <thead>
            <tr className="border-b-2 border-ink text-sm">
              <th className="w-10 py-2">No</th><th>Mata pelajaran</th>
              {c.columns.nilai ? <th className="num text-right">Nilai</th> : null}
              {c.columns.predikat ? <th className="px-3 text-center">Predikat</th> : null}
              {showDesc ? <th className="px-3">Capaian</th> : null}
              {c.columns.ketuntasan ? <th className="text-right">Keterangan</th> : null}
            </tr>
          </thead>
          <tbody>
            {p.subjects.length === 0 ? <tr><td colSpan={cols} className="py-4 text-ink-soft">Belum ada mata pelajaran.</td></tr> : groups.map((g) => (
              <GroupRows key={g.name ?? "_"} name={g.name} cols={cols}>
                {g.rows.map((s) => {
                  n += 1;
                  const lbl = gradeLabel(c.scale, s.grade);
                  return (
                    <tr key={s.name} className="border-b border-line align-top">
                      <td className="num py-2">{n}</td><td className="font-semibold">{s.name}</td>
                      {c.columns.nilai ? <td className="num text-right font-bold">{s.grade ?? "–"}</td> : null}
                      {c.columns.predikat ? <td className="px-3 text-center font-semibold">{lbl}</td> : null}
                      {showDesc ? <td className="px-3 py-2 text-sm text-ink-soft">{s.grade === null ? "Belum dinilai" : describeAchievement(s.items, p.pass)}</td> : null}
                      {c.columns.ketuntasan ? <td className={`text-right text-sm ${s.grade !== null && s.grade < p.pass ? "font-semibold text-bad" : "text-ink-soft"}`}>{s.grade === null ? "Belum dinilai" : s.grade >= p.pass ? "Tuntas" : "Belum tuntas"}</td> : null}
                    </tr>
                  );
                })}
              </GroupRows>
            ))}
          </tbody>
        </table>
      </div>
      {c.columns.nilai ? <p className="mt-1 text-xs text-ink-soft">Nilai akhir = rata-rata berbobot penilaian semester ini.{c.columns.ketuntasan ? ` Ambang ketuntasan sekolah: ${p.pass}.` : ""} Predikat: {c.scale.map((s, i) => `${s.label} ≥ ${s.min}${i === c.scale.length - 1 ? "" : ""}`).join(", ")}.</p> : null}

      {c.sections.kehadiran && p.attendance ? (
        <>
          <h2 className="mt-6 font-display text-lg font-bold">{letter("kehadiran")}. Kehadiran</h2>
          <table className="mt-2 w-full max-w-md text-left"><tbody>
            {ATT.map(([k, l]) => <tr key={k} className="border-b border-line"><td className="py-1.5">{l}</td><td className="num text-right font-semibold">{p.attendance?.[k] ?? 0} hari</td></tr>)}
          </tbody></table>
        </>
      ) : null}

      {c.sections.sikap ? (
        <>
          <h2 className="mt-6 font-display text-lg font-bold">{letter("sikap")}. Sikap</h2>
          <table className="mt-2 w-full max-w-xl text-left"><tbody>
            <tr className="border-b border-line"><td className="py-1.5">Sikap spiritual</td><td className="text-right font-semibold">{p.extras.sikap?.spiritual || "–"}</td></tr>
            <tr className="border-b border-line"><td className="py-1.5">Sikap sosial</td><td className="text-right font-semibold">{p.extras.sikap?.sosial || "–"}</td></tr>
          </tbody></table>
          {p.extras.sikap?.deskripsi ? <p className="mt-2 whitespace-pre-wrap rounded-box border border-line p-3">{p.extras.sikap.deskripsi}</p> : null}
        </>
      ) : null}

      {c.sections.ekskul ? (
        <>
          <h2 className="mt-6 font-display text-lg font-bold">{letter("ekskul")}. Ekstrakurikuler</h2>
          {(p.extras.ekskul?.items ?? []).length === 0 ? <p className="mt-2 text-ink-soft">–</p> : (
            <table className="mt-2 w-full text-left"><thead><tr className="border-b-2 border-ink text-sm"><th className="py-2">Kegiatan</th><th className="px-3">Predikat</th><th>Keterangan</th></tr></thead><tbody>
              {p.extras.ekskul!.items!.map((e, i) => <tr key={i} className="border-b border-line"><td className="py-1.5 font-semibold">{e.nama}</td><td className="px-3">{e.predikat || "–"}</td><td className="text-sm text-ink-soft">{e.keterangan || ""}</td></tr>)}
            </tbody></table>
          )}
        </>
      ) : null}

      {c.sections.p5 ? (
        <>
          <h2 className="mt-6 font-display text-lg font-bold">{letter("p5")}. Projek penguatan profil pelajar</h2>
          {(p.extras.p5?.items ?? []).length === 0 ? <p className="mt-2 text-ink-soft">–</p> : (
            <ul className="mt-2 space-y-2">{p.extras.p5!.items!.map((e, i) => <li key={i} className="rounded-box border border-line p-3"><p className="font-semibold">{e.tema}</p>{e.deskripsi ? <p className="text-ink-soft">{e.deskripsi}</p> : null}</li>)}</ul>
          )}
        </>
      ) : null}

      {c.sections.prestasi ? (
        <>
          <h2 className="mt-6 font-display text-lg font-bold">{letter("prestasi")}. Prestasi</h2>
          {(p.extras.prestasi?.items ?? []).length === 0 ? <p className="mt-2 text-ink-soft">–</p> : <ul className="mt-2 list-disc pl-6">{p.extras.prestasi!.items!.map((e, i) => <li key={i}>{e}</li>)}</ul>}
        </>
      ) : null}

      {c.sections.catatan ? (
        <>
          <h2 className="mt-6 font-display text-lg font-bold">{letter("catatan")}. Catatan wali kelas</h2>
          <p className="mt-2 min-h-12 whitespace-pre-wrap rounded-box border border-line p-3">{p.note ?? "–"}</p>
        </>
      ) : null}

      {c.footnote ? <p className="mt-4 text-xs text-ink-soft">{c.footnote}</p> : null}
      <div className="mt-10 grid gap-4 text-center text-sm" style={{ gridTemplateColumns: `repeat(${c.signatures.length}, minmax(0, 1fr))` }}>
        {c.signatures.map((role) => (
          <div key={role}><p>{role}</p><div className="h-16" /><p className="border-t border-ink pt-1 font-semibold">{/wali kelas/i.test(role) ? p.homeroom || " " : " "}</p></div>
        ))}
      </div>
    </div>
  );
}

function GroupRows({ name, cols, children }: { name: string | null; cols: number; children: React.ReactNode }) {
  return (
    <>
      {name ? <tr className="bg-paper"><td colSpan={cols} className="py-1.5 pl-1 text-sm font-bold uppercase tracking-[0.06em] text-ink-soft">{name}</td></tr> : null}
      {children}
    </>
  );
}
