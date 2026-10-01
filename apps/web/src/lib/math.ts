export type Quad = { a: number; b: number; c: number };

export function vertex({ a, b, c }: Quad): { x: number; y: number } | null {
  if (a === 0) return null;
  const x = -b / (2 * a);
  return { x, y: a * x * x + b * x + c };
}

export function roots({ a, b, c }: Quad): number[] {
  if (a === 0) return b === 0 ? [] : [-c / b];
  const d = b * b - 4 * a * c;
  if (d < 0) return [];
  if (d === 0) return [-b / (2 * a)];
  const s = Math.sqrt(d);
  return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((p, q) => p - q);
}

export function formatNumber(n: number): string {
  const r = Math.round(n * 10) / 10;
  return (Object.is(r, -0) ? 0 : r).toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

export function equation({ a, b, c }: Quad): string {
  const parts: { sign: 1 | -1; text: string }[] = [];
  const push = (v: number, suffix: string) => {
    if (v === 0) return;
    const abs = Math.abs(v);
    const coef = suffix !== "" && abs === 1 ? "" : formatNumber(abs);
    parts.push({ sign: v < 0 ? -1 : 1, text: `${coef}${suffix}` });
  };
  push(a, "x²");
  push(b, "x");
  push(c, "");
  if (parts.length === 0) return "y = 0";
  const body = parts
    .map((p, i) => (i === 0 ? `${p.sign < 0 ? "−" : ""}${p.text}` : ` ${p.sign < 0 ? "−" : "+"} ${p.text}`))
    .join("");
  return `y = ${body}`;
}
