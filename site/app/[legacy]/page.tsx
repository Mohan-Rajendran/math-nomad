import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  StaticRedirect,
  staticRedirectMetadata,
} from "../components/StaticRedirect";
import { InteractiveDetailContent } from "../components/LabRouteContent";
import { projects } from "../data";
import {
  isCombinedSite,
  isLabSite,
  labInteractiveHref,
} from "../site-mode";

const legacyLabRoutes: Record<string, string> = {
  "law-of-cosines": "/lab/tessellations/law-of-cosines",
  "pythagorean-tiling-proofs": "/lab/tessellations/pythagorean-tiling-proofs",
  "square-kolam-tile-challenge": "/lab/kolam-tiles/square-kolam-tile-challenge",
  "sandbox-2": "/lab/kolam-tiles/sandbox-2",
  "sandbox-3": "/lab/kolam-tiles/sandbox-3",
  "kolams-on-an-octahedron": "/lab/kolam-tiles/kolams-on-an-octahedron",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(legacyLabRoutes).map((legacy) => ({ legacy }));
}

function findLegacyInteractive(slug: string) {
  for (const project of projects) {
    const interactive = project.interactives.find(
      (item) => item.slug === slug,
    );
    if (interactive) return { project, interactive };
  }
  return undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ legacy: string }>;
}): Promise<Metadata> {
  const { legacy } = await params;
  const match = findLegacyInteractive(legacy);
  if (!match) return { title: "Interactive not found" };
  return isLabSite
    ? {
        title: match.interactive.title,
        description: match.interactive.description,
        alternates: { canonical: match.interactive.sourceHref },
      }
    : staticRedirectMetadata(
        labInteractiveHref(match.project.key, match.interactive.slug),
        `${match.interactive.title} has moved`,
      );
}

export default async function LegacyLabRoute({
  params,
}: {
  params: Promise<{ legacy: string }>;
}) {
  const { legacy } = await params;
  const destination = legacyLabRoutes[legacy];
  if (!destination) notFound();
  const match = findLegacyInteractive(legacy);
  if (!match) notFound();

  if (isLabSite) {
    return (
      <InteractiveDetailContent
        project={match.project}
        interactive={match.interactive}
      />
    );
  }

  if (isCombinedSite) {
    redirect(labInteractiveHref(match.project.key, match.interactive.slug));
  }

  return (
    <StaticRedirect
      destination={labInteractiveHref(
        match.project.key,
        match.interactive.slug,
      )}
      title={`${match.interactive.title} has moved.`}
      description="This interactive now has a permanent address in the Math Nomad Lab."
      linkLabel="Open the interactive"
    />
  );
}
