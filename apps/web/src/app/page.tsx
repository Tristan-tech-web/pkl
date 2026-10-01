import { SiteHeader } from "@/components/site-header";
import { Button, Card, Input, Label, LinkButton, Textarea } from "@/components/ui";
import { submitLead } from "@/app/leads-actions";
import { featureLabel, formatEntitlement } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type Plan = {
  code: string;
  name: string;
  description: string | null;
  is_enterprise: boolean;
  sort: number;
  plan_entitlements: { feature: string; enabled: boolean; limit_value: number | null }[];
};

const FEATURES = [
  {
    title: "Cocok untuk jenis sekolah apa pun",
    body: "SD, MI, SMP, MTs, SMA, MA, SMK, SLB, kesetaraan, pesantren, atau bentuk kustom. Struktur disusun dari data, bukan dipaksa ke satu pola.",
    status: "Tersedia",
  },
  {
    title: "Kurikulum yang bisa Anda atur",
    body: "Pilih paket kurikulum, mata pelajaran, program keahlian, dan kalender akademik sesuai kebutuhan sekolah.",
    status: "Tersedia",
  },
  {
    title: "Visualisasi untuk matematika, coding, dan lainnya",
    body: "Modul interaktif yang bisa diaktifkan per mata pelajaran.",
    status: "Segera hadir",
  },
  {
    title: "Tutor AI opsional",
    body: "Sekolah yang ingin memakai AI menyambungkan kunci API milik sendiri, jadi biaya dan data tetap di tangan sekolah.",
    status: "Segera hadir",
  },
];

const CONTACT_MESSAGES: Record<string, { text: string; tone: "ok" | "bad" }> = {
  terkirim: { text: "Terima kasih. Tim kami akan menghubungi Anda.", tone: "ok" },
  gagal: { text: "Pesan belum terkirim. Coba lagi sebentar lagi.", tone: "bad" },
  "tidak-valid": { text: "Isi nama dan email yang valid.", tone: "bad" },
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
  const note = kontak ? CONTACT_MESSAGES[kontak] : undefined;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-24">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Satu platform untuk semua jenis sekolah
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-black/70 dark:text-white/70">
            Atur kurikulum, mata pelajaran, dan struktur sekolah Anda sendiri, lalu belajar dan
            mengajar dari satu tempat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/daftar">Mulai gratis</LinkButton>
            <LinkButton href="#paket" variant="ghost">
              Lihat paket
            </LinkButton>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-16">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  {f.status}
                </p>
                <h2 className="text-lg font-semibold">{f.title}</h2>
                <p className="mt-2 text-black/70 dark:text-white/70">{f.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="paket" className="mx-auto w-full max-w-5xl px-4 pb-16">
          <h2 className="text-2xl font-semibold">Paket</h2>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            Nama dan batas paket masih sementara; harga menyusul.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.code} className="flex flex-col">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-black/65 dark:text-white/65">{plan.description}</p>
                <dl className="mt-4 flex-1 space-y-2 text-sm">
                  {plan.plan_entitlements.map((e) => (
                    <div key={e.feature} className="flex justify-between gap-3">
                      <dt className="text-black/65 dark:text-white/65">{featureLabel(e.feature)}</dt>
                      <dd className="font-medium">{formatEntitlement(e.enabled, e.limit_value)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5">
                  {plan.is_enterprise ? (
                    <LinkButton href="#kontak" variant="ghost">
                      Hubungi tim dev
                    </LinkButton>
                  ) : (
                    <LinkButton href="/daftar">Pilih {plan.name}</LinkButton>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="kontak" className="mx-auto w-full max-w-5xl px-4 pb-24">
          <Card className="max-w-xl">
            <h2 className="text-xl font-semibold">Butuh konfigurasi khusus?</h2>
            <p className="mt-1 text-sm text-black/65 dark:text-white/65">
              Ceritakan kebutuhan sekolah Anda untuk paket Enterprise.
            </p>
            {note ? (
              <p
                role="status"
                className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                  note.tone === "ok"
                    ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                    : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                }`}
              >
                {note.text}
              </p>
            ) : null}
            <form action={submitLead} className="mt-4 flex flex-col gap-4">
              <label>
                <Label>Nama</Label>
                <Input name="name" required minLength={2} maxLength={120} autoComplete="name" />
              </label>
              <label>
                <Label>Email</Label>
                <Input name="email" type="email" required maxLength={200} autoComplete="email" />
              </label>
              <label>
                <Label hint="opsional">Nama sekolah</Label>
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
    </>
  );
}
