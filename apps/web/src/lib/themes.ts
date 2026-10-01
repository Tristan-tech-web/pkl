// Paket tema: sumber kebenaran tunggal. CSS dibangkitkan dari sini (scripts/gen-themes.mjs → app/themes.generated.css)
// dan kontras tiap tema diuji otomatis (themes.test.ts). File ini tidak boleh mengimpor modul lain.
export type TokenKey =
  | "paper" | "card" | "ink" | "inkSoft" | "pen" | "penStrong" | "onPen" | "margin" | "hi" | "star"
  | "grid" | "line" | "ok" | "okBg" | "warn" | "warnBg" | "bad" | "badBg" | "accent" | "onAccent";
export type Tokens = Record<TokenKey, string>;
export type Theme = { id: string; label: string; blurb: string; mode: "light" | "dark"; scene: string; tokens: Tokens };

const t = (x: Tokens): Tokens => x;

export const THEMES: Theme[] = [
  {
    id: "kertas", label: "Kertas", blurb: "Buku tulis kotak-kotak. Tenang dan jelas.", mode: "light", scene: "kertas",
    tokens: t({ paper: "#f5f8fb", card: "#ffffff", ink: "#14213d", inkSoft: "#46546b", pen: "#1d3fa8", penStrong: "#152f80", onPen: "#ffffff", margin: "#d8433b", hi: "#ffe34d", star: "#e0a100",
      grid: "#dce6ef", line: "#c7d3e0", ok: "#1f7a4d", okBg: "#e5f4ec", warn: "#8a5200", warnBg: "#fff4db", bad: "#b42318", badBg: "#fdecea", accent: "#c4372f", onAccent: "#ffffff" }),
  },
  {
    id: "gelap-fokus", label: "Gelap Fokus", blurb: "Papan tulis hijau gelap, nyaman di malam hari.", mode: "dark", scene: "kertas",
    tokens: t({ paper: "#10201b", card: "#172b24", ink: "#ecf3ee", inkSoft: "#aec0b6", pen: "#8db2ff", penStrong: "#b3ccff", onPen: "#0b1b33", margin: "#ff8f85", hi: "#e9d96b", star: "#f2cf4a",
      grid: "#1f342c", line: "#2c463c", ok: "#6fd3a0", okBg: "#123226", warn: "#f2c46b", warnBg: "#3a2d10", bad: "#ff9a90", badBg: "#3a1815", accent: "#ff8f85", onAccent: "#10201b" }),
  },
  {
    id: "luar-angkasa", label: "Luar Angkasa", blurb: "Galaksi ungu, planet, dan bintang jatuh.", mode: "dark", scene: "angkasa",
    tokens: t({ paper: "#0e0b22", card: "#1a1540", ink: "#f1eeff", inkSoft: "#b9b1e6", pen: "#a99bff", penStrong: "#cfc6ff", onPen: "#0e0b22", margin: "#ff7ad9", hi: "#ffd166", star: "#ffd166",
      grid: "#1d1850", line: "#3a3380", ok: "#5ee0a0", okBg: "#123a2c", warn: "#ffc266", warnBg: "#3a2a0c", bad: "#ff8a8a", badBg: "#3d1620", accent: "#ff7ad9", onAccent: "#0e0b22" }),
  },
  {
    id: "hutan", label: "Hutan", blurb: "Hijau segar, daun, dan hewan kecil.", mode: "light", scene: "hutan",
    tokens: t({ paper: "#eff7ea", card: "#ffffff", ink: "#16341f", inkSoft: "#46604d", pen: "#1b7a3a", penStrong: "#135a2a", onPen: "#ffffff", margin: "#c2410c", hi: "#ffe066", star: "#d99100",
      grid: "#d6e8cf", line: "#bcd5b3", ok: "#1a6b3a", okBg: "#e0f2e4", warn: "#8a5200", warnBg: "#fff4db", bad: "#b42318", badBg: "#fdecea", accent: "#e8a317", onAccent: "#16341f" }),
  },
  {
    id: "laut", label: "Laut", blurb: "Biru toska, gelembung, dan ikan.", mode: "light", scene: "laut",
    tokens: t({ paper: "#e8f6fb", card: "#ffffff", ink: "#0c2f45", inkSoft: "#3f6075", pen: "#0b6fa4", penStrong: "#08537c", onPen: "#ffffff", margin: "#e0576b", hi: "#ffe27a", star: "#d99100",
      grid: "#cfe8f2", line: "#b3d6e6", ok: "#1a7050", okBg: "#e0f4ec", warn: "#8a5200", warnBg: "#fff4db", bad: "#b42318", badBg: "#fdecea", accent: "#ff7f6b", onAccent: "#0c2f45" }),
  },
  {
    id: "kota-neon", label: "Kota Neon", blurb: "Malam kota, lampu neon cyan dan pink.", mode: "dark", scene: "kota",
    tokens: t({ paper: "#0a0e1a", card: "#131a2e", ink: "#eaf6ff", inkSoft: "#9fb4d6", pen: "#22e1ff", penStrong: "#7eeeff", onPen: "#04141a", margin: "#ff3d9a", hi: "#f6ff4d", star: "#f6ff4d",
      grid: "#172036", line: "#2a3b63", ok: "#4be3a1", okBg: "#0f3326", warn: "#ffc266", warnBg: "#3a2a0c", bad: "#ff8a9a", badBg: "#3d1220", accent: "#ff3d9a", onAccent: "#0a0e1a" }),
  },
  {
    id: "pixel-retro", label: "Pixel Retro", blurb: "Arkade 8-bit, kuning dan merah muda.", mode: "dark", scene: "retro",
    tokens: t({ paper: "#1a1a2e", card: "#232347", ink: "#fef9ef", inkSoft: "#c9c6e0", pen: "#ffcc00", penStrong: "#ffe066", onPen: "#1a1a2e", margin: "#ff4d6d", hi: "#7cf7c9", star: "#ffcc00",
      grid: "#222244", line: "#3d3d75", ok: "#6df0b0", okBg: "#12382b", warn: "#ffc266", warnBg: "#3a2a0c", bad: "#ff8a9a", badBg: "#3d1220", accent: "#ff4d6d", onAccent: "#1a1a2e" }),
  },
  {
    id: "permen", label: "Permen", blurb: "Merah muda dan ungu, manis dan ceria.", mode: "light", scene: "permen",
    tokens: t({ paper: "#fff1f9", card: "#ffffff", ink: "#3b1d4a", inkSoft: "#6a4a7a", pen: "#b0167f", penStrong: "#860f60", onPen: "#ffffff", margin: "#5f3fe0", hi: "#ffe14d", star: "#e09500",
      grid: "#ffdcf0", line: "#f1bfe0", ok: "#1f7a4d", okBg: "#e5f4ec", warn: "#8a5200", warnBg: "#fff4db", bad: "#b42318", badBg: "#fdecea", accent: "#5f3fe0", onAccent: "#ffffff" }),
  },
  {
    id: "kontras-tinggi", label: "Kontras Tinggi", blurb: "Hitam-putih tegas, paling mudah dibaca.", mode: "light", scene: "kertas",
    tokens: t({ paper: "#ffffff", card: "#ffffff", ink: "#000000", inkSoft: "#1f1f1f", pen: "#0000b8", penStrong: "#00008a", onPen: "#ffffff", margin: "#b00020", hi: "#ffeb3b", star: "#8a6500",
      grid: "#e6e6e6", line: "#000000", ok: "#005c1f", okBg: "#e6f6ea", warn: "#6b3f00", warnBg: "#fff1cc", bad: "#a00012", badBg: "#fde6e8", accent: "#b00020", onAccent: "#ffffff" }),
  },
  {
    // Placeholder: nilai pen/penStrong/onPen/hi diganti saat runtime dari warna sekolah (lib/color.ts brandTokens).
    id: "warna-sekolah", label: "Warna Sekolah", blurb: "Memakai warna merek sekolah Anda.", mode: "light", scene: "kertas",
    tokens: t({ paper: "#f7f8fb", card: "#ffffff", ink: "#15202b", inkSoft: "#475465", pen: "#1d3fa8", penStrong: "#152f80", onPen: "#ffffff", margin: "#d8433b", hi: "#ffe34d", star: "#e0a100",
      grid: "#e1e7ee", line: "#ccd5df", ok: "#1f7a4d", okBg: "#e5f4ec", warn: "#8a5200", warnBg: "#fff4db", bad: "#b42318", badBg: "#fdecea", accent: "#c4372f", onAccent: "#ffffff" }),
  },
];

