// Menyalin berkas WASM MediaPipe ke public/ supaya dimuat dari domain sendiri (tanpa CDN pihak ketiga). Dijalankan sebelum dev/build.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const root = join("node_modules", "@mediapipe", "tasks-vision");
const src = join(root, "wasm"), dst = join("public", "mediapipe", "wasm");
if (!existsSync(src)) { console.error("wasm MediaPipe tidak ditemukan"); process.exit(1); }
mkdirSync(dst, { recursive: true });
for (const f of ["vision_wasm_internal.js", "vision_wasm_internal.wasm", "vision_wasm_nosimd_internal.js", "vision_wasm_nosimd_internal.wasm"]) cpSync(join(src, f), join(dst, f));
