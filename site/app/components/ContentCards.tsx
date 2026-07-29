import Link from "next/link";
import type { Article, Interactive, Note, Project } from "../data";
import { labInteractiveHref } from "../site-mode";

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="tag">{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const statusClass = status.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
  return <span className={`status status-${statusClass}`}>{status}</span>;
}

export function MathArtwork({
  variant = "orbit",
  label = "Decorative mathematical pattern",
}: {
  variant?: "orbit" | "lattice" | "waves" | "tiles" | "vectors" | "modular";
  label?: string;
}) {
  return (
    <div className={`math-art math-art-${variant}`} role="img" aria-label={label}>
      <span className="art-ring art-ring-one" />
      <span className="art-ring art-ring-two" />
      <span className="art-dot art-dot-one" />
      <span className="art-dot art-dot-two" />
      <span className="art-dot art-dot-three" />
      <span className="art-line art-line-one" />
      <span className="art-line art-line-two" />
    </div>
  );
}

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <article className={`article-card ${featured ? "article-card-featured" : ""}`}>
      <div className="article-card-topline">
        <div className="card-meta">
          <span>{article.date}</span>
          <span aria-hidden="true">·</span>
          <span>{article.readingTime}</span>
        </div>
        <div className="article-identity-tags" aria-label="Audience and article type">
          {article.audience.map((audience) => (
            <Tag key={`${article.id}-${audience}`}>{audience}</Tag>
          ))}
          <Tag>{article.articleType}</Tag>
        </div>
      </div>
      <h3>
        <Link href={article.slug}>{article.title}</Link>
      </h3>
      <p>{article.glimpse}</p>
      <div className="tag-row" aria-label="Topics">
        {article.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </article>
  );
}

export function NoteCard({ note }: { note: Note }) {
  return (
    <article className="note-card">
      <div className="note-card-topline">
        <span>{note.kind}</span>
        <span>{note.level.join(" · ")}</span>
      </div>
      <h3>
        <Link href={note.slug}>{note.title}</Link>
      </h3>
      <p>{note.abstract}</p>
    </article>
  );
}

const projectArt: Array<"lattice" | "orbit" | "tiles" | "vectors" | "waves" | "modular"> = [
  "lattice",
  "orbit",
  "tiles",
  "vectors",
  "waves",
  "modular",
];

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <article className="project-card" style={{ "--project-accent": project.accent } as React.CSSProperties}>
      <Link className="project-art-link" href={project.slug} aria-label={`Explore ${project.title}`}>
        <MathArtwork variant={projectArt[index % projectArt.length]} label={`${project.title} mathematical motif`} />
      </Link>
      <div className="project-card-body">
        <div className="project-card-kicker">
          <StatusBadge status={project.status} />
          <span>{project.interactiveCount}</span>
        </div>
        <h3>
          <Link href={project.slug}>{project.title}</Link>
        </h3>
        <p>{project.description}</p>
        <div className="project-card-footer">
          <span>{project.technologies.join(" · ")}</span>
        </div>
      </div>
    </article>
  );
}

export function InteractiveCard({ interactive, projectSlug }: { interactive: Interactive; projectSlug: string }) {
  const href = labInteractiveHref(projectSlug, interactive.slug);
  return (
    <article className="interactive-card">
      <div>
        <span className="interactive-number">{interactive.id}</span>
        <StatusBadge status={interactive.status} />
      </div>
      <h3><Link href={href}>{interactive.title}</Link></h3>
      <p>{interactive.description}</p>
      <div className="interactive-card-footer">
        <span>{interactive.technologies.join(" · ")}</span>
      </div>
    </article>
  );
}
