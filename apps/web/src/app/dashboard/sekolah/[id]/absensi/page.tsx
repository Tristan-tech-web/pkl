import "@/components/island/island.css";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/role-views";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { first, getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { saveAttendance } from "./actions";

export const metadata = { title: "Absensi · EduSmart" };

const STATUS: { code: string; label: string; short: string }[] = [
  { code: "hadir", label: "Hadir", short: "H" },
  { code: "terlambat", label: "Terlambat", short: "T" },
  { code: "izin", label: "Izin", short: "I" },
  { code: "sakit", label: "Sakit", short: "S" },
  { code: "alpa", label: "Alpa", short: "A" },
];
const TEACHING = new Set(["teacher", "homeroom", "counselor"]);
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
const label = (c: string) => STATUS.find((s) => s.code === c)?.label ?? c;

type SP = { class?: string; date?: string; error?: string; info?: string };

export default async function AbsensiPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "attendance");
  if (me.roleCode === "student") return <StudentAttendance schoolId={id} memberId={me.memberId} />;
  const management = MANAGEMENT_ROLES.has(me.roleCode);
  if (!management && !TEACHING.has(me.roleCode)) notFound();

  // Rombel yang boleh dicatat: semua (pengelola) atau yang diajar/diwalikan.
  const { data: all } = await supabase.from("class_groups").select("id,name,grade,homeroom_member_id").eq("school_id", id).order("name");
  let classes = (all ?? []) as { id: string; name: string; grade: number; homeroom_member_id: string | null }[];
  if (!management) {
    const { data: ta } = await supabase.from("teaching_assignments").select("class_group_id").eq("school_id", id).eq("teacher_member_id", me.memberId);
    const mine = new Set((ta ?? []).map((r) => r.class_group_id as string));
    classes = classes.filter((c) => mine.has(c.id) || c.homeroom_member_id === me.memberId);
  }
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "") ? (sp.date as string) : today();
  const cls = classes.find((c) => c.id === sp.class) ?? classes[0];

  let students: { id: string; name: string }[] = [];
  const existing = new Map<string, { status: string; note: string | null }>();
  let recap: { name: string; counts: Record<string, number>; total: number }[] = [];
  if (cls) {
    const { data: roster } = await supabase.from("class_group_students").select("member_id,school_members(display_name)").eq("class_group_id", cls.id);
    students = ((roster ?? []) as unknown as { member_id: string; school_members: { display_name: string | null } | { display_name: string | null }[] | null }[])
      .map((r) => ({ id: r.member_id, name: first(r.school_members)?.display_name ?? "Tanpa nama" }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const { data: rec } = await supabase.from("attendance_records").select("member_id,on_date,status,note").eq("class_group_id", cls.id).gte("on_date", `${date.slice(0, 7)}-01`).lte("on_date", `${date.slice(0, 7)}-31`);
    const byMember = new Map<string, Record<string, number>>();
    for (const r of rec ?? []) {
      if (r.on_date === date) existing.set(r.member_id as string, { status: r.status as string, note: (r.note as string | null) ?? null });
      const c = byMember.get(r.member_id as string) ?? {};
      c[r.status as string] = (c[r.status as string] ?? 0) + 1;
      byMember.set(r.member_id as string, c);
    }
    recap = students.map((s) => {
      const counts = byMember.get(s.id) ?? {};
      return { name: s.name, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
    });
  }

  return (
    <>
      {management ? <SchoolNav schoolId={id} active="absensi" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Absensi harian</h1>
        <p className="mt-1 text-ink-soft">Pilih rombel dan tanggal, tandai tiap siswa, lalu simpan. Menyimpan ulang pada tanggal yang sama memperbarui catatan.</p>
      </header>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      {classes.length === 0 ? (
        <p className="mt-6 rounded-box border border-dashed border-line p-6 text-ink-soft">Anda belum ditugaskan di rombel mana pun.</p>
      ) : (
        <>
          <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
            <label><Label>Rombel</Label>
              <Select name="class" defaultValue={cls?.id}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></label>
            <label><Label>Tanggal</Label><Input type="date" name="date" defaultValue={date} /></label>
            <Button type="submit" variant="ghost">Tampilkan</Button>
          </form>
          {cls ? (
            <form action={saveAttendance.bind(null, id, cls.id, date)} className="mt-6">
              {students.length === 0 ? (
                <p className="rounded-box border border-dashed border-line p-6 text-ink-soft">Belum ada siswa di rombel ini.</p>
              ) : (
                <ul className="border-t border-line">
                  {students.map((s) => {
                    const cur = existing.get(s.id);
                    return (
                      <li key={s.id} className="border-b border-line py-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="min-w-40 font-semibold">{s.name}</p>
                          <fieldset className="flex gap-1.5">
                            <legend className="sr-only">Status {s.name}</legend>
                            {STATUS.map((st) => (
                              <label key={st.code} className="relative">
                                <input type="radio" name={`status:${s.id}`} value={st.code} defaultChecked={(cur?.status ?? "hadir") === st.code && (cur !== undefined || st.code === "hadir")} className="peer sr-only" />
                                <span data-s={st.code} className="att-opt press flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-box border-2 border-line px-2 text-sm font-semibold peer-focus-visible:ring-2 peer-focus-visible:ring-pen/40 sm:px-3">
                                  <span className="sm:hidden" aria-hidden="true">{st.short}</span>
                                  <span className="hidden sm:inline">{st.label}</span>
                                  <span className="sr-only sm:hidden">{st.label}</span>
                                </span>
                              </label>
                            ))}
                          </fieldset>
                        </div>
                        <Input name={`note:${s.id}`} defaultValue={cur?.note ?? ""} placeholder="Catatan (opsional)" maxLength={300} className="mt-2" aria-label={`Catatan ${s.name}`} />
                      </li>
                    );
                  })}
                </ul>
              )}
              {students.length > 0 ? <div className="mt-4"><Button type="submit">Simpan absensi</Button></div> : null}
            </form>
          ) : null}
          {recap.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold tracking-tight">Rekap bulan {date.slice(0, 7)}</h2>
              <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Rekap absensi bulanan">
                <table className="w-full min-w-[32rem] text-left">
                  <thead><tr className="border-b-2 border-ink text-sm"><th className="py-2 pr-3">Siswa</th>{STATUS.map((s) => <th key={s.code} className="num px-2 py-2 text-right">{s.label}</th>)}<th className="num px-2 py-2 text-right">% hadir</th></tr></thead>
                  <tbody>
                    {recap.map((r) => {
                      const present = (r.counts.hadir ?? 0) + (r.counts.terlambat ?? 0);
                      return (
                        <tr key={r.name} className="border-b border-line">
                          <td className="py-2 pr-3 font-semibold">{r.name}</td>
                          {STATUS.map((s) => <td key={s.code} className={`num px-2 py-2 text-right ${s.code === "alpa" && (r.counts.alpa ?? 0) > 0 ? "font-bold text-bad" : ""}`}>{r.counts[s.code] ?? 0}</td>)}
                          <td className="num px-2 py-2 text-right">{r.total ? Math.round((present / r.total) * 100) : "–"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      )}
    </>
  );
}

async function StudentAttendance({ schoolId, memberId }: { schoolId: string; memberId: string }) {
  const { supabase } = await getSchoolContext(schoolId);
  const { data } = await supabase.from("attendance_records").select("on_date,status,note").eq("school_id", schoolId).eq("member_id", memberId).order("on_date", { ascending: false }).limit(60);
  const rows = data ?? [];
  const present = rows.filter((r) => r.status === "hadir" || r.status === "terlambat").length;
  return (
    <>
      <BackLink />
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Kehadiranku</h1>
        <p className="mt-1 text-ink-soft">60 catatan terakhir.</p>
      </header>
      <div className="border-t-2 border-ink pt-3 sm:max-w-xs">
        <p className="num font-display text-5xl font-bold">{rows.length ? Math.round((present / rows.length) * 100) : "–"}{rows.length ? "%" : ""}</p>
        <p className="text-sm font-semibold">Kehadiran</p>
      </div>
      {rows.length === 0 ? (
        <p className="mt-6 rounded-box border border-dashed border-line p-6 text-ink-soft">Belum ada catatan absensi.</p>
      ) : (
        <ul className="stagger mt-6 border-t border-line">
          {rows.map((r) => (
            <li key={r.on_date as string} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
              <span className="num">{r.on_date as string}</span>
              <span className={`font-semibold ${r.status === "alpa" ? "text-bad" : r.status === "hadir" ? "text-ok" : ""}`}>{label(r.status as string)}{r.note ? <span className="ml-2 font-normal text-ink-soft">{r.note as string}</span> : null}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
