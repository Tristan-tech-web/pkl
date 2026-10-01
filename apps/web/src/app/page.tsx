import { SiteHeader } from "@/components/site-header";
import { HeroMotion } from "@/components/motion/hero-motion";
import { MathGlyphs } from "@/components/motion/math-glyphs";
import { StoryStage } from "@/components/motion/story-stage";
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

const FEATURES: { title: string; body: string; ready: boolean }[] = [
  {
    title: "Satu struktur untuk jenis sekolah apa pun",
    body: "Bentuk pendidikan, jenjang, dan program disusun dari data. Madrasah, SLB, dan sekolah terpadu tidak dipaksa masuk pola SD-SMP-SMA-SMK.",
    ready: true,
  },
  {
    title: "Kurikulum, mata pelajaran, dan program keahlian yang Anda atur",
    body: "Mulai dari paket kurikulum, lalu sesuaikan mata pelajaran, peminatan, atau konsentrasi keahlian dan kalender akademik sekolah Anda.",
    ready: true,
  },
  {
    title: "Modul visual per mata pelajaran",
    body: "Grafik fungsi, geometri, dan editor kode yang bisa diaktifkan sekolah untuk pelajaran yang membutuhkannya. Contoh di atas adalah modul pertama.",
    ready: false,
  },
  {
    title: "Tutor AI dengan kunci milik sekolah",
    body: "Sekolah yang ingin memakai AI menyambungkan kunci API sendiri, sehingga biaya dan ketentuan data berada di tangan sekolah.",
    ready: true,
  },
  {
    title: "Belajar yang terasa seperti permainan",
    body: "Peta belajar bercabang, kuis yang dinilai server, XP, level, lencana, dan liga mingguan per kelas.",
    ready: true,
  },
  {
    title: "Absensi, nilai, rapor, jadwal, dan surat",
    body: "Administrasi sekolah sehari-hari dalam satu tempat, hanya modul yang masuk paket Anda yang tampil. Orang tua melihat ringkasan anak lewat portal sendiri.",
    ready: true,
  },
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
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-line">
          <div className="bg-grid grid-ignite absolute inset-0" aria-hidden="true" />
          <MathGlyphs />
          <HeroMotion className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.05fr_1fr] lg:py-14">
            <div>
              <p data-hero="eyebrow" className="hero-item text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">
                Untuk sekolah, madrasah, SLB, dan pesantren
              </p>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.25rem]">
                <Words text="Satu platform untuk" />{" "}
                <span className="highlight">
                  <Words text="semua jenis sekolah" />
                </span>
              </h1>
              <p data-hero="lede" className="hero-item mt-5 max-w-xl text-lg text-ink-soft">
                Atur kurikulum, mata pelajaran, dan struktur sekolah Anda sendiri. Guru mengajar dan siswa belajar
                di tempat yang sama, dengan alat visual yang cocok untuk pelajarannya.
              </p>
              <div data-hero="cta" className="hero-item mt-8 flex flex-wrap gap-3">
                <LinkButton href="/daftar">Buat akun sekolah</LinkButton>
                <LinkButton href="#paket" variant="ghost">
                  Lihat paket
                </LinkButton>
              </div>
              <ul className="mt-10 flex max-w-xl flex-wrap gap-2" aria-label="Bentuk pendidikan yang didukung">
                {FORMS.map((f) => (
                  <li
                    key={f}
                    className="bubble inline-flex min-h-9 items-center gap-2 rounded-full border border-line bg-card px-3 text-sm font-semibold"
                  >
                    <span aria-hidden="true" className="relative size-3.5 rounded-full border-2 border-pen">
                      <i className="absolute inset-[1.5px] rounded-full bg-pen" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <ParabolaDemo />
          </HeroMotion>
        </section>

        <StoryStage />

        <section className="reveal mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl font-bold tracking-tight">Apa yang bisa dilakukan</h2>
          <ul className="mt-8 border-t border-line">
            {FEATURES.map((f) => (
              <li key={f.title} className="grid grid-cols-[2.25rem_1fr] gap-4 border-b border-line py-6 sm:grid-cols-[2.25rem_1fr_9rem]">
                <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" className="draw-check mt-0.5">
                  <rect x="2" y="2" width="22" height="22" rx="3" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray={f.ready ? "0" : "4 3"} />
                  {f.ready ? <path d="M7 13.5l4 4 8-9" pathLength={1} fill="none" stroke="var(--ok)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}
                </svg>
                <div>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="mt-1 max-w-2xl text-ink-soft">{f.body}</p>
                </div>
                <p
                  className={`col-start-2 text-sm font-semibold sm:col-start-3 sm:text-right ${f.ready ? "text-ok" : "text-ink-soft"}`}
                >
                  {f.ready ? "Sudah tersedia" : "Dalam pengerjaan"}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="paket" className="border-y border-line bg-card">
          <div className="reveal mx-auto w-full max-w-6xl px-4 py-16">
            <h2 className="font-display text-3xl font-bold tracking-tight">Paket</h2>
            <p className="mt-2 text-ink-soft">Nama dan batas paket masih sementara. Harga menyusul.</p>
            <div className="mt-8 overflow-x-auto">
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
          </div>
        </section>

        <section id="kontak" className="reveal mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Butuh konfigurasi khusus?</h2>
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
