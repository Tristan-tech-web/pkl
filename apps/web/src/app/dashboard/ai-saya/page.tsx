import { Button, ErrorNote, InfoNote, Input, Label, Select } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { McpConnect } from "@/components/mcp-connect";
import { headers } from "next/headers";
import { removeMyAiKey, revokeMcpToken, saveMyAiKey } from "./actions";

export const metadata = { title: "AI saya · EduSmart" };

export default async function MyAiPage({ searchParams }: { searchParams: Promise<{ error?: string; info?: string }> }) {
  const { error, info } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const endpoint = `${proto}://${host}/api/mcp`;
  const { data: tokens } = await supabase.from("mcp_tokens").select("id,name,token_hint,can_write,created_at,last_used_at,expires_at,revoked_at").eq("user_id", user.id).is("revoked_at", null).order("created_at", { ascending: false });
  const { data: cfg } = await supabase.from("user_ai_keys").select("provider,model,key_hint,updated_at").eq("user_id", user.id).maybeSingle();
  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">AI saya</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">Pakai kunci API milikmu sendiri untuk semua fitur AI di EduSmart: tutor, pemilahan berkas, rencana belajar. Kunci disimpan terenkripsi, tidak pernah ditampilkan lagi, dan hanya dipakai atas namamu.</p>
      </header>
      <div className="space-y-3"><ErrorNote message={error} /><InfoNote message={info} /></div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <form action={saveMyAiKey} className="grid gap-4 rounded-[6px] border border-line bg-card p-5 sm:grid-cols-2">
          <label><Label>Penyedia</Label>
            <Select name="provider" defaultValue={(cfg?.provider as string | undefined) ?? "gemini"}><option value="gemini">Google Gemini</option><option value="anthropic">Anthropic Claude</option></Select></label>
          <label><Label hint="kosong = bawaan">Model</Label><Input name="model" defaultValue={(cfg?.model as string | undefined) ?? ""} placeholder="gemini-2.5-flash-lite" /></label>
          <label className="sm:col-span-2"><Label hint={cfg ? `tersimpan ${cfg.key_hint as string}; kosongkan bila tidak diganti` : undefined}>Kunci API</Label>
            <Input name="api_key" type="password" autoComplete="off" placeholder={cfg ? "••••••••" : "tempel kunci API"} /></label>
          <div className="sm:col-span-2"><Button type="submit">Simpan dan uji</Button></div>
        </form>
        <aside className="space-y-4">
          <div className="rounded-[6px] border border-line p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">Status</p>
            <p className={`text-xl font-bold ${cfg ? "text-ok" : "text-ink-soft"}`}>{cfg ? "Memakai kuncimu" : "Belum ada kunci"}</p>
            {cfg ? <form action={removeMyAiKey} className="mt-3"><Button type="submit" variant="ghost">Hapus kunci</Button></form> : <p className="mt-1 text-sm text-ink-soft">Tanpa kunci, AI memakai kunci sekolah (bila ada).</p>}
          </div>
          <div className="rounded-[6px] border border-line p-4 text-sm text-ink-soft">
            <p className="font-semibold text-ink">Tidak punya kunci API?</p>
            <p className="mt-1">Di fitur AI tersedia tombol <span className="font-semibold text-ink">Salin prompt</span>. Tempel di ChatGPT, Claude, atau Gemini milikmu, lalu tempel jawabannya kembali. Tidak perlu kunci.</p>
          </div>
          <div className="rounded-[6px] border border-line p-4 text-sm text-ink-soft">
            <p className="font-semibold text-ink">Siswa</p>
            <p className="mt-1">Siswa memakai kunci pribadi hanya bila sekolah mengizinkan (menu Tutor AI pengelola).</p>
          </div>
        </aside>
      </div>
      <section className="mt-12" aria-labelledby="mcp-h">
        <h2 id="mcp-h" className="font-display text-2xl font-bold tracking-tight">Sambungkan AI lewat MCP</h2>
        <p className="mt-1 max-w-2xl text-ink-soft">Hubungkan Claude Code, Cowork, atau AI lain yang mendukung MCP ke EduSmart. Guru bisa bertanya “hari ini aku mengajar apa?”, siswa “hari ini ada apa?”, dan pengelola bisa meminta AI memasukkan berkas besar. Akses AI selalu sebatas hak peran Anda.</p>
        <div className="mt-4"><McpConnect endpoint={endpoint} /></div>
        <h3 className="mt-8 font-semibold">Token aktif</h3>
        <ul className="mt-2 divide-y divide-line rounded-[6px] border border-line bg-card">
          {(tokens ?? []).length === 0 ? <li className="p-3 text-sm text-ink-soft">Belum ada token.</li> : null}
          {(tokens ?? []).map((t) => (
            <li key={t.id as string} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <span><span className="font-semibold">{t.name as string}</span> <span className="num text-ink-soft">{t.token_hint as string}</span> · {t.can_write ? "baca + unggah" : "baca saja"} · {t.last_used_at ? `terakhir dipakai ${new Date(t.last_used_at as string).toLocaleDateString("id-ID")}` : "belum dipakai"}</span>
              <form action={revokeMcpToken.bind(null, t.id as string)}><Button type="submit" variant="ghost">Cabut</Button></form>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}