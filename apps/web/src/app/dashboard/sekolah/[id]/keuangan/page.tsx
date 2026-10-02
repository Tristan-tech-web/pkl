import { BackLink } from "@/components/role-views";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { rupiah } from "@/lib/format";
import { requireModule } from "@/lib/modules";
import { getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { cancelInvoice, issueInvoices, recordPayment } from "./actions";

export const metadata = { title: "Keuangan · EduSmart" };
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
type Inv = { id: string; member_id: string | null; roster_id: string | null; title: string; amount: number; due_on: string | null; status: string; created_at: string };
type Pay = { invoice_id: string; amount: number; method: string; paid_on: string };

function state(i: Inv, paid: number, now: string) {
  if (i.status === "dibatalkan") return { label: "Dibatalkan", tone: "text-ink-soft" };
  if (paid >= Number(i.amount)) return { label: "Lunas", tone: "text-ok" };
  if (i.due_on && i.due_on < now) return { label: paid > 0 ? "Sebagian · terlambat" : "Terlambat", tone: "text-bad" };
  return { label: paid > 0 ? "Sebagian" : "Belum dibayar", tone: "text-ink" };
}

export default async function KeuanganPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string; status?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "fees");
  const management = MANAGEMENT_ROLES.has(me.roleCode);
  if (!management && !["student", "parent"].includes(me.roleCode)) return <BackLink />;
  const now = today();

  const [invRes, payRes] = await Promise.all([
    supabase.from("invoices").select("id,member_id,roster_id,title,amount,due_on,status,created_at").eq("school_id", id).order("created_at", { ascending: false }).limit(300),
    supabase.from("payments").select("invoice_id,amount,method,paid_on").eq("school_id", id),
  ]);
  const invoices = (invRes.data ?? []) as Inv[];
  const paidBy = new Map<string, number>();
  for (const p of (payRes.data ?? []) as Pay[]) paidBy.set(p.invoice_id, (paidBy.get(p.invoice_id) ?? 0) + Number(p.amount));

  // Nama pemilik tagihan: pengelola lewat tabel anggota, orang tua lewat daftar anak.
  const names = new Map<string, string>();
  if (management) {
    const { data } = await supabase.from("school_members").select("id,display_name").eq("school_id", id).in("id", [...new Set(invoices.map((i) => i.member_id).filter((x): x is string => !!x))]);
    for (const m of data ?? []) names.set(m.id as string, (m.display_name as string | null) ?? "Tanpa nama");
    const rosterIds = [...new Set(invoices.filter((i) => !i.member_id && i.roster_id).map((i) => i.roster_id as string))];
    if (rosterIds.length) { const { data: rp } = await supabase.from("roster_people").select("id,full_name").eq("school_id", id).in("id", rosterIds); for (const r of rp ?? []) names.set(r.id as string, `${r.full_name as string} (belum bergabung)`); }
  } else if (me.roleCode === "parent") {
    const { data } = await supabase.rpc("my_children", { p_school_id: id });
    for (const c of (data ?? []) as { student_id: string; name: string }[]) names.set(c.student_id, c.name);
  }

  const active = invoices.filter((i) => i.status !== "dibatalkan");
  const total = active.reduce((s, i) => s + Number(i.amount), 0);
  const paid = active.reduce((s, i) => s + Math.min(Number(i.amount), paidBy.get(i.id) ?? 0), 0);
  const overdue = active.filter((i) => i.due_on && i.due_on < now && (paidBy.get(i.id) ?? 0) < Number(i.amount)).reduce((s, i) => s + Number(i.amount) - (paidBy.get(i.id) ?? 0), 0);
  const filter = sp.status ?? "semua";
  const shown = invoices.filter((i) => {
    const st = state(i, paidBy.get(i.id) ?? 0, now).label;
    return filter === "semua" || (filter === "belum" && (st.startsWith("Belum") || st.startsWith("Sebagian"))) || (filter === "terlambat" && st.includes("erlambat")) || (filter === "lunas" && st === "Lunas");
  });

  let classes: { id: string; name: string }[] = [];
  if (management) classes = ((await supabase.from("class_groups").select("id,name").eq("school_id", id).order("name")).data ?? []) as typeof classes;

  return (
    <>
      {management ? <SchoolNav schoolId={id} active="keuangan" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">{management ? "Keuangan" : me.roleCode === "parent" ? "Tagihan anak" : "Tagihanku"}</h1>
        {management ? <p className="mt-1 max-w-2xl text-ink-soft">Tagihan per siswa dan pencatatan pembayaran manual (tunai atau transfer). Pembayaran online lewat gerbang pembayaran dibahas di modul Integrasi.</p> : null}
      </header>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      <section aria-label="Ringkasan" className="stagger mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-3">
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-2xl font-bold sm:text-3xl">{rupiah(total)}</p><p className="text-sm font-semibold">Ditagihkan</p></div>
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-2xl font-bold text-ok sm:text-3xl">{rupiah(paid)}</p><p className="text-sm font-semibold">Terbayar</p></div>
        <div className="border-t-2 border-ink pt-3"><p className={`num font-display text-2xl font-bold sm:text-3xl ${overdue > 0 ? "text-bad" : ""}`}>{rupiah(overdue)}</p><p className="text-sm font-semibold">Terlambat</p></div>
      </section>

      {management ? (
        <details className="mt-8 surface p-4" open={invoices.length === 0}>
          <summary className="cursor-pointer font-display text-lg font-bold">Terbitkan tagihan</summary>
          <form action={issueInvoices.bind(null, id)} className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><Label>Judul</Label><Input name="title" required minLength={3} maxLength={120} placeholder="mis. SPP Oktober 2026" /></label>
            <label><Label>Jumlah (Rp)</Label><Input name="amount" inputMode="numeric" required placeholder="250000" /></label>
            <label><Label hint="boleh kosong">Jatuh tempo</Label><Input name="due_on" type="date" /></label>
            <label className="sm:col-span-2"><Label>Sasaran</Label>
              <Select name="target" defaultValue="semua"><option value="semua">Semua siswa</option>{classes.map((c) => <option key={c.id} value={c.id}>Rombel {c.name}</option>)}</Select></label>
            <div className="sm:col-span-2"><Button type="submit">Terbitkan</Button></div>
          </form>
        </details>
      ) : null}

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">Daftar tagihan</h2>
          <nav aria-label="Saring status" className="flex flex-wrap gap-1 text-sm font-semibold">
            {[["semua", "Semua"], ["belum", "Belum lunas"], ["terlambat", "Terlambat"], ["lunas", "Lunas"]].map(([k, l]) => (
              <a key={k} href={`?status=${k}`} aria-current={filter === k ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-3 ${filter === k ? "border-pen bg-pen text-on-pen" : "border-line"}`}>{l}</a>
            ))}
          </nav>
        </div>
        {shown.length === 0 ? <p className="mt-3 rounded-box border border-dashed border-line p-6 text-ink-soft">Tidak ada tagihan.</p> : (
          <ul className="stagger mt-3 border-t border-line">
            {shown.map((i) => {
              const p = paidBy.get(i.id) ?? 0;
              const st = state(i, p, now);
              const left = Math.max(0, Number(i.amount) - p);
              return (
                <li key={i.id} className="border-b border-line py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-semibold">{i.title}{names.get(i.member_id ?? i.roster_id ?? "") && (management || me.roleCode === "parent") ? <span className="font-normal text-ink-soft"> · {names.get(i.member_id ?? i.roster_id ?? "")}</span> : null}</p>
                    <p className="num"><span className="font-bold">{rupiah(Number(i.amount))}</span> <span className={`ml-2 text-sm font-semibold ${st.tone}`}>{st.label}</span></p>
                  </div>
                  <p className="num text-sm text-ink-soft">{i.due_on ? `Jatuh tempo ${i.due_on}` : "Tanpa jatuh tempo"}{p > 0 ? ` · terbayar ${rupiah(p)}` : ""}{left > 0 && i.status !== "dibatalkan" && p > 0 ? ` · sisa ${rupiah(left)}` : ""}</p>
                  {management && i.status !== "dibatalkan" && left > 0 ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-semibold text-pen underline">Catat pembayaran</summary>
                      <form action={recordPayment.bind(null, id, i.id)} className="mt-2 grid gap-3 surface p-3 sm:grid-cols-[1fr_8rem_1fr_auto]">
                        <label><Label>Jumlah (Rp)</Label><Input name="amount" inputMode="numeric" defaultValue={left} required /></label>
                        <label><Label>Cara</Label><Select name="method"><option value="tunai">Tunai</option><option value="transfer">Transfer</option><option value="lainnya">Lainnya</option></Select></label>
                        <label><Label hint="opsional">Catatan</Label><Input name="note" maxLength={200} /></label>
                        <div className="flex items-end"><Button type="submit">Simpan</Button></div>
                      </form>
                      <form action={cancelInvoice.bind(null, id, i.id)} className="mt-2"><button type="submit" className="text-sm font-semibold text-bad underline">Batalkan tagihan</button></form>
                    </details>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
