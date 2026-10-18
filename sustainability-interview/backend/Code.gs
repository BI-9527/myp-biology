/**
 * Biodegradation & Sustainable Development — Staff Interview
 * Al Hayat International School, Aramoun
 * ------------------------------------------------------------------
 * BACKEND: Google Apps Script bound to a Google Sheet.
 *   POST  (from index.html)      -> appends one response row
 *   GET   ?key=YOUR_KEY          -> returns all responses as JSON (dashboard)
 *   GET   ?action=ping           -> health check (no data)
 *
 * SETUP (full guide in README.md):
 *   1. Create a Google Sheet -> Extensions -> Apps Script -> paste this file.
 *   2. Change DASHBOARD_KEY below to your own secret word.
 *   3. Run setup() once (authorise when asked).
 *   4. Deploy -> New deployment -> Web app
 *        Execute as: Me      Who has access: Anyone
 *   5. Copy the Web app URL into config.js on GitHub.
 */

const DASHBOARD_KEY = 'CHANGE-ME-to-a-secret-word';   // <-- change this
const SHEET_NAME    = 'Responses';
const CODEBOOK_NAME = 'Codebook';
const FIXED_HEADERS = ['Timestamp', 'Response ID', 'Survey version', 'Minutes taken'];

/* ---------------------------------------------------------------- setup */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME, 0);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, FIXED_HEADERS.length).setValues([FIXED_HEADERS]);
  }
  sh.setFrozenRows(1);
  sh.setFrozenColumns(2);
  sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), FIXED_HEADERS.length))
    .setFontWeight('bold').setBackground('#e8f1e4').setWrap(true);

  let cb = ss.getSheetByName(CODEBOOK_NAME);
  if (!cb) cb = ss.insertSheet(CODEBOOK_NAME);
  if (cb.getLastRow() === 0) {
    cb.getRange(1, 1, 1, 4).setValues([['Column key', 'Section', 'Short label', 'Full question']])
      .setFontWeight('bold').setBackground('#e8f1e4');
    cb.setFrozenRows(1);
  }
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
  return 'Setup complete';
}

/* ---------------------------------------------------------------- POST */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.website) return json_({ ok: true });                // honeypot: silently ignore bots
    if (!body.answers || !body.id) return json_({ ok: false, error: 'Malformed submission' });

    setup();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME);

    // Idempotency: the same response ID is never stored twice (safe retries)
    const ids = sh.getLastRow() > 1 ? sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().flat() : [];
    if (ids.indexOf(body.id) !== -1) return json_({ ok: true, duplicate: true });

    // Make sure every answer key has a column (keeps column order stable)
    let headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const keyOf = h => String(h).split(' | ')[0];
    const keys = headers.map(keyOf);
    const order = body.order || Object.keys(body.answers);
    const meta = body.meta || {};
    const newCols = [], codebookRows = [];
    order.forEach(k => {
      if (keys.indexOf(k) === -1) {
        keys.push(k);
        const m = meta[k] || {};
        newCols.push(k + ' | ' + (m.short || k));
        codebookRows.push([k, m.section || '', m.short || '', m.text || '']);
      }
    });
    if (newCols.length) {
      sh.getRange(1, headers.length + 1, 1, newCols.length).setValues([newCols])
        .setFontWeight('bold').setBackground('#e8f1e4').setWrap(true);
      headers = headers.concat(newCols);
      const cb = ss.getSheetByName(CODEBOOK_NAME);
      cb.getRange(cb.getLastRow() + 1, 1, codebookRows.length, 4).setValues(codebookRows);
    }

    const row = keys.map(k => {
      if (k === 'Timestamp') return new Date();
      if (k === 'Response ID') return body.id;
      if (k === 'Survey version') return body.version || '';
      if (k === 'Minutes taken') return body.minutes || '';
      const v = body.answers[k];
      if (v === undefined || v === null) return '';
      return Array.isArray(v) ? v.join('; ') : String(v).slice(0, 5000);
    });
    sh.appendRow(row);
    return json_({ ok: true, row: sh.getLastRow() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------------------------------------- GET */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'ping') return json_({ ok: true, service: 'biodeg-interview' });
  if (p.key !== DASHBOARD_KEY) return json_({ ok: false, error: 'Wrong or missing dashboard key' });

  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) return json_({ ok: true, rows: [], fetchedAt: new Date() });
  const values = sh.getDataRange().getValues();
  const keys = values[0].map(h => String(h).split(' | ')[0]);
  const rows = values.slice(1).map(r => {
    const o = {};
    keys.forEach((k, i) => { o[k] = r[i] instanceof Date ? r[i].toISOString() : r[i]; });
    return o;
  });
  return json_({ ok: true, rows: rows, fetchedAt: new Date() });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
