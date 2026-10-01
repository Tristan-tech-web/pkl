import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { Mascot } from "@/components/three/mascot";
import { loadMap, type MapNode } from "@/lib/learning";
import type { createClient } from "@/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;
type Slot = { weekday: number; starts_at: string; ends_at: string; room: string | null; subject_name: string };

const KIND: Record<string, string> = { materi: "Materi", persiapan: "Persiapan besok", latihan: "Latihan", ulang: "Ulang berjarak", checkpoint: "Cek pemahaman", boss: "Tantangan akhir", proyek: "Proyek", cerita: "Cerita" };
const SUBJECT_ICON: [RegExp, string][] = [[/mat/i, "🧮"], [/ipa|fisika|kimia|biologi|sains/i, "🔬"], [/ing|bahasa|indo|arab/i, "📖"], [/pplg|informatika|komputer|program|tik/i, "💻"], [/seni|musik|rupa/i, "🎨"], [/olahraga|pjok|jasmani/i, "⚽"], [/sejarah|ips|geografi|sosiologi/i, "🌏"], [/agama|pkn|pancasila/i, "🕊️"]];
const TINTS = ["--pen", "--accent", "--ok", "--star"];
const iconFor = (n: string) => SUBJECT_ICON.find(([r]) => r.test(n))?.[1] ?? "📚";

// Data harian murid. Fungsi biasa (bukan komponen) agar penghitungan "hari ini" tidak mengganggu kemurnian render.
async function loadToday(supabase: Supa, memberId: string, classId: string | null, schoolId: string) {
  const wib = new Date(Date.now() + 7 * 3600_000);
  const dayStart = new Date(`${wib.toISOString().slice(0, 10)}T00:00:00+07:00`).toISOString();
  const weekday = ((wib.getUTCDay() + 6) % 7) + 1;
  const [{ count: attempts }, { count: practiced }, { data: stat }, { data: slots }, { data: league }] = await Promise.all([
    supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("member_id", memberId).gte("created_at", dayStart),
    supabase.from("practice_answers").select("id", { count: "exact", head: true }).eq("member_id", memberId).gte("answered_at", dayStart),
    supabase.from("student_stats").select("last_activity_date").eq("member_id", memberId).maybeSingle(),
    classId ? supabase.rpc("schedule_for", { p_school: schoolId, p_class: classId, p_teacher: null }) : Promise.resolve({ data: [] }),
    supabase.rpc("weekly_league", { p_school_id: schoolId, p_class_id: null }),
  ]);
  const today = wib.toISOString().slice(0, 10);
  return {
    attempts: attempts ?? 0, practiced: practiced ?? 0, activeToday: (stat?.last_activity_date as string | null) === today,
    slots: ((slots ?? []) as Slot[]).filter((s) => s.weekday === weekday).sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    me: ((league ?? []) as { rank: number; xp: number; is_me: boolean }[]).find((r) => r.is_me) ?? null,
    players: ((league ?? []) as unknown[]).length,
  };
}

function pickNext(map: MapNode[]) {
  const next = map.find((n) => n.state === "tersedia") ?? null;
  const soon = map.filter((n) => n.state === "dijadwalkan" && n.opensAt).sort((a, b) => String(a.opensAt).localeCompare(String(b.opensAt)))[0] ?? null;
  return { next, soon };
}

