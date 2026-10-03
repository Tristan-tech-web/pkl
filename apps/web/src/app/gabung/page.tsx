import { redeemInvite } from "@/app/gabung/actions";
import { SiteHeader } from "@/components/site-header";
import { Button, Card, ErrorNote, Input, Label } from "@/components/ui";

export const metadata = { title: "Gabung ke sekolah · EduSmart" };

export default async function GabungPage({
  searchParams,
}: {
  searchParams: Promise<{ kode?: string; error?: string }>;
}) {
  const { kode, error } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <h1 className="mb-2 font-display text-3xl font-bold tracking-tight">Gabung ke sekolah</h1>
        <p className="mb-6 text-ink-soft">Kodenya dikirim wali kelas atau admin sekolah. Ketik di sini, atau buka tautan undangannya langsung.</p>
        <Card>
          <form action={redeemInvite} className="flex flex-col gap-4">
            <ErrorNote message={error} />
            <label>
              <Label hint="huruf besar, tanpa spasi">Kode undangan</Label>
              <Input
                name="code"
                defaultValue={kode ?? ""}
                required
                maxLength={12}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="num text-xl tracking-[0.12em] uppercase"
              />
            </label>
            <label>
              <Label hint="sesuai yang dikenal sekolah">Nama lengkap</Label>
              <Input name="display_name" required minLength={2} maxLength={80} autoComplete="name" />
            </label>
            <Button type="submit">Gabung</Button>
          </form>
        </Card>
      </main>
    </>
  );
}
