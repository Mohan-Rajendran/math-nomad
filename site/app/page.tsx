import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { ArticleCard, MathArtwork, NoteCard, ProjectCard } from "./components/ContentCards";
import { articles, homeContent, notes, projects } from "./data";
import LabPage, { metadata as labMetadata } from "./lab/page";
import { canonicalUrl, isLabSite, labRootHref } from "./site-mode";

export const metadata: Metadata = {
  ...(isLabSite
    ? labMetadata
    : {
        title: "Home",
        description:
          "Articles, notes and interactive investigations that make mathematical ideas visible without sanding away their depth.",
      }),
  alternates: { canonical: canonicalUrl("/") },
};

export default function Home() {
  if (isLabSite) return <LabPage />;

  const featuredIdeaArticle = articles.find((article) => article.id === homeContent.featuredIdea.articleId) ?? articles[0];
  const featuredArticle = articles.find((article) => article.id === homeContent.featured.articleId) ?? articles[0];
  const featuredProject = projects.find((project) => project.id === homeContent.featured.projectId) ?? projects[0];

  return (
    <main id="main-content">
      <section className="home-hero page-shell">
        <div className="home-hero-copy">
          <p className="eyebrow">{homeContent.eyebrow}</p>
          <h1>Mathematics worth <br />returning to.</h1>
          <p className="hero-lede">{homeContent.lede}</p>
          <div className="button-row">
            <Link className="button button-primary" href={homeContent.primaryAction.href}>{homeContent.primaryAction.label} <ArrowRight size={17} /></Link>
            <Link className="button button-secondary" href={labRootHref()}>{homeContent.secondaryAction.label} <FlaskConical size={17} /></Link>
          </div>
          <p className="update-line">{homeContent.updateLine}</p>
        </div>
        <div className="hero-art-wrap">
          <MathArtwork variant="orbit" label="Orbit of points arranged around intersecting circles" />
          <p>
            <span>{homeContent.featuredIdea.label}</span>{" "}
            <Link href={featuredIdeaArticle.slug}>{homeContent.featuredIdea.text}</Link>
          </p>
        </div>
      </section>

      <section className="featured-investigation full-bleed-section">
        <div className="page-shell featured-investigation-inner">
          <div>
            <p className="eyebrow eyebrow-light">{homeContent.featured.label}</p>
            <h2>{homeContent.featured.title}</h2>
          </div>
          <div className="featured-copy">
            <p>{homeContent.featured.text}</p>
            <p className="featured-context">
              Beginning with <Link href={featuredArticle.slug}>{featuredArticle.title}</Link>,
              this investigation continues through the {featuredProject.title} project hub.
            </p>
            <Link className="button button-secondary" href={featuredProject.slug}>
              Explore the investigation <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section page-shell">
        <div className="section-heading">
          <div><p className="eyebrow">Recently published</p><h2>New articles</h2></div>
          <Link className="text-link" href="/articles">View all articles <ArrowRight size={15} /></Link>
        </div>
        <div className="article-home-grid">
          {articles.slice(0, 3).map((article) => <ArticleCard article={article} key={article.id} />)}
        </div>
      </section>

      <section className="home-section notes-home-section">
        <div className="page-shell">
          <div className="section-heading">
            <div><p className="eyebrow">Study material</p><h2>Recent notes</h2></div>
            <Link className="text-link" href="/notes">Browse all notes <ArrowRight size={15} /></Link>
          </div>
          <div className="note-grid note-grid-home">
            {notes.filter((note) => note.showOnHomepage).slice(0, 3).map((note) => <NoteCard note={note} key={note.id} />)}
          </div>
        </div>
      </section>

      <section className="home-section page-shell">
        <div className="section-heading">
          <div><p className="eyebrow">From the laboratory</p><h2>Project hubs</h2></div>
          <Link className="text-link" href="/projects">View all projects <ArrowRight size={15} /></Link>
        </div>
        <div className="project-grid project-grid-home">
          {projects.slice(0, 3).map((project, index) => <ProjectCard project={project} index={index} key={project.id} />)}
        </div>
      </section>

    </main>
  );
}
