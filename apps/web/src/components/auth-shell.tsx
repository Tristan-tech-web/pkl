import { FloatField } from "@/components/three/float-field";
import { Mascot } from "@/components/three/mascot";

// Kerangka halaman masuk/daftar: maskot dan sapaan di samping, formulir besar di tengah. Ramah anak tanpa mengorbankan keterbacaan.
export function AuthShell({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <main className="relative isolate flex flex-1 items-center overflow-hidden">
      <FloatField className="opacity-35" />
      <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-6 px-4 py-10 lg:grid-cols-[1fr_28rem]">
        <div className="text-center lg:text-left">
          <Mascot size={150} className="mx-auto lg:mx-0" />
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight lg:text-5xl">{title}</h1>
          <p className="mx-auto mt-2 max-w-md text-lg text-ink-soft lg:mx-0">{lead}</p>
          <ul className="mt-4 hidden flex-wrap gap-2 lg:flex" aria-hidden="true">
            {["🔥 Streak harian", "⭐ XP dan level", "🏆 Liga kelas"].map((t) => <li key={t} className="rounded-full border-2 border-line bg-card px-3 py-1 text-sm font-bold">{t}</li>)}
          </ul>
        </div>
        <div>{children}</div>
      </div>
    </main>
  );
}
