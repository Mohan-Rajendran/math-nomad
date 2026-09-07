import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  LawOfCosinesArticleBody,
  PythagorasArticleBody,
} from "../../article-content/GeometryArticles";
import {
  BinaryKolamArticleBody,
  OctahedronArticleBody,
} from "../../article-content/KolamArticles";
import { StirlingBoundsArticleBody } from "../../article-content/StirlingBoundsArticle";
import { Tag } from "../../components/ContentCards";
import { articles, type Article } from "../../data";

const articleBodies = {
  "infinitely-many-proofs-of-pythagoras": PythagorasArticleBody,
  "kolams-on-an-octahedron": OctahedronArticleBody,
  "law-of-cosines": LawOfCosinesArticleBody,
  "binary-kolam-tiles": BinaryKolamArticleBody,
  "moving-the-starting-line-in-stirlings-formula": StirlingBoundsArticleBody,
} as const;

const articleTocIds: Record<keyof typeof articleBodies, readonly string[]> = {
  "infinitely-many-proofs-of-pythagoras": [
    "pythagoras-explore",
    "pythagoras-one-slider",
    "pythagoras-two-tilings",
    "pythagoras-overlay",
    "pythagoras-phases",
    "pythagoras-moving-family",
  ],
  "kolams-on-an-octahedron": [
    "from-square-to-surface",
    "eight-tiles",
    "dual-cube",
    "six-edges",
    "three-trees",
    "octa-symmetry",
  ],
  "law-of-cosines": [
    "cosines-shape-space",
    "cosines-explore",
    "cosines-vectors",
    "cosines-parallelograms",
    "cosines-reading-proof",
    "cosines-anchor",
  ],
  "binary-kolam-tiles": [
    "threshold",
    "six-to-sixteen",
    "play",
    "bits",
    "sat",
    "symmetry",
    "burnside",
  ],
  "moving-the-starting-line-in-stirlings-formula": [
    "stirling-geometric-core",
    "stirling-move-start",
    "stirling-real-extension",
  ],
};

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug.split("/").filter(Boolean).at(-1)!,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === `/articles/${slug}`);
  return article
    ? {
        title: article.title,
        description: article.glimpse,
        authors: [{ name: "Mohan Rajendran" }],
        keywords: [...article.keywords],
        robots: article.draft ? { index: false, follow: false } : undefined,
        alternates: { canonical: article.sourceHref },
        openGraph: {
          type: "article",
          title: article.title,
          description: article.glimpse,
          ...(article.draft ? {} : { publishedTime: article.published }),
          modifiedTime: article.modified,
          authors: ["Mohan Rajendran"],
          images: article.imageSrc
            ? [{ url: article.imageSrc, alt: article.imageAlt ?? article.artLabel }]
            : undefined,
        },
        other: {
          citation_author: "Mohan Rajendran",
          citation_title: article.title,
          ...(article.draft
            ? { citation_status: "unpublished draft" }
            : { citation_publication_date: article.published.slice(0, 10) }),
          citation_journal_title: "Math Nomad",
          citation_public_url: article.sourceHref,
          citation_keywords: article.keywords.join("; "),
          citation_msc: article.msc.map((item) => item.code).join("; "),
          "DC.Subject": article.msc.map((item) => item.code).join(", "),
        },
      }
    : { title: "Article not found" };
}

