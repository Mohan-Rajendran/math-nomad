import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";
import type { Interactive, Project } from "../data";
import { journalHref, labProjectHref, labRootHref } from "../site-mode";
import {
  InteractiveCard,
  MathArtwork,
  StatusBadge,
} from "./ContentCards";
import { PublishedInteractive } from "./PublishedInteractive";

export function LabProjectContent({ project }: { project: Project }) {
  return (
    <main id="main-content" className="lab-hub" style={{ "--project-accent": project.accent } as React.CSSProperties}>
      <header className="lab-hub-hero page-shell">
        <div><Link className="back-link" href={labRootHref()}><ArrowLeft size={15} /> Lab catalogue</Link><div className="project-kicker"><span>Project hub</span><StatusBadge status={project.status} /></div><h1>{project.title}</h1><p>{project.question}</p><div className="tag-row">{project.technologies.map((technology) => <span className="tag" key={technology}>{technology}</span>)}</div></div>
        <MathArtwork variant={project.key === "kolam-tiles" ? "lattice" : "orbit"} label={`${project.title} mathematical motif`} />
      </header>
      <section className="page-shell lab-hub-content">
        <aside><p className="eyebrow">Project map</p><nav><a href="#interactives">Interactives</a><a href="#question">The question</a><a href="#writing">Related writing</a><a href="#changes">Recent changes</a></nav></aside>
        <div>
          <section id="interactives"><div className="section-heading"><div><p className="eyebrow">Tools & experiments</p><h2>{project.interactiveCount}</h2></div></div><div className="interactive-grid">{project.interactives.map((interactive) => <InteractiveCard interactive={interactive} projectSlug={project.key} key={interactive.id} />)}</div></section>
          <section className="hub-section" id="question">
            <p className="eyebrow">The central question</p>
            <h2>{project.question}</h2>
            {project.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className="tag-row" aria-label="Project themes">
              {project.themes.map((theme) => <span className="tag" key={theme}>{theme}</span>)}
            </div>
          </section>
          <section className="hub-section related-writing" id="writing">
            <p className="eyebrow">Related writing</p>
            {project.relatedWriting.map((entry) => (
              <Link href={journalHref(entry.href)} key={`${entry.type}-${entry.href}`}>
                <span>{entry.type}</span>
                <strong>{entry.title}</strong>
                <small>{entry.meta}</small>
                <ArrowRight />
              </Link>
            ))}
          </section>
          <section className="hub-section changelog" id="changes">
            <p className="eyebrow">Recent changes</p>
            {project.changelog.map((entry) => (
              <div key={`${entry.date}-${entry.text}`}><time>{entry.date}</time><p>{entry.text}</p></div>
            ))}
            <p className="small-note">All interactives last tested {project.lastTested}.</p>
          </section>
        </div>
      </section>
    </main>
  );
}

export function InteractiveDetailContent({
  project,
  interactive,
}: {
  project: Project;
  interactive: Interactive;
}) {
  return (
    <main id="main-content" className="interactive-detail">
      <header className="interactive-detail-header page-shell">
        <Link className="back-link" href={labProjectHref(project.key)}>
          <ArrowLeft size={15} /> {project.title} hub
        </Link>
        <div className="interactive-title-row">
          <div>
            <p className="eyebrow">Lab / {project.title}</p>
            <h1>{interactive.title}</h1>
            <p>{interactive.description}</p>
          </div>
          <dl>
            <div><dt>Technology</dt><dd>{interactive.technologies.join(" · ")}</dd></div>
            <div><dt>Maturity</dt><dd><CheckCircle2 size={14} /> {interactive.maturity}</dd></div>
            <div><dt>Last tested</dt><dd>{interactive.lastTested}</dd></div>
          </dl>
        </div>
      </header>

      <section className="workbench-wrap page-shell">
        <div className="instructions">
          <FlaskConical />
          <p><strong>Objective</strong> {interactive.objective}</p>
        </div>
        <PublishedInteractive slug={interactive.slug} />
      </section>

      <section className="interactive-context page-shell">
        <div className="tag-row" aria-label="Interactive topics">
          {interactive.topics.map((topic) => <span className="tag" key={topic}>{topic}</span>)}
        </div>
        {interactive.relatedArticle ? (
          <Link className="text-link" href={journalHref(interactive.relatedArticle)}>
            Read the related article <ArrowRight size={15} />
          </Link>
        ) : null}
      </section>
    </main>
  );
}
