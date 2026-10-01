import { Button, ErrorNote } from "@/components/ui";
import { getSchoolContext } from "@/lib/school";
import { practiceStart } from "./actions";

export const metadata = { title: "Latihan · EduSmart" };

export default async function PracticePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await getSchoolContext(id);
  const [{ data }, { data: pol }] = await Promise.all([supabase.rpc("practice_overview", { p_school: id }), supabase.from("school_integrity").select("enabled,camera_mode,parental_consent_confirmed").eq("school_id", id).maybeSingle()]);
  const camAllowed = pol?.enabled !== false && pol?.camera_mode === "optional" && pol?.parental_consent_confirmed === true;
  const list = (data ?? []) as { subject_id: string; name: string; items: number; due: number }[];
  return (
    <>
      <a href={`/dashboard/sekolah/${id}`} className="text-sm font-semibold text-pen underline">← Beranda</a>
      <h1 className="mt-3 mb-1 font-display text-3xl font-bold tracking-tight">Latihan</h1>
      <p className="text-ink-soft">10 soal tiap sesi. Benar dapat XP; soal yang sudah kamu kuasai muncul lagi beberapa hari kemudian supaya ingatan awet.</p>
      <div className="mt-3"><ErrorNote message={sp.error} /></div>
      {list.length === 0 ? <p className="mt-6 surface p-4">Belum ada soal latihan. Guru akan menyiapkannya sebentar lagi.</p> : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {list.map((s) => (
            <li key={s.subject_id} className="surface p-4">
              <h2 className="font-display text-xl font-bold">{s.name}</h2>
              <p className="num mt-1 text-sm text-ink-soft">{s.items} soal{s.due > 0 ? ` · ${s.due} siap diulang` : ""}</p>
              <form action={practiceStart.bind(null, id, s.subject_id)} className="mt-3">
                {camAllowed ? <label className="mb-2 flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="camera" className="size-4" /> Pakai kamera (opsional, gambar tidak dikirim)</label> : null}
                <Button type="submit">Mulai latihan</Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
