import { SiteHeader } from "@/components/site-header";
import { HeroMotion } from "@/components/motion/hero-motion";
import { LandingPath } from "@/components/landing-path";
import { IslandScene } from "@/components/island/island-scene";
import { Journey } from "@/components/island/journey";
import { Station } from "@/components/island/station";
import { ForgettingCurve } from "@/components/island/forgetting-curve";
import { ThemePlayground } from "@/components/island/theme-playground";
import { Mascot } from "@/components/three/mascot";
import { Words } from "@/components/motion/words";
import { ParabolaDemo } from "@/components/parabola-demo";
import { Button, Card, Input, InfoNote, ErrorNote, Label, LinkButton, Textarea } from "@/components/ui";
import { submitLead } from "@/app/leads-actions";
import { featureLabel, formatEntitlement } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type Entitlement = { feature: string; enabled: boolean; limit_value: number | null };
type Plan = {
  code: string;
  name: string;
  description: string | null;
  is_enterprise: boolean;
  sort: number;
  plan_entitlements: Entitlement[];
};

const FORMS = ["SD", "MI", "SMP", "MTs", "SMA", "MA", "SMK", "SLB", "Paket C", "Pesantren", "Kustom"];

type ModuleRow = { code: string; name: string; description: string; status: string; sort: number };

const AUDIENCE = [
  { icon: "🚀", title: "Murid", sub: "Seru seperti game", points: ["Jalur belajar bergaya Duolingo dengan hitung mundur", "Misi harian, streak, level, dan liga kelas", "Latihan ribuan soal, XP yang adil"] },
  { icon: "🧑‍🏫", title: "Guru", sub: "Ringkas, tinggal klik", points: ["Beranda “Hari ini”: jadwal, absen, perlu perhatian", "AI menyusun skill tree semester dan bank soal", "Antrean integritas dengan banding yang adil"] },
  { icon: "🏫", title: "Sekolah", sub: "Fleksibel, semua jenis sekolah", points: ["SD, MI, SMP, SMA, SMK, SLB, pesantren, kustom", "Impor data dan berkas besar, AI memilah", "Kebijakan tampilan dan integritas sendiri"] },
];
const SCIENCE = [
  { title: "Bersiap sehari sebelumnya", body: "Persiapan baru terbuka H-1 pukul 15.00 dengan pratinjau singkat dan soal pemantik, supaya otak sudah “panas” saat guru mulai." },
  { title: "Berlatih mengingat", body: "Soal latihan memaksa otak mengingat, cara belajar yang terbukti lebih awet daripada membaca ulang." },
  { title: "Mengulang dengan jarak", body: "Soal yang sudah dikuasai muncul lagi beberapa hari kemudian, tepat sebelum lupa. Menjelang ulangan, pengulangannya dirapatkan." },
];
const AI_FEATURES = [
  { icon: "🌳", title: "Skill tree semester otomatis", body: "Dari buku paket dan jadwal pelajaran, tanggal buka dihitung sistem dan isi disusun AI. Guru tinggal meninjau dan menerbitkan per unit." },
  { icon: "🧠", title: "Bank soal ribuan butir", body: "Dibuat dari buku atau LKS, diperiksa duplikat, kutipan sumber, dan dijawab ulang tanpa kunci sebelum sampai ke murid." },
  { icon: "🛡️", title: "Latihan yang adil", body: "Jawaban asal-cepat tidak menambah XP. Pola mencurigakan menahan XP, murid boleh banding, kamera hanya opsional dan di perangkat." },
];
const ADMIN = [
  { icon: "🗓️", title: "Absensi, nilai, jadwal", body: "Administrasi harian dalam satu tempat." },
  { icon: "📄", title: "Rapor dan surat", body: "Template yang bisa diatur, cetak rapi." },
  { icon: "💰", title: "Keuangan", body: "Tagihan, pembayaran, dan impor dari Excel." },
  { icon: "🔌", title: "AI Anda sendiri", body: "Hubungkan Claude, ChatGPT, atau Gemini lewat satu prompt." },
];

