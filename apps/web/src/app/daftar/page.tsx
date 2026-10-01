import Link from "next/link";
import { signUp } from "@/app/auth-actions";
import { safeNext } from "@/lib/nav";
import { AuthShell } from "@/components/auth-shell";
import { Button, Card, ErrorNote, Input, Label } from "@/components/ui";

export const metadata = { title: "Daftar · EduSmart" };

export default async function DaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const nextSafe = safeNext(next);
  return (
    <AuthShell title="Ayo mulai!" lead="Buat akun untuk bergabung dengan sekolahmu atau mendaftarkan sekolah baru.">
      <Card>
        <form action={signUp} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={nextSafe} />
          <ErrorNote message={error} />
          <label>
            <Label>Nama lengkap</Label>
            <Input name="full_name" autoComplete="name" required minLength={2} />
          </label>
          <label>
            <Label>Email</Label>
            <Input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <Label hint="minimal 8 karakter">Kata sandi</Label>
            <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
          </label>
          <Button type="submit" className="min-h-12 text-lg">Daftar</Button>
        </form>
      </Card>
      <p className="mt-4 text-sm">
        Sudah punya akun?{" "}
        <Link href={`/masuk?next=${encodeURIComponent(nextSafe)}`} className="font-medium text-pen underline">
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
}
