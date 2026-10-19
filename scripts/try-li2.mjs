import fs from "node:fs";
for (const l of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] = m[2]; }
const call = async (actor, input) => {
  const r = await fetch(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}&timeout=55`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  return [r.status, (await r.text()).replace(/\s+/g, " ").slice(0, 260)];
};
for (const u of ["lucyworsley", "amy-cuddy-3654034", "linalfred"]) {
  console.log("apimaestro", u, ...(await call("apimaestro~linkedin-profile-detail", { username: u })));
  console.log("supreme   ", u, ...(await call("supreme_coder~linkedin-profile-scraper", { urls: [{ url: `https://www.linkedin.com/in/${u}/` }] })));
}
