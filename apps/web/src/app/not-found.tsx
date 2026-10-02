import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="num text-6xl font-extrabold text-pen" aria-hidden="true">404</p>
      <h1 className="font-display text-3xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-ink-soft">Alamatnya mungkin salah, atau halaman itu bukan untuk akunmu. Balik ke beranda dulu, ya.</p>
      <Link href="/dashboard" className="btn-solid inline-flex min-h-11 items-center rounded-box px-5 font-semibold">Ke beranda</Link>
    </main>
  );
}
