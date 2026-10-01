import { SiteHeader } from "@/components/site-header";
import { HeroMotion } from "@/components/motion/hero-motion";
import { LandingPath } from "@/components/landing-path";
import { FloatField } from "@/components/three/float-field";
import { Mascot } from "@/components/three/mascot";
import { THEMES } from "@/lib/themes";
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
      <SiteHeader />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden border-b border-line">
          <FloatField className="opacity-70" />
          <HeroMotion className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-16">
            <div>
              <p data-hero="eyebrow" className="hero-item inline-flex rounded-full border-2 border-pen px-3 py-1 text-sm font-bold text-pen">Belajar seru · Sekolah rapi</p>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4rem]">
                <Words text="Belajar jadi" />{" "}<span className="highlight"><Words text="permainan." /></span>{" "}<Words text="Sekolah jadi mudah." />
              </h1>
              <p data-hero="lede" className="hero-item mt-5 max-w-xl text-lg text-ink-soft">
                Murid mendaki jalur belajar seperti game, kumpulkan XP, dan naik liga. Guru dibantu AI menyusun skill tree semester dan ribuan soal latihan. Sekolah mengatur semuanya sendiri, dari SD sampai pesantren.
              </p>
              <div data-hero="cta" className="hero-item mt-7 flex flex-wrap gap-3">
                <LinkButton href="/daftar">Daftarkan sekolah</LinkButton>
                <LinkButton href="#cara" variant="ghost">Lihat cara kerjanya</LinkButton>
              </div>
              <ul className="mt-8 flex max-w-xl flex-wrap gap-2" aria-label="Bentuk pendidikan yang didukung">
                {FORMS.map((f) => <li key={f} className="bubble inline-flex min-h-9 items-center rounded-full border border-line bg-card px-3 text-sm font-semibold">{f}</li>)}
              </ul>
            </div>
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -left-2 -top-3 z-20 rounded-full border-2 border-line bg-card px-3 py-1 text-sm font-bold shadow-pop">🔥 7 hari beruntun</div>
              <div className="absolute -right-2 top-24 z-20 rounded-full border-2 border-line bg-card px-3 py-1 text-sm font-bold shadow-pop">⭐ +60 XP</div>
              <div className="absolute -left-4 bottom-24 z-20 rounded-full border-2 border-line bg-card px-3 py-1 text-sm font-bold shadow-pop">🏆 Peringkat 2</div>
              <LandingPath />
              <Mascot size={200} className="absolute -bottom-14 -right-12 z-20" />
            </div>
          </HeroMotion>
        </section>

        <section id="cara" className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Satu platform, tiga pengalaman</h2>
          <p className="mt-2 max-w-2xl text-ink-soft">Tampilan menyesuaikan siapa yang memakainya. Sekolah, guru, dan murid bahkan bisa memilih tema sendiri.</p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {AUDIENCE.map((a) => (
              <li key={a.title} className="surface p-5">
                <span aria-hidden="true" className="text-4xl">{a.icon}</span>
                <h3 className="mt-2 font-display text-xl font-bold">{a.title}</h3>
                <p className="text-sm font-semibold text-pen">{a.sub}</p>
                <ul className="mt-3 space-y-1.5 text-ink-soft">{a.points.map((p) => <li key={p} className="flex gap-2"><span aria-hidden="true" className="text-ok">✓</span>{p}</li>)}</ul>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-line bg-card">
          <div className="mx-auto w-full max-w-6xl px-4 py-14">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Dibuat supaya ingatan awet</h2>
            <p className="mt-2 max-w-2xl text-ink-soft">Bukan sekadar poin. Urutan belajarnya mengikuti cara otak mengingat: bersiap sebelum pelajaran, berlatih mengingat, lalu mengulang dengan jarak.</p>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {SCIENCE.map((x, i) => (
                <li key={x.title} className="rounded-box border-2 border-line p-5">
                  <span className="num grid size-9 place-items-center rounded-full bg-pen text-lg font-extrabold text-on-pen">{i + 1}</span>
                  <h3 className="mt-3 font-display text-lg font-bold">{x.title}</h3>
                  <p className="mt-1 text-ink-soft">{x.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">AI yang membantu guru, bukan menggantikan</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {AI_FEATURES.map((f) => (
              <li key={f.title} className="surface p-5">
                <span aria-hidden="true" className="text-3xl">{f.icon}</span>
                <h3 className="mt-2 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-1 text-ink-soft">{f.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-soft">Semua hasil AI berstatus draf sampai guru menyetujuinya. Kunci AI milik sekolah atau pengguna sendiri; data siswa tidak lewat kunci milik platform.</p>
        </section>

        <section className="border-y border-line bg-card">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-14 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">Pilih tampilanmu</h2>
              <p className="mt-2 text-ink-soft">Sepuluh tema siap pakai, tiga gaya (Ceria, Seru, Ringkas), ukuran huruf, dan mode hemat gerak. Sekolah menetapkan batasnya, murid dan guru memilih di dalamnya.</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tema">
                {THEMES.map((t) => (
                  <li key={t.id} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-paper py-1 pl-1 pr-3 text-sm font-semibold">
                    <span aria-hidden="true" className="size-8 rounded-full border border-line" style={{ background: `linear-gradient(135deg, ${t.tokens.paper} 50%, ${t.tokens.pen} 50%)` }} />{t.label}
                  </li>
                ))}
              </ul>
            </div>
            <ParabolaDemo />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Untuk kepala sekolah dan guru: sederhana</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ADMIN.map((x) => (<li key={x.title} className="surface p-4"><span aria-hidden="true" className="text-3xl">{x.icon}</span><h3 className="mt-1 font-bold">{x.title}</h3><p className="text-sm text-ink-soft">{x.body}</p></li>))}
          </ul>
        </section>

        <section id="paket" className="border-y border-line bg-card">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <h2 className="font-display text-3xl font-bold tracking-tight">Paket</h2>
            <p className="mt-2 text-ink-soft">Nama dan batas paket masih sementara. Harga menyusul.</p>
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
          </div>
        </section>

        <section id="kontak" className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_1.1fr]">
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
