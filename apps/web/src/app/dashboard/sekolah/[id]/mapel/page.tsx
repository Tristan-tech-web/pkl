import { SchoolNav } from "@/components/school-nav";
import { Button, Card, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { first, getSchoolContext } from "@/lib/school";
import { assignTeaching, createSubject, removeAssignment } from "../actions";

export const metadata = { title: "Mata pelajaran · EduSmart" };

const GROUPS = [
  ["umum", "Umum"],
  ["kejuruan", "Kejuruan"],
  ["agama", "Agama"],
  ["pilihan", "Pilihan"],
  ["muatan_lokal", "Muatan lokal"],
  ["p5", "Projek"],
  ["ekstrakurikuler", "Ekstrakurikuler"],
] as const;
const groupLabel = (c: string) => GROUPS.find(([k]) => k === c)?.[1] ?? c;

type Subject = { id: string; code: string; name: string; group_code: string; hours_per_week: number | null; school_programs: { name: string } | { name: string }[] | null };
type Assignment = {
  id: string;
  hours_per_week: number | null;
  class_groups: { name: string } | { name: string }[] | null;
  school_subjects: { name: string } | { name: string }[] | null;
  school_members: { display_name: string | null } | { display_name: string | null }[] | null;
};

export default async function MapelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { id } = await params;
  const { error, info } = await searchParams;
  const { supabase, school } = await getSchoolContext(id, { management: true });
  const [subjects, programs, classes, teachers, assignments] = await Promise.all([
    supabase.from("school_subjects").select("id,code,name,group_code,hours_per_week,school_programs(name)").eq("school_id", id).order("name"),
    supabase.from("school_programs").select("id,name").eq("school_id", id).order("name"),
    supabase.from("class_groups").select("id,name").eq("school_id", id).order("name"),
    supabase.from("school_members").select("id,display_name,roles!inner(code)").eq("school_id", id).in("roles.code", ["teacher", "homeroom", "counselor", "curriculum_lead", "admin"]),
    supabase
      .from("teaching_assignments")
      .select("id,hours_per_week,class_groups(name),school_subjects(name),school_members(display_name)")
      .eq("school_id", id),
  ]);
  const subjectRows = (subjects.data ?? []) as unknown as Subject[];
  const programRows = (programs.data ?? []) as { id: string; name: string }[];
  const classRows = (classes.data ?? []) as { id: string; name: string }[];
  const teacherRows = (teachers.data ?? []) as unknown as { id: string; display_name: string | null }[];
  const assignmentRows = (assignments.data ?? []) as unknown as Assignment[];
  const addSubject = createSubject.bind(null, id);
  const assign = assignTeaching.bind(null, id);

  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">{school.name}</h1>
      <div className="mt-4" />
      <SchoolNav schoolId={id} active="mapel" />
      <div className="mb-6 flex flex-col gap-3">
        <ErrorNote message={error} />
        <InfoNote message={info} />
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight">Mata pelajaran</h2>
          {subjectRows.length === 0 ? (
            <p className="mt-3 text-ink-soft">Belum ada mata pelajaran.</p>
          ) : (
            <ul className="mt-4 border-t border-line">
              {subjectRows.map((s) => (
                <li key={s.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-ink-soft">
                      <span className="num">{s.code}</span> · {groupLabel(s.group_code)} · {first(s.school_programs)?.name}
                    </p>
                  </div>
                  <span className="num text-sm text-ink-soft">{s.hours_per_week ?? "–"} jam</span>
                </li>
              ))}
            </ul>
          )}
          <Card className="mt-6">
            <h3 className="text-lg font-bold">Tambah mata pelajaran</h3>
            <form action={addSubject} className="mt-3 flex flex-col gap-4">
              <div className="grid grid-cols-[7rem_1fr] gap-4">
                <label>
                  <Label>Kode</Label>
                  <Input name="code" required maxLength={10} />
                </label>
                <label>
                  <Label>Nama</Label>
                  <Input name="name" required maxLength={100} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <Label>Kelompok</Label>
                  <Select name="group_code" defaultValue="umum">
                    {GROUPS.map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </label>
                <label>
                  <Label hint="jam/minggu">Beban</Label>
                  <Input name="hours_per_week" type="number" min={0.5} max={40} step={0.5} />
                </label>
              </div>
              <label>
                <Label>Program</Label>
                <Select name="program_id">
                  {programRows.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </label>
              <Button type="submit">Tambah</Button>
            </form>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold tracking-tight">Penugasan mengajar</h2>
          {assignmentRows.length === 0 ? (
            <p className="mt-3 text-ink-soft">Belum ada penugasan.</p>
          ) : (
            <ul className="mt-4 border-t border-line">
              {assignmentRows.map((a) => {
                const remove = removeAssignment.bind(null, id, a.id);
                return (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
                    <div>
                      <p className="font-semibold">
                        {first(a.school_subjects)?.name} · {first(a.class_groups)?.name}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {first(a.school_members)?.display_name ?? "Tanpa nama"} · {a.hours_per_week ?? "–"} jam/minggu
                      </p>
                    </div>
                    <form action={remove}>
                      <Button type="submit" variant="ghost">
                        Hapus
                      </Button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
          <Card className="mt-6">
            <h3 className="text-lg font-bold">Tugaskan guru</h3>
            {subjectRows.length === 0 || classRows.length === 0 || teacherRows.length === 0 ? (
              <p className="mt-2 text-ink-soft">Butuh minimal satu mata pelajaran, satu rombel, dan satu guru.</p>
            ) : (
              <form action={assign} className="mt-3 flex flex-col gap-4">
                <label>
                  <Label>Rombel</Label>
                  <Select name="class_group_id">
                    {classRows.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </label>
                <label>
                  <Label>Mata pelajaran</Label>
                  <Select name="school_subject_id">
                    {subjectRows.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </label>
                <div className="grid grid-cols-[1fr_6rem] gap-4">
                  <label>
                    <Label>Guru</Label>
                    <Select name="teacher_member_id">
                      {teacherRows.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.display_name ?? "Tanpa nama"}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label>
                    <Label>Jam</Label>
                    <Input name="hours_per_week" type="number" min={0.5} max={40} step={0.5} />
                  </label>
                </div>
                <Button type="submit">Simpan penugasan</Button>
              </form>
            )}
          </Card>
        </section>
      </div>
    </>
  );
}
