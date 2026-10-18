# Biodegradation & Sustainable Development — Staff Interview
**Al Hayat International School, Aramoun · Student research project**

A complete online interview system: staff answer on any phone or computer (no login, no appointments), answers land live in your Google Sheet, and a private dashboard turns them into statistics, charts and a printable final report.

```
 Staff (phone / laptop)            Google (your account)              You & the student team
┌──────────────────────┐  POST   ┌──────────────────────────┐  GET   ┌───────────────────────────┐
│ index.html           │ ──────► │ Apps Script  (Code.gs)   │ ◄───── │ dashboard.html            │
│ interview, 9 parts   │         │ Google Sheet "Responses" │  key   │ stats · charts · report   │
│ hosted on GitHub     │         │ + "Codebook" sheet       │        │ hosted on GitHub          │
└──────────────────────┘         └──────────────────────────┘        └───────────────────────────┘
```

| File | What it is |
|---|---|
| `index.html` | **The interview** — the link you send to staff |
| `dashboard.html` | **Live analysis** — overview, question-by-question charts, open answers, final report (print → PDF), raw data (CSV) |
| `questions.js` | All 42 questions, scoring and traceability to the students' questions. Edit wording here only |
| `analysis.js` | Statistics: indices, awareness gap, consensus, Spearman, Cronbach's α, conclusions & recommendations |
| `config.js` | Where you paste your backend URL (step 3) |
| `backend/Code.gs` | The Google Sheets backend (step 2) — **not** used by GitHub, you paste it into Google |
| `demo.js` | Fake sample responses for previewing the dashboard (`dashboard.html?demo`) |
| `logo.png` | School logo (copied from the photosynthesis lesson) — appears on both pages |

## Live links
- **Interview (send this to staff):** https://bi-9527.github.io/myp-biology/sustainability-interview/
- **Dashboard (you only):** https://bi-9527.github.io/myp-biology/sustainability-interview/dashboard.html
- **Dashboard preview with fake data:** https://bi-9527.github.io/myp-biology/sustainability-interview/dashboard.html?demo

These files live in the `sustainability-interview/` folder of `BI-9527/myp-biology`, so Step 1 below is already done.

---

## Setup — about 15 minutes, once

### Step 1 · Put the site on GitHub Pages
1. Sign in to github.com → **New repository** → name it e.g. `sustainability-interview` → **Public** → *Create*.
2. On the new repo page click **uploading an existing file**, drag in **all files and the `backend` folder** from this package (plus `logo.png`), then **Commit changes**.
3. Repo → **Settings → Pages** → *Source:* **Deploy from a branch** → Branch **main** / **(root)** → *Save*.
4. After ~1 minute your site is live at
   `https://YOUR-USERNAME.github.io/sustainability-interview/` ← the interview
   `https://YOUR-USERNAME.github.io/sustainability-interview/dashboard.html` ← your dashboard

   Open the interview now: an orange **“Test mode”** badge shows it isn't connected yet. That's expected.

### Step 2 · Create the Google Sheet backend
1. Go to sheets.google.com → **Blank spreadsheet** → name it `Sustainability Interview — Responses`.
2. **Extensions → Apps Script**. Delete the sample code and paste the whole of `backend/Code.gs`.
3. On the line `const DASHBOARD_KEY = 'CHANGE-ME-to-a-secret-word';` replace the text between quotes with your own secret word (e.g. `GreenHayat2026!`). Only people with this word can read results in the dashboard.
4. Click 💾 **Save**. In the function menu choose **setup** → **Run**. Google asks for permission → choose your account → *Advanced* → *Go to (unsafe)* → **Allow**. (It says “unsafe” only because you wrote the script yourself.) Your Sheet now has **Responses** and **Codebook** tabs.
5. **Deploy → New deployment** → ⚙ type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   → **Deploy** → copy the **Web app URL** (ends in `/exec`).

