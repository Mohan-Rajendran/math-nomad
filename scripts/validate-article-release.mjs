#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const articles = [
  {
    slug: "binary-kolam-tiles",
    date: "2026-07-17T14:45:00+05:30",
    dateModified: "2026-07-17T18:40:00+05:30",
    embedUrl:
      "https://lab.mathnomad.in/embed/square-kolam-tile-challenge/",
  },
  {
    slug: "law-of-cosines",
    date: "2026-07-20",
    dateModified: undefined,
    embedUrl: "https://lab.mathnomad.in/embed/law-of-cosines/",
  },
  {
    slug: "kolams-on-an-octahedron",
    date: "2026-07-21T00:10:05+05:30",
    dateModified: "2026-07-21T00:10:05+05:30",
    embedUrl: "https://lab.mathnomad.in/embed/kolams-on-an-octahedron/",
  },
  {
    slug: "infinitely-many-proofs-of-pythagoras",
    date: "2026-07-21",
    dateModified: undefined,
    embedUrl:
      "https://lab.mathnomad.in/embed/pythagorean-tiling-proofs/",
  },
];

const draftOnlyPatterns = [
  {
    label: "an enabled draft flag",
    pattern: /^\s*draft:\s*(?:true|yes|on)\s*$/imu,
  },
  {
    label: "draft-only markup",
    pattern: /\b(?:draft[- ]link|draft[- ]only)\b/iu,
  },
  {
    label: "in-preparation wording",
    pattern: /\bin preparation\b/iu,
  },
  {
    label: "not-yet-published wording",
    pattern: /\bnot yet published\b/iu,
  },
  {
    label: "a provisional publication-status label",
    pattern: /\bpublication status\s*:\s*(?:draft|in preparation)\b/iu,
  },
  {
    label: "preview-only wording",
    pattern:
      /\b(?:preview[- ]only|editorial preview|local preview|unlisted preview|for (?:the )?preview)\b/iu,
  },
  {
    label: "placeholder content",
    pattern: /\b(?:dummy content|lorem ipsum|placeholder content)\b/iu,
  },
  {
    label: "a reconstruction or migration note",
    pattern:
      /\b(?:reconstruction|migration)\s+(?:copy|content|note|status)\b/iu,
  },
];

const errors = [];

function addError(location, message) {
  errors.push(`${location}: ${message}`);
}

function unquote(value) {
  const text = value.trim();
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1);
  }
  return text;
}

function parseInlineList(value) {
  const contents = value.trim().slice(1, -1);
  if (!contents.trim()) return [];
  return contents.split(",").map((item) => unquote(item));
}

function parseFrontMatter(source, location) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  if (!match) {
    addError(location, "missing YAML front matter");
    return {};
  }

  const metadata = {};
  let activeList;

  for (const line of match[1].split(/\r?\n/u)) {
    const field = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/u);
    if (field) {
      const [, key, rawValue = ""] = field;
      const value = rawValue.trim();
      activeList = undefined;

      if (!value) {
        metadata[key] = [];
        activeList = key;
      } else if (value.startsWith("[") && value.endsWith("]")) {
        metadata[key] = parseInlineList(value);
      } else {
        metadata[key] = unquote(value);
      }
      continue;
    }

    const listItem = line.match(/^\s+-\s+(.+)$/u);
    if (listItem && activeList) {
      metadata[activeList].push(unquote(listItem[1]));
    }
  }

  return metadata;
}

