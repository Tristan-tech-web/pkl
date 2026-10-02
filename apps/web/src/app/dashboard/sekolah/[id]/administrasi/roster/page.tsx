import Link from "next/link";
import { Empty } from "@/components/empty";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Select } from "@/components/ui";
import { requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import { createRosterInvite, deleteRoster } from "../actions";

export const metadata = { title: "Roster · EduSmart" };
const KIND: Record<string, string> = { siswa: "Siswa", guru: "Guru", staf: "Staf", orang_tua: "Orang tua" };

export default async function RosterPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ jenis?: string; kelas?: string; status?: string; q?: string; error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id, { management: true });
  await requireModule(supabase, id, "data_hub");
  let query = supabase.from("roster_people").select("id,kind,full_name,nis,nisn,nip,class_name,gender,phone,guardian_name,member_id,created_at").eq("school_id", id).order("class_name").order("full_name").limit(500);
  if (sp.jenis && KIND[sp.jenis]) query = query.eq("kind", sp.jenis);
  if (sp.kelas) query = query.eq("class_name", sp.kelas);
  if (sp.status === "bergabung") query = query.not("member_id", "is", null);
  if (sp.status === "belum") query = query.is("member_id", null);
  const term = (sp.q ?? "").trim().replace(/[%,()]/g, " ").slice(0, 60);
  if (term) query = query.or(`full_name.ilike.%${term}%,nis.ilike.%${term}%,nisn.ilike.%${term}%`);
  const [{ data }, { data: all }, { data: inv }] = await Promise.all([
    query,
    supabase.from("roster_people").select("kind,class_name,member_id").eq("school_id", id),
    supabase.from("invites").select("roster_id,code,used_count,max_uses").eq("school_id", id).not("roster_id", "is", null),
  ]);
  const rows = data ?? [];
  const joined = (all ?? []).filter((r) => r.member_id).length;
  const classes = [...new Set((all ?? []).map((r) => r.class_name as string | null).filter(Boolean) as string[])].sort();
  const codeOf = new Map((inv ?? []).filter((i) => (i.used_count as number) < (i.max_uses as number)).map((i) => [i.roster_id as string, i.code as string]));
  return (
    <>
      <SchoolNav schoolId={id} active="administrasi" />
      <a href={`/dashboard/sekolah/${id}/administrasi`} className="text-sm font-semibold text-pen underline">← Data induk</a>
      <header className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Roster</h1>
          <p className="mt-1 max-w-2xl text-ink-soft">Semua siswa dan guru yang didaftarkan sekolah, termasuk yang belum punya akun. Data induk tersambung otomatis saat mereka bergabung dengan kodenya.</p>
        </div>
        <Link href={`/dashboard/sekolah/${id}/berkas`} className="press inline-flex min-h-11 items-center rounded-box bg-pen px-5 font-semibold text-on-pen hover:bg-pen-strong">Unggah berkas</Link>
      </header>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      <section aria-label="Ringkasan" className="stagger mt-4 grid grid-cols-3 gap-6">
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-3xl font-bold">{(all ?? []).length}</p><p className="text-sm font-semibold">Terdaftar</p></div>
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-3xl font-bold text-ok">{joined}</p><p className="text-sm font-semibold">Sudah bergabung</p></div>
        <div className="border-t-2 border-ink pt-3"><p className="num font-display text-3xl font-bold">{(all ?? []).length - joined}</p><p className="text-sm font-semibold">Belum bergabung</p></div>
      </section>
      <form method="get" className="mt-6 flex flex-wrap items-end gap-2">
        <Select name="jenis" defaultValue={sp.jenis ?? ""} aria-label="Jenis"><option value="">Semua jenis</option>{Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
        <Select name="kelas" defaultValue={sp.kelas ?? ""} aria-label="Rombel"><option value="">Semua rombel</option>{classes.map((c) => <option key={c} value={c}>{c}</option>)}</Select>
        <Select name="status" defaultValue={sp.status ?? ""} aria-label="Status"><option value="">Semua status</option><option value="belum">Belum bergabung</option><option value="bergabung">Sudah bergabung</option></Select>
        <Input name="q" defaultValue={term} placeholder="Cari nama, NIS, NISN" aria-label="Cari" className="w-52" />
        <Button type="submit" variant="ghost">Saring</Button>
      </form>
      {rows.length === 0 ? <Empty className="mt-4">Roster kosong. Unggah berkas daftar siswa atau guru di menu Berkas.</Empty> : (
        <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Daftar roster">
          <table className="w-full min-w-[44rem] text-left">
            <thead><tr className="border-b-2 border-ink text-sm"><th className="py-2 pr-3">Nama</th><th className="pr-3">Jenis</th><th className="pr-3">Rombel</th><th className="pr-3">NIS / NISN / NIP</th><th className="pr-3">Status</th><th><span className="sr-only">Aksi</span></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id as string} className="border-b border-line align-top">
                  <td className="py-2 pr-3 font-semibold">{r.full_name as string}</td>
                  <td className="pr-3">{KIND[r.kind as string]}</td>
                  <td className="pr-3">{(r.class_name as string | null) ?? "–"}</td>
                  <td className="num pr-3 text-sm">{[r.nis, r.nisn, r.nip].filter(Boolean).join(" / ") || "–"}</td>
                  <td className="pr-3 text-sm">{r.member_id ? <span className="font-semibold text-ok">Bergabung</span> : codeOf.get(r.id as string) ? <span>Kode <span className="num font-bold tracking-wider">{codeOf.get(r.id as string)}</span></span> : <span className="text-ink-soft">Belum ada kode</span>}</td>
                  <td className="whitespace-nowrap text-right text-sm">
                    {!r.member_id && !codeOf.get(r.id as string) ? <form action={createRosterInvite.bind(null, id, r.id as string)} className="inline"><button type="submit" className="mr-3 inline-flex min-h-11 items-center font-semibold text-pen underline">Buat kode</button></form> : null}
                    <form action={deleteRoster.bind(null, id, r.id as string)} className="inline"><button type="submit" className="inline-flex min-h-11 items-center font-semibold text-bad underline">Hapus</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
