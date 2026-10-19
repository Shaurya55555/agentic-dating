import "./globals.css";

export const metadata = {
  title: "Agentic Dating",
  description: "Every person gets an agent. The agents go on the dates. You get the ranking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <b>Agentic Dating</b>
          <a href="/">People</a>
          <a href="/rankings">Rankings</a>
          <a href="/reality">Reality check</a>
          <a href="/try">Try it</a>
        </nav>
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
