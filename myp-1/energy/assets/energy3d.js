/* =====================================================================
   Energy Quest · 3D builders for town, park and power-station objects.
   All models are simple shapes so they run on ordinary school PCs.
   ===================================================================== */
import { THREE, mat, atom, label } from './scene3d.js';
export const E = { kin: '#EA580C', gpe: '#1D4ED8', ela: '#7C3AED', che: '#15803D', the: '#DC2626', lig: '#E0A800', sou: '#DB2777', ele: '#0284C7', ren: '#16A34A', non: '#57534E' };
export const ENAME = { kin: 'kinetic', gpe: 'gravitational potential', ela: 'elastic potential', che: 'chemical', the: 'thermal', lig: 'light', sou: 'sound', ele: 'electrical' };

const box = (w, h, d, c, o) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, Object.assign({ clear: .2, rough: .6 }, o)));
const cyl = (rt, rb, h, c, seg = 24, o) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(c, Object.assign({ clear: .2, rough: .5 }, o)));

export function ground(w = 40, d = 30, c = '#B9D99A') { const g = new THREE.Mesh(new THREE.BoxGeometry(w, .4, d), mat(c, { clear: 0, rough: .9 })); g.position.y = -.2; return g; }

export function house(wall = '#F5E6C8', roof = '#C2410C') {
  const g = new THREE.Group();
  const b = box(2.2, 1.6, 2, wall); b.position.y = .8; g.add(b);
  const r = new THREE.Mesh(new THREE.ConeGeometry(1.75, 1.0, 4), mat(roof, { rough: .6, clear: .1 })); r.position.y = 2.1; r.rotation.y = Math.PI / 4; r.scale.set(1, 1, .92); g.add(r);
  const door = box(.45, .8, .05, '#7C4A1E'); door.position.set(0, .4, 1.01); g.add(door);
  const winMat = new THREE.MeshStandardMaterial({ color: '#334155', emissive: '#FFD54A', emissiveIntensity: 0 });
  [-.65, .65].forEach(x => { const w = new THREE.Mesh(new THREE.BoxGeometry(.45, .4, .05), winMat); w.position.set(x, 1.05, 1.01); g.add(w); });
  g.userData.win = winMat; return g;
}
export function tree(s = 1) {
  const g = new THREE.Group(); const t = cyl(.12, .16, .9, '#7C4A1E', 10); t.position.y = .45; g.add(t);
  const c = new THREE.Mesh(new THREE.IcosahedronGeometry(.7, 1), mat('#2F8F46', { rough: .8, clear: 0 })); c.position.y = 1.35; g.add(c);
  g.scale.setScalar(s); return g;
}
export function sun(r = 1) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), new THREE.MeshBasicMaterial({ color: '#FFC400', toneMapped: false })));
  const halo = new THREE.Mesh(new THREE.SphereGeometry(r * 1.6, 32, 20), new THREE.MeshBasicMaterial({ color: '#FFE680', transparent: true, opacity: .3, toneMapped: false, depthWrite: false }));
  g.add(halo); return g;
}
export function windTurbine(h = 4) {
  const g = new THREE.Group();
  const tower = cyl(.08, .16, h, '#F1F5F9', 16); tower.position.y = h / 2; g.add(tower);
  const nac = box(.5, .3, .3, '#E2E8F0'); nac.position.set(0, h, 0); g.add(nac);
  const rotor = new THREE.Group(); rotor.position.set(0, h, .2); g.add(rotor);
  for (let i = 0; i < 3; i++) { const b = box(.12, 1.7, .04, '#FFFFFF'); b.position.y = .85; const arm = new THREE.Group(); arm.add(b); arm.rotation.z = i * Math.PI * 2 / 3; rotor.add(arm); }
  rotor.add(atom('#CBD5E1', .12));
  g.userData.rotor = rotor; return g;
}
export function solarPanel() {
  const g = new THREE.Group();
  const leg = cyl(.05, .05, .7, '#94A3B8', 8); leg.position.y = .35; g.add(leg);
  const p = new THREE.Mesh(new THREE.BoxGeometry(1.6, .06, 1), new THREE.MeshPhysicalMaterial({ color: '#1E3A8A', roughness: .15, metalness: .3, clearcoat: 1, emissive: '#60A5FA', emissiveIntensity: 0 }));
  p.position.y = .75; p.rotation.x = -.5; g.add(p);
  const grid = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6, .061, 1, 4, 1, 3)), new THREE.LineBasicMaterial({ color: '#93C5FD' })); grid.position.copy(p.position); grid.rotation.copy(p.rotation); g.add(grid);
  g.userData.panel = p.material; return g;
}
export function solarFarm() { const g = new THREE.Group(); const mats = []; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const s = solarPanel(); s.position.set(i * 1.8 - .9, 0, j * 1.3 - .65); g.add(s); mats.push(s.userData.panel); } g.userData.panels = mats; return g; }
export function windFarm() { const g = new THREE.Group(); const rotors = []; [[-1, 0], [1, .5], [0, -1]].forEach(([x, z]) => { const t = windTurbine(3.2); t.position.set(x, 0, z); t.scale.setScalar(.8); g.add(t); rotors.push(t.userData.rotor); }); g.userData.rotors = rotors; return g; }
export function powerPlant(color = '#78716C') {
  const g = new THREE.Group();
  const b = box(2, 1.2, 1.4, '#A8A29E'); b.position.y = .6; g.add(b);
  const ch = cyl(.22, .3, 2.6, color, 16); ch.position.set(.6, 1.3, 0); g.add(ch);
  const ring = cyl(.24, .24, .2, '#DC2626', 16); ring.position.set(.6, 2.45, 0); g.add(ring);
  g.userData.chimneyTop = new THREE.Vector3(.6, 2.7, 0); return g;
}
export function generator() {
  const g = new THREE.Group(); const b = box(1.3, .8, .8, '#166534'); b.position.y = .4; g.add(b);
  const pipe = cyl(.07, .07, .6, '#334155', 8); pipe.position.set(.45, 1.0, 0); g.add(pipe);
  g.userData.chimneyTop = new THREE.Vector3(.45, 1.35, 0); return g;
}
export function dam() {
  const g = new THREE.Group(); const w = box(3, 1.6, .5, '#CBD5E1'); w.position.y = .8; g.add(w);
  const lake = new THREE.Mesh(new THREE.BoxGeometry(3, .9, 2.2), mat('#38BDF8', { opacity: .75, clear: 1, rough: .1 })); lake.position.set(0, .45, -1.35); g.add(lake);
  const out = new THREE.Mesh(new THREE.BoxGeometry(.5, .25, 1.6), mat('#7DD3FC', { opacity: .8 })); out.position.set(0, .12, 1.05); g.add(out);
  return g;
}
export function car(c = '#EF4444') {
  const g = new THREE.Group(); const b = box(1.6, .45, .8, c, { clear: .9, rough: .25 }); b.position.y = .4; g.add(b);
  const cab = box(.8, .35, .7, '#E2E8F0', { clear: .9, rough: .2 }); cab.position.set(-.1, .78, 0); g.add(cab);
  const wheels = [];
  [[-.5, .4], [.5, .4], [-.5, -.4], [.5, -.4]].forEach(([x, z]) => { const w = cyl(.2, .2, .14, '#111827', 18); w.rotation.x = Math.PI / 2; w.position.set(x, .2, z); g.add(w); wheels.push(w); });
  g.userData.wheels = wheels; return g;
}
/** smoke puffs: call .update(dt) each frame */
export function smoke(scene, origin, rate = 2, color = '#6B7280') {
  const puffs = []; let acc = 0; const geo = new THREE.SphereGeometry(.22, 10, 8);
  return {
    rate, update(dt, k = 1) {
      acc += dt * this.rate * k;
      while (acc > 1) { acc--; const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, transparent: true, opacity: .55, depthWrite: false })); m.position.copy(origin()); scene.add(m); puffs.push({ m, t: 0 }); }
      for (let i = puffs.length - 1; i >= 0; i--) { const p = puffs[i]; p.t += dt; p.m.position.y += dt * .8; p.m.position.x += dt * .35; p.m.scale.setScalar(1 + p.t * 1.4); p.m.material.opacity = Math.max(0, .55 - p.t * .18); if (p.t > 3) { scene.remove(p.m); p.m.material.dispose(); puffs.splice(i, 1); } }
    }
  };
}
export { label };
