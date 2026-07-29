import type { Metadata } from "next";
import { ArticleIndex } from "../components/Indexes";
import { articles } from "../data";
import { journalHref } from "../site-mode";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Mathematical stories developed through examples, visuals, computation and proof.",
  alternates: { canonical: journalHref("/articles") },
};

export default function ArticlesPage() {
  return (
    <main id="main-content" className="page-shell listing-page">
      <header className="page-intro split-intro">
        <div><p className="eyebrow">Essays & explanations</p><h1>Articles</h1></div>
        <p>Mathematical stories developed through examples, visuals, computation and proof.</p>
      </header>
      <ArticleIndex articles={articles} />
    </main>
  );
}
