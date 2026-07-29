import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { ProjectIndex } from "../components/Indexes";
import { projects } from "../data";
import { LAB_SITE_ORIGIN } from "../site-mode";

export const metadata: Metadata = {
  title: "Lab",
  description: "Interactive mathematics organised into connected project hubs.",
  alternates: { canonical: `${LAB_SITE_ORIGIN}/` },
};

export default function LabPage() {
  return (
    <main id="main-content" className="lab-page">
      <header className="lab-hero">
        <div className="page-shell">
          <div className="lab-brand"><FlaskConical /><span>Math Nomad <strong>Lab</strong></span></div>
          <p className="eyebrow eyebrow-light">Interactive mathematics</p>
          <h1>Experiments with<br />a longer life.</h1>
          <p>Interactive mathematics organised as projects rather than isolated demonstrations. Each tool belongs to a question, a body of writing and a revision history.</p>
        </div>
      </header>
      <section className="page-shell lab-catalogue">
        <div className="lab-intro"><div><p className="eyebrow">Project catalogue</p><h2>Choose an investigation</h2></div><p>Filter by the technology behind an interactive or by its current stage of development.</p></div>
        <ProjectIndex projects={projects} lab />
      </section>
      <section className="lab-return"><div className="page-shell"><p>The Lab is one part of Math Nomad.</p><Link href="https://mathnomad.in/"><ArrowLeft size={16} /> Return to the journal</Link></div></section>
    </main>
  );
}
