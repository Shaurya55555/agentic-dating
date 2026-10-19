"use client";
import { useState } from "react";

// Paste a LinkedIn + public Instagram URL: scrape, analyze, then date against the demo roster.
export default function Try() {
  const [li, setLi] = useState("");
  const [ig, setIg] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [me, setMe] = useState(null);
  const [results, setResults] = useState([]);
  const say = (m) => setLog((l) => [...l, m]);

  async function post(url, body) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Request failed");
    return j;
  }

  async function run() {
    setBusy(true); setLog([]); setMe(null); setResults([]);
    try {
      say("Scraping LinkedIn and Instagram, then reading them...");
      const { profile } = await post("/api/profile", { linkedin: li.trim(), instagram: ig.trim() });
      setMe(profile);
      say(`Agent built for ${profile.name}. Picking likely matches from the roster...`);
      const demo = await (await fetch("/api/roster")).json();
      const cand = demo.matches.length ? await post("/api/shortlist", { profile }) : { top: [] };
      const out = [];
      for (const other of cand.top) {
        say(`Dating ${other.name}...`);
        const d = await post("/api/date", { a: profile, b: other });
        out.push({ other, d, score: Math.round(0.35 * other.quick + 0.65 * d.score) });
        setResults([...out].sort((x, y) => y.score - x.score));
      }
      say("Done.");
    } catch (e) {
      say("Error: " + e.message);
    }
    setBusy(false);
  }

  return (
    <>
      <h1>Try it with your own links</h1>
      <p className="sub">Public LinkedIn profile and a public Instagram profile. Your agent reads both, dates the people on the roster, and ranks them for you. Takes a couple of minutes.</p>
      <input placeholder="https://www.linkedin.com/in/your-name/" value={li} onChange={(e) => setLi(e.target.value)} />
      <input placeholder="https://www.instagram.com/your-handle/" value={ig} onChange={(e) => setIg(e.target.value)} />
      <button disabled={busy || !li || !ig} onClick={run}>{busy ? "Dating..." : "Send my agent on dates"}</button>
      <div className="log" style={{ marginTop: 14 }}>{log.join("\n")}</div>
      {me && (
        <div className="card" style={{ marginTop: 16 }}>
          <b>{me.name}</b> · {me.tagline}
          <p>{me.summary}</p>
          <div>{me.needs?.map((x) => <span key={x} className="chip need">{x}</span>)}</div>
          <div>{me.hobbies?.map((x) => <span key={x} className="chip hob">{x}</span>)}</div>
          <div>{me.interests?.map((x) => <span key={x} className="chip">{x}</span>)}</div>
        </div>
      )}
      {results.length > 0 && <h2>Your ranking</h2>}
      {results.map((r, i) => (
        <div key={r.other.id} className="card" style={{ marginBottom: 8 }}>
          <div className="row"><b>#{i + 1}</b> <a href={`/person/${r.other.id}`}>{r.other.name}</a><span style={{ marginLeft: "auto" }}>{r.score}</span></div>
          <div className="who">{r.d.verdict}</div>
          <details><summary className="who">Read the date</summary>
            {r.d.transcript.map((t, k) => <div key={k} className={"bubble" + (t.speaker === me.name ? "" : " r")}><div className="who">{t.speaker}</div>{t.text}</div>)}
          </details>
        </div>
      ))}
    </>
  );
}