### Step 3 · Connect the two
1. In GitHub open `sustainability-interview/config.js` → ✏ edit → paste the URL between the quotes:
   ```js
   SCRIPT_URL: "https://script.google.com/macros/s/AKfy....../exec",
   ```
2. **Commit changes**. Wait ~1 minute for Pages to update.

### Step 4 · Test it yourself (important!)
1. Open the interview link — the “Test mode” badge must be **gone**.
2. Complete it once as a test (choose role *Other*, write “TEST” in the name).
3. Check the Google Sheet: a new row appears within seconds.
4. Open `dashboard.html`, enter your secret word → you see **Live · 1 response**.
5. Delete the test row from the Sheet (right-click row → Delete row) before sending to staff.

### Step 5 · Send to staff
Send the interview link by email/WhatsApp. Suggested message:

> Dear colleagues, our students are researching biodegradation and sustainability at our school. Please take 15–20 minutes to answer this short staff interview by **[date]**: [link]. You can pause and come back on the same device — your answers are saved as you go. Please answer “Don't know” whenever you're unsure; that is useful information too. Thank you!

Tip: aim for a mix of roles — principal, administration, facilities, cafeteria, science/lab, teachers. Watch the dashboard's *Who answered* chart and send reminders to missing roles.

---

## Using the dashboard
- **Overview** — Sustainability Practice Index (0–100), index per area with spread, readiness for change, awareness gap (“Don't know” rate), staff agreement on facts, priorities, results by role.
- **Question by question** — a chart for every closed question with n, % and score; each question shows which students' question it came from.
- **Open answers** — every written answer with the person's role, plus repeated keywords.
- **Final report** — written automatically from the data: executive summary, method, findings, statistical notes, conclusions, prioritised recommendations, limitations, appendix. **Print / Save as PDF** to share.
- **Raw data** — table + CSV download (opens in Excel/SPSS/Google Sheets).
- **Role filter** (top right) — recalculates everything for one role.
- It refreshes itself every minute.

## How the numbers work
- Each closed answer → a 0–1 score (best practice = 1). Grids are averaged by row. Multi-select practices earn full marks after a set number of good practices.
- **Area index** = mean of item scores per person × 100, then averaged over staff. Bands: **70+ strong · 40–69 developing · <40 urgent**.
- **“Don't know” is never scored** — it's reported as the **awareness gap**, a finding in itself.
- **Agreement** — on factual questions (e.g. “Is waste separated?”) all staff of one school *should* agree. Below 60% agreement flags unclear or inconsistent practice.
- **Readiness for change** is kept separate from practice (support for compostable trays, biodegradable lab equipment, paper-towel compost bin, on-campus compost).
- **Spearman ρ** compares staff's own rating (1–10) with the measured index. **Cronbach's α** checks whether the 7 attitude statements form one scale.
- With ~10–15 people, treat statistics as **descriptive and indicative**; one person changes a percentage by 7–10 points.

## Changing questions later
Edit `questions.js` on GitHub (keep each `id` unchanged once responses exist). New questions get new column automatically in the Sheet. If you change a question's meaning mid-collection, give it a new `id`.

## Troubleshooting
| Problem | Fix |
|---|---|
| “Test mode” badge still shows | `config.js` URL not saved, or Pages hasn't updated yet — wait 1–2 min and hard-refresh |
| Dashboard: “Wrong or missing dashboard key” | Type the exact word from `DASHBOARD_KEY` (case-sensitive) |
| Changed `Code.gs` but nothing changed | Apps Script → **Deploy → Manage deployments** → ✏ → *Version: New version* → Deploy (URL stays the same) |
| Submissions fail | Re-check Step 2.5: *Execute as **Me***, *Access **Anyone*** |
| Want to stop collecting | Apps Script → Deploy → Manage deployments → **Archive** |

## Privacy
Names are optional. The Sheet is private to your Google account; the dashboard needs the secret key; the GitHub site contains no responses. Report results by role and in totals, not by individual.
