/* =====================================================================
   analysis.js — scoring, statistics and report logic (no DOM).
   Used by dashboard.html; also runnable in Node for testing.
   ===================================================================== */
(function (root) {
const DKS = new Set(["Don't know"]);
const UNSCORED_NEUTRAL = new Set(["Undecided", "Undecided / neutral", "Neutral"]);

/* ---------- basic stats ---------- */
const num = a => a.filter(v => typeof v === 'number' && !isNaN(v));
const mean = a => { a = num(a); return a.length ? a.reduce((s, v) => s + v, 0) / a.length : null; };
const sd = a => { a = num(a); if (a.length < 2) return null; const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
const median = a => { a = num(a).sort((x, y) => x - y); if (!a.length) return null; const h = a.length >> 1; return a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2; };
function ranks(a) { const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]); const r = Array(a.length); let i = 0;
  while (i < idx.length) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const avg = (i + j) / 2 + 1; for (let k = i; k <= j; k++) r[idx[k][1]] = avg; i = j + 1; } return r; }
function pearson(x, y) { const mx = mean(x), my = mean(y); let n = 0, dx = 0, dy = 0; for (let i = 0; i < x.length; i++) { n += (x[i] - mx) * (y[i] - my); dx += (x[i] - mx) ** 2; dy += (y[i] - my) ** 2; } return dx && dy ? n / Math.sqrt(dx * dy) : null; }
function spearman(x, y) { const p = x.map((v, i) => [v, y[i]]).filter(([a, b]) => typeof a === 'number' && typeof b === 'number'); if (p.length < 4) return { rho: null, n: p.length };
  const rho = pearson(ranks(p.map(v => v[0])), ranks(p.map(v => v[1]))); const n = p.length;
  const t = rho === null || Math.abs(rho) >= 1 ? null : rho * Math.sqrt((n - 2) / (1 - rho * rho));
  return { rho, n, p: t === null ? null : tTwoSided(t, n - 2) }; }
// two-sided p for Student t via incomplete beta
function tTwoSided(t, df) { const x = df / (df + t * t); return ibeta(x, df / 2, 0.5); }
function ibeta(x, a, b) { if (x <= 0) return 0; if (x >= 1) return 1; const lbeta = lgamma(a + b) - lgamma(a) - lgamma(b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b + lbeta) / a;
  let f = 1, c = 1, d = 0; for (let i = 0; i <= 200; i++) { const m = i >> 1; let num;
    if (i === 0) num = 1; else if (i % 2 === 0) num = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m)); else num = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + num * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; c = 1 + num / c; if (Math.abs(c) < 1e-30) c = 1e-30; const cd = c * d; f *= cd; if (Math.abs(1 - cd) < 1e-8) break; }
  return front * (f - 1); }
function lgamma(z) { const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z, y = z, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp); let ser = 1.000000000190015; for (const c of g) ser += c / ++y; return -tmp + Math.log(2.5066282746310005 * ser / x); }
function cronbach(matrix) { // rows = respondents, cols = items; complete cases only
  const rows = matrix.filter(r => r.every(v => typeof v === 'number')); const k = matrix[0] ? matrix[0].length : 0;
  if (rows.length < 3 || k < 2) return { alpha: null, n: rows.length, k };
  const varr = a => { const m = mean(a); return a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1); };
  const itemVar = Array.from({ length: k }, (_, j) => varr(rows.map(r => r[j]))).reduce((s, v) => s + v, 0);
  const totVar = varr(rows.map(r => r.reduce((s, v) => s + v, 0)));
  return { alpha: totVar ? (k / (k - 1)) * (1 - itemVar / totVar) : null, n: rows.length, k }; }

/* ---------- normalise raw rows ---------- */
function questions() { return root.SURVEY.sections.flatMap(s => s.questions.map(q => Object.assign({ sectionId: s.id, sectionTitle: s.title }, q))); }
function normalise(rawRows) {
  const qs = questions();
  return rawRows.map(r => { const o = { _id: r['Response ID'] || r.id || '', _ts: r['Timestamp'] || '', _min: r['Minutes taken'] || '' };
    for (const q of qs) {
      if (q.type === 'grid' || q.type === 'likert') for (const [rk] of q.rows) o[`${q.id}_${rk}`] = str(r[`${q.id}_${rk}`]);
      else if (q.type === 'multi') { const v = r[q.id]; o[q.id] = Array.isArray(v) ? v : str(v) ? str(v).split(/;\s*/).filter(Boolean) : []; }
      else if (q.type === 'scale') { const v = parseFloat(r[q.id]); o[q.id] = isNaN(v) ? null : v; }
      else o[q.id] = str(r[q.id]);
    } return o; });
}
const str = v => v === undefined || v === null ? '' : String(v).trim();

