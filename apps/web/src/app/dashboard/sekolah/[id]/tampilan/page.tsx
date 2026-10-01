import { LookPreview } from "@/components/look-preview";
import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { EXPERIENCES, EXPERIENCE_INFO } from "@/lib/appearance";
import { brandTokens } from "@/lib/color";
import { toPolicy } from "@/lib/look";
import { getSchoolContext } from "@/lib/school";
import { THEMES } from "@/lib/themes";
import { savePolicy } from "./actions";

export const metadata = { title: "Tampilan sekolah · EduSmart" };

export default async function SchoolLookPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id, { management: true });
  const { data } = await supabase.from("school_appearance").select("brand_color,student_experience,staff_experience,staff_can_change,allowed_themes,default_theme,allow_3d,allow_sound,student_can_customize").eq("school_id", id).maybeSingle();
  const pol = toPolicy(data as never);
  const allowed = new Set(pol.allowedThemes ?? THEMES.map((t) => t.id));
  const brand = pol.brandColor ? brandTokens(pol.brandColor) : null;
  return (
    <>
      <SchoolNav schoolId={id} active="tampilan" />
      <header className="mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Tampilan sekolah</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">Tentukan rasa aplikasi untuk murid, guru, dan staf. Setiap orang tetap bisa memilih tampilannya sendiri di dalam batas yang Anda izinkan.</p>
      </header>
      <div className="space-y-3"><ErrorNote message={sp.error} /><InfoNote message={sp.info} /></div>
      <form action={savePolicy.bind(null, id)} className="mt-4 grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-box border border-line bg-card p-5">
          <h2 className="font-display text-xl font-bold">Identitas</h2>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="use_brand" defaultChecked={!!pol.brandColor} className="size-4" /> Pakai warna sekolah (tema “Warna Sekolah”)</label>
          <label><Label>Warna sekolah</Label><Input type="color" name="brand_color" defaultValue={pol.brandColor ?? "#1d3fa8"} className="h-12 w-24 p-1" /></label>
          {brand ? <LookPreview theme="warna-sekolah" experience="ringkas" brand={brand} /> : <p className="text-sm text-ink-soft">Warna dipilih lalu centang kotak di atas untuk melihat pratinjau setelah disimpan.</p>}
        </section>
        <section className="space-y-4 rounded-box border border-line bg-card p-5">
          <h2 className="font-display text-xl font-bold">Gaya per kelompok</h2>
          <label><Label>Murid</Label>
            <Select name="student_experience" defaultValue={pol.studentExperience}><option value="auto">Otomatis menurut jenjang (kelas 1–6 Ceria, selebihnya Seru)</option>{EXPERIENCES.map((e) => <option key={e} value={e}>{EXPERIENCE_INFO[e].label}</option>)}</Select></label>
          <label><Label>Guru, kepala sekolah, staf, orang tua</Label>
            <Select name="staff_experience" defaultValue={pol.staffExperience}>{EXPERIENCES.map((e) => <option key={e} value={e}>{EXPERIENCE_INFO[e].label}</option>)}</Select></label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="student_can_customize" defaultChecked={pol.studentCanCustomize} className="size-4" /> Murid boleh mengubah gaya dan tema</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="staff_can_change" defaultChecked={pol.staffCanChange} className="size-4" /> Guru dan staf boleh mengubah gaya dan tema</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="allow_3d" defaultChecked={pol.allow3d} className="size-4" /> Izinkan benda 3D (otomatis mati di perangkat lemah)</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="allow_sound" defaultChecked={pol.allowSound} className="size-4" /> Izinkan suara efek</label>
        </section>
        <section className="space-y-3 rounded-box border border-line bg-card p-5 lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Tema yang boleh dipilih</h2>
          <label className="block max-w-sm"><Label>Tema bawaan (opsional)</Label>
            <Select name="default_theme" defaultValue={pol.defaultTheme ?? ""}><option value="">Menurut gaya</option>{THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</Select></label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {THEMES.map((t) => (
              <label key={t.id} className="cursor-pointer rounded-box has-[:checked]:ring-2 has-[:checked]:ring-pen">
                <input type="checkbox" name="allowed" value={t.id} defaultChecked={allowed.has(t.id)} className="sr-only" />
                <LookPreview theme={t.id} experience="seru" brand={t.id === "warna-sekolah" ? brand : null} />
                <span className="mt-1 block px-1 text-sm font-semibold">{t.label}</span>
              </label>
            ))}
          </div>
          <p className="text-sm text-ink-soft">Kartu bercincin biru = diizinkan. Klik untuk mengaktifkan atau mematikan.</p>
        </section>
        <div className="lg:col-span-2"><Button type="submit">Simpan aturan tampilan</Button></div>
      </form>
    </>
  );
}
