/* =====================================================================
   Cellular Respiration · shared 3D toolkit (three.js r160, vendored)
   stage()        renderer + camera + orbit controls + lights + loop that
                  pauses when the stage is off screen
   label()/pill() crisp text sprites that always face the class
   atom()/mol()   ball-and-stick molecules (CO2, O2, H2O, glucose ring)
   mitochondrion() / chloroplast()  reusable organelle models
   ===================================================================== */
import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import { RoomEnvironment } from './RoomEnvironment.js';
export { THREE };
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ease = t => (t = Math.max(0, Math.min(1, t)), t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
export const lerp = (a, b, t) => a + (b - a) * t;

export const COL = {
  glu: '#2E8B47', pyr: '#E08A00', atp: '#F2361C', adp: '#E25B2B', nadh: '#6A3FC0', nad: '#8A63D2', fadh: '#C2378F',
  co2: '#5B6B7C', o2: '#1F9E97', h2o: '#0FA3D8', hplus: '#00A6D6', elec: '#F8C400', lac: '#B5452B', eth: '#7A8B00', acet: '#C76A00',
  C: '#3a4450', O: '#E4402B', H: '#F4F6F8', P: '#F0A500', N: '#3b6fd6',
  outer: '#F29A55', inner: '#E0612A', matrix: '#FFC98F', thyl: '#58B06B', chloro: '#7CC48C'
};

function webglOK() { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }

export function stage(host, o = {}) {
  if (!webglOK()) {
    host.insertAdjacentHTML('beforeend', '<div class="nogl"><div><b>3D is not available on this computer.</b><br>Try Chrome or Edge, or turn on hardware acceleration in the browser settings.</div></div>');
    return null;
  }
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = o.exposure || 1.0;
  renderer.localClippingEnabled = true;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(o.fov || 40, 1, 0.1, 400);
  camera.position.set(...(o.pos || [0, 0, 12]));
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...(o.target || [0, 0, 0]));
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false;
  controls.enableZoom = o.zoom !== false; controls.rotateSpeed = 0.7;
  controls.autoRotate = !!o.autoRotate && !reduce; controls.autoRotateSpeed = o.autoRotateSpeed || 0.7;
  if (o.minD) controls.minDistance = o.minD; if (o.maxD) controls.maxDistance = o.maxD;
  if (o.lockVertical) { controls.minPolarAngle = Math.PI * 0.28; controls.maxPolarAngle = Math.PI * 0.72; }
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(6, 9, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xa8dcff, 0.7); rim.position.set(-8, -3, -6); scene.add(rim);

  const ticks = []; let visible = true, paused = false; const clock = new THREE.Clock();
  function resize() { const w = host.clientWidth || 800, h = host.clientHeight || 450; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(host); resize();
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0.01 }).observe(host);
  let elapsed = 0, slowT = 0, pr = renderer.getPixelRatio();
  function frame(dt) { if (!paused) { elapsed += dt; for (const f of ticks) f(dt, elapsed); } controls.update(); renderer.render(scene, camera); }
  function loop() {
    requestAnimationFrame(loop);
    const raw = clock.getDelta(), dt = Math.min(0.05, raw);
    if (!visible || document.hidden) return;
    // adaptive quality: weak board PCs drop resolution instead of stuttering
    if (raw > 0.045 && raw < 1) { slowT += raw; if (slowT > 2 && pr > 0.75) { pr = Math.max(0.75, pr - 0.5); renderer.setPixelRatio(pr); resize(); slowT = 0; } } else slowT = Math.max(0, slowT - raw);
    frame(dt);
  }
  loop();
  // hide the "drag to rotate" hint after first interaction
  const hint = host.querySelector('.hint');
  if (hint) renderer.domElement.addEventListener('pointerdown', () => { hint.style.opacity = 0; }, { once: true });
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  // click picking (ignores drags)
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function onPick(getObjects, cb, filter) {
    let sx = 0, sy = 0;
    renderer.domElement.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    renderer.domElement.addEventListener('pointerup', e => {
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) return;
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      let hits = ray.intersectObjects(getObjects(), true);
      if (filter) hits = hits.filter(filter);
      cb(hits[0] || null, e, hits);
    });
  }
  // smooth camera flights
  let flight = null;
  function flyTo(pos, target, dur = 1.6, done) {
    flight = { p0: camera.position.clone(), p1: new THREE.Vector3(...pos), t0: controls.target.clone(), t1: new THREE.Vector3(...target), t: 0, dur, done };
  }
  ticks.push(dt => {
    if (!flight) return;
    flight.t += dt / flight.dur; const k = ease(flight.t);
    camera.position.lerpVectors(flight.p0, flight.p1, k); controls.target.lerpVectors(flight.t0, flight.t1, k);
    if (flight.t >= 1) { const d = flight.done; flight = null; d && d(); }
  });
  const api = { THREE, scene, camera, renderer, controls, host, tick: f => ticks.push(f), onPick, flyTo,
    pause: v => { paused = v; }, get paused() { return paused; },
    /* test hook: run the scene forward by `sec` seconds instantly */
    advance(sec, step = 1 / 30) { for (let k = 0; k < sec / step; k++) { elapsed += step; for (const f of ticks) f(step, elapsed); } controls.update(); renderer.render(scene, camera); } };
  (window.__stages = window.__stages || []).push(api);
  return api;
}

