import { scrapeInstagram, scrapeLinkedIn } from "@/lib/apify";
import { analyzePerson } from "@/lib/agents";

export const maxDuration = 60;

// POST {linkedin, instagram} -> scrape both public profiles, analyze, return the profile.
export async function POST(req) {
  try {
    const { linkedin, instagram } = await req.json();
    if (!/linkedin\.com\/in\//i.test(linkedin || "")) throw new Error("Enter a LinkedIn profile URL (linkedin.com/in/...)");
    if (!/instagram\.com\//i.test(instagram || "")) throw new Error("Enter a public Instagram profile URL");
    const [li, ig] = await Promise.all([scrapeLinkedIn(linkedin), scrapeInstagram(instagram)]);
    const profile = await analyzePerson(li, ig);
    return Response.json({ profile: { ...profile, links: { linkedin, instagram } } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
