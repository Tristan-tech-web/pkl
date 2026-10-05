// Elemen ilustrasi untuk adegan pulau. Semua koordinat memakai viewBox 1440x600 milik IslandScene.
// Warna datang dari variabel CSS adegan (--is-*), jadi otomatis ikut pagi/siang/sore/malam.
// Bayangan dan sisi terang dibuat dari color-mix supaya satu variabel cukup untuk satu keluarga warna.

const dark = (v: string, p = 78) => `color-mix(in oklab, ${v} ${p}%, #000)`;
const light = (v: string, p = 80) => `color-mix(in oklab, ${v} ${p}%, #fff)`;

/** Pohon berdaun lebat: tajuk tiga nada (gelap, dasar, terang), batang meruncing, bayangan di tanah. */
export function Tree({ x, y, s = 1, v = 1 }: { x: number; y: number; s?: number; v?: 1 | 2 }) {
  const base = v === 1 ? "var(--is-tree)" : "var(--is-tree2)";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="6" cy="22" rx="24" ry="4.5" fill="#000" opacity=".14" />
      <path d="M-4.5 22 L-2.5 -6 H2.5 L4.5 22Z" fill="var(--is-trunk)" />
      <path d="M1 22 L2.5 -6 H0 L-1 22Z" fill="#000" opacity=".16" />
      <g fill={dark(base)}>
        <circle cx="2" cy="-18" r="23" /><circle cx="-13" cy="-6" r="15" /><circle cx="16" cy="-5" r="15" />
      </g>
      <g fill={base}>
        <circle cx="-1" cy="-22" r="21" /><circle cx="-15" cy="-9" r="13" /><circle cx="13" cy="-9" r="13" />
      </g>
      <g fill={light(base)} opacity=".55">
        <circle cx="-8" cy="-31" r="9" /><circle cx="-20" cy="-13" r="5" /><circle cx="6" cy="-34" r="4" />
      </g>
    </g>
  );
}

/** Pohon cemara bertingkat. */
export function Pine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const base = "var(--is-tree)";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="5" cy="20" rx="17" ry="3.5" fill="#000" opacity=".14" />
      <rect x="-3" y="4" width="6" height="16" rx="1.5" fill="var(--is-trunk)" />
      <path d="M0 -70 L20 -34 H-20Z" fill={base} />
      <path d="M0 -52 L26 -12 H-26Z" fill={base} />
      <path d="M0 -32 L32 8 H-32Z" fill={base} />
      <path d="M0 -70 L20 -34 H6 L-2 -52Z M0 -52 L26 -12 H10 L0 -34Z M0 -32 L32 8 H14 L2 -14Z" fill={dark(base)} opacity=".6" />
      <path d="M0 -70 L-12 -46 L-4 -50Z M0 -52 L-16 -26 L-6 -30Z M0 -32 L-20 -4 L-8 -8Z" fill={light(base)} opacity=".5" />
    </g>
  );
}

/** Semak bulat. */
export function Bush({ x, y, s = 1, v = 2 }: { x: number; y: number; s?: number; v?: 1 | 2 }) {
  const base = v === 1 ? "var(--is-tree)" : "var(--is-tree2)";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="3" cy="2" rx="30" ry="5" fill="#000" opacity=".12" />
      <g fill={dark(base)}><circle cx="-14" cy="-6" r="12" /><circle cx="6" cy="-10" r="15" /><circle cx="20" cy="-4" r="11" /></g>
      <g fill={base}><circle cx="-15" cy="-8" r="10" /><circle cx="4" cy="-13" r="13" /><circle cx="18" cy="-6" r="9" /></g>
      <circle cx="-1" cy="-17" r="4.5" fill={light(base)} opacity=".6" />
      <circle cx="-14" cy="-11" r="2.5" fill={light(base)} opacity=".6" />
    </g>
  );
}

export function Rock({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="2" cy="2" rx="20" ry="3.5" fill="#000" opacity=".14" />
      <path d="M-18 0 C-20 -12 -8 -22 4 -20 C16 -19 22 -8 19 0Z" fill={dark("var(--is-far)", 58)} />
      <path d="M-18 0 C-20 -12 -8 -22 4 -20 C-2 -14 -4 -6 -3 0Z" fill={light("var(--is-far)", 70)} opacity=".8" />
    </g>
  );
}

