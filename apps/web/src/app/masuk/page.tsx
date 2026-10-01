import Link from "next/link";
import { signIn } from "@/app/auth-actions";
import { Button, Card, ErrorNote, Input, Label } from "@/components/ui";

export const metadata = { title: "Masuk · EduSmart" };

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { error, info } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Masuk ke EduSmart</h1>
      <Card>
        <form action={signIn} className="flex flex-col gap-4">
          <ErrorNote message={error} />
          {info ? (
            <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              {info}
            </p>
          ) : null}
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
        <Link href="/daftar" className="font-medium text-indigo-600 underline dark:text-indigo-400">
          Daftar
        </Link>
      </p>
    </main>
  );
}
