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
          <nav aria-label="Akun" className="hidden items-center gap-2 sm:flex">
            <Link href="/dashboard/tampilan" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-pen underline">Tampilan</Link>
            <Link href="/dashboard/ai-saya" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-pen underline">AI saya</Link>
            <form action={signOut}><Button type="submit" variant="ghost">Keluar</Button></form>
          </nav>
          <details className="relative sm:hidden">
            <summary className="btn-ghost inline-flex min-h-11 cursor-pointer items-center rounded-btn px-4 font-bold" aria-label="Menu akun">☰ Akun</summary>
            <div className="absolute right-0 top-12 z-40 grid w-52 gap-1 rounded-box border-2 border-line bg-card p-2 shadow-pop">
              <Link href="/dashboard/tampilan" className="flex min-h-11 items-center rounded-box px-3 font-semibold hover:bg-paper">🎨 Tampilan</Link>
              <Link href="/dashboard/ai-saya" className="flex min-h-11 items-center rounded-box px-3 font-semibold hover:bg-paper">🔑 AI saya</Link>
              <form action={signOut}><button type="submit" className="flex min-h-11 w-full items-center rounded-box px-3 text-left font-semibold hover:bg-paper">🚪 Keluar</button></form>
            </div>
          </details>
        </div>
      </header>
      <main id="isi" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
