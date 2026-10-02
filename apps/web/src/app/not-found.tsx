import Link from "next/link";
import { IslandScene } from "@/components/island/island-scene";
import { Mascot } from "@/components/three/mascot";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <IslandScene bare pena={<Mascot size={170} className="island-pena" />}>
        <div className="grid max-w-lg gap-3 pt-10">
          <p className="num island-eyebrow w-fit">404</p>
          <h1 className="island-title" style={{ fontSize: "clamp(2.6rem, 9vw, 5.5rem)" }}>Waduh, jalannya buntu.</h1>
          <p className="island-lede">Alamatnya mungkin salah, atau halaman itu bukan untuk akunmu. Balik ke beranda dulu, ya.</p>
          <div><Link href="/dashboard" className="btn-solid inline-flex min-h-12 items-center rounded-btn px-6 text-lg font-extrabold">Ke beranda</Link></div>
        </div>
      </IslandScene>
    </main>
  );
}
