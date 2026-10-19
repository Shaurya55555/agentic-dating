import { people, dates, initials, hue } from "@/lib/demo";
import couples from "@/data/couples.json";

export default function Home() {
  const list = Object.values(people);
  return (
    <>
      <div className="hero">
        <h1>Your agent dates.<br />You get the ranking.</h1>
        <p className="sub">
          Each person is represented by an agent that reads only their public LinkedIn and Instagram. The agents go on first dates
          with each other, then every person gets a ranked list of who fits them best.
        </p>
        <div className="stats">
          <div className="stat"><b>{list.length}</b><span>real people</span></div>
          <div className="stat"><b>{Object.keys(dates).length}</b><span>agent-to-agent dates</span></div>
          <div className="stat"><b>{couples.length}</b><span>married couples as a test</span></div>
        </div>
        <a className="cta primary" href="/try">Send your own agent</a>
        <a className="cta ghost" href="/rankings">See rankings</a>
        <a className="cta ghost" href="/reality">Reality check</a>
      </div>
      <h2>The roster</h2>
      <p className="sub">Open anyone to see what their agent read and how it understood them.</p>
      <div className="grid">
        {list.map((p) => (
          <a key={p.id} href={`/person/${p.id}`} className="card" style={{ color: "inherit" }}>
            <div className="row">
              <div className="avatar" style={{ background: `hsl(${hue(p.name)} 70% 72%)` }}>{initials(p.name)}</div>
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 17 }}>{p.name}</b>
                <div className="tagline">{p.tagline}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
