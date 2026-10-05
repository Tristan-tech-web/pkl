// Nama panggilan dari nama lengkap. Nama Bali sering diawali "I" atau "Ni" (penanda gender), dan gelar seperti "Dra." bukan nama.
const SKIP = new Set(["i", "ni", "dr", "dr.", "dra", "dra.", "drs", "drs.", "ir", "ir.", "h", "h.", "hj", "hj.", "pak", "bu", "bapak", "ibu"]);

export function callName(full: string | null | undefined, fallback = ""): string {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length >= 3 && parts[0].toLowerCase() === "anak" && parts[1].toLowerCase() === "agung") return "Agung";
  const rest = parts.filter((p, i) => !(i < 2 && SKIP.has(p.toLowerCase())));
  return rest[0] ?? parts[parts.length - 1] ?? fallback;
}
