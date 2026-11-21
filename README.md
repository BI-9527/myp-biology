# Fed by Light — MYP 2 Biology
**Al Hayat International School · Unit: Energy in photosynthesis**

Live at **https://bi-9527.github.io/myp-biology/**

The unit is split into seven pages so a class can be given one part at a time.
Every page is a single self-contained file: no libraries, no fonts to download,
no tracking. Once a page has loaded it keeps working with no internet.

---

## Files

| File | What it is | Give it to students |
|---|---|---|
| `index.html` | **Teacher hub.** Links to every part, with a *Copy student link* button for each. | No — this is your page |
| `overview.html` | Concepts, statement of inquiry, criteria, session plan, leaf anatomy | At the start of the unit |
| `session-1.html` | The four needs · fair testing · Experiment 1, water | Lesson 1 |
| `session-2.html` | The starch test · Experiment 2, sunlight · chlorophyll | Lesson 2 |
| `session-3.html` | Experiment 3, carbon dioxide · Experiment 4, minerals · **Criterion B task** | Lesson 3 |
| `session-4.html` | Outputs · the equation · virtual lab · **Criteria C and D** | Lesson 4 |
| `assessment.html` | 18-question check · self-assessment · reflection · **Export my work** | End of unit |
| `glossary.html` | 26 terms, command terms, sources | At the start — it is reference only |
| `full-unit.html` | The whole unit on one page, unchanged | Your own planning, and the PDF |

---

## How to install it

1. Download the `site` folder.
2. Open your repository **bi-9527/myp-biology** on GitHub.
3. Delete the existing `index.html` (the old whole-unit file — it is preserved
   as `full-unit.html`, so nothing is lost).
4. Choose **Add file → Upload files**, drag in all nine `.html` files, and commit.
5. Wait about a minute. `https://bi-9527.github.io/myp-biology/` now opens the
   teacher hub.

Nothing else changes: the repository stays public, GitHub Pages stays on the
same branch, and the address you already share still works.

### If you would rather keep the whole unit at the main address
Upload the nine files, then rename them: `index.html` → `hub.html` and
`full-unit.html` → `index.html`. The main address then opens the complete unit
and the hub sits at `.../hub.html`.

---

## How the tabs work

Every student page carries a row of tabs across the top. On `session-2.html`,
for example, Overview, Session 1, Session 2 and Glossary are open; Sessions 3
and 4 and the assessment appear dimmed with a padlock and cannot be clicked.
Students can always go back to revise, never forward.

The glossary is treated as reference material, so opening it does not unlock
any session.

### The honest limit
**The padlocks are signposting, not security.** Every file uploaded to GitHub
Pages is public, and a determined student who types `.../session-4.html` will
reach it. If a part must genuinely stay private until a set date, the only real
lock is to **not upload that file until you are ready** — keep it on your
computer and add it on the morning of the lesson. The site works perfectly with
files missing; a locked tab simply stays locked.

---

## Student work

Answers are saved in each student's **own browser on their own device**. You
never see them until the student uses **Export my work** on `assessment.html`,
which downloads one file containing everything they typed in every session,
their lab data and their self-assessment. They send you that file.

Because all seven pages sit at the same address, work typed in Session 1 is
still there in Session 4 and appears in the final export.

If a student changes device or clears their browser data, their work is gone —
tell them to export before the end of the unit.

---

## Notes

- Every page prints as a paper worksheet: the **Print** button strips the
  navigation and the interactive controls.
- The progress ring at the top counts only the activities on the page you are
  looking at.
- Dark mode follows the device setting and can be switched with the **Theme**
  button.
- `fed-by-light-myp2-biology.pdf` is the printable teacher edition of the whole
  unit, with every answer and explanation revealed.

---

Criterion wording on these pages is a school-written task-specific
clarification for MYP 2, matched to the objectives and strands of the MYP
Sciences guide. Read it alongside the official published descriptors from the
IB programme resource centre.

---

## Grade 11 American Program: Photosynthesis

A separate, stand-alone lesson in the folder `grade-11-ap/photosynthesis/`.
It is not part of the MYP 2 tabs or locks, so it can be shared on its own.

**Student link:** https://bi-9527.github.io/myp-biology/grade-11-ap/photosynthesis/

| File | What it is |
|---|---|
| `grade-11-ap/photosynthesis/index.html` | Interactive board page: light reaction (thylakoids, grana) and dark reaction (stroma), animations, simulators, drag-and-drop, answers revealed by the teacher. Self-contained, works offline. |
| `grade-11-ap/photosynthesis/photosynthesis-11AP.pdf` | The 7-page student sheet to print. Question numbers match the board page. |
| `grade-11-ap/photosynthesis/photosynthesis-11AP.tex` | LaTeX source of the PDF (compile with XeLaTeX twice; needs `his-logo.png` beside it and the Inter font). |
| `grade-11-ap/photosynthesis/his-logo.png` | School logo used by the PDF. |

