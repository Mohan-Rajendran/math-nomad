import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CircleDot, Compass, Eye, PencilRuler } from "lucide-react";
import { journalHref } from "../site-mode";

export const metadata: Metadata = {
  title: "About",
  description: "About Mohan R and the Math Nomad project.",
  alternates: { canonical: journalHref("/about") },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="about-page">
      <section className="page-shell about-hero">
        <div className="portrait-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="portrait-image"
            src="/mohan-r.jpeg"
            alt="Mohan R"
            width="720"
            height="900"
          />
        </div>
        <div className="about-hero-copy">
          <p className="eyebrow">About</p>
          <h1>A place for mathematics<br />to travel further.</h1>
          <p className="about-lede">I’m <a href="https://azimpremjiuniversity.edu.in/people/mohan-r" target="_blank" rel="noreferrer">Mohan R <ArrowUpRight size={16} /></a>, a mathematician and teacher at Azim Premji University. I care about examples that invite a second look, proofs whose structure remains visible, and diagrams that do more than decorate an argument.</p>
        </div>
      </section>

      <section className="about-columns page-shell">
        <article><h2>About Mohan</h2><p>Teaching continually produces questions, sketches, handouts and small computational experiments. This website is where I revise those fragments into material that can travel beyond a particular classroom.</p><a className="text-link" href="https://azimpremjiuniversity.edu.in/people/mohan-r" target="_blank" rel="noreferrer">University profile <ArrowUpRight size={15} /></a></article>
        <article><h2>About Math Nomad</h2><p>Math Nomad is an independent mathematical journal and laboratory. Articles tell a sustained story, Notes retain the useful texture of teaching material, and Projects connect both to experiments in the Lab.</p><Link className="text-link" href="/projects">Explore the projects <ArrowUpRight size={15} /></Link></article>
      </section>

      <section className="principles-section">
        <div className="page-shell principles-inner">
          <div><p className="eyebrow eyebrow-light">Editorial principles</p><h2>How Math Nomad works</h2><p>Each format has a different job, but they share the same standards of clarity, context and revision.</p></div>
          <ol className="principle-list">
            <li><Compass /><span><strong>Begin with a question worth carrying.</strong><small>A good entry opens a path rather than merely naming a topic.</small></span></li>
            <li><Eye /><span><strong>Let examples and pictures reveal structure.</strong><small>Visuals should participate in the explanation.</small></span></li>
            <li><CircleDot /><span><strong>Keep proofs visible.</strong><small>Assumptions, transitions and limitations stay explicit.</small></span></li>
            <li><PencilRuler /><span><strong>Treat interactives as experiments.</strong><small>Every control should sharpen a mathematical question.</small></span></li>
          </ol>
        </div>
      </section>

      <section className="page-shell corrections-section"><p className="eyebrow">Corrections & revisions</p><div><h2>Built slowly, revised openly.</h2><p>Mathematics benefits from careful readers. Each note records its revision date, and substantial corrections will be listed with the relevant entry.</p></div></section>
    </main>
  );
}
