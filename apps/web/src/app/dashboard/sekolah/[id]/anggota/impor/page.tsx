import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, Label, Select, Textarea } from "@/components/ui";
import { getSchoolContext } from "@/lib/school";
import { importInvites } from "../../actions";

export const metadata = { title: "Impor anggota · EduSmart" };

export default async function ImporPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const { supabase } = await getSchoolContext(id, { management: true });
  const { data: roles } = await supabase.from("roles").select("code,name").eq("school_id", id).neq("code", "owner").order("name");
  return (
    <>
      <SchoolNav schoolId={id} active="anggota" />
      <a href={`/dashboard/sekolah/${id}/anggota`} className="text-sm font-semibold text-pen underline">← Anggota</a>
      <h1 className="mt-3 mb-2 font-display text-4xl font-bold tracking-tight">Impor anggota dari CSV</h1>
      <p className="max-w-2xl text-ink-soft">
        Setiap baris menjadi satu kode undangan sekali pakai, dengan nama dan rombel sudah terisi. Bagikan kodenya; anggota mendaftar lalu memasukkan kode di halaman Gabung. Tidak ada data yang dimasukkan sebelum orangnya mendaftar sendiri.
      </p>
      <div className="mt-4"><ErrorNote message={error} /></div>
      <form action={importInvites.bind(null, id)} encType="multipart/form-data" className="mt-4 grid gap-4 rounded-[6px] border border-line bg-card p-5 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-4">
          <label className="block"><Label hint="nama, peran (opsional), kelas (opsional)">Tempel isi CSV</Label>
            <Textarea name="csv" rows={10} className="font-mono text-sm" placeholder={"nama,peran,kelas\nAyu Lestari,siswa,X PPLG 1\nMade Arta,guru,"} /></label>
          <label className="block"><Label hint="atau pilih berkas .csv">Berkas</Label>
            <input type="file" name="file" accept=".csv,text/csv,text/plain" className="block min-h-11 w-full text-base file:mr-3 file:min-h-11 file:rounded-[6px] file:border file:border-line file:bg-card file:px-4 file:font-semibold" /></label>
        </div>
        <div className="space-y-4">
          <label className="block"><Label>Peran bila kolom peran kosong</Label>
            <Select name="default_role" defaultValue="student">{(roles ?? []).map((r) => <option key={r.code as string} value={r.code as string}>{r.name as string}</option>)}</Select></label>
          <label className="block"><Label>Masa berlaku kode (hari)</Label>
            <Select name="days" defaultValue="30"><option value="7">7</option><option value="14">14</option><option value="30">30</option><option value="60">60</option><option value="90">90</option></Select></label>
          <div className="rounded-[6px] border border-line p-3 text-sm text-ink-soft">
            <p className="font-semibold text-ink">Aturan</p>
            <ul className="mt-1 list-disc pl-5">
              <li>Maksimal 300 baris, 200 KB.</li>
              <li>Peran: siswa, guru, wali kelas, orang tua, bk, admin.</li>
              <li>Nama rombel harus sama dengan yang sudah dibuat.</li>
              <li>Satu baris salah membatalkan seluruh impor.</li>
            </ul>
          </div>
          <Button type="submit">Buat kode undangan</Button>
        </div>
      </form>
    </>
  );
}
