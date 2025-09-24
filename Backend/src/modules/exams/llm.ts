type GenOpts = {
  title?: string;
  topics?: string[];
  difficulty?: "easy" | "medium" | "hard";
  examType?: "mcq-only" | "standard";
  role?: string;
  experienceLevel?: "junior" | "mid" | "senior";
  sections?: string[];
  numMcq?: number;
  numShort?: number;
  numCode?: number;
  timeLimitMin?: number;
  request?: string;
};

type GenQuestion = {
  type: "mcq" | "short" | "code";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  language?: string;
  points?: number;
  guidance?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
};

export type GenExam = {
  title: string;
  description?: string;
  settings: { timeLimitMin?: number; shuffle?: boolean };
  questions: GenQuestion[];
};

// Helper: try to parse JSON directly, otherwise try to extract a JSON object from noisy text
function tolerantJsonParse(input: string) {
  try {
    return JSON.parse(input);
  } catch (e) {
    // attempt to find the first JSON object/array in the string
    const firstBrace = input.indexOf('{');
    const firstBracket = input.indexOf('[');
    const start = (firstBrace === -1) ? firstBracket : (firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket));
    if (start === -1) return {};
    // try progressively larger substrings to find balanced JSON
    for (let i = input.length - 1; i > start; i--) {
      const substr = input.substring(start, i + 1);
      try {
        return JSON.parse(substr);
      } catch {}
    }
    // last resort: return empty object
    return {};
  }
}

const provider = (process.env.EXAM_LLM_PROVIDER || "none").toLowerCase();
const apiKey = process.env.EXAM_LLM_API_KEY || "";
const model = process.env.EXAM_LLM_MODEL || "gpt-4o-mini";
const timeoutMs = Number(process.env.EXAM_LLM_TIMEOUT_MS || 20000);
// Optional: custom Gemini/Generative API base URL (if you use a proxy or different endpoint)
// Support either EXAM_GEMINI_URL or EXAM_LLM_BASE_URL to give flexibility in env naming.
const geminiUrl = process.env.EXAM_GEMINI_URL
  || (process.env.EXAM_LLM_BASE_URL ? `${process.env.EXAM_LLM_BASE_URL.replace(/\/$/, '')}/models/${model}:generateText` : `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generateText`);

/**
 * Generate an exam using LLM if configured; otherwise return a sensible local fallback.
 */
