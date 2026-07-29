import type { MetadataRoute } from "next";
import { articles, notes, projects } from "./data";
import {
  canonicalUrl,
  isCombinedSite,
  isLabSite,
} from "./site-mode";

type SitemapEntry = MetadataRoute.Sitemap[number];

export const dynamic = "force-static";

function routeUrl(path: string): string {
  if (path === "/") return canonicalUrl("/");
  return canonicalUrl(`${path.replace(/\/+$/, "")}/`);
}

function journalEntries(): SitemapEntry[] {
  return [
    {
      url: routeUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: routeUrl("/articles"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...articles.map(
      (article): SitemapEntry => ({
        url: routeUrl(article.slug),
        lastModified: article.modified ?? article.published,
        changeFrequency: "monthly",
        priority: 0.8,
      }),
    ),
    {
      url: routeUrl("/notes"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...notes.map(
      (note): SitemapEntry => ({
        url: routeUrl(note.slug),
        lastModified: note.revisedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
    {
      url: routeUrl("/projects"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...projects.map(
      (project): SitemapEntry => ({
        url: routeUrl(project.slug),
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
    {
      url: routeUrl("/about"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}

function labEntries(): SitemapEntry[] {
  return [
    {
      url: routeUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: routeUrl("/projects"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...projects.map(
      (project): SitemapEntry => ({
        url: routeUrl(`/projects/${project.key}`),
        changeFrequency: "monthly",
        priority: 0.8,
      }),
    ),
    ...projects.flatMap((project) =>
      project.interactives.map(
        (interactive): SitemapEntry => ({
          url: routeUrl(`/${interactive.slug}`),
          lastModified: interactive.lastTested,
          changeFrequency: "monthly",
          priority: 0.8,
        }),
      ),
    ),
  ];
}

function combinedLabEntries(): SitemapEntry[] {
  return [
    {
      url: routeUrl("/lab"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...projects.flatMap((project) => [
      {
        url: routeUrl(`/lab/${project.key}`),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      ...project.interactives.map(
        (interactive): SitemapEntry => ({
          url: routeUrl(`/lab/${project.key}/${interactive.slug}`),
          lastModified: interactive.lastTested,
          changeFrequency: "monthly",
          priority: 0.7,
        }),
      ),
    ]),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  if (isLabSite) return labEntries();
  const entries = journalEntries();
  return isCombinedSite ? [...entries, ...combinedLabEntries()] : entries;
}