/* ---------- text sprites ---------- */
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
export function label(text, o = {}) {
  const fs = 72, pad = o.bg ? 30 : 8, font = `${o.weight || 800} ${fs}px "Segoe UI", Roboto, system-ui, Arial, sans-serif`;
  const c = document.createElement('canvas'), ctx = c.getContext('2d');
  const lines = String(text).split('\n');
  ctx.font = font; const w = Math.max(...lines.map(l => ctx.measureText(l).width));
  c.width = Math.ceil(w + pad * 2); c.height = Math.ceil(fs * 1.25 * lines.length + pad * 1.2);
  ctx.font = font; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  if (o.bg) { ctx.fillStyle = o.bg; rr(ctx, 4, 4, c.width - 8, c.height - 8, Math.min(c.height / 2 - 4, o.radius || 999)); ctx.fill();
    if (o.border) { ctx.lineWidth = 6; ctx.strokeStyle = o.border; ctx.stroke(); } }
  else { ctx.lineWidth = 14; ctx.strokeStyle = o.stroke || 'rgba(255,255,255,.92)'; lines.forEach((l, i) => ctx.strokeText(l, c.width / 2, pad * .6 + fs * 1.25 * (i + .5))); }
  ctx.fillStyle = o.color || (o.bg ? '#fff' : '#10263F');
  lines.forEach((l, i) => ctx.fillText(l, c.width / 2, pad * .6 + fs * 1.25 * (i + .5)));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: o.depthTest !== false ? !!o.depthTest : false, depthWrite: false, toneMapped: false });
  const s = new THREE.Sprite(mat); const hgt = o.size || 0.5; s.scale.set(hgt * c.width / c.height, hgt, 1);
  s.renderOrder = o.order || 10; s.userData.baseScale = s.scale.clone();
  return s;
}
export const pill = (text, color, size = 0.55) => label(text, { bg: color, size, color: '#fff' });
export function setOpacity(obj, a) { obj.traverse(n => { if (n.material) { n.material.transparent = true; n.material.opacity = a * (n.userData.baseOpacity ?? 1); } }); obj.visible = a > 0.01; }
export function markBase(obj) { obj.traverse(n => { if (n.material) n.userData.baseOpacity = n.material.opacity; }); }

/* ---------- molecules ---------- */
const geoCache = {};
const sph = r => geoCache['s' + r] || (geoCache['s' + r] = new THREE.SphereGeometry(r, 32, 20));
export function mat(color, o = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: o.rough ?? 0.32, metalness: 0, clearcoat: o.clear ?? 0.6, clearcoatRoughness: 0.25,
    transparent: o.opacity != null && o.opacity < 1, opacity: o.opacity ?? 1, emissive: o.emissive || '#000', emissiveIntensity: o.ei ?? 0,
    side: o.side || THREE.FrontSide, depthWrite: o.depthWrite ?? true, clippingPlanes: o.clip || null });
}
export function atom(color, r = 0.3, o) { return new THREE.Mesh(sph(r), mat(color, o)); }
export function bond(a, b, r = 0.08, color = '#c9d2dc') {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), mat(color, { clear: .2 }));
  m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
}
/** generic ball-and-stick: atoms=[[el,x,y,z]], bonds=[[i,j]] */
export function mol(atoms, bonds, s = 1) {
  const g = new THREE.Group(); const R = { C: .32, O: .3, H: .18, P: .36, N: .3 };
  const pos = atoms.map(a => new THREE.Vector3(a[1] * s, a[2] * s, a[3] * s));
  atoms.forEach((a, i) => { const m = atom(COL[a[0]] || a[0], (R[a[0]] || .3) * s); m.position.copy(pos[i]); g.add(m); });
  bonds.forEach(([i, j]) => g.add(bond(pos[i], pos[j], .07 * s)));
  return g;
}
export const CO2 = (s = 1) => mol([['C', 0, 0, 0], ['O', -.62, 0, 0], ['O', .62, 0, 0]], [[0, 1], [0, 2]], s);
export const O2 = (s = 1) => mol([['O', -.3, 0, 0], ['O', .3, 0, 0]], [[0, 1]], s);
export const H2O = (s = 1) => mol([['O', 0, 0, 0], ['H', -.42, -.3, 0], ['H', .42, -.3, 0]], [[0, 1], [0, 2]], s);