export async function generateExam(opts: GenOpts): Promise<GenExam> {
  // normalize examType
  const examType = opts.examType || "standard";
  if (!apiKey) throw new Error("LLM generation disabled: missing EXAM_LLM_API_KEY");

  // helper: section list as comma-separated names (handles string[] or object[])
  const sectionList = Array.isArray(opts.sections)
    ? opts.sections.map(s => (typeof s === "string" ? s : (s && (s as any).name ? (s as any).name : String(s)))).join(", ")
    : (opts.topics && opts.topics.length ? opts.topics.join(", ") : undefined);

  // OpenAI path (unchanged behavior)
  if (provider === "openai") {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const sys = `You create concise technical assessments in JSON.
Return ONLY compact JSON matching this TypeScript type:

type Exam = {
  title: string;
  description?: string;
  settings: { timeLimitMin?: number; shuffle?: boolean };
  questions: Array<
    | { type: "mcq"; prompt: string; options: string[]; correctIndex: number; points?: number; difficulty?: "easy"|"medium"|"hard"; tags?: string[] }
    | { type: "short"; prompt: string; points?: number; guidance?: string; difficulty?: "easy"|"medium"|"hard"; tags?: string[] }
    | { type: "code"; prompt: string; language?: string; points?: number; guidance?: string; difficulty?: "easy"|"medium"|"hard"; tags?: string[] }
  >;
}`;

  const user = `Create an assessment with:
- title: ${opts.title || "Custom Assessment"}
- topics/sections: ${sectionList || "general backend"}
- role: ${opts.role || "any"}
- experienceLevel: ${opts.experienceLevel || "mid"}
- difficulty: ${opts.difficulty || "medium"}
- examType: ${examType}
- counts: mcq=${opts.numMcq ?? (examType === 'mcq-only' ? 10 : 8)}, short=${opts.numShort ?? (examType === 'mcq-only' ? 0 : 2)}, code=${opts.numCode ?? (examType === 'mcq-only' ? 0 : 1)}
- timeLimitMin: ${opts.timeLimitMin ?? 30}
Keep prompts crisp. Avoid huge texts.`;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          messages: [
            { role: "system", content: sys },
            { role: "user", content: user }
          ],
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });

      clearTimeout(id);
      if (!res.ok) throw new Error(`LLM error: ${res.status} ${res.statusText}`);
      const data: any = await res.json();
      const text = data.choices?.[0]?.message?.content || "{}";
      const parsed = tolerantJsonParse(text);
      // basic sanity
      if (!Array.isArray(parsed.questions)) throw new Error("LLM returned invalid JSON: missing questions array");
      return {
        title: parsed.title || opts.title || "Generated Assessment",
        description: parsed.description || "",
        settings: { timeLimitMin: opts.timeLimitMin ?? parsed.settings?.timeLimitMin ?? 30, shuffle: parsed.settings?.shuffle ?? true },
        questions: parsed.questions
      };
    } catch {
      // Surface LLM errors to caller instead of silently returning fallback content
      throw new Error("LLM generation failed (openai): see server logs for details");
    }
  }

  // Gemini path
  if (provider === "gemini") {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

  const promptText = `SYSTEM:\nYou create concise technical assessments in JSON.\nReturn ONLY compact JSON matching the TypeScript Exam type.\n\nUSER:\nCreate an assessment with title: ${opts.title || "Custom Assessment"}; topics: ${sectionList || "general backend"}; role: ${opts.role || "any"}; experienceLevel: ${opts.experienceLevel || "mid"}; difficulty: ${opts.difficulty || "medium"}; examType: ${examType}; counts: mcq=${opts.numMcq ?? (examType === 'mcq-only' ? 10 : 8)}, short=${opts.numShort ?? (examType === 'mcq-only' ? 0 : 2)}, code=${opts.numCode ?? (examType === 'mcq-only' ? 0 : 1)}; timeLimitMin: ${opts.timeLimitMin ?? 30}. Keep prompts crisp.`;

    try {
      const url = geminiUrl + (geminiUrl.includes("?") ? `&key=${apiKey}` : `?key=${apiKey}`);
      // Debug: indicate attempt to call Gemini
      console.debug && console.debug("LLM: calling gemini at", url);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: { text: promptText },
          temperature: 0.3,
          maxOutputTokens: 1500
        }),
        signal: controller.signal
      });
      clearTimeout(id);
      if (!res.ok) {
        // capture response body for diagnostics (some Google errors return useful JSON text)
        let bodyText = "";
        try { bodyText = await res.text(); } catch (e) { /* ignore */ }
        console.error(`Gemini LLM non-OK response: ${res.status} ${res.statusText} ${bodyText}`);
        throw new Error(`Gemini LLM error: ${res.status} ${res.statusText}`);
      }
      const data: any = await res.json();
      // Debug: log a short summary of the LLM response (length) to help diagnose issues
      try { console.debug && console.debug("LLM: gemini response keys", Object.keys(data), "len", JSON.stringify(data).length); } catch {}
      const text = data.candidates?.[0]?.content || data.output?.[0]?.content || data["candidates"]?.[0]?.message || "{}";
      const parsed = tolerantJsonParse(typeof text === "string" ? text : JSON.stringify(text));
      if (!Array.isArray(parsed.questions)) throw new Error("LLM returned invalid JSON: missing questions array");
      return {
        title: parsed.title || opts.title || "Generated Assessment",
        description: parsed.description || "",
        settings: { timeLimitMin: opts.timeLimitMin ?? parsed.settings?.timeLimitMin ?? 30, shuffle: parsed.settings?.shuffle ?? true },
        questions: parsed.questions
      };
    } catch (err) {
      // Surface LLM errors to caller instead of silently returning fallback content
      console.error("LLM gemini error:", err);
      throw new Error("LLM generation failed (gemini): see server logs for details");
    }
  }

  // unsupported provider: surface error instead of returning fallback
  throw new Error("LLM generation disabled: unsupported provider or misconfigured EXAM_LLM_PROVIDER");
}
function localFallback(opts: GenOpts, examType: "mcq-only" | "standard" = "standard"): GenExam {
  const defaultMcq = examType === "mcq-only" ? 10 : 6;
  const defaultShort = examType === "mcq-only" ? 0 : 2;
  const defaultCode = examType === "mcq-only" ? 0 : 1;
  const mcqN = opts.numMcq ?? defaultMcq;
  const shortN = opts.numShort ?? defaultShort;
  const codeN = opts.numCode ?? defaultCode;
  const questions: GenQuestion[] = [];

  // topic: pick first section name (handles object or string) or first topic
  const topic = Array.isArray(opts.sections)
    ? (typeof opts.sections[0] === "string" ? opts.sections[0] : (opts.sections[0] && (opts.sections[0] as any).name ? (opts.sections[0] as any).name : "Node.js & MongoDB"))
    : (opts.topics && opts.topics[0]) || "Node.js & MongoDB";

  for (let i = 0; i < mcqN; i++) {
    questions.push({
      type: "mcq",
      prompt: `[${topic}] MCQ #${i + 1}: Which statement is correct?`,
      options: [
        "Node.js uses a multi-threaded request model by default.",
        "MongoDB stores documents in BSON and supports flexible schemas.",
        "Express cannot define middleware.",
        "JWTs must always be encrypted."
      ],
      correctIndex: 1,
      points: 1,
      difficulty: "easy",
      tags: ["mcq", "backend"]
    });
  }

  for (let i = 0; i < shortN; i++) {
    questions.push({
      type: "short",
      prompt: `[${topic}] Explain what an index is in MongoDB and when you'd add one.`,
      points: 2,
      guidance: "Mention fields, query patterns, and write vs read trade-offs.",
      difficulty: "medium",
      tags: ["short", "mongo"]
    });
  }

  for (let i = 0; i < codeN; i++) {
    questions.push({
      type: "code",
      prompt: `[${topic}] Write an Express route handler that validates a JWT and returns current user id.`,
      language: "typescript",
      points: 3,
      guidance: "Look for header parsing, verification, error handling.",
      difficulty: "medium",
      tags: ["code", "express", "jwt"]
    });
  }

  return {
    title: opts.title || `${topic} Assessment`,
    description: "Locally generated fallback exam.",
    settings: { timeLimitMin: opts.timeLimitMin ?? 30, shuffle: true },
    questions
  };
}

