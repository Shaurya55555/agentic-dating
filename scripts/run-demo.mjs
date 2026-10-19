// Pre-runs the full pipeline for data/people.json and writes data/demo.json.
// usage: node scripts/run-demo.mjs   (needs APIFY_TOKEN and GEMINI_API_KEY in .env.local)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}
const { scrapeInstagram, scrapeLinkedIn } = await import("../lib/apify.js");
const { analyzePerson, quickScore, runDate } = await import("../lib/agents.js");

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const people = JSON.parse(fs.readFileSync(path.join(root, "data/people.json"), "utf8"));
const cacheDir = path.join(root, "data/cache");
fs.mkdirSync(cacheDir, { recursive: true });
const cached = (name, fn) => async () => {
  const f = path.join(cacheDir, name + ".json");
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  const v = await fn();
  fs.writeFileSync(f, JSON.stringify(v));
  return v;
};

const profiles = {};
async function loadOne(p) {
  const id = slug(p.name);
  try {
    const [li, ig] = await Promise.all([
      cached(id + ".li", () => scrapeLinkedIn(p.linkedin))(),
      cached(id + ".ig", () => scrapeInstagram(p.instagram))(),
    ]);
    const prof = await cached(id + ".profile", () => analyzePerson(li, ig))();
    profiles[id] = { ...prof, id, links: { linkedin: p.linkedin, instagram: p.instagram }, avatarSeed: p.name };
    console.log("ok  ", p.name);
  } catch (e) {
    console.log("FAIL", p.name, e.message);
  }
}
for (let i = 0; i < people.length; i += 1) await loadOne(people[i]);

const ids = Object.keys(profiles);
console.log(`${ids.length} profiles ready`);
if (ids.length < 25) console.log("WARNING: fewer than 25 profiles; add replacements to people.json");

// Stage 1: cheap score for all pairs. Stage 2: real dates for each person's top matches.
const quick = {};
for (const a of ids) for (const b of ids) if (a !== b) quick[a + "__" + b] = quickScore(profiles[a], profiles[b]);
const K = 2;
const pairs = new Set();
for (const a of ids) {
  const top = ids.filter((b) => b !== a).sort((x, y) => quick[a + "__" + y] - quick[a + "__" + x]).slice(0, K);
  for (const b of top) pairs.add([a, b].sort().join("__"));
}
const dates = {};
for (const key of pairs) {
  const [a, b] = key.split("__");
  // ONLY_CACHED=1 finishes with the dates already run (used when the free LLM quota is spent).
  if (process.env.ONLY_CACHED && !fs.existsSync(path.join(cacheDir, "date." + key + ".json"))) continue;
  dates[key] = await cached("date." + key, () => runDate(profiles[a], profiles[b], 6))();
  console.log("date", profiles[a].name, "x", profiles[b].name, dates[key].score);
}

const rankings = {};
for (const a of ids) {
  rankings[a] = ids
    .filter((b) => b !== a)
    .map((b) => {
      const d = dates[[a, b].sort().join("__")];
      const q = quick[a + "__" + b];
      return { id: b, quick: q, dated: !!d, score: d ? Math.round(0.35 * q + 0.65 * d.score) : Math.round(q * 0.8) };
    })
    .sort((x, y) => y.score - x.score);
}
// Flag couple members whose own LinkedIn/Instagram text mentions the spouse (makes that match partly trivial).
const couples = JSON.parse(fs.readFileSync(path.join(root, "data/couples.json"), "utf8"));
const leaks = {};
for (const [x, y] of couples)
  for (const [me, sp] of [[x, y], [y, x]]) {
    const raw = ["li", "ig"].map((k) => { try { return fs.readFileSync(path.join(cacheDir, slug(me) + "." + k + ".json"), "utf8"); } catch { return ""; } }).join(" ").toLowerCase();
    const first = sp.split(" ")[0].toLowerCase();
    leaks[slug(me) + "__" + slug(sp)] = first.length >= 4 && raw.includes(first);
  }
fs.writeFileSync(path.join(root, "data/demo.json"), JSON.stringify({ people: profiles, dates, rankings, leaks }, null, 1));
console.log("wrote data/demo.json");
