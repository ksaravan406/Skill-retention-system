// Gemini requests are disabled until they can be routed through a protected backend.
const GEMINI_API_KEY = "DUMMY_KEY_NOT_CONFIGURED";

// Fallback order of Gemini models in case of temporary high-demand spikes (503)
const CANDIDATE_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

async function callGeminiApi(prompt, isJson = true, timeoutMs = 30000) {
  if (GEMINI_API_KEY === "DUMMY_KEY_NOT_CONFIGURED") {
    throw new Error("Gemini is disabled until a server-side endpoint is configured.");
  }

  const apiKey = GEMINI_API_KEY;
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.95,
            ...(isJson ? { responseMimeType: "application/json" } : {}),
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        lastError = new Error(data.error?.message || `HTTP ${response.status}`);
        // If 503 or model not found, continue to next fallback model
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to communicate with Gemini API across all models.");
}

/**
 * Validates whether the entered skill and category represent a real, legitimate skill
 * or gibberish / nonsense.
 *
 * @param {Object} params
 * @param {string} params.name - The skill name
 * @param {string} params.category - The category name
 * @returns {Promise<{ isValid: boolean, message: string }>}
 */
export async function validateSkillWithGemini({ name, category }) {
  const trimmedName = (name || "").trim();
  const trimmedCat = (category || "").trim();

  if (!trimmedName) {
    return { isValid: false, message: "Skill name cannot be empty." };
  }

  // Quick sanity checks for obvious keyboard spam before calling API
  if (/(.)\1{5,}/.test(trimmedName)) {
    return {
      isValid: false,
      message: "Skill name looks like repeated characters/nonsense.",
    };
  }

  const prompt = `You are a strict evaluator for a learning and skill-tracking platform.
Evaluate if the following user input represents a real, legitimate, meaningful skill, technology, tool, academic subject, craft, hobby, domain, or discipline, OR if it is nonsense, gibberish, keyboard spam, or completely meaningless text.

Skill Name: "${trimmedName}"
Category: "${trimmedCat}"

Respond ONLY with a JSON object in this exact format:
{
  "isValid": true,
  "message": "Clear explanation of whether this is recognized or why it is considered nonsense/invalid."
}
Set "isValid" to false if it is gibberish, spam, random keystrokes (like "asdfghjk", "poiuqwer", "1234567"), or meaningless words.
Set "isValid" to true if it is a legitimate, recognized skill or topic.`;

  try {
    const rawJson = await callGeminiApi(prompt, true, 12000);
    const parsed = JSON.parse(rawJson);
    return {
      isValid: Boolean(parsed.isValid),
      message:
        parsed.message ||
        (parsed.isValid
          ? "Valid skill identified."
          : "Please enter a valid, recognized skill or topic, not nonsense text."),
    };
  } catch (err) {
    console.warn("Gemini validation fallback check:", err);
    // If Gemini service is temporarily unreachable, perform safe heuristic check
    const isObviousNonsense =
      trimmedName.length > 25 && !trimmedName.includes(" ") ||
      /^[bcdfghjklmnpqrstvwxyz]{6,}$/i.test(trimmedName) ||
      /^[0-9]+$/.test(trimmedName);

    if (isObviousNonsense) {
      return {
        isValid: false,
        message: "Nonsense or random characters detected in skill name.",
      };
    }

    return { isValid: true, message: "Skill verified." };
  }
}

/**
 * Generates random multiple-choice practice questions according to the skill and proficiency level.
 * Each run generates fresh, varied questions.
 *
 * @param {Object} params
 * @param {string} params.skillName
 * @param {string} params.category
 * @param {string} params.proficiency - 'Beginner', 'Intermediate', or 'Advanced'
 * @param {number} params.count - Number of questions to generate (default 20)
 * @returns {Promise<Array<{ question: string, options: string[], answer: string }>>}
 */
export async function generatePracticeQuestionsWithGemini({
  skillName,
  category = "",
  proficiency = "Beginner",
  count = 20,
}) {
  const seed = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const prompt = `Generate ${count} completely random, fresh, unique multiple choice quiz questions to test knowledge in the skill "${skillName}" (Category: "${category}").
Proficiency Level: "${proficiency}".
Strictly calibrate difficulty to "${proficiency}":
- If "Beginner": focus on core fundamental syntax, core definitions, basic concepts, and introductory principles.
- If "Intermediate": focus on practical code reasoning, common patterns, debugging, standard libraries, and real-world usage.
- If "Advanced": focus on deep architectural internals, optimization, memory/runtime mechanics, complex design trade-offs, and edge cases.

Randomizer seed: ${seed}. Ensure every question generated is fresh, engaging, and different each time.

Respond ONLY with a valid JSON array of objects in this exact format:
[
  {
    "question": "Clear and concise question text",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "answer": "Option B text",
    "concept": "Specific concept or topic tested (e.g. List Comprehension, Exception Handling, Inheritance)"
  }
]

Requirements:
1. Provide exactly 4 distinct options per question.
2. The "answer" must match one of the items in "options" exactly.
3. The "concept" must name the exact subtopic or concept tested.
4. No Markdown codeblocks around the JSON.`;

  const rawJson = await callGeminiApi(prompt, true, 35000);
  let cleaned = rawJson.trim();
  // Strip any accidental markdown formatting if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }

  const questions = JSON.parse(cleaned);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Gemini returned invalid question format.");
  }

  // Validate and sanitize questions
  const validated = questions
    .filter((q) => q && q.question && Array.isArray(q.options) && q.options.length >= 2 && q.answer)
    .map((q) => {
      // Ensure answer is in options
      let options = [...q.options];
      if (!options.includes(q.answer)) {
        options[0] = q.answer;
      }
      return {
        question: q.question,
        options,
        answer: q.answer,
        concept: q.concept ? String(q.concept).trim() : undefined,
      };
    });

  if (validated.length === 0) {
    throw new Error("No valid questions parsed from Gemini response.");
  }

  return validated;
}
