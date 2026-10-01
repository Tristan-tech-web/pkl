import Link from "next/link";
import { signOut } from "@/app/auth-actions";
import { Button, Wordmark } from "@/components/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-box focus:bg-card focus:px-3 focus:py-2 focus:font-semibold">Lompat ke isi</a>
      <header className="site-header border-b border-line bg-paper">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" aria-label="EduSmart, ke dashboard">
            <Wordmark />
          </Link>
          <nav aria-label="Akun" className="flex items-center gap-2">
            <Link href="/dashboard/tampilan" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-pen underline">Tampilan</Link>
            <Link href="/dashboard/ai-saya" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-pen underline">AI saya</Link>
          <form action={signOut}>
            <Button type="submit" variant="ghost">
              Keluar
            </Button>
          </form>
          </nav>
        </div>
      </header>
      <main id="isi" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