function valuesOf(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function includesValue(value, expected) {
  const target = expected.toLocaleLowerCase("en");
  return valuesOf(value).some(
    (item) => item.toLocaleLowerCase("en") === target,
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function validateProtectedDates(source, metadata, article, location) {
  if (metadata.date !== article.date) {
    addError(
      location,
      `date must remain exactly "${article.date}" (found ${JSON.stringify(metadata.date)})`,
    );
  }

  if (metadata["date-modified"] !== article.dateModified) {
    const expected =
      article.dateModified === undefined
        ? "absent"
        : `"${article.dateModified}"`;
    addError(
      location,
      `date-modified must remain ${expected} (found ${JSON.stringify(metadata["date-modified"])})`,
    );
  }

  const publishedValues = [
    ...source.matchAll(
      /<meta\s+property=["']article:published_time["']\s+content=["']([^"']+)["'][^>]*>/giu,
    ),
    ...source.matchAll(
      /<meta\s+name=["']citation_publication_date["']\s+content=["']([^"']+)["'][^>]*>/giu,
    ),
    ...source.matchAll(/"datePublished"\s*:\s*"([^"]+)"/gu),
  ].map((match) => match[1]);

  for (const value of publishedValues) {
    if (value !== article.date) {
      addError(
        location,
        `embedded publication date must remain "${article.date}" (found "${value}")`,
      );
    }
  }

  const modifiedValues = [
    ...source.matchAll(
      /<meta\s+property=["']article:modified_time["']\s+content=["']([^"']+)["'][^>]*>/giu,
    ),
    ...source.matchAll(/"dateModified"\s*:\s*"([^"]+)"/gu),
  ].map((match) => match[1]);

  if (article.dateModified === undefined && modifiedValues.length > 0) {
    addError(
      location,
      "must not introduce an article modification date",
    );
  } else {
    for (const value of modifiedValues) {
      if (value !== article.dateModified) {
        addError(
          location,
          `embedded modification date must remain "${article.dateModified}" (found "${value}")`,
        );
      }
    }
  }
}

function validateDraftOnlyMaterial(contents, location) {
  for (const { label, pattern } of draftOnlyPatterns) {
    if (pattern.test(contents)) {
      addError(location, `contains ${label}`);
    }
  }
}

function validateArticleSource(source, metadata, article, location) {
  validateProtectedDates(source, metadata, article, location);

  if (/\beveryone\b/iu.test(source)) {
    addError(location, 'contains the retired audience label "Everyone"');
  }

  if (/class\s*=\s*["'][^"']*\bsection-number\b[^"']*["']/iu.test(source)) {
    addError(location, 'contains "section-number" markup');
  }

  if (/\\boxed\b/u.test(source)) {
    addError(location, "contains a boxed mathematical expression");
  }

  if (/\bdata-src\s*=/iu.test(source)) {
    addError(location, "defers an article interactive instead of embedding it directly");
  }

  validateDraftOnlyMaterial(source, location);

  if (!includesValue(metadata.audience, "General")) {
    addError(location, 'audience metadata must include "General"');
  }

  const articleTypes = [
    ...valuesOf(metadata.kind),
    ...valuesOf(metadata.type),
    ...valuesOf(metadata["article-type"]),
  ];
  if (!includesValue(articleTypes, "Exposition")) {
    addError(location, 'article type metadata must be "Exposition"');
  }

  if (valuesOf(metadata.keywords).length === 0) {
    addError(location, "keywords metadata must contain at least one keyword");
  }

  if (!/\bArticle information\b/u.test(source)) {
    addError(location, 'missing the visible "Article information" section');
  }

  if (!/<meta\s+name=["']citation_msc["']/iu.test(source)) {
    addError(location, "missing machine-readable MSC citation metadata");
  }

  const mscValues = [
    ...valuesOf(metadata.msc),
    ...valuesOf(metadata.msc2020),
    ...valuesOf(metadata["mathematics-subject-classification"]),
  ];
  if (mscValues.length === 0) {
    addError(location, "MSC metadata must contain at least one classification");
  }

  const expectedEmbed = new RegExp(
    `\\bsrc\\s*=\\s*["']${escapeRegExp(article.embedUrl)}["']`,
    "iu",
  );
  if (!expectedEmbed.test(source)) {
    addError(
      location,
      `missing the required Lab embed URL ${article.embedUrl}`,
    );
  }

  const discoveredEmbeds = [
    ...source.matchAll(
      /\bsrc\s*=\s*["'](https:\/\/lab\.mathnomad\.in\/embed\/[^"']+)["']/giu,
    ),
  ].map((match) => match[1]);
  for (const embed of discoveredEmbeds) {
    if (embed !== article.embedUrl) {
      addError(
        location,
        `contains an unexpected Lab embed URL ${embed}`,
      );
    }
  }
}

function validateRenderedArticle(html, article, location) {
  const hasKatexOutput =
    /class=["'][^"']*\bkatex(?:-display)?\b[^"']*["']/iu.test(html) ||
    /(?:href|src)=["'][^"']*katex[^"']*\.(?:css|js)(?:\?[^"']*)?["']/iu.test(
      html,
    );

  if (!hasKatexOutput) {
    addError(location, "does not contain rendered KaTeX output or KaTeX assets");
  }

  const h1Count = (html.match(/<h1(?:\s|>)/giu) || []).length;
  if (h1Count !== 1) {
    addError(location, `must render exactly one h1 (found ${h1Count})`);
  }

  if (/\b(?:mathjax|mjx-container|tex-chtml)\b/iu.test(html)) {
    addError(location, "loads or contains MathJax output");
  }

  if (!/katex@0\.17\.0/iu.test(html)) {
    addError(location, "does not pin the approved KaTeX 0.17.0 runtime");
  }

  validateDraftOnlyMaterial(html, location);

  if (/\beveryone\b/iu.test(html)) {
    addError(location, 'contains the retired audience label "Everyone"');
  }

  if (/class\s*=\s*["'][^"']*\bsection-number\b[^"']*["']/iu.test(html)) {
    addError(location, 'contains rendered "section-number" markup');
  }

  if (!html.includes(article.embedUrl)) {
    addError(
      location,
      `does not contain the required Lab embed URL ${article.embedUrl}`,
    );
  }

  if (!html.includes("Article information")) {
    addError(location, 'does not render the visible "Article information" section');
  }

  const canonicalUrl =
    `https://mathnomad.in/writing/articles/${article.slug}/`;
  if (!html.includes(`<link rel="canonical" href="${canonicalUrl}">`)) {
    addError(location, `missing canonical URL ${canonicalUrl}`);
  }

  if (!/aria-label=["']Audience and article type["']/iu.test(html)) {
    addError(location, "does not render audience and article type above the title");
  }
}

for (const article of articles) {
  const sourceRelative = path.join(
    "writing",
    "articles",
    article.slug,
    "index.qmd",
  );
  const sourcePath = path.join(projectRoot, sourceRelative);

  try {
    const source = await readFile(sourcePath, "utf8");
    const metadata = parseFrontMatter(source, sourceRelative);
    validateArticleSource(source, metadata, article, sourceRelative);
  } catch (error) {
    addError(sourceRelative, `could not read article source: ${error.message}`);
  }

  const outputRelative = path.join(
    "_site",
    "writing",
    "articles",
    article.slug,
    "index.html",
  );
  const outputPath = path.join(projectRoot, outputRelative);

  try {
    const html = await readFile(outputPath, "utf8");
    validateRenderedArticle(html, article, outputRelative);
  } catch (error) {
    addError(
      outputRelative,
      `rendered article is missing or unreadable; run "quarto render" first (${error.message})`,
    );
  }
}

const listingRelative = path.join("_site", "writing", "index.html");
try {
  const listingHtml = await readFile(path.join(projectRoot, listingRelative), "utf8");
  const cardCount = (listingHtml.match(/class="mn-final-article-card"/gu) || []).length;
  const identityCount = (listingHtml.match(/class="mn-final-article-identity"/gu) || []).length;
  const topicCount = (listingHtml.match(/class="mn-final-article-topics"/gu) || []).length;

  if (cardCount !== articles.length) {
    addError(listingRelative, `must render exactly ${articles.length} final article cards`);
  }
  if (identityCount !== articles.length) {
    addError(listingRelative, "must render audience and type in every article card topline");
  }
  if (topicCount !== articles.length) {
    addError(listingRelative, "must render a separate topical tag row for every article card");
  }
  if (/\beveryone\b/iu.test(listingHtml)) {
    addError(listingRelative, 'contains the retired audience label "Everyone"');
  }
} catch (error) {
  addError(listingRelative, `article listing is missing or unreadable (${error.message})`);
}

if (errors.length > 0) {
  console.error(`Article release validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Article release validation passed for ${articles.length} source and rendered articles.`,
  );
}
