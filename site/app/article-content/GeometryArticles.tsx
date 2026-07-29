import Link from "next/link";
import type { ReactNode } from "react";
import { LawOfCosinesPreview } from "../components/LawOfCosinesPreview";
import { Math } from "../components/Math";
import { PythagorasPreview } from "../components/PythagorasPreview";
import { labInteractiveHref } from "../site-mode";
import { ArticleContinuation } from "./ArticleContinuation";

function ArticleSection({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label?: string;
  title: string;
  children: ReactNode;
}) {
  const showLabel = label && !/^\d+$/.test(label);

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

export function PythagorasArticleBody() {
  return (
    <>
      <div className="article-section">
        <p>
          Most pictures of Pythagoras’ theorem are frozen. A right triangle
          sits in the middle; three squares wait around it; auxiliary lines are
          drawn; and the reader is expected to see that
        </p>
        <Math tex="a^2+b^2=c^2" display className="display-formula" />
        <p>
          The interactive below asks to be read differently. Change the
          smallest angle. Move the gold anchor. Switch to the mirror image. The
          cuts inside all three squares change—sometimes gently, sometimes
          abruptly—yet the area identity never does.
        </p>
        <p>
          The motion is not decoration added to a proof. The motion <em>is the
          phenomenon</em>. The two leg-squares and the hypotenuse-square generate
          two periodic tilings of the plane with the same translation lattice.
          Once that fact is understood, every relative position of the tilings
          produces a dissection.
        </p>
        <p>
          The quotation marks in the title are deliberate. There are infinitely
          many pictures and cut patterns, but they are not infinitely many
          unrelated arguments. They are visible forms of one common principle.
        </p>
      </div>

      <ArticleSection id="pythagoras-explore" label="01" title="Explore the moving proof">
        <EmbeddedInteractive
          href={labInteractiveHref("tessellations", "pythagorean-tiling-proofs")}
          title="the Pythagorean tiling proof"
        >
          <PythagorasPreview />
        </EmbeddedInteractive>
        <p>
          Begin with <strong>Perigal</strong> selected. The square on the longer
          leg is cut into four congruent quadrilaterals, while the square on the
          shorter leg remains whole. The same five pieces appear in the square
          on the hypotenuse.
        </p>
        <p>
          Then choose <strong>Free / continuous family</strong> and drag the gold
          point. The black square grid slides over the pastel tiling without
          changing its orientation. The guidelines copied into the two
          leg-squares and the coloured regions copied into the
          hypotenuse-square change together. Nothing is being measured afresh:
          the same pieces are being viewed in two different fundamental regions
          of one periodic pattern.
        </p>
        <p>
          Finally, change the smallest angle or select the mirror orientation.
          The picture deforms, but the mechanism survives.
        </p>
      </ArticleSection>

      <ArticleSection
        id="pythagoras-one-slider"
        label="02"
        title="One slider contains every right triangle"
      >
        <p>
          Up to similarity, a right triangle has only one shape parameter. We
          may take it to be its smallest angle <Math tex={String.raw`0<\theta\leq \pi/4`} />.
          The interactive fixes the hypotenuse at <Math tex="c=1" />, places the
          longer leg parallel to the horizontal axis, and displays {" "}
          <Math tex={String.raw`a=\cos\theta,\ b=\sin\theta,\ 0<b\leq a`} />.
        </p>
        <p>
          These formulas are convenient coordinates for the software; they are
          not the logical basis of the proof. The geometric argument needs only
          a right triangle, the squares on its sides, and translations of the
          plane. Checking many numerical values of <Math tex={String.raw`\theta`} /> would not prove
          the theorem.
        </p>
        <p>
          As <Math tex={String.raw`\theta`} /> approaches zero, the triangle becomes thin. At {" "}
          <Math tex={String.raw`\theta=\pi/4`} />, it is isosceles and the pattern gains extra symmetry. Every
          nondegenerate right-triangle shape occurs once between these extremes
          after the longer and shorter legs have been distinguished.
        </p>
      </ArticleSection>

      <ArticleSection id="pythagoras-two-tilings" label="03" title="Two tilings, one lattice">
        <p>
          Put the right-angle vertex at the origin and write {" "}
          <Math tex={String.raw`O=(0,0),\ A=(a,0),\ B=(0,b)`} />. The vector along
          the hypotenuse, from <Math tex="A" /> to <Math tex="B" />, is {" "}
          <Math tex={String.raw`\mathbf u=(-a,b)`} />.
        </p>
        <p>
          Rotate it through a right angle, towards the outside of the triangle,
          to obtain <Math tex={String.raw`\mathbf v=(b,a)`} />.
        </p>
        <p>
          The vectors <Math tex={String.raw`\mathbf u`} /> and <Math tex={String.raw`\mathbf v`} /> are perpendicular
          and congruent because one is a quarter-turn of the other. The square
          they span is therefore a translated copy of the square on the
          hypotenuse.
        </p>
        <p>
          Now arrange one <Math tex="a" />-square and one <Math tex="b" />-square in the
          stair-step pattern shown by the two pastel colours. Call their union
          <Math tex="T" />. Repeating <Math tex="T" /> by all translations in {" "}
          <Math tex={String.raw`\Lambda=\{m\mathbf u+n\mathbf v:m,n\in\mathbb Z\}`} /> fills the plane.
        </p>
        <p>It is the Pythagorean tiling.</p>
        <p>
          A <Math tex="c" />-square with sides parallel to <Math tex={String.raw`\mathbf u`} /> and {" "}
          <Math tex={String.raw`\mathbf v`} /> also fills the plane under exactly the same
          translations. The pastel two-square tile and the tilted
          hypotenuse-square are therefore two fundamental tiles for the same
          lattice.
        </p>
        <p>That shared lattice is the whole secret.</p>
      </ArticleSection>

      <ArticleSection id="pythagoras-overlay" label="04" title="The proof hidden in the overlay">
        <p>The argument does not depend on a special anchor position.</p>
        <p>
          Let <Math tex="C_p" /> be the hypotenuse-square whose chosen
          vertex—the gold anchor—is at <Math tex="p" />. Its lattice translates {" "}
          <Math tex={String.raw`C_p+\lambda,\ \lambda\in\Lambda`} /> partition the plane.
        </p>
        <p>
          Intersect each translate with the pastel tile <Math tex="T" /> and write {" "}
          <Math tex={String.raw`P_\lambda=T\cap(C_p+\lambda)`} />.
          Only finitely many intersections are nonempty, and together they cut
          <Math tex="T" /> into pieces. Translate each piece by <Math tex={String.raw`-\lambda`} />. Then {" "}
          <Math tex={String.raw`P_\lambda-\lambda=(T-\lambda)\cap C_p`} />.
        </p>
        <p>
          Because the translates <Math tex={String.raw`T-\lambda`} /> also partition the
          plane, these translated pieces partition <Math tex="C_p" />. Thus
          the union of the two leg-squares and the hypotenuse-square are made
          from precisely the same finite collection of pieces.
        </p>
        <aside className="related-callout" aria-label="Common-lattice principle">
          <h3>Common-lattice principle</h3>
          <p>
            If two shapes tile the plane by translations of the same lattice,
            overlaying the tilings cuts the shapes into matching pieces. Every
            piece moves only by a translation.
          </p>
        </aside>
        <p>
          This proves something stronger than equality of area. The
          hypotenuse-square and the union of the leg-squares are
          <em> translationally equidecomposable</em>: after finitely many cuts,
          one becomes the other without rotating or reflecting any individual
          piece. Francesc Aguiló, Miquel Àngel Fiol and Maria Lluïsa Fiol placed
          this principle in a general periodic-tiling framework in 2000.
        </p>
        <p>
          In the first panel of the interactive, the three squares have been
          returned to their familiar positions around the triangle. The clipped
          guidelines and colours preserve the correspondence established in the
          tiling plane.
        </p>
      </ArticleSection>

      <ArticleSection id="pythagoras-anchor" label="05" title="Why every anchor works">
        <p>
          Moving the anchor replaces <Math tex="C_p" /> by another translate {" "}
          <Math tex="C_q" />. It does not change <Math tex={String.raw`\Lambda`} />, so the common-lattice
          argument remains valid. This is why the gold point may be placed
          anywhere.
        </p>
        <p>
          There are continuously many choices of <Math tex="p" />, hence continuously
          many overlays. But the apparent plane of possibilities repeats. If
          <Math tex={String.raw`\lambda\in\Lambda`} />, then {" "}
          <Math tex={String.raw`C_{p+\lambda}+\Lambda=C_p+\Lambda`} />.
        </p>
        <p>
          Anchors that differ by a lattice vector produce the same overlay. The
          genuine phase space is <Math tex={String.raw`\mathbb R^2/\Lambda`} />, a
          flat torus: one may imagine a single <Math tex="c" />-square with each pair
          of opposite edges identified.
        </p>
        <p>
          Most nearby anchor positions have the same combinatorial pattern. The
          vertices and edges move continuously while the same pieces remain
          adjacent. A qualitative change occurs when a grid line passes through
          a vertex of the pastel tiling or coincides with one of its edges. At
          such a critical position, pieces merge or split. Aguiló, Fiol and Fiol
          found phases with between three and seven regions in this construction;
          modulo lattice translations, the three-region phase is unique.
        </p>
        <p>
          The mirror switch reflects the construction. Its handedness changes,
          but the proof does not.
        </p>
        <p>Taken together, the sandbox has three kinds of freedom:</p>
        <Math
          tex={String.raw`\underbrace{\theta\in(0,\pi/4]}_{\text{triangle shape}},\qquad \underbrace{p\in\mathbb R^2/\Lambda_\theta}_{\text{overlay phase}},\qquad \underbrace{\text{ordinary or mirrored}}_{\text{handedness}}`}
          display
          className="display-formula"
        />
        <p>It is a family of tori, one for each similarity class of right triangle.</p>
      </ArticleSection>

      <ArticleSection id="pythagoras-phases" label="06" title="Three distinguished phases">
        <p>
          The historical presets are not three different theorems. They are
          especially symmetric or economical points on the same phase torus. In
          the ordinary orientation their coordinates are as follows; in the
          mirror image the first coordinate changes sign.
        </p>

        <h3>Perigal: the centre of the larger square</h3>
        <p>
          The Perigal anchor is <Math tex={String.raw`p_{\mathrm P}=(0,0)`} />, the centre of an {" "}
          <Math tex="a" />-square. The two grid lines through it
          divide that square into four congruent quadrilaterals. The
          <Math tex="b" />-square remains intact. Those five pieces fill the
          hypotenuse-square with fourfold symmetry.
        </p>
        <p>
          Its elegance comes from three features at once: only five pieces are
          used, four are congruent, and the smaller square remains whole.
        </p>

        <h3>The medieval corner</h3>
        <p>
          The medieval anchor is <Math tex={String.raw`p_{\mathrm M}=(-a/2,a/2)`} />, the
          shared corner of the distinguished <Math tex="a" />- and
          <Math tex="b" />-squares. When the two leg-squares are treated as one
          stair-step tile, this is the unique three-region phase. Showing the
          seam between the original squares—as the first panel naturally
          does—refines that count.
        </p>
        <p>
          The attribution requires care. A dissection of this type belongs to
          the medieval Arabic commentary tradition transmitted through
          al-Nayrīzī and is commonly attributed to Thābit ibn Qurra. The
          surviving record does not justify treating both names as independently
          documented discoverers.
        </p>

        <h3>The symmetric twin</h3>
        <p>
          The centre of the adjacent <Math tex="b" />-square is {" "}
          <Math tex={String.raw`p_{\mathrm F}=\left((b-a)/2,(a+b)/2\right)`} />. Here
          Perigal’s roles are reversed: the <Math tex="a" />-square remains whole
          while the <Math tex="b" />-square is cut into four congruent pieces.
        </p>
        <p>
          Modern online expositions attribute this symmetric companion to
          Giorgio Ferrarese. No dated scholarly publication establishing
          priority has been located, so the selector describes it as an
          attribution rather than a settled historical fact.
        </p>
        <p>
          All three coordinates are understood modulo <Math tex={String.raw`\Lambda`} />. Every lattice translate
          represents the same phase.
        </p>
      </ArticleSection>

      <ArticleSection id="pythagoras-moving-family" label="07" title="From one dissection to a moving family">
        <p>
          The history relevant here is narrower than the history of Pythagoras’
          theorem itself. It is the history of this particular
          tiling-and-dissection mechanism.
        </p>
        <p>
          Henry Perigal said that he discovered his five-piece dissection around
          1830 while pursuing the impossible problem of squaring the circle. He
          privately printed it in 1835. Its first known public appearance came
          through his friend Solomon Moses Drach on 31 May 1872; Perigal’s own
          article followed in the <em>Messenger of Mathematics</em> that November.
          Some bibliographies give 1873 because of the journal volume’s dating.
        </p>
        <p>
          The picture also has a striking earlier visual relative. An anonymous
          Persian compendium on ornamental geometry, whose original composition
          has been placed around 1300, contains a design that becomes Perigal’s
          arrangement when an extra central subdivision is suppressed. No proof
          text accompanies the figure. It is therefore a visual antecedent, not
          secure evidence that its draughtsperson intended a proof of the theorem.
        </p>
        <p>
          Perigal’s diagram was later recognised as one position in a continuous
          family. Seán Stewart’s historical study reports that Friedrich Paul
          Mahlo apparently made that sliding-overlay viewpoint explicit in his
          1908 dissertation. Percy A. MacMahon discussed “Pythagoras’s Theorem as
          a Repeating Pattern” in <em>Nature</em> in 1922. Arthur W. Siddons
          published displaced versions of Perigal’s dissection in 1932,
          following a suggestion from a sixteen-year-old correspondent identified
          only as M. Charlesworth.
        </p>
        <p>
          The gold anchor expresses this change in viewpoint. What first looks
          like an ingenious isolated cut-and-paste trick becomes a point in a
          geometric parameter space.
        </p>
      </ArticleSection>

      <ArticleSection id="pythagoras-larger-picture" label="08" title="The right-angle slice of a larger picture">
        <p>
          Here we stay on the right-triangle slice, where the correction term
          vanishes and <Math tex="a^2+b^2=c^2" />. The same moving tessellation extends beyond
          that slice. For an acute triangle, two cosine parallelograms appear as
          overlaps; for an obtuse triangle, they become gaps.
        </p>
        <p>
          <Link href="/articles/law-of-cosines">The Law of Cosines</Link> follows
          that deformation across the full two-dimensional moduli space of
          triangle shapes and recovers {" "}
          <Math tex={String.raw`c^2=a^2+b^2-2ab\cos C`} />.
        </p>
        <p>
          Not every historical proof of Pythagoras’ theorem appears by moving
          this one anchor. Euclid’s construction, similar-triangle arguments,
          Chinese <em>gougu</em> diagrams and Bhāskara’s rearrangement use
          different mechanisms. The sandbox makes a narrower claim—and already
          contains an infinity.
        </p>
      </ArticleSection>

      <ArticleSection id="pythagoras-same-pieces" label="09" title="Same pieces, different pictures">
        <p>
          Pythagoras’ theorem is usually written as an equation. The tiling proof
          asks us to see it as a statement about periodic space.
        </p>
        <p>
          The two leg-squares form one fundamental tile. The hypotenuse-square
          forms another. Both live on the same lattice. Overlay them, and the
          plane performs the dissection.
        </p>
        <p>Move the anchor and the pieces change, but the lattice does not.</p>
        <p>
          Change the triangle and the lattice deforms, but the common-lattice
          relation does not.
        </p>
        <p>
          Reflect the construction and its handedness changes, but the argument
          does not.
        </p>
        <aside className="related-callout" aria-label="Conclusion">
          <p>
            The two leg-squares and the hypotenuse-square are made from the same
            pieces, and the plane supplies infinitely many ways to see them.
          </p>
        </aside>
      </ArticleSection>

      <section className="article-section notes-section" aria-labelledby="pythagoras-sources-heading">
        <h2 id="pythagoras-sources-heading">Sources and further reading</h2>
        <ul>
          <li>
            Francesc Aguiló, Miquel Àngel Fiol and Maria Lluïsa Fiol, {" "}
            <a href="https://doi.org/10.1080/00029890.2000.12005202">
              “Periodic Tilings as a Dissection Method”
            </a>
            , <em>American Mathematical Monthly</em> 107 (2000), 341–352.
          </li>
          <li>
            Seán M. Stewart, {" "}
            <a href="https://doi.org/10.33232/BIMS.0087.51.86">
              “A history of Perigal’s dissection”
            </a>
            , <em>Bulletin of the Irish Mathematical Society</em> 87 (2021),
            51–86.
          </li>
          <li>
            Henry Perigal, {" "}
            <a href="https://mathshistory.st-andrews.ac.uk/Extras/Perigal_maths_astro/">
              “On geometric dissections and transformations”
            </a>
            , <em>Messenger of Mathematics</em> 2 (1872), 103–105.
          </li>
          <li>
            Percy A. MacMahon, {" "}
            <a href="https://doi.org/10.1038/109479c0">
              “Pythagoras’s Theorem as a Repeating Pattern”
            </a>
            , <em>Nature</em> 109 (1922), 479.
          </li>
          <li>
            Arthur W. Siddons, {" "}
            <a href="https://doi.org/10.2307/3608135">
              “Perigal’s dissection for the theorem of Pythagoras”
            </a>
            , <em>Mathematical Gazette</em> 16 (1932), 36.
          </li>
          <li>
            Roger B. Nelsen, {" "}
            <a href="https://doi.org/10.1080/10724117.2003.12021741">
              “Paintings, Plane Tilings, &amp; Proofs”
            </a>
            , <em>Math Horizons</em> 11.1 (2003), 4–8.
          </li>
          <li>
            Gülru Necipoğlu, ed., {" "}
            <a href="https://books.google.com/books/about/The_Arts_of_Ornamental_Geometry.html?id=8yMzDwAAQBAJ">
              <em>The Arts of Ornamental Geometry</em>
            </a>{" "}
            (2017), for the Persian manuscript tradition.
          </li>
        </ul>
      </section>

      <ArticleContinuation
        headingId="pythagoras-continue-heading"
        title="Where to continue"
        items={[
          {
            href: labInteractiveHref("tessellations", "pythagorean-tiling-proofs"),
            title: "Interactive · Open the Pythagorean tiling proof",
            description: "Explore the complete moving construction in the Lab.",
          },
          {
            href: "/articles/law-of-cosines",
            title: "Companion article · The Law of Cosines",
            description: "Follow the right-angle slice into acute and obtuse triangles.",
          },
          {
            href: "/projects/tessellations",
            title: "Project · Follow Tessellations",
            description: "Find the growing collection of related investigations.",
          },
        ]}
      />
    </>
  );
}

export function LawOfCosinesArticleBody() {
  return (
    <>
      <div className="article-section">
        <p>
          The Pythagorean theorem is the right-angle member of a larger picture.
          If a triangle has sides <Math tex="a" />, <Math tex="b" /> and <Math tex="c" />, with
          <Math tex="C" /> the angle between the sides <Math tex="a" /> and <Math tex="b" />,
          then
        </p>
        <Math
          tex={String.raw`c^2=a^2+b^2-2ab\cos C`}
          display
          className="display-formula"
        />
        <p>
          The extra term measures a failure of perpendicularity. In the
          tessellation below it appears twice: as two overlaps when <Math tex="C" />
          is acute, as two gaps when <Math tex="C" /> is obtuse, and as two collapsed
          parallelograms when <Math tex="C" /> is right.
        </p>
      </div>

      <ArticleSection id="cosines-shape-space" label="01" title="The space of triangle shapes">
        <p>
          A triangle has three side lengths, but multiplying all of them by the
          same positive number does not change its shape. Removing this scale
          leaves two independent parameters. The moduli space of triangles up to
          similarity is therefore two-dimensional.
        </p>
        <p>
          There is a symmetric way to see it. Normalize the perimeter and write {" "}
          <Math tex={String.raw`x=\frac{a}{a+b+c},\ y=\frac{b}{a+b+c},\ z=\frac{c}{a+b+c}`} />.
          Then <Math tex="x+y+z=1" />. The triangle inequalities say precisely that {" "}
          <Math tex={String.raw`0<x,y,z<\tfrac12`} />.
        </p>
        <p>
          Thus labelled triangle shapes form the open central triangle inside
          the standard simplex. If the names of the sides do not matter,
          permutations of <Math tex="(x,y,z)" /> describe the
          same shape.
        </p>
        <p>
          For the interactive it is more convenient to choose one chamber of
          that quotient. Order the sides so that <Math tex={String.raw`0<b\leq a\leq c`} />
          and normalize the longest side to <Math tex="c=1" />. Every unlabelled
          nondegenerate triangle then appears exactly once in the chamber
        </p>
        <Math
          tex={String.raw`\mathcal M_{\triangle}=\{(a,b):0<b\leq a\leq1,\ a+b>1\}`}
          display
          className="display-formula"
        />
        <p>
          This is the triangular chamber in the first panel of the interactive.
          Its distinguished features are:
        </p>
        <ul>
          <li><Math tex="(1,1)" /> is the equilateral triangle;</li>
          <li><Math tex="a=b" /> and <Math tex="a=1" /> are the two isosceles boundaries;</li>
          <li><Math tex="a+b=1" /> is the degenerate limit;</li>
          <li><Math tex="a^2+b^2=1" /> is the curve of right triangles.</li>
        </ul>
        <p>The right-triangle curve divides the chamber into acute and obtuse regions:</p>
        <Math
          tex={String.raw`\begin{aligned}a^2+b^2&>1&&\Longleftrightarrow&&C<90^\circ,\\a^2+b^2&=1&&\Longleftrightarrow&&C=90^\circ,\\a^2+b^2&<1&&\Longleftrightarrow&&C>90^\circ.\end{aligned}`}
          display
          className="display-formula"
        />
      </ArticleSection>

      <ArticleSection id="cosines-explore" label="02" title="Explore the tessellation">
        <EmbeddedInteractive
          href={labInteractiveHref("tessellations", "law-of-cosines")}
          title="the Law of Cosines investigation"
        >
          <LawOfCosinesPreview />
        </EmbeddedInteractive>
        <h3>How to use it</h3>
        <ol>
          <li>
            <strong>Choose a triangle.</strong> Drag the gold point in the moduli
            chamber, or use the acute, right and obtuse presets. The
            representative triangle and all three side-squares change with it.
          </li>
          <li>
            <strong>Compare the two boxes.</strong> The blue <Math tex="a^2" />-square,
            yellow <Math tex="b^2" />-square and patterned <Math tex="c^2" />-square
            attached to the triangle are exact translated copies of the
            corresponding regions in the plane tessellation.
          </li>
          <li>
            <strong>Move the grid.</strong> Drag the gold anchor in the plane.
            This translates the black <Math tex="c^2" />-grid without
            rotating it. The cut lines copied into the side-squares move at the
            same time.
          </li>
          <li>
            <strong>Cross the right-triangle curve.</strong> For an acute
            triangle, blue and yellow overlap in green parallelograms. For an
            obtuse triangle, the same parallelograms become white gaps. At a
            right triangle they flatten into line segments.
          </li>
        </ol>
        <p>
          Moving the anchor changes the dissection but not the area identity. It
          gives a continuous family of pictures for the same proof.
        </p>
      </ArticleSection>

      <ArticleSection id="cosines-vectors" label="03" title="The vectors behind the picture">
        <p>
          Place the two sides meeting at <Math tex="C" /> as vectors {" "}
          <Math tex={String.raw`\mathbf p`} /> and <Math tex={String.raw`\mathbf q`} />: {" "}
          <Math tex={String.raw`|\mathbf p|=a,\ |\mathbf q|=b,\ \angle(\mathbf p,\mathbf q)=C`} />.
        </p>
        <p>
          The third side is the difference <Math tex={String.raw`\mathbf d=\mathbf p-\mathbf q`} />,
          so <Math tex={String.raw`|\mathbf d|=c`} />. Let <Math tex="J" /> denote rotation
          through <Math tex={String.raw`90^\circ`} />. The vectors <Math tex={String.raw`\mathbf d`} /> and {" "}
          <Math tex={String.raw`J\mathbf d`} /> are perpendicular and have equal length <Math tex="c" />; they generate the
          black square grid in the interactive.
        </p>
        <p>
          Now make two alternating broken lines using the steps {" "}
          <Math tex={String.raw`\mathbf p,-\mathbf q,\mathbf p,-\mathbf q,\ldots`} />
          and, perpendicularly, <Math tex={String.raw`J\mathbf p,-J\mathbf q,J\mathbf p,-J\mathbf q,\ldots`} />.
          Every pair of horizontal-type steps has displacement <Math tex={String.raw`\mathbf p-\mathbf q=\mathbf d`} />,
          and every pair of rotated steps has displacement <Math tex={String.raw`J\mathbf d`} />. The pattern
          therefore repeats with exactly the same periods as the
          <Math tex="c^2" />-grid.
        </p>
        <p>
          Within one period there is one blue square generated by
          <Math tex={String.raw`\mathbf p`} /> and <Math tex={String.raw`J\mathbf p`} />, hence of area {" "}
          <Math tex="a^2" />, and one yellow square generated by
          <Math tex={String.raw`\mathbf q`} /> and <Math tex={String.raw`J\mathbf q`} />, hence of area {" "}
          <Math tex="b^2" />. Two congruent parallelograms complete the
          accounting.
        </p>
      </ArticleSection>

      <ArticleSection id="cosines-parallelograms" label="04" title="The cosine parallelograms">
        <p>
          One correction parallelogram is generated by <Math tex={String.raw`\mathbf p`} /> and {" "}
          <Math tex={String.raw`J\mathbf q`} />. Its oriented area is
        </p>
        <Math
          tex={String.raw`\det(\mathbf p,J\mathbf q)=\mathbf p\cdot\mathbf q=ab\cos C`}
          display
          className="display-formula"
        />
        <p>Its ordinary area is therefore <Math tex={String.raw`P=ab|\cos C|`} />.</p>
        <p>
          There are two such parallelograms in every <Math tex="c^2" />
          period. That is the geometric source of the coefficient 2 in the law
          of cosines.
        </p>
      </ArticleSection>

      <ArticleSection id="cosines-reading-proof" label="05" title="Reading the proof from the tessellation">
        <h3>Acute triangles: two overlaps</h3>
        <p>
          When <Math tex={String.raw`C<90^\circ`} />, we have <Math tex={String.raw`\cos C>0`} />. The blue and
          yellow squares overlap in two green parallelograms, each of area {" "}
          <Math tex={String.raw`P=ab\cos C`} />.
        </p>
        <p>
          One <Math tex="c^2" /> cell is covered by the blue and yellow
          squares, but each green region has been counted twice. Inclusion–exclusion gives
        </p>
        <Math
          tex={String.raw`\begin{aligned}c^2&=a^2+b^2-P-P\\&=a^2+b^2-2ab\cos C.\end{aligned}`}
          display
          className="display-formula"
        />

        <h3>Obtuse triangles: two gaps</h3>
        <p>
          When <Math tex={String.raw`C>90^\circ`} />, we have <Math tex={String.raw`\cos C<0`} />. The two square
          families no longer overlap. Instead they leave two congruent white
          parallelograms in each <Math tex="c^2" /> cell. Their area is {" "}
          <Math tex={String.raw`P=ab|\cos C|=-ab\cos C`} />.
        </p>
        <p>Now the whole cell consists of the two squares and the two gaps:</p>
        <Math
          tex={String.raw`\begin{aligned}c^2&=a^2+b^2+P+P\\&=a^2+b^2-2ab\cos C.\end{aligned}`}
          display
          className="display-formula"
        />

        <h3>Right triangles: the transition</h3>
        <p>
          When <Math tex={String.raw`C=90^\circ`} />, the height of each correction parallelogram is
          zero. The gaps or overlaps disappear, and the picture becomes the
          Pythagorean tessellation: <Math tex="c^2=a^2+b^2" />.
        </p>
        <p>
          The acute, right and obtuse diagrams are not three unrelated proofs.
          They are three regimes of one continuously varying construction.
        </p>
        <p>
          At this right-angle slice, the correction regions vanish but the
          movable common-lattice dissection remains. {" "}
          <Link href="/articles/infinitely-many-proofs-of-pythagoras">
            Infinitely many “proofs” of Pythagoras’ theorem
          </Link>{" "}
          explores that slice in depth, including its medieval corner, Perigal
          and symmetric-twin anchor positions.
        </p>
      </ArticleSection>

      <ArticleSection id="cosines-anchor" label="06" title="Why the anchor can move">
        <p>
          The black grid can be translated without changing its orientation. Two
          anchors differing by an integer combination of <Math tex={String.raw`\mathbf d`} /> and {" "}
          <Math tex={String.raw`J\mathbf d`} /> produce the same relative overlay. For a
          fixed triangle, the genuine phase space of the anchor is therefore {" "}
          <Math tex={String.raw`\mathbb R^2/(\mathbb Z\mathbf d+\mathbb ZJ\mathbf d)`} />, a flat torus.
          The triangle shape supplies two parameters and the grid
          phase supplies two more. The full family explored by the interactive
          is consequently four-dimensional, even though the screen shows only
          one triangle and one draggable point at a time.
        </p>
      </ArticleSection>

      <ArticleContinuation
        headingId="cosines-continue-heading"
        title="Where to continue"
        items={[
          {
            href: labInteractiveHref("tessellations", "law-of-cosines"),
            title: "Interactive · Open the Law of Cosines construction",
            description: "Explore the complete tessellation in the Lab.",
          },
          {
            href: "/articles/infinitely-many-proofs-of-pythagoras",
            title: "Companion article · Infinitely many ‘proofs’ of Pythagoras’ theorem",
            description: "Return to the continuously moving right-angle family.",
          },
          {
            href: "/projects/tessellations",
            title: "Project · Follow Tessellations",
            description: "Find related experiments and future additions.",
          },
        ]}
      />
    </>
  );
}