/**
 * Optional: naive LLM grading for open-ended answers.
 * Returns 0..points plus brief feedback.
 */
export async function gradeOpenAnswer(question: { prompt: string; guidance?: string; points?: number }, answer: string) {
  if (!apiKey) {
    // if no API key, do not attempt LLM grading and surface error to caller
    throw new Error("LLM grading disabled: missing EXAM_LLM_API_KEY");
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const sys = `You are a strict grader. Return ONLY compact JSON: {"points": number, "feedback": string}`;
  const user = `Question: ${question.prompt}\nGuidance: ${question.guidance || "grade for correctness, clarity, and key points"}\nMax points: ${question.points ?? 1}\nAnswer: ${answer}`;

  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [{ role: "system", content: sys }, { role: "user", content: user }],
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });
      clearTimeout(id);
      if (!res.ok) throw new Error(`LLM error: ${res.status} ${res.statusText}`);
      const data: any = await res.json();
      const text = data.choices?.[0]?.message?.content || "{}";
      const parsed = tolerantJsonParse(text);
      if (typeof parsed.points !== 'number') throw new Error('LLM grading returned invalid JSON');
      const pts = question.points ?? 1;
      const capped = Math.max(0, Math.min(pts, Number(parsed.points ?? 0)));
      return { points: capped, feedback: String(parsed.feedback || "") };
    }

    if (provider === "gemini") {
      const promptText = `SYSTEM:\n${sys}\nUSER:\n${user}`;
      const url = geminiUrl + (geminiUrl.includes("?") ? `&key=${apiKey}` : `?key=${apiKey}`);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: { text: promptText }, temperature: 0.2, maxOutputTokens: 512 }),
        signal: controller.signal
      });
      clearTimeout(id);
      if (!res.ok) {
        let bodyText = "";
        try { bodyText = await res.text(); } catch (e) { /* ignore */ }
        console.error(`Gemini LLM non-OK response (grading): ${res.status} ${res.statusText} ${bodyText}`);
        throw new Error(`Gemini LLM error: ${res.status} ${res.statusText}`);
      }
      const data: any = await res.json();
      const text = data.candidates?.[0]?.content || data.output?.[0]?.content || "{}";
      const parsed = tolerantJsonParse(typeof text === "string" ? text : JSON.stringify(text));
      if (typeof parsed.points !== 'number') throw new Error('LLM grading returned invalid JSON');
      const pts = question.points ?? 1;
      const capped = Math.max(0, Math.min(pts, Number(parsed.points ?? 0)));
      return { points: capped, feedback: String(parsed.feedback || "") };
    }

    // unsupported providers or errors: surface error to caller
    throw new Error('LLM grading failed or unsupported provider');
  } catch (err) {
    console.error('LLM grading error:', err);
    throw new Error('LLM grading failed: see server logs for details');
  }
}