export async function StudentHome({ supabase, schoolId, memberId, name, classId, subjects }: { supabase: Supa; schoolId: string; memberId: string; name: string; classId: string | null; subjects: { id: string; name: string; hours: number | null }[] }) {
  const [map, today] = await Promise.all([loadMap(supabase, schoolId, memberId), loadToday(supabase, memberId, classId, schoolId)]);
  const { next, soon } = pickNext(map);
  const base = `/dashboard/sekolah/${schoolId}`;
  const missions = [
    { icon: "🧭", title: "Selesaikan 1 simpul", have: Math.min(today.attempts, 1), goal: 1, href: `${base}/belajar` },
    { icon: "💪", title: "Jawab 10 soal latihan", have: Math.min(today.practiced, 10), goal: 10, href: `${base}/latihan` },
    { icon: "🔥", title: "Jaga beruntunmu", have: today.activeToday ? 1 : 0, goal: 1, href: `${base}/latihan` },
  ];
  const doneAll = missions.every((m) => m.have >= m.goal);
  const bySubject = new Map<string, { total: number; done: number }>();
  for (const n of map) { const c = bySubject.get(n.subjectName) ?? { total: 0, done: 0 }; c.total++; if (n.state === "selesai") c.done++; bySubject.set(n.subjectName, c); }

  return (
    <div className="space-y-6">
      <section aria-label="Lanjut belajar" className="surface relative isolate overflow-hidden p-5">
        <div className="relative z-10 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-pen">Halo, {name}!</p>
            {next ? (
              <>
                <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight">{next.title}</h1>
                <p className="mt-1 text-sm text-ink-soft">{next.subjectName} · {KIND[next.kind] ?? "Materi"}</p>
                <p className="num mt-1 inline-flex gap-2 text-sm font-bold"><span className="rounded-full bg-hi/60 px-2 text-ink">+{next.xpReward} XP</span>{next.minutes ? <span className="text-ink-soft">±{next.minutes} mnt</span> : null}</p>
                <Link href={`${base}/belajar/${next.id}`} className="btn-solid mt-4 flex min-h-12 w-fit items-center whitespace-nowrap rounded-btn px-5 text-lg font-extrabold">Mulai ▶</Link>
              </>
            ) : soon ? (
              <>
                <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight">Berikutnya: {soon.title}</h1>
                <p className="mt-1 text-sm text-ink-soft">Dibuka sehari sebelum pelajaran supaya otakmu sudah &ldquo;panas&rdquo;.</p>
                <p className="num mt-3 inline-flex min-h-11 items-center rounded-btn border-2 border-pen px-4 text-lg font-extrabold text-pen"><Countdown until={soon.opensAt as string} /></p>
              </>
            ) : (
              <>
                <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight">{map.length ? "Semua simpul selesai! 🎉" : "Ayo berlatih!"}</h1>
                <p className="mt-1 text-sm text-ink-soft">Latihan soal mengumpulkan XP dan menguatkan ingatan.</p>
                <Link href={`${base}/latihan`} className="btn-solid mt-4 flex min-h-12 w-fit items-center whitespace-nowrap rounded-btn px-5 text-lg font-extrabold">Latihan soal 💪</Link>
              </>
            )}
          </div>
          <Mascot size={118} className="shrink-0" />
        </div>
      </section>

      <section aria-label="Misi hari ini">
        <div className="flex items-baseline justify-between"><h2 className="font-display text-xl font-extrabold">Misi hari ini</h2>{doneAll ? <span className="text-sm font-bold text-ok">Semua beres! 🎉</span> : null}</div>
        <ul className="mt-2 grid gap-2">
          {missions.map((m) => {
            const done = m.have >= m.goal;
            return (
              <li key={m.title}>
                <Link href={m.href} className="press flex items-center gap-3 rounded-box border-2 bg-card p-3" style={{ borderColor: done ? "var(--ok)" : "var(--line)" }}>
                  <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full text-2xl" style={{ background: "color-mix(in srgb, var(--pen) 12%, transparent)" }}>{done ? "✅" : m.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{m.title}</span>
                    <span className="mt-1 block h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={m.have} aria-valuemin={0} aria-valuemax={m.goal} aria-label={m.title}><span className="block h-full rounded-full bg-pen" style={{ width: `${(m.have / m.goal) * 100}%` }} /></span>
                  </span>
                  <span className="num text-sm font-bold text-ink-soft">{m.have}/{m.goal}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Liga pekan ini">
        <Link href={`${base}/liga`} className="press flex items-center gap-3 rounded-box border-2 border-line bg-card p-4">
          <span aria-hidden="true" className="text-4xl">🏆</span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold uppercase tracking-[0.08em] text-pen">Liga pekan ini</span>
            <span className="block text-lg font-extrabold">{today.me ? `Peringkat ${today.me.rank} dari ${today.players}` : "Belum ada peringkat"}</span>
            <span className="num block text-sm text-ink-soft">{today.me ? `${today.me.xp} XP pekan ini` : "Kumpulkan XP untuk masuk daftar"}</span>
          </span>
          <span aria-hidden="true" className="text-2xl text-pen">→</span>
        </Link>
      </section>

      {subjects.length ? (
        <section aria-label="Mata pelajaran">
          <h2 className="font-display text-xl font-extrabold">Mata pelajaranmu</h2>
          <ul className="mt-2 grid grid-cols-2 gap-3">
            {subjects.map((s, i) => {
              const c = bySubject.get(s.name);
              const tint = TINTS[i % TINTS.length];
              return (
                <li key={s.id}>
                  <Link href={`${base}/belajar`} className="press block h-full rounded-box border-2 p-3" style={{ borderColor: `var(${tint})`, background: `color-mix(in srgb, var(${tint}) 10%, var(--card))` }}>
                    <span aria-hidden="true" className="text-3xl">{iconFor(s.name)}</span>
                    <span className="mt-1 block font-extrabold leading-tight">{s.name}</span>
                    <span className="num mt-1 block text-xs text-ink-soft">{c ? `${c.done}/${c.total} simpul` : "Belum ada simpul"}</span>
                    {c ? <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full" style={{ width: `${(c.done / c.total) * 100}%`, background: `var(${tint})` }} /></span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {today.slots.length ? (
        <section aria-label="Jadwal hari ini">
          <h2 className="font-display text-xl font-extrabold">Pelajaran hari ini</h2>
          <ol className="mt-2 divide-y divide-line rounded-box border-2 border-line bg-card">
            {today.slots.map((s, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="num w-24 shrink-0 text-sm font-bold text-pen">{s.starts_at.slice(0, 5)}–{s.ends_at.slice(0, 5)}</span>
                <span className="min-w-0 flex-1 font-semibold">{s.subject_name}</span>{s.room ? <span className="text-sm text-ink-soft">{s.room}</span> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
