import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import katex from "katex";
import { CompanionBody } from "../../article-content/nested-roots/CompanionBody";
import "../../article-content/nested-roots/companion.css";

const title = "A Recurrence, a Critical Parameter, and Its Transcendence";
export const dynamic = "force-static";
export const metadata: Metadata = {
  title,
  authors: [{ name: "Mohan R" }],
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
  alternates: { canonical: "https://mathnomad.in/unlisted/nested-roots-and-the-boundary/" },
};

const contents = [
  ["intro", "Introduction"],
  ["panel1", "Experimentation"],
  ["panel2", "Where does the gap come from?"],
  ["panel3", "Which solution is L?"],
  ["panel4", "What kind of number is α?"],
  ["refs", "References"],
];

function articleHtml() {
  const source = readFileSync(
    path.join(process.cwd(), "app/article-content/nested-roots/body.html"), "utf8",
  );
  // Render the supplied TeX at build time using the site's existing math renderer.
  return source.replace(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g, (_match, inline, display) => {
    const tex = (inline ?? display).replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
    const displayMode = display !== undefined;
    const math = katex.renderToString(tex, { displayMode, throwOnError: true, strict: "ignore", trust: false });
    return `<span class="math-expression ${displayMode ? "math-expression-display" : "math-expression-inline"}">${math}</span>`;
  });
}

export default function NestedRootsCompanionPage() {
  return (
    <main id="main-content" className="article-detail nested-roots-detail">
      <header className="article-hero page-shell">
        <Link className="back-link" href="/articles"><ArrowLeft size={15} /> All articles</Link>
        <p className="eyebrow">Research poster · companion page</p>
        <h1>{title}</h1>
        <div className="article-byline">
          <span>Mohan R</span>
          <span>School of Sciences, Azim Premji University, Bengaluru</span>
        </div>
      </header>
      <div className="article-layout is-complete-article page-shell">
        <aside className="article-contents" aria-label="On this page">
          <p>On this page</p>
          <ol>{contents.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol>
        </aside>
        <CompanionBody html={articleHtml()} />
      </div>
    </main>
  );
}
