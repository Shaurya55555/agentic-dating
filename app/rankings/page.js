import { people, rankings, dateKey } from "@/lib/demo";

export default async function Rankings({ searchParams }) {
  const sp = await searchParams;
  const ids = Object.keys(people);
  const pick = people[sp?.p] ? sp.p : ids[0];
  return (
    <>
      <h1>Who fits {people[pick].name} best</h1>
      <p className="sub">Every pair gets a fast trait score. Each person's top matches then go on a full agent-to-agent date, and the judged result sets the final score. Open any date to read it.</p>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
        {ids.map((i) => <a key={i} className="chip" style={i === pick ? { background: "#2b1d25" } : {}} href={`/rankings?p=${i}`}>{people[i].name}</a>)}
      </div>
      <h2>Ranking</h2>
      {rankings[pick].map((r, n) => (
        <div key={r.id} className="card" style={{ marginBottom: 8 }}>
          <div className="row">
            <b>#{n + 1}</b> <a href={`/person/${r.id}`}>{people[r.id].name}</a>
            <span style={{ marginLeft: "auto" }}>{r.score}{r.dated ? "" : " (est.)"}</span>
          </div>
          <div className="bar" style={{ marginTop: 8 }}><i style={{ width: `${r.score}%` }} /></div>
          {r.dated && <div className="who" style={{ marginTop: 6 }}><a href={`/date/${dateKey(pick, r.id)}`}>Watch their date</a></div>}
        </div>
      ))}
    </>
  );
}
