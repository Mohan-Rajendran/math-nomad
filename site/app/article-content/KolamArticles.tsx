/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { ReactNode } from "react";
import {
  OctahedronKolamPreview,
  SquareKolamChallengePreview,
} from "../components/KolamLabPreviews";
import { Math } from "../components/Math";
import { labInteractiveHref } from "../site-mode";
import { ArticleContinuation } from "./ArticleContinuation";

const BINARY_MEDIA = "/articles/binary-kolam-tiles";
const OCTAHEDRON_MEDIA = "/articles/kolams-on-an-octahedron";

function ArticleSection({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: ReactNode;
}) {
  const showLabel = !/^\d+$/.test(label);

  return (
    <section id={id} className="article-section">
      {showLabel ? <p className="eyebrow">{label}</p> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function EmbeddedInteractive({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="article-embedded-interactive" aria-label={`${title} interactive`}>
      <div className="article-embedded-interactive-stage">{children}</div>
      <p className="article-embedded-interactive-link">
        <Link href={href}>Open {title} in the full Lab view ↗</Link>
      </p>
    </div>
  );
}

export function BinaryKolamArticleBody() {
  return (
    <>
      <ArticleSection id="threshold" label="Prelude" title="Kolam at the threshold">
        <p>
          At daybreak, many thresholds in Tamil Nadu become temporary drawing
          surfaces. The ground is swept, sometimes dampened, and a <em>kōlam</em> is
          drawn with rice flour, rice paste, or mineral powder. Historically
          practised and transmitted largely by women, kōlam belongs to the meeting
          place between home and street: it may be a gesture of welcome, a sign of
          auspiciousness, a daily discipline, and a work of art intended to
          disappear beneath footsteps, wind, rain, and time before being made anew. {" "}
          <a href="#binary-note-culture">Cultural sources ↓</a>
        </p>
        <p>
          <em>Pulli</em> means “dot”. In a pulli kōlam, a grid of dots provides the
          scaffold from which lines are joined or woven. In the <em>sikku</em> or {" "}
          <em>chikku</em> variety, one or more closed strands loop around the dots,
          producing patterns that invite questions about symmetry, continuity,
          topology, algorithms, and counting.
        </p>
        <blockquote>
          <span lang="ta">கோலம்</span> · kōlam — A temporary drawing can carry a
          durable idea: local choices accumulating into global form.
        </blockquote>
        <p>
          Mathematics is only one way of seeing kōlam. The practice also carries
          aesthetic, social, ritual, ecological, and personal meanings. We will
          study one deliberately simplified square-tile model of a sikku kōlam,
          not a classification of the living tradition. The model keeps a small
          local grammar visible, turns every rule into an exact condition, and
          leads to a surprising count.
        </p>
      </ArticleSection>

      <ArticleSection
        id="six-to-sixteen"
        label="01"
        title="From six shapes to sixteen tiles"
      >
        <p>
          Take a square tile and mark its centre with a dot. Draw curve segments
          that surround the dot and meet the midpoint of any chosen subset of the
          four sides; if no side is chosen, draw a closed loop inside the tile. Up
          to rotation, this gives six shapes. Once orientation is fixed, they yield
          sixteen distinct tiles.
        </p>
        <div className="tag-row" aria-label="Six kolam shapes and their orientation counts">
          {[
            ["tile-type-0000-m1.webp", "Closed-loop kolam tile", "1 tile"],
            ["tile-type-0001-m4.webp", "One-sided kolam tile", "4 tiles"],
            ["tile-type-0011-m4.webp", "Corner kolam tile", "4 tiles"],
            ["tile-type-0101-m2.webp", "Straight kolam tile", "2 tiles"],
            ["tile-type-0111-m4.webp", "Three-sided kolam tile", "4 tiles"],
            ["tile-type-1111-m1.webp", "Four-sided kolam tile", "1 tile"],
          ].map(([src, alt, count]) => (
            <figure className="article-figure" key={src}>
              <img src={`${BINARY_MEDIA}/${src}`} width="280" height="280" loading="lazy" alt={alt} />
              <figcaption>{count}</figcaption>
            </figure>
          ))}
        </div>
        <Math display tex="1+4+4+2+4+1=\mathbf{16}\text{ oriented tiles}" />
        <p>
          To turn the pictures into mathematical objects, record only one piece of
          information about each side: does the curve meet the midpoint of that
          side? Read the sides in the fixed order <strong>east, north, west,
          south</strong>, writing <Math tex="1" /> for “yes” and <Math tex="0" /> for “no”. Each tile therefore
          receives a binary string of length four. For example, <Math tex="\mathtt{1011}" /> has
          exits to the east, west, and south, but not to the north. The label {" "}
          <Math tex="\mathtt{0000}" /> is not an empty tile: its curve closes inside the square
          and meets no side.
        </p>
        <figure className="article-figure">
          <img
            src={`${BINARY_MEDIA}/kolam-tiles.webp`}
            width="1200"
            height="1200"
            loading="lazy"
            alt="The sixteen square kolam tiles labelled from 0000 to 1111 in east, north, west, south order"
          />
          <figcaption>
            The sixteen square kolam tiles, labelled from <Math tex="\mathtt{0000}" /> to {" "}
            <Math tex="\mathtt{1111}" /> in east–north–west–south order.
          </figcaption>
        </figure>
        <aside className="exercise">
          <span>The challenge</span>
          <h3>Can all sixteen tiles make one kolam on a <Math tex="4\times4" /> board?</h3>
          <p>
            Use every tile exactly once. Curves must agree across shared sides and
            may not run out through the outer boundary.
          </p>
          <p>
            The tile <Math tex="\mathtt{0000}" /> can never connect to a neighbouring cell, so
            a one-component board is impossible. We ask instead that it form the
            one compulsory isolated component and that the other fifteen tiles
            form a single connected component.
          </p>
        </aside>
      </ArticleSection>

      <ArticleSection id="play" label="02" title="Try the puzzle before reading on">
        <p>
          Drag the sixteen tiles into the <Math tex="4\times4" /> frame in the {" "}
          <strong>Square Kolam Tile Challenge</strong>. The labels are fixed: you
          may move a tile, but you may not rotate it. Try to make every neighbouring
          pair agree and keep the fifteen nonzero tiles in one network.
        </p>
        <EmbeddedInteractive
          href={labInteractiveHref("kolam-tiles", "square-kolam-tile-challenge")}
          title="Square Kolam Tile Challenge"
        >
          <SquareKolamChallengePreview />
        </EmbeddedInteractive>
        <details className="exercise">
          <summary>Hint 1: read the frame as a string of zeros</summary>
          <p>
            Every north bit in the top row, south bit in the bottom row, west bit
            in the left column, and east bit in the right column must be <Math tex="0" />. Cross
            out every position at which one of a tile’s <Math tex="1" />s would point out of the
            square.
          </p>
        </details>
        <details className="exercise">
          <summary>Hint 2: use the most constrained positions</summary>
          <p>
            A corner has two outward-facing sides. At the top-left corner, both the
            north and west bits must be <Math tex="0" />, so only <Math tex="\mathtt{0000}" />, {" "}
            <Math tex="\mathtt{0001}" />, <Math tex="\mathtt{1000}" />, and <Math tex="\mathtt{1001}" /> can occur
            there. Conversely, <Math tex="\mathtt{1111}" /> cannot lie on the boundary and
            must occupy one of the four central cells.
          </p>
        </details>
        <details className="exercise">
          <summary>Hint 3: build a compatible frontier</summary>
          <p>
            Once one row is placed, its four south bits must be exactly the four
            north bits of the next row. Build row by row, while tracing paths from {" "}
            <Math tex="\mathtt{1111}" />: a nonzero loop cut off from the unfinished board can
            never be repaired later.
          </p>
        </details>
      </ArticleSection>

      <ArticleSection id="bits" label="03" title="A precise model of the board">
        <p>We now give names to the board, the tile inventory, and the act of placing a tile. Let</p>
        <p><Math tex="V=\{(x,y):x,y\in\{0,1,2,3\}\}" />.</p>
        <p>
          be the sixteen cells, with <Math tex="x" /> increasing eastwards and <Math tex="y" /> {" "}
          increasing southwards. Let <Math tex="T=\{0,1\}^4" /> be the set of
          sixteen <Math tex="\mathrm{ENWS}" /> words. For <Math tex="t\in T" />, write <Math tex="t_E" />, <Math tex="t_N" />,
          <Math tex="t_W" />, <Math tex="t_S" /> for its four bits. A placement is a function
        </p>
        <p><Math tex="f:V\to T" />,</p>
        <p>where <Math tex="f(x,y)" /> is the globally oriented tile placed in cell <Math tex="(x,y)" />.</p>
        <p>A successful board satisfies five precise conditions.</p>
        <ol>
          <li><strong>Exact inventory.</strong> The map <Math tex="f" /> is a bijection: every cell receives one tile and every word in <Math tex="T" /> occurs exactly once.</li>
          <li>
            <strong>Horizontal matching.</strong> For <Math tex="0\le x<3" /> and <Math tex="0\le y\le3" />, {" "}
            <Math tex="f(x,y)_E=f(x+1,y)_W" />.
          </li>
          <li>
            <strong>Vertical matching.</strong> For <Math tex="0\le x\le3" /> and <Math tex="0\le y<3" />, {" "}
            <Math tex="f(x,y)_S=f(x,y+1)_N" />.
          </li>
          <li>
            <strong>Closed outer boundary.</strong> For every <Math tex="x" /> and <Math tex="y" />,
            {" "}<Math tex="f(x,0)_N=f(x,3)_S=f(0,y)_W=f(3,y)_E=0" />.
          </li>
          <li>
            <strong>Connectivity.</strong> Form a graph <Math tex="\Gamma_f" /> whose vertices
            are the sixteen cells, joining neighbours when their common matched
            bits are both <Math tex="1" />. If <Math tex="z_0=f^{-1}(\mathtt{0000})" />, then the
            subgraph on <Math tex="V\setminus\{z_0\}" /> must be connected.
          </li>
        </ol>
        <p>
          Conditions <Math tex="1\text{--}4" /> define a <em>locally valid exact-inventory board</em>. The
          fifth says that <Math tex="\Gamma_f" /> has exactly two components: the compulsory {" "}
          <Math tex="\mathtt{0000}" /> component and one component containing all fifteen
          nonzero tiles.
        </p>
        <h3>A small invariant with a large consequence</h3>
        <p>
          In each of the four bit positions, exactly eight of the sixteen words
          contain a <Math tex="1" />. The complete inventory therefore has <Math tex="32" /> exits. Because every
          exit is paired with exactly one neighbour, every locally valid board has
          precisely <Math tex="16" /> active connections.
        </p>
        <Math
          display
          tex="\begin{aligned}32\text{ curve exits}/2&=16\text{ graph edges},\\16-15+1&=\mathbf{2}\text{ independent cycles}.\end{aligned}"
        />
        <p>
          After discarding the isolated <Math tex="\mathtt{0000}" /> vertex, every successful
          answer is a connected graph with <Math tex="15" /> vertices and <Math tex="16" /> edges. Its cyclomatic
          number is therefore <Math tex="16-15+1=2" />.
        </p>
      </ArticleSection>

      <ArticleSection id="sat" label="04" title="From a puzzle to satisfiability">
        <p>
          A completely unrestricted placement has <Math tex="16!=20{,}922{,}789{,}888{,}000" />
          possibilities. Every condition can be encoded using Boolean variables,
          while the local rules give us an efficient way to prune the search. For
          each cell <Math tex="v" /> and tile <Math tex="t" />, introduce a variable
        </p>
        <p><Math tex="X_{v,t}=1\iff\text{tile }t\text{ occupies cell }v" />.</p>
        <p>
          There are <Math tex="16\times16=256" /> such variables. The puzzle is now a Boolean
          satisfiability problem, usually abbreviated to <strong>SAT</strong>.
          Bijection gives the “one tile per cell” and “one cell per tile” clauses;
          matching and boundary conditions forbid incompatible placements.
          Connectivity is global, so it can be checked afterwards by graph search
          or encoded with auxiliary reachability variables.
        </p>
        <ol>
          <li><strong>One tile in every cell.</strong> Exactly one of the sixteen statements <Math tex="X_{v,t}" /> is true for each cell <Math tex="v" />.</li>
          <li><strong>Every tile used once.</strong> For each label <Math tex="t" />, exactly one cell variable is true.</li>
          <li><strong>Only compatible neighbours.</strong> Any pair of labels whose facing bits disagree is forbidden.</li>
          <li><strong>No open boundary.</strong> A tile with an outward-facing <Math tex="1" /> is forbidden in that position.</li>
          <li><strong>Reach all fifteen tiles.</strong> A breadth-first search from the unique <Math tex="\mathtt{1111}" /> tile must visit every nonzero tile.</li>
        </ol>
        <p>
          A general SAT solver can enumerate the answers. For this <Math tex="4\times4" /> square, a
          row-by-row search makes the three reported counts particularly
          transparent.
        </p>
        <h3><Math tex="1{,}448" /> horizontally legal rows</h3>
        <p>
          Call <Math tex="R=(t_0,t_1,t_2,t_3)" /> a
          horizontally legal row when its four labels are distinct, its left and
          right outer bits are <Math tex="0" />, and each pair of facing east–west bits agrees.
          Testing the <Math tex="16\cdot15\cdot14\cdot13=43{,}680" /> ordered four-tuples gives exactly {" "}
          <strong><Math tex="1{,}448" /></strong> such rows.
        </p>
        <p>
          There is also a compact count. Record the five horizontal boundary and
          interface bits. The two outer bits are fixed at <Math tex="0" />, while the three inner
          bits are free, giving eight paths from <Math tex="0" /> back to <Math tex="0" />. For each transition,
          the north and south bits are free; correcting for repeated transitions
          so that labels remain distinct gives {" "}
          <Math tex="24+3\cdot192+2\cdot256+144+192=1{,}448" />.
        </p>
        <h3><Math tex="652" /> locally valid boards</h3>
        <p>
          For each legal row, retain its four north bits, four south bits, and a
          sixteen-bit mask recording the labels it uses. Stack four rows only when
          adjacent north–south signatures match, the top and bottom boundary
          signatures are <Math tex="\mathtt{0000}" />, and the four masks are disjoint and
          together contain all sixteen labels. Exactly <strong><Math tex="652" /></strong> boards
          pass those local matching, boundary, and inventory tests. The search is
          exhaustive because every board has one unique ordered decomposition into
          four rows.
        </p>
        <h3><Math tex="408" /> connected nonzero networks</h3>
        <p>
          Finally, construct <Math tex="\Gamma_f" /> for each of the <Math tex="652" /> boards and run a
          breadth-first search from <Math tex="\mathtt{1111}" />. Exactly <strong><Math tex="408" /></strong> {" "}
          searches reach all fifteen nonzero vertices. The other <Math tex="244" /> boards obey
          every local rule but split the nonzero tiles into two or more components.
        </p>
        <Math display tex="1{,}448\text{ rows}\longrightarrow652\text{ locally valid boards}\longrightarrow\mathbf{408}\text{ accepted boards}" />
        <div aria-label="Three stages of the exhaustive enumeration">
          <figure className="article-figure">
            <svg viewBox="66 172 360 118" width="360" height="118" role="img" aria-labelledby="binary-enum-row-title binary-enum-row-desc">
              <title id="binary-enum-row-title">A horizontally legal row</title>
              <desc id="binary-enum-row-desc">A legal row whose horizontal edges match but which cannot occur in any complete locally valid board.</desc>
              <image href={`${BINARY_MEDIA}/enumeration-examples.svg`} width="1500" height="610" aria-hidden="true" />
            </svg>
            <figcaption>A horizontally legal row that cannot occur in any of the <Math tex="652" /> complete boards.</figcaption>
          </figure>
          <figure className="article-figure">
            <svg viewBox="594 130 320 320" width="320" height="320" role="img" aria-labelledby="binary-enum-disconnected-title binary-enum-disconnected-desc">
              <title id="binary-enum-disconnected-title">A locally valid but disconnected board</title>
              <desc id="binary-enum-disconnected-desc">A complete locally valid board rejected because its nonzero tiles form several connected components.</desc>
              <image href={`${BINARY_MEDIA}/enumeration-examples.svg`} width="1500" height="610" aria-hidden="true" />
            </svg>
            <figcaption>A locally valid board rejected by connectivity. The colours distinguish components of sizes <Math tex="9,3,3,1" />.</figcaption>
          </figure>
          <figure className="article-figure">
            <svg viewBox="1090 130 320 320" width="320" height="320" role="img" aria-labelledby="binary-enum-accepted-title binary-enum-accepted-desc">
              <title id="binary-enum-accepted-title">An accepted connected board</title>
              <desc id="binary-enum-accepted-desc">An accepted board in which all fifteen nonzero tiles belong to one component and only the 0000 tile is isolated.</desc>
              <image href={`${BINARY_MEDIA}/enumeration-examples.svg`} width="1500" height="610" aria-hidden="true" />
            </svg>
            <figcaption>An accepted board: all fifteen nonzero tiles belong to one component, with only <Math tex="\mathtt{0000}" /> isolated.</figcaption>
          </figure>
        </div>
        <aside className="definition">
          <span>Computer-assisted proof</span>
          <p>
            The number 408 is not a sample or a heuristic estimate. The row program
            examines every possible locally valid row stack exactly once. A
            structurally independent cell-by-cell search returns the same 652 and
            408 totals.
          </p>
        </aside>
      </ArticleSection>

      <ArticleSection id="symmetry" label="05" title="When are two answers really the same?">
        <p>
          Suppose you solve the puzzle and then turn the entire sheet through {" "}
          <Math tex="90^\circ" />. The picture has changed its orientation, but not its essential
          arrangement. The same is true if you reflect the whole square in a
          mirror.
        </p>
        <p>
          A square has eight rigid symmetries. Together they form the dihedral
          group <Math tex="D_4" />: four rotations and four reflections.
        </p>
        <figure className="article-figure">
          <img
            src={`${BINARY_MEDIA}/kolam-01-eight-square-symmetries.webp`}
            width="1300"
            height="778"
            loading="lazy"
            alt="Kolam 1 shown under the identity, three rotations, and four reflections, connected by arrows"
          />
          <figcaption>
            Kolam 1 under the identity, three rotations, and four reflections. Solid
            arrows rotate the current picture through <Math tex="90^\circ" /> clockwise; dotted
            arrows reflect it left–right.
          </figcaption>
        </figure>
        <aside className="note-caution">
          <strong>One distinction matters.</strong>
          <p>
            We do not rotate a single tile while placing it. A symmetry moves the
            completed board as a whole, carrying every compass direction with it.
            Under a quarter-turn, for example, an east exit becomes a south exit
            everywhere at once.
          </p>
        </aside>
        <p>
          The eight images of one board form its <em>orbit</em>. Counting “up to
          symmetry” means counting these orbits rather than individual labelled
          boards. But can we simply divide 408 by 8? Only if every orbit really has
          eight members. A highly symmetric board might have fewer, so we need a
          theorem that handles this possibility correctly.
        </p>
      </ArticleSection>

      <ArticleSection id="burnside" label="06" title="Burnside’s lemma and the number 51">
        <p>
          Let <Math tex="X" /> be the set of 408 accepted labelled boards. The eight symmetries of
          the square act on <Math tex="X" /> by moving a whole completed board. An orbit is the
          collection of boards obtainable from one another in this way, and our
          goal is to count these orbits.
        </p>
        <p>
          Why not immediately divide 408 by 8? A board with its own symmetry could
          return to itself under more than the identity, making its orbit smaller
          than eight. {" "}
          <a href="https://mathnomad.in/writing/topics/burnside-lemma/">
            Burnside’s lemma
          </a>{" "}
          corrects for exactly this possibility. For a symmetry <Math tex="g" />, let {" "}
          <Math tex="\operatorname{Fix}(g)" /> be the accepted boards that <Math tex="g" /> leaves unchanged. Then
        </p>
        <Math display tex="\#(X/D_4)=\frac{1}{8}\sum_{g\in D_4}\lvert\operatorname{Fix}(g)\rvert" />
        <p>
          The average comes from a double count. Count pairs <Math tex="(B,g)" /> for which <Math tex="g" /> fixes
          <Math tex="B" />. Counting first by symmetry gives the sum above. If a board is fixed by
          <Math tex="s" /> symmetries, its orbit contains <Math tex="8/s" /> boards, and each is fixed by <Math tex="s" />
          symmetries. Thus every orbit contributes <Math tex="(8/s)s=8" /> pairs. Dividing the
          total by eight counts the orbits.
        </p>
        <p>
          In our puzzle, the identity fixes all 408 boards. Both <Math tex="\mathtt{0000}" /> {" "}
          and <Math tex="\mathtt{1111}" /> are unchanged by every permutation of the compass
          directions. A symmetric board must therefore place both labels in cells
          fixed by the spatial symmetry. On an even <Math tex="4\times4" /> grid, a nontrivial
          rotation or a horizontal or vertical reflection has no fixed cell, so
          none can fix an accepted board.
        </p>
        <p>
          A diagonal reflection does have four fixed cells, so it needs a final
          finite check. Each diagonal fixes two locally valid boards, but their
          component sizes are 9, 3, 3, and 1. None satisfies our connectivity rule.
        </p>
        <div className="table-wrap" role="region" aria-label="Burnside fixed-board counts" tabIndex={0}>
          <table>
            <thead><tr><th scope="col">Symmetry type</th><th scope="col">How many</th><th scope="col">Connected boards fixed</th><th scope="col">Comment</th></tr></thead>
            <tbody>
              <tr><th scope="row">Identity</th><td>1</td><td><strong>408</strong></td><td>Every board</td></tr>
              <tr><th scope="row">Quarter-turns</th><td>2</td><td><strong>0 each</strong></td><td><Math tex="90^\circ" /> and <Math tex="270^\circ" /></td></tr>
              <tr><th scope="row">Half-turn</th><td>1</td><td><strong>0</strong></td><td><Math tex="180^\circ" /></td></tr>
              <tr><th scope="row">Axis reflections</th><td>2</td><td><strong>0 each</strong></td><td>Horizontal and vertical</td></tr>
              <tr><th scope="row">Diagonal reflections</th><td>2</td><td><strong>0 each</strong></td><td>Fixed candidates are disconnected</td></tr>
            </tbody>
          </table>
        </div>
        <aside className="related-callout">
          <p className="eyebrow">Burnside’s average</p>
          <Math display tex="\frac{408+0+0+0+0+0+0+0}{8}=\mathbf{51}" />
          <h3>There are exactly 51 kolams up to the symmetries of the square.</h3>
          <p>
            More precisely: 51 symmetry classes of exact-inventory <Math tex="4\times4" /> boards
            satisfying the boundary, matching, and two-component conditions. Every
            class contains eight labelled boards.
          </p>
        </aside>
      </ArticleSection>

      <ArticleSection id="appendix" label="Appendix" title="Catalogue of the 51 kolams">
        <p>
          The catalogue below contains one canonical representative from every
          square-symmetry class in the enumeration.
        </p>
        <div className="related-callout">
          <article>
            <p className="eyebrow">Catalogue · PDF · 2 pages · 70 KB</p>
            <h3>See all 51 completed kolams</h3>
            <p>
              One canonical representative from every square-symmetry class,
              rendered from the exact enumeration.
            </p>
            <a className="button button-secondary" href={`${BINARY_MEDIA}/fifty-one-kolams.pdf`} target="_blank" rel="noreferrer">
              Open the catalogue ↗
            </a>
          </article>
        </div>
        <figure className="article-figure">
          <a href={`${BINARY_MEDIA}/fifty-one-kolams.pdf`} target="_blank" rel="noreferrer" aria-label="Open the two-page PDF catalogue of all 51 kolams">
            <img
              src={`${BINARY_MEDIA}/fifty-one-kolams-preview.webp`}
              width="993"
              height="1405"
              loading="lazy"
              alt="Contact sheet preview showing the first page of the catalogue of 51 square kolams"
            />
          </a>
          <figcaption>
            A preview of the catalogue. Each panel stands for one <Math tex="D_4" />-orbit,
            so its seven rotated or reflected copies are omitted. {" "}
            <a href={`${BINARY_MEDIA}/fifty-one-kolams.pdf`} target="_blank" rel="noreferrer">Open the full two-page PDF</a>.
          </figcaption>
        </figure>
        <details className="exercise">
          <summary>What does the enumeration do?</summary>
          <pre><code>{`build the 1,448 legal four-tile rows
index rows by their north and south signatures
join compatible rows with disjoint tile masks
keep the 652 exact-inventory boards
test reachability from the 1111 tile
keep the 408 accepted boards
replace each D₄ orbit by its least representative
verify: 51 orbits × 8 boards = 408`}</code></pre>
        </details>
      </ArticleSection>

      <section className="article-section notes-section" aria-labelledby="binary-notes-heading">
        <h2 id="binary-notes-heading">Notes and further reading</h2>
        <ol>
          <li id="binary-note-culture">
            For the threshold setting, materials, transmission, and cultural
            meanings of kōlam, see Sahapedia’s {" "}
            <a href="https://www.sahapedia.org/significance-of-kolam-tamil-culture">“Significance of Kolam in Tamil Culture”</a>{" "}
            and the {" "}
            <a href="https://ignca.gov.in/PDF_data/Martha_Strawn_collecction_Kolam.pdf">Indira Gandhi National Centre for the Arts archive note</a>.
          </li>
          <li>
            For mathematical approaches, see Marcia Ascher’s {" "}
            <a href="https://www.americanscientist.org/article/the-kolam-tradition">“The Kolam Tradition”</a>; Gift Siromoney, Rani Siromoney, and Kamala Krithivasan’s {" "}
            <a href="https://www.sciencedirect.com/science/article/pii/0146664X74900112">“Array Grammars and Kolam”</a>; and Venkatraman Gopalan’s {" "}
            <a href="https://www.tandfonline.com/doi/full/10.1080/17513472.2024.2423568">square-tile sikku kōlam enumeration</a>.
          </li>
          <li>
            The exact-inventory puzzle is closely related to edge-matching or
            Wang-tile problems: local colour matching is replaced here by equality
            of 0–1 side data.
          </li>
          <li>
            <a href="https://mathworld.wolfram.com/BurnsidesLemma.html">Burnside’s lemma</a>{" "}
            is sometimes called the orbit-counting lemma. Its power is that it
            remains correct even when different objects have orbits of different
            sizes.
          </li>
        </ol>
      </section>

      <ArticleContinuation
        headingId="binary-related-heading"
        title="Take the next route"
        items={[
          {
            href: "/articles/kolams-on-an-octahedron",
            title: "Companion article · Kolams on Octahedron",
            description: "Replace the square by a triangular tile and let a structural proof find three representatives.",
          },
          {
            href: labInteractiveHref("kolam-tiles", "square-kolam-tile-challenge"),
            title: "Interactive · Play the tile challenge",
            description: "Build a board in the Math Nomad Lab.",
          },
          {
            href: "/projects/kolam-tiles",
            title: "Project · Follow the kolam tile laboratory",
            description: "See what is being built around this investigation.",
          },
          {
            href: "/notes/combinatorics/sixteen-tiles-one-kolam-puzzle",
            title: "Classroom · Use the investigation with learners",
            description: "Take a guided route through the puzzle and its mathematics.",
          },
          {
            href: "https://mathnomad.in/writing/topics/burnside-lemma/",
            title: "Topic · Explore Burnside’s lemma",
            description: "Connect this count to the orbit-counting principle.",
          },
        ]}
      />

      <div className="article-end">
        <span aria-hidden="true">❧</span>
        <p>
          The exhaustive enumeration certifies the count; the completed kolams
          remind us why the objects were worth counting.
        </p>
      </div>
    </>
  );
}

export function OctahedronArticleBody() {
  return (
    <>
      <ArticleSection
        id="from-square-to-surface"
        label="Prelude"
        title="From a square board to a closed surface"
      >
        <p>
          In <Link href="/articles/binary-kolam-tiles"><em>From Sixteen Tiles to Fifty-One Kolams</em></Link>,
          we placed sixteen square tiles inside a square boundary. Every tile
          carried four bits, neighbouring bits had to agree, and a
          computer-assisted enumeration reduced the valid boards to 51 symmetry
          classes.
        </p>
        <p>What changes if the tiles are equilateral triangles?</p>
        <p>
          A triangle has three sides, so its local information is shorter. There
          are only eight possible binary labels. Eight equilateral triangles are
          also the faces of a regular octahedron. The board can therefore close
          around itself: there is no outer boundary, and every side meets another
          tile.
        </p>
        <p>
          We will ask for arrangements that use each of the eight tiles exactly
          once, match across every edge, and draw exactly two curve components:
          the small loop on <Math tex="\mathtt{000}" />, and one connected kolam through the
          other seven tiles.
        </p>
        <p>
          The surprise is not merely that the answer is three. It is that no
          exhaustive search is needed. Once the octahedron is replaced by its dual
          cube, the tile inventory forces a forest, the forest forces a subdivided
          Y, and the Y has only three possible sets of arm lengths.
        </p>
        <aside className="definition">
          <span>Proof status</span>
          <p>
            The classification in this article is entirely deductive. The
            interactive at the end illustrates the three representatives; it is
            not used to establish completeness.
          </p>
        </aside>
        <p>
          As in the companion article, this is a deliberately simplified
          mathematical model inspired by <em>sikku</em> or <em>chikku</em> kōlam.
          It is not a classification of the living tradition, which carries
          artistic, social, ritual, ecological, and personal meanings beyond the
          model. <a href="#octa-note-culture">Cultural sources ↓</a>
        </p>
      </ArticleSection>

      <ArticleSection id="eight-tiles" label="01" title="Eight triangular tiles">
        <p>
          Fix three side names on an equilateral triangle. In the upward-facing
          drawings below, read them in the order
        </p>
        <dl className="definition">
          <div><dt><strong><Math tex="X" /></strong></dt><dd>base</dd></div>
          <div><dt><strong><Math tex="Y" /></strong></dt><dd>right side</dd></div>
          <div><dt><strong><Math tex="Z" /></strong></dt><dd>left side</dd></div>
        </dl>
        <p>
          Write <Math tex="1" /> when the kolam curve meets the midpoint of that side, and <Math tex="0" /> when
          it does not. Each tile receives a word <Math tex="XYZ" /> of length three. Thus {" "}
          <Math tex="\mathtt{101}" /> meets the <Math tex="X" />- and <Math tex="Z" />-sides but not the <Math tex="Y" />-side. The word {" "}
          <Math tex="\mathtt{000}" /> is not blank: its curve is a small closed loop that meets
          no side.
        </p>
        <p>Each bit has two possible values, so the total number of globally oriented tiles is</p>
        <p><Math tex="2^3=8" />.</p>
        <figure className="article-figure">
          <img
            src={`${OCTAHEDRON_MEDIA}/triangular-kolam-tiles.svg`}
            width="960"
            height="500"
            loading="lazy"
            alt="The eight terracotta triangular kolam tiles labelled 000 through 111, with smooth white curves"
          />
          <figcaption>
            The eight oriented triangular tiles. A <Math tex="1" /> records a curve meeting the
            corresponding side midpoint; a <Math tex="0" /> records no meeting.
          </figcaption>
        </figure>
        <p>
          The orientation is global. We may move an entire completed octahedron by
          a symmetry, but we do not rotate one labelled tile independently after
          placing it.
        </p>
      </ArticleSection>

      <ArticleSection id="why-octahedron" label="02" title="Why an octahedron?">
        <p>
          Suppose a closed Platonic surface uses one triangular face for each tile.
          Then the number of faces is
        </p>
        <p><Math tex="F=8" />.</p>
        <p>
          Every face has three edges, and every edge belongs to two faces. Counting
          face–edge incidences in two ways gives
        </p>
        <p><Math tex="3F=2E" />,</p>
        <p>so <Math tex="E=12" />. Euler’s formula for a polyhedral sphere now gives</p>
        <p><Math tex="V-E+F=2" />,</p>
        <p>and hence</p>
        <p><Math tex="V=2+12-8=6" />.</p>
        <p>
          There are <Math tex="3F=24" /> face–vertex incidences. Because a Platonic solid looks
          the same at every vertex, four triangles meet at each of the six
          vertices. The resulting type is <Math tex="\{3,4\}" />: triangular faces, four around
          each vertex. This is the regular octahedron.
        </p>
        <Math display tex="8\text{ triangular faces}\longrightarrow12\text{ edges}\longrightarrow6\text{ vertices}\longrightarrow4\text{ faces at each vertex}" />
        <p>
          The solid is therefore not an arbitrary container chosen after the tiles
          were made. Among the Platonic solids, the eight-face inventory points
          directly to the octahedron.
        </p>
      </ArticleSection>

      <ArticleSection id="dual-cube" label="03" title="The cube hidden inside the octahedron">
        <p>
          The curves are drawn on octahedral faces, but the proof becomes simpler
          when we record only which faces touch.
        </p>
        <p>
          Place one vertex at each face centre and join two centres when their
          faces share an edge. This is the <em>dual graph</em> of the octahedron. It
          is a cube: the octahedron’s eight faces become the cube’s eight vertices,
          and its twelve edges become the cube’s twelve edges.
        </p>
        <p>
          There is also an intrinsic way to name the three side directions. Group
          the six octahedron vertices into three opposite pairs
        </p>
        <p><Math tex="X_+,X_-;\quad Y_+,Y_-;\quad Z_+,Z_-" />.</p>
        <p>
          Every triangular face contains one vertex from each pair. We label it by
          a sign triple, or equivalently by a word in <Math tex="\{0,1\}^3" />. On a
          face, the <Math tex="X" />-side is the side opposite its <Math tex="X" />-vertex, and similarly for <Math tex="Y" />
          and <Math tex="Z" />. Crossing an <Math tex="X" />-side changes only the <Math tex="X" />-coordinate of the face
          label. The same is true in the other two directions.
        </p>
        <p>Thus the dual graph is precisely the three-dimensional cube</p>
        <p><Math tex="Q_3=\{0,1\}^3" />.</p>
        <p>
          Let <Math tex="T=\{0,1\}^3" /> be the set of tile words. A placement is a
          bijection
        </p>
        <p><Math tex="f:Q_3\to T" />.</p>
        <p>
          The bijection is the exact-inventory rule. Every cube vertex receives one
          tile, and every tile is used exactly once.
        </p>
        <p>
          If <Math tex="x\oplus e_i" /> is the cube neighbour obtained by changing
          coordinate <Math tex="i" />, then matching across the shared octahedron edge means
        </p>
        <p><Math tex="f(x)_i=f(x\oplus e_i)_i" />.</p>
        <p>
          Now retain only the <em>active</em> shared edges: include the cube edge <Math tex="\{x,x\oplus e_i\}" /> when the common <Math tex="i" />th bit is <Math tex="1" />. Call the resulting graph <Math tex="\Gamma_f" />. The label of a vertex tells us exactly which active directions meet there, so
        </p>
        <p><Math tex="\deg_{\Gamma_f}(x)=\text{number of 1s in }f(x)" />.</p>
        <p>
          Each tile motif is connected within its triangular face. Consequently,
          two face motifs belong to the same drawn curve component exactly when
          their vertices belong to the same component of <Math tex="\Gamma_f" />. The graph
          keeps all the connectivity information we need.
        </p>
      </ArticleSection>

      <ArticleSection id="six-edges" label="04" title="Twelve exits become six edges">
        <p>The eight binary words have a rigid weight pattern.</p>
        <div className="table-wrap" role="region" aria-label="Tile labels grouped by their number of active sides" tabIndex={0}>
          <table>
            <thead><tr><th scope="col">Tile labels</th><th scope="col">Active sides</th></tr></thead>
            <tbody>
              <tr><th scope="row"><Math tex="\mathtt{000}" /></th><td><Math tex="0" /></td></tr>
              <tr><th scope="row"><Math tex="\mathtt{001},\mathtt{010},\mathtt{100}" /></th><td><Math tex="1" /> each</td></tr>
              <tr><th scope="row"><Math tex="\mathtt{011},\mathtt{101},\mathtt{110}" /></th><td><Math tex="2" /> each</td></tr>
              <tr><th scope="row"><Math tex="\mathtt{111}" /></th><td><Math tex="3" /></td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Consequently, the degree multiset of <Math tex="\Gamma_f" /> is {" "}
          <Math tex="0,1,1,1,2,2,2,3" />. There are twelve <Math tex="1" />s in
          the full inventory, since <Math tex="0+3\cdot1+3\cdot2+3=12" />.
        </p>
        <p>
          Each active octahedron edge is seen from both of its incident faces, so
          those twelve incidences pair up to give
        </p>
        <Math display tex="\lvert E(\Gamma_f)\rvert=\frac{12}{2}=6" />
        <p>This small count already tells us almost everything about the global kolam.</p>
      </ArticleSection>

      <ArticleSection id="automatic" label="05" title="Two components, automatically">
        <p>We intended to require two components. In fact, matching and exact inventory force them.</p>
        <p>
          First we show that <Math tex="\Gamma_f" /> has no cycle. A vertex on a cycle has
          degree at least two. Our inventory contains only four such vertices: the
          three weight-two tiles and <Math tex="\mathtt{111}" />. Any cycle can therefore use
          at most four vertices.
        </p>
        <p>
          The cube is bipartite, so it has no triangles. A cycle would have to be a
          four-cycle using all four vertices of degree at least two. Every
          four-cycle in a cube alternates between two directions, say <Math tex="i" /> and <Math tex="j" />. At
          each of its three degree-two vertices, the two active directions would
          then be exactly <Math tex="\{i,j\}" />.
        </p>
        <p>
          But that would give all three vertices the same tile label. Exact
          inventory requires the degree-two labels to be the three different words {" "}
          <Math tex="\mathtt{110}" />, <Math tex="\mathtt{101}" />, and <Math tex="\mathtt{011}" />. This
          contradiction shows that no cycle exists.
        </p>
        <p>
          Therefore <Math tex="\Gamma_f" /> is a forest. A forest with eight vertices and six
          edges has <Math tex="8-6=2" /> components. The tile {" "}
          <Math tex="\mathtt{000}" /> is the unique degree-zero vertex, so it is
          one isolated component. Every other tile must lie in the second component.
        </p>
        <aside className="related-callout">
          <p className="eyebrow">The global condition that comes for free</p>
          <h3>Every matching exact-inventory placement already has exactly two curve components.</h3>
          <p>The isolated component is <Math tex="\mathtt{000}" />; the other seven tiles form one connected tree.</p>
        </aside>
        <p>
          This is the second appearance of Euler characteristic. First, <Math tex="V-E+F=2" />
          identified the surface. Now, for a forest, <Math tex="V-E" /> counts its components.
        </p>
      </ArticleSection>

      <ArticleSection id="three-trees" label="06" title="A subdivided Y">
        <p>
          The seven-vertex component is a tree with degree sequence {" "}
          <Math tex="3,2,2,2,1,1,1" />.
        </p>
        <p>
          Its unique degree-three vertex is the face carrying <Math tex="\mathtt{111}" />.
          Remove that central vertex. What remains is three paths: the three arms
          of a Y.
        </p>
        <p>
          Let their lengths be positive integers <Math tex="\ell_1" />, <Math tex="\ell_2" />,
          <Math tex="\ell_3" />. The tree has six edges in total, so
        </p>
        <Math display tex="\ell_1+\ell_2+\ell_3=6,\qquad\ell_i\ge1" />
        <p>Up to reordering, there are only three positive partitions of 6 into three parts.</p>
        <div className="tag-row" aria-label="The three possible arm-length partitions">
          <figure className="article-figure">
            <svg viewBox="0 0 180 92" role="img" aria-label="A subdivided Y with three arms of length two"><g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"><path d="M90 45 39 16M90 45 141 16M90 45 90 78" /></g><g fill="var(--surface)" stroke="currentColor" strokeWidth="3"><circle cx="90" cy="45" r="7"/><circle cx="64" cy="30" r="5"/><circle cx="116" cy="30" r="5"/><circle cx="90" cy="62" r="5"/><circle cx="39" cy="16" r="5"/><circle cx="141" cy="16" r="5"/><circle cx="90" cy="78" r="5"/></g></svg>
            <figcaption><strong><Math tex="(2,2,2)" /></strong> — three equal arms</figcaption>
          </figure>
          <figure className="article-figure">
            <svg viewBox="0 0 180 92" role="img" aria-label="A subdivided Y with arms of length three, two, and one"><g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"><path d="M90 45 24 12M90 45 146 20M90 45 90 76" /></g><g fill="var(--surface)" stroke="currentColor" strokeWidth="3"><circle cx="90" cy="45" r="7"/><circle cx="68" cy="34" r="5"/><circle cx="46" cy="23" r="5"/><circle cx="118" cy="32" r="5"/><circle cx="24" cy="12" r="5"/><circle cx="146" cy="20" r="5"/><circle cx="90" cy="76" r="5"/></g></svg>
            <figcaption><strong><Math tex="(3,2,1)" /></strong> — three unequal arms</figcaption>
          </figure>
          <figure className="article-figure">
            <svg viewBox="0 0 180 92" role="img" aria-label="A subdivided Y with arms of length four, one, and one"><g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"><path d="M90 45 12 10M90 45 146 20M90 45 90 76" /></g><g fill="var(--surface)" stroke="currentColor" strokeWidth="3"><circle cx="90" cy="45" r="7"/><circle cx="70" cy="36" r="5"/><circle cx="50" cy="27" r="5"/><circle cx="31" cy="18" r="5"/><circle cx="118" cy="32" r="5"/><circle cx="12" cy="10" r="5"/><circle cx="146" cy="20" r="5"/><circle cx="90" cy="76" r="5"/></g></svg>
            <figcaption><strong><Math tex="(4,1,1)" /></strong> — one long arm</figcaption>
          </figure>
        </div>
        <p>
          We now have three possible <em>abstract tree shapes</em>. One final issue
          remains: could the same tree shape sit inside the cube in several
          essentially different ways?
        </p>
      </ArticleSection>

      <ArticleSection
        id="directions"
        label="07"
        title="Three tree shapes are not yet three kolams"
      >
        <p>
          The cube remembers not only which faces are joined, but also the
          directions of those joins.
        </p>
        <p>
          Name the cube directions <Math tex="1,2,3" />. Starting at the <Math tex="\mathtt{111}" /> face,
          read the edge directions along each arm. Three facts are forced by the
          inventory:
        </p>
        <ol>
          <li>The first directions of the arms are <Math tex="1,2,3" />, because the central tile is <Math tex="\mathtt{111}" />.</li>
          <li>The last directions are <Math tex="1,2,3" />, because the leaves are the three one-bit tiles.</li>
          <li>At the three internal degree-two vertices, the direction pairs are <Math tex="12,23,31" />, because the tiles are <Math tex="\mathtt{110}" />, <Math tex="\mathtt{011}" />, and <Math tex="\mathtt{101}" />.</li>
        </ol>
        <p>
          The three degree-two vertices are exactly the three transitions between
          consecutive symbols. Their distribution among the arms is forced by the
          arm lengths.
        </p>
        <div className="table-wrap" role="region" aria-label="Canonical direction words for the three representatives" tabIndex={0}>
          <table>
            <thead><tr><th scope="col">Arm lengths</th><th scope="col">Canonical direction words</th><th scope="col">Why they are forced</th></tr></thead>
            <tbody>
              <tr><th scope="row"><Math tex="(2,2,2)" /></th><td><Math tex="\mathtt{12\mid23\mid31}" /></td><td>One transition lies on each arm.</td></tr>
              <tr><th scope="row"><Math tex="(3,2,1)" /></th><td><Math tex="\mathtt{123\mid31\mid2}" /></td><td>Two transitions lie on the long arm and one on the middle arm.</td></tr>
              <tr><th scope="row"><Math tex="(4,1,1)" /></th><td><Math tex="\mathtt{1231\mid2\mid3}" /></td><td>All three transitions lie on the long arm.</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The bars separate the arms. Relabelling the directions applies one global
          permutation of <Math tex="1,2,3" />. Reversing the cyclic order gives a mirror image,
          which will be identified when reflections of the octahedron are allowed.
        </p>
        <p>
          Thus every arm-length type has one realisation up to the full octahedral
          symmetry group. The directional argument is the step that turns three
          candidate tree shapes into three actual symmetry classes.
        </p>
      </ArticleSection>

      <ArticleSection id="octa-symmetry" label="08" title="Symmetry and the final count">
        <p>
          The octahedron and cube are dual, so they have the same symmetries. A
          full symmetry may move a chosen face to any one of eight faces. Once that
          face is fixed, it may permute its three side directions in any of <Math tex="3!=6" />
          ways. Therefore the full symmetry group has
        </p>
        <p><Math tex="8\cdot6=48" /></p>
        <p>elements. On the dual cube, the group can be written</p>
        <p><Math tex="C_2^3\rtimes S_3" />.</p>
        <p>
          The factor <Math tex="C_2^3" /> complements any chosen subset of the three cube
          coordinates, while <Math tex="S_3" /> permutes their directions.
        </p>
        <p>
          Every symmetry preserves the multiset of arm lengths. The three types
          <Math tex="(2,2,2)" />, <Math tex="(3,2,1)" />, and <Math tex="(4,1,1)" /> therefore cannot become equivalent to one
          another. Conversely, the direction argument shows that every placement
          of a fixed type is related to its canonical representative by a face
          move and a direction permutation.
        </p>
        <aside className="related-callout">
          <p className="eyebrow">Classification theorem</p>
          <h3>Up to all rotations and reflections of the octahedron, there are exactly three kolams.</h3>
          <p>
            The classes are distinguished by the arm lengths <Math tex="(2,2,2)" />, {" "}
            <Math tex="(3,2,1)" />, and <Math tex="(4,1,1)" />.
          </p>
        </aside>
        <p>
          There are <Math tex="112" /> globally oriented matching placements before quotienting
          by symmetry. The three full-symmetry orbits have sizes {" "}
          <Math tex="16,48,48" />, and <Math tex="16+48+48=112" />.
        </p>
        <p>
          The balanced type has a threefold stabilising rotation; the other two
          have trivial stabilisers in the full group.
        </p>
        <aside className="note-caution">
          <strong>If reflections are not identified:</strong> the
          orientation-preserving rotation group has 24 elements, and each of the
          three classes splits into a mirror-related pair. Up to rotations alone,
          the answer is six.
        </aside>
      </ArticleSection>

      <ArticleSection id="without-search" label="09" title="A proof without exhaustive computation">
        <p>
          The companion square-tile problem and the octahedral problem begin in the
          same way: binary edge data, exact inventory, local matching, global
          connectivity, and symmetry. They end by very different mathematical
          routes.
        </p>
        <div className="related-callout">
          <article>
            <p className="eyebrow">Square tiles</p>
            <h3>Structure plus exhaustive enumeration</h3>
            <p>
              Row constraints and graph tests reduce a vast search to 408 accepted
              boards. Burnside’s lemma then gives 51 square-symmetry classes.
            </p>
          </article>
          <article>
            <p className="eyebrow">Triangular tiles</p>
            <h3>Structure removes the search</h3>
            <p>
              The degree sequence forces a forest, the forest forces a subdivided
              Y, and three positive partitions complete the classification.
            </p>
          </article>
        </div>
        <p>
          We may enumerate the <Math tex="8!=40{,}320" /> raw placements as an independent audit,
          but the proof never needs to inspect them. The number 112 is a consequence
          and a consistency check, not the source of the theorem.
        </p>
        <p>
          This is a useful mathematical contrast. Sometimes computation certifies
          a finite landscape that remains too large to see all at once. Sometimes
          an invariant is strong enough to make the landscape collapse into a
          handful of inevitable forms.
        </p>
      </ArticleSection>

      <ArticleSection id="fold" label="10" title="Fold the three kolams">
        <p>
          The three representatives below are drawn on connected octahedron nets.
          Select a net, fold it continuously into the solid, rotate the completed
          octahedron, and optionally reveal the active graph used in the proof.
        </p>
        <figure className="article-figure">
          <img
            src={`${OCTAHEDRON_MEDIA}/octahedron-hero.svg`}
            width="800"
            height="800"
            loading="lazy"
            alt="A completed kolam drawn across the faces of a folded octahedron"
          />
          <figcaption>
            A completed kolam on the octahedron. The interactive illustrates the
            theorem; the classification itself is proved in the sections above.
          </figcaption>
        </figure>
        <EmbeddedInteractive
          href={labInteractiveHref("kolam-tiles", "kolams-on-an-octahedron")}
          title="Kolams on an Octahedron"
        >
          <OctahedronKolamPreview />
        </EmbeddedInteractive>
      </ArticleSection>

      <section className="article-section notes-section" aria-labelledby="octa-notes-heading">
        <h2 id="octa-notes-heading">Notes and further reading</h2>
        <ol>
          <li id="octa-note-culture">
            For the threshold setting, materials, transmission, and cultural
            meanings of kōlam, see Sahapedia’s {" "}
            <a href="https://www.sahapedia.org/significance-of-kolam-tamil-culture">“Significance of Kolam in Tamil Culture”</a>{" "}
            and the {" "}
            <a href="https://ignca.gov.in/PDF_data/Martha_Strawn_collecction_Kolam.pdf">Indira Gandhi National Centre for the Arts archive note on Martha Strawn’s kōlam photographs</a>.
          </li>
          <li>
            For mathematical approaches to kōlam, see Marcia Ascher, {" "}
            <a href="https://www.americanscientist.org/node/1141">“The Kolam Tradition”</a>, {" "}
            <i>American Scientist</i> 90(1), 2002, p. 56, doi:
            10.1511/2002.13.56; and Gift Siromoney, Rani Siromoney, and Kamala
            Krithivasan, {" "}
            <a href="https://doi.org/10.1016/0146-664X(74)90011-2">“Array Grammars and Kolam”</a>, {" "}
            <i>Computer Graphics and Image Processing</i> 3(1), 1974, pp. 63–82.
          </li>
          <li>
            For the square-tile model and its symmetry classification, see
            Venkatraman Gopalan, {" "}
            <a href="https://doi.org/10.1080/17513472.2024.2423568">“Symmetry Classification and Enumeration of Square-Tile Sikku Kolams”</a>, {" "}
            <i>Journal of Mathematics and the Arts</i> 18(3–4), 2024, pp.
            244–257, and the companion Math Nomad article {" "}
            <Link href="/articles/binary-kolam-tiles">“From Sixteen Tiles to Fifty-One Kolams”</Link>.
          </li>
          <li>
            For classical background on regular polyhedra, duality, and symmetry
            groups, see H. S. M. Coxeter, <i>Regular Polytopes</i>, 3rd ed., Dover,
            1973. The cube–octahedron duality identifies the two solids’ symmetry
            groups; the full octahedral group has order 48.
          </li>
          <li>
            The cube graph used here is the three-dimensional hypercube <Math tex="Q_3" />. The
            active subgraph is not an extra approximation: under the stated
            connected-tile convention, its connected components agree with the
            components of the drawn kolam.
          </li>
        </ol>
      </section>

      <ArticleContinuation
        headingId="octa-related-heading"
        title="Take the next route"
        items={[
          {
            href: "/articles/binary-kolam-tiles",
            title: "Companion article · From Sixteen Tiles to Fifty-One Kolams",
            description: "See how exhaustive computation solves the square-tile problem.",
          },
          {
            href: labInteractiveHref("kolam-tiles", "kolams-on-an-octahedron"),
            title: "Interactive · Fold the three representatives",
            description: "Explore the connected nets and completed octahedra.",
          },
          {
            href: "/projects/kolam-tiles",
            title: "Project · Follow Kolam Tiles",
            description: "Find the square and triangular investigations in one place.",
          },
          {
            href: "/notes/combinatorics/sixteen-tiles-one-kolam-puzzle",
            title: "Classroom · Use the square-tile investigation",
            description: "Take a guided route through local rules and global connectivity.",
          },
        ]}
      />

      <div className="article-end">
        <span aria-hidden="true">❧</span>
        <p>The tiles close around the octahedron; the graph opens the proof.</p>
      </div>
    </>
  );
}
