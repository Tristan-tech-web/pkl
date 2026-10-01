import * as THREE from "three";

// Panggung 3D prosedural (tanpa aset unduhan): benda melayang per tema dan maskot "Pena".
// Dimuat dinamis hanya di halaman yang memintanya. Semua objek berpoligon sedikit (≈ < 6 ribu segitiga).
export type SceneId = "kertas" | "angkasa" | "hutan" | "laut" | "kota" | "retro" | "permen";

export type Palette = { pen: THREE.Color; accent: THREE.Color; hi: THREE.Color; card: THREE.Color; ink: THREE.Color; ok: THREE.Color };

export function readPalette(el: Element = document.documentElement): Palette {
  const cs = getComputedStyle(el);
  const c = (v: string, f: string) => new THREE.Color((cs.getPropertyValue(v).trim() || f) as THREE.ColorRepresentation);
  return { pen: c("--pen", "#1d3fa8"), accent: c("--accent", "#d8433b"), hi: c("--hi", "#ffe34d"), card: c("--card", "#ffffff"), ink: c("--ink", "#14213d"), ok: c("--ok", "#1f7a4d") };
}

const mat = (color: THREE.ColorRepresentation, extra: THREE.MeshLambertMaterialParameters = {}) => new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra });
const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

type Floater = { obj: THREE.Object3D; base: THREE.Vector3; nx: number; ny: number; amp: number; speed: number; spin: THREE.Vector3; phase: number };

function buildFloaters(scene: SceneId, p: Palette, quality: 1 | 2): { group: THREE.Group; items: Floater[] } {
  const group = new THREE.Group();
  const items: Floater[] = [];
  const r = rng(7 + scene.length * 13);
  const n = quality === 2 ? 14 : 8;
  const add = (obj: THREE.Object3D, spin = 0.6) => {
    // Posisi diatur sebagai fraksi kanvas (kanan saja: kiri dipakai teks); dihitung ulang tiap ukuran berubah.
    const base = new THREE.Vector3(0, 0, -1 - r() * 4);
    const nx = 0.52 + r() * 0.46, ny = (r() - 0.5) * 1.7;
    obj.position.copy(base);
    obj.rotation.set(r() * 6, r() * 6, r() * 6);
    const s = 0.55 + r() * 0.9;
    obj.scale.setScalar(s);
    group.add(obj);
    items.push({ obj, base, nx, ny, amp: 0.15 + r() * 0.35, speed: 0.4 + r() * 0.7, spin: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(spin), phase: r() * 6.28 });
  };
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const cols = [p.pen, p.accent, p.hi, p.ok];
  for (let i = 0; i < n; i++) {
    const col = pick(cols);
    let o: THREE.Object3D;
    switch (scene) {
      case "angkasa": {
        if (i % 4 === 0) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), mat(col))); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.07, 6, 28), mat(p.hi)); ring.rotation.x = 1.2; g.add(ring); o = g; }
        else if (i % 4 === 1) o = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), mat(p.hi, { emissive: p.hi, emissiveIntensity: 0.35 }));
        else o = new THREE.Mesh(new THREE.SphereGeometry(0.28 + r() * 0.2, 10, 8), mat(col));
        break;
      }
      case "hutan": {
        const g = new THREE.Group();
        if (i % 3 === 0) { g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 6), mat("#8b5a2b"))); const c = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 7), mat(p.ok)); c.position.y = 0.6; g.add(c); }
        else if (i % 3 === 1) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), mat(p.ok)); l.scale.set(1.4, 0.4, 0.9); g.add(l); }
        else { g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), mat(col))); }
        o = g; break;
      }
      case "laut": {
        if (i % 3 === 0) o = new THREE.Mesh(new THREE.SphereGeometry(0.22 + r() * 0.15, 12, 8), mat(p.card, { transparent: true, opacity: 0.55 }));
        else if (i % 3 === 1) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), mat(col)); b.scale.set(1.5, 1, 0.7); g.add(b); const t = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 4), mat(col)); t.position.x = -0.6; t.rotation.z = Math.PI / 2; g.add(t); o = g; }
        else o = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.08, 6, 14), mat(col));
        break;
      }
      case "kota": {
        const h = 0.6 + r() * 1.4;
        o = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, 0.4), mat(i % 2 ? p.pen : p.accent, { emissive: i % 2 ? p.pen : p.accent, emissiveIntensity: 0.28 }));
        break;
      }
      case "retro": {
        if (i % 3 === 0) { o = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 14), mat(p.pen, { emissive: p.pen, emissiveIntensity: 0.25 })); (o as THREE.Mesh).rotation.x = Math.PI / 2; }
        else o = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), mat(col));
        break;
      }
      case "permen": {
        if (i % 3 === 0) o = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.17, 8, 16), mat(col));
        else if (i % 3 === 1) o = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), mat(col));
        else o = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.3, 0.3), mat(col));
        break;
      }
      default: {
        // kertas: pensil, kubus, kerucut, bola: bangun ruang buku matematika
        if (i % 4 === 0) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 6), mat(p.hi))); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 6), mat("#e8c9a0")); tip.position.y = -0.55; tip.rotation.z = Math.PI; g.add(tip); o = g; }
        else if (i % 4 === 1) o = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), mat(col));
        else if (i % 4 === 2) o = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 5), mat(col));
        else o = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), mat(col));
      }
    }
    add(o);
  }
  return { group, items };
}

