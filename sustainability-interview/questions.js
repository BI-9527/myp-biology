/* =====================================================================
   Biodegradation & Sustainable Development — Staff Interview
   Al Hayat International School, Aramoun, Lebanon
   ---------------------------------------------------------------------
   SINGLE SOURCE OF TRUTH. Both index.html (interview) and dashboard.html
   (analysis) read this file. Edit wording here and both update.

   Question fields
     id       unique key (also the column name prefix in the Google Sheet)
     type     text | textarea | single | multi | grid | likert | scale
     text     full question as respondents see it
     short    short label for charts and Sheet headers
     help     optional hint under the question
     options  for single/multi: [label, score]  score 0..1, null = not scored
              (Don't know / N/A are never scored; they feed the awareness metric)
     rows     for grid/likert: [key, label]
     cols     for grid: [label, score]
     domain   which index the item feeds (see DOMAINS)
     factual  true = a fact about the school; staff SHOULD agree, so the
              dashboard measures consensus (disagreement = communication gap)
     origin   traceability to the students' brainstorm:
              "SW#" = students' written question #, "SF#" = students' Google Form
              question #, "ADD" = added by the research design
     max      for multi: maximum selections
     target   for scored multi: number of good practices that earns a full score
   ===================================================================== */

const DK = "Don't know";

