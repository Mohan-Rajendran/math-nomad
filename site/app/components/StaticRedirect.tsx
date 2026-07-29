import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type StaticRedirectProps = {
  destination: string;
  title: string;
  description?: string;
  linkLabel?: string;
};

export function staticRedirectMetadata(
  destination: string,
  title: string,
  description = "This Math Nomad page has moved to a new permanent address.",
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: destination },
    robots: { index: false, follow: true },
  };
}

export function StaticRedirect({
  destination,
  title,
  description = "This Math Nomad page has moved to a new permanent address.",
  linkLabel = "Continue to the new page",
}: StaticRedirectProps) {
  const redirectScript = `window.location.replace(${JSON.stringify(destination)});`;

  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${destination}`} />
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      <main id="main-content" className="not-found page-shell">
        <div role="status" aria-live="polite">
          <p className="eyebrow">Page moved</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <Link className="button button-primary" href={destination}>
            {linkLabel} <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </main>
    </>
  );
}
