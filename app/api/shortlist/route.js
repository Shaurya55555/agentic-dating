import { people } from "@/lib/demo";
import { quickScore } from "@/lib/agents";

// POST {profile} -> the 3 roster people with the highest quick score, for the live "try it" flow.
export async function POST(req) {
  const { profile } = await req.json();
  const top = Object.values(people)
    .map((p) => ({ ...p, quick: quickScore(profile, p) }))
    .sort((a, b) => b.quick - a.quick)
    .slice(0, 3);
  return Response.json({ top });
}