export const THEME_IDS = THEMES.map((x) => x.id);
export const DEFAULT_THEME = "kertas";
export const themeById = (id: string | null | undefined) => THEMES.find((x) => x.id === id) ?? THEMES[0];

const CSS_VAR: Record<TokenKey, string> = {
  paper: "--paper", card: "--card", ink: "--ink", inkSoft: "--ink-soft", pen: "--pen", penStrong: "--pen-strong", onPen: "--on-pen", margin: "--margin", hi: "--hi", star: "--star",
  grid: "--grid", line: "--line", ok: "--ok", okBg: "--ok-bg", warn: "--warn", warnBg: "--warn-bg", bad: "--bad", badBg: "--bad-bg", accent: "--accent", onAccent: "--on-accent",
};

function block(selector: string, th: Theme, indent = ""): string {
  const lines = (Object.keys(CSS_VAR) as TokenKey[]).map((k) => `${indent}  ${CSS_VAR[k]}: ${th.tokens[k]};`);
  return `${indent}${selector} {\n${lines.join("\n")}\n${indent}  color-scheme: ${th.mode};\n${indent}}`;
}

/** CSS tema. Tanpa atribut data-theme: terang (Kertas) atau gelap (Gelap Fokus) mengikuti sistem operasi. */
export function generateThemeCss(): string {
  const light = THEMES[0], dark = THEMES[1];
  const parts = [
    "/* DIBANGKITKAN dari src/lib/themes.ts oleh scripts/gen-themes.mjs. Jangan diedit tangan. */",
    block(":root", light),
    "@media (prefers-color-scheme: dark) {\n" + block(":root:not([data-theme])", dark, "  ") + "\n}",
    ...THEMES.map((th) => block(`:root[data-theme="${th.id}"], [data-theme-scope="${th.id}"]`, th)),
  ];
  return parts.join("\n\n") + "\n";
}
