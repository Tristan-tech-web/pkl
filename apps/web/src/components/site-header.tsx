import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/user";
import { LinkButton, Wordmark } from "@/components/ui";

export async function SiteHeader({ overlay = false }: { overlay?: boolean } = {}) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);
  return (
    <header className={overlay ? "relative z-20" : "border-b border-line bg-paper"}>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="EduSmart, ke beranda">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-2" aria-label="Utama">
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
