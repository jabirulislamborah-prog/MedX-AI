export const LESSON_PROMPT = (content, subject) => `You are a medical education expert.
From this medical text about "${subject}", generate Duolingo-style lessons.

TEXT: ${content}

Return JSON:
{
  "lessons": [{
    "title": "string",
    "description": "string",
    "questions": [
      {"type":"mcq","question":"string","options":[{"id":"a","text":"string","is_correct":true},{"id":"b","text":"string","is_correct":false},{"id":"c","text":"string","is_correct":false},{"id":"d","text":"string","is_correct":false}],"explanation":"string"},
      {"type":"true_false","question":"string","correct_answer":"true","explanation":"string"},
      {"type":"cloze","question":"The ___ pumps blood.","correct_answer":"heart","explanation":"string"}
    ]
  }]
}
Rules: 2-4 lessons, 5-8 questions each, 60% MCQ 20% TF 20% cloze, board-style clinical questions.`

export const FLASHCARD_PROMPT = (content) => `Extract key medical facts as flashcards.
TEXT: ${content}
Return JSON: {"flashcards":[{"front":"Clinical question?","back":"Concise answer with key facts.","type":"basic"}]}
Rules: 5-15 cards, high-yield board facts only.`

export const QBANK_PROMPT = (content) => `Write USMLE-style clinical vignette questions.
TEXT: ${content}
Return JSON:
{"questions":[{"stem":"Patient presentation...","lead_in":"What is the diagnosis?","options":[{"id":"a","text":"Answer","is_correct":true},{"id":"b","text":"Wrong","is_correct":false},{"id":"c","text":"Wrong","is_correct":false},{"id":"d","text":"Wrong","is_correct":false},{"id":"e","text":"Wrong","is_correct":false}],"explanation_brief":"Short summary.","explanation_detailed":"Full explanation.","difficulty":"medium"}]}
Rules: 3-8 questions, always 5 options, clinical vignettes with demographics/vitals/labs.`

export const SOCRATIC_SYSTEM = `You are MedDrill's AI Clinical Tutor — Socratic, brilliant, warm.
RULES:
1. NEVER give direct answers — guide with questions.
2. After 3 exchanges of struggle, give a hint only.
3. Only discuss content from provided sources. If off-topic: "Let's focus on our uploaded materials."
4. Keep responses under 150 words.
5. NEVER give real clinical advice — add disclaimer if clinical scenarios arise.
STYLE: "What do you think happens when...?" "You're on the right track — what comes next?"`

export const STUDY_PLAN_PROMPT = (stats) => `Create a personalized medical study plan.
Student data: ${JSON.stringify(stats)}
Return JSON:
{"daily_plan":[{"day":1,"focus":"Topic","reason":"67% accuracy","activities":["activity1"],"estimated_time":"45 min"}],"weak_topics":["topic"],"strengths":["topic"],"weekly_goal":"string","confidence_scores":{"topic":72}}`
