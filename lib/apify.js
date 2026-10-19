// Scrapers: Apify actors, run synchronously, return dataset items.
const BASE = "https://api.apify.com/v2/acts";

async function runActor(actor, input, timeoutSec = 55) {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN is not set");
  const url = `${BASE}/${actor}/run-sync-get-dataset-items?token=${token}&timeout=${timeoutSec}`;
  let res;
  for (let attempt = 0; attempt < 5; attempt++) {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.status !== 402) break; // free plan: 5 concurrent runs, wait and retry
    await new Promise((r) => setTimeout(r, 8000));
  }
  if (!res.ok) throw new Error(`Apify ${actor} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

export function igUsername(urlOrHandle) {
  const m = String(urlOrHandle).match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  return (m ? m[1] : String(urlOrHandle)).replace(/^@/, "").replace(/\/$/, "");
}

export async function scrapeInstagram(urlOrHandle) {
  const username = igUsername(urlOrHandle);
  const items = await runActor("apify~instagram-profile-scraper", { usernames: [username] });
  const p = items[0];
  if (!p || p.error) throw new Error(`Instagram profile not found: ${username}`);
  if (p.private || p.isPrivate) throw new Error(`Instagram profile @${username} is private`);
  return {
    username: p.username,
    fullName: p.fullName,
    biography: p.biography,
    followers: p.followersCount,
    following: p.followsCount,
    category: p.businessCategoryName,
    externalUrl: p.externalUrl,
    posts: (p.latestPosts || []).slice(0, 12).map((x) => ({
      caption: (x.caption || "").slice(0, 400),
      hashtags: x.hashtags,
      location: x.locationName,
      type: x.type,
    })),
  };
}

export function liUsername(url) {
  const m = String(url).match(/linkedin\.com\/in\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]) : String(url);
}

// apimaestro/linkedin-profile-detail: no cookies, takes the public username. (harvestapi caps free users at 50 runs.)
export async function scrapeLinkedIn(url) {
  const username = liUsername(url);
  const items = await runActor("apimaestro~linkedin-profile-detail", { username });
  const p = items[0];
  if (!p || p.error || !p.basic_info) throw new Error(`LinkedIn profile not found: ${username}`);
  const b = p.basic_info;
  return {
    name: b.fullname,
    headline: b.headline,
    about: b.about,
    location: b.location?.full || b.location,
    topSkills: b.top_skills,
    experience: (p.experience || []).slice(0, 6).map((e) => ({
      title: e.title,
      company: e.company,
      description: (e.description || "").slice(0, 300),
    })),
    education: (p.education || []).slice(0, 3).map((e) => ({ school: e.school, degree: e.degree_name || e.degree })),
    projects: (p.projects || []).slice(0, 4).map((x) => ({ name: x.name, description: (x.description || "").slice(0, 200) })),
    certifications: (p.certifications || []).slice(0, 5).map((x) => x.name),
    publications: (p.publications || []).slice(0, 4).map((x) => x.title),
    featured: (p.featured || []).slice(0, 4).map((x) => x.title),
    causes: p.causes,
    languages: (p.languages || []).map((x) => x.language),
  };
}
