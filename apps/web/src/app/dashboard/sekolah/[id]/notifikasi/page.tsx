import { BackLink } from "@/components/role-views";
import { Empty } from "@/components/empty";
import { Button } from "@/components/ui";
import { getSchoolContext } from "@/lib/school";
import { markAllRead } from "./actions";

export const metadata = { title: "Notifikasi · EduSmart" };
const ICON: Record<string, string> = { pengumuman: "📣", tagihan: "🧾", nilai: "📝" };
const when = (iso: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(iso));

export default async function NotifikasiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getSchoolContext(id);
  const { data } = await supabase.from("notifications").select("id,kind,title,body,read_at,created_at").eq("school_id", id).order("created_at", { ascending: false }).limit(50);
  const rows = data ?? [];
  const unread = rows.filter((r) => !r.read_at).length;
  return (
    <>
      <BackLink />
      <header className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-4xl font-bold tracking-tight">Notifikasi</h1>
        {unread > 0 ? <form action={markAllRead.bind(null, id)}><Button type="submit" variant="ghost">Tandai semua dibaca ({unread})</Button></form> : null}
      </header>
      {rows.length === 0 ? (
        <Empty className="">Sepi dulu. Pengumuman, tagihan, dan nilai baru akan muncul di sini.</Empty>
      ) : (
        <ul className="stagger border-t border-line">
          {rows.map((r) => (
            <li key={r.id as string} className="border-b border-line">
              <a href={`/dashboard/sekolah/${id}/notifikasi/${r.id}`} className={`grid grid-cols-[2rem_1fr_auto] items-start gap-3 py-3 hover:text-pen ${r.read_at ? "" : "bg-pen/5"}`}>
                <span aria-hidden="true" className="text-xl">{ICON[r.kind as string] ?? "🔔"}</span>
                <span>
                  <span className={`block ${r.read_at ? "font-semibold" : "font-bold"}`}>{!r.read_at ? <span className="sr-only">Belum dibaca: </span> : null}{r.title as string}</span>
                  {r.body ? <span className="line-clamp-2 block text-ink-soft">{r.body as string}</span> : null}
                </span>
                <span className="num text-xs text-ink-soft">{when(r.created_at as string)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