const FEATURE_ORDER = ["max_students", "visual_modules", "custom_curriculum", "ai_tutor"];

const CONTACT_MESSAGES: Record<string, { text: string; ok: boolean }> = {
  terkirim: { text: "Terima kasih. Tim kami menghubungi Anda lewat email.", ok: true },
  gagal: { text: "Pesan belum terkirim. Coba lagi sebentar lagi.", ok: false },
  "tidak-valid": { text: "Isi nama dan email yang valid.", ok: false },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ kontak?: string }>;
}) {
  const { kontak } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .select("code,name,description,is_enterprise,sort,plan_entitlements(feature,enabled,limit_value)")
    .order("sort");
  const plans = (data ?? []) as Plan[];
  const [{ data: modData }, { data: pmData }] = await Promise.all([
    supabase.from("modules").select("code,name,description,status,sort").order("sort"),
    supabase.from("plan_modules").select("plan_code,module_code"),
  ]);
  const modules = (modData ?? []) as ModuleRow[];
  const inPlan = new Set((pmData ?? []).map((r) => `${r.plan_code as string}:${r.module_code as string}`));
  const features = FEATURE_ORDER.filter((f) => plans.some((p) => p.plan_entitlements.some((e) => e.feature === f)));
  const note = kontak ? CONTACT_MESSAGES[kontak] : undefined;

  return (
    <>
      <main className="flex-1">
        <IslandScene
          header={<SiteHeader overlay />}
          pena={
            <>
              <div className="island-bubble whitespace-nowrap" aria-hidden="true" style={{ bottom: "calc(138 * var(--s) + 175px)", left: "calc(50% + 100 * var(--s) - 20px)" }}>Ayo mulai! 👋</div>
              <Mascot size={200} className="island-pena" />
            </>
          }
        >
          <HeroMotion className="grid gap-5">
            <p data-hero="eyebrow" className="hero-item island-eyebrow w-fit">Belajar seru · Sekolah rapi</p>
            <h1 className="island-title">
              <Words text="Belajar jadi" /><br />
              <span className="em"><Words text="petualangan." /><svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M4 12 C 50 2, 90 20, 140 10 S 230 2, 296 11" /></svg></span>
            </h1>
            <p data-hero="lede" className="hero-item island-lede">
              Murid menyusuri jalur belajar seperti game. Guru dibantu AI. Sekolah mengatur semuanya sendiri, dari SD sampai pesantren.
            </p>
            <div data-hero="cta" className="hero-item flex flex-wrap gap-3">
              <LinkButton href="/daftar">Daftarkan sekolah</LinkButton>
              <LinkButton href="#perjalanan" variant="ghost">Lihat perjalanan</LinkButton>
            </div>
          </HeroMotion>
        </IslandScene>

        <section id="perjalanan" className="mx-auto w-full max-w-6xl px-4 pb-10">
          <Journey>
            <Station n={1} title={<>Setiap pelajaran adalah <mark>jalan setapak</mark>.</>}
              body={<><p>Murid menyusuri jalur belajar: simpul terbuka satu per satu, XP, streak, dan liga kelas. Seru seperti game, adil seperti ujian.</p>
                <ul className="mt-4 space-y-1.5">{AUDIENCE[0].points.map((x) => <li key={x} className="flex gap-2"><span aria-hidden="true" className="font-extrabold text-ok">✓</span>{x}</li>)}</ul></>}
              visual={<div className="mx-auto max-w-sm" style={{ rotate: "-2deg" }}><LandingPath /></div>} />

            <Station n={2} side="right" title={<>Dibuat supaya ingatan <mark>awet</mark>.</>}
              body={<ol className="space-y-3">{SCIENCE.map((x, i) => <li key={x.title} className="flex gap-3"><span className="num grid size-8 shrink-0 place-items-center rounded-full bg-pen font-extrabold text-on-pen">{i + 1}</span><span><strong className="block text-ink">{x.title}</strong>{x.body}</span></li>)}</ol>}
              visual={<ForgettingCurve />} />

            <Station n={3} title={<>AI membantu guru. <mark>Bukan menggantikan.</mark></>}
              body={<p>Semua hasil AI berstatus draf sampai guru menyetujuinya. Kunci AI milik sekolah atau pengguna sendiri; data siswa tidak lewat kunci milik platform.</p>}
              visual={<ul className="grid gap-4">{AI_FEATURES.map((f, i) => (
                <li key={f.title} className="sticker flex gap-3" style={{ rotate: `${[-1.6, 1.2, -0.8][i]}deg`, marginLeft: `${[0, 1.5, 0.5][i]}rem` }}>
                  <span aria-hidden="true" className="text-4xl">{f.icon}</span>
                  <span><strong className="block font-display text-lg">{f.title}</strong><span className="text-ink-soft">{f.body}</span></span>
                </li>))}</ul>} />

            <Station n={4} side="right" title={<>Pilih <mark>duniamu</mark>.</>}
              body={<p>Sepuluh tema, tiga gaya, ukuran huruf, dan mode hemat gerak. Coba sekarang: seluruh halaman ini ikut berubah. Sekolah menetapkan batasnya, murid dan guru memilih di dalamnya.</p>}
              visual={<div className="sticker"><ThemePlayground /></div>} />

            <Station n={5} title={<>Lihat, <mark>jangan cuma baca</mark>.</>}
              body={<p>Modul visual per mata pelajaran, dipasang sekolah sesuai kebutuhan: grafik fungsi untuk matematika, editor dan eksekusi untuk coding, simulasi untuk sains. Geser sliderlah, grafiknya bergerak.</p>}
              visual={<ParabolaDemo />} />

            <Station n={6} side="right" title={<>Untuk guru dan kepala sekolah: <mark>sederhana</mark>.</>}
              body={<><p>Administrasi harian dalam satu tempat, tanpa tumpukan menu. Satu beranda “Hari ini”, selebihnya satu klik.</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Bentuk pendidikan yang didukung">{FORMS.map((f) => <li key={f} className="inline-flex min-h-9 items-center rounded-full border-2 border-line bg-card px-3 text-sm font-bold">{f}</li>)}</ul></>}
              visual={<ul className="grid gap-3 sm:grid-cols-2">{ADMIN.map((x, i) => (
                <li key={x.title} className="sticker" style={{ rotate: `${[1, -1.2, -0.6, 1.4][i]}deg` }}>
                  <span aria-hidden="true" className="text-3xl">{x.icon}</span><strong className="mt-1 block">{x.title}</strong><span className="text-sm text-ink-soft">{x.body}</span>
                </li>))}</ul>} />
          </Journey>
        </section>

        <section className="gate">
          <div className="mx-auto grid w-full max-w-6xl items-end gap-6 px-4 py-16 md:grid-cols-[1fr_auto]">
            <div>
              <h2>Siap berangkat?</h2>
              <p className="mt-4 max-w-xl text-lg opacity-90">Daftarkan sekolahmu, undang guru dan murid dengan satu kode, dan jalan setapak pertama siap dilalui hari ini.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton href="/daftar" variant="ghost">Daftarkan sekolah</LinkButton>
                <LinkButton href="#paket" variant="ghost">Lihat paket</LinkButton>
              </div>
            </div>
            <Mascot size={190} className="mx-auto" />
          </div>
        </section>

        <section id="paket" className="border-y border-line bg-card">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <h2 className="station-title">Pilih <mark>bekalmu</mark>.</h2>
            <p className="mt-3 text-ink-soft">Nama dan batas paket masih sementara. Harga menyusul.</p>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {plans.map((p, i) => (
                <li key={p.code} className="sticker flex flex-col" style={{ rotate: `${[-0.8, 0.5, -0.4][i % 3]}deg` }}>
                  <h3 className="font-display text-3xl font-extrabold">{p.name}</h3>
                  <p className="mt-1 text-ink-soft">{p.description}</p>
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {features.map((feature) => {
                      const e = p.plan_entitlements.find((x) => x.feature === feature);
                      return <li key={feature} className="flex justify-between gap-3 border-b border-line py-1.5 text-sm"><span className="text-ink-soft">{featureLabel(feature)}</span><span className="font-bold">{e ? formatEntitlement(e.enabled, e.limit_value) : "–"}</span></li>;
                    })}
                  </ul>
                  <div className="mt-5">
                    {p.is_enterprise ? <LinkButton href="#kontak" variant="ghost">Hubungi tim dev</LinkButton> : <LinkButton href="/daftar">Mulai dengan {p.name}</LinkButton>}
                  </div>
                </li>
              ))}
            </ul>
            <details className="mt-8">
              <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-btn border-2 border-line bg-paper px-4 font-bold">Bandingkan semua fitur dan modul</summary>
            <div className="mt-8 overflow-x-auto" tabIndex={0} role="region" aria-label="Perbandingan paket">
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th scope="col" className="py-3 pr-4 text-sm font-semibold text-ink-soft">
                      Fitur
                    </th>
                    {plans.map((p) => (
                      <th key={p.code} scope="col" className="py-3 pr-4 align-bottom">
                        <span className="font-display text-xl font-bold">{p.name}</span>
                        <span className="mt-0.5 block text-sm font-normal text-ink-soft">{p.description}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature) => (
                    <tr key={feature} className="border-b border-line">
                      <th scope="row" className="py-3 pr-4 font-semibold">
                        {featureLabel(feature)}
                      </th>
                      {plans.map((p) => {
                        const e = p.plan_entitlements.find((x) => x.feature === feature);
                        return (
                          <td key={p.code} className="py-3 pr-4">
                            {e ? formatEntitlement(e.enabled, e.limit_value) : "–"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {modules.map((m) => (
                    <tr key={m.code} className="border-b border-line">
                      <th scope="row" className="py-3 pr-4 font-semibold">
                        {m.name}
                        {m.status !== "tersedia" ? <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs font-normal text-ink-soft">segera</span> : null}
                        <span className="block text-sm font-normal text-ink-soft">{m.description}</span>
                      </th>
                      {plans.map((p) => (
                        <td key={p.code} className="py-3 pr-4">
                          {inPlan.has(`${p.code}:${m.code}`) ? <span aria-label="Termasuk" className="font-bold text-ok">✓</span> : <span aria-label="Tidak termasuk" className="text-ink-soft">–</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="py-4 pr-4" />
                    {plans.map((p) => (
                      <td key={p.code} className="py-4 pr-4">
                        {p.is_enterprise ? (
                          <LinkButton href="#kontak" variant="ghost">
                            Hubungi tim dev
                          </LinkButton>
                        ) : (
                          <LinkButton href="/daftar">Mulai dengan {p.name}</LinkButton>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            </details>
          </div>
        </section>

        <section id="kontak" className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="station-title">Butuh konfigurasi <mark>khusus</mark>?</h2>
            <p className="mt-3 max-w-md text-ink-soft">
              Paket Enterprise untuk yayasan dengan banyak satuan pendidikan, kurikulum kustom, atau kebutuhan
              integrasi. Ceritakan kondisi sekolah Anda dan tim kami menghubungi lewat email.
            </p>
          </div>
          <Card>
            {note ? note.ok ? <InfoNote message={note.text} /> : <ErrorNote message={note.text} /> : null}
            <form action={submitLead} className="mt-1 flex flex-col gap-4">
              <label>
                <Label>Nama</Label>
                <Input name="name" required minLength={2} maxLength={120} autoComplete="name" />
              </label>
              <label>
                <Label>Email</Label>
                <Input name="email" type="email" required maxLength={200} autoComplete="email" />
              </label>
              <label>
                <Label hint="opsional">Nama sekolah atau yayasan</Label>
                <Input name="school_name" maxLength={200} />
              </label>
              <label>
                <Label hint="opsional">Kebutuhan</Label>
                <Textarea name="message" rows={4} maxLength={2000} />
              </label>
              <Button type="submit">Kirim</Button>
            </form>
          </Card>
        </section>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-ink-soft">
          EduSmart masih dalam pengembangan.
        </div>
      </footer>
    </>
  );
}
