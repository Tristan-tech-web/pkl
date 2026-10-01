import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Enkripsi kunci API milik sekolah (AES-256-GCM). Rahasia induk hanya ada di env server.
function masterKey(secret = process.env.AI_KEY_ENCRYPTION_SECRET): Buffer {
  if (!secret || secret.length < 16) throw new Error("AI_KEY_ENCRYPTION_SECRET belum diatur");
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string, secret?: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", masterKey(secret), iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return `v1:${iv.toString("base64")}.${c.getAuthTag().toString("base64")}.${ct.toString("base64")}`;
}

export function decryptSecret(blob: string, secret?: string): string {
  if (!blob.startsWith("v1:")) throw new Error("format kunci tidak dikenal");
  const [iv, tag, ct] = blob.slice(3).split(".").map((p) => Buffer.from(p, "base64"));
  const d = createDecipheriv("aes-256-gcm", masterKey(secret), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]).toString("utf8");
}

export const keyHint = (key: string) => `…${key.slice(-4)}`;
