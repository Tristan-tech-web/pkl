import { notFound } from "next/navigation";
import { TreeRunner } from "@/components/tree-runner";
import { Button, ErrorNote, InfoNote, Input, Label } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import type { Plan } from "@/lib/study-plan";
import { deleteTree, publishUnit, setNodeDate, shiftTree, unpublishUnit } from "../actions";

export const metadata = { title: "Skill tree semester · EduSmart" };
export const maxDuration = 120;

const KIND: Record<string, string> = { persiapan: "Persiapan", latihan: "Latihan", ulang: "Ulang", checkpoint: "Cek", boss: "Tantangan", materi: "Materi", proyek: "Proyek", cerita: "Cerita" };
const ICON: Record<string, string> = { persiapan: "🌙", latihan: "💪", ulang: "🔁", checkpoint: "🎯", boss: "👑", materi: "📖", proyek: "🛠️", cerita: "📚" };
const fmt = (iso: string) => new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(iso));

export default async function TreePage({ params, searchParams }: { params: Promise<{ id: string; planId: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id, planId } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id);
  await requireModule(supabase, id, "data_hub");
  const { data: p } = await supabase.from("study_plans").select("id,title,status,plan,subject_id").eq("id", planId).eq("school_id", id).maybeSingle();
  if (!p) notFound();
  const plan = p.plan as Plan | null;
  const prefix = `ST-${planId.replace(/-/g, "").slice(0, 8)}`;
  const [{ data: nodes }, { data: classes }, { data: units }] = await Promise.all([
    supabase.from("competency_nodes").select("id,code,title,kind,status,xp_reward,unit_id,position,node_schedule(class_group_id,unlock_at,meeting_at,class_groups(name))").eq("school_id", id).like("code", `${prefix}-%`).order("position"),
    supabase.from("class_groups").select("id,name").eq("school_id", id).order("name"),
    supabase.from("path_units").select("id,title,status,position").eq("school_id", id).eq("subject_id", p.subject_id as string).order("position"),
  ]);
  type Sch = { unlock_at: string; meeting_at: string | null; class_groups: { name: string } | { name: string }[] | null };
  const byUnit = new Map<string, NonNullable<typeof nodes>>();
  for (const n of nodes ?? []) byUnit.set((n.unit_id as string) ?? "", [...(byUnit.get((n.unit_id as string) ?? "") ?? []), n]);
  const unitList = (units ?? []).filter((u) => byUnit.has(u.id as string));

  return (
    <>
      <a href={`/dashboard/sekolah/${id}/rencana/${planId}`} className="text-sm font-semibold text-pen underline">← Rencana belajar</a>
      <h1 className="mt-3 mb-1 font-display text-3xl font-bold tracking-tight">Skill tree semester</h1>
      <p className="text-ink-soft">{p.title as string}. Tanggal dihitung dari jadwal pelajaran rombel; AI mengisi pratinjau dan soalnya. Siswa baru bisa membuka persiapan sehari sebelum pertemuan, jam 15.00 WIB.</p>
      <div className="mt-3 space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>

      {!plan ? <p className="mt-6 surface p-4">Rencana belajar belum selesai dianalisis. Selesaikan dulu di halaman rencana.</p> : (
        <section className="mt-6" aria-label="Susun">
          <h2 className="mb-2 font-display text-xl font-bold">{(nodes?.length ?? 0) > 0 ? "Susun ulang (hanya draf yang diganti)" : "Susun dari awal"}</h2>
          <TreeRunner schoolId={id} planId={planId} chapters={plan.chapters.length} classes={(classes ?? []).map((c) => ({ id: c.id as string, name: c.name as string }))} />
        </section>
      )}

      {(nodes?.length ?? 0) > 0 ? (
        <section className="mt-10" aria-label="Hasil">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">{nodes!.length} simpul dalam {unitList.length} unit</h2>
            <form action={shiftTree.bind(null, id, planId)} className="flex items-end gap-2">
              <label><Label hint="mis. 7 atau -3">Geser semua tanggal (hari)</Label><Input name="days" type="number" className="w-28" /></label>
              <Button type="submit" variant="ghost">Geser</Button>
            </form>
          </div>
          <div className="mt-4 space-y-4">
            {unitList.map((u) => {
              const list = byUnit.get(u.id as string) ?? [];
              const published = u.status === "published";
              return (
                <article key={u.id as string} className="surface p-4">
                  <header className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold">{u.title as string} <span className={`ml-2 rounded-full border px-2 text-xs font-normal ${published ? "border-ok text-ok" : "border-line text-ink-soft"}`}>{published ? "Terbit" : "Draf"}</span></h3>
                    {published
                      ? <form action={unpublishUnit.bind(null, id, planId, u.id as string)}><Button type="submit" variant="ghost">Tarik jadi draf</Button></form>
                      : <form action={publishUnit.bind(null, id, planId, u.id as string)}><Button type="submit">Terbitkan unit</Button></form>}
                  </header>
                  <ol className="mt-3 divide-y divide-line">
                    {list.map((n) => {
                      const sch = ((n.node_schedule as Sch[] | null) ?? [])[0];
                      return (
                        <li key={n.id as string} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm">
                          <span aria-hidden className="text-lg">{ICON[n.kind as string] ?? "📖"}</span>
                          <a href={`/dashboard/sekolah/${id}/materi/${n.id as string}`} className="min-w-0 flex-1 font-semibold underline decoration-line underline-offset-2">{n.title as string}</a>
                          <span className="rounded-full border border-line px-2 text-xs">{KIND[n.kind as string]}</span>
                          <span className="num text-ink-soft">+{n.xp_reward as number} XP</span>
                          {sch ? (
                            <details className="w-full sm:w-auto">
                              <summary className="num min-h-11 cursor-pointer py-2 text-right sm:w-44">buka {fmt(sch.unlock_at)} ✎</summary>
                              <form action={setNodeDate.bind(null, id, planId, n.id as string)} className="mt-1 flex items-end gap-2">
                                <label><Label>Buka pada (WIB)</Label><Input name="unlock" type="datetime-local" defaultValue={new Date(new Date(sch.unlock_at).getTime() + 7 * 3600_000).toISOString().slice(0, 16)} /></label>
                                <Button type="submit" variant="ghost">Ubah</Button>
                              </form>
                            </details>
                          ) : <span className="num w-44 text-right">tanpa jadwal</span>}
                        </li>
                      );
                    })}
                  </ol>
                </article>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`/dashboard/sekolah/${id}/belajar`} className="btn-ghost inline-flex min-h-11 items-center rounded-box px-4 font-semibold">Lihat jalur siswa</a>
            <form action={deleteTree.bind(null, id, planId)}><Button type="submit" variant="ghost">Hapus skill tree</Button></form>
          </div>
        </section>
      ) : null}
    </>
  );
}
