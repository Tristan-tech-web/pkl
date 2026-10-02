// Keadaan kosong yang ramah: Pena kecil menemani kalimat yang mengajak, bukan kotak putus-putus yang dingin.
export function Empty({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-4 rounded-box border-2 border-dashed border-line bg-card p-4 sm:p-5 ${className}`}>
      <svg viewBox="0 0 100 100" width="56" height="56" aria-hidden="true" className="shrink-0">
        <ellipse cx="50" cy="93" rx="26" ry="4.5" fill="#0a0a1e" opacity=".15" />
        <path d="M16 62c-2 14 10 28 34 28s36-14 34-28c-2-20-12-38-34-38S18 42 16 62z" fill="var(--pen)" />
        <path d="M30 66c0 12 8 20 20 20s20-8 20-20c-6-4-14-5-20-5s-14 1-20 5z" fill="#fff1db" />
        <circle cx="37" cy="40" r="11" fill="#fff" /><circle cx="63" cy="40" r="11" fill="#fff" />
        <circle cx="38" cy="41" r="6" fill="#1b1a3a" /><circle cx="62" cy="41" r="6" fill="#1b1a3a" />
        <circle cx="36" cy="38" r="2.2" fill="#fff" /><circle cx="60" cy="38" r="2.2" fill="#fff" />
        <path d="M46 49h8l-4 7z" fill="var(--hi)" />
        <path d="M26 27l24-12 24 12-24 11z" fill="#14183f" />
      </svg>
      <p className="min-w-0 text-ink-soft">{children}</p>
    </div>
  );
}
