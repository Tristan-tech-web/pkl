import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { decide } from "./actions";

export const metadata = { title: "Izinkan akses · EduSmart", robots: { index: false } };
type Q = Record<string, string | undefined>;

export default async function AuthorizePage({ searchParams }: { searchParams: Promise<Q> }) {
  const q = await searchParams;
  const supabase = await createClient();
  const { data: info } = q.client_id ? await supabase.rpc("oauth_client_info", { p_client: q.client_id }) : { data: null };
  const c = info as { client_name: string; redirect_uris: string[] } | null;
  const valid = c && q.redirect_uri && c.redirect_uris.includes(q.redirect_uri) && q.response_type === "code" && q.code_challenge_method === "S256" && /^[A-Za-z0-9_-]{43,128}$/.test(q.code_challenge ?? "");
  if (!valid || !c || !q.redirect_uri) {
    return (
      <main id="isi" className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-display text-3xl font-bold">Permintaan tidak valid</h1>
        <p role="alert" className="mt-3 text-ink-soft">Tautan izin ini tidak lengkap atau tidak dikenal. Mulai lagi dari aplikasi AI Anda.</p>
      </main>
    );
  }
  const host = new URL(q.redirect_uri).host;
  return (
    <main id="isi" className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">Izinkan {c.client_name} mengakses EduSmart?</h1>
      <p className="mt-3 text-ink-soft">Aplikasi ini akan bertindak atas nama Anda dan hanya bisa melakukan yang boleh dilakukan peran Anda di sekolah.</p>
      <ul className="mt-4 list-disc pl-5 text-sm">
        <li>Melihat jadwal, pengumuman, dan peraturan sekolah Anda.</li>
        <li>Melihat berkas yang boleh Anda baca (pengelola dan guru).</li>
      </ul>
      <form action={decide} className="mt-5 space-y-4 surface p-4">
        {(["client_id", "redirect_uri", "state", "code_challenge"] as const).map((k) => <input key={k} type="hidden" name={k} value={q[k] ?? ""} />)}
        <label className="flex min-h-11 items-start gap-2 text-sm"><input type="checkbox" name="can_write" className="mt-1 size-4" /> <span>Izinkan juga <strong>mengunggah berkas</strong> ke Pusat Data (hanya jika peran Anda berhak).</span></label>
        <p className="text-xs text-ink-soft">Setelah disetujui Anda diarahkan ke <span className="font-semibold">{host}</span>. Akses dapat dicabut kapan saja di menu AI saya.</p>
        <div className="flex gap-3">
          <Button type="submit" name="decision" value="approve">Izinkan</Button>
          <Button type="submit" name="decision" value="deny" variant="ghost">Tolak</Button>
        </div>
      </form>
    </main>
  );
}
