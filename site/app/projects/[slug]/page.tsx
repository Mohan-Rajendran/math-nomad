import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";
import { InteractiveCard, MathArtwork, StatusBadge } from "../../components/ContentCards";
import { LabProjectContent } from "../../components/LabRouteContent";
import { projects } from "../../data";
import {
  canonicalUrl,
  isLabSite,
  labProjectHref,
} from "../../site-mode";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.key === slug);
  return project
    ? {
        title: isLabSite ? `${project.title} Lab` : project.title,
        description: isLabSite ? project.question : project.description,
        alternates: {
          canonical: isLabSite
            ? canonicalUrl(`/projects/${project.key}/`)
            : project.sourceHref,
        },
      }
    : { title: "Project not found" };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.key === slug);
  if (!project) notFound();
  if (isLabSite) return <LabProjectContent project={project} />;

  return (
    <main id="main-content" className="project-detail" style={{ "--project-accent": project.accent } as React.CSSProperties}>
      <section className="project-detail-hero page-shell">
        <div className="project-hero-copy"><Link className="back-link" href="/projects"><ArrowLeft size={15} /> All projects</Link><div className="project-kicker"><StatusBadge status={project.status} /><span>{project.interactiveCount}</span></div><h1>{project.title}</h1><p>{project.description}</p><Link className="button button-primary" href={labProjectHref(project.key)}><FlaskConical size={17} /> Open project in the Lab</Link></div>
        <MathArtwork variant={project.key === "kolam-tiles" ? "lattice" : "tiles"} label={`${project.title} project pattern`} />
      </section>
      <section className="project-overview page-shell">
        <p className="eyebrow">The investigation</p>
        <div>
          <h2>{project.question}</h2>
          {project.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="tag-row" aria-label="Project themes">
            {project.themes.map((theme) => <span className="tag" key={theme}>{theme}</span>)}
          </div>
        </div>
      </section>
      <section className="project-interactives"><div className="page-shell"><div className="section-heading"><div><p className="eyebrow">Try it yourself</p><h2>Interactives in this project</h2></div><Link className="text-link" href={labProjectHref(project.key)}>View the Lab hub <ArrowRight size={15} /></Link></div><div className="interactive-grid">{project.interactives.map((interactive) => <InteractiveCard interactive={interactive} projectSlug={project.key} key={interactive.id} />)}</div></div></section>
      <section className="project-method page-shell">
        <div><p className="eyebrow">Method & scope</p><h2>How this project works</h2></div>
        <div>
          <p>{project.methodology}</p>
          <p className="small-note">Interactives last tested {project.lastTested}.</p>
        </div>
      </section>
    </main>
  );
}
