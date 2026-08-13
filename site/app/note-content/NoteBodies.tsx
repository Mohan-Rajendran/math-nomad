import type { ComponentType } from "react";
import { Math } from "../components/Math";
import { PdfEmbed } from "../components/PdfEmbed";
import type { Note, NoteBodyKey, NoteResource } from "../data";

export type NoteBodyProps = {
  note: Note;
};

function KolamInvestigationBody() {
  return (
    <>
      <p>
        This investigation begins with an object students can act on, then
        moves from observation to mathematical language. It can be used with
        upper-secondary students, undergraduate problem-solving groups,
        teacher circles or mathematics clubs.
      </p>

      <div className="definition note-central-question">
        <strong>Central question</strong>
        <p>
          Can every binary tile from <Math tex={String.raw`\mathtt{0000}`} /> to{" "}
          <Math tex={String.raw`\mathtt{1111}`} /> be used exactly once in a{" "}
          <Math tex={String.raw`4\times4`} /> square so that the boundary is closed,
          adjacent sides match and the fifteen nonzero tiles form one connected
          network?
        </p>
      </div>

      <h2>A possible classroom rhythm</h2>
      <div className="note-rhythm-grid">
        <section>
          <h3>Begin</h3>
          <p>
            Let groups work on the construction board with only the goal visible.
            Ask them to keep one failed arrangement that taught them something.
          </p>
        </section>
        <section>
          <h3>Discuss</h3>
          <p>
            Which requirements can be checked one edge at a time? Which can only
            be checked after seeing the whole board? What quantities might be
            counted before searching?
          </p>
        </section>
        <section>
          <h3>Extend</h3>
          <p>
            Set aside the <Math tex={String.raw`\mathtt{0000}`} /> tile and permit
            only sliding moves into its empty position. Ask whether every correct
            arrangement can now reach every other correct arrangement.
          </p>
        </section>
        <section>
          <h3>Record</h3>
          <p>
            Invite groups to state one conjecture, one piece of evidence and one
            question their evidence does not settle.
          </p>
        </section>
      </div>

      <h2>Problems to carry further</h2>

      <h3>Counting boundary bits</h3>
      <p>
        The sixteen four-bit tiles contain thirty-two <Math tex="1" />s in total.
        If all boundary bits of a <Math tex={String.raw`4\times4`} /> arrangement
        are <Math tex="0" />, what does this force about the number of active
        shared edges inside the board? What necessary conditions can you extract
        before attempting a construction?
      </p>

      <h3>Local rules, multiple loops</h3>
      <p>
        Construct an arrangement in which the boundary closes and every adjacent
        pair matches, but the drawing has more than one connected component. What
        is the smallest board on which this can happen if repeated tiles are
        allowed?
      </p>

      <h3>Sliding between valid boards</h3>
      <p>
        Start and finish with accepted configurations, but allow arbitrary
        intermediate configurations. Which features of the labelled 15-puzzle
        are unchanged by every legal slide? How would you compute the invariant
        without first finding a path?
      </p>

      <h2>Teacher notes</h2>
      <ul>
        <li>
          Do not introduce the bit order until students need a compact way to
          record tiles.
        </li>
        <li>
          Treat a nearly correct board as data: a boundary leak, mismatched edge
          or extra component suggests a different invariant.
        </li>
        <li>
          When sliding begins, say explicitly that intermediate positions may
          violate the kolam conditions.
        </li>
        <li>
          Separate evidence from proof. A complete computer enumeration can
          verify a finite claim, but students should still identify what was
          enumerated and why the program covers every case.
        </li>
      </ul>
    </>
  );
}