/* ---------- item scoring ---------- */
// returns {score:number|null, dk:boolean, answered:boolean}
function scoreValue(q, value, rowKey) {
  if (q.type === 'grid' || q.type === 'likert') {
    if (!value) return { score: null, dk: false, answered: false };
    if (DKS.has(value)) return { score: null, dk: true, answered: true };
    const c = q.cols.find(c => c[0] === value); return { score: c ? c[1] : null, dk: false, answered: true };
  }
  if (q.type === 'multi') {
    if (!value.length) return { score: null, dk: false, answered: false };
    if (value.some(v => DKS.has(v))) return { score: null, dk: true, answered: true };
    const opts = value.map(v => q.options.find(o => o[0] === v)).filter(Boolean);
    if (opts.every(o => o[1] === null)) return { score: null, dk: false, answered: true };
    const pos = opts.filter(o => o[1] === 1).length;
    return { score: Math.min(1, pos / (q.target || 1)), dk: false, answered: true };
  }
  if (q.type === 'single') {
    if (!value) return { score: null, dk: false, answered: false };
    if (DKS.has(value)) return { score: null, dk: true, answered: true };
    const o = q.options.find(o => o[0] === value); return { score: o ? o[1] : null, dk: false, answered: true };
  }
  return { score: null, dk: false, answered: value !== '' && value !== null };
}
// question-level score for one respondent (grids averaged over rows)
function qScore(q, r) {
  if (q.type === 'grid' || q.type === 'likert') { const s = q.rows.map(([rk]) => scoreValue(q, r[`${q.id}_${rk}`]).score); return mean(s); }
  return scoreValue(q, r[q.id]).score;
}

