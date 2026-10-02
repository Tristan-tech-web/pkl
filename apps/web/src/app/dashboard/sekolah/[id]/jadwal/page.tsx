import { BackLink } from "@/components/role-views";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { addSlot, removeSlot } from "./actions";

export const metadata = { title: "Jadwal · EduSmart" };
const DAYS = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const hm = (t: string) => t.slice(0, 5);
const TINTS = ["--pen", "--accent", "--ok", "--warn"];
const tintOf = (name: string) => TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
// Waktu sekarang di WIB, dihitung di fungsi biasa agar render tetap murni.
function nowWib() { const w = new Date(Date.now() + 7 * 3600_000); return { day: ((w.getUTCDay() + 6) % 7) + 1, min: w.getUTCHours() * 60 + w.getUTCMinutes() }; }
function untilText(delta: number) { return delta < 60 ? `${delta} menit lagi` : delta < 24 * 60 ? `${Math.round(delta / 60)} jam lagi` : `${Math.round(delta / 1440)} hari lagi`; }
function nextSlot(slots: Slot[], now: { day: number; min: number }) {
  let best: { s: Slot; delta: number } | null = null;
  for (const s of slots) {
    let delta = (s.weekday - now.day) * 1440 + mins(s.starts_at) - now.min;
    if (delta < 0) delta += 7 * 1440;
    if (!best || delta < best.delta) best = { s, delta };
  }
  return best;
}
type Slot = { id: string; weekday: number; starts_at: string; ends_at: string; room: string | null; class_group_id: string; class_name: string; subject_name: string; teacher_name: string | null };

export default async function JadwalPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ class?: string; error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "schedule");
  const management = MANAGEMENT_ROLES.has(me.roleCode);

  const load = async (classId?: string, teacherId?: string) =>
    ((await supabase.rpc("schedule_for", { p_school: id, p_class: classId ?? null, p_teacher: teacherId ?? null })).data ?? []) as Slot[];
  let slots: Slot[] = [];
  let title = "Jadwal pelajaran";
  let classes: { id: string; name: string }[] = [];
  let cls: { id: string; name: string } | undefined;
  if (management) {
    const { data } = await supabase.from("class_groups").select("id,name").eq("school_id", id).order("name");
    classes = (data ?? []) as typeof classes;
    cls = classes.find((c) => c.id === sp.class) ?? classes[0];
    if (cls) slots = await load(cls.id);
  } else if (me.roleCode === "student") {
    const { data: enr } = await supabase.from("class_group_students").select("class_group_id").eq("school_id", id).eq("member_id", me.memberId).limit(1).maybeSingle();
    if (enr) slots = await load(enr.class_group_id as string);
    title = "Jadwal kelasku";
  } else {
    slots = await load(undefined, me.memberId);
    title = "Jadwal mengajarku";
  }
  const now = nowWib();
  const next = !management ? nextSlot(slots, now) : null;
  const byDay = new Map<number, Slot[]>();
  for (const s of slots) byDay.set(s.weekday, [...(byDay.get(s.weekday) ?? []), s]);

  let subjects: { id: string; name: string }[] = [];
  let teachers: { id: string; display_name: string | null }[] = [];
  if (management && cls) {
    const [sb, tc] = await Promise.all([
      supabase.from("school_subjects").select("id,name").eq("school_id", id).order("name"),
      supabase.from("school_members").select("id,display_name,roles!inner(code)").eq("school_id", id).in("roles.code", ["teacher", "homeroom", "counselor"]).order("display_name"),
    ]);
    subjects = (sb.data ?? []) as typeof subjects;
    teachers = (tc.data ?? []) as unknown as typeof teachers;
  }

  return (
    <>
      {management ? <SchoolNav schoolId={id} active="jadwal" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1>
        {management ? <p className="mt-1 text-ink-soft">Sistem menolak jam yang bentrok untuk rombel atau guru yang sama.</p> : null}
      </header>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      {management ? (
        <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
          <label><Label>Rombel</Label><Select name="class" defaultValue={cls?.id}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></label>
          <Button type="submit" variant="ghost">Tampilkan</Button>
        </form>
      ) : null}

      {next ? (
        <aside className="surface mt-5 flex items-center gap-3 border-2 !border-pen p-4" aria-label="Pelajaran berikutnya">
          <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: `color-mix(in srgb, var(${tintOf(next.s.subject_name)}) 16%, var(--card))` }}>⏰</span>
          <span className="min-w-0">
            <span className="block text-xs font-bold uppercase tracking-[0.08em] text-pen">Berikutnya · {untilText(next.delta)}</span>
            <span className="block font-display text-xl font-extrabold leading-tight">{next.s.subject_name}</span>
            <span className="num block text-sm text-ink-soft">{DAYS[next.s.weekday]} {hm(next.s.starts_at)}{next.s.room ? ` · ${next.s.room}` : ""}</span>
          </span>
        </aside>
      ) : null}

      {slots.length === 0 ? (
        <p className="mt-6 rounded-box border border-dashed border-line p-6 text-ink-soft">Belum ada jadwal.</p>
      ) : (
        <div className="stagger mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6, 7].filter((d) => byDay.has(d)).map((d) => (
            <section key={d} className={`surface p-4 ${d === now.day ? "!border-pen" : ""}`}>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">{DAYS[d]}{d === now.day ? <span className="rounded-full bg-pen px-2 py-0.5 text-xs font-bold text-on-pen">Hari ini</span> : null}</h2>
              <ul className="mt-2">
                {byDay.get(d)!.map((s) => (
                  <li key={s.id} className="border-t border-line py-2 pl-3" style={{ borderLeft: `5px solid var(${tintOf(s.subject_name)})`, borderLeftColor: `var(${tintOf(s.subject_name)})` }}>
                    <p className="num text-sm font-semibold text-pen">{hm(s.starts_at)}–{hm(s.ends_at)}</p>
                    <p className="font-semibold">{s.subject_name}</p>
                    <p className="text-sm text-ink-soft">
                      {me.roleCode === "student" || management ? s.teacher_name ?? "" : s.class_name}
                      {s.room ? ` · ${s.room}` : ""}
                    </p>
                    {management && cls ? <form action={removeSlot.bind(null, id, cls.id, s.id)}><button type="submit" className="text-sm font-semibold text-bad underline">Hapus</button></form> : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {management && cls ? (
        <form action={addSlot.bind(null, id)} className="mt-8 grid gap-3 surface p-4 sm:grid-cols-6">
          <input type="hidden" name="class_id" value={cls.id} />
          <h2 className="font-display text-lg font-bold sm:col-span-6">Tambah jam pelajaran untuk {cls.name}</h2>
          <label className="sm:col-span-2"><Label>Mata pelajaran</Label><Select name="subject_id" required>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></label>
          <label className="sm:col-span-2"><Label hint="boleh kosong">Guru</Label><Select name="teacher_id"><option value="">–</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.display_name}</option>)}</Select></label>
          <label><Label>Hari</Label><Select name="weekday" defaultValue="1">{[1, 2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{DAYS[d]}</option>)}</Select></label>
          <label><Label>Ruang</Label><Input name="room" maxLength={40} /></label>
          <label><Label>Mulai</Label><Input name="starts_at" type="time" required defaultValue="07:00" /></label>
          <label><Label>Selesai</Label><Input name="ends_at" type="time" required defaultValue="08:30" /></label>
          <div className="flex items-end sm:col-span-2"><Button type="submit">Tambah</Button></div>
        </form>
      ) : null}
    </>
  );
}
