"use client";

import { useEffect, useRef, useState } from "react";

// Kehadiran wajah di perangkat (MediaPipe Face Landmarker). Tidak ada gambar atau video yang dikirim atau disimpan:
// hanya dua hitungan ("wajah tidak terlihat" dalam ms, "lebih dari satu wajah" kali) yang ikut terkirim bersama jawaban.
export type FaceStats = { noface_ms: number; multi: number };
export type FaceHandle = { drain: () => FaceStats };
type Status = "memuat" | "aktif" | "gagal";

const TICK_MS = 400;
const NOFACE_GRACE_MS = 2000;   // menunduk sebentar menulis atau berkedip tidak dihitung
const MULTI_COOLDOWN_MS = 4000;

export function FaceGuard({ handleRef, onStatus }: { handleRef: { current: FaceHandle | null }; onStatus?: (s: Status) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>("memuat");
  const stats = useRef<FaceStats>({ noface_ms: 0, multi: 0 });

  useEffect(() => {
    let stopped = false, timer: ReturnType<typeof setInterval> | undefined, stream: MediaStream | undefined;
    handleRef.current = { drain: () => { const s = { ...stats.current }; stats.current = { noface_ms: 0, multi: 0 }; return s; } };
    const set = (s: Status) => { if (!stopped) { setStatus(s); onStatus?.(s); } };
    (async () => {
      try {
        const [{ FaceLandmarker, FilesetResolver }, media] = await Promise.all([
          import("@mediapipe/tasks-vision"),
          navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: "user" }, audio: false }),
        ]);
        stream = media;
        if (stopped) { media.getTracks().forEach((t) => t.stop()); return; }
        const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
        const make = (delegate: "GPU" | "CPU") => FaceLandmarker.createFromOptions(fileset, { baseOptions: { modelAssetPath: "/mediapipe/face_landmarker.task", delegate }, runningMode: "VIDEO", numFaces: 2 });
        const lm = await make("GPU").catch(() => make("CPU"));
        const v = videoRef.current;
        if (!v || stopped) { lm.close(); return; }
        v.srcObject = media; await v.play();
        set("aktif");
        let none = 0, lastMulti = -MULTI_COOLDOWN_MS;
        timer = setInterval(() => {
          if (v.readyState < 2) return;
          const n = lm.detectForVideo(v, performance.now()).faceLandmarks.length;
          if (n === 0) { none += TICK_MS; if (none >= NOFACE_GRACE_MS) stats.current.noface_ms += TICK_MS; } else none = 0;
          if (n >= 2 && performance.now() - lastMulti >= MULTI_COOLDOWN_MS) { stats.current.multi += 1; lastMulti = performance.now(); }
        }, TICK_MS);
      } catch { set("gagal"); }
    })();
    return () => { stopped = true; if (timer) clearInterval(timer); stream?.getTracks().forEach((t) => t.stop()); handleRef.current = null; };
  }, [handleRef, onStatus]);

  return (
    <div className="fixed bottom-3 right-3 z-30 flex items-center gap-2 rounded-box border border-line bg-card p-2 text-xs shadow" role="status" aria-label="Status kamera">
      <video ref={videoRef} muted playsInline className="size-14 rounded-box object-cover" aria-hidden />
      <span className="max-w-32 font-semibold">{status === "aktif" ? "Kamera aktif. Gambar tidak dikirim." : status === "memuat" ? "Menyalakan kamera…" : "Kamera tidak tersedia, lanjut tanpa kamera."}</span>
    </div>
  );
}