/** Bunga dengan kelopak, tangkai, dan daun kecil. */
export function Flower({ x, y, c = "var(--is-flower)" }: { x: number; y: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 C-1 6 1 10 0 15" stroke={dark("var(--is-tree2)", 85)} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M0 10 C-7 8 -9 4 -8 2 C-4 2 -1 5 0 10Z" fill="var(--is-tree2)" />
      <g fill={c}>
        <circle cx="0" cy="-7" r="3.6" /><circle cx="6.6" cy="-2.4" r="3.6" /><circle cx="4" cy="5" r="3.6" transform="translate(0 -3)" /><circle cx="-4" cy="2" r="3.6" /><circle cx="-6.6" cy="-4.4" r="3.6" />
      </g>
      <circle cx="0" cy="-2" r="2.8" fill="#ffe27a" />
    </g>
  );
}

/** Rumpun rumput pendek. */
export function Tuft({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path d="M-7 0 Q-7 -9 -10 -14 Q-4 -10 -2 0 M-2 0 Q-1 -12 -2 -19 Q3 -12 3 0 M3 0 Q5 -8 10 -12 Q8 -5 8 0" transform={`translate(${x} ${y}) scale(${s})`} fill={dark("var(--is-h2)", 80)} opacity=".85" />
  );
}

