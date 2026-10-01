import { SchoolNav } from "@/components/school-nav";
import { Button, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { getSchoolContext } from "@/lib/school";
import { removeAiSettings, saveAiSettings } from "./actions";

export const metadata = { title: "Tutor AI · EduSmart" };

export default async function AiPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; info?: string }> }) {
  const { id } = await params;
  const { error, info } = await searchParams;
  const { supabase } = await getSchoolContext(id, { management: true });
  const [{ data: cfg }, { count: used }] = await Promise.all([
    supabase.from("school_ai_settings").select("provider,model,key_hint,daily_limit_per_student,updated_at").eq("school_id", id).maybeSingle(),
    supabase.from("ai_usage").select("id", { count: "exact", head: true }).eq("school_id", id),
  ]);
  return (
    <>
      <SchoolNav schoolId={id} active="ai" />
      <header className="mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Tutor AI</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Sekolah memakai kunci API milik sendiri, jadi biaya dan data ada di akun sekolah. Kunci disimpan terenkripsi dan tidak pernah ditampilkan lagi.
        </p>
      </header>
      <div className="space-y-3"><ErrorNote message={error} /><InfoNote message={info} /></div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <form action={saveAiSettings.bind(null, id)} className="grid gap-4 rounded-[6px] border border-line bg-card p-5 sm:grid-cols-2">
          <label><Label>Penyedia</Label>
            <Select name="provider" defaultValue={(cfg?.provider as string | undefined) ?? "gemini"}>
              <option value="gemini">Google Gemini</option><option value="anthropic">Anthropic Claude</option>
            </Select></label>
          <label><Label hint="kosong = bawaan">Model</Label><Input name="model" defaultValue={(cfg?.model as string | undefined) ?? ""} placeholder="gemini-2.5-flash-lite" /></label>
          <label className="sm:col-span-2"><Label hint={cfg ? `tersimpan ${cfg.key_hint as string}; kosongkan bila tidak diganti` : undefined}>Kunci API</Label>
            <Input name="api_key" type="password" autoComplete="off" placeholder={cfg ? "••••••••" : "tempel kunci API"} /></label>
          <label><Label>Jatah pertanyaan per siswa per hari</Label>
            <Input name="daily_limit" type="number" min={1} max={200} defaultValue={(cfg?.daily_limit_per_student as number | undefined) ?? 20} /></label>
          <div className="flex items-end"><Button type="submit">Simpan dan uji</Button></div>
        </form>
        <aside className="space-y-4">
          <div className="rounded-[6px] border border-line p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Status</p>
            <p className={`text-xl font-bold ${cfg ? "text-ok" : "text-bad"}`}>{cfg ? "Aktif" : "Belum aktif"}</p>
            <p className="num mt-1 text-sm text-ink-soft">{used ?? 0} pertanyaan tercatat sejak awal</p>
            {cfg ? (
              <form action={removeAiSettings.bind(null, id)} className="mt-3"><Button type="submit" variant="ghost">Hapus kunci</Button></form>
            ) : null}
          </div>
          <div className="rounded-[6px] border border-line p-4 text-sm text-ink-soft">
            <p className="font-semibold text-ink">Yang dikirim ke penyedia</p>
            <ul className="mt-1 list-disc pl-5">
              <li>Teks materi yang sedang dibuka dan pertanyaan siswa.</li>
              <li>Tidak ada nama, kelas, nilai, atau kunci jawaban kuis.</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
