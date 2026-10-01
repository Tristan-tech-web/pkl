// Membangkitkan src/app/themes.generated.css dari src/lib/themes.ts (Node ≥ 22.18 mendukung TypeScript langsung).
import { writeFileSync } from "node:fs";
import { generateThemeCss } from "../src/lib/themes.ts";

writeFileSync(new URL("../src/app/themes.generated.css", import.meta.url), generateThemeCss());
console.log("themes.generated.css diperbarui");