/* ---------- full analysis ---------- */
function analyse(rawRows, opts = {}) {
  const S = root.SURVEY, D = root.DOMAINS, qs = questions();
  let rows = normalise(rawRows);
  const allRows = rows;
  if (opts.role) rows = rows.filter(r => r.A2 === opts.role);
  const n = rows.length;

  // per respondent domain indices
  const domainKeys = Object.keys(D);
  const resp = rows.map(r => { const d = {}; for (const dk of domainKeys) { const items = qs.filter(q => q.domain === dk).map(q => qScore(q, r)); const m = mean(items); d[dk] = m === null ? null : m * 100; }
    const practice = domainKeys.filter(k => k !== 'support').map(k => d[k]); d.overall = mean(practice); return { r, d }; });

  const domains = domainKeys.map(k => { const v = resp.map(x => x.d[k]); const qsD = qs.filter(q => q.domain === k);
    // awareness gap: share of "Don't know" among answered factual items in the domain
    let dk = 0, ans = 0; for (const r of rows) for (const q of qsD.filter(q => q.factual)) {
      const vals = (q.type === 'grid' || q.type === 'likert') ? q.rows.map(([rk]) => scoreValue(q, r[`${q.id}_${rk}`])) : [scoreValue(q, r[q.id])];
      for (const s of vals) if (s.answered) { ans++; if (s.dk) dk++; } }
    return { key: k, label: D[k].label, mean: mean(v), sd: sd(v), median: median(v), min: num(v).length ? Math.min(...num(v)) : null, max: num(v).length ? Math.max(...num(v)) : null, n: num(v).length, dkRate: ans ? dk / ans : null, items: qsD.map(q => q.id) }; });
  const overall = { mean: mean(resp.map(x => x.d.overall)), sd: sd(resp.map(x => x.d.overall)), values: resp.map(x => x.d.overall) };

  // per-question distributions
  const items = qs.filter(q => q.type !== 'text').map(q => {
    const base = { q, id: q.id };
    if (q.type === 'textarea') return Object.assign(base, { answers: rows.map(r => ({ text: r[q.id], role: r.A2 })).filter(a => a.text) });
    if (q.type === 'scale') { const v = rows.map(r => r[q.id]); const counts = []; for (let i = q.min; i <= q.max; i++) counts.push({ label: String(i), count: v.filter(x => x === i).length });
      return Object.assign(base, { counts, n: num(v).length, mean: mean(v), sd: sd(v), median: median(v) }); }
    if (q.type === 'grid' || q.type === 'likert') {
      const rowsOut = q.rows.map(([rk, rl]) => { const vals = rows.map(r => r[`${q.id}_${rk}`]).filter(Boolean);
        const sc = vals.map(v => scoreValue(q, v).score); const counts = q.cols.map(([c]) => ({ label: c, count: vals.filter(v => v === c).length }));
        const known = vals.filter(v => !DKS.has(v)); const modal = mode(known);
        return { key: rk, label: rl, counts, n: vals.length, mean: mean(sc), sd: sd(sc), dk: vals.filter(v => DKS.has(v)).length, modal: modal.value, agreement: known.length ? modal.count / known.length : null, knownN: known.length }; });
      return Object.assign(base, { rows: rowsOut, mean: mean(rows.map(r => qScore(q, r))) });
    }
    const vals = rows.map(r => r[q.id]);
    let counts, answered;
    if (q.type === 'multi') { answered = vals.filter(v => v.length).length; counts = q.options.map(([o]) => ({ label: o, count: vals.filter(v => v.includes(o)).length })); }
    else { answered = vals.filter(Boolean).length; counts = q.options.map(([o]) => ({ label: o, count: vals.filter(v => v === o).length })); }
    const known = q.type === 'single' ? vals.filter(v => v && !DKS.has(v)) : []; const modal = mode(known);
    const sc = rows.map(r => scoreValue(q, r[q.id]).score);
    return Object.assign(base, { counts, n: answered, mean: mean(sc), sd: sd(sc), scoredN: num(sc).length,
      dk: q.type === 'multi' ? vals.filter(v => v.includes("Don't know")).length : vals.filter(v => DKS.has(v)).length,
      modal: modal.value, agreement: known.length ? modal.count / known.length : null, knownN: known.length });
  });
  const byId = Object.fromEntries(items.map(i => [i.id, i]));

  // consensus on factual facts (single + grid rows), needs >=3 known answers
  const consensus = [];
  for (const it of items) { if (!it.q.factual) continue;
    if (it.rows) it.rows.forEach(r => r.knownN >= 3 && consensus.push({ id: `${it.id}_${r.key}`, label: `${it.q.short}: ${r.label}`, agreement: r.agreement, modal: r.modal, knownN: r.knownN, dk: r.dk, n: r.n }));
    else if (it.q.type === 'single' && it.knownN >= 3) consensus.push({ id: it.id, label: it.q.short, agreement: it.agreement, modal: it.modal, knownN: it.knownN, dk: it.dk, n: it.n }); }
  consensus.sort((a, b) => a.agreement - b.agreement);

  // roles
  const roles = mode(allRows.map(r => r.A2).filter(Boolean), true).all;
  const roleIdx = Object.entries(groupBy(resp, x => x.r.A2 || 'Not stated')).map(([role, xs]) => ({ role, n: xs.length, overall: mean(xs.map(x => x.d.overall)), support: mean(xs.map(x => x.d.support)) })).sort((a, b) => b.n - a.n);

  // reliability & correlation
  const lik = qs.find(q => q.id === 'H5');
  const alpha = cronbach(rows.map(r => lik.rows.map(([rk]) => scoreValue(lik, r[`H5_${rk}`]).score)));
  const corr = spearman(rows.map(r => r.I1), resp.map(x => x.d.overall));

  // overall DK rate (factual)
  let dkAll = 0, ansAll = 0;
  for (const r of rows) for (const q of qs.filter(q => q.factual)) { const vals = (q.type === 'grid' || q.type === 'likert') ? q.rows.map(([rk]) => scoreValue(q, r[`${q.id}_${rk}`])) : [scoreValue(q, r[q.id])]; for (const s of vals) if (s.answered) { ansAll++; if (s.dk) dkAll++; } }

  return { n, total: allRows.length, rows, resp, domains, overall, items, byId, consensus, roles, roleIdx, alpha, corr, dkRate: ansAll ? dkAll / ansAll : null,
           selfRating: byId.I1, priorities: byId.I2, minutes: median(rows.map(r => parseFloat(r._min)).filter(v => !isNaN(v) && v > 0)) };
}
function mode(arr, all) { const c = {}; arr.forEach(v => c[v] = (c[v] || 0) + 1); const e = Object.entries(c).sort((a, b) => b[1] - a[1]);
  const out = { value: e[0] ? e[0][0] : null, count: e[0] ? e[0][1] : 0 }; if (all) out.all = e.map(([value, count]) => ({ value, count })); return out; }