The teacher hub (`index.html`) has a card for it with a *Copy student link* button.

---

## Grade 11 American Program: Cellular Respiration

A stand-alone, six-session lesson in `grade-11-ap/respiration/`, built for the active board. Students follow along in a printed booklet whose question numbers match the pages.

**Student link (mission hub):** https://bi-9527.github.io/myp-biology/grade-11-ap/respiration/

| File | What it is |
|---|---|
| `index.html` | Mission hub: story (Lara's Beirut Marathon), team names, class progress meter, links to the six missions. |
| `1-powerhouse.html` | Session 1: why we breathe, the equation, 3D mitochondrion (cut open, part hunt), 3D ATP battery. |
| `2-glycolysis.html` | Session 2: 3D cell fly-in and glucose split, human-glycolysis role play. |
| `3-krebs.html` | Session 3: dive into the matrix, 3D Krebs wheel releasing CO₂, limewater breath test. |
| `4-etc.html` | Session 4: 3D inner membrane, electron hops, H⁺ pumping, ATP synthase turbine, oxygen slider, cyanide, live graph. |
| `5-fermentation.html` | Session 5: jumping-jack breathing lab, lactic acid and alcoholic fermentation, 3D yeast balloon race, 3D ATP towers. |
| `6-showdown.html` | Session 6: 3D chloroplast–mitochondrion cycle, sorting games, 10-round grand battle, CER, 3D winners' podium. |
| `respiration-11AP.pdf` / `.tex` | 9-page student booklet and its XeLaTeX source (needs the Inter font and `assets/his-logo.png`). |
| `assets/` | Shared styles and classroom kit (`resp.css`, `resp.js`), 3D helpers (`scene3d.js`), and three.js r160 stored locally so no CDN is needed. |

Every page has Stand-up/Sit-down quizzes, team Quiz Battles (answers shuffled each time), a timer, a random team picker and a team ATP scoreboard. Scores and mission progress are saved in the board computer's browser, so they carry over from session to session.

---

## MYP 1 Sciences: Energy Quest

A stand-alone MYP Year 1 unit in `myp-1/energy/` on kinetic and potential energy, energy transformations and renewable and non-renewable resources, assessed with IB MYP Sciences criteria A–D.

**Student link (hub):** https://bi-9527.github.io/myp-biology/myp-1/energy/

| File | What it is |
|---|---|
| `index.html` | Hub: 3D wind-and-solar town, statement of inquiry, concepts, criteria, team setup, links to stations and PDFs. |
| `1-energy-everywhere.html` | Station 1: eight energy stores, 3D neighbourhood energy hunt, sorting game. |
| `2-kinetic-potential.html` | Station 2: 3D skate park with friction and live energy bars, 3D bounce lab. |
| `3-transformations.html` | Station 3: 3D chain-reaction machine, change-makers, device detective, Sankey diagrams, energy relay. |
| `4-renewable.html` | Station 4: renewable sort, 3D power-town game (day/night, demand, CO₂), Lebanon solar vs diesel debate. |
| `5-lab.html` | Station 5: ramp investigation (criteria B and C) with a 3D simulation, data table, anomalies and graph. |
| `6-challenge.html` | Station 6: myth-busters, GRASPS school energy plan (criterion D), grand battle, 3D podium. |
| `energy-student-sheet.pdf` | 8-page student sheet; question numbers match the stations. |
| `energy-quiz.pdf` | Formative quiz (criterion A, 25 marks). |
| `energy-exam.pdf` | Summative test (criteria A–D, 54 marks) with a student-friendly rubric. |
| `print/` | XeLaTeX sources for the three PDFs (`hisstyle.sty`, Inter font). |
| `assets/` | Classroom kit, 3D builders and three.js r160 stored locally. |

The quiz and the test use new contexts, so nothing repeats the student sheet. Answer keys are kept off the public site.

---

## Student research: Biodegradation & Sustainable Development staff interview

A stand-alone online interview for staff, with a live Google Sheets backend and an analysis dashboard. Folder: `sustainability-interview/` (not part of the MYP 2 tabs or locks). Full setup guide: `sustainability-interview/README.md`.

**Interview link (for staff):** https://bi-9527.github.io/myp-biology/sustainability-interview/
**Dashboard (protected by a secret word):** https://bi-9527.github.io/myp-biology/sustainability-interview/dashboard.html

---

## PYP Grade 2 · Animals All Around Us

Live at **https://bi-9527.github.io/myp-biology/pyp-grade-2/animals/**

A 21-slide interactive presentation (Sharing the planet): animal groups, backbone game,
explorer gallery, habitats, food, life cycles, drag-and-drop sorting, riddles, quiz,
taking action and reflection. Read-aloud on every slide, teacher notes with PYP alignment
(press **T**). Photos load from Wikipedia / Wikimedia Commons; emoji cards appear if offline.
