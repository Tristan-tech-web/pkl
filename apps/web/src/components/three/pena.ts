import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { COLOR_HEX, DEFAULT_AVATAR, type Avatar } from "@/lib/avatar";
import type { Palette } from "./kit";

// Maskot "Pena": burung hantu bulat berkacamata bulat dan topi toga, gaya kartun bergaris tepi (cel-shading + outline).
// Seluruhnya prosedural (tanpa aset), ≈ 9 ribu segitiga. Mata mengikuti kursor/jari, berkedip, bernapas, melambai, dan melompat
// dengan peregangan-pemipihan saat ada hadiah atau saat diketuk.
export type Mascot = { dispose: () => void; jump: () => void; oops: () => void; setPalette: (p: Palette) => void; setAvatar: (a: Avatar) => void };

const CREAM = 0xfff1db, CREAM_DARK = 0xf0d9b8, INK = 0x1b1a3a;

function toonGradient(): THREE.DataTexture {
  const t = new THREE.DataTexture(new Uint8Array([88, 88, 88, 255, 160, 160, 160, 255, 215, 215, 215, 255, 255, 255, 255, 255]), 4, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
}

function shadowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d")!; const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, "rgba(10,10,30,0.42)"); g.addColorStop(1, "rgba(10,10,30,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createPena(canvas: HTMLCanvasElement, opts: { still: boolean; quality: 1 | 2; palette: Palette; avatar?: Avatar }): Mascot {
  // Kualitas penuh dulu (antialias + resolusi layar sampai 2×). Penjaga di loop menurunkan resolusi hanya bila perangkat terasa berat.
  const dpr = Math.min(window.devicePixelRatio || 1, opts.quality === 2 ? 2 : 1.5);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(dpr);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 40); cam.position.set(0, 0.2, 7.3); cam.lookAt(0, 0.3, 0);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a90b8, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(2.5, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe9b0, 0.8); rim.position.set(-4, 2, -3); scene.add(rim);

  const grad = toonGradient();
  const toon = (c: THREE.ColorRepresentation) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad });
  const outlineMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  const mats: Record<string, THREE.MeshToonMaterial> = { body: toon(opts.palette.pen), wing: toon(opts.palette.pen), accent: toon(opts.palette.accent), hi: toon(opts.palette.hi), cap: toon(0x222244) };
  const cream = toon(CREAM), creamDark = toon(CREAM_DARK), white = toon(0xffffff), ink = new THREE.MeshBasicMaterial({ color: INK });
  const flat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blush = new THREE.MeshBasicMaterial({ color: opts.palette.accent, transparent: true, opacity: 0.55 });

  const root = new THREE.Group(); scene.add(root);
  const rig = new THREE.Group(); root.add(rig); // dipeluk saat melompat
  const geos: THREE.BufferGeometry[] = [];
  // Bagian badan yang tidak pernah bergerak sendiri ("statis") dikumpulkan lalu digabung per bahan menjadi beberapa mesh saja.
  // Sebelumnya ada puluhan mesh (masing-masing dengan garis tepi) dan tiap mesh = satu panggilan gambar yang membebani CPU HP.
  const statics: THREE.Mesh[] = [];
  let collect = false;
  const mesh = (geo: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, outline = 0): THREE.Mesh => {
    geos.push(geo); const o = new THREE.Mesh(geo, m); parent.add(o); if (collect && parent === rig) statics.push(o);
    if (outline > 0) { const h = new THREE.Mesh(geo, outlineMat); h.scale.setScalar(1 + outline); o.add(h); }
    return o;
  };

  // --- badan: telur lembut (lebih lebar di bawah)
  const bodyGeo = new THREE.SphereGeometry(1, 56, 40);
  { const p = bodyGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = 1 - 0.1 * y; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k * 0.96); p.setY(i, y * 1.05); } bodyGeo.computeVertexNormals(); }
  collect = true;
  mesh(bodyGeo, mats.body, rig, 0.035);

  // --- perut krem + pola bulu
  const belly = mesh(new THREE.SphereGeometry(1, 36, 24), cream, rig); belly.position.set(0, -0.36, 0.5); belly.scale.set(0.7, 0.72, 0.4);
  for (const [x, y, s] of [[-0.24, -0.1, 0.15], [0.24, -0.1, 0.15], [0, -0.02, 0.16], [-0.34, -0.38, 0.14], [0.34, -0.38, 0.14], [-0.12, -0.34, 0.15], [0.12, -0.34, 0.15], [0, -0.62, 0.15], [-0.22, -0.62, 0.13], [0.22, -0.62, 0.13]] as const) {
    const f = mesh(new THREE.SphereGeometry(1, 14, 10), creamDark, rig); f.position.set(x, y - 0.18, 0.855 - Math.abs(x) * 0.25 - (y < -0.5 ? 0.12 : 0)); f.scale.set(s, s * 0.55, 0.05); f.rotation.x = 0.25;
  }

  // --- sisik bulu dada dan sisi badan (biru lebih gelap) supaya dada tidak polos
  const scale = toon(opts.palette.pen); mats.scale = scale;
  for (const [x, y] of [[-0.5, -0.02], [-0.25, 0.0], [0, 0.02], [0.25, 0.0], [0.5, -0.02], [-0.38, -0.2], [-0.13, -0.2], [0.13, -0.2], [0.38, -0.2]] as const) {
    const X = x * 1.15, yu = y / 1.05, k = 1 - 0.1 * yu, Z = k * 0.96 * Math.sqrt(Math.max(0.02, 1 - (X / k) ** 2 - yu ** 2)) + 0.005;
    const f = mesh(new THREE.SphereGeometry(1, 16, 10), scale, rig); f.position.set(X, y, Z); f.scale.set(0.15, 0.08, 0.04); f.rotation.set(0.35, -X * 1.1, -X * 0.6);
  }

  collect = false;
  // --- wajah: cakram krem + mata besar mengkilap
  collect = true; const faceDisc = mesh(new THREE.SphereGeometry(1, 36, 24), cream, rig); collect = false; faceDisc.position.set(0, 0.33, 0.58); faceDisc.scale.set(0.9, 0.5, 0.34);
  const eyes: THREE.Group[] = [], irises: THREE.Group[] = [], glassParts: THREE.Object3D[] = [];
  for (const sx of [-1, 1]) {
    const eye = new THREE.Group(); eye.position.set(sx * 0.4, 0.37, 0.82); eye.rotation.y = sx * 0.2; rig.add(eye); eyes.push(eye);
    const ring = mesh(new THREE.SphereGeometry(0.34, 30, 20), mats.hi, eye, 0.07); ring.scale.set(1, 1, 0.5); glassParts.push(ring);       // bingkai kacamata
    const sclera = mesh(new THREE.SphereGeometry(0.28, 30, 20), white, eye); sclera.scale.set(1, 1, 0.5); sclera.position.z = 0.06;
    const iris = new THREE.Group(); iris.position.z = 0.15; eye.add(iris); irises.push(iris);
    const ir = mesh(new THREE.SphereGeometry(0.19, 24, 16), ink, iris); ir.scale.set(1, 1, 0.45);
    const hl = mesh(new THREE.SphereGeometry(0.065, 12, 8), flat, iris); hl.position.set(-0.06, 0.07, 0.1);
    const hl2 = mesh(new THREE.SphereGeometry(0.03, 10, 8), flat, iris); hl2.position.set(0.07, -0.06, 0.1);
  }
  const bridge = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), mats.hi, rig); bridge.position.set(0, 0.37, 0.9); bridge.rotation.z = Math.PI / 2; glassParts.push(bridge); // jembatan kacamata

  // --- paruh kecil + pipi merona
  collect = true; const beak = mesh(new THREE.ConeGeometry(0.12, 0.26, 20), mats.hi, rig, 0.1); collect = false; beak.position.set(0, 0.12, 0.965); beak.rotation.x = Math.PI / 2 + 0.3; beak.scale.set(1.25, 1, 0.9);
  for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), blush); geos.push(c.geometry); c.position.set(sx * 0.62, 0.1, 0.78); c.scale.set(1.2, 0.8, 0.3); c.rotation.y = sx * 0.5; rig.add(c); statics.push(c); }

  // --- sayap (berporos di bahu agar bisa melambai)
  const wings: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const w = new THREE.Group(); w.position.set(sx * 0.9, 0.12, 0.05); rig.add(w); wings.push(w);
    const m = mesh(new THREE.SphereGeometry(1, 28, 20), mats.wing, w, 0.07); m.scale.set(0.17, 0.46, 0.3); m.position.set(sx * 0.03, -0.38, 0); m.rotation.z = sx * 0.1;
  }

  // --- kaki
  collect = true;
  for (const sx of [-1, 1]) {
    const f = mesh(new THREE.SphereGeometry(1, 18, 12), mats.hi, rig, 0.1); f.scale.set(0.2, 0.09, 0.26); f.position.set(sx * 0.32, -1.04, 0.4);
    for (const t of [-1, 0, 1]) { const toe = mesh(new THREE.SphereGeometry(0.06, 10, 8), mats.hi, rig, 0.1); toe.position.set(sx * 0.32 + t * 0.1, -1.04, 0.64); }
  }
  collect = false;
  {
    const bucket = new Map<THREE.Material, THREE.BufferGeometry[]>();
    const add = (m: THREE.Material, g: THREE.BufferGeometry) => { const l = bucket.get(m); if (l) l.push(g); else bucket.set(m, [g]); };
    for (const o of statics) {
      o.updateMatrix();
      add(o.material as THREE.Material, o.geometry.clone().applyMatrix4(o.matrix));
      const h = o.children[0] as THREE.Mesh | undefined;
      if (h) { h.updateMatrix(); add(h.material as THREE.Material, h.geometry.clone().applyMatrix4(o.matrix.clone().multiply(h.matrix))); }
      rig.remove(o);
    }
    for (const [m, gs] of bucket) {
      const merged = mergeGeometries(gs, false);
      gs.forEach((g) => g.dispose());
      if (merged) { geos.push(merged); rig.add(new THREE.Mesh(merged, m)); }
    }
  }

  // --- jambul telinga + topi toga
  const tufts: THREE.Mesh[] = [];
  for (const sx of [-1, 1]) { const t = mesh(new THREE.CapsuleGeometry(0.09, 0.16, 6, 12), mats.wing, rig, 0.1); t.position.set(sx * 0.74, 0.8, 0.02); t.rotation.z = -sx * 0.95; tufts.push(t); }
  const cap = new THREE.Group(); cap.position.set(0, 1.0, 0.02); cap.rotation.z = 0.1; rig.add(cap);
  const base = mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.26, 28), mats.cap, cap, 0.06); base.position.y = 0.02;
  const board = mesh(new THREE.BoxGeometry(1.2, 0.07, 1.2), mats.cap, cap, 0.06); board.position.y = 0.19; board.rotation.y = Math.PI / 4;
  const button = mesh(new THREE.SphereGeometry(0.06, 12, 8), mats.hi, cap); button.position.y = 0.25;
  const strap = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.85, 6), mats.hi, cap); strap.rotation.z = Math.PI / 2; strap.position.set(0.425, 0.235, 0);
  const tassel = new THREE.Group(); tassel.position.set(0.85, 0.2, 0); cap.add(tassel);
  const cord = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.34, 6), mats.hi, tassel); cord.position.y = -0.17;
  const knot = mesh(new THREE.SphereGeometry(0.065, 12, 8), mats.hi, tassel, 0.14); knot.position.y = -0.37;
  const fringe = mesh(new THREE.ConeGeometry(0.075, 0.22, 12), mats.hi, tassel, 0.12); fringe.position.y = -0.52; fringe.rotation.x = Math.PI;

  // topi alternatif: kupluk berumbai dan mahkota emas
  const beanie = new THREE.Group(); beanie.position.set(0, 0.86, 0.02); rig.add(beanie);
  const dome = mesh(new THREE.SphereGeometry(0.66, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2), mats.accent, beanie, 0.05); dome.scale.set(1, 0.95, 1); dome.position.y = 0.05;
  const band = mesh(new THREE.TorusGeometry(0.64, 0.11, 12, 36), mats.hi, beanie, 0.08); band.rotation.x = Math.PI / 2; band.position.y = 0.06;
  mesh(new THREE.SphereGeometry(0.15, 16, 12), mats.hi, beanie, 0.1).position.y = 0.72;
  const gold = toon(0xffc928);
  const crown = new THREE.Group(); crown.position.set(0, 0.96, 0.02); rig.add(crown);
  mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.2, 24, 1, false), gold, crown, 0.06);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; const sp = mesh(new THREE.ConeGeometry(0.1, 0.3, 4), gold, crown, 0.1); sp.position.set(Math.sin(a) * 0.45, 0.24, Math.cos(a) * 0.45); const jw = mesh(new THREE.SphereGeometry(0.05, 10, 8), mats.accent, crown); jw.position.set(Math.sin(a) * 0.45, 0.42, Math.cos(a) * 0.45); }

  // --- bayangan lembut di tanah
  const shTex = shadowTexture();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }));
  geos.push(shadow.geometry); shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -1.14, 0.1); root.add(shadow);

  // --- interaksi dan animasi
  let tx = 0, ty = 0, raf = 0, visible = true, jumpT = -10, last = 0, nextBlink = 1.6, blinkT = -10, oopsT = -10, waveT = -10, nextWave = 4, disposed = false;
  const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); tx = Math.max(-1, Math.min(1, ((e.clientX - (r.left + r.width / 2)) / Math.max(r.width, 220)) * 1.5)); ty = Math.max(-1, Math.min(1, -((e.clientY - (r.top + r.height / 2)) / Math.max(r.height, 220)) * 1.5)); };
  window.addEventListener("pointermove", onMove, { passive: true });
  const jump = () => { jumpT = performance.now() / 1000; };
  const oops = () => { oopsT = performance.now() / 1000; };
  const onTap = () => jump(); canvas.addEventListener("pointerdown", onTap); canvas.style.cursor = "pointer"; canvas.style.pointerEvents = "auto";
  const resize = () => { const w = canvas.clientWidth || 200, h = canvas.clientHeight || 200; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  const ease = (x: number) => x * x * (3 - 2 * x);
  const draw = (t: number) => {
    // napas dan goyang ringan
    const br = Math.sin(t * 2.1);
    let sy = 1 + br * 0.018, sxz = 1 - br * 0.01, y = Math.sin(t * 1.5) * 0.035, flap = 0, squint = 0;
    // lompat: jongkok → melesat (peregangan) → mendarat (pemipihan) → pantul kecil
    const k = (t - jumpT) / 1.1;
    if (k >= 0 && k < 1.35) {
      if (k < 0.14) { const a = ease(k / 0.14); sy = 1 - 0.16 * a; sxz = 1 + 0.1 * a; y -= 0.07 * a; }
      else if (k < 0.78) { const a = (k - 0.14) / 0.64; y += Math.sin(a * Math.PI) * 0.6; sy = 1 + 0.1 * Math.sin(a * Math.PI); sxz = 1 - 0.05 * Math.sin(a * Math.PI); flap = Math.sin(a * 22) * 0.7 + 0.8; squint = 1; }
      else { const a = (k - 0.78) / 0.57; const d = Math.exp(-a * 3.5) * Math.cos(a * 11); sy = 1 - 0.14 * d; sxz = 1 + 0.08 * d; squint = Math.max(0, 1 - a * 1.6); }
    }
    // salah jawab: kepala miring sebentar, badan sedikit menunduk, mata menyipit, sayap terkulai (lalu pulih)
    const ko = (t - oopsT) / 1.3; let droop = 0, tilt = 0;
    if (ko >= 0 && ko < 1) { const e = Math.sin(Math.PI * Math.min(1, ko * 1.15)); droop = e; tilt = e * 0.32; y -= 0.045 * e; sy -= 0.03 * e; squint = Math.max(squint, 0.35 * e); }
    root.position.y = y; rig.scale.set(sxz, sy, sxz); rig.position.y = (1 - sy) * -1.0;
    const air = Math.max(0, y); const s = 1 - Math.min(0.5, air * 0.35); shadow.scale.set(s, s, s); (shadow.material as THREE.MeshBasicMaterial).opacity = 1 - Math.min(0.6, air * 0.5);
    // kepala/badan menoleh ke penunjuk
    rig.rotation.y += (tx * 0.55 - rig.rotation.y) * 0.1; rig.rotation.x += (-ty * 0.22 - rig.rotation.x) * 0.1; rig.rotation.z += (-tx * 0.05 + tilt - rig.rotation.z) * 0.1;
    for (const ir of irises) { ir.position.x += (tx * 0.06 - ir.position.x) * 0.25; ir.position.y += (ty * 0.06 - ir.position.y) * 0.25; }
    // kedip dan mata senang
    if (t > nextBlink) { blinkT = t; nextBlink = t + 2 + Math.random() * 3.2; }
    const blink = t - blinkT < 0.14 ? 0.08 : 1; const open = Math.min(blink, 1 - squint * 0.62);
    for (const e of eyes) e.scale.y += (open - e.scale.y) * 0.45;
    // lambaian sayap: sesekali sendiri, cepat saat lompat
    if (t > nextWave) { waveT = t; nextWave = t + 6 + Math.random() * 5; }
    const wv = t - waveT < 1.3 ? Math.sin((t - waveT) * 11) * 0.35 + 0.9 : 0;
    wings[0].rotation.z = 0.12 + flap * 0.5 - droop * 0.28; wings[1].rotation.z = -0.12 - (wv + flap * 0.5) * (1) + Math.sin(t * 2.1) * 0.03 + droop * 0.28;
    wings[0].rotation.z += Math.sin(t * 2.1 + 1) * 0.03;
    tufts[0].rotation.z = 0.95 + Math.sin(t * 3.1) * 0.03 + squint * 0.2; tufts[1].rotation.z = -0.95 - Math.sin(t * 2.7) * 0.03 - squint * 0.2;
    tassel.rotation.z = Math.sin(t * 2.4) * 0.09 - rig.rotation.y * 0.25 + (k >= 0 && k < 1 ? Math.sin(k * 20) * 0.3 * (1 - k) : 0);
    cap.rotation.z = 0.1 + Math.sin(t * 1.5) * 0.01;
    renderer.render(scene, cam);
  };
  // Penjaga kualitas: Pena digambar sepenuh kecepatan layar. Hanya bila rata-rata bingkai terlalu lambat, resolusi kanvas
  // diturunkan bertahap (sampai 1×); bila masih lambat, Pena berhenti bergerak dan tampil sebagai satu gambar diam.
  let ratio = dpr, avg = 16.7, slowRun = 0, lastTick = 0;
  // Saat halaman sedang digulir, Pena cukup digambar ~30 fps agar gulir tetap ringan.
  let scrolling = false, scrollTimer = 0;
  const onScroll = () => { scrolling = true; clearTimeout(scrollTimer); scrollTimer = window.setTimeout(() => { scrolling = false; }, 140); };
  window.addEventListener("scroll", onScroll, { passive: true });
  const loop = (ms: number) => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) { lastTick = 0; return; }
    if (scrolling && ms - last < 30) return;
    if (lastTick) {
      const dt = Math.min(ms - lastTick, 200);
      avg += (dt - avg) * 0.08;
      const want = scrolling ? 36 : 25; // batas "lambat": bingkai rata-rata lebih lama dari ini
      if (avg > want) slowRun++; else slowRun = Math.max(0, slowRun - 2);
      if (slowRun > 45) {
        slowRun = 0; avg = 16.7;
        if (ratio > 1) { ratio = Math.max(1, ratio - 0.25); renderer.setPixelRatio(ratio); resize(); }
        else { cancelAnimationFrame(raf); draw(0.7); return; }
      }
    }
    lastTick = ms; last = ms; draw(ms / 1000);
  };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 }); io.observe(canvas);
  if (opts.still) draw(0.7); else raf = requestAnimationFrame(loop);

  let curPalette = opts.palette, avatar: Avatar = opts.avatar ?? DEFAULT_AVATAR;
  const apply = () => {
    const n = curPalette;
    const bodyCol = avatar.color === "tema" ? n.pen : new THREE.Color(COLOR_HEX[avatar.color]);
    mats.body.color.copy(bodyCol); mats.wing.color.copy(bodyCol).multiplyScalar(0.78); mats.scale.color.copy(bodyCol).multiplyScalar(0.72);
    mats.accent.color.copy(n.accent); mats.hi.color.copy(n.hi); blush.color.copy(n.accent); mats.cap.color.copy(bodyCol).multiplyScalar(0.28);
    cap.visible = tassel.visible = avatar.hat === "toga"; beanie.visible = avatar.hat === "kupluk"; crown.visible = avatar.hat === "mahkota";
    for (const g of glassParts) g.visible = avatar.glasses;
    if (opts.still) draw(0.7);
  };
  const setPalette = (n: Palette) => { curPalette = n; apply(); };
  const setAvatar = (a: Avatar) => { avatar = a; apply(); };
  apply();
  const dispose = () => {
    if (disposed) return; disposed = true; cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll); clearTimeout(scrollTimer); canvas.removeEventListener("pointerdown", onTap);
    ro.disconnect(); io.disconnect(); geos.forEach((g) => g.dispose()); [grad, shTex].forEach((t) => t.dispose());
    [...Object.values(mats), cream, creamDark, white, ink, flat, blush, outlineMat, shadow.material as THREE.Material].forEach((m) => m.dispose()); renderer.dispose();
  };
  return { dispose, jump, oops, setPalette, setAvatar };
}
