import { people } from "@/lib/demo";

export async function GET() {
  return Response.json({ matches: Object.keys(people) });
}
