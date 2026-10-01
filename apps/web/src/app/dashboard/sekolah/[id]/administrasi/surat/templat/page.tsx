import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Textarea } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import { deleteTemplate, saveTemplate } from "../../actions";

export const metadata = { title: "Templat surat · EduSmart" };
const TOKENS = ["{{nama}}", "{{nis}}", "{{kelas}}", "{{sekolah}}", "{{tanggal}}"];

export default async function TemplatPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id, { management: true });
  await requireModule(supabase, id, "admin_records");
  const { data } = await supabase.from("letter_templates").select("id,school_id,title,body").or(`school_id.is.null,school_id.eq.${id}`).order("title");
  const own = (data ?? []).filter((t) => t.school_id);
  const base = (data ?? []).filter((t) => !t.school_id);
  return (
    <>
      <SchoolNav schoolId={id} active="administrasi" />
      <a href={`/dashboard/sekolah/${id}/administrasi/surat`} className="text-sm font-semibold text-pen underline">← Surat dan arsip</a>
      <h1 className="mt-3 mb-2 font-display text-4xl font-bold tracking-tight">Templat surat</h1>
      <p className="max-w-2xl text-ink-soft">Tulis surat sekolah Anda sendiri. Bagian yang diisi otomatis: {TOKENS.map((t) => <code key={t} className="mr-1 rounded-[4px] border border-line bg-card px-1.5 py-0.5 font-mono text-sm">{t}</code>)} Tulis ______ untuk bagian yang diisi tangan.</p>
      <div className="mt-4 space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>

      <form action={saveTemplate.bind(null, id)} className="mt-4 grid gap-3 rounded-[6px] border border-line bg-card p-4">
        <h2 className="font-display text-lg font-bold">Templat baru</h2>
        <label><Label>Judul</Label><Input name="title" required minLength={3} maxLength={120} placeholder="mis. Surat Keterangan Berkelakuan Baik" /></label>
        <label><Label>Isi surat</Label><Textarea name="body" rows={8} required minLength={10} maxLength={4000} /></label>
        <div><Button type="submit">Simpan templat</Button></div>
      </form>

      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Templat sekolah <span className="num text-ink-soft">({own.length})</span></h2>
      {own.length === 0 ? <p className="mt-3 text-ink-soft">Belum ada. Templat bawaan di bawah tetap bisa dipakai.</p> : (
        <ul className="mt-3 border-t border-line">
          {own.map((t) => (
            <li key={t.id as string} className="border-b border-line py-3">
              <details>
                <summary className="cursor-pointer font-semibold">{t.title as string}</summary>
                <form action={saveTemplate.bind(null, id)} className="mt-3 grid gap-3">
                  <input type="hidden" name="id" value={t.id as string} />
                  <label><Label>Judul</Label><Input name="title" defaultValue={t.title as string} required minLength={3} maxLength={120} /></label>
                  <label><Label>Isi surat</Label><Textarea name="body" rows={8} defaultValue={t.body as string} required minLength={10} maxLength={4000} /></label>
                  <div className="flex gap-3"><Button type="submit">Simpan</Button></div>
                </form>
                <form action={deleteTemplate.bind(null, id, t.id as string)} className="mt-2"><button type="submit" className="text-sm font-semibold text-bad underline">Hapus templat</button></form>
              </details>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Templat bawaan</h2>
      <ul className="mt-3 border-t border-line">
        {base.map((t) => (
          <li key={t.id as string} className="border-b border-line py-3">
            <details><summary className="cursor-pointer font-semibold">{t.title as string}</summary><p className="mt-2 whitespace-pre-wrap text-ink-soft">{t.body as string}</p></details>
          </li>
        ))}
      </ul>
    </>
  );
}