function ArticleScholarlyMetadata({ article }: { article: Article }) {
  const preferredCitation = article.draft
    ? `Rajendran, Mohan. “${article.title}.” Unpublished Math Nomad draft.`
    : `Rajendran, Mohan. “${article.title}.” Math Nomad, ${article.displayDate}, ${article.sourceHref}`;
  const biblatex = article.draft
    ? `@unpublished{${article.citationKey},
  author       = {Rajendran, Mohan},
  title        = {${article.title}},
  note         = {Unpublished Math Nomad draft},
  langid       = {british}
}`
    : `@online{${article.citationKey},
  author       = {Rajendran, Mohan},
  title        = {${article.title}},
  date         = {${article.published.slice(0, 10)}},
  organization = {Math Nomad},
  url          = {${article.sourceHref}},
  langid       = {british}
}`;

  return (
    <section className="article-section article-scholarly-metadata" aria-labelledby="article-information-heading">
      <h2 id="article-information-heading">Article information</h2>

      <div className="article-metadata-group">
        <h3>Keywords</h3>
        <p className="article-keywords">{article.keywords.join(" · ")}</p>
      </div>

      <div className="article-metadata-group">
        <h3>Mathematics Subject Classification (2020)</h3>
        <ul className="article-msc-list">
          {article.msc.map((item) => (
            <li key={item.code}>
              <span>{item.role}</span>
              <a
                href={`https://mathscinet.ams.org/mathscinet/msc/msc2020.html?t=${item.code}`}
                target="_blank"
                rel="noreferrer"
              >
                {item.code}
              </a>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="article-metadata-group citation-information">
        <h3>Cite this article</h3>
        <p>{preferredCitation}</p>
        <details>
          <summary>BibLaTeX</summary>
          <pre><code>{biblatex}</code></pre>
        </details>
      </div>
    </section>
  );
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === `/articles/${slug}`);
  if (!article) notFound();

  const index = articles.findIndex((item) => item.id === article.id);
  const next = articles[(index + 1) % articles.length] ?? article;
  const articleKey = article.key as keyof typeof articleBodies;
  const ArticleBody = articleBodies[articleKey];
  const contents = article.contents;
  const tocIds = articleTocIds[articleKey];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.glimpse,
    author: { "@type": "Person", name: "Mohan Rajendran" },
    ...(article.draft ? {} : { datePublished: article.published }),
    dateModified: article.modified,
    image: article.imageSrc,
    keywords: article.keywords,
    about: article.msc.map((item) => ({
      "@type": "DefinedTerm",
      termCode: item.code,
      name: item.label,
      inDefinedTermSet: "MSC2020",
    })),
    mainEntityOfPage: article.sourceHref,
  };

  return (
    <main
      id="main-content"
      className={`article-detail${
        article.key === "moving-the-starting-line-in-stirlings-formula"
          ? " stirling-article-detail"
          : ""
      }`}
      style={
        {
          "--article-accent": article.palette.color,
          "--article-wash": article.palette.wash,
          "--article-ink": article.palette.ink,
        } as React.CSSProperties
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="article-hero page-shell">
        <Link className="back-link" href="/articles">
          <ArrowLeft size={15} /> All articles
        </Link>
        <div className="article-identity-tags" aria-label="Audience and article type">
          {article.audience.map((audience) => (
            <Tag key={`audience-${audience}`}>{audience}</Tag>
          ))}
          <Tag>{article.articleType}</Tag>
        </div>
        <h1>{article.title}</h1>
        <p className="article-standfirst">{article.subtitle}</p>
        <div className="article-byline">
          <span>By Mohan R</span>
          <span>{article.draft ? `Draft · ${article.displayDate}` : article.displayDate}</span>
          <span>{article.readingTime} read</span>
        </div>
        <div className="tag-row" aria-label="Article topics">
          {article.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </header>

      <div className="article-layout is-complete-article page-shell">
        <aside className="article-contents">
          <p>On this page</p>
          <ol>
            {contents.map((item, contentIndex) => {
              const targetId = tocIds[contentIndex];
              return (
                <li key={`${item}-${contentIndex}`}>
                  <a href={`#${targetId}`}>{item}</a>
                </li>
              );
            })}
          </ol>
        </aside>

        <article className="prose article-prose is-complete-article">
          <ArticleBody />
          <ArticleScholarlyMetadata article={article} />
        </article>
      </div>

      <nav className="next-entry page-shell" aria-label="Next article">
        <span>Next article</span>
        <Link href={next.slug}>
          {next.title} <ArrowRight />
        </Link>
      </nav>
    </main>
  );
}
