# Arsitektur Produk: paket, AI, dan BYOK

## Paket
- **Umum** (di landing page): fitur inti sekolah dengan batas pengguna/penyimpanan. Rincian harga ditentukan kemudian.
- **Enterprise**: "hubungi tim dev" (formulir kontak → tabel `leads`), konfigurasi khusus, SLA, paket kurikulum kustom.
- Implementasi: tabel `plans`, `plan_entitlements` (fitur/batas), `school_subscriptions`. Fitur dicek lewat entitlement, bukan `if plan == ...` tersebar di kode.
- Penagihan (Midtrans/Xendit) ditunda; awalnya penugasan paket manual oleh admin platform.

## AI: dua jalur
1. **Kunci platform (Gemini, gratis, banyak kunci)**: hanya untuk **demo dan data sintetis**. Alasan: layanan gratis dapat dipakai Google untuk memperbaiki produk (verifikasi ketentuan), dan memutar kunci demi kuota perlu dicek kepatuhannya. Tidak boleh memproses data siswa nyata.
2. **BYOK (kunci milik sekolah)**: sekolah yang ingin AI memasukkan kunci API sendiri (biaya dan ketentuan data di bawah kontrak mereka dengan penyedia).

### Lapisan penyedia
`LLMProvider` (Gemini lebih dulu; Claude/OpenAI/kompatibel-OpenAI menyusul). Hanya penyedia dalam allowlist; tidak menerima base URL bebas (cegah SSRF).

### Pool kunci platform
Daftar `GEMINI_API_KEYS`. Per pasangan (kunci, model) ada jeda saat 429/kuota habis, rantai model cadangan (mis. Flash-Lite/Gemma sebagai utama, Flash sebagai cadangan kualitas), jitter, dan kunci tidak pernah dilog atau dikirim ke klien. Kunci yang 403 ditandai mati.

### BYOK: penyimpanan
- Tabel `school_ai_credentials`: ciphertext (AES-256-GCM, envelope), nonce, `last4`, penyedia, status. Kunci master `AI_KEY_ENCRYPTION_SECRET` hanya di Vercel (sensitive).
- RLS: klien tidak bisa membaca ciphertext sama sekali; hanya `last4` dan status lewat view/RPC. Dekripsi hanya di server saat dipanggil.
- Pemakaian dicatat per sekolah (token, model, waktu) tanpa isi percakapan bila tidak perlu; ada batas dan pemutus otomatis.

## Matriks env
| Variabel | Tempat | Tipe |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel (production, preview, development) | plain |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel | plain (publik) |
| `GEMINI_API_KEYS` | Vercel (production, preview) | sensitive |
| `AI_KEY_ENCRYPTION_SECRET` | Vercel (production, preview) | sensitive |
Service-role key tidak dipakai. Migrasi dijalankan lewat tool MCP Supabase.
