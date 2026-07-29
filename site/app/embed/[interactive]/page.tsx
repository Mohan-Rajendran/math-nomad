import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublishedInteractive } from "../../components/PublishedInteractive";
import { projects } from "../../data";

function findInteractive(slug: string) {
  return projects
    .flatMap((project) => project.interactives)
    .find((interactive) => interactive.slug === slug && interactive.embedHref);
}

export function generateStaticParams() {
  return projects.flatMap((project) =>
    project.interactives
      .filter((interactive) => interactive.embedHref)
      .map((interactive) => ({ interactive: interactive.slug })),
  );
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ interactive: string }>;
}): Promise<Metadata> {
  const { interactive: slug } = await params;
  const interactive = findInteractive(slug);
  return interactive
    ? {
        title: interactive.title,
        description: interactive.description,
        alternates: { canonical: interactive.sourceHref },
        robots: { index: false, follow: true },
      }
    : { title: "Interactive not found", robots: { index: false, follow: true } };
}

export default async function InteractiveEmbedPage({
  params,
}: {
  params: Promise<{ interactive: string }>;
}) {
  const { interactive: slug } = await params;
  const interactive = findInteractive(slug);
  if (!interactive) notFound();

  return (
    <main id="main-content" className="embed-page" aria-label={`${interactive.title} embedded interactive`}>
      <PublishedInteractive slug={interactive.slug} />
    </main>
  );
}
