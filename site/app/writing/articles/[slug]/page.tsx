import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  StaticRedirect,
  staticRedirectMetadata,
} from "../../../components/StaticRedirect";
import { articles } from "../../../data";
import { isCombinedSite, journalHref } from "../../../site-mode";

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.key,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.key === slug);
  if (!article) return { title: "Article not found", robots: { index: false } };
  return staticRedirectMetadata(
    journalHref(article.slug),
    `${article.title} has moved`,
    "This article now has a permanent address in the Articles section.",
  );
}

export default async function LegacyArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((item) => item.key === slug);
  if (!article) notFound();
  if (isCombinedSite) redirect(journalHref(article.slug));

  return (
    <StaticRedirect
      destination={journalHref(article.slug)}
      title="This article has moved."
      description="The complete article now has a permanent address in the Articles section."
      linkLabel={`Continue to “${article.title}”`}
    />
  );
}
