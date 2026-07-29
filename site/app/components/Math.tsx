import katex from "katex";

type MathProps = {
  tex: string;
  display?: boolean;
  className?: string;
};

export function Math({ tex, display = false, className = "" }: MathProps) {
  const html = katex.renderToString(tex, {
    displayMode: display,
    output: "htmlAndMathml",
    strict: "warn",
    throwOnError: false,
    trust: false,
  });
  const classes = [
    "math-expression",
    display ? "math-expression-display" : "math-expression-inline",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (display) {
    return <div className={classes} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return <span className={classes} dangerouslySetInnerHTML={{ __html: html }} />;
}
