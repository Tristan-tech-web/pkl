import Link from "next/link";
import { signIn } from "@/app/auth-actions";
import { safeNext } from "@/lib/nav";
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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">Masuk ke EduSmart</h1>
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
          <Button type="submit">Masuk</Button>
        </form>
      </Card>
      <p className="mt-4 text-sm">
        Belum punya akun?{" "}
        <Link href={`/daftar?next=${encodeURIComponent(nextSafe)}`} className="font-medium text-pen underline">
          Daftar
        </Link>
      </p>
    </main>
  );
}
