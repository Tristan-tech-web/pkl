import { ImageResponse } from "next/og";

export const alt = "EduSmart: belajar jadi petualangan, sekolah jadi mudah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Gambar pratinjau saat tautan dibagikan: pulau senja, Pena, dan satu kalimat. Dibuat dari bentuk sederhana, tanpa berkas gambar.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(180deg,#4ab4ff 0%,#d6f1ff 62%)", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", right: 120, top: 70, width: 150, height: 150, borderRadius: 75, background: "#fff7c2", boxShadow: "0 0 0 26px rgba(255,244,180,0.55)" }} />
        <div style={{ position: "absolute", left: -120, bottom: -150, width: 900, height: 420, borderRadius: 450, background: "#4cbf72" }} />
        <div style={{ position: "absolute", right: -160, bottom: -170, width: 900, height: 420, borderRadius: 450, background: "#2fa466" }} />
        <div style={{ position: "absolute", left: 80, top: 90, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: "#0b2540", letterSpacing: 2 }}>EDUSMART</div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 104, fontWeight: 800, lineHeight: 1, color: "#0b2540" }}>Belajar jadi</div>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 800, lineHeight: 1.05, color: "#ff6b8b" }}>petualangan.</div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 34, color: "#1d3d5f" }}>Sekolah digital yang enak dipakai.</div>
        </div>
        <svg width="260" height="260" viewBox="0 0 100 100" style={{ position: "absolute", right: 150, bottom: 70 }}>
          <ellipse cx="50" cy="93" rx="26" ry="4.5" fill="#0a0a1e" opacity=".2" />
          <path d="M16 62c-2 14 10 28 34 28s36-14 34-28c-2-20-12-38-34-38S18 42 16 62z" fill="#1d3fa8" />
          <path d="M30 66c0 12 8 20 20 20s20-8 20-20c-6-4-14-5-20-5s-14 1-20 5z" fill="#fff1db" />
          <circle cx="37" cy="40" r="12" fill="#ffe34d" /><circle cx="63" cy="40" r="12" fill="#ffe34d" />
          <circle cx="37" cy="40" r="10" fill="#fff" /><circle cx="63" cy="40" r="10" fill="#fff" />
          <circle cx="38" cy="41" r="6.5" fill="#1b1a3a" /><circle cx="62" cy="41" r="6.5" fill="#1b1a3a" />
          <circle cx="36" cy="38" r="2.4" fill="#fff" /><circle cx="60" cy="38" r="2.4" fill="#fff" />
          <path d="M46 49h8l-4 7z" fill="#ffe34d" />
          <path d="M26 27l24-12 24 12-24 11z" fill="#14183f" />
        </svg>
      </div>
    ),
    size,
  );
}
