import { llmJson } from "./llm.js";

const ANALYZE_SYS = `You are a perceptive, fair-minded matchmaker's analyst. You read ONLY the two sources given (a public LinkedIn profile and a public Instagram profile) and build a dating profile of the person.
Rules: ground every claim in the sources; never infer health, religion, sexual orientation, ethnicity or other sensitive traits; if evidence is thin, say so and lower confidence. Return JSON:
{
 "name": string,
 "tagline": string (<=14 words, warm, specific),
 "summary": string (2-3 sentences),
 "needs": [string] (3-5 things this person likely needs in a partner or relationship, inferred from their life and tone),
 "hobbies": [string] (3-6),
 "interests": [string] (3-6),
 "values": [string] (3-5),
 "personality": {"openness":0-10,"extraversion":0-10,"ambition":0-10,"warmth":0-10,"humor":0-10,"adventurousness":0-10},
 "communicationStyle": string,
 "dealbreakers": [string] (0-3, only if evidenced),
 "lifestyle": string,
 "evidence": [{"claim":string,"source":"linkedin"|"instagram","quote":string (short, verbatim from source)}] (4-8),
 "confidence": 0-1
}`;

export async function analyzePerson(linkedin, instagram) {
  const user = `LINKEDIN:\n${JSON.stringify(linkedin)}\n\nINSTAGRAM:\n${JSON.stringify(instagram)}`;
  return llmJson(ANALYZE_SYS, user, { temperature: 0.4 });
}

// Cheap first pass over all pairs: trait overlap + personality closeness. No LLM.
export function quickScore(a, b) {
  const set = (xs) => new Set((xs || []).map((x) => String(x).toLowerCase()));
  const jac = (x, y) => {
    const A = set(x), B = set(y);
    const inter = [...A].filter((t) => [...B].some((u) => u.includes(t) || t.includes(u))).length;
    return inter / Math.max(1, Math.min(A.size, B.size));
  };
  const keys = Object.keys(a.personality || {});
  const dist = keys.length
    ? keys.reduce((s, k) => s + Math.abs((a.personality[k] ?? 5) - (b.personality?.[k] ?? 5)), 0) / (keys.length * 10)
    : 0.5;
  const score = 0.35 * jac(a.interests, b.interests) + 0.25 * jac(a.hobbies, b.hobbies) + 0.2 * jac(a.values, b.values) + 0.2 * (1 - dist);
  return Math.round(score * 100);
}

const agentSys = (me, them) => `You are the dating agent for ${me.name}. You represent ${me.name} on a first date with ${them.name}'s agent. Speak in first person AS ${me.name}, in their voice, but only using what you know from their profile below. Never invent biographical facts beyond it. Be curious, specific and honest; flirt lightly; disagree if you disagree. 1-3 sentences per turn.
YOUR PERSON'S PROFILE:
${JSON.stringify(me)}
You only know the other person from what they say on the date.`;

// Real alternating dialogue: each turn is a separate LLM call seeing only its own profile + the transcript.
export async function runDate(a, b, turns = 6) {
  const transcript = [];
  for (let i = 0; i < turns; i++) {
    const [me, them] = i % 2 === 0 ? [a, b] : [b, a];
    const hist = transcript.map((t) => `${t.speaker}: ${t.text}`).join("\n");
    const prompt =
      i === 0
        ? "Open the date with a natural, specific first line."
        : `Date so far:\n${hist}\n\nReply as ${me.name}${i >= turns - 2 ? ", and begin wrapping up the date" : ""}.`;
    const out = await llmJson(agentSys(me, them) + `\nReturn JSON {"text": string}.`, prompt, { temperature: 0.9 });
    transcript.push({ speaker: me.name, text: out.text });
  }
  const judge = await llmJson(
    `You are an impartial date judge. Read the date between two agents and the two profiles, then score real compatibility. Return JSON {"score":0-100,"chemistry":string,"friction":string,"verdict":string (<=25 words)}`,
    `PROFILE A: ${JSON.stringify(a)}\nPROFILE B: ${JSON.stringify(b)}\nDATE:\n${transcript.map((t) => `${t.speaker}: ${t.text}`).join("\n")}`,
    { temperature: 0.2 }
  );
  return { transcript, ...judge };
}