function groupBy(a, f) { const o = {}; a.forEach(x => (o[f(x)] = o[f(x)] || []).push(x)); return o; }

/* ---------- interpretation ---------- */
const band = v => v === null ? '—' : v >= 70 ? 'Strong' : v >= 40 ? 'Developing' : 'Needs urgent attention';
const pct = (v, d = 0) => v === null || v === undefined ? '—' : (v * 100).toFixed(d) + '%';
const f1 = v => v === null || v === undefined ? '—' : v.toFixed(1);
const f0 = v => v === null || v === undefined ? '—' : Math.round(v).toString();

function topOf(it, k = 1) { return it.counts.filter(c => c.count).sort((a, b) => b.count - a.count).slice(0, k); }
function share(it, label) { const c = it.counts.find(c => c.label === label); return it.n ? (c ? c.count : 0) / it.n : null; }
function supportShare(it) { // share choosing a positive (score>=0.66) option
  if (!it || !it.n) return null; const pos = it.q.options.filter(o => o[1] !== null && o[1] >= 0.66).map(o => o[0]);
  return it.counts.filter(c => pos.includes(c.label)).reduce((s, c) => s + c.count, 0) / it.n; }

function recommendations(A) {
  const I = A.byId, out = [];
  const lowItem = (id, thr) => I[id] && I[id].mean !== null && I[id].mean < thr;
  const add = (priority, area, action, why, horizon) => out.push({ priority, area, action, why, horizon });
  const sc = id => I[id] && I[id].mean !== null ? I[id].mean : null;
  const pr = v => v === null ? 'Medium' : v < 0.34 ? 'High' : 'Medium';

  if (lowItem('B3', 0.6)) add(pr(sc('B3')), 'Waste', 'Introduce colour-coded separation at source — organic / recyclable / general — in every classroom, the cafeteria and offices, with picture labels.', `Separation at source scored ${f0(sc('B3') * 100)}/100.`, '1–3 months');
  if (lowItem('B2', 0.5)) add(pr(sc('B2')), 'Waste', 'Write a one-page school waste policy naming who is responsible for each step, and share it with all staff and students.', `Written-policy score ${f0(sc('B2') * 100)}/100${I.B2.dk ? `; ${I.B2.dk} staff did not know whether one exists` : ''}.`, '1 month');
  if (lowItem('B6', 0.5)) add('Medium', 'Waste', 'Start a weekly student-run waste audit (count or weigh bags per stream) to create a baseline and measure progress.', 'The school does not regularly record how much waste it produces.', 'Start now, ongoing');
  if (lowItem('C1', 0.5)) { const cost = I.C5 ? topOf(I.C5)[0] : null;
    add(supportShare(I.C4) >= 0.6 ? 'High' : 'Medium', 'Biodegradables', 'Run a one-term cafeteria pilot replacing single-use plastic plates, cups and cutlery with compostable or reusable ones, tracking cost and student feedback.',
      `Biodegradable-materials score ${f0(sc('C1') * 100)}/100; ${pct(supportShare(I.C4))} of staff rate compostable trays/utensils as important${cost ? `; most common acceptable cost increase: “${cost.label}”` : ''}.`, '1 term'); }
  if (I.C2) { const b = topOf(I.C2, 2).filter(c => !/^Nothing|Don't know/.test(c.label)); if (b.length) add('Medium', 'Biodegradables', `Address the main barrier${b.length > 1 ? 's' : ''} reported: ${b.map(x => `“${x.label}”`).join(' and ')} — e.g. compare at least three suppliers and request quotes for bulk compostable items.`, `${b.map(x => `${x.count} staff`).join(' / ')} selected ${b.length > 1 ? 'these' : 'this'}.`, '1–2 months'); }
  if (lowItem('D1', 0.6)) add(pr(sc('D1')), 'Laboratories', 'Replace single-use lab plastics with reusable glassware where safe, and trial biodegradable consumables for the rest.', `Lab-plastic score ${f0(sc('D1') * 100)}/100; ${pct(supportShare(I.D3))} support biodegradable lab equipment.`, '1 term');
  if (lowItem('D2', 0.75)) add('High', 'Laboratories', 'Formalise hazardous lab-waste disposal through a licensed service and keep a disposal log.', 'Chemical-waste handling is not consistently safe or known.', '1 month');
  if (I.D4 && supportShare(I.D4) >= 0.5) add('Medium', 'Laboratories', 'Place a clearly labelled bin for clean paper towels in science rooms to feed a compost pile (carbon source).', `${pct(supportShare(I.D4))} of staff support the idea.`, '2 weeks');
  if (lowItem('E1', 0.5)) add(pr(sc('E1')), 'Recycling', 'Partner with a local recycling organisation for plastic, paper, cardboard and cans; set up one collection point on campus.', `Recycling coverage scored ${f0(sc('E1') * 100)}/100.`, '1–2 months');
  if (lowItem('E2', 0.5)) add('Medium', 'Recycling', 'Ask the recycler for collection receipts or weights each month, so the school can prove materials are actually recycled.', 'Recycling is rarely verified.', 'Ongoing');
  if (lowItem('E3', 0.6) && I.E4) { const b = topOf(I.E4)[0]; const map = { 'Bins are not clearly labelled': 'redesign bin labels with pictures of the actual cafeteria items', 'Rushing / not enough time at lunch': 'add student “bin monitors” and a two-minute sorting window at the end of lunch', 'Lack of interest or awareness': 'run a short awareness campaign with a class-vs-class sorting challenge', 'Not enough separate bins': 'add separate bins at every cafeteria exit' };
    add('High', 'Recycling', `Fix lunch-time sorting: ${map[b && b.label] || 'add clear labels, bin monitors and a short awareness campaign'}.`, `Sorting accuracy scored ${f0(sc('E3') * 100)}/100; the most-cited barrier is “${b ? b.label : 'n/a'}”.`, '1 month'); }
  if (lowItem('F1', 0.5)) { const it = I.F1; const weak = it.rows.filter(r => r.mean !== null && r.mean < 0.5).map(r => r.label.toLowerCase()).slice(0, 3);
    add(pr(sc('F1')), 'Water & energy', `Strengthen resource saving, starting with: ${weak.join('; ') || 'switch-off routines and bill tracking'}. Appoint class “energy monitors”.`, `Resource-saving measures scored ${f0(sc('F1') * 100)}/100.`, '1–6 months'); }
  if (lowItem('F3', 0.5)) add('Medium', 'Water & energy', 'Add “last one out, lights & AC off” stickers to every door and a weekly check by student monitors.', 'Lights/AC are often left on in empty rooms.', '2 weeks');
  if (lowItem('F2', 0.66)) add('Medium', 'Water & energy', 'Create a simple leak-reporting channel (QR form or log book) with a target repair time.', 'Leaks are not fixed quickly.', '1 month');
  if (lowItem('G2', 0.6) || lowItem('G3', 0.6)) add('Medium', 'Green spaces', 'Move toward organic fertiliser and minimal, targeted pesticide use; record every chemical application.', `Fertiliser score ${f0((sc('G2') ?? 0) * 100)}/100, pesticide score ${f0((sc('G3') ?? 0) * 100)}/100.`, '1 term');
  if (lowItem('G4', 0.75)) add('High', 'Green spaces', 'Define safe disposal points for cleaning chemicals, paint and waste water away from soil and drains.', 'Some harmful disposal near green areas was reported.', '1 month');
  if (I.G5 && supportShare(I.G5) >= 0.5) { const vol = share(I.G5, 'Yes — and I\'d help manage it'); add('Medium', 'Composting', 'Start an on-campus compost project for cafeteria food waste, used later on school gardens instead of commercial fertiliser.', `${pct(supportShare(I.G5))} support it${vol ? `; ${pct(vol)} would help manage it` : ''}.`, '1 term'); }
  if (lowItem('H1', 0.5)) add(pr(sc('H1')), 'Awareness', 'Launch an eco-club and link at least one unit per grade to the UN Sustainable Development Goals (SDG 6, 7, 12, 13, 15).', `Encouragement score ${f0(sc('H1') * 100)}/100.`, '1 term');
  if (lowItem('H4', 0.5)) add('Medium', 'Awareness', 'Hold a short staff training session on waste sorting, lab waste and energy saving at the start of each term.', `${pct(share(I.H4, 'No'))} of staff received no training in the past two years.`, 'Next term');
  if (lowItem('H2', 0.5)) add('Medium', 'Awareness', 'Agree a consistent, positive follow-up when practices are not followed (reminders, reflection, recognition of good behaviour).', 'Responses show weak or inconsistent follow-up.', '1 month');
  if (A.dkRate !== null && A.dkRate >= 0.2) add('High', 'Communication', 'Share a one-page “How our school handles waste, water and energy” with every staff member — many practices are unknown to staff.', `${pct(A.dkRate)} of factual answers were “Don't know”.`, '2 weeks');
  const disagree = A.consensus.filter(c => c.agreement < 0.6); if (disagree.length) add('Medium', 'Communication', `Clarify the facts staff disagree on: ${disagree.slice(0, 4).map(c => c.label).join('; ')}.`, `${disagree.length} factual item${disagree.length > 1 ? 's have' : ' has'} less than 60% agreement among staff who answered.`, '1 month');
  add('Medium', 'Monitoring', 'Form a small green committee (staff + students) and repeat this interview in 12 months to measure progress against today\'s baseline.', 'Turns this study into a continuous improvement cycle.', '12 months');
  const order = { High: 0, Medium: 1, Low: 2 }; return out.sort((a, b) => order[a.priority] - order[b.priority]);
}

function conclusions(A) {
  const out = [], ds = A.domains.filter(d => d.key !== 'support' && d.mean !== null).sort((a, b) => b.mean - a.mean);
  if (!A.n) return out;
  out.push(`The school's overall Sustainability Practice Index is ${f0(A.overall.mean)}/100 (${band(A.overall.mean).toLowerCase()}), based on ${A.n} staff interviews.`);
  if (ds.length) { out.push(`Strongest area: ${ds[0].label} (${f0(ds[0].mean)}/100). Weakest area: ${ds[ds.length - 1].label} (${f0(ds[ds.length - 1].mean)}/100).`);
    const weak = ds.filter(d => d.mean < 40); if (weak.length) out.push(`${weak.length} area${weak.length > 1 ? 's need' : ' needs'} urgent attention: ${weak.map(d => d.label).join(', ')}.`); }
  const sup = A.domains.find(d => d.key === 'support'); if (sup && sup.mean !== null) out.push(sup.mean >= 60 ? `Staff readiness for change is high (${f0(sup.mean)}/100): there is clear support for biodegradable materials, composting and lab changes — the main gap is implementation, not willingness.` : `Staff readiness for change is moderate (${f0(sup.mean)}/100); awareness-building should come before large changes.`);
  if (A.dkRate !== null) out.push(A.dkRate >= 0.2 ? `${pct(A.dkRate)} of factual answers were “Don't know”, showing that environmental practices are not well communicated across departments.` : `Staff are generally informed about practices (only ${pct(A.dkRate)} “Don't know” answers on factual items).`);
  const dis = A.consensus.filter(c => c.agreement < 0.6); if (dis.length) out.push(`Staff gave conflicting answers on ${dis.length} factual item${dis.length > 1 ? 's' : ''} (e.g. ${dis[0].label}), suggesting practices differ between areas or are unclear.`);
  if (A.selfRating && A.selfRating.mean !== null) out.push(`Staff rate the school's environmental performance ${f1(A.selfRating.mean)}/10 on average${A.overall.mean !== null ? ` — ${A.selfRating.mean * 10 > A.overall.mean + 10 ? 'higher than the measured practice index, suggesting the situation is perceived more positively than practices show' : A.selfRating.mean * 10 < A.overall.mean - 10 ? 'lower than the measured index, suggesting staff are self-critical' : 'consistent with the measured practice index'}` : ''}.`);
  if (A.priorities && A.priorities.n) { const t = topOf(A.priorities, 3); out.push(`Staff's top priorities: ${t.map(x => `${x.label} (${x.count})`).join(', ')}.`); }
  return out;
}

root.Analysis = { analyse, recommendations, conclusions, band, pct, f0, f1, mean, sd, median, spearman, cronbach, topOf, supportShare, share, normalise, scoreValue };
})(typeof window !== 'undefined' ? window : globalThis);