/* ---------- organelles ---------- */
/** Mitochondrion, long axis along X. Returns {group, parts:{outer,inner,cristae,matrix,ims}, setCut(z|null)} */
export function mitochondrion(o = {}) {
  const g = new THREE.Group(); const L = o.length || 4.2, R = o.radius || 1.9;
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 99);
  const clip = [plane];
  const outer = new THREE.Mesh(new THREE.CapsuleGeometry(R, L, 20, 64),
    mat(COL.outer, { opacity: .42, side: THREE.DoubleSide, depthWrite: false, clip, rough: .25, clear: 1 }));
  outer.rotation.z = Math.PI / 2; outer.name = 'outer'; outer.renderOrder = 3;
  const ims = new THREE.Mesh(new THREE.CapsuleGeometry(R * .955, L * .99, 16, 48),
    mat('#FFE9A8', { opacity: .18, side: THREE.DoubleSide, depthWrite: false, clip }));
  ims.rotation.z = Math.PI / 2; ims.name = 'ims'; ims.renderOrder = 2;
  const inner = new THREE.Mesh(new THREE.CapsuleGeometry(R * .9, L * .97, 16, 48),
    mat(COL.inner, { opacity: .55, side: THREE.DoubleSide, depthWrite: false, clip }));
  inner.rotation.z = Math.PI / 2; inner.name = 'inner'; inner.renderOrder = 2;
  const matrix = new THREE.Mesh(new THREE.CapsuleGeometry(R * .86, L * .95, 16, 48),
    mat(COL.matrix, { opacity: .35, side: THREE.DoubleSide, depthWrite: false, clip, clear: .2 }));
  matrix.rotation.z = Math.PI / 2; matrix.name = 'matrix'; matrix.renderOrder = 1;
  // cristae: folded "tongues" of inner membrane reaching into the matrix
  const cristae = new THREE.Group(); cristae.name = 'cristae';
  const cm = mat(COL.inner, { rough: .4, clear: .5, clip, side: THREE.DoubleSide });
  const n = o.folds || 9;
  for (let i = 0; i < n; i++) {
    const x = -L * .62 + i * (L * 1.24 / (n - 1)); const up = i % 2 === 0;
    const reach = R * (0.95 + 0.25 * Math.sin(i * 1.7));
    const f = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), cm);
    f.scale.set(0.16, reach * .62, R * .78);
    f.position.set(x, (up ? 1 : -1) * (R * .86 - reach * .55), 0);
    f.rotation.z = (up ? 1 : -1) * 0.12; f.name = 'cristae'; cristae.add(f);
  }
  // DNA loop + ribosomes in the matrix
  const dna = new THREE.Mesh(new THREE.TorusKnotGeometry(.35, .045, 90, 8, 2, 5), mat('#2B6CB0', { clip }));
  dna.position.set(L * .55, 0, R * .2); dna.scale.setScalar(.7); dna.name = 'matrix';
  const ribos = new THREE.Group();
  for (let i = 0; i < 26; i++) { const r = atom('#7a4a2a', .07, { clip }); r.position.set((Math.random() - .5) * L * 1.5, (Math.random() - .5) * R * .9, (Math.random() - .5) * R * 1.1); r.name = 'matrix'; ribos.add(r); }
  g.add(matrix, cristae, dna, ribos, inner, ims, outer);
  function setCut(z) { plane.constant = z == null ? 99 : z; }
  return { group: g, parts: { outer, ims, inner, cristae, matrix }, setCut, plane, L, R };
}

/** Chloroplast (for the photosynthesis link), long axis X */
export function chloroplast(o = {}) {
  const g = new THREE.Group(); const L = o.length || 3.4, R = o.radius || 1.6;
  const shell = new THREE.Mesh(new THREE.CapsuleGeometry(R, L, 16, 48), mat(COL.chloro, { opacity: .35, side: THREE.DoubleSide, depthWrite: false }));
  shell.rotation.z = Math.PI / 2; g.add(shell);
  const disc = new THREE.CylinderGeometry(.42, .42, .1, 28), dm = mat('#2E8B47', { rough: .4 });
  [[-1.8, .3, .2], [-.6, -.4, -.3], [.6, .35, .3], [1.7, -.2, -.1], [-1.1, .7, -.5], [1.1, -.75, .45]].forEach(p => {
    for (let k = 0; k < 6; k++) { const d = new THREE.Mesh(disc, dm); d.position.set(p[0], p[1] - .3 + k * .13, p[2]); g.add(d); }
  });
  return { group: g, shell };
}

/** a soft field of drifting particles (cytoplasm / matrix feel) */
export function particles(n = 160, spread = [16, 9, 8], color = '#8fb3d6', size = .05) {
  const geo = new THREE.BufferGeometry(); const p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * spread[0]; p[i * 3 + 1] = (Math.random() - .5) * spread[1]; p[i * 3 + 2] = (Math.random() - .5) * spread[2]; }
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity: .55, depthWrite: false }));
  pts.userData.drift = (dt) => { pts.rotation.y += dt * .02; };
  return pts;
}

/** glow burst ring that expands and fades; call .update(dt) each frame; returns false when finished */
export function burst(scene, pos, color = '#F8D000', size = 1) {
  const m = new THREE.Mesh(new THREE.RingGeometry(.2, .32, 40), new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  m.position.copy(pos); scene.add(m); let t = 0;
  return { update(dt, cam) { t += dt * 1.6; m.scale.setScalar(size * (1 + t * 4)); m.material.opacity = Math.max(0, 1 - t); if (cam) m.quaternion.copy(cam.quaternion); if (t >= 1) { scene.remove(m); m.geometry.dispose(); return false; } return true; } };
}
