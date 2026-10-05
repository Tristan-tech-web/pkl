import Link from "next/link";
import { redirect } from "next/navigation";
import { AppearanceApply } from "@/components/appearance-apply";
import { LookPicker } from "@/components/look-picker";
import { InfoNote } from "@/components/ui";
import { usableThemes } from "@/lib/appearance";
import { brandTokens } from "@/lib/color";
import { themeById } from "@/lib/themes";
import { lookFor } from "@/lib/look";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/user";
import { resetPrefs, savePrefs } from "./actions";

export const metadata = { title: "Tampilan · EduSmart" };

export default async function LookPage({ searchParams }: { searchParams: Promise<{ info?: string; sekolah?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const user = await getAuthUser(supabase);
  if (!user) redirect("/masuk");
  const { data: schools } = await supabase.from("school_members").select("school_id,schools(name)").eq("user_id", user.id).eq("status", "active");
  const list = (schools ?? []).map((s) => ({ id: s.school_id as string, name: ((Array.isArray(s.schools) ? s.schools[0] : s.schools) as { name: string } | null)?.name ?? "Sekolah" }));
  const schoolId = list.find((s) => s.id === sp.sekolah)?.id ?? list[0]?.id ?? null;
  const ctx = await lookFor(supabase, user.id, schoolId);
  const canPick = ctx.group === "student" ? ctx.policy.studentCanCustomize : ctx.policy.staffCanChange;
  return (
    <>
      <AppearanceApply look={ctx.look} />
      <header className="mb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">Tampilan</h1>
        <p className="mt-1 max-w-2xl text-ink-soft">Pilih gaya, warna, dan kenyamanan layar sesukamu. Berlaku di semua perangkat yang kamu pakai untuk masuk.</p>
        {list.length > 1 ? (
          <p className="mt-2 text-sm">Aturan sekolah: {list.map((s) => <Link key={s.id} href={`/dashboard/tampilan?sekolah=${s.id}`} className={`mr-3 underline ${s.id === schoolId ? "font-bold" : ""}`}>{s.name}</Link>)}</p>
        ) : null}
      </header>
      <div className="mb-4"><InfoNote message={sp.info} /></div>
      <LookPicker
        action={savePrefs} resetAction={resetPrefs} initial={ctx.prefs} effective={{ theme: ctx.look.theme, experience: ctx.look.experience }}
        usableThemes={usableThemes(ctx.policy)} canPick={canPick} allow3d={ctx.policy.allow3d} allowSound={ctx.policy.allowSound} brand={ctx.policy.brandColor ? brandTokens(ctx.policy.brandColor, themeById("warna-sekolah").tokens.paper, themeById("warna-sekolah").tokens.card) : null} schoolId={schoolId}
      />
    </>
  );
}
