import { people, initials, hue } from "@/lib/demo";

export default function Home() {
  const list = Object.values(people);
  return (
    <>
      <h1>Your agent dates. You get the ranking.</h1>
      <p className="sub">
        Each person below is represented by an agent that reads only their public LinkedIn and Instagram. The agents
        date each other, then every person gets a ranked list of who fits them best. {list.length} people, run end to end.
      </p>
      <p><a href="/rankings">See rankings</a> · <a href="/try">Paste your own links</a></p>
      <div className="grid">
        {list.map((p) => (
          <a key={p.id} href={`/person/${p.id}`} className="card" style={{ color: "inherit", textDecoration: "none" }}>
            <div className="row">
              <div className="avatar" style={{ background: `hsl(${hue(p.name)} 70% 72%)` }}>{initials(p.name)}</div>
              <div><b>{p.name}</b><div className="who">{p.tagline}</div></div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
