import Link from "next/link";
import { signOut } from "@/app/auth-actions";
import { Mascot } from "@/components/three/mascot";
import { Button } from "@/components/ui";
import { enabledModuleCodes } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

export const metadata = { title: "Profil · EduSmart" };

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, me, school } = await getSchoolContext(id);
  const on = await enabledModuleCodes(supabase, id);
  const base = `/dashboard/sekolah/${id}`;
  const items: { href: string; icon: string; title: string; hint: string; show: boolean }[] = [
    { href: "/dashboard/tampilan", icon: "🎨", title: "Tampilan", hint: "Pilih tema, ukuran huruf, dan gaya yang kamu suka", show: true },
    { href: `${base}/ai`, icon: "🤖", title: "Tutor AI", hint: "Tanya apa saja soal pelajaran", show: on.has("ai_tutor") },
    { href: `${base}/jadwal`, icon: "🗓️", title: "Jadwal pelajaran", hint: "Pelajaran minggu ini", show: on.has("schedule") },
    { href: `${base}/ujian`, icon: "📝", title: "Ujian", hint: "Jadwal dan aplikasi ujian", show: on.has("exams") },
    { href: `${base}/pengumuman`, icon: "📣", title: "Pengumuman", hint: "Kabar dari sekolah dan guru", show: on.has("announcements") },
    { href: `${base}/notifikasi`, icon: "🔔", title: "Notifikasi", hint: "Pemberitahuan untukmu", show: true },
    { href: "/dashboard/ai-saya", icon: "🔑", title: "AI saya", hint: "Hubungkan akun AI pribadimu", show: true },
  ];
  return (
    <div>
      <section className="surface flex items-center gap-4 p-5">
        <Mascot size={96} className="shrink-0" />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold leading-tight">{me.displayName ?? "Siswa"}</h1>
          <p className="text-sm text-ink-soft">{me.roleName} · {school.name}</p>
        </div>
      </section>
      <ul className="mt-4 grid gap-2">
        {items.filter((i) => i.show).map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="press flex items-center gap-3 rounded-box border-2 border-line bg-card p-3">
              <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full text-2xl" style={{ background: "color-mix(in srgb, var(--pen) 12%, transparent)" }}>{i.icon}</span>
              <span className="min-w-0 flex-1"><span className="block font-bold">{i.title}</span><span className="block text-sm text-ink-soft">{i.hint}</span></span>
              <span aria-hidden="true" className="text-xl text-pen">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <form action={signOut} className="mt-6"><Button type="submit" variant="ghost">Keluar</Button></form>
    </div>
  );
}
