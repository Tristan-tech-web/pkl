import { notFound } from "next/navigation";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, Label, Select } from "@/components/ui";
import { FIELD_LABEL, PERSON_FIELDS, findHeaderRow, guessMapping, normalizePeople, type PersonField, type PersonKind } from "@/lib/intake";
import { requireModule } from "@/lib/modules";
import { parseBuffer } from "@/lib/parse-file";
import { getSchoolContext } from "@/lib/school";
import { importRoster } from "../actions";

export const metadata = { title: "Tinjau impor · EduSmart" };
export const maxDuration = 120;

export default async function ReviewPage({ params, searchParams }: { params: Promise<{ id: string; fileId: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id, fileId } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id, { management: true });
  await requireModule(supabase, id, "data_hub");
  const { data: f } = await supabase.from("school_files").select("name,mime,path,category,extracted,status").eq("id", fileId).eq("school_id", id).maybeSingle();
  if (!f) notFound();
  const dl = await supabase.storage.from("school-files").download(f.path as string);
  if (dl.error || !dl.data) return <ErrorNote message="Berkas tidak bisa dibaca." />;
  const parsed = await parseBuffer(f.name as string, f.mime as string | null, Buffer.from(await dl.data.arrayBuffer()));
  if (parsed.kind !== "table") return <><SchoolNav schoolId={id} active="berkas" /><ErrorNote message="Berkas ini bukan tabel (xlsx/csv)." /></>;

  const ext = f.extracted as { table?: { header_row: number; mapping: Partial<Record<PersonField, number>> } } | null;
  const headerRow = sp.h !== undefined ? Math.max(0, Number(sp.h) || 0) : (ext?.table?.header_row ?? findHeaderRow(parsed.rows));
  const header = parsed.rows[headerRow] ?? [];
  let mapping: Partial<Record<PersonField, number>>;
  if (sp.h !== undefined) {
    mapping = {};
    for (const k of PERSON_FIELDS) { const v = sp[`m_${k}`]; if (v !== undefined && v !== "" && Number.isInteger(Number(v))) mapping[k] = Number(v); }
  } else mapping = Object.keys(ext?.table?.mapping ?? {}).length ? (ext!.table!.mapping) : guessMapping(header);
  const kind = (sp.kind as PersonKind) || (f.category === "guru" ? "guru" : "siswa");
  const results = normalizePeople(parsed.rows, headerRow, mapping);
  const ok = results.filter((r) => r.values).length;
  const bad = results.filter((r) => !r.values);
  const warn = results.filter((r) => r.warnings.length > 0).length;

  const [{ data: classes }, { data: existing }] = await Promise.all([
    supabase.from("class_groups").select("name").eq("school_id", id),
    supabase.from("roster_people").select("nis,nisn").eq("school_id", id),
  ]);
  const known = new Set((classes ?? []).map((c) => String(c.name).toLowerCase()));
  const classNames = [...new Set(results.map((r) => r.values?.class_name).filter(Boolean) as string[])];
  const unknownClasses = classNames.filter((c) => !known.has(c.toLowerCase()));
  const ex = new Set([...(existing ?? []).map((e) => e.nisn as string | null), ...(existing ?? []).map((e) => e.nis as string | null)].filter(Boolean) as string[]);
  const dupes = results.filter((r) => r.values && ((r.values.nisn && ex.has(r.values.nisn)) || (r.values.nis && ex.has(r.values.nis)))).length;
  const preview = results.slice(0, 20);
  const colOpt = (h: string[]) => h.map((c, i) => <option key={i} value={i}>{`${i + 1}. ${c || "(kosong)"}`}</option>);

  return (
    <>
      <SchoolNav schoolId={id} active="berkas" />
      <a href={`/dashboard/sekolah/${id}/berkas`} className="text-sm font-semibold text-pen underline">← Berkas</a>
      <h1 className="mt-3 mb-1 font-display text-3xl font-bold tracking-tight">Tinjau impor</h1>
      <p className="text-ink-soft">{f.name as string} · {parsed.rows.length} baris, lembar “{parsed.sheet}”. Periksa pemetaan kolom, lalu impor. Tidak ada data yang masuk sebelum Anda menekan Impor.</p>

      <form method="get" className="mt-6 surface p-4">
        <h2 className="font-display text-lg font-bold">1. Pemetaan kolom</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label><Label>Jenis data</Label>
            <Select name="kind" defaultValue={kind}><option value="siswa">Siswa</option><option value="guru">Guru</option><option value="staf">Staf</option><option value="orang_tua">Orang tua</option></Select></label>
          <label><Label>Baris judul kolom</Label>
            <Select name="h" defaultValue={String(headerRow)}>{parsed.rows.slice(0, 15).map((r, i) => <option key={i} value={i}>{`Baris ${i + 1}: ${r.filter(Boolean).slice(0, 3).join(", ").slice(0, 40)}`}</option>)}</Select></label>
          {PERSON_FIELDS.map((k) => (
            <label key={k}><Label>{FIELD_LABEL[k]}{k === "full_name" ? " *" : ""}</Label>
              <Select name={`m_${k}`} defaultValue={mapping[k] === undefined ? "" : String(mapping[k])}><option value="">– tidak ada –</option>{colOpt(header)}</Select></label>
          ))}
        </div>
        <div className="mt-3"><Button type="submit" variant="ghost">Perbarui pratinjau</Button></div>
      </form>

      <section className="mt-6" aria-label="Pratinjau">
        <h2 className="font-display text-lg font-bold">2. Pratinjau</h2>
        <p className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="font-semibold text-ok">{ok} baris siap</span>
          <span className={bad.length ? "font-semibold text-bad" : "text-ink-soft"}>{bad.length} bermasalah (diabaikan)</span>
          <span className="text-ink-soft">{warn} dengan catatan</span>
          <span className="text-ink-soft">{dupes} sudah ada di roster</span>
        </p>
        {unknownClasses.length > 0 ? <p className="mt-2 rounded-box border border-warn/40 p-3 text-sm">Rombel belum ada di sekolah: <span className="font-semibold">{unknownClasses.join(", ")}</span>. Orangnya tetap diimpor dengan nama rombel itu, tetapi tidak otomatis masuk rombel saat bergabung. Buat rombelnya dulu di menu Rombel bila perlu.</p> : null}
        <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Pratinjau baris">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead><tr className="border-b-2 border-ink"><th className="py-2 pr-2">Baris</th><th className="pr-2">Nama</th><th className="pr-2">NIS/NISN/NIP</th><th className="pr-2">L/P</th><th className="pr-2">Lahir</th><th className="pr-2">Rombel</th><th>Status</th></tr></thead>
            <tbody>
              {preview.map((r) => (
                <tr key={r.line} className="border-b border-line align-top">
                  <td className="num py-1.5 pr-2 text-ink-soft">{r.line}</td>
                  <td className="pr-2 font-semibold">{r.values?.full_name ?? "–"}</td>
                  <td className="num pr-2">{r.values ? [r.values.nis, r.values.nisn, r.values.nip].filter(Boolean).join(" / ") || "–" : "–"}</td>
                  <td className="pr-2">{r.values?.gender ?? "–"}</td>
                  <td className="num pr-2">{r.values?.birth_date ?? "–"}</td>
                  <td className="pr-2">{r.values?.class_name ?? "–"}</td>
                  <td className={r.errors.length ? "font-semibold text-bad" : r.warnings.length ? "text-ink-soft" : "text-ok"}>{r.errors.length ? r.errors.join(", ") : r.warnings.length ? r.warnings.join(", ") : "Siap"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {results.length > 20 ? <p className="mt-1 text-sm text-ink-soft">Menampilkan 20 dari {results.length} baris.</p> : null}
      </section>

      <form action={importRoster.bind(null, id, fileId)} className="mt-6 surface p-4">
        <h2 className="font-display text-lg font-bold">3. Impor</h2>
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="header_row" value={headerRow} />
        {PERSON_FIELDS.map((k) => (mapping[k] === undefined ? null : <input key={k} type="hidden" name={`m_${k}`} value={mapping[k]} />))}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label><Label>Bila sudah ada (NIS/NISN sama)</Label>
            <Select name="duplicates" defaultValue="lewati"><option value="lewati">Lewati</option><option value="perbarui">Perbarui datanya</option></Select></label>
          <label className="flex min-h-11 items-center gap-2 self-end"><input type="checkbox" name="invites" defaultChecked className="size-4" /> Buatkan kode undangan untuk setiap orang baru</label>
        </div>
        <p className="mt-2 text-sm text-ink-soft">Orang yang diimpor masuk ke Roster (data induk lengkap). Saat mereka mendaftar dengan kodenya, akun, rombel, dan data induknya tersambung otomatis.</p>
        <div className="mt-3"><Button type="submit" disabled={ok === 0}>Impor {ok} baris</Button></div>
      </form>
    </>
  );
}
