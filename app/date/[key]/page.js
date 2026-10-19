import { people, dates } from "@/lib/demo";
import { notFound } from "next/navigation";

export default async function DatePage({ params }) {
  const { key } = await params;
  const d = dates[key];
  if (!d) notFound();
  const [a, b] = key.split("__");
  const first = d.transcript[0]?.speaker;
  return (
    <>
      <h1>{people[a].name} × {people[b].name}</h1>
      <p className="sub">Two agents, one first date. Each turn is a separate model call that only sees its own person's profile and the conversation so far.</p>
      <div className="card"><b>Verdict · {d.score}/100</b><p>{d.verdict}</p><div className="who">Chemistry: {d.chemistry}</div><div className="who">Friction: {d.friction}</div></div>
      <h2>The date</h2>
      {d.transcript.map((t, i) => (
        <div key={i} className={"bubble" + (t.speaker === first ? "" : " r")}>
          <div className="who">{t.speaker}'s agent</div>{t.text}
        </div>
      ))}
    </>
  );
}
