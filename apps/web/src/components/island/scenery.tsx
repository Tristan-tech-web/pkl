// Dekorasi lanskap untuk peta belajar: SVG kecil, deterministik per unit (tanpa unduhan gambar).
export type Biome = "padang" | "pantai" | "hutan" | "gunung";
export const BIOMES: Biome[] = ["padang", "hutan", "pantai", "gunung"];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

const Tree = () => (<svg viewBox="-30 -58 60 82" width="100%" height="100%"><rect x="-3" y="-4" width="6" height="26" rx="2" fill="var(--is-trunk, #7a4b2a)" /><circle cy="-30" r="24" fill="#2f9a5d" /><circle cx="-14" cy="-14" r="15" fill="#2f9a5d" /><circle cx="14" cy="-13" r="15" fill="#2f9a5d" /><circle cx="-8" cy="-38" r="8" fill="#fff" opacity=".14" /></svg>);
const Pine = () => (<svg viewBox="-24 -64 48 88" width="100%" height="100%"><rect x="-3" y="6" width="6" height="16" fill="#6b4226" /><path d="M0-62 L18-26 H8 L22 0 H-22 L-8-26 H-18Z" fill="#1f7a4d" /><path d="M0-62 L9-40 H-9Z" fill="#fff" opacity=".12" /></svg>);
const Bush = () => (<svg viewBox="-28 -26 56 30" width="100%" height="100%"><ellipse cy="-4" rx="26" ry="14" fill="#3aa86a" /><circle cx="-12" cy="-12" r="11" fill="#46b878" /><circle cx="10" cy="-13" r="12" fill="#46b878" /></svg>);
const Rock = () => (<svg viewBox="-24 -26 48 30" width="100%" height="100%"><path d="M-22 2 L-14-18 L2-24 L18-14 L24 2Z" fill="#8c97a8" /><path d="M-14-18 L2-24 L0-8 L-10 2Z" fill="#aab4c4" /></svg>);
const Flower = () => (<svg viewBox="-10 -14 20 30" width="100%" height="100%"><path d="M0 0v14" stroke="#2f7d4f" strokeWidth="2.5" strokeLinecap="round" /><circle cy="-2" r="6" fill="#ff6b8b" /><circle cy="-2" r="2.4" fill="#ffe27a" /></svg>);
const Palm = () => (<svg viewBox="-40 -74 80 96" width="100%" height="100%"><path d="M0 22 C4 -10 -2 -30 6 -52" stroke="#8a5a30" strokeWidth="6" fill="none" strokeLinecap="round" /><g fill="#2fa66a"><path d="M6-52 C-10-70-30-62-38-48 C-22-56-10-56 6-52Z" /><path d="M6-52 C22-72 42-62 44-44 C30-56 18-56 6-52Z" /><path d="M6-52 C-2-74 10-82 18-72 C10-64 8-58 6-52Z" /><path d="M6-52 C-18-50-32-34-34-24 C-22-38-10-46 6-52Z" /><path d="M6-52 C26-48 36-32 36-22 C26-38 16-46 6-52Z" /></g><circle cx="3" cy="-50" r="4" fill="#6b4226" /></svg>);
const Peak = () => (<svg viewBox="-40 -64 80 68" width="100%" height="100%"><path d="M-38 2 L-6-60 L10-34 L20-48 L38 2Z" fill="#8fa1ba" /><path d="M-6-60 L-17-38 L-8-42 L-2-34 L4-42 L10-34Z" fill="#fff" /><path d="M20-48 L14-36 L22-38 L27-34Z" fill="#fff" /></svg>);
const Cloud = () => (<svg viewBox="0 0 120 50" width="100%" height="100%"><path d="M20 44a16 16 0 0 1 2-30 24 24 0 0 1 44-6 20 20 0 0 1 34 9 14 14 0 0 1 6 27z" fill="#fff" opacity=".9" /></svg>);

const KIT: Record<Biome, { c: React.FC; w: number; weight: number }[]> = {
  padang: [{ c: Tree, w: 54, weight: 3 }, { c: Bush, w: 40, weight: 3 }, { c: Flower, w: 16, weight: 5 }, { c: Cloud, w: 70, weight: 1 }],
  hutan: [{ c: Pine, w: 52, weight: 5 }, { c: Tree, w: 58, weight: 2 }, { c: Bush, w: 38, weight: 3 }, { c: Rock, w: 34, weight: 1 }],
  pantai: [{ c: Palm, w: 64, weight: 4 }, { c: Bush, w: 36, weight: 1 }, { c: Rock, w: 32, weight: 2 }, { c: Flower, w: 16, weight: 2 }],
  gunung: [{ c: Peak, w: 86, weight: 4 }, { c: Rock, w: 38, weight: 4 }, { c: Pine, w: 44, weight: 2 }, { c: Cloud, w: 74, weight: 2 }],
};

export function Scenery({ biome, seed, slots }: { biome: Biome; seed: number; slots: number }) {
  const r = rng(seed);
  const pool = KIT[biome].flatMap((k) => Array<(typeof KIT)[Biome][number]>(k.weight).fill(k));
  const items: React.ReactNode[] = [];
  const n = Math.max(3, slots * 2);
  for (let i = 0; i < n; i++) {
    const k = pool[Math.floor(r() * pool.length)];
    const left = i % 2 === 0;
    const x = left ? 1 + r() * 17 : 82 + r() * 14;
    const y = ((Math.floor(i / 2) + 0.15 + r() * 0.7) / Math.max(1, slots)) * 100;
    const w = k.w * (0.85 + r() * 0.4);
    const Comp = k.c;
    items.push(<span key={i} className="biome-deco" style={{ left: `${x}%`, top: `${y}%`, width: w, height: w * (Comp === Cloud ? 0.42 : 1.1) }}><Comp /></span>);
  }
  return <div className="biome-decos" aria-hidden="true">{items}{biome === "pantai" ? <span className="biome-sea" /> : null}</div>;
}
