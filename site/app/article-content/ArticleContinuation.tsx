import Link from "next/link";

export type ArticleContinuationItem = {
  href: string;
  title: string;
  description: string;
};

export function ArticleContinuation({
  headingId,
  title,
  items,
}: {
  headingId: string;
  title: string;
  items: readonly ArticleContinuationItem[];
}) {
  return (
    <section className="article-section related-section" aria-labelledby={headingId}>
      <p className="eyebrow">Continue</p>
      <h2 id={headingId}>{title}</h2>
      <div className="related-callout">
        {items.map((item) => {
          const content = (
            <>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
            </>
          );

          return item.href.startsWith("http") ? (
            <a href={item.href} key={`${item.href}-${item.title}`}>
              {content}
            </a>
          ) : (
            <Link href={item.href} key={`${item.href}-${item.title}`}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
