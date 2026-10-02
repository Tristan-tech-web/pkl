import { IslandScene } from "@/components/island/island-scene";
import Link from "next/link";
import { Mascot } from "@/components/three/mascot";
import { Wordmark } from "@/components/ui";

// Kerangka halaman masuk/daftar: dunia pulau di belakang, judul di kiri, formulir di kanan.
export function AuthShell({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col">
      <IslandScene bare pena={<Mascot size={180} className="island-pena" />}>
        <Link href="/" aria-label="EduSmart, ke beranda" className="inline-flex min-h-11 items-center"><Wordmark /></Link>
        <div className="grid items-start gap-8 pt-4 lg:grid-cols-[1fr_28rem] lg:pt-10">
          <div className="text-left">
            <h1 className="island-title !text-[clamp(2.6rem,8vw,6rem)]">{title}</h1>
            <p className="island-lede mt-4">{lead}</p>
          </div>
          <div className="island-auth">{children}</div>
        </div>
      </IslandScene>
    </main>
  );
}
