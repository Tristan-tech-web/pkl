// Kurva lupa dengan pengulangan berjarak: setiap pengulangan memulihkan ingatan dan membuat lupa melambat.
// Dihitung di server, murni SVG (tanpa pustaka), dijelaskan lewat aria-label.
const W = 440, H = 230, X0 = 28, Y_TOP = 40, Y_BOT = 190;
const reviews = [{ x: 20, tau: 40, label: "Hari-H" }, { x: 130, tau: 85, label: "+2 hari" }, { x: 255, tau: 170, label: "+1 minggu" }, { x: 380, tau: 600, label: "+1 bulan" }];

function seg(x0: number, x1: number, tau: number) {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 4) {
    const t = x - x0;
    const y = Y_TOP + (Y_BOT - Y_TOP) * 0.78 * (1 - Math.exp(-t / tau));
    pts.push(`${pts.length ? "L" : "M"}${(X0 + x).toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export function ForgettingCurve() {
  const solid = reviews.map((r, i) => seg(r.x, i < reviews.length - 1 ? reviews[i + 1].x : 410, r.tau)).join(" ");
  const alone = seg(20, 410, 40);
  return (
    <figure className="sticker" style={{ rotate: "1.2deg" }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Grafik: tanpa mengulang, ingatan turun cepat. Dengan mengulang pada hari-H, dua hari, satu minggu, dan satu bulan, ingatan pulih dan turunnya makin lambat." className="w-full">
        <path d={`M${X0} ${Y_TOP - 12}V${Y_BOT + 2}H${W - 8}`} fill="none" stroke="var(--ink-soft)" strokeWidth="2.5" strokeLinecap="round" />
        <path d={alone} fill="none" stroke="var(--ink-soft)" strokeWidth="3" strokeDasharray="3 9" strokeLinecap="round" opacity=".7" />
        <path d={solid} fill="none" stroke="var(--pen)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {reviews.slice(1).map((r) => (
          <line key={`j${r.label}`} x1={X0 + r.x} x2={X0 + r.x} y1={Y_TOP + 4} y2={Y_TOP + (Y_BOT - Y_TOP) * 0.78 * (1 - Math.exp(-(r.x - reviews[reviews.indexOf(r) - 1].x) / reviews[reviews.indexOf(r) - 1].tau))} stroke="var(--pen)" strokeWidth="2.5" strokeDasharray="2 6" strokeLinecap="round" opacity=".7" />
        ))}
        {reviews.map((r) => (
          <g key={r.label} transform={`translate(${X0 + r.x} ${Y_TOP})`}>
            <circle r="9" fill="var(--accent)" stroke="var(--card)" strokeWidth="3" />
            <text y={Y_BOT - Y_TOP + 22} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--ink)">{r.label}</text>
          </g>
        ))}
        <text x={X0 + 8} y={Y_TOP - 18} fontSize="12.5" fontWeight="700" fill="var(--ink-soft)">ingatan</text>
        <text x={X0 + 232} y={Y_BOT - 18} fontSize="12" fontWeight="700" fill="var(--ink-soft)">tanpa mengulang</text>
      </svg>
      <figcaption className="mt-1 text-sm font-semibold text-ink-soft">Mengulang tepat sebelum lupa membuat ingatan awet.</figcaption>
    </figure>
  );
}
