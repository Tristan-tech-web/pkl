import Link from "next/link";
import { StudentNav } from "@/components/student-nav";

type Stats = { xp: number; streak: number; level: number };

// Kerangka murid: bilah atas ringkas (XP, beruntun, lonceng) + navigasi bawah/kiri. Menyembunyikan header umum lewat data-shell.
export function StudentShell({ schoolId, schoolName, stats, unread, children }: { schoolId: string; schoolName: string; stats: Stats; unread: number; children: React.ReactNode }) {
  return (
    <div data-shell="student">
      <div className="s-top no-print">
        <Link href={`/dashboard/sekolah/${schoolId}`} className="min-w-0 flex-1 leading-tight" aria-label="Beranda">
          <span className="block font-display text-base font-extrabold">EduSmart</span>
          <span className="block truncate text-xs text-ink-soft">{schoolName}</span>
        </Link>
        <span className="s-chip" aria-label={`Level ${stats.level}`}>Lv <b className="num">{stats.level}</b></span>
        <span className="s-chip" aria-label={`${stats.streak} hari beruntun`}>🔥 <b className="num">{stats.streak}</b></span>
        <span className="s-chip" aria-label={`${stats.xp} XP`}>⭐ <b className="num">{stats.xp}</b></span>
        <Link href={`/dashboard/sekolah/${schoolId}/notifikasi`} aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"} className="s-chip relative !px-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
          {unread > 0 ? <span className="badge-pop num absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-bad px-1 text-xs font-bold leading-5 text-white" aria-hidden="true">{unread > 9 ? "9+" : unread}</span> : null}
        </Link>
      </div>
      <StudentNav schoolId={schoolId} />
      <div className="s-body">{children}</div>
    </div>
  );
}
