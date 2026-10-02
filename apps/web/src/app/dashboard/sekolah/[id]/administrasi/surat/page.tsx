import Link from "next/link";
import { Empty } from "@/components/empty";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Label, Select } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import { issueLetter } from "../actions";

export const metadata = { title: "Surat · EduSmart" };

export default async function SuratPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id, { management: true });
  await requireModule(supabase, id, "admin_records");
  const [tpl, students, letters] = await Promise.all([
    supabase.from("letter_templates").select("id,title").or(`school_id.is.null,school_id.eq.${id}`).order("title"),
    supabase.from("school_members").select("id,display_name,roles!inner(code)").eq("school_id", id).eq("roles.code", "student").order("display_name"),
    supabase.from("letters").select("id,number,title,issued_on,school_members(display_name)").eq("school_id", id).order("created_at", { ascending: false }).limit(100),
  ]);
  return (
    <>
      <SchoolNav schoolId={id} active="administrasi" />
      <a href={`/dashboard/sekolah/${id}/administrasi`} className="text-sm font-semibold text-pen underline">← Data induk</a>
      <h1 className="mt-3 mb-6 font-display text-4xl font-bold tracking-tight">Surat dan arsip</h1>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      <form action={issueLetter.bind(null, id)} className="mt-4 grid gap-3 surface p-4 sm:grid-cols-[1fr_1fr_auto]">
        <label><Label>Jenis surat</Label><Select name="template_id" required>{(tpl.data ?? []).map((t) => <option key={t.id as string} value={t.id as string}>{t.title as string}</option>)}</Select></label>
        <label><Label>Siswa</Label><Select name="member_id" required>{(students.data ?? []).map((s) => <option key={s.id as string} value={s.id as string}>{s.display_name as string}</option>)}</Select></label>
        <div className="flex items-end"><Button type="submit">Terbitkan</Button></div>
      </form>
      <p className="mt-3"><a href={`/dashboard/sekolah/${id}/administrasi/surat/templat`} className="inline-flex min-h-11 items-center text-sm font-semibold text-pen underline">Kelola templat surat sekolah</a></p>
      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Arsip</h2>
      {(letters.data ?? []).length === 0 ? <Empty className="mt-3">Belum ada surat diterbitkan.</Empty> : (
        <ul className="stagger mt-3 border-t border-line">
          {(letters.data ?? []).map((l) => {
            const sm = l.school_members as { display_name: string | null } | { display_name: string | null }[] | null;
            return (
              <li key={l.id as string} className="border-b border-line">
                <Link href={`/dashboard/sekolah/${id}/administrasi/surat/${l.id}`} className="flex flex-wrap items-baseline justify-between gap-3 py-3 hover:text-pen">
                  <span><span className="font-semibold">{l.title as string}</span> <span className="text-sm text-ink-soft">· {(Array.isArray(sm) ? sm[0] : sm)?.display_name}</span></span>
                  <span className="num text-sm text-ink-soft">{l.number as string} · {l.issued_on as string}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
