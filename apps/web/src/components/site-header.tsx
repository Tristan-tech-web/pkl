import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          EduSmart
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <LinkButton href="/dashboard">Dashboard</LinkButton>
          ) : (
            <>
              <LinkButton href="/masuk" variant="ghost">
                Masuk
              </LinkButton>
              <LinkButton href="/daftar">Daftar</LinkButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
