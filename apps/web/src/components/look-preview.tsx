import { EXPERIENCE_INFO, type Experience } from "@/lib/appearance";

// Pratinjau mini: tema dan pengalaman dipasang pada pembungkus (data-*-scope), jadi tampil persis seperti aslinya.
export function LookPreview({ theme, experience, brand, className = "" }: { theme: string; experience: Experience; brand?: { pen: string; penStrong: string; onPen: string; hi: string } | null; className?: string }) {
  const style = brand ? ({ "--pen": brand.pen, "--pen-strong": brand.penStrong, "--on-pen": brand.onPen, "--hi": brand.hi } as React.CSSProperties) : undefined;
  return (
    <div data-theme-scope={theme} data-experience-scope={experience} style={style} className={`rounded-box border border-line bg-paper p-3 text-ink ${className}`} aria-hidden="true">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold">EduSmart</span>
        <span className="rounded-btn bg-accent px-2 py-0.5 text-[10px] font-bold text-on-accent">🔥 3</span>
      </div>
      <div className="mt-2 rounded-box border border-line bg-card p-2 shadow-card">
        <p className="font-display text-sm font-bold leading-tight">Fungsi kuadrat</p>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full border border-line bg-paper"><div className="h-full w-2/3 rounded-full bg-pen" /></div>
        <p className="mt-1 text-[11px] text-ink-soft">{EXPERIENCE_INFO[experience].label} · 120 XP</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded-btn bg-pen px-3 py-1 text-xs font-bold text-on-pen">Lanjutkan</span>
        <span className="size-6 rounded-full border-2 border-pen bg-card" />
        <span className="size-6 rounded-full bg-hi" />
      </div>
    </div>
  );
}
