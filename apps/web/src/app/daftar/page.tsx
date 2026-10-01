import Link from "next/link";
import { signUp } from "@/app/auth-actions";
import { Button, Card, ErrorNote, Input, Label } from "@/components/ui";

export const metadata = { title: "Daftar · EduSmart" };

export default async function DaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Buat akun</h1>
      <Card>
        <form action={signUp} className="flex flex-col gap-4">
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
          <Button type="submit">Daftar</Button>
        </form>
      </Card>
      <p className="mt-4 text-sm">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-medium text-indigo-600 underline dark:text-indigo-400">
          Masuk
        </Link>
      </p>
    </main>
  );
}
