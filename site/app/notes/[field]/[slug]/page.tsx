import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FlaskConical } from "lucide-react";
import { Math } from "../../../components/Math";
import { notes } from "../../../data";
import { labInteractiveHref } from "../../../site-mode";

export function generateStaticParams() {
  return notes.map((note) => {
    const [, , field, slug] = note.slug.split("/");
    return { field, slug };
  });
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ field: string; slug: string }>;
}): Promise<Metadata> {
  const { field, slug } = await params;
  const note = notes.find((item) => item.slug === `/notes/${field}/${slug}`);
  return note
    ? {
        title: note.title,
        description: note.abstract,
        alternates: { canonical: note.sourceHref },
      }
    : { title: "Note not found" };
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ field: string; slug: string }>;
}) {
  const { field, slug } = await params;
  const note = notes.find((item) => item.slug === `/notes/${field}/${slug}`);
  if (!note) notFound();

  return (
    <main id="main-content" className="note-detail page-shell">
      <Link className="back-link" href="/notes">
        <ArrowLeft size={15} /> All notes
      </Link>

      <header className="note-detail-header">
        <p className="eyebrow">Notes / {note.field}</p>
        <h1>{note.title}</h1>
        <p>{note.abstract}</p>
      </header>

      <div className="note-detail-grid">
        <aside className="note-metadata">
          <dl>
            <div><dt>Kind</dt><dd>{note.kind}</dd></div>
            <div><dt>Audience</dt><dd>{note.level.join(" · ")}</dd></div>
            <div><dt>Format</dt><dd>{note.format}</dd></div>
            <div><dt>Published</dt><dd>{note.published}</dd></div>
          </dl>
          <Link className="button button-primary" href={labInteractiveHref("kolam-tiles", "square-kolam-tile-challenge")}>
            <FlaskConical size={16} /> Launch the board
          </Link>
          <Link className="button button-secondary" href="/articles/binary-kolam-tiles">
            Read the exposition <ArrowUpRight size={15} />
          </Link>
        </aside>

        <article className="prose note-prose" id="note">
          <div className="note-caution">
            <strong>Caution:</strong> These notes might contain errors and the revised notes will be reposted regularly.
          </div>

          <p>
            This investigation begins with an object students can act on, then
            moves from observation to mathematical language. It can be used
            with upper-secondary students, undergraduate problem-solving
            groups, teacher circles or mathematics clubs.
          </p>

          <div className="definition note-central-question">
            <strong>Central question</strong>
            <p>
              Can every binary tile from <Math tex={String.raw`\mathtt{0000}`} /> to{" "}
              <Math tex={String.raw`\mathtt{1111}`} /> be used exactly once in a{" "}
              <Math tex={String.raw`4\times4`} /> square so that the boundary is closed,
              adjacent sides match and the fifteen nonzero tiles form one
              connected network?
            </p>
          </div>

          <h2>A possible classroom rhythm</h2>
          <div className="note-rhythm-grid">
            <section>
              <h3>Begin</h3>
              <p>Let groups work on the construction board with only the goal visible. Ask them to keep one failed arrangement that taught them something.</p>
            </section>
            <section>
              <h3>Discuss</h3>
              <p>Which requirements can be checked one edge at a time? Which can only be checked after seeing the whole board? What quantities might be counted before searching?</p>
            </section>
            <section>
              <h3>Extend</h3>
              <p>Set aside the <Math tex={String.raw`\mathtt{0000}`} /> tile and permit only sliding moves into its empty position. Ask whether every correct arrangement can now reach every other correct arrangement.</p>
            </section>
            <section>
              <h3>Record</h3>
              <p>Invite groups to state one conjecture, one piece of evidence and one question their evidence does not settle.</p>
            </section>
          </div>

          <h2>Problems to carry further</h2>

          <h3>Counting boundary bits</h3>
          <p>
            The sixteen four-bit tiles contain thirty-two <Math tex="1" />s in
            total. If all boundary bits of a <Math tex={String.raw`4\times4`} /> arrangement
            are <Math tex="0" />, what does this force about the number of active
            shared edges inside the board? What necessary conditions can you
            extract before attempting a construction?
          </p>

          <h3>Local rules, multiple loops</h3>
          <p>
            Construct an arrangement in which the boundary closes and every
            adjacent pair matches, but the drawing has more than one connected
            component. What is the smallest board on which this can happen if
            repeated tiles are allowed?
          </p>

          <h3>Sliding between valid boards</h3>
          <p>
            Start and finish with accepted configurations, but allow arbitrary
            intermediate configurations. Which features of the labelled
            15-puzzle are unchanged by every legal slide? How would you compute
            the invariant without first finding a path?
          </p>

          <h2>Teacher notes</h2>
          <ul>
            <li>Do not introduce the bit order until students need a compact way to record tiles.</li>
            <li>Treat a nearly correct board as data: a boundary leak, mismatched edge or extra component suggests a different invariant.</li>
            <li>When sliding begins, say explicitly that intermediate positions may violate the kolam conditions.</li>
            <li>Separate evidence from proof. A complete computer enumeration can verify a finite claim, but students should still identify what was enumerated and why the program covers every case.</li>
          </ul>
        </article>
      </div>
    </main>
  );
}
