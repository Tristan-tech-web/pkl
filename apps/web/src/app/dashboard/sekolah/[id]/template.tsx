// Template (bukan layout) dibuat ulang di tiap pindah halaman, jadi gerak masuk ini ikut berjalan.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