window.SURVEY = {
  version: "1.0 (Oct 2026)",
  title: "Biodegradation & Sustainable Development at School",
  subtitle: "Staff interview",
  school: "Al Hayat International School — Aramoun, Lebanon",
  minutes: "15–20",
  intro:
    "This interview was built from questions our students asked about how our school handles waste, " +
    "biodegradable materials, resources and environmental education. There are no right or wrong answers: " +
    "we want an honest picture of what happens today, so please choose “Don't know” whenever you are not sure — " +
    "that answer is valuable too. Your progress is saved on this device, so you can stop and return any time.",
  consent:
    "I understand my answers will be used by the student research team for a school report. " +
    "Results are reported by role and as group totals; individual answers are not published with names.",

  sections: [
    /* ------------------------------------------------------------- A */
    {
      id: "A", title: "About you", icon: "person",
      intro: "So we can compare views across departments. Your name is optional.",
      questions: [
        { id: "A1", type: "text", short: "Name (optional)", text: "Your name (optional)", required: false },
        { id: "A2", type: "single", short: "Role", required: true,
          text: "Which best describes your main role at the school?",
          options: [["Principal / Director", null], ["Vice-principal / Section head", null],
                    ["Administrative staff", null], ["Facilities / Maintenance / Operations", null],
                    ["Cafeteria / Canteen management", null], ["Science department / Lab", null],
                    ["Teacher / Coordinator (other subjects)", null], ["Other", null]] },
        { id: "A3", type: "single", short: "Years at school", required: true,
          text: "How long have you worked at this school?",
          options: [["Less than 1 year", null], ["1–3 years", null], ["4–10 years", null], ["More than 10 years", null]] },
        { id: "A4", type: "multi", short: "Responsibilities", required: false,
          text: "Which areas are you directly responsible for or involved in? (select all that apply)",
          options: [["Waste & cleaning", null], ["Purchasing / suppliers", null], ["Cafeteria", null],
                    ["Science labs", null], ["Buildings, water & electricity", null], ["Gardens & grounds", null],
                    ["Student activities / clubs", null], ["Curriculum & teaching", null], ["None of these", null]] },
      ],
    },

    /* ------------------------------------------------------------- B */
    {
      id: "B", title: "Daily waste management", icon: "trash",
      intro: "From classrooms and the cafeteria to final collection and disposal.",
      questions: [
        { id: "B1", type: "textarea", short: "Daily waste journey", origin: "SW1", required: true,
          text: "Please describe how the school manages its waste on a normal day — from classrooms and the cafeteria to final collection and disposal.",
          help: "Who collects it, where it is stored, who takes it away and where it ends up." },
        { id: "B2", type: "single", short: "Written waste policy", origin: "ADD", domain: "waste", factual: true, required: true,
          text: "Does the school have a written waste-management policy or procedure?",
          options: [["Yes, written and applied", 1], ["Yes, but rarely applied", 0.5], ["Being prepared", 0.25], ["No", 0], [DK, null]] },
        { id: "B3", type: "single", short: "Separation at source", origin: "ADD", domain: "waste", factual: true, required: true,
          text: "Is waste separated where it is produced (classrooms, cafeteria, offices)?",
          options: [["Yes, in all areas", 1], ["Yes, in some areas", 0.5], ["No, everything goes in one bin", 0], [DK, null]] },
        { id: "B4", type: "single", short: "Largest waste type", origin: "ADD", factual: true, required: true,
          text: "In your estimate, which type of waste does the school produce the most of?",
          options: [["Food / organic waste", null], ["Paper & cardboard", null], ["Plastic (bottles, wrappers, cups)", null],
                    ["Lab & chemical waste", null], ["Other", null], [DK, null]] },
        { id: "B5", type: "multi", short: "Final destination", origin: "SW1", factual: true, required: true,
          text: "Where does the school's waste finally go? (select all that apply)",
          options: [["Municipal collection", null], ["Private waste contractor", null], ["Recycling company / NGO", null],
                    ["Composted on campus", null], ["Burned or dumped", null], [DK, null]] },
        { id: "B6", type: "single", short: "Waste data recorded", origin: "ADD", domain: "waste", factual: true, required: true,
          text: "Does the school measure or record how much waste it produces (weight, bags, bins per week)?",
          options: [["Yes, regularly", 1], ["Occasionally", 0.5], ["No", 0], [DK, null]] },
      ],
    },

    /* ------------------------------------------------------------- C */
    {
      id: "C", title: "Biodegradable materials", icon: "leaf",
      intro: "Packaging, plates, cups and utensils used across the school.",
      questions: [
        { id: "C1", type: "multi", target: 3, short: "Biodegradable items used", origin: "SW2", domain: "materials", factual: true, required: true,
          text: "Which of these biodegradable or reusable items does the school currently use? (select all that apply)",
                    options: [["Paper packaging / bags", 1], ["Compostable plates or cups", 1], ["Wooden or bamboo utensils", 1],
                    ["Paper straws", 1], ["Reusable trays, cups or cutlery", 1], ["None of these", 0], [DK, null]] },
        { id: "C2", type: "multi", short: "Barriers to biodegradables", origin: "SW2", required: true,
          text: "What prevents the school from using (more) biodegradable materials? (select all that apply)",
          options: [["Higher cost", null], ["Not easily available from suppliers in Lebanon", null], ["Existing supplier contracts", null],
                    ["Doubts about durability or hygiene", null], ["Lack of awareness / information", null],
                    ["Not considered a priority", null], ["Nothing — we already use them widely", null], [DK, null]] },
        { id: "C3", type: "textarea", short: "Biodegradables — comments", origin: "SW2", required: false,
          text: "Any details about the materials the school uses, or what would make switching to biodegradable ones possible?" },
        { id: "C4", type: "single", short: "Compostable trays & utensils", origin: "SF6", domain: "support", required: true,
          text: "If the school provided certified compostable cafeteria trays and utensils (made from plant materials), how important would that be to you?",
          options: [["Highly important", 1], ["Important, but only if it doesn't raise prices for students", 0.66],
                    ["Not important — the material doesn't matter", 0], ["Undecided", null]] },
        { id: "C5", type: "single", short: "Acceptable cost increase", origin: "ADD", required: true,
          text: "What cost increase would be acceptable to switch cafeteria items to biodegradable ones?",
          options: [["None", null], ["Up to 5%", null], ["5–10%", null], ["More than 10%", null], [DK, null]] },
      ],
    },

    /* ------------------------------------------------------------- D */
    {
      id: "D", title: "Science laboratories", icon: "flask",
      intro: "Lab staff and science teachers will know most here — others, please use “Don't know” freely.",
      questions: [
        { id: "D1", type: "single", short: "Lab plastics in general trash", origin: "SF1", domain: "labs", factual: true, required: true,
          text: "How often does single-use lab plastic (petri dishes, pipettes, plastic vials) end up in the general trash?",
          options: [["Every lab session", 0], ["Frequently", 0.33], ["Rarely", 0.66], ["Never", 1], [DK, null]] },
        { id: "D2", type: "single", short: "Chemical waste disposal", origin: "ADD", domain: "labs", factual: true, required: true,
          text: "How are chemical and hazardous lab wastes disposed of?",
          options: [["Collected by a licensed hazardous-waste service", 1], ["Neutralised / treated, then disposed safely", 0.75],
                    ["Poured down the sink or put in general trash", 0], ["The school produces almost none", null], [DK, null]] },
        { id: "D3", type: "single", short: "Biodegradable lab equipment", origin: "SF2", domain: "support", required: true,
          text: "If the science department moved to biodegradable, plant-based lab equipment, would you support the change?",
          options: [["Yes, strongly support", 1], ["Yes, somewhat support", 0.66], ["Undecided / neutral", null], ["No, it seems unnecessary", 0]] },
        { id: "D4", type: "single", short: "Paper-towel compost bin", origin: "SF3", domain: "support", required: true,
          text: "Would you support a designated bin in science rooms for clean paper waste (e.g. brown hand towels) to be used as a carbon source for composting?",
          options: [["Yes", 1], ["Maybe", 0.5], ["No", 0]] },
      ],
    },

    /* ------------------------------------------------------------- E */
    {
      id: "E", title: "Recycling & sorting", icon: "recycle",
      intro: "Plastic, paper, glass, cardboard and more.",
      questions: [
        { id: "E1", type: "grid", short: "Recycling by material", origin: "SW3", domain: "recycling", factual: true, required: true,
          text: "Does the school recycle each of these materials?",
          rows: [["plastic", "Plastic"], ["paper", "Paper"], ["glass", "Glass"], ["cardboard", "Cardboard"],
                 ["metal", "Metal cans"], ["ewaste", "Electronic waste"], ["batteries", "Batteries"]],
          cols: [["Yes, regularly", 1], ["Sometimes", 0.5], ["No", 0], [DK, null]] },
        { id: "E2", type: "multi", target: 2, short: "Recycling verification", origin: "SW3", domain: "recycling", factual: true, required: true,
          text: "How does the school make sure these materials are actually recycled? (select all that apply)",
          options: [["Contract with a recycling company / NGO", 1], ["Receipts or weight records", 1],
                    ["Staff check the collection point", 1], ["Visit or report from the recycler", 1],
                    ["No verification", 0], [DK, null]] },
        { id: "E3", type: "single", short: "Lunch sorting errors", origin: "SF4", domain: "recycling", required: true,
          text: "At the end of lunch, how often do students put recyclables or food scraps into the wrong bin?",
          options: [["Always", 0], ["Frequently", 0.25], ["Occasionally", 0.5], ["Rarely", 0.75], ["Never", 1],
                    ["There are no separate bins", 0], [DK, null]] },
        { id: "E4", type: "single", short: "Biggest sorting barrier", origin: "SF5", required: true,
          text: "In your opinion, what is the biggest barrier preventing students from sorting their lunch waste properly?",
          options: [["Bins are not clearly labelled", null], ["Rushing / not enough time at lunch", null],
                    ["Lack of interest or awareness", null], ["Not enough separate bins", null],
                    ["Students already sort properly", null], [DK, null]] },
        { id: "E5", type: "textarea", short: "Recycling — comments", origin: "SW3", required: false,
          text: "Anything else about recycling at the school (who collects it, problems, successes)?" },
      ],
    },

    /* ------------------------------------------------------------- F */
    {
      id: "F", title: "Water & electricity", icon: "bolt",
      intro: "Lights, faucets, cooling/heating and generators.",
      questions: [
        { id: "F1", type: "grid", short: "Resource-saving measures", origin: "SW4", domain: "energy", factual: true, required: true,
          text: "Which of these measures are in place at the school?",
          rows: [["lights", "Rule to switch off lights & devices in empty rooms"], ["led", "LED lighting / motion sensors"],
                 ["solar", "Solar panels or solar water heating"], ["ac", "Temperature rules for AC / heating"],
                 ["taps", "Water-saving taps or flush systems"], ["rain", "Rainwater collection or water reuse"],
                 ["monitor", "Monthly tracking of water / electricity / fuel bills"]],
          cols: [["In place", 1], ["Planned", 0.25], ["Not in place", 0], [DK, null]] },
        { id: "F2", type: "single", short: "Leak repair speed", origin: "SW4", domain: "energy", factual: true, required: true,
          text: "When a leaking faucet or pipe is reported, how quickly is it usually fixed?",
          options: [["Same day", 1], ["Within a week", 0.66], ["Within a month", 0.33], ["Longer / often not fixed", 0], [DK, null]] },
        { id: "F3", type: "single", short: "Lights left on", origin: "SW4", domain: "energy", required: true,
          text: "How often do you see lights, projectors or AC left on in empty rooms?",
          options: [["Daily", 0], ["Weekly", 0.33], ["Rarely", 0.66], ["Never", 1], [DK, null]] },
        { id: "F4", type: "textarea", short: "Water & energy — comments", origin: "SW4", required: false,
          text: "Describe any other actions the school takes to reduce water and electricity waste." },
      ],
    },

    /* ------------------------------------------------------------- G */
    {
      id: "G", title: "Green spaces & chemicals", icon: "tree",
      intro: "Plants, trees, playgrounds and sports fields.",
      questions: [
        { id: "G1", type: "textarea", short: "Protecting green spaces", origin: "SW5", required: true,
          text: "How does the school protect its green spaces, plants and trees?" },
        { id: "G2", type: "single", short: "Fertiliser type", origin: "SF7", domain: "green", factual: true, required: true,
          text: "What type of fertiliser is used on the school's lawns, fields and plants?",
          options: [["Organic only (compost, manure)", 1], ["Both organic and synthetic", 0.5], ["Synthetic chemical fertilisers", 0],
                    ["No fertiliser used", 1], [DK, null]] },
        { id: "G3", type: "single", short: "Pesticides / herbicides", origin: "SW5", domain: "green", factual: true, required: true,
          text: "Are chemical pesticides or weed-killers used on school grounds?",
          options: [["Never", 1], ["Rarely, only when necessary", 0.5], ["Regularly", 0], [DK, null]] },
        { id: "G4", type: "single", short: "Harmful disposal near plants", origin: "SW5", domain: "green", factual: true, required: true,
          text: "Are cleaning chemicals, paint, waste water or other waste ever disposed of in ways that could reach soil, plants or trees?",
          options: [["Never", 1], ["Rarely", 0.5], ["Sometimes", 0], [DK, null]] },
        { id: "G5", type: "single", short: "On-campus compost", origin: "SF8", domain: "support", required: true,
          text: "If the school composted cafeteria food waste on campus, would you support using that compost instead of commercial fertilisers?",
          options: [["Yes — and I'd help manage it", 1], ["Yes, I support the idea", 0.75], ["Neutral", null],
                    ["No — concerned about odours or pests", 0]] },
      ],
    },

    /* ------------------------------------------------------------- H */
    {
      id: "H", title: "Awareness, education & responsibility", icon: "people",
      intro: "How the school builds environmental habits in students and staff.",
      questions: [
        { id: "H1", type: "multi", target: 4, short: "Encouragement methods", origin: "SW6", domain: "culture", factual: true, required: true,
          text: "How does the school encourage students and staff to reduce waste and protect the environment? (select all that apply)",
          options: [["Lessons in the curriculum", 1], ["Eco / environment club", 1], ["Awareness campaigns or special days", 1],
                    ["Competitions or rewards", 1], ["Signs & posters near bins and taps", 1], ["Field trips / clean-up activities", 1],
                    ["Participation in an eco-schools programme", 1], ["Nothing specific", 0], [DK, null]] },
        { id: "H2", type: "single", short: "When rules aren't followed", origin: "SW6", domain: "culture", factual: true, required: true,
          text: "What usually happens when students or staff do not follow these practices?",
          options: [["Guidance and positive follow-up (reminders, reflection)", 1], ["Formal consequences (warnings, sanctions)", 0.75],
                    ["An occasional verbal reminder", 0.4], ["Nothing happens", 0], [DK, null]] },
        { id: "H3", type: "textarea", short: "Responsibility — comments", origin: "SW6", required: false,
          text: "Please describe how responsibility for the environment is shared between students, staff and management." },
        { id: "H4", type: "single", short: "Staff training", origin: "ADD", domain: "culture", factual: false, required: true,
          text: "In the past two years, have you received any training on sustainability or waste reduction?",
          options: [["Yes, more than once", 1], ["Yes, once", 0.5], ["No", 0]] },
        { id: "H5", type: "likert", short: "Attitudes & climate", origin: "ADD", domain: "culture", required: true,
          text: "How much do you agree with each statement?",
          rows: [["priority", "Sustainability is a clear priority in our school's plans"],
                 ["budget", "The school allocates enough budget for environmental initiatives"],
                 ["sdg", "The UN Sustainable Development Goals (SDGs) are integrated into teaching"],
                 ["students", "Most students know how to sort waste correctly"],
                 ["model", "Staff set a good example of sustainable behaviour"],
                 ["parents", "Parents would support stronger environmental measures"],
                 ["me", "I personally feel responsible for reducing the school's waste"]],
          cols: [["Strongly disagree", 0], ["Disagree", 0.25], ["Neutral", 0.5], ["Agree", 0.75], ["Strongly agree", 1]] },
      ],
    },

    /* ------------------------------------------------------------- I */
    {
      id: "I", title: "Overall view & priorities", icon: "flag",
      intro: "Your overall judgement and what should come first.",
      questions: [
        { id: "I1", type: "scale", short: "Overall rating (1–10)", origin: "ADD", required: true,
          text: "Overall, how would you rate the school's environmental performance today?",
          min: 1, max: 10, minLabel: "Very poor", maxLabel: "Excellent" },
        { id: "I2", type: "multi", short: "Top priorities", origin: "ADD", max: 3, required: true,
          text: "Which should be the school's top priorities over the next year? (choose up to 3)",
          options: [["Waste separation & recycling", null], ["Replacing single-use plastics with biodegradables", null],
                    ["On-campus composting", null], ["Saving water", null], ["Saving electricity / solar energy", null],
                    ["Safer lab & chemical waste handling", null], ["Protecting green spaces", null],
                    ["Student & staff awareness programmes", null]] },
        { id: "I3", type: "textarea", short: "One change tomorrow", origin: "ADD", required: false,
          text: "If you could change one thing tomorrow to make the school more sustainable, what would it be?" },
        { id: "I4", type: "single", short: "Follow-up willingness", origin: "ADD", required: false,
          text: "Would you be willing to take part in a short follow-up with the student team or join a green committee?",
          options: [["Yes", null], ["Maybe", null], ["No", null]] },
      ],
    },
  ],
};

/* Indices computed by the dashboard (0–100). "support" is readiness for
   change rather than current practice, so it is reported separately.     */
window.DOMAINS = {
  waste:     { label: "Waste management",      section: "B" },
  materials: { label: "Biodegradable materials", section: "C" },
  labs:      { label: "Laboratory practice",   section: "D" },
  recycling: { label: "Recycling & sorting",   section: "E" },
  energy:    { label: "Water & energy",        section: "F" },
  green:     { label: "Green spaces",          section: "G" },
  culture:   { label: "Awareness & culture",   section: "H" },
  support:   { label: "Readiness for change",  section: "—" },
};

/* Flattened list of answer keys, used by both pages and the backend headers */
window.surveyKeys = function () {
  const out = [];
  for (const s of window.SURVEY.sections) for (const q of s.questions) {
    if (q.type === "grid" || q.type === "likert") for (const [k, l] of q.rows) out.push({ key: `${q.id}_${k}`, q, row: l, section: s });
    else out.push({ key: q.id, q, section: s });
  }
  return out;
};
