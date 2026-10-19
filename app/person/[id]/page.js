import { people, rankings } from "@/lib/demo";
import { notFound } from "next/navigation";

export default async function Person({ params }) {
  const { id } = await params;
  const p = people[id];
  if (!p) notFound();
  const top = (rankings[id] || []).slice(0, 5);
  return (
    <>
      <h1>{p.name}</h1>
      <p className="sub">{p.tagline}</p>
      <p>
        <a href={p.links.linkedin} target="_blank">LinkedIn</a> · <a href={p.links.instagram} target="_blank">Instagram</a> · <a href={`/rankings?p=${id}`}>Full ranking</a>
      </p>
      <div className="card"><b>What the agent read</b><p>{p.summary}</p><div className="who">Confidence {Math.round((p.confidence ?? 0) * 100)}% · {p.communicationStyle}</div></div>
      <div className="grid">
        <div className="card"><b>Needs</b><div>{p.needs?.map((x) => <span key={x} className="chip need">{x}</span>)}</div></div>
        <div className="card"><b>Hobbies</b><div>{p.hobbies?.map((x) => <span key={x} className="chip hob">{x}</span>)}</div></div>
        <div className="card"><b>Interests</b><div>{p.interests?.map((x) => <span key={x} className="chip">{x}</span>)}</div></div>
        <div className="card"><b>Values</b><div>{p.values?.map((x) => <span key={x} className="chip">{x}</span>)}</div></div>
      </div>
      <h2>Personality</h2>
      <div className="grid">
        {Object.entries(p.personality || {}).map(([k, v]) => (
          <div key={k} className="card"><div className="who">{k} · {v}/10</div><div className="bar"><i style={{ width: `${v * 10}%` }} /></div></div>
        ))}
      </div>
      <h2>Evidence</h2>
      {p.evidence?.map((e, i) => (
        <div key={i} className="card" style={{ marginBottom: 8 }}>
          <b>{e.claim}</b> <span className="who">({e.source})</span>
          <div className="quote">“{e.quote}”</div>
        </div>
      ))}
      <h2>Best fits</h2>
      {top.map((r) => (
        <div key={r.id} className="row card" style={{ marginBottom: 8 }}>
          <a href={`/person/${r.id}`}>{people[r.id].name}</a>
          <span className="who" style={{ marginLeft: "auto" }}>{r.score}{r.dated ? "" : " (est.)"}</span>
        </div>
      ))}
    </>
  );
}
