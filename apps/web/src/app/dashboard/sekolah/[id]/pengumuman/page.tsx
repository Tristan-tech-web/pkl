import { BackLink } from "@/components/role-views";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select, Textarea } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { first, getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { createAnnouncement, deleteAnnouncement } from "./actions";

export const metadata = { title: "Pengumuman · EduSmart" };
const AUD: Record<string, string> = { semua: "Semua", siswa: "Siswa", guru: "Guru dan staf", kelas: "Rombel" };
const fmt = (iso: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(iso));

export default async function PengumumanPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "announcements");
  const management = MANAGEMENT_ROLES.has(me.roleCode);
  const [list, classes, ta] = await Promise.all([
    supabase.from("announcements").select("id,title,body,audience,pinned,created_at,author_member_id,class_group_id,class_groups(name),school_members(display_name)").eq("school_id", id).order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(50),
    supabase.from("class_groups").select("id,name").eq("school_id", id).order("name"),
    me.roleCode === "teacher" || me.roleCode === "homeroom"
      ? supabase.from("teaching_assignments").select("class_group_id").eq("school_id", id).eq("teacher_member_id", me.memberId)
      : Promise.resolve({ data: [] as { class_group_id: string }[] }),
  ]);
  const mine = new Set((ta.data ?? []).map((r) => r.class_group_id as string));
  const writableClasses = management ? (classes.data ?? []) : (classes.data ?? []).filter((c) => mine.has(c.id as string));
  const canWrite = management || writableClasses.length > 0;
  type Row = { id: string; title: string; body: string; audience: string; pinned: boolean; created_at: string; author_member_id: string; class_groups: { name: string } | { name: string }[] | null; school_members: { display_name: string | null } | { display_name: string | null }[] | null };
  const rows = (list.data ?? []) as unknown as Row[];

  return (
    <>
      {management ? <SchoolNav schoolId={id} active="pengumuman" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Pengumuman</h1>
      </header>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      {canWrite ? (
        <details className="mt-4 rounded-[6px] border border-line bg-card p-4" open={rows.length === 0}>
          <summary className="cursor-pointer font-display text-lg font-bold">Tulis pengumuman</summary>
          <form action={createAnnouncement.bind(null, id)} className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2"><Label>Judul</Label><Input name="title" required minLength={3} maxLength={140} /></label>
            <label className="sm:col-span-2"><Label>Isi</Label><Textarea name="body" rows={4} required maxLength={4000} /></label>
            <label><Label>Sasaran</Label>
              <Select name="audience" defaultValue={management ? "semua" : "kelas"}>
                {management ? <><option value="semua">Semua</option><option value="siswa">Siswa</option><option value="guru">Guru dan staf</option></> : null}
                <option value="kelas">Rombel tertentu</option>
              </Select></label>
            <label><Label hint="untuk sasaran rombel">Rombel</Label>
              <Select name="class_group_id">{writableClasses.map((c) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}</Select></label>
            {management ? <label className="flex min-h-11 items-center gap-2 sm:col-span-2"><input type="checkbox" name="pinned" className="size-4" /> Sematkan di atas</label> : null}
            <div className="sm:col-span-2"><Button type="submit">Kirim</Button></div>
          </form>
        </details>
      ) : null}
      {rows.length === 0 ? (
        <p className="mt-6 rounded-[6px] border border-dashed border-line p-6 text-ink-soft">Belum ada pengumuman.</p>
      ) : (
        <ul className="stagger mt-6 space-y-4">
          {rows.map((r) => (
            <li key={r.id} className={`rounded-[6px] border bg-card p-4 ${r.pinned ? "border-pen" : "border-line"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold">{r.pinned ? "📌 " : ""}{r.title}</h2>
                <span className="rounded-full border border-line px-2 py-0.5 text-xs text-ink-soft">{r.audience === "kelas" ? first(r.class_groups)?.name ?? "Rombel" : AUD[r.audience]}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{r.body}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-soft">
                <span className="num">{fmt(r.created_at)}{first(r.school_members)?.display_name ? ` · ${first(r.school_members)!.display_name}` : ""}</span>
                {r.author_member_id === me.memberId || management ? (
                  <form action={deleteAnnouncement.bind(null, id, r.id)}><button type="submit" className="font-semibold text-bad underline">Hapus</button></form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
