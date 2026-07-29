import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabProjectContent } from "../../components/LabRouteContent";
import { projects } from "../../data";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ project: project.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ project: string }> }): Promise<Metadata> {
  const { project: key } = await params;
  const project = projects.find((item) => item.key === key);
  return project ? { title: `${project.title} Lab`, description: project.question } : { title: "Lab project not found" };
}

export default async function LabProjectPage({ params }: { params: Promise<{ project: string }> }) {
  const { project: key } = await params;
  const project = projects.find((item) => item.key === key);
  if (!project) notFound();
  return <LabProjectContent project={project} />;
}
