import { callName } from "@/lib/names";
import { BackLink } from "@/components/back-link";
import { StaffHome } from "@/components/staff-home";
import { StudentHome } from "@/components/student-home";
import { Card } from "@/components/ui";
import { SchoolNav } from "@/components/school-nav";
import { createClient } from "@/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;

export type Membership = { memberId: string; roleCode: string; roleName: string; displayName: string | null };

const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-grid rounded-box border border-dashed border-line p-6">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-xl text-ink-soft">{body}</p>
    </div>
  );
}

export async function OwnerView({ supabase, schoolId, me }: { supabase: Supa; schoolId: string; me: Membership }) {
  const [members, classes, subjects, programs] = await Promise.all([
    supabase.from("school_members").select("id,roles(code)").eq("school_id", schoolId),
    supabase.from("class_groups").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    supabase.from("school_subjects").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    supabase.from("school_programs").select("id,name,grades").eq("school_id", schoolId),
  ]);
  const rows = (members.data ?? []) as unknown as { id: string; roles: { code: string } | { code: string }[] | null }[];
  const count = (codes: string[]) => rows.filter((r) => codes.includes(one(r.roles)?.code ?? "")).length;
  return (
    <>
      <StaffHome supabase={supabase} schoolId={schoolId} memberId={me.memberId} name={callName(me.displayName, "Bapak/Ibu")} kind="owner" />
      <section aria-label="Ringkasan" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["🎒", "Siswa", count(["student"])], ["🧑‍🏫", "Guru dan staf", count(["teacher", "homeroom", "counselor", "curriculum_lead", "admin"])], ["🏫", "Rombel", classes.count ?? 0], ["📚", "Mata pelajaran", subjects.count ?? 0]].map(([icon, label, n]) => (
          <div key={String(label)} className="rounded-box border-2 border-line bg-card p-3"><span aria-hidden="true" className="text-2xl">{icon}</span><p className="num font-display text-3xl font-extrabold leading-none">{n}</p><p className="text-sm font-semibold text-ink-soft">{label}</p></div>
        ))}
      </section>
      <details className="mt-6 rounded-box border border-line bg-card p-4">
        <summary className="min-h-11 cursor-pointer font-display text-lg font-bold">Struktur sekolah dan semua menu</summary>
        <ul className="mt-3 border-t border-line">
          {((programs.data ?? []) as { id: string; name: string; grades: number[] }[]).map((p) => (
            <li key={p.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
              <span className="font-semibold">{p.name}</span>
              <span className="num text-sm text-ink-soft">{p.grades.length > 0 ? `Kelas ${Math.min(...p.grades)}–${Math.max(...p.grades)}` : "Kelas bebas"}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4"><SchoolNav schoolId={schoolId} active="" /></div>
      </details>
    </>
  );
}

type Assignment = {
  id: string;
  hours_per_week: number | null;
  class_groups: { id: string; name: string; grade: number } | { id: string; name: string; grade: number }[] | null;
  school_subjects: { id: string; name: string } | { id: string; name: string }[] | null;
};

export async function TeacherView({ supabase, schoolId, me }: { supabase: Supa; schoolId: string; me: Membership }) {
  const { data } = await supabase
    .from("teaching_assignments")
    .select("id,hours_per_week,class_groups(id,name,grade),school_subjects(id,name)")
    .eq("school_id", schoolId)
    .eq("teacher_member_id", me.memberId);
  const assignments = (data ?? []) as unknown as Assignment[];

  const byClass = new Map<string, { name: string; grade: number; subjects: { name: string; hours: number | null }[] }>();
  for (const a of assignments) {
    const cg = one(a.class_groups);
    const sub = one(a.school_subjects);
    if (!cg || !sub) continue;
    const entry = byClass.get(cg.id) ?? { name: cg.name, grade: cg.grade, subjects: [] };
    entry.subjects.push({ name: sub.name, hours: a.hours_per_week });
    byClass.set(cg.id, entry);
  }
  const classIds = [...byClass.keys()];
  const { data: roster } = classIds.length
    ? await supabase.from("class_group_students").select("class_group_id,school_members(display_name)").in("class_group_id", classIds)
    : { data: [] };
  const students = new Map<string, string[]>();
  for (const r of (roster ?? []) as unknown as { class_group_id: string; school_members: { display_name: string | null } | { display_name: string | null }[] | null }[]) {
    const list = students.get(r.class_group_id) ?? [];
    list.push(one(r.school_members)?.display_name ?? "Tanpa nama");
    students.set(r.class_group_id, list);
  }

  return (
    <>
      <StaffHome supabase={supabase} schoolId={schoolId} memberId={me.memberId} name={callName(me.displayName, "Bapak/Ibu")} kind="teacher" />
      <h2 className="mt-8 font-display text-xl font-bold">Kelas saya</h2>
      {byClass.size === 0 ? (
        <div className="mt-6">
          <Empty
            title="Belum ada penugasan mengajar"
            body="Kepala sekolah atau wakil kurikulum akan menugaskan Anda ke rombel dan mata pelajaran. Setelah itu kelas Anda muncul di sini."
          />
        </div>
      ) : (
        <div className="stagger mt-6 grid gap-4 md:grid-cols-2">
          {[...byClass.entries()].map(([id, c]) => (
            <Card key={id}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-bold tracking-tight">{c.name}</h2>
                <span className="num text-sm text-ink-soft">Kelas {c.grade}</span>
              </div>
              <ul className="mt-3 border-t border-line">
                {c.subjects.map((s) => (
                  <li key={s.name} className="flex justify-between gap-3 border-b border-line py-2">
                    <span className="font-semibold">{s.name}</span>
                    <span className="num text-sm text-ink-soft">{s.hours ?? "–"} jam/minggu</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-semibold">
                Siswa <span className="num font-normal text-ink-soft">({(students.get(id) ?? []).length})</span>
              </p>
              <p className="mt-1 text-ink-soft">
                {(students.get(id) ?? []).length > 0 ? (students.get(id) ?? []).join(", ") : "Belum ada siswa di rombel ini."}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export async function StudentView({ supabase, schoolId, me }: { supabase: Supa; schoolId: string; me: Membership }) {
  const { data: enr } = await supabase
    .from("class_group_students")
    .select("class_group_id,class_groups(id,name,grade)")
    .eq("school_id", schoolId)
    .eq("member_id", me.memberId);
  const first = ((enr ?? []) as unknown as { class_group_id: string; class_groups: { id: string; name: string; grade: number } | { id: string; name: string; grade: number }[] | null }[])[0];
  const cg = first ? one(first.class_groups) : null;
  const { data: subs } = cg
    ? await supabase.from("teaching_assignments").select("id,hours_per_week,school_subjects(id,name,group_code)").eq("class_group_id", cg.id)
    : { data: [] };
  const subjects = ((subs ?? []) as unknown as { id: string; hours_per_week: number | null; school_subjects: { id: string; name: string; group_code: string } | { id: string; name: string; group_code: string }[] | null }[])
    .map((s) => ({ id: s.id, hours: s.hours_per_week, subject: one(s.school_subjects) }))
    .filter((s): s is { id: string; hours: number | null; subject: { id: string; name: string; group_code: string } } => s.subject !== null);

  if (!cg) return <Empty title="Kamu belum masuk rombel" body="Minta guru atau admin sekolah memasukkanmu ke rombel. Setelah itu mata pelajaranmu muncul di sini." />;
  return (
    <StudentHome supabase={supabase} schoolId={schoolId} memberId={me.memberId} name={callName(me.displayName, "teman")} classId={cg.id}
      subjects={subjects.map((s) => ({ id: s.id, name: s.subject.name, hours: s.hours }))} />
  );
}

export { BackLink };
