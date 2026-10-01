import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { MANAGEMENT_ROLES, getSchoolContext } from "@/lib/school";
import { addExempt, decideCase, removeExempt, savePolicy } from "./actions";

export const metadata = { title: "Integritas latihan · EduSmart" };

const SIGNAL: Record<string, string> = {
  jawab_terlalu_cepat: "Banyak jawaban terlalu cepat", jawab_cepat: "Beberapa jawaban cepat", pindah_tab: "Pindah tab/aplikasi", waktu_seragam: "Waktu jawab nyaris sama (mirip skrip)",
  benar_semua_terlalu_cepat: "Hampir semua benar dan terlalu cepat", kamera_tanpa_wajah: "Kamera: wajah tidak terlihat (detik)", kamera_banyak_wajah: "Kamera: lebih dari satu wajah",
};
const STATUS: Record<string, string> = { ditahan: "XP ditahan", dibatalkan: "XP dibatalkan + denda", banding: "Murid banding", dibebaskan: "Dibebaskan", dikukuhkan: "Dikukuhkan" };
type Sig = { type: string; value?: number; of?: number };
const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);
const fmt = (iso: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(iso));

export default async function IntegrityPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string; s?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "learning");
  const canManage = MANAGEMENT_ROLES.has(me.roleCode);
  const open = sp.s !== "selesai";
  await supabase.rpc("integrity_expire_held", { p_school: id });
  const [{ data: pol }, { data: cases }, { data: exempt }, { data: students }] = await Promise.all([
    supabase.from("school_integrity").select("*").eq("school_id", id).maybeSingle(),
    supabase.from("integrity_cases").select("id,score,level,signals,xp_reversed,xp_penalty,status,appeal_text,note,created_at,school_members(display_name)").eq("school_id", id)
      .in("status", open ? ["ditahan", "dibatalkan", "banding"] : ["dibebaskan", "dikukuhkan"]).order("created_at", { ascending: false }).limit(50),
    supabase.from("integrity_exempt").select("member_id,reason,school_members(display_name)").eq("school_id", id),
    supabase.from("school_members").select("id,display_name,roles!inner(code)").eq("school_id", id).eq("roles.code", "student").order("display_name").limit(500),
  ]);
  const p = pol ?? { enabled: true, camera_mode: "off", parental_consent_confirmed: false, hold_threshold: 40, penalty_threshold: 70, daily_penalty_cap: 100 };
  const exemptIds = new Set((exempt ?? []).map((e) => e.member_id as string));

  return (
    <>
      <SchoolNav schoolId={id} active="integritas" />
      <h1 className="mb-1 font-display text-3xl font-bold tracking-tight">Integritas latihan</h1>
      <p className="max-w-3xl text-ink-soft">Sistem menilai pola jawaban (terlalu cepat, pindah tab, waktu seragam). Bila mencurigakan, XP sesi ditahan atau dibatalkan, dan murid boleh banding. Ini dugaan komputer, bukan bukti: Andalah yang memutuskan. Kamera tidak pernah cukup sendirian untuk mengurangi XP.</p>
      <div className="mt-3 space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>

      <section className="mt-6" aria-label="Antrean kasus">
        <div className="flex flex-wrap gap-2">
          <a href={`/dashboard/sekolah/${id}/integritas`} aria-current={open ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-box border px-3 text-sm font-semibold ${open ? "border-pen bg-pen text-on-pen" : "border-line"}`}>Perlu keputusan</a>
          <a href={`/dashboard/sekolah/${id}/integritas?s=selesai`} aria-current={!open ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-box border px-3 text-sm font-semibold ${!open ? "border-pen bg-pen text-on-pen" : "border-line"}`}>Sudah diputuskan</a>
        </div>
        <ul className="mt-4 space-y-3">
          {(cases ?? []).map((c) => {
            const name = (one(c.school_members as { display_name: string } | { display_name: string }[] | null))?.display_name ?? "Murid";
            const sigs = (c.signals as Sig[]) ?? [];
            return (
              <li key={c.id as string} className="surface p-4">
                <p className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-display text-lg font-bold">{name}</span><span className="text-sm text-ink-soft">{fmt(c.created_at as string)} · skor <span className="num font-semibold">{c.score as number}</span> · {STATUS[c.status as string]}</span></p>
                <ul className="mt-2 list-disc pl-5 text-sm">{sigs.map((s, i) => <li key={i}>{SIGNAL[s.type] ?? s.type}{s.value !== undefined ? `: ${s.value}${s.of ? ` dari ${s.of}` : ""}` : ""}</li>)}</ul>
                <p className="num mt-2 text-sm text-ink-soft">XP sesi ditarik {c.xp_reversed as number}{(c.xp_penalty as number) > 0 ? `, denda ${c.xp_penalty as number}` : ""}</p>
                {c.appeal_text ? <p className="mt-2 rounded-box border border-line p-3 text-sm"><span className="font-semibold">Alasan murid:</span> {c.appeal_text as string}</p> : null}
                {c.note ? <p className="mt-2 text-sm text-ink-soft">Catatan guru: {c.note as string}</p> : null}
                {open ? (
                  <form className="mt-3 flex flex-wrap items-end gap-2">
                    <label className="min-w-48 flex-1"><Label>Catatan (opsional)</Label><Input name="note" maxLength={300} /></label>
                    <Button type="submit" formAction={decideCase.bind(null, id, c.id as string, "bebaskan")}>Bebaskan (XP kembali)</Button>
                    <Button type="submit" variant="ghost" formAction={decideCase.bind(null, id, c.id as string, "kukuhkan")}>Kukuhkan</Button>
                  </form>
                ) : null}
              </li>
            );
          })}
          {(cases ?? []).length === 0 ? <li className="surface p-4 text-sm text-ink-soft">{open ? "Tidak ada kasus yang menunggu. Bagus!" : "Belum ada keputusan."}</li> : null}
        </ul>
      </section>

      <section className="mt-10 surface p-4" aria-label="Kebijakan">
        <h2 className="font-display text-xl font-bold">Kebijakan sekolah</h2>
        {!canManage ? <p className="mt-1 text-sm text-ink-soft">Hanya pengelola sekolah yang bisa mengubah. Nilai saat ini ditampilkan.</p> : null}
        <form action={savePolicy.bind(null, id)} className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-2 sm:col-span-2"><input type="checkbox" name="enabled" defaultChecked={p.enabled} disabled={!canManage} className="size-4" /> Aktifkan penilaian integritas latihan</label>
          <label><Label hint="skor ≥ ini: XP sesi ditahan">Ambang tahan</Label><Input name="hold" type="number" min={10} max={90} defaultValue={p.hold_threshold} disabled={!canManage} /></label>
          <label><Label hint="skor ≥ ini dan ≥2 jenis sinyal: XP dibatalkan + denda">Ambang denda</Label><Input name="penalty" type="number" min={30} max={100} defaultValue={p.penalty_threshold} disabled={!canManage} /></label>
          <label><Label hint="denda maksimal per murid per hari (0 = tanpa denda)">Batas denda harian (XP)</Label><Input name="cap" type="number" min={0} max={500} defaultValue={p.daily_penalty_cap} disabled={!canManage} /></label>
          <label><Label>Kamera di perangkat murid</Label><Select name="camera_mode" defaultValue={p.camera_mode} disabled={!canManage}><option value="off">Mati (bawaan)</option><option value="optional">Opsional, murid memilih per sesi</option></Select></label>
          <label className="flex min-h-11 items-start gap-2 sm:col-span-2"><input type="checkbox" name="consent" defaultChecked={p.parental_consent_confirmed} disabled={!canManage} className="mt-1 size-4" /> <span>Sekolah menyatakan sudah memegang persetujuan orang tua/wali untuk pemrosesan kamera di perangkat murid. <span className="text-ink-soft">⚠ Wajah termasuk data biometrik dan data anak (UU PDP No. 27/2022). Telaah hukum diperlukan sebelum dipakai; tanpa centang ini kamera tidak bisa dinyalakan.</span></span></label>
          {canManage ? <div className="sm:col-span-2"><Button type="submit">Simpan kebijakan</Button></div> : null}
        </form>
      </section>

      <section className="mt-6 surface p-4" aria-label="Pengecualian">
        <h2 className="font-display text-xl font-bold">Pengecualian (akomodasi)</h2>
        <p className="mt-1 text-sm text-ink-soft">Murid yang dikecualikan tidak pernah ditahan atau didenda (misalnya karena kebutuhan khusus). Skornya tetap dicatat.</p>
        <ul className="mt-3 divide-y divide-line text-sm">
          {(exempt ?? []).map((e) => (
            <li key={e.member_id as string} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span><span className="font-semibold">{(one(e.school_members as { display_name: string } | { display_name: string }[] | null))?.display_name}</span>{e.reason ? <span className="text-ink-soft"> · {e.reason as string}</span> : null}</span>
              <form action={removeExempt.bind(null, id, e.member_id as string)}><Button type="submit" variant="ghost">Cabut</Button></form>
            </li>
          ))}
        </ul>
        <form action={addExempt.bind(null, id)} className="mt-3 flex flex-wrap items-end gap-2">
          <label className="min-w-48"><Label>Murid</Label><Select name="member_id" required><option value="">Pilih murid</option>{(students ?? []).filter((s) => !exemptIds.has(s.id as string)).map((s) => <option key={s.id as string} value={s.id as string}>{s.display_name as string}</option>)}</Select></label>
          <label className="min-w-48 flex-1"><Label>Alasan</Label><Input name="reason" maxLength={200} /></label>
          <Button type="submit">Tambah</Button>
        </form>
      </section>
    </>
  );
}
