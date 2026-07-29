import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectIndex } from "../components/Indexes";
import { projects } from "../data";
import { canonicalUrl, labRootHref } from "../site-mode";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Long-running mathematical investigations and their interactive experiments.",
  alternates: { canonical: canonicalUrl("/projects/") },
};

export default function ProjectsPage() {
  return (
    <main id="main-content">
      <section className="page-shell listing-page">
        <header className="page-intro split-intro projects-intro">
          <div><p className="eyebrow">Investigations over time</p><h1>Projects</h1></div>
          <div><p>Long-running mathematical investigations, brought together through essays, notes and interactive experiments.</p><Link href={labRootHref()} className="text-link">Open the complete Lab catalogue <ArrowRight size={15} /></Link></div>
        </header>
        <ProjectIndex projects={projects} />
      </section>
    </main>
  );
}
