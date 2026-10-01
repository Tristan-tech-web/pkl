import Link from "next/link";
import { signOut } from "@/app/auth-actions";
import { Button } from "@/components/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-black/10 dark:border-white/15">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            EduSmart
          </Link>
          <form action={signOut}>
            <Button type="submit" className="bg-transparent !text-current hover:bg-black/5 dark:hover:bg-white/10 border border-black/15 dark:border-white/20">
              Keluar
            </Button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</div>
    </>
  );
}
