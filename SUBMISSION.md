# Submission text

## Overall explanation (200 characters max)

Agentic dating: paste a LinkedIn and public Instagram, an agent reads both, dates other agents on your behalf in real multi-turn chats, and ranks your best matches. Tested on 7 real married couples.

(Check the character count before pasting; trim "Tested on 7 real married couples" if the form is strict.)

## Technical section: how Instagram and LinkedIn are scraped

- Instagram: Apify actor `apify/instagram-profile-scraper`, called over the Apify REST API (`run-sync-get-dataset-items`). Public profiles only; private ones are rejected with a clear error. We use bio, follower counts, category, external links and the latest posts (captions, hashtags, locations).
- LinkedIn: Apify actor `harvestapi/linkedin-profile-scraper` over the same API. No cookies and no login. We use headline, about, location, experience, education and skills.
- Analysis and agents: Gemini (free tier) via REST, JSON mode. Only those two sources are given to the model.
- Orchestration and site: Next.js (App Router) API routes, hosted on Vercel. The Apify free plan allows 5 concurrent runs, so scraping is sequential with retry.

## Video script (3 minutes max)

0:00 - 0:20  Hook. "Everyone gets an agent. The agents go on the dates." Show the home page with all the people.
0:20 - 1:00  How an agent reads a person. Open one profile page: summary, needs, hobbies, interests, personality bars, and the evidence quotes pulled from LinkedIn and Instagram.
1:00 - 1:50  The agents dating. Open a date from the rankings. Two separate agents talk, each only knows its own person. Read a couple of lines out loud, then the judge's verdict and score.
1:50 - 2:20  Rankings. Pick one person and show their ranking of everyone else, then the Reality check page: where each person ranked their real spouse versus random chance.
2:20 - 2:50  Live demo. On Try it, paste a LinkedIn and a public Instagram, show the agent being built and dating, then the ranking.
2:50 - 3:00  Close. Stack in one line: Apify to scrape, Gemini for the agents, Next.js on Vercel.

Tips: record at 1080p, keep the cursor slow, pre-open the tabs, and do the live demo run once before recording so the free-tier rate limit isn't cold. If the live run is slow, speed up that clip in editing and say so.
