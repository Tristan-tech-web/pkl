// Tiruan jalur belajar untuk halaman depan (statis, tanpa data).
const NODES = [
  { icon: "✓", label: "Pengenalan fungsi", state: "done", dx: 0 },
  { icon: "✓", label: "Grafik dan titik puncak", state: "done", dx: 36 },
  { icon: "▶", label: "Persiapan: Akar-akar", state: "now", dx: 8 },
  { icon: "⏳", label: "Latihan (terbuka besok 15.00)", state: "wait", dx: -30 },
  { icon: "🔒", label: "Tantangan akhir", state: "lock", dx: 0 },
];

export function LandingPath() {
  return (
    <div className="surface relative z-10 overflow-hidden p-4" role="img" aria-label="Contoh jalur belajar: dua simpul selesai, satu sedang berjalan, dua menunggu">
      <p className="rounded-box bg-pen px-3 py-2 text-center text-sm font-extrabold text-on-pen">Bab 3 · Fungsi kuadrat</p>
      <ol className="mt-3 flex flex-col items-center gap-3">
        {NODES.map((n) => (
          <li key={n.label} className="flex flex-col items-center" style={{ transform: `translateX(${n.dx}px)` }}>
            <span className="path-node grid size-14 place-items-center rounded-full text-2xl font-extrabold" data-state={n.state}
              style={{ background: n.state === "done" ? "var(--ok)" : n.state === "now" ? "var(--pen)" : "color-mix(in srgb, var(--ink) 12%, var(--card))", color: n.state === "done" || n.state === "now" ? "#fff" : "var(--ink-soft)", boxShadow: n.state === "now" ? "0 0 0 6px color-mix(in srgb, var(--pen) 25%, transparent)" : undefined }}>{n.icon}</span>
            <span className="mt-1 max-w-48 text-center text-xs font-semibold">{n.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
