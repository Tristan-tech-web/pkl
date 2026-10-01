import Link from "next/link";
import { BackLink } from "@/components/role-views";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select, Textarea } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext, MANAGEMENT_ROLES } from "@/lib/school";
import { createExam } from "./actions";

export const metadata = { title: "Ujian · EduSmart" };
const STATUS: Record<string, string> = { draf: "Draf", terbit: "Terbit", ditutup: "Ditutup" };
const wibFmt = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });

export default async function ExamsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, me } = await getSchoolContext(id);
  await requireModule(supabase, id, "exams");
  const management = MANAGEMENT_ROLES.has(me.roleCode);
  const author = management || ["teacher", "homeroom"].includes(me.roleCode);
  const [{ data: exams }, { data: classes }, { data: subjects }, { data: mine }] = await Promise.all([
    supabase.from("exams").select("id,title,status,starts_at,ends_at,duration_minutes,secure_required,class_groups(name),school_subjects(name)").eq("school_id", id).order("starts_at", { ascending: false }).limit(60),
    author ? supabase.from("class_groups").select("id,name").eq("school_id", id).order("name") : Promise.resolve({ data: [] }),
    author ? supabase.from("school_subjects").select("id,name").eq("school_id", id).order("name") : Promise.resolve({ data: [] }),
    supabase.from("exam_sessions").select("exam_id,status,score").eq("school_id", id).eq("member_id", me.memberId),
  ]);
  const sess = new Map((mine ?? []).map((s) => [s.exam_id as string, s]));
  const nm = (v: unknown) => (Array.isArray(v) ? v[0]?.name : (v as { name?: string } | null)?.name) ?? "";
  return (
    <>
      {management ? <SchoolNav schoolId={id} active="ujian" /> : <BackLink />}
      <header className="mt-3 mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Ujian</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">{author ? "Buat ujian, tambahkan soal, terbitkan, lalu pantau siswa. Siswa mengerjakan di aplikasi ujian yang mengunci perangkat." : "Ujian untuk kelasmu. Tekan Mulai pada waktunya; ujian dikerjakan di aplikasi ujian."}</p>
      </header>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      <ul className="mt-4 divide-y divide-line rounded-[6px] border border-line bg-card">
        {(exams ?? []).length === 0 ? <li className="p-4 text-ink-soft">Belum ada ujian.</li> : null}
        {(exams ?? []).map((e) => {
          const s = sess.get(e.id as string);
          const now = new Date(); // dirender di server per permintaan
          const open = e.status === "terbit" && now >= new Date(e.starts_at as string) && now <= new Date(e.ends_at as string);
          return (
            <li key={e.id as string} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{author ? <Link href={`/dashboard/sekolah/${id}/ujian/${e.id}`} className="text-pen underline">{e.title as string}</Link> : (e.title as string)}</p>
                <p className="text-sm text-ink-soft">{nm(e.school_subjects)} · {nm(e.class_groups)} · {wibFmt.format(new Date(e.starts_at as string))} WIB · {e.duration_minutes as number} menit · {e.secure_required ? "aplikasi terkunci" : "boleh di peramban"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-line px-3 py-1 text-sm">{author ? STATUS[e.status as string] : s?.status === "selesai" ? "Sudah dikumpulkan" : open ? "Sedang dibuka" : now < new Date(e.starts_at as string) ? "Belum dibuka" : "Ditutup"}</span>
                {!author && open && s?.status !== "selesai" ? <Link prefetch={false} href={`/dashboard/sekolah/${id}/ujian/${e.id}/mulai`} className="press inline-flex min-h-11 items-center rounded-[6px] bg-pen px-4 font-semibold text-on-pen">{s ? "Lanjutkan" : "Mulai ujian"}</Link> : null}
              </div>
            </li>
          );
        })}
      </ul>
      {author ? (
        <details className="mt-8 rounded-[6px] border border-line bg-card p-4">
          <summary className="cursor-pointer font-display text-xl font-bold">Buat ujian baru</summary>
          <form action={createExam.bind(null, id)} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label><Label>Rombel</Label><Select name="class_group_id" required>{(classes ?? []).map((c) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}</Select></label>
            <label><Label>Mata pelajaran</Label><Select name="school_subject_id" required>{(subjects ?? []).map((c) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}</Select></label>
            <label className="sm:col-span-2"><Label>Judul</Label><Input name="title" required minLength={3} maxLength={140} placeholder="mis. UTS Matematika Ganjil" /></label>
            <label><Label hint="WIB">Dibuka</Label><Input name="starts_at" type="datetime-local" required /></label>
            <label><Label hint="WIB">Ditutup</Label><Input name="ends_at" type="datetime-local" required /></label>
            <label><Label>Durasi (menit)</Label><Input name="duration" type="number" min={5} max={360} defaultValue={60} /></label>
            <label><Label>Bila melanggar</Label><Select name="on_violation" defaultValue="bekukan"><option value="bekukan">Bekukan ujian (pengawas melanjutkan)</option><option value="catat">Catat saja</option></Select></label>
            <label><Label hint="pelanggaran sebelum dibekukan">Batas pelanggaran</Label><Input name="max_violations" type="number" min={1} max={20} defaultValue={3} /></label>
            <label className="flex min-h-11 items-center gap-2 self-end"><input type="checkbox" name="secure_required" defaultChecked className="size-4" /> Wajib aplikasi ujian terkunci</label>
            <label className="sm:col-span-2"><Label hint="boleh kosong">Petunjuk untuk siswa</Label><Textarea name="instructions" rows={3} maxLength={2000} /></label>
            <div className="sm:col-span-2"><Button type="submit">Buat ujian</Button></div>
          </form>
        </details>
      ) : null}
    </>
  );
}