/** Pagar kayu kecil. */
export function Fence({ x, y, n = 4, s = 1 }: { x: number; y: number; n?: number; s?: number }) {
  const gap = 26;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y="-17" width={(n - 1) * gap + 8} height="4" rx="2" fill="#fff6e6" />
      <rect x="-4" y="-8" width={(n - 1) * gap + 8} height="4" rx="2" fill="#fff6e6" />
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${i * gap} 0)`}>
          <rect x="-3.5" y="-24" width="7" height="26" rx="2" fill="#fff6e6" />
          <rect x="1" y="-24" width="2.5" height="26" rx="1" fill="#000" opacity=".1" />
          <circle cy="-24" r="3.5" fill="#fff6e6" />
        </g>
      ))}
    </g>
  );
}

/** Pondok: dinding, atap dua nada, cerobong berasap, jendela hangat, pintu. */
export function House({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="4" cy="17" rx="40" ry="5" fill="#000" opacity=".13" />
      <rect x="-26" y="-14" width="52" height="30" rx="2" fill="#fff6e6" />
      <rect x="10" y="-14" width="16" height="30" fill="#000" opacity=".07" />
      <rect x="10" y="-44" width="9" height="20" fill="var(--is-trunk)" />
      <rect x="8" y="-47" width="13" height="5" rx="1.5" fill={dark("var(--is-trunk)", 75)} />
      <g className="is-smoke" fill="#fff" opacity=".7"><circle cx="14.5" cy="-54" r="4" /><circle cx="18" cy="-64" r="5" opacity=".6" /><circle cx="23" cy="-75" r="6" opacity=".4" /></g>
      <path d="M-34 -13 L0 -46 L34 -13Z" fill="var(--is-flower)" />
      <path d="M0 -46 L34 -13 H14Z" fill="#000" opacity=".14" />
      <path d="M-34 -13 L0 -46 L-6 -46 L-40 -13Z" fill="#fff" opacity=".2" />
      <rect x="-5" y="-3" width="12" height="19" rx="6" ry="6" fill="var(--is-trunk)" />
      <circle cx="3.5" cy="7" r="1.1" fill="#ffe27a" />
      <rect x="-21" y="-8" width="11" height="11" rx="1.5" fill="#ffe27a" stroke="var(--is-trunk)" strokeWidth="2" />
      <path d="M-15.5 -8 V3 M-21 -2.5 H-10" stroke="var(--is-trunk)" strokeWidth="1.4" />
      <rect x="14" y="-6" width="8" height="9" rx="1.5" fill="#ffe27a" stroke="var(--is-trunk)" strokeWidth="2" />
    </g>
  );
}

/** Kincir angin: menara bata, atap, baling-baling berjeruji yang berputar. */
export function Windmill({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="4" cy="2" rx="24" ry="4" fill="#000" opacity=".13" />
      <path d="M-13 0 L-7 -52 H7 L13 0Z" fill="#fff6e6" />
      <path d="M4 0 L7 -52 H4Z M13 0 L7 -52 L8 -52 L13 0Z" fill="#000" opacity=".1" />
      <path d="M-11 -14 H11 M-9.5 -28 H9.5 M-8 -42 H8" stroke="var(--is-trunk)" strokeOpacity=".28" strokeWidth="1.5" />
      <path d="M-7 -52 L0 -66 L7 -52Z" fill="var(--is-flower)" />
      <rect x="-4" y="-12" width="8" height="12" rx="4" fill="var(--is-trunk)" />
      <g className="is-blades" style={{ transformOrigin: "0px -56px", transformBox: "view-box" }}>
        <g transform="translate(0 -56)">
          {[0, 90, 180, 270].map((r) => (
            <g key={r} transform={`rotate(${r})`}>
              <rect x="-2" y="-40" width="4" height="40" rx="1.5" fill="var(--is-trunk)" />
              <rect x="2" y="-38" width="13" height="26" rx="2" fill="#fff" stroke="var(--is-trunk)" strokeWidth="1.5" />
              <path d="M2 -31 H15 M2 -24 H15 M2 -17 H15" stroke="var(--is-trunk)" strokeOpacity=".4" strokeWidth="1" />
            </g>
          ))}
        </g>
      </g>
      <circle cy="-56" r="4.5" fill="var(--is-trunk)" /><circle cy="-56" r="1.8" fill="#ffe27a" />
    </g>
  );
}

/** Lentera jalan: tiang, rumah lampu, cahaya lembut. */
export function Lantern({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="2" cy="0" rx="9" ry="2.5" fill="#000" opacity=".14" />
      <circle cy="-40" r="20" fill="var(--is-glow)" />
      <rect x="-2" y="-36" width="4" height="36" rx="1" fill="#4a3a2a" />
      <path d="M-7 -44 L0 -52 L7 -44Z" fill="#4a3a2a" />
      <rect x="-5.5" y="-45" width="11" height="13" rx="3" fill="#ffe27a" stroke="#4a3a2a" strokeWidth="2" />
      <circle cy="-39" r="2.5" fill="#fff" opacity=".8" />
    </g>
  );
}

/** Api unggun: batu melingkar, kayu, lidah api tiga lapis. */
export function Campfire({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <ellipse cy="5" rx="26" ry="5.5" fill="#000" opacity=".16" />
      {[-20, -10, 0, 10, 20].map((dx, i) => <ellipse key={dx} cx={dx} cy={3 + (i % 2)} rx="5.5" ry="4" fill={i % 2 ? "#8b8794" : "#a29eab"} />)}
      <rect x="-17" y="-5" width="34" height="7" rx="3.5" fill="var(--is-trunk)" transform="rotate(-14)" />
      <rect x="-17" y="-5" width="34" height="7" rx="3.5" fill="#5e3a1f" transform="rotate(14)" />
      <g className="is-flame" style={{ transformOrigin: "0px 0px", transformBox: "view-box" }}>
        <path d="M0 -4 C-16 -14 -10 -32 0 -48 C10 -32 16 -14 0 -4Z" fill="#ff7a1f" />
        <path d="M0 -4 C-10 -11 -6 -22 0 -32 C6 -22 10 -11 0 -4Z" fill="#ffb02e" />
        <path d="M0 -4 C-5 -8 -3 -15 0 -20 C3 -15 5 -8 0 -4Z" fill="#fff0a0" />
      </g>
    </g>
  );
}

/** Jamur kecil di tepi jalan. */
export function Mushroom({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-8" width="6" height="9" rx="2.5" fill="#fff6e6" />
      <path d="M-11 -7 C-11 -19 11 -19 11 -7Z" fill="var(--is-flower)" />
      <circle cx="-4" cy="-12" r="1.8" fill="#fff" opacity=".9" /><circle cx="4" cy="-10" r="1.4" fill="#fff" opacity=".9" />
    </g>
  );
}

/** Kawanan burung terbang jauh di langit. */
export function Birds() {
  const bird = (x: number, y: number, s: number, d: number) => (
    <path key={d} className="is-bird" style={{ animationDelay: `${-d}s` }} d="M0 0 Q5 -7 10 -1 Q15 -7 20 0" transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke="var(--is-ink)" strokeOpacity=".45" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  );
  return <g>{bird(1010, 120, 1, 0)}{bird(1050, 140, 0.75, 2)}{bird(978, 152, 0.6, 4)}</g>;
}
