import Link from "next/link";
import { signIn } from "@/app/auth-actions";
import { safeNext } from "@/lib/nav";
import { AuthShell } from "@/components/auth-shell";
import { Button, Card, ErrorNote, InfoNote, Input, Label } from "@/components/ui";

export const metadata = { title: "Masuk · EduSmart" };

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string; next?: string }>;
}) {
  const { error, info, next } = await searchParams;
  const nextSafe = safeNext(next);
  return (
    <AuthShell title="Halo, selamat datang!" lead="Masuk untuk melanjutkan jalur belajarmu, atau mengelola kelas dan sekolah Anda.">
      <Card>
        <form action={signIn} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={nextSafe} />
          <ErrorNote message={error} />
          <InfoNote message={info} />
          <label>
            <Label>Email</Label>
            <Input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <Label>Kata sandi</Label>
            <Input name="password" type="password" autoComplete="current-password" required />
          </label>
          <Button type="submit" className="min-h-12 text-lg">Masuk</Button>
        </form>
      </Card>
      <p className="mt-4 text-sm">
        Belum punya akun?{" "}
        <Link href={`/daftar?next=${encodeURIComponent(nextSafe)}`} className="font-medium text-pen underline">
          Daftar
        </Link>
      </p>
    </AuthShell>
  );
}
