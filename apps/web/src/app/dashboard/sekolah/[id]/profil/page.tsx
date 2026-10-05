import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth-actions";
import { AvatarPicker } from "@/components/avatar-picker";
import { SoundToggle } from "@/components/sound-toggle";
import { Mascot } from "@/components/three/mascot";
import { sanitizeAvatar } from "@/lib/avatar";
import { Button } from "@/components/ui";
import { enabledModuleCodes } from "@/lib/modules";
import { getSchoolContext } from "@/lib/school";

export const metadata = { title: "Profil · EduSmart" };

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, me, school, userId } = await getSchoolContext(id);
  if (me.roleCode !== "student") redirect(`/dashboard/sekolah/${id}`);
  const on = await enabledModuleCodes(supabase, id);
  const { data: avRow } = await supabase.from("user_preferences").select("avatar").eq("user_id", userId).maybeSingle();
  const base = `/dashboard/sekolah/${id}`;
  const items: { href: string; icon: string; title: string; hint: string; show: boolean }[] = [
    { href: "/dashboard/tampilan", icon: "🎨", title: "Tampilan", hint: "Pilih tema, ukuran huruf, dan gaya yang kamu suka", show: true },
    { href: `${base}/jadwal`, icon: "🗓️", title: "Jadwal pelajaran", hint: "Pelajaran minggu ini", show: on.has("schedule") },
    { href: `${base}/ujian`, icon: "📝", title: "Ujian", hint: "Jadwal dan aplikasi ujian", show: on.has("exams") },
    { href: `${base}/nilai`, icon: "📊", title: "Nilaiku", hint: "Hasil belajarmu", show: on.has("gradebook") },
    { href: `${base}/absensi`, icon: "✅", title: "Kehadiranku", hint: "Catatan hadir", show: on.has("attendance") },
    { href: `${base}/rapor`, icon: "📄", title: "Rapor", hint: "Laporan semester", show: on.has("gradebook") },
    { href: `${base}/keuangan`, icon: "💳", title: "Tagihanku", hint: "Pembayaran sekolah", show: on.has("fees") },
    { href: `${base}/administrasi`, icon: "🗂️", title: "Data dan suratku", hint: "Data induk dan surat", show: on.has("admin_records") },
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
      <div className="mt-4"><AvatarPicker schoolId={id} initial={sanitizeAvatar(avRow?.avatar)} /></div>
      <div className="mt-4"><SoundToggle /></div>
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
