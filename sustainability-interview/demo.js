/* demo.js — generates clearly-labelled FAKE responses so the dashboard can be previewed
   before real data arrives. Never mixed with real data. */
(function (root) {
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function demoRows(count = 12, seed = 7) {
  const R = rng(seed), S = root.SURVEY;
  const pick = (arr, w) => { if (!w) return arr[Math.floor(R() * arr.length)]; const t = w.reduce((a, b) => a + b, 0); let x = R() * t; for (let i = 0; i < arr.length; i++) { x -= w[i]; if (x <= 0) return arr[i]; } return arr[arr.length - 1]; };
  const roles = ['Principal / Director', 'Vice-principal / Section head', 'Administrative staff', 'Administrative staff', 'Facilities / Maintenance / Operations', 'Cafeteria / Canteen management',
    'Science department / Lab', 'Science department / Lab', 'Teacher / Coordinator (other subjects)', 'Teacher / Coordinator (other subjects)', 'Teacher / Coordinator (other subjects)', 'Other'];
  // a "true" school state: each factual question has a likely answer
  const truth = {};
  const texts = {
    B1: ['Cleaners empty classroom bins into large bags at the end of the day; cafeteria waste is bagged separately and everything is left at the gate for municipal collection.', 'Waste is collected twice daily and taken by the municipality truck in the evening.', 'Each floor has a bin, cleaners collect at 2pm, cafeteria waste goes to the back yard container.'],
    G1: ['A gardener waters the plants and trims trees; students are asked not to step on the grass.', 'Irrigation in the morning, some planting days with students.', 'We have a small garden maintained by the facilities team.'],
    I3: ['Separate bins in every classroom.', 'Stop selling drinks in plastic bottles in the canteen.', 'Install solar panels for the generator hours.', 'Start composting the cafeteria food waste.', 'Monthly eco-day with all students.'],
    C3: ['Biodegradable cutlery is more expensive from our supplier.', 'Paper cups are used for hot drinks only.'],
    E5: ['Plastic bottles are sometimes collected by an NGO.', 'Paper from offices is shredded and thrown away.'],
    F4: ['Generator hours are limited; AC switched off after 3pm.', 'We replaced some lights with LED last summer.'],
    H3: ['Mostly the science department and the eco club take responsibility.', 'Management sets rules but follow-up is weak.'],
  };
  const out = [];
  for (let i = 0; i < count; i++) {
    const role = roles[i % roles.length], know = /Facilities|Principal|Cafeteria|Science/.test(role) ? 0.9 : 0.6, row = { 'Response ID': 'DEMO-' + (i + 1), 'Timestamp': new Date(Date.now() - (count - i) * 36e5 * 7).toISOString(), 'Minutes taken': 12 + Math.round(R() * 10) };
    for (const s of S.sections) for (const q of s.questions) {
      if (q.id === 'A1') { row.A1 = ''; continue; }
      if (q.id === 'A2') { row.A2 = role; continue; }
      if (q.type === 'textarea') { row[q.id] = texts[q.id] && R() < 0.8 ? pick(texts[q.id]) : ''; continue; }
      if (q.type === 'scale') { row[q.id] = Math.max(1, Math.min(10, Math.round(5 + (R() - 0.5) * 4))); continue; }
      if (q.type === 'grid' || q.type === 'likert') { for (const [rk] of q.rows) { const key = `${q.id}_${rk}`; const cols = q.cols.map(c => c[0]);
          if (q.factual && R() > know) { row[key] = "Don't know"; continue; }
          if (!(key in truth)) truth[key] = Math.floor(R() * (q.type === 'likert' ? 5 : 3));
          const j = Math.max(0, Math.min(cols.length - (q.type === 'likert' ? 1 : 2), truth[key] + (R() < 0.3 ? (R() < 0.5 ? -1 : 1) : 0)));
          row[key] = cols[j]; } continue; }
      const labels = q.options.map(o => o[0]);
      if (q.type === 'multi') { if (q.factual && R() > know) { row[q.id] = "Don't know"; continue; }
        const pool = labels.filter(l => !/^(None|Nothing|No verification|Don't know)/.test(l)); const k = 1 + Math.floor(R() * Math.min(q.max || 3, pool.length));
        row[q.id] = [...new Set(Array.from({ length: k }, () => pick(pool, pool.map((_, x) => pool.length - x))))].join('; '); continue; }
      if (q.factual && R() > know && labels.includes("Don't know")) { row[q.id] = "Don't know"; continue; }
      const cand = labels.filter(l => l !== "Don't know");
      if (q.factual) { if (!(q.id in truth)) truth[q.id] = Math.floor(R() * cand.length); row[q.id] = R() < 0.72 ? cand[truth[q.id]] : pick(cand); }
      else row[q.id] = pick(cand, cand.map((_, x) => Math.max(1, cand.length - x * 1.2)));
    }
    out.push(row);
  }
  return out;
}
root.demoRows = demoRows;
})(typeof window !== 'undefined' ? window : globalThis);
