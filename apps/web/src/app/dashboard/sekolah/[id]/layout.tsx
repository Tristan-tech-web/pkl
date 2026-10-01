import Link from "next/link";
import { AppearanceApply } from "@/components/appearance-apply";
import { lookFor } from "@/lib/look";
import { createClient } from "@/lib/supabase/server";

// Lonceng notifikasi di semua halaman sekolah. Jumlah belum dibaca dihitung di server (RLS: hanya milik sendiri).
export default async function SchoolLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("school_id", id).is("read_at", null);
  const n = count ?? 0;
  const { data: { user } } = await supabase.auth.getUser();
  const ctx = user ? await lookFor(supabase, user.id, id) : null;
  return (
    <>
      {ctx ? <AppearanceApply look={ctx.look} /> : null}
      <div className="no-print -mt-2 mb-2 flex justify-end">
        <Link
          href={`/dashboard/sekolah/${id}/notifikasi`}
          aria-label={n > 0 ? `Notifikasi, ${n} belum dibaca` : "Notifikasi"}
          className="press relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-card hover:border-pen"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
          </svg>
          {n > 0 ? (
            <span className="badge-pop num absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-bad px-1 text-xs font-bold leading-5 text-white" aria-hidden="true">{n > 9 ? "9+" : n}</span>
          ) : null}
        </Link>
      </div>
      {children}
    </>
  );
}
