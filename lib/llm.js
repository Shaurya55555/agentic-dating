// Gemini free tier, JSON mode.
const MODEL = () => process.env.GEMINI_MODEL || "gemini-flash-lite-latest";

let last = 0;
const GAP_MS = 4500; // stay under the free-tier requests/minute

export async function llmJson(system, user, { temperature = 0.7 } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL()}:generateContent?key=${key}`;
  for (let attempt = 0; attempt < 8; attempt++) {
    const wait = last + GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
    let res;
    try {
      res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature, responseMimeType: "application/json" },
      }),
    });
    } catch {
      await new Promise((r) => setTimeout(r, 10000)); // transient network error: wait and retry
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 15000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const j = await res.json();
    const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    try {
      return JSON.parse(text);
    } catch {
      continue;
    }
  }
  throw new Error("Gemini failed after retries");
}
