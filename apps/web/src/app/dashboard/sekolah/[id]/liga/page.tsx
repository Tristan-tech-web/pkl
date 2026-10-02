import { BackLink } from "@/components/role-views";
import { Podium } from "@/components/podium";
import { SchoolNav } from "@/components/school-nav";
import { Button, Label, Select } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";

export const metadata = { title: "Liga dan lencana · EduSmart" };
const ICON: Record<string, string> = { seedling: "🌱", star: "⭐", flame: "🔥", map: "🗺️", rocket: "🚀", refresh: "🔄" };
type Row = { rank: number; label: string; xp: number; is_me: boolean };

export default async function LigaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ class?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "learning");
  const staff = me.roleCode !== "student";
  let classes: { id: string; name: string }[] = [];
  if (staff) classes = ((await supabase.from("class_groups").select("id,name").eq("school_id", id).order("name")).data ?? []) as typeof classes;
  const cls = classes.find((c) => c.id === sp.class) ?? classes[0];
  const league = ((await supabase.rpc("weekly_league", { p_school_id: id, p_class_id: staff ? cls?.id ?? null : null })).data ?? []) as Row[];
  const [all, mine] = staff
    ? [null, null]
    : await Promise.all([supabase.from("achievements").select("code,name,description,icon").order("sort"), supabase.from("member_achievements").select("code,earned_at").eq("member_id", me.memberId)]);
  const earned = new Map((mine?.data ?? []).map((r) => [r.code as string, r.earned_at as string]));
  const top = Math.max(1, ...league.map((r) => Number(r.xp)));
  return (
    <>
      {MANAGEMENT_ROLES.has(me.roleCode) ? <SchoolNav schoolId={id} active="liga" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">{staff ? "Liga mingguan" : "Liga dan lencana"}</h1>
        <p className="mt-1 text-ink-soft">XP pekan ini, Senin sampai Minggu, di rombelmu. Nama disingkat demi privasi.</p>
      </header>
      {staff ? (
        <form method="get" className="mb-4 flex items-end gap-3">
          <label><Label>Rombel</Label><Select name="class" defaultValue={cls?.id}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></label>
          <Button type="submit" variant="ghost">Tampilkan</Button>
        </form>
      ) : null}
      {league.length === 0 ? (
        <p className="rounded-box border border-dashed border-line p-6 text-ink-soft">Belum ada peserta liga.</p>
      ) : (
        <>
        <Podium rows={league} staff={staff} />
        <ol className="stagger border-t border-line">
          {league.map((r, i) => (
            <li key={`${r.rank}-${r.label}`} className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-line py-2.5 ${r.is_me ? "bg-pen/10 px-2" : ""}`}>
              <span className="num font-display text-2xl font-bold">{r.rank}</span>
              <div>
                <p className={r.is_me ? "font-bold" : "font-semibold"}>{r.label}{r.is_me ? " (kamu)" : ""}</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true"><div className="bar-grow h-full rounded-full bg-pen" style={{ ["--i" as string]: i, width: `${(Number(r.xp) / top) * 100}%` }} /></div>
              </div>
              <span className="num font-semibold">{Number(r.xp)} XP</span>
            </li>
          ))}
        </ol>
        </>
      )}
      {!staff ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">Lencana <span className="num text-ink-soft">({earned.size}/{all?.data?.length ?? 0})</span></h2>
          <ul className="stagger mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(all?.data ?? []).map((a) => {
              const got = earned.has(a.code as string);
              return (
                <li key={a.code as string} className={`rounded-box border p-4 ${got ? "border-pen bg-card" : "border-line bg-paper opacity-60"}`}>
                  <p className={`text-3xl ${got ? "" : "grayscale"}`} aria-hidden="true">{ICON[a.icon as string] ?? "🏅"}</p>
                  <p className="mt-1 font-bold">{a.name as string}</p>
                  <p className="text-sm text-ink-soft">{a.description as string}</p>
                  <p className="mt-1 text-xs font-semibold">{got ? "Diraih" : "Terkunci"}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </>
  );
}
