import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/role-views";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { first, getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { createNode } from "./actions";

export const metadata = { title: "Materi · EduSmart" };
const STATUS_LABEL: Record<string, string> = { draft: "Draf", published: "Terbit", archived: "Arsip" };

export default async function MateriPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id } = await params;
  const { error, info } = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  const [nodes, subjects, qs] = await Promise.all([
    supabase.from("competency_nodes").select("id,code,title,status,position,subject_id,school_subjects(name)").eq("school_id", id).order("position"),
    supabase.from("school_subjects").select("id,name").eq("school_id", id).order("name"),
    supabase.from("quiz_questions").select("node_id").eq("school_id", id),
  ]);
  if (nodes.error) notFound();
  const canAuthor = ["owner", "admin", "curriculum_lead", "teacher"].includes(me.roleCode);
  if (!canAuthor) notFound();
  const count = new Map<string, number>();
  for (const r of qs.data ?? []) count.set(r.node_id as string, (count.get(r.node_id as string) ?? 0) + 1);
  const groups = new Map<string, typeof rows>();
  type Row = { id: string; code: string; title: string; status: string; subject: string };
  const rows: Row[] = (nodes.data ?? []).map((n) => ({
    id: n.id as string, code: n.code as string, title: n.title as string, status: n.status as string,
    subject: first(n.school_subjects as { name: string } | { name: string }[] | null)?.name ?? "Lainnya",
  }));
  for (const r of rows) groups.set(r.subject, [...(groups.get(r.subject) ?? []), r]);
  const management = MANAGEMENT_ROLES.has(me.roleCode);

  return (
    <>
      {management ? <SchoolNav schoolId={id} active="materi" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Materi dan soal</h1>
        <p className="mt-1 text-ink-soft">Buat materi, tulis pelajaran, dan susun soal. Materi berstatus draf tidak terlihat siswa.</p>
      </header>
      <div className="space-y-3"><ErrorNote message={error} /><InfoNote message={info} /></div>
      <section className="mt-6 surface p-4">
        <h2 className="font-display text-xl font-bold">Materi baru</h2>
        <form action={createNode.bind(null, id)} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_6rem_auto]">
          <label><Label>Mata pelajaran</Label>
            <Select name="subject_id" required>{(subjects.data ?? []).map((s) => <option key={s.id as string} value={s.id as string}>{s.name as string}</option>)}</Select></label>
          <label><Label>Judul</Label><Input name="title" required minLength={2} maxLength={160} placeholder="mis. Barisan aritmetika" /></label>
          <label><Label>Kelas</Label><Input name="grade" type="number" min={0} max={13} defaultValue={10} /></label>
          <div className="flex items-end"><Button type="submit">Buat draf</Button></div>
        </form>
      </section>
      {[...groups.entries()].map(([subject, list]) => (
        <section key={subject} className="mt-8">
          <h2 className="font-display text-2xl font-bold tracking-tight">{subject}</h2>
          <ul className="stagger mt-3 border-t border-line">
            {list.map((r) => (
              <li key={r.id} className="border-b border-line">
                <Link href={`/dashboard/sekolah/${id}/materi/${r.id}`} className="flex flex-wrap items-baseline justify-between gap-3 py-3 hover:text-pen">
                  <span><span className="num mr-2 text-sm text-ink-soft">{r.code}</span><span className="font-semibold">{r.title}</span></span>
                  <span className="num text-sm text-ink-soft">
                    {count.get(r.id) ?? 0} soal ·{" "}
                    <span className={r.status === "published" ? "text-ok" : r.status === "draft" ? "text-bad" : ""}>{STATUS_LABEL[r.status] ?? r.status}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
