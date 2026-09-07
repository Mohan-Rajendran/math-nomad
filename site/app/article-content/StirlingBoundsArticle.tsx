import type { ReactNode } from "react";
import {
  AreaProofAssembler,
  ChakrabortyAreaExplorer,
  GammaExtensionPlot,
} from "../components/StirlingBoundsInteractives";
import { Math } from "../components/Math";

const SOURCE_DOI = "https://doi.org/10.1080/07468342.2026.2721230";
const AUTHOR_ORCID = "https://orcid.org/0000-0002-3951-4792";
const RUDIN_BOOK =
  "https://www.mheducation.co.in/principles-of-mathematical-analysis-9789355325969-india";
const DLMF_STIRLING = "https://dlmf.nist.gov/5.11";

function ArticleSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="article-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function StirlingBoundsArticleBody() {
  return (
    <>
      <div className="article-section">
        <p>
          Stirling&apos;s formula describes the extraordinary growth of a factorial
          with a remarkably compact expression:
        </p>
        <Math
          tex={String.raw`n!\sim\sqrt{2\pi n}\left(\frac ne\right)^n`}
          display
          className="display-formula"
        />
        <p>This also means that</p>
        <Math
          tex={String.raw`R_n:=\frac{n!}{(n/e)^n\sqrt n}\longrightarrow\sqrt{2\pi}`}
          display
          className="display-formula"
        />
        <p>
          In{" "}
          <a href={SOURCE_DOI}>“Stirling&apos;s Formula: A Better Approximation”</a>,{" "}
          <a href={AUTHOR_ORCID}>Bikash Chakraborty</a>{" "}
          returns to an integral comparison from Walter Rudin&apos;s{" "}
          <a href={RUDIN_BOOK}>
            <em>Principles of Mathematical Analysis</em>
          </a>. Rudin&apos;s exercise (Chapter 8, Problem 20) gives{" "}
          <Math tex={String.raw`e^{7/8}<R_n<e`} /> for integers{" "}
          <Math tex={String.raw`n>2`} />. Chakraborty keeps the same basic idea,
          modifies the geometry, and sharpens both bounds to
        </p>
        <Math
          tex={String.raw`e^{7/8}<\left(\frac{2e}{3}\right)^{3/2}<R_n<\frac{e^2}{2\sqrt2}<e,\qquad n>2`}
          display
          className="display-formula"
        />
        <p>In decimals,</p>
        <Math
          tex={String.raw`2.39887529397<2.43952253514<R_n<2.61242583706<2.71828182846`}
          display
          className="display-formula"
        />
        <p>
          The proof is highly pedagogical because it turns a factorial into a
          comparison of visible areas under <Math tex={String.raw`y=\log x`} />.
        </p>
        <p>
          What caught my attention was a small geometric choice on which the
          argument depends: the point at which the area comparison begins.
          Chakraborty begins at <Math tex="2" />. If the construction begins
          later, the initial
          factors can be retained exactly while only the remaining tail is
          estimated.
        </p>
      </div>

      <ArticleSection
        id="stirling-geometric-core"
        title="The geometric core idea of Chakraborty’s argument"
      >
        <p>
          For completeness, let us try to understand Chakraborty&apos;s argument.
          Taking logarithms turns the product defining <Math tex="n!" /> into
          the sum <Math tex={String.raw`\log(n!)=\sum_{j=1}^n\log j`} />. If{" "}
          <Math tex={String.raw`g(x)=\log x`} />, then{" "}
          <Math tex={String.raw`g''(x)=-1/x^2<0`} />, so the graph is strictly
          concave. Every chord lies below the curve, while every tangent line
          lies above it. These facts give two
          complementary area comparisons.
        </p>
        <p>
          On <Math tex={String.raw`[m,m+1]`} />, the chord joining{" "}
          <Math tex={String.raw`(m,\log m)`} /> and{" "}
          <Math tex={String.raw`(m+1,\log(m+1))`} /> lies below the curve. For
          the other direction, the tangent at the integer <Math tex="m" /> lies
          above the curve on the centred interval{" "}
          <Math tex={String.raw`[m-\tfrac12,m+\tfrac12]`} />. Thus the tangent
          points are integers and the endpoints of their intervals are
          half-integers. A final half-width rectangle completes the cover up to
          {" "}<Math tex="n" />.
        </p>

        <ChakrabortyAreaExplorer />

        <h3>Chord trapezoids and the upper bound</h3>
        <p>
          For an integer <Math tex="m" />, the chord has equation
        </p>
        <Math
          tex={String.raw`\ell_m(x)=(m+1-x)\log m+(x-m)\log(m+1),\qquad m\le x\le m+1`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          The interval has width one, and the two vertical sides have heights{" "}
          <Math tex={String.raw`\log m`} /> and{" "}
          <Math tex={String.raw`\log(m+1)`} />. Its area is therefore the
          trapezoid area
        </p>
        <Math
          tex={String.raw`\int_m^{m+1}\ell_m(x)\,dx=\frac{\log m+\log(m+1)}{2}`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          For Chakraborty&apos;s starting point <Math tex="k=2" />, add these
          trapezoids for <Math tex={String.raw`m=2,\ldots,n-1`} />. Each
          intermediate logarithm occurs twice with coefficient one half, while
          the two endpoint logarithms occur once. Hence
        </p>
        <Math
          tex={String.raw`\begin{aligned}C_n&=\sum_{m=2}^{n-1}\frac{\log m+\log(m+1)}2\\&=\frac12\log2+\sum_{m=3}^{n-1}\log m+\frac12\log n\\&=\log(n!)-\frac12\log(2n)<\int_2^n\log x\,dx.\end{aligned}`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          Now <Math tex={String.raw`\int_2^n\log x\,dx=n\log n-n-2\log2+2`} />.
          Substituting this and collecting the terms in{" "}
          <Math tex={String.raw`\log R_n`} /> gives
        </p>
        <Math
          tex={String.raw`\log R_n<2-\frac32\log2=\log\!\left(\frac{e^2}{2\sqrt2}\right),\qquad R_n<\frac{e^2}{2\sqrt2}.`}
          display
          className="display-formula stirling-proof-equation"
        />

        <h3>Tangent cells and the lower bound</h3>
        <p>
          The tangent to <Math tex={String.raw`\log x`} /> at the integer{" "}
          <Math tex="m" /> is
        </p>
        <Math
          tex={String.raw`\tau_m(x)=\log m+\frac{x-m}{m}.`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          Chakraborty uses it on the unit cell centred at <Math tex="m" />. Put{" "}
          <Math tex="u=x-m" />. The constant part contributes{" "}
          <Math tex={String.raw`\log m`} />, while the linear part has equal
          positive and negative areas and cancels:
        </p>
        <Math
          tex={String.raw`\begin{aligned}\int_{m-1/2}^{m+1/2}\tau_m(x)\,dx&=\int_{-1/2}^{1/2}\left(\log m+\frac{u}{m}\right)du\\&=\log m.\end{aligned}`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          This is the tangent-cell formula. The cells for{" "}
          <Math tex={String.raw`m=2,\ldots,n-1`} /> cover the interval from{" "}
          <Math tex="3/2" /> to <Math tex="n-1/2" />. To reach{" "}
          <Math tex="n" />, add a final rectangle of width one half and height{" "}
          <Math tex={String.raw`\log n`} />. Their combined area is
        </p>
        <Math
          tex={String.raw`\begin{aligned}T_n&=\sum_{m=2}^{n-1}\log m+\frac12\log n\\&=\log(n!)-\frac12\log n.\end{aligned}`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          Because every tangent cell and the final rectangle lie above the
          logarithmic curve,
        </p>
        <Math
          tex={String.raw`\int_{3/2}^{n}\log x\,dx<T_n=\log(n!)-\frac12\log n.`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          Evaluating the integral and rearranging gives
        </p>
        <Math
          tex={String.raw`\log R_n>\frac32-\frac32\log\frac32=\log\!\left(\frac{2e}{3}\right)^{3/2},\qquad \left(\frac{2e}{3}\right)^{3/2}<R_n.`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          The two constants therefore record the same concave curve in two
          ways: the chord construction begins at <Math tex="2" />, while the
          first centred tangent cell begins at <Math tex="3/2" />.
        </p>
      </ArticleSection>

      <ArticleSection id="stirling-move-start" title="Move the starting point">
        <p>
          Fix integers <Math tex={String.raw`n\ge k\ge2`} />. Keep the initial
          product <Math tex={String.raw`1\cdot2\cdots(k-1)=(k-1)!`} /> untouched,
          and apply the geometric comparison only from <Math tex="k" /> onwards.
        </p>

        <AreaProofAssembler />

        <p>
          For <Math tex="n>k" />, adding the chord trapezoids from{" "}
          <Math tex="k" /> to <Math tex="n" /> gives
        </p>
        <Math
          tex={String.raw`\frac12\log k+\sum_{j=k+1}^{n-1}\log j+\frac12\log n<\int_k^n\log x\,dx`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          Evaluating the integral and collecting logarithms yields{" "}
          <Math tex={String.raw`R_n<R_k`} />. When <Math tex="n=k" />, equality
          is immediate. Hence <Math tex={String.raw`R_n\le R_k`} />, and the
          upper constant at starting point <Math tex="k" /> is{" "}
          <Math tex={String.raw`U_k=R_k=\dfrac{k!e^k}{k^k\sqrt k}`} />.
        </p>

        <p>
          Add the centred tangent cells for{" "}
          <Math tex={String.raw`j=k,\ldots,n-1`} /> and finish with a half-width
          rectangle of height <Math tex={String.raw`\log n`} />. Their combined
          area lies strictly above the curve, so
        </p>
        <Math
          tex={String.raw`\int_{k-1/2}^{n}\log x\,dx<\sum_{j=k}^{n-1}\log j+\frac12\log n`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          Rearrangement gives{" "}
          <Math
            tex={String.raw`L_k=(k-1)!\left(\dfrac{e}{k-\tfrac12}\right)^{k-1/2}`}
          />.
        </p>

        <h3>A family of bounds</h3>
        <p>The two constructions combine into the following theorem.</p>
        <aside className="definition stirling-theorem">
          <span>Theorem</span>
          <p>For integers <Math tex={String.raw`n\ge k\ge2`} />,</p>
          <Math
            tex={String.raw`(k-1)!\left(\frac{e}{k-\tfrac12}\right)^{k-1/2}<\frac{n!}{(n/e)^n\sqrt n}\le\frac{k!e^k}{k^k\sqrt k}`}
            display
          />
          <p>
            The upper inequality is strict when <Math tex="n>k" /> and becomes
            equality when <Math tex="n=k" />.
          </p>
        </aside>
        <p>
          At <Math tex="k=2" />, this recovers Chakraborty&apos;s pair of constants.
          Moving the starting point one step, to <Math tex="k=3" />, gives for
          every integer <Math tex="n>2" />
        </p>
        <Math
          tex={String.raw`2\left(\frac{2e}{5}\right)^{5/2}<R_n\le\frac{2e^3}{9\sqrt3}`}
          display
          className="display-formula"
        />
        <p>
          or <Math tex="2.465563424<R_n\le2.576975589" />. This interval is
          about <Math tex="35.6\%" /> narrower than Chakraborty&apos;s interval over
          the same integer range. The non-strict upper sign matters: equality
          occurs at <Math tex="n=3" />.
        </p>

        <div className="table-wrap stirling-bound-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Starting point</th>
                <th scope="col">Uniform tail</th>
                <th scope="col">Lower endpoint</th>
                <th scope="col">Upper endpoint</th>
                <th scope="col">Width</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><Math tex="k=2" /></td><td><Math tex="n\ge2" /></td><td>2.439522535</td><td>2.612425837</td><td>0.172903302</td></tr>
              <tr><td><Math tex="k=3" /></td><td><Math tex="n\ge3" /></td><td>2.465563424</td><td>2.576975589</td><td>0.111412165</td></tr>
              <tr><td><Math tex="k=5" /></td><td><Math tex="n\ge5" /></td><td>2.483591120</td><td>2.548699488</td><td>0.065108369</td></tr>
              <tr><td><Math tex="k=10" /></td><td><Math tex="n\ge10" /></td><td>2.495665416</td><td>2.527597120</td><td>0.031931705</td></tr>
              <tr><td><Math tex="k=20" /></td><td><Math tex="n\ge20" /></td><td>2.501278769</td><td>2.517093475</td><td>0.015814706</td></tr>
            </tbody>
          </table>
        </div>
      </ArticleSection>

      <ArticleSection id="stirling-real-extension" title="When the integer becomes real">
        <p>
          The Gamma function extends the factorial beyond the integers. Since{" "}
          <Math tex={String.raw`\Gamma(n+1)=n!`} />, define, for real
          {" "}<Math tex="x>2" />,
        </p>
        <Math
          tex={String.raw`R(x):=\frac{\Gamma(x+1)}{(x/e)^x\sqrt x}`}
          display
          className="display-formula"
        />
        <p>
          At an integer <Math tex="n" />, this is exactly <Math tex="R_n" />.
          The lower endpoints of the starting-point construction also have the
          continuous companion
        </p>
        <Math
          tex={String.raw`L(x):=\Gamma(x)\left(\frac{e}{x-\tfrac12}\right)^{x-1/2}`}
          display
          className="display-formula"
        />
        <p>
          with <Math tex={String.raw`L(k)=L_k`} /> and
          {" "}<Math tex={String.raw`R(k)=U_k`} /> at every integer{" "}
          <Math tex="k\ge2" />. The comparison is transparent because the
          Gamma factors cancel:
        </p>
        <Math
          tex={String.raw`\frac{R(x)}{L(x)}=\sqrt e\left(1-\frac1{2x}\right)^{x-1/2}>1`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          The inequality still has the same geometric meaning. In fact,
        </p>
        <Math
          tex={String.raw`\begin{aligned}\log\frac{R(x)}{L(x)}&=\frac12\log x-\int_{x-1/2}^{x}\log t\,dt\\&=\int_{x-1/2}^{x}\log\frac{x}{t}\,dt>0\end{aligned}`}
          display
          className="display-formula stirling-proof-equation"
        />
        <p>
          This is the excess of the final half-width rectangle of height{" "}
          <Math tex={String.raw`\log x`} /> above the logarithmic curve.
          Consequently <Math tex={String.raw`L(x)<R(x)`} /> for every real{" "}
          <Math tex="x>2" />.
        </p>

        <GammaExtensionPlot />

        <p>
          The quotient <Math tex={String.raw`R(x)/L(x)`} /> tends to{" "}
          <Math tex="1" />. The Gamma-function form of Stirling&apos;s formula gives
          {" "}<Math tex={String.raw`R(x)\to\sqrt{2\pi}`} />, and so{" "}
          <Math tex="L(x)" /> approaches the same limit. Here
          {" "}<Math tex="L(x)" /> is a continuous companion to the geometric lower
          endpoints, not an independent computational estimate for Gamma: away
          from the integers, the original sum of logarithms no longer
          telescopes into a factorial.
        </p>

        <section className="notes-section" aria-labelledby="stirling-references-heading">
          <h3 id="stirling-references-heading">Sources and further reading</h3>
          <ol>
            <li>
              Bikash Chakraborty, {" "}
              <a href={SOURCE_DOI}>“Stirling&apos;s Formula: A Better Approximation”</a>,
              <em> The College Mathematics Journal</em>, published online 31 August
              2026, DOI{" "}
              <a href={SOURCE_DOI}>10.1080/07468342.2026.2721230</a>.
            </li>
            <li>
              Walter Rudin, <a href={RUDIN_BOOK}><em>Principles of Mathematical
              Analysis</em></a>, 3rd ed., Chapter 8, Problem 20.
            </li>
            <li>
              NIST Digital Library of Mathematical Functions, {" "}
              <a href={DLMF_STIRLING}>§5.11, Asymptotic Expansions</a>, for the
              Gamma-function form of Stirling&apos;s expansion.
            </li>
          </ol>
        </section>

        <aside className="article-ai-disclosure" aria-label="AI-use declaration">
          <p>
            <strong>AI-use declaration.</strong> ChatGPT and Codex were
            used while discussing the exposition, checking algebra and numerical
            values, prototyping the interactives, and drafting and refining the
            web presentation. The mathematical question, observations, extension,
            final formulation, and judgments belong to the author. The author has
            verified the mathematical statements and computations in this
            published version and accepts responsibility for its contents.
          </p>
        </aside>

        <div className="article-end">
          <span aria-hidden="true">❧</span>
          <p>
            The approximation itself did not change. The sharper bounds appeared
            when the same geometry was asked to begin somewhere else.
          </p>
        </div>
      </ArticleSection>
    </>
  );
}
