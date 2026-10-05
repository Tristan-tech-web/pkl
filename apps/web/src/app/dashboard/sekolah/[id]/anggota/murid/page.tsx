import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label } from "@/components/ui";
import { getSchoolContext } from "@/lib/school";
import { setLoginCode } from "./actions";
import { StudentsForm } from "./students-form";

export const metadata = { title: "Akun murid · EduSmart" };

export default async function MuridPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, school } = await getSchoolContext(id, { management: true });
  const [{ data: classes }, { data: s }] = await Promise.all([
    supabase.from("class_groups").select("id,name").eq("school_id", id).order("name"),
    supabase.from("schools").select("login_code").eq("id", id).single(),
  ]);
  const code = (s?.login_code as string | null) ?? null;
  return (
    <>
      <SchoolNav schoolId={id} active="anggota" />
      <a href={`/dashboard/sekolah/${id}/anggota`} className="no-print text-sm font-semibold text-pen underline">← Anggota</a>
      <h1 className="no-print mt-3 mb-2 font-display text-4xl font-bold tracking-tight">Akun murid tanpa email</h1>
      <p className="no-print max-w-2xl text-ink-soft">Murid masuk dengan ID murid dan kata sandi, tidak perlu email. ID-nya kode sekolah ditambah NIS, misalnya <span className="num font-semibold">{code ?? "kode"}-2610001</span>.</p>
      <div className="no-print mt-4 space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>

      <form action={setLoginCode.bind(null, id)} className="no-print mt-4 flex flex-wrap items-end gap-3 surface p-4">
        <label className="min-w-0 flex-1">
          <Label hint="2–12 huruf kecil atau angka">Kode sekolah untuk ID murid</Label>
          <Input name="login_code" defaultValue={code ?? ""} maxLength={12} autoCapitalize="none" spellCheck={false} placeholder="mis. bgb" required className="num" />
        </label>
        <Button type="submit" variant="ghost">{code ? "Ganti kode" : "Simpan kode"}</Button>
        {code ? <p className="basis-full text-sm text-ink-soft">Mengganti kode tidak mengubah ID murid yang sudah ada. Ubah hanya sebelum membuat akun.</p> : <p className="basis-full text-sm text-ink-soft">Atur kode ini dulu sebelum membuat akun.</p>}
      </form>

      <div className="mt-6">
        <StudentsForm schoolId={id} schoolName={school.name} classes={(classes ?? []) as { id: string; name: string }[]} loginCode={code} />
      </div>
    </>
  );
}
