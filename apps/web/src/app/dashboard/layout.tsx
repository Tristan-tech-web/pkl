import Link from "next/link";
import { signOut } from "@/app/auth-actions";
import { Button, Wordmark } from "@/components/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" aria-label="EduSmart, ke dashboard">
            <Wordmark />
          </Link>
          <form action={signOut}>
            <Button type="submit" variant="ghost">
              Keluar
            </Button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
    </>
  );
}
