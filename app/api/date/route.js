import { runDate } from "@/lib/agents";

export const maxDuration = 60;

// POST {a, b} (two analyzed profiles) -> a real multi-turn agent date plus judge verdict.
export async function POST(req) {
  try {
    const { a, b } = await req.json();
    if (!a?.name || !b?.name) throw new Error("Two profiles are required");
    return Response.json(await runDate(a, b, 6));
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
