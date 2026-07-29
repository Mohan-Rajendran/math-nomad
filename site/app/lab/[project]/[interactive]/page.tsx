import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteractiveDetailContent } from "../../../components/LabRouteContent";
import { projects } from "../../../data";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.flatMap((project) =>
    project.interactives.map((interactive) => ({
      project: project.key,
      interactive: interactive.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ project: string; interactive: string }>;
}): Promise<Metadata> {
  const { project: key, interactive: slug } = await params;
  const project = projects.find((item) => item.key === key);
  const interactive = project?.interactives.find((item) => item.slug === slug);
  return interactive
    ? { title: interactive.title, description: interactive.description }
    : { title: "Interactive not found" };
}

export default async function InteractiveDetailPage({
  params,
}: {
  params: Promise<{ project: string; interactive: string }>;
}) {
  const { project: key, interactive: slug } = await params;
  const project = projects.find((item) => item.key === key);
  const interactive = project?.interactives.find((item) => item.slug === slug);
  if (!project || !interactive) notFound();

  return (
    <InteractiveDetailContent
      project={project}
      interactive={interactive}
    />
  );
}
