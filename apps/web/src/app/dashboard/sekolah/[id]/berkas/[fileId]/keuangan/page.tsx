import { notFound } from "next/navigation";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, Label, Select } from "@/components/ui";
import { FIN_FIELDS, FIN_LABEL, guessFinMapping, loadStudents, matchStudents, normalizeFinance, type FinField } from "@/lib/finance-import";
import { rupiah } from "@/lib/format";
import { findHeaderRow } from "@/lib/intake";
import { requireModule } from "@/lib/modules";
import { parseBuffer } from "@/lib/parse-file";
import { getSchoolContext } from "@/lib/school";
import { importFinance } from "../../actions";

export const metadata = { title: "Tinjau tagihan · EduSmart" };
export const maxDuration = 120;

export default async function FinanceReview({ params, searchParams }: { params: Promise<{ id: string; fileId: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id, fileId } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id, { management: true });
  await requireModule(supabase, id, "data_hub");
  await requireModule(supabase, id, "fees");
  const { data: f } = await supabase.from("school_files").select("name,mime,path").eq("id", fileId).eq("school_id", id).maybeSingle();
  if (!f) notFound();
  const dl = await supabase.storage.from("school-files").download(f.path as string);
  if (dl.error || !dl.data) return <ErrorNote message="Berkas tidak bisa dibaca." />;
  const parsed = await parseBuffer(f.name as string, f.mime as string | null, Buffer.from(await dl.data.arrayBuffer()));
  if (parsed.kind !== "table") return <><SchoolNav schoolId={id} active="berkas" /><ErrorNote message="Berkas ini bukan tabel (xlsx/csv)." /></>;

  const headerRow = sp.h !== undefined ? Math.max(0, Number(sp.h) || 0) : findHeaderRow(parsed.rows);
  const header = parsed.rows[headerRow] ?? [];
  let mapping: Partial<Record<FinField, number>>;
  if (sp.h !== undefined) {
    mapping = {};
    for (const k of FIN_FIELDS) { const v = sp[`m_${k}`]; if (v !== undefined && v !== "" && Number.isInteger(Number(v))) mapping[k] = Number(v); }
  } else mapping = guessFinMapping(header);
  const results = normalizeFinance(parsed.rows, headerRow, mapping);
  const rows = results.flatMap((r) => (r.row ? [r.row] : []));
  const bad = results.filter((r) => !r.row);
  const { students } = await loadStudents(supabase, id);
  const { matched, unmatched } = matchStudents(rows, students);
  const paidCount = matched.filter((m) => m.row.paid).length;
  const total = matched.reduce((a, m) => a + m.row.amount, 0);
  const memberOf = new Map(matched.map((m) => [m.row.line, m.memberId]));
  const colOpt = header.map((c, i) => <option key={i} value={i}>{`${i + 1}. ${c || "(kosong)"}`}</option>);

  return (
    <>
      <SchoolNav schoolId={id} active="berkas" />
      <a href={`/dashboard/sekolah/${id}/berkas`} className="text-sm font-semibold text-pen underline">← Berkas</a>
      <h1 className="mt-3 mb-1 font-display text-3xl font-bold tracking-tight">Tinjau tagihan</h1>
      <p className="text-ink-soft">{f.name as string} · {parsed.rows.length} baris. Setiap baris dicocokkan ke siswa yang sudah punya akun (NIS, atau nama yang unik). Tidak ada data masuk sebelum Anda menekan Buat tagihan.</p>
      {sp.error ? <div className="mt-3"><ErrorNote message={sp.error} /></div> : null}

      <form method="get" className="mt-6 surface p-4">
        <h2 className="font-display text-lg font-bold">1. Pemetaan kolom</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label><Label>Baris judul kolom</Label>
            <Select name="h" defaultValue={String(headerRow)}>{parsed.rows.slice(0, 15).map((r, i) => <option key={i} value={i}>{`Baris ${i + 1}: ${r.filter(Boolean).slice(0, 3).join(", ").slice(0, 40)}`}</option>)}</Select></label>
          {FIN_FIELDS.map((k) => (
            <label key={k}><Label>{FIN_LABEL[k]}{k === "amount" ? " *" : ""}</Label>
              <Select name={`m_${k}`} defaultValue={mapping[k] === undefined ? "" : String(mapping[k])}><option value="">– tidak ada –</option>{colOpt}</Select></label>
          ))}
        </div>
        <div className="mt-3"><Button type="submit" variant="ghost">Perbarui pratinjau</Button></div>
      </form>

      <section className="mt-6" aria-label="Pratinjau">
        <h2 className="font-display text-lg font-bold">2. Pratinjau</h2>
        <p className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span className="font-semibold text-ok">{matched.length} cocok · {rupiah(total)}</span>
          <span className="text-ink-soft">{paidCount} langsung dicatat lunas</span>
          <span className={unmatched.length ? "font-semibold text-bad" : "text-ink-soft"}>{unmatched.length} tidak cocok siswa</span>
          <span className={bad.length ? "font-semibold text-bad" : "text-ink-soft"}>{bad.length} bermasalah</span>
        </p>
        {unmatched.length > 0 ? <p className="mt-2 rounded-box border border-warn/40 p-3 text-sm">Baris yang tidak cocok biasanya siswa yang belum bergabung. Impor roster siswa dan bagikan kodenya dulu. Setelah mereka masuk, unggah ulang berkas yang hanya berisi baris tersebut agar tagihan tidak ganda.</p> : null}
        <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Pratinjau baris">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead><tr className="border-b-2 border-ink"><th className="py-2 pr-2">Baris</th><th className="pr-2">Nama</th><th className="pr-2">Tagihan</th><th className="pr-2 text-right">Nominal</th><th className="pr-2">Bayar</th><th>Cocok</th></tr></thead>
            <tbody>
              {[...results].slice(0, 25).map((r) => (
                <tr key={r.line} className="border-b border-line align-top">
                  <td className="num py-1.5 pr-2 text-ink-soft">{r.line}</td>
                  <td className="pr-2 font-semibold">{r.row?.name || r.row?.nis || "–"}</td>
                  <td className="pr-2">{r.row?.title ?? "–"}</td>
                  <td className="num pr-2 text-right">{r.row ? rupiah(r.row.amount) : "–"}</td>
                  <td className="pr-2">{r.row ? (r.row.paid ? "Lunas" : "Belum") : "–"}</td>
                  <td className={!r.row ? "font-semibold text-bad" : memberOf.has(r.line) ? "text-ok" : "font-semibold text-bad"}>{!r.row ? r.error : memberOf.has(r.line) ? "Siswa ditemukan" : "Tidak ditemukan"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {results.length > 25 ? <p className="mt-1 text-sm text-ink-soft">Menampilkan 25 dari {results.length} baris.</p> : null}
      </section>

      <form action={importFinance.bind(null, id, fileId)} className="mt-6 surface p-4">
        <h2 className="font-display text-lg font-bold">3. Buat tagihan</h2>
        <input type="hidden" name="header_row" value={headerRow} />
        {FIN_FIELDS.map((k) => (mapping[k] === undefined ? null : <input key={k} type="hidden" name={`m_${k}`} value={mapping[k]} />))}
        <p className="mt-2 text-sm text-ink-soft">Baris berstatus “Lunas” akan dicatat sebagai pembayaran penuh (metode: lainnya).</p>
        <div className="mt-3"><Button type="submit" disabled={matched.length === 0}>Buat {matched.length} tagihan</Button></div>
      </form>
    </>
  );
}
