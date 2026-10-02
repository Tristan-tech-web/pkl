import Link from "next/link";
import { Empty } from "@/components/empty";
import { notFound, redirect } from "next/navigation";
import { BackLink } from "@/components/role-views";
import { SchoolNav } from "@/components/school-nav";
import { Button, Label, Select } from "@/components/ui";
import { currentTerm } from "@/lib/grades";
import { requireModule } from "@/lib/modules";
import { first, getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";

export const metadata = { title: "Rapor · EduSmart" };
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());

export default async function RaporIndex({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ class?: string; term?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "gradebook");
  const { data: termRows } = await supabase.from("terms").select("id,name,starts_on,ends_on").eq("school_id", id).order("starts_on");
  const terms = (termRows ?? []) as { id: string; name: string; starts_on: string; ends_on: string }[];
  const term = terms.find((t) => t.id === sp.term) ?? currentTerm(terms, today());
  if (me.roleCode === "student") redirect(`/dashboard/sekolah/${id}/rapor/${me.memberId}${term ? `?term=${term.id}` : ""}`);
  const management = MANAGEMENT_ROLES.has(me.roleCode);
  if (!management && !["teacher", "homeroom", "counselor"].includes(me.roleCode)) notFound();

  const { data: cg } = await supabase.from("class_groups").select("id,name,homeroom_member_id").eq("school_id", id).order("name");
  const classes = (cg ?? []) as { id: string; name: string; homeroom_member_id: string | null }[];
  const cls = classes.find((c) => c.id === sp.class) ?? classes.find((c) => c.homeroom_member_id === me.memberId) ?? classes[0];
  const { data: roster } = cls
    ? await supabase.from("class_group_students").select("member_id,school_members(display_name)").eq("class_group_id", cls.id)
    : { data: [] };
  const students = ((roster ?? []) as unknown as { member_id: string; school_members: { display_name: string | null } | { display_name: string | null }[] | null }[])
    .map((r) => ({ id: r.member_id, name: first(r.school_members)?.display_name ?? "Tanpa nama" })).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      {management ? <SchoolNav schoolId={id} active="rapor" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Rapor</h1>
        <p className="mt-1 text-ink-soft">Pilih rombel dan semester, lalu buka rapor siswa. Catatan, sikap, dan ekstrakurikuler diisi wali kelas langsung di halaman rapor, lalu rapornya bisa dicetak.</p>
        {management ? <a href={`/dashboard/sekolah/${id}/rapor/templat`} className="mt-2 inline-flex min-h-11 items-center font-semibold text-pen underline">Atur templat rapor sekolah</a> : null}
      </header>
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label><Label>Rombel</Label><Select name="class" defaultValue={cls?.id}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></label>
        <label><Label>Semester</Label><Select name="term" defaultValue={term?.id}>{terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></label>
        <Button type="submit" variant="ghost">Tampilkan</Button>
      </form>
      {students.length === 0 ? (
        <Empty className="mt-6">Belum ada siswa di rombel ini.</Empty>
      ) : (
        <ul className="stagger mt-6 border-t border-line">
          {students.map((s) => (
            <li key={s.id} className="border-b border-line">
              <Link href={`/dashboard/sekolah/${id}/rapor/${s.id}${term ? `?term=${term.id}` : ""}`} className="flex items-baseline justify-between py-3 hover:text-pen">
                <span className="font-semibold">{s.name}</span><span className="text-sm text-pen">Buka rapor →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