function NoteInformation({ note }: { note: Note }) {
  if (!note.keywords?.length && !note.msc?.length && !note.citationKey) {
    return null;
  }

  const pdf = note.resources.find(
    (resource): resource is Extract<NoteResource, { kind: "PDF" }> =>
      resource.kind === "PDF",
  );
  const citation = `Mohan R. “${note.title}: ${note.subtitle}.” ${note.citationSeries ?? "Math Nomad"}, ${note.published}, ${pdf?.pages ? `${pdf.pages} pp., ` : ""}${note.sourceHref}`;
  const biblatex = `@online{${note.citationKey},
  author       = {{Mohan R}},
  title        = {${note.title}: ${note.subtitle}},
  date         = {${note.publishedAt}},
  organization = {Math Nomad},
  url          = {${note.sourceHref}},
  langid       = {british}
}`;

  return (
    <section className="note-information" aria-labelledby="note-information-heading">
      <h2 id="note-information-heading">Note information</h2>

      {note.keywords?.length ? (
        <div className="article-metadata-group">
          <h3>Keywords</h3>
          <p className="article-keywords">{note.keywords.join(" · ")}</p>
        </div>
      ) : null}

      {note.msc?.length ? (
        <div className="article-metadata-group">
          <h3>Mathematics Subject Classification (2020)</h3>
          <ul className="article-msc-list">
            {note.msc.map((item) => (
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
      ) : null}

      {note.citationKey ? (
        <div className="article-metadata-group citation-information">
          <h3>Cite this note</h3>
          <p>{citation}</p>
          <details>
            <summary>BibLaTeX</summary>
            <pre>
              <code>{biblatex}</code>
            </pre>
          </details>
        </div>
      ) : null}

      {note.proofStatus ? (
        <div className="article-metadata-group">
          <h3>Mathematical status</h3>
          <p className="article-keywords">{note.proofStatus}</p>
        </div>
      ) : null}
    </section>
  );
}

function RowReductionExpositionBody({ note }: NoteBodyProps) {
  const pdf = note.resources.find(
    (resource): resource is Extract<NoteResource, { kind: "PDF" }> =>
      resource.kind === "PDF",
  );
  if (!pdf) return null;

  return (
    <>
      <p className="note-opening">
        Row reduction is usually introduced as a reliable sequence of
        instructions: exchange two rows, multiply a row by a nonzero scalar, or
        add a multiple of one row to another. The procedure is familiar, but its
        geometry can remain hidden. If two equations describe lines in the
        plane, a row operation may replace one of those lines by a visibly
        different line. Why does the solution remain unchanged, and what
        information survives after the original equations have disappeared?
      </p>
      <p>
        The short answer is that row reduction changes the generating equations
        but preserves their <strong>row space</strong>. Reduced row echelon form
        is the unique, coordinate-adapted basis selected for that invariant
        space.
      </p>

      <h2>Two lines, one intersection</h2>
      <p>Consider the two systems</p>
      <Math
        display
        tex={String.raw`\left\{\begin{aligned}
          2x+y&=7,\\
          x-y&=2
        \end{aligned}\right.
        \qquad\text{and}\qquad
        \left\{\begin{aligned}
          x+y&=4,\\
          3x-y&=8.
        \end{aligned}\right.`}
      />
      <p>
        They have no equation in common, yet both reduce to the augmented matrix
      </p>
      <Math
        display
        tex={String.raw`\begin{bmatrix}1&0&3\\0&1&1\end{bmatrix}.`}
      />
      <p>
        The reduced equations are <Math tex="x=3" /> and <Math tex="y=1" />, so
        their common solution is <Math tex="(3,1)" />. Geometrically, these are
        the vertical and horizontal lines through that solution point. The
        original systems are different choices of two lines through the same
        point.
      </p>

      <h2>The object that does not move</h2>
      <p>
        What the two systems share is the two-dimensional space generated by
        their augmented rows. More generally, for matrices <Math tex="M" /> and{" "}
        <Math tex="N" /> of the same size, the guiding theorem is
      </p>
      <Math
        display
        tex={String.raw`M\sim_{\mathrm{row}}N
          \quad\Longleftrightarrow\quad
          \operatorname{Row}(M)=\operatorname{Row}(N).`}
      />
      <p>
        An elementary row operation is an invertible change of generators for
        this space. It may alter every displayed equation, but it cannot alter
        the space of equations they generate. The change is invertible, so the
        new equations vanish simultaneously at exactly the same points as the
        old ones.
      </p>
      <p>
        An augmented row <Math tex="(\alpha,\beta,\gamma)" />{" "}may be read as the
        affine-linear function{" "}
        <Math tex="f(x,y)=\alpha x+\beta y-\gamma" />. For a fixed point{" "}
        <Math tex="P=(a,b)" />, all affine-linear functions vanishing at{" "}
        <Math tex="P" />{" "}form the space
      </p>
      <Math
        display
        tex={String.raw`V_P=\{u(x-a)+v(y-b):u,v\in\mathbb{R}\}.`}
      />
      <p>
        Any two independent line equations through <Math tex="P" />{" "}form an
        ordered basis of <Math tex="V_P" />. Row reduction changes that basis
        while leaving <Math tex="V_P" />{" "}fixed.
      </p>

      <h2>A coordinate-adapted basis</h2>
      <p>
        In the full-rank two-variable case, RREF selects the especially simple
        basis <Math tex="x-a" /> and <Math tex="y-b" />. It therefore presents
        the same equation space through the coordinate lines <Math tex="x=a" />{" "}
        and <Math tex="y=b" />. This is why RREF remembers the solution point in
        this particular case. The more fundamental statement, which also makes
        sense for singular and inconsistent systems, is that it remembers the
        row space and forgets the ordered generating rows.
      </p>
      <p>
        There is a visible motion behind elimination. If two lines with
        equations <Math tex="f_1=0" /> and <Math tex="f_2=0" /> meet at{" "}
        <Math tex="P" />, the operation <Math tex="f_2\mapsto f_2+t f_1" />{" "}
        replaces the second line by another line through <Math tex="P" />. As{" "}
        <Math tex="t" /> varies, the line moves through the pencil centred at{" "}
        <Math tex="P" />. Cancelling one coefficient selects the horizontal
        member; cancelling the other selects the vertical member.
      </p>

      <h2>What the full note develops</h2>
      <p>
        The projective viewpoint places consistent and inconsistent rank-two
        systems in one larger picture. The two-dimensional row spaces of{" "}
        <Math tex={String.raw`2\times3`} /> matrices form the Grassmannian{" "}
        <Math tex={String.raw`\operatorname{Gr}(2,3)\cong\mathbb{RP}^2`} />.
        Systems with a finite solution occupy its affine part; distinct parallel
        lines appear at infinity through their common direction. This does not
        give an inconsistent system an affine solution—it records the direction
        its equations share.
      </p>
      <p>
        For a general system <Math tex="Ax=c" />, the same principle survives.
        Invertible row operations preserve the augmented row space. A system is
        inconsistent exactly when its equation space contains a nonzero constant
        function, visible in RREF as a contradiction such as <Math tex="0=1" />.
        When the system is consistent, its row space consists of the affine-linear
        equations vanishing on the solution affine subspace.
      </p>
      <p>
        The complete note begins with all seven possible RREF forms for a{" "}
        <Math tex={String.raw`2\times3`} /> matrix and proceeds from computation
        to structure: line pencils, the action of{" "}
        <Math tex={String.raw`\mathrm{GL}_2(\mathbb{R})`} />, degeneracies,
        projective completion, Grassmannians and arbitrary linear systems. Its
        worked examples, figures, proofs, geometric dictionary and references
        supply the details behind this short introduction.
      </p>

      <h2>Read the full note</h2>
      <PdfEmbed
        href={pdf.href}
        title={`${note.title}: ${note.subtitle ?? ""}`.replace(/:\s*$/, "")}
        pages={pdf.pages}
      />

      <NoteInformation note={note} />

      <aside className="note-ai-disclosure" aria-label="AI-use declaration">
        <strong>AI-use declaration.</strong>{" "}
        ChatGPT was used as a collaborative tool in discussing the article,
        developing code, and drafting and refining parts of its content. The
        original problem, its mathematical formulation, and the substantive
        mathematical content are the author&apos;s. The author has reviewed and
        verified all material published here and accepts responsibility for its
        accuracy.
      </aside>
    </>
  );
}

export const noteBodies: Record<NoteBodyKey, ComponentType<NoteBodyProps>> = {
  "kolam-investigation": KolamInvestigationBody,
  "row-reduction-exposition": RowReductionExpositionBody,
};