export type Stage = { dispose: () => void; setScene: (s: SceneId) => void; setPalette: (p: Palette) => void };

/** Medan benda melayang untuk latar. */
export function createFloatField(canvas: HTMLCanvasElement, opts: { scene: SceneId; still: boolean; quality: 1 | 2; palette: Palette; onSlow?: () => void }): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.quality === 2 ? 1.5 : 1));
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
  cam.position.z = 5;
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(2, 3, 4); scene.add(sun);
  let field = buildFloaters(opts.scene, opts.palette, opts.quality);
  scene.add(field.group);
  let palette = opts.palette, id = opts.scene, raf = 0, visible = true, last = 0, slow = 0, frames = 0, disposed = false;

  const layout = () => {
    const halfTan = Math.tan((cam.fov * Math.PI) / 360);
    for (const f of field.items) {
      const depth = cam.position.z - f.base.z, halfH = halfTan * depth, halfW = halfH * cam.aspect;
      f.base.x = (f.nx * 2 - 1) * halfW; f.base.y = f.ny * halfH * 0.85; f.obj.position.x = f.base.x;
    }
  };
  const resize = () => {
    const w = canvas.clientWidth || 300, h = canvas.clientHeight || 200;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); layout();
  };
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
  const draw = (t: number) => {
    for (const f of field.items) {
      f.obj.position.y = f.base.y + Math.sin(t * f.speed + f.phase) * f.amp;
      f.obj.rotation.x += f.spin.x * 0.01; f.obj.rotation.y += f.spin.y * 0.01; f.obj.rotation.z += f.spin.z * 0.01;
    }
    renderer.render(scene, cam);
  };
  const loop = (ms: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    if (ms - last < 33) return; // ≈ 30 fps
    // pemantau kecepatan: jika rata-rata pelan, minta induk mematikan
    if (last && frames++ > 20 && ms - last > 70 && ++slow > 25) { opts.onSlow?.(); }
    last = ms; draw(ms / 1000);
  };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 }); io.observe(canvas);
  if (opts.still) draw(1); else raf = requestAnimationFrame(loop);

  const disposeGroup = (g: THREE.Object3D) => g.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose?.(); const mm = m.material as THREE.Material | THREE.Material[] | undefined; if (Array.isArray(mm)) mm.forEach((x) => x.dispose()); else mm?.dispose?.(); });
  return {
    setScene(s) { if (s === id || disposed) return; id = s; scene.remove(field.group); disposeGroup(field.group); field = buildFloaters(s, palette, opts.quality); scene.add(field.group); layout(); if (opts.still) draw(1); },
    setPalette(p) { palette = p; scene.remove(field.group); disposeGroup(field.group); field = buildFloaters(id, p, opts.quality); scene.add(field.group); layout(); if (opts.still) draw(1); },
    dispose() { disposed = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); disposeGroup(field.group); renderer.dispose(); },
  };
}
