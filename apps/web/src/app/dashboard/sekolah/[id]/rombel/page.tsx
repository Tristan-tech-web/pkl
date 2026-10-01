import { SchoolNav } from "@/components/school-nav";
import { Button, Card, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { first, getSchoolContext } from "@/lib/school";
import { createAcademicYear, createClassGroup } from "../actions";

export const metadata = { title: "Rombel · EduSmart" };

type ClassRow = {
  id: string;
  name: string;
  grade: number;
  school_programs: { name: string } | { name: string }[] | null;
  academic_years: { name: string } | { name: string }[] | null;
};

export default async function RombelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { id } = await params;
  const { error, info } = await searchParams;
  const { supabase, school } = await getSchoolContext(id, { management: true });
  const [classes, programs, years, enrolled] = await Promise.all([
    supabase
      .from("class_groups")
      .select("id,name,grade,school_programs(name),academic_years(name)")
      .eq("school_id", id)
      .order("grade")
      .order("name"),
    supabase.from("school_programs").select("id,name").eq("school_id", id).order("name"),
    supabase.from("academic_years").select("id,name").eq("school_id", id).order("starts_on", { ascending: false }),
    supabase.from("class_group_students").select("class_group_id").eq("school_id", id),
  ]);
  const counts = new Map<string, number>();
  for (const r of (enrolled.data ?? []) as { class_group_id: string }[]) counts.set(r.class_group_id, (counts.get(r.class_group_id) ?? 0) + 1);
  const rows = (classes.data ?? []) as unknown as ClassRow[];
  const yearList = (years.data ?? []) as { id: string; name: string }[];
  const programList = (programs.data ?? []) as { id: string; name: string }[];

  const addYear = createAcademicYear.bind(null, id);
  const addClass = createClassGroup.bind(null, id);

  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-tight">{school.name}</h1>
      <div className="mt-4" />
      <SchoolNav schoolId={id} active="rombel" />
      <div className="mb-6 flex flex-col gap-3">
        <ErrorNote message={error} />
        <InfoNote message={info} />
      </div>

      <h2 className="font-display text-2xl font-bold tracking-tight">Rombongan belajar</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-ink-soft">Belum ada rombel. Tambahkan yang pertama di bawah.</p>
      ) : (
        <ul className="stagger mt-4 border-t border-line">
          {rows.map((c) => (
            <li key={c.id} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-b border-line py-3">
              <div>
                <p className="text-lg font-semibold">{c.name}</p>
                <p className="text-sm text-ink-soft">
                  {first(c.school_programs)?.name} · {first(c.academic_years)?.name}
                </p>
              </div>
              <p className="num text-sm text-ink-soft">
                Kelas {c.grade} · {counts.get(c.id) ?? 0} siswa
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">Tambah rombel</h2>
          {yearList.length === 0 || programList.length === 0 ? (
            <p className="mt-2 text-ink-soft">
              {yearList.length === 0 ? "Buat tahun ajaran dulu di kotak sebelah." : "Sekolah belum punya program."}
            </p>
          ) : (
            <form action={addClass} className="mt-3 flex flex-col gap-4">
              <label>
                <Label>Nama rombel</Label>
                <Input name="name" placeholder="mis. X PPLG 1" required maxLength={60} />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <Label>Tingkat</Label>
                  <Select name="grade" defaultValue="10">
                    {Array.from({ length: 13 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? "Pra-sekolah" : `Kelas ${i}`}
                      </option>
                    ))}
                  </Select>
                </label>
                <label>
                  <Label>Tahun ajaran</Label>
                  <Select name="academic_year_id">
                    {yearList.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
              <label>
                <Label>Program</Label>
                <Select name="program_id">
                  {programList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </label>
              <Button type="submit">Tambah rombel</Button>
            </form>
          )}
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Tahun ajaran</h2>
          {yearList.length > 0 ? <p className="mt-1 text-sm text-ink-soft">Ada: {yearList.map((y) => y.name).join(", ")}</p> : null}
          <form action={addYear} className="mt-3 flex flex-col gap-4">
            <label>
              <Label>Nama</Label>
              <Input name="name" placeholder="mis. 2026/2027" required maxLength={40} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label>
                <Label>Mulai</Label>
                <Input name="starts_on" type="date" required />
              </label>
              <label>
                <Label>Selesai</Label>
                <Input name="ends_on" type="date" required />
              </label>
            </div>
            <p className="text-sm text-ink-soft">Dibagi otomatis menjadi semester ganjil dan genap.</p>
            <Button type="submit" variant="ghost">
              Buat tahun ajaran
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
