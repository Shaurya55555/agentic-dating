# Agentic Dating

Every person gets an agent. The agents go on the dates. Each person gets a ranking.

Paste a public LinkedIn and a public Instagram URL: an agent reads both, builds a profile (needs, hobbies, interests, values, personality, evidence quotes), dates the other agents on that person's behalf, and ranks who fits best.

## How it works

1. **Scrape** (`lib/apify.js`): two Apify actors, called through the Apify REST API.
   - Instagram: `apify/instagram-profile-scraper` (public profiles only, private ones are rejected).
   - LinkedIn: `harvestapi/linkedin-profile-scraper` (no cookies or login needed).
2. **Analyze** (`lib/agents.js`, `analyzePerson`): Gemini reads only those two sources and returns structured JSON. Every claim carries a verbatim quote and its source. Sensitive traits (health, religion, orientation, ethnicity) are never inferred.
3. **Date** (`runDate`): two separate agents, one per person. Each turn is its own model call that sees only its own person's profile and the conversation so far, so the dialogue is not scripted. A judge then scores chemistry and friction.
4. **Rank**: every pair gets a fast trait score (interest, hobby and value overlap, personality distance). Each person's top matches get a full agent date, and the judged score sets the final ranking.
5. **Reality check** (`/reality`): famous married couples are on the roster, and we report where each person ranked their real spouse against random chance.

## Run it

```
npm install
cp .env.example .env.local   # add APIFY_TOKEN and GEMINI_API_KEY (both have free tiers)
node scripts/run-demo.mjs    # scrapes data/people.json and writes data/demo.json
npm run dev
```

## Stack

Next.js (App Router), Apify actors for scraping, Gemini (free tier) for the agents, Vercel for hosting.

## Notes

Only public information is used, from the two profiles above. The demo roster is public figures. Scraped raw data is not committed.
