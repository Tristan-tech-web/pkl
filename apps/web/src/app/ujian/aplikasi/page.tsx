import Link from "next/link";

export const metadata = { title: "Aplikasi ujian · EduSmart" };
export const dynamic = "force-dynamic";

type P = { key: string; name: string; env: string; how: string; lock: string };
const PLATFORMS: P[] = [
  { key: "android", name: "Android", env: "EXAM_APP_ANDROID_URL", how: "Unduh lalu pasang. Izinkan pemasangan dari sumber ini bila diminta.", lock: "Layar disematkan (lock task), tangkapan layar diblokir, keluar dari ujian tercatat." },
  { key: "ios", name: "iPhone dan iPad", env: "EXAM_APP_IOS_URL", how: "Pasang dari App Store/TestFlight.", lock: "Sesi penilaian Apple: aplikasi lain, tangkapan dan rekaman layar, Siri, dan papan klip dikunci." },
  { key: "windows", name: "Windows", env: "EXAM_APP_WINDOWS_URL", how: "Unduh, pasang, lalu jalankan sebagai pengguna biasa.", lock: "Layar penuh terkunci, pintasan sistem diblokir, jendela dilindungi dari tangkapan layar." },
];

export default function ExamAppPage() {
  return (
    <main id="isi" className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/dashboard" className="text-sm font-semibold text-pen underline">← Dashboard</Link>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Aplikasi ujian EduSmart</h1>
      <p className="mt-2 text-ink-soft">Ujian dikerjakan di aplikasi khusus yang mengunci perangkat selama ujian. Pasang sekali, lalu setiap ujian dibuka dari halaman Ujian di EduSmart.</p>
      <ul className="mt-6 space-y-4">
        {PLATFORMS.map((p) => {
          const url = process.env[p.env];
          return (
            <li key={p.key} className="surface p-5">
              <h2 className="font-display text-xl font-bold">{p.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">{p.how}</p>
              <p className="mt-1 text-sm"><span className="font-semibold">Penguncian:</span> {p.lock}</p>
              {url ? <a href={url} className="press mt-3 inline-flex min-h-11 items-center rounded-box bg-pen px-5 font-semibold text-on-pen">Unduh untuk {p.name}</a>
                   : <p className="mt-3 inline-flex min-h-11 items-center rounded-box border border-line px-4 text-sm text-ink-soft">Belum dirilis untuk sekolah ini. Hubungi admin sekolah.</p>}
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm text-ink-soft">Tidak ada penguncian yang sempurna di perangkat milik sendiri. Karena itu aplikasi juga mencatat setiap pelanggaran dan pengawas dapat membekukan ujian.</p>
    </main>
  );
}
