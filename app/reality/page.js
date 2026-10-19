import { people, rankings, leaks } from "@/lib/demo";
import couples from "@/data/couples.json";

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Where does each person rank their real spouse among everyone else on the roster?
function evaluate() {
  const rows = [];
  for (const [a, b] of couples) {
    const A = slug(a), B = slug(b);
    if (!people[A] || !people[B]) continue;
    for (const [me, spouse] of [[A, B], [B, A]]) {
      const list = rankings[me] || [];
      const idx = list.findIndex((r) => r.id === spouse);
      if (idx >= 0) rows.push({ me, spouse, named: !!leaks?.[me + "__" + spouse], rank: idx + 1, of: list.length, score: list[idx].score, dated: list[idx].dated });
    }
  }
  return rows;
}

export default function Reality() {
  const rows = evaluate();
  const n = rows.length;
  const mean = n ? rows.reduce((s, r) => s + r.rank, 0) / n : 0;
  const chance = rows.length ? rows.reduce((s, r) => s + (r.of + 1) / 2, 0) / n : 0;
  const top3 = rows.filter((r) => r.rank <= 3).length;
  const clean = rows.filter((r) => !r.named);
  const cleanMean = clean.length ? clean.reduce((s, r) => s + r.rank, 0) / clean.length : 0;
  const cleanTop3 = clean.filter((r) => r.rank <= 3).length;
  const top3Chance = rows.length ? rows.reduce((s, r) => s + Math.min(3, r.of) / r.of, 0) : 0;
  return (
    <>
      <h1>Reality check: do agents find real couples?</h1>
      <p className="sub">
        We added famous married couples to the roster. Every agent only read its own person's public LinkedIn and Instagram and never knew who their spouse was.
        For each person we look at where their real spouse landed in their ranking.
      </p>
      {n === 0 ? <p className="sub">No couples in the current run.</p> : (
        <div className="grid">
          <div className="card"><div className="who">Average spouse rank</div><b style={{ fontSize: 28 }}>{mean.toFixed(1)}</b><div className="who">random chance: {chance.toFixed(1)}</div></div>
          <div className="card"><div className="who">Spouse in top 3</div><b style={{ fontSize: 28 }}>{top3} of {n}</b><div className="who">random chance: {top3Chance.toFixed(1)}</div></div>
          {clean.length > 0 && <div className="card"><div className="who">Without profiles that name the spouse ({clean.length} people)</div><b style={{ fontSize: 28 }}>avg #{cleanMean.toFixed(1)}</b><div className="who">top 3: {cleanTop3} of {clean.length}</div></div>}
          <div className="card"><div className="who">Spouse got a full agent date</div><b style={{ fontSize: 28 }}>{rows.filter((r) => r.dated).length} of {n}</b></div>
        </div>
      )}
      <h2>Per person</h2>
      {rows.map((r) => (
        <div key={r.me + r.spouse} className="card" style={{ marginBottom: 8 }}>
          <div className="row">
            <a href={`/person/${r.me}`}>{people[r.me].name}</a> <span className="who">ranked spouse</span> <a href={`/person/${r.spouse}`}>{people[r.spouse].name}</a>
            {r.named && <span className="chip">profile may name spouse</span>}<b style={{ marginLeft: "auto" }}>#{r.rank} of {r.of}</b>
          </div>
        </div>
      ))}
      <h2>Read this carefully</h2>
      <p className="sub">
        This is a small sample, so treat it as a sanity check and not proof. Marriage doesn't guarantee a perfect fit, and public profiles often say little about someone's home life, so misses are expected.
        Only each person's top matches get a full agent date; the rest are estimated from traits, so a spouse outside that group is scored lower by design.
      </p>
    </>
  );
}
