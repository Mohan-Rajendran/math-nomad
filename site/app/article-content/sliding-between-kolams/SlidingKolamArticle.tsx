import { readFileSync } from "node:fs";
import path from "node:path";
import { ArticleContinuation } from "../ArticleContinuation";
import { SlidingKolamBody } from "./SlidingKolamBody";
import "./article.css";

function articleHtml() {
  return readFileSync(
    path.join(
      process.cwd(),
      "app/article-content/sliding-between-kolams/body.html",
    ),
    "utf8",
  );
}

export function SlidingKolamArticleBody() {
  return (
    <>
      <SlidingKolamBody html={articleHtml()} />
      <ArticleContinuation
        headingId="sliding-kolam-continue"
        title="Where to continue"
        items={[
          {
            href: "https://lab.mathnomad.in/sandbox-2/",
            title: "Slide to a New Kolam",
            description:
              "Play the open-ended sliding challenge in the Math Nomad Lab.",
          },
          {
            href: "https://lab.mathnomad.in/sandbox-3/",
            title: "Move X to Y",
            description:
              "Choose a fixed target and explore shortest sliding routes.",
          },
          {
            href: "/articles/kolams-on-a-square/",
            title: "From Sixteen Tiles to Fifty-One Kolams",
            description:
              "Read the tile model, enumeration, and symmetry argument behind the 408 valid boards.",
          },
        ]}
      />
    </>
  );
}
