import Link from "next/link";
import { enabledModuleCodes } from "@/lib/modules";
import type { createClient } from "@/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;
type Slot = { weekday: number; starts_at: string; ends_at: string; room: string | null; subject_name: string; class_name: string; class_group_id: string };
type Tile = { slug: string; icon: string; title: string; hint: string; module?: string };

const TEACHER_TILES: Tile[] = [
  { slug: "absensi", icon: "📋", title: "Absensi", hint: "Catat kehadiran", module: "attendance" },
  { slug: "nilai", icon: "📝", title: "Nilai", hint: "Isi dan lihat nilai", module: "gradebook" },
  { slug: "rencana", icon: "🌳", title: "Skill tree", hint: "Susun jalur belajar semester", module: "data_hub" },
  { slug: "bank", icon: "🧠", title: "Bank soal", hint: "Soal dari buku, dibuat AI", module: "learning" },
  { slug: "pantau", icon: "👀", title: "Pantau murid", hint: "Siapa yang tertinggal", module: "learning" },
  { slug: "ujian", icon: "🧪", title: "Ujian", hint: "Jadwal dan pengawasan", module: "exams" },
];
const OWNER_TILES: Tile[] = [
  { slug: "anggota", icon: "👥", title: "Anggota", hint: "Guru, siswa, staf, orang tua" },
  { slug: "rombel", icon: "🏫", title: "Rombel", hint: "Kelas dan wali kelas" },
  { slug: "berkas", icon: "📁", title: "Berkas dan impor", hint: "Unggah data, AI memilah", module: "data_hub" },
  { slug: "tampilan", icon: "🎨", title: "Tampilan sekolah", hint: "Warna dan gaya" },
  { slug: "keuangan", icon: "💰", title: "Keuangan", hint: "Tagihan dan pembayaran", module: "fees" },
  { slug: "rapor", icon: "📄", title: "Rapor", hint: "Template dan cetak", module: "gradebook" },
  { slug: "integritas", icon: "🛡️", title: "Integritas latihan", hint: "Kebijakan dan kasus", module: "learning" },
  { slug: "paket", icon: "🧩", title: "Paket dan modul", hint: "Fitur yang aktif" },
];
const DAYS = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// "Hari ini" dihitung di fungsi biasa agar render komponen tetap murni.
async function loadToday(supabase: Supa, schoolId: string, memberId: string, teacher: boolean) {
  const wib = new Date(Date.now() + 7 * 3600_000);
  const hour = wib.getUTCHours();
  const weekday = ((wib.getUTCDay() + 6) % 7) + 1;
  await supabase.rpc("integrity_expire_held", { p_school: schoolId });
  const [{ data: slots }, { count: cases }, { count: review }, { count: drafts }] = await Promise.all([
    teacher ? supabase.rpc("schedule_for", { p_school: schoolId, p_class: null, p_teacher: memberId }) : Promise.resolve({ data: [] }),
    supabase.from("integrity_cases").select("id", { count: "exact", head: true }).eq("school_id", schoolId).in("status", ["ditahan", "dibatalkan", "banding"]),
    supabase.from("bank_items").select("id", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "ditinjau"),
    supabase.from("bank_items").select("id", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "draf"),
  ]);
  return {
    greeting: hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam",
    date: `${DAYS[weekday]}, ${wib.getUTCDate()} ${MONTHS[wib.getUTCMonth()]} ${wib.getUTCFullYear()}`,
    slots: ((slots ?? []) as Slot[]).filter((s) => s.weekday === weekday).sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    cases: cases ?? 0, review: review ?? 0, drafts: drafts ?? 0,
  };
}

export async function StaffHome({ supabase, schoolId, memberId, name, kind }: { supabase: Supa; schoolId: string; memberId: string; name: string; kind: "teacher" | "owner" }) {
  const [on, today] = await Promise.all([enabledModuleCodes(supabase, schoolId), loadToday(supabase, schoolId, memberId, kind === "teacher")]);
  const base = `/dashboard/sekolah/${schoolId}`;
  const tiles = (kind === "teacher" ? TEACHER_TILES : OWNER_TILES).filter((t) => !t.module || on.has(t.module));
  const attention = [
    { n: today.cases, text: "kasus integritas menunggu keputusan", href: `${base}/integritas`, show: on.has("learning") },
    { n: today.review, text: "soal perlu ditinjau", href: `${base}/bank?s=ditinjau`, show: on.has("learning") },
    { n: today.drafts, text: "soal draf siap disetujui", href: `${base}/bank?s=draf`, show: on.has("learning") },
  ].filter((a) => a.show && a.n > 0);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-ink-soft">{today.date}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">{today.greeting}, {name}</h1>
      </header>

      {attention.length ? (
        <section aria-label="Perlu perhatian" className="rounded-box border-2 border-warn bg-warn-bg p-4">
          <h2 className="font-display text-lg font-bold">Perlu perhatian Anda</h2>
          <ul className="mt-1 space-y-1">
            {attention.map((a) => (
              <li key={a.href}><Link href={a.href} className="flex min-h-11 items-center gap-2 font-semibold underline"><span className="num grid size-8 place-items-center rounded-full bg-warn text-white">{a.n}</span>{a.text} →</Link></li>
            ))}
          </ul>
        </section>
      ) : null}

      {kind === "teacher" ? (
        <section aria-label="Pelajaran hari ini">
          <h2 className="font-display text-xl font-bold">Pelajaran hari ini</h2>
          {today.slots.length === 0 ? <p className="mt-2 rounded-box border border-dashed border-line p-4 text-ink-soft">Tidak ada jam mengajar hari ini.</p> : (
            <ol className="mt-2 divide-y divide-line rounded-box border-2 border-line bg-card">
              {today.slots.map((s, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                  <span className="num w-28 shrink-0 whitespace-nowrap font-bold text-pen">{s.starts_at.slice(0, 5)}–{s.ends_at.slice(0, 5)}</span>
                  <span className="min-w-40 flex-1"><span className="font-semibold">{s.subject_name}</span> <span className="text-ink-soft">· {s.class_name}{s.room ? ` · ${s.room}` : ""}</span></span>
                  {on.has("attendance") ? <Link href={`${base}/absensi?class=${s.class_group_id}`} className="btn-ghost inline-flex min-h-11 items-center rounded-btn px-4 font-bold">Absen</Link> : null}
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}

      <section aria-label="Tugas utama">
        <h2 className="font-display text-xl font-bold">{kind === "teacher" ? "Tugas utama" : "Kelola sekolah"}</h2>
        <ul className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {tiles.map((t) => (
            <li key={t.slug}>
              <Link href={`${base}/${t.slug}`} className="press flex h-full min-h-28 flex-col justify-between rounded-box border-2 border-line bg-card p-3 hover:border-pen">
                <span aria-hidden="true" className="text-3xl">{t.icon}</span>
                <span><span className="block text-lg font-bold leading-tight">{t.title}</span><span className="block text-sm text-ink-soft">{t.hint}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
