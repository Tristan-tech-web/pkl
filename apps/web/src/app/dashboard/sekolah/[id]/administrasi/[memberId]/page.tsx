import { notFound } from "next/navigation";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select, Textarea } from "@/components/ui";
import { enabledModuleCodes, requireModule } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";
import { linkGuardian, saveProfile, unlinkGuardian } from "../actions";

export const metadata = { title: "Data induk · EduSmart" };

export default async function EditProfile({ params, searchParams }: { params: Promise<{ id: string; memberId: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id, memberId } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id, { management: true });
  await requireModule(supabase, id, "admin_records");
  const [{ data: m }, { data: p }] = await Promise.all([
    supabase.from("school_members").select("display_name,roles(code,name)").eq("id", memberId).eq("school_id", id).maybeSingle(),
    supabase.from("member_profiles").select("*").eq("member_id", memberId).maybeSingle(),
  ]);
  if (!m) notFound();
  const mods = await enabledModuleCodes(supabase, id);
  const isStudent = ((Array.isArray(m.roles) ? m.roles[0] : m.roles) as { code?: string } | null)?.code === "student";
  const showGuardians = isStudent && mods.has("parent_portal");
  const [links, parents] = showGuardians
    ? await Promise.all([
        supabase.from("guardianships").select("parent_member_id,relation").eq("student_member_id", memberId),
        supabase.from("school_members").select("id,display_name,roles!inner(code)").eq("school_id", id).eq("roles.code", "parent").order("display_name"),
      ])
    : [null, null];
  const parentName = new Map(((parents?.data ?? []) as unknown as { id: string; display_name: string | null }[]).map((x) => [x.id, x.display_name]));
  const v = (k: string) => ((p?.[k] as string | null | undefined) ?? "");
  return (
    <>
      <SchoolNav schoolId={id} active="administrasi" />
      <a href={`/dashboard/sekolah/${id}/administrasi`} className="text-sm font-semibold text-pen underline">← Semua anggota</a>
      <h1 className="mt-3 mb-6 font-display text-3xl font-bold tracking-tight">{m.display_name as string}</h1>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      <form action={saveProfile.bind(null, id, memberId)} className="mt-4 grid gap-4 surface p-5 sm:grid-cols-2">
        <label><Label>NIS</Label><Input name="nis" defaultValue={v("nis")} maxLength={30} /></label>
        <label><Label hint="10 digit">NISN</Label><Input name="nisn" defaultValue={v("nisn")} inputMode="numeric" maxLength={10} /></label>
        <label><Label hint="guru/staf">NIP</Label><Input name="nip" defaultValue={v("nip")} maxLength={30} /></label>
        <label><Label>Jenis kelamin</Label><Select name="gender" defaultValue={v("gender")}><option value="">–</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></Select></label>
        <label><Label>Tempat lahir</Label><Input name="birth_place" defaultValue={v("birth_place")} maxLength={80} /></label>
        <label><Label>Tanggal lahir</Label><Input name="birth_date" type="date" defaultValue={v("birth_date")} /></label>
        <label className="sm:col-span-2"><Label>Alamat</Label><Textarea name="address" rows={2} defaultValue={v("address")} maxLength={300} /></label>
        <label><Label>Telepon</Label><Input name="phone" defaultValue={v("phone")} maxLength={30} inputMode="tel" /></label>
        <span />
        <label><Label>Nama orang tua/wali</Label><Input name="guardian_name" defaultValue={v("guardian_name")} maxLength={100} /></label>
        <label><Label>Telepon wali</Label><Input name="guardian_phone" defaultValue={v("guardian_phone")} maxLength={30} inputMode="tel" /></label>
        <div className="sm:col-span-2"><Button type="submit">Simpan</Button></div>
      </form>
      {showGuardians ? (
        <section className="mt-8">
          <h2 className="font-display text-2xl font-bold tracking-tight">Orang tua/wali terhubung</h2>
          <ul className="mt-3 border-t border-line">
            {((links?.data ?? []) as unknown as { parent_member_id: string; relation: string }[]).map((l) => (
              <li key={l.parent_member_id} className="flex items-center justify-between gap-3 border-b border-line py-2.5">
                <span className="font-semibold">{parentName.get(l.parent_member_id) ?? "Orang tua"} <span className="font-normal text-ink-soft">· {l.relation}</span></span>
                <form action={unlinkGuardian.bind(null, id, memberId, l.parent_member_id)}><button type="submit" className="text-sm font-semibold text-bad underline">Lepas</button></form>
              </li>
            ))}
          </ul>
          <form action={linkGuardian.bind(null, id, memberId)} className="mt-3 grid gap-3 surface p-4 sm:grid-cols-[1fr_8rem_auto]">
            <label><Label>Akun orang tua</Label><Select name="parent_id" required>{((parents?.data ?? []) as unknown as { id: string; display_name: string | null }[]).map((p) => <option key={p.id} value={p.id}>{p.display_name}</option>)}</Select></label>
            <label><Label>Hubungan</Label><Select name="relation" defaultValue="wali"><option value="ayah">Ayah</option><option value="ibu">Ibu</option><option value="wali">Wali</option></Select></label>
            <div className="flex items-end"><Button type="submit">Hubungkan</Button></div>
          </form>
          <p className="mt-2 text-sm text-ink-soft">Orang tua mendaftar lewat kode undangan berperan Orang tua, lalu dihubungkan di sini.</p>
        </section>
      ) : null}
    </>
  );
}
