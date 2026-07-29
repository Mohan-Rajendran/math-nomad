import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  StaticRedirect,
  staticRedirectMetadata,
} from "../../../components/StaticRedirect";
import { projects } from "../../../data";
import { isCombinedSite, journalHref } from "../../../site-mode";

const legacyProjects: Record<string, string> = {
  tessellations: "/projects/tessellations",
  "kolam-tile-laboratory": "/projects/kolam-tiles",
};

export function generateStaticParams() {
  return Object.keys(legacyProjects).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = legacyProjects[slug];
  if (!destination) return { title: "Project not found", robots: { index: false } };
  const project = projects.find((item) => item.slug === destination);
  return staticRedirectMetadata(
    journalHref(destination),
    `${project?.title ?? "This project"} has moved`,
    "This project now has a permanent address in the Projects section.",
  );
}

export default async function LegacyProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = legacyProjects[slug];
  if (!destination) notFound();
  const project = projects.find((item) => item.slug === destination);
  if (isCombinedSite) redirect(journalHref(destination));

  return (
    <StaticRedirect
      destination={journalHref(destination)}
      title="This project has moved."
      description="The complete project now has a permanent address in the Projects section."
      linkLabel={`Continue to ${project?.title ?? "the project"}`}
    />
  );
}
