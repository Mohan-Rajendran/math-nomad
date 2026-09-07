#!/usr/bin/env node

import {
  access,
  readFile,
  readdir,
  stat,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SITE_VARIANTS = {
  main: {
    hostname: "mathnomad.in",
    repository: "https://github.com/Mohan-Rajendran/math-nomad",
    otherRepository:
      "https://github.com/Mohan-Rajendran/math-nomad-lab",
  },
  lab: {
    hostname: "lab.mathnomad.in",
    repository: "https://github.com/Mohan-Rajendran/math-nomad-lab",
    otherRepository: "https://github.com/Mohan-Rajendran/math-nomad",
  },
};

const ARTICLES = [
  {
    slug: "moving-the-starting-line-in-stirlings-formula",
    published: "2026-09-07",
    citationDate: "2026-09-07",
    displayDate: "7 September 2026",
    clientMarker: "The areas in the proof",
  },
  {
    slug: "law-of-cosines",
    published: "2026-07-21",
    citationDate: "2026-07-21",
    displayDate: "21 July 2026",
    clientMarker: "Triangles up to similarity",
  },
  {
    slug: "kolams-on-an-octahedron",
    published: "2026-07-21T00:10:05+05:30",
    modified: "2026-07-21T00:10:05+05:30",
    citationDate: "2026-07-21",
    displayDate: "21 July 2026",
    clientMarker: "Choose one of the three kolams",
  },
  {
    slug: "infinitely-many-proofs-of-pythagoras",
    published: "2026-07-20",
    citationDate: "2026-07-20",
    displayDate: "20 July 2026",
    clientMarker: "Two tilings of the plane",
  },
  {
    slug: "kolams-on-a-square",
    published: "2026-07-17T14:45:00+05:30",
    modified: "2026-07-17T18:40:00+05:30",
    citationDate: "2026-07-17",
    displayDate: "17 July 2026",
    clientMarker: "Construction board",
  },
];

const NOTES = [
  {
    route: "/notes/combinatorics/sixteen-tiles-one-kolam-puzzle/",
    published: "2026-07-15",
    displayDate: "15 July 2026",
    marker: "A possible classroom rhythm",
  },
  {
    route: "/notes/linear-algebra/what-row-reduction-remembers/",
    published: "2026-08-09",
    displayDate: "9 August 2026",
    marker: "The object that does not move",
    pdfAsset:
      "notes/linear-algebra/what-row-reduction-remembers/what-row-reduction-remembers.pdf",
  },
];

const INTERACTIVES = [
  {
    slug: "law-of-cosines",
    project: "tessellations",
    clientMarker: "Triangles up to similarity",
    embedded: true,
  },
  {
    slug: "pythagorean-tiling-proofs",
    project: "tessellations",
    clientMarker: "Two tilings of the plane",
    embedded: true,
  },
  {
    slug: "square-kolam-tile-challenge",
    project: "kolam-tiles",
    clientMarker: "Construction board",
    embedded: true,
  },
  {
    slug: "sandbox-2",
    project: "kolam-tiles",
    clientMarker: "15-puzzle board",
    embedded: false,
  },
  {
    slug: "sandbox-3",
    project: "kolam-tiles",
    clientMarker: "Movable configuration",
    embedded: false,
  },
  {
    slug: "kolams-on-an-octahedron",
    project: "kolam-tiles",
    clientMarker: "Choose one of the three kolams",
    embedded: true,
  },
];

const MAIN_HTML_ROUTES = [
  "/",
  "/about/",
  "/articles/",
  ...ARTICLES.map(({ slug }) => `/articles/${slug}/`),
  "/notes/",
  ...NOTES.map(({ route }) => route),
  "/projects/",
  "/projects/tessellations/",
  "/projects/kolam-tiles/",
];

const MAIN_REDIRECT_ROUTES = [
  {
    route: "/articles/binary-kolam-tiles/",
    destination: "/articles/kolams-on-a-square/",
  },
  {
    route: "/writing/articles/binary-kolam-tiles/",
    destination: "/articles/kolams-on-a-square/",
  },
];

const LAB_HTML_ROUTES = [
  "/",
  "/projects/tessellations/",
  "/projects/kolam-tiles/",
  ...INTERACTIVES.map(({ slug }) => `/${slug}/`),
  ...INTERACTIVES.filter(({ embedded }) => embedded).map(
    ({ slug }) => `/embed/${slug}/`,
  ),
];

const SHARED_REQUIRED_ASSETS = [
  "404.html",
  "CNAME",
  "favicon.svg",
  "mathnomad-logo.png",
  "_next/static",
  "robots.txt",
  "sitemap.xml",
];

const MAIN_REQUIRED_ASSETS = [
  "feed.xml",
  "mohan-r.jpeg",
  "articles/kolams-on-an-octahedron/octahedron-hero.svg",
  "articles/kolams-on-an-octahedron/triangular-kolam-tiles.svg",
  "articles/binary-kolam-tiles/kolam-13-hero.webp",
  "articles/binary-kolam-tiles/fifty-one-kolams.pdf",
  "notes/linear-algebra/what-row-reduction-remembers/what-row-reduction-remembers.pdf",
];

const FORBIDDEN_COPY = [
  {
    label: "Lorem Ipsum copy",
    expression: /\blorem\s+ipsum\b/i,
  },
  {
    label: "dummy content",
    expression: /\bdummy\s+(?:content|copy|text)\b/i,
  },
  {
    label: "filler content",
    expression: /\bfiller\s+(?:content|copy|text)\b/i,
  },
  {
    label: "placeholder copy",
    expression: /\bplaceholder\s+(?:content|copy|text)\b/i,
  },
  {
    label: "sample copy",
    expression: /\bsample\s+(?:content|copy|text)\b/i,
  },
  {
    label: "coming-soon copy",
    expression: /\bcoming\s+soon\b/i,
  },
  {
    label: "under-construction copy",
    expression: /\bunder\s+construction\b/i,
  },
  {
    label: "work-in-progress copy",
    expression: /\bwork\s+in\s+progress\b/i,
  },
  {
    label: "preview-only copy",
    expression: /\bpreview\s+only\b/i,
  },
  {
    label: "draft marker",
    expression: /\bdraft(?:\s+(?:article|entry|note|page|copy|content))?\b/i,
  },
  {
    label: "TODO marker",
    expression: /\bTODO\b/,
  },
  {
    label: "TBD marker",
    expression: /\bTBD\b/,
  },
  {
    label: "unpublished companion copy",
    expression: /\bnot\s+yet\s+published\b/i,
  },
  {
    label: "in-preparation publication copy",
    expression: /\bpublication\s+status\s*:\s*in\s+preparation\b/i,
  },
  {
    label: "pending quotation fallback",
    expression: /\bquotation\s+registry\s+pending\b/i,
  },
  {
    label: "pending quotation fallback",
    expression:
      /\ban\s+approved\s+mathematical\s+quotation\s+will\s+appear\s+here\b/i,
  },
];

const HTML_ENTITIES = new Map([
  ["amp", "&"],
  ["apos", "'"],
  ["gt", ">"],
  ["lt", "<"],
  ["nbsp", " "],
  ["quot", '"'],
]);

function usage() {
  return `Usage:
  node scripts/validate-static-release.mjs main [out-directory]
  node scripts/validate-static-release.mjs lab [out-directory]
  node scripts/validate-static-release.mjs --variant main|lab [--out out-directory]`;
}

function parseArguments(argumentsList) {
  let variant;
  let outputDirectory;
  const positional = [];

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--help" || argument === "-h") {
      console.log(usage());
      process.exit(0);
    }
    if (argument === "--variant") {
      variant = argumentsList[index + 1];
      index += 1;
      continue;
    }
    if (argument.startsWith("--variant=")) {
      variant = argument.slice("--variant=".length);
      continue;
    }
    if (argument === "--out") {
      outputDirectory = argumentsList[index + 1];
      index += 1;
      continue;
    }
    if (argument.startsWith("--out=")) {
      outputDirectory = argument.slice("--out=".length);
      continue;
    }
    if (argument.startsWith("-")) {
      throw new Error(`Unknown option ${JSON.stringify(argument)}.\n${usage()}`);
    }
    positional.push(argument);
  }

  if (!variant) variant = positional.shift();
  if (!outputDirectory) outputDirectory = positional.shift();
  if (positional.length) {
    throw new Error(
      `Unexpected argument ${JSON.stringify(positional[0])}.\n${usage()}`,
    );
  }
  if (!Object.hasOwn(SITE_VARIANTS, variant)) {
    throw new Error(
      `Variant must be either "main" or "lab"; received ${JSON.stringify(variant)}.\n${usage()}`,
    );
  }

  return {
    variant,
    outputDirectory: path.resolve(outputDirectory || "out"),
  };
}

function decodeHtml(value) {
  return value.replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (entity, body) => {
      const normalised = body.toLowerCase();
      if (normalised.startsWith("#x")) {
        return String.fromCodePoint(Number.parseInt(normalised.slice(2), 16));
      }
      if (normalised.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(normalised.slice(1), 10));
      }
      return HTML_ENTITIES.get(normalised) ?? entity;
    },
  );
}

function attributesFromTag(tag) {
  const attributes = new Map();
  const opening = tag.match(/^<[^\s>]+/);
  const source = opening ? tag.slice(opening[0].length) : tag;
  const expression =
    /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of source.matchAll(expression)) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attributes.set(name, decodeHtml(value));
  }
  return attributes;
}

function tagsNamed(html, tagName) {
  const expression = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  return [...html.matchAll(expression)].map((match) => ({
    tag: match[0],
    attributes: attributesFromTag(match[0]),
  }));
}

function canonicalValues(html) {
  return tagsNamed(html, "link")
    .filter(({ attributes }) =>
      (attributes.get("rel") || "")
        .toLowerCase()
        .split(/\s+/)
        .includes("canonical"),
    )
    .map(({ attributes }) => attributes.get("href") || "")
    .filter(Boolean);
}

function metaValues(html, attributeName, attributeValue) {
  return tagsNamed(html, "meta")
    .filter(
      ({ attributes }) =>
        (attributes.get(attributeName) || "").toLowerCase() ===
        attributeValue.toLowerCase(),
    )
    .map(({ attributes }) => attributes.get("content") || "");
}

function anchorHrefs(html) {
  return tagsNamed(html, "a")
    .map(({ attributes }) => attributes.get("href") || "")
    .filter(Boolean);
}

function scriptSources(html) {
  return tagsNamed(html, "script")
    .map(({ attributes }) => attributes.get("src") || "")
    .filter(Boolean);
}

function visibleText(html) {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function isRedirectDocument(html) {
  const refresh = tagsNamed(html, "meta").some(
    ({ attributes }) =>
      (attributes.get("http-equiv") || "").toLowerCase() === "refresh",
  );
  return (
    refresh ||
    html.includes("__next-page-redirect") ||
    html.includes("NEXT_REDIRECT")
  );
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(root) {
  const files = [];
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

function portableRelative(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function routeForHtmlFile(root, filePath) {
  const relative = portableRelative(root, filePath);
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"/index.html".length)}/`;
  }
  return `/${relative}`;
}

function routeCandidates(root, route) {
  const pathname = route.split(/[?#]/, 1)[0];
  if (pathname === "/") return [path.join(root, "index.html")];

  let decodedPathname = pathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    // Retain the literal URL path; the broken-link error will identify it.
  }

  const pathnames = [...new Set([pathname, decodedPathname])];
  const candidates = [];
  for (const candidatePathname of pathnames) {
    const relative = candidatePathname.replace(/^\/+/, "");
    const direct = path.join(root, relative);
    candidates.push(direct);
    if (candidatePathname.endsWith("/")) {
      candidates.push(path.join(direct, "index.html"));
    } else if (!path.extname(candidatePathname)) {
      candidates.push(`${direct}.html`, path.join(direct, "index.html"));
    }
  }
  return [...new Set(candidates)];
}

function staysInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function findRouteFile(root, route) {
  for (const candidate of routeCandidates(root, route)) {
    if (staysInside(root, candidate) && (await pathExists(candidate))) {
      const details = await stat(candidate);
      if (details.isFile()) return candidate;
    }
  }
  return null;
}

function expectedCanonical(hostname, route) {
  return new URL(route, `https://${hostname}`).toString();
}

function sameRepositoryHref(actual, expected) {
  try {
    const actualUrl = new URL(actual);
    const expectedUrl = new URL(expected);
    return (
      actualUrl.protocol === expectedUrl.protocol &&
      actualUrl.hostname.toLowerCase() === expectedUrl.hostname.toLowerCase() &&
      actualUrl.pathname.replace(/\/+$/, "") ===
        expectedUrl.pathname.replace(/\/+$/, "")
    );
  } catch {
    return false;
  }
}

function internalReference(rawReference, pageRoute, hostname) {
  const reference = rawReference.trim();
  if (
    !reference ||
    reference.startsWith("#") ||
    /^(?:mailto|tel|data|blob):/i.test(reference)
  ) {
    return null;
  }
  if (/^javascript:/i.test(reference)) {
    return {
      unsafe: true,
      pathname: reference,
      raw: rawReference,
    };
  }

  let resolved;
  try {
    resolved = new URL(reference, `https://${hostname}${pageRoute}`);
  } catch {
    return {
      invalid: true,
      pathname: reference,
      raw: rawReference,
    };
  }

  if (!["http:", "https:"].includes(resolved.protocol)) return null;
  if (resolved.hostname.toLowerCase() !== hostname.toLowerCase()) return null;
  return {
    pathname: resolved.pathname,
    raw: rawReference,
  };
}

function extractReferences(html) {
  const references = [];
  for (const tag of html.matchAll(/<[a-z][^>]*>/gi)) {
    const attributes = attributesFromTag(tag[0]);
    for (const attribute of ["href", "src"]) {
      const value = attributes.get(attribute);
      if (value) {
        references.push({
          attribute,
          value,
          tag: tag[0].match(/^<([^\s>]+)/)?.[1]?.toLowerCase() || "element",
        });
      }
    }
  }
  return references;
}

function jsonLdStringValues(html, propertyName) {
  const values = [];
  const scriptExpression = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(scriptExpression)) {
    const attributes = attributesFromTag(`<script ${match[1]}>`);
    if ((attributes.get("type") || "").toLowerCase() !== "application/ld+json") {
      continue;
    }
    try {
      const parsed = JSON.parse(match[2]);
      const visit = (value) => {
        if (Array.isArray(value)) {
          value.forEach(visit);
          return;
        }
        if (!value || typeof value !== "object") return;
        if (typeof value[propertyName] === "string") {
          values.push(value[propertyName]);
        }
        Object.values(value).forEach(visit);
      };
      visit(parsed);
    } catch {
      values.push("<invalid JSON-LD>");
    }
  }
  return values;
}

function exactSetDifference(actual, expected) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  return {
    missing: expected.filter((value) => !actualSet.has(value)),
    unexpected: actual.filter((value) => !expectedSet.has(value)),
  };
}

function markersAppearInOrder(source, markers) {
  let cursor = -1;
  for (const marker of markers) {
    cursor = source.indexOf(marker, cursor + 1);
    if (cursor < 0) return false;
  }
  return true;
}

const { variant, outputDirectory } = parseArguments(process.argv.slice(2));
const site = SITE_VARIANTS[variant];
const issues = [];
const issueKeys = new Set();
const requiredHtml = new Map();
const clientChunkCache = new Map();

function report(scope, problem, remediation) {
  const key = `${scope}\0${problem}\0${remediation || ""}`;
  if (issueKeys.has(key)) return;
  issueKeys.add(key);
  issues.push({ scope, problem, remediation });
}

if (!(await pathExists(outputDirectory))) {
  console.error(
    `Static release validation could not start: ${outputDirectory} does not exist.\n` +
      `Build and prepare the ${variant} artifact, then rerun:\n` +
      `  node scripts/validate-static-release.mjs ${variant} ${outputDirectory}`,
  );
  process.exit(2);
}

if (!(await pathExists(path.join(outputDirectory, "index.html")))) {
  console.error(
    `Static release validation could not start: ${outputDirectory} is not a native Next static artifact (index.html is missing).`,
  );
  process.exit(2);
}

for (const relative of [
  ".nojekyll",
  ...SHARED_REQUIRED_ASSETS,
  ...(variant === "main" ? MAIN_REQUIRED_ASSETS : []),
]) {
  const target = path.join(outputDirectory, relative);
  if (!(await pathExists(target))) {
    report(
      relative,
      "Required release asset is missing.",
      relative === ".nojekyll"
        ? "Run the Pages-output preparation step after next build; it must create out/.nojekyll."
        : `Ensure the static build or preparation step emits ${relative}.`,
    );
  }
}

const cnamePath = path.join(outputDirectory, "CNAME");
if (await pathExists(cnamePath)) {
  const cname = (await readFile(cnamePath, "utf8")).trim().toLowerCase();
  const declaredVariant = Object.entries(SITE_VARIANTS).find(
    ([, candidate]) => candidate.hostname === cname,
  )?.[0];
  if (declaredVariant && declaredVariant !== variant) {
    console.error(
      `Static release validation FAILED: ${outputDirectory} declares ${JSON.stringify(cname)} in CNAME, so it is the ${declaredVariant} artifact, not the requested ${variant} artifact.\n` +
        `Run the matching command instead:\n` +
        `  node scripts/validate-static-release.mjs ${declaredVariant} ${outputDirectory}`,
    );
    process.exit(1);
  }
  if (cname !== site.hostname) {
    report(
      "CNAME",
      `CNAME contains ${JSON.stringify(cname)}; expected ${JSON.stringify(site.hostname)} for the ${variant} artifact.`,
      "Generate separate artifacts and write the matching custom domain into each one.",
    );
  }
}

const expectedRoutes =
  variant === "main" ? MAIN_HTML_ROUTES : LAB_HTML_ROUTES;
for (const route of expectedRoutes) {
  const routeFile = await findRouteFile(outputDirectory, route);
  if (!routeFile) {
    report(
      route,
      "Required HTML route is missing.",
      `Export this route as ${route === "/" ? "index.html" : `${route}index.html`}.`,
    );
    continue;
  }
  const html = await readFile(routeFile, "utf8");
  requiredHtml.set(route, { file: routeFile, html });
  if (!/<html\b/i.test(html) || !/<main\b/i.test(html)) {
    report(
      route,
      `The route file ${portableRelative(outputDirectory, routeFile)} does not contain a complete HTML page.`,
      "Check that next build completed and that the preparation step copied, rather than truncated, the route.",
    );
  }
  if (isRedirectDocument(html)) {
    report(
      route,
      "A required canonical page is a redirect document rather than page content.",
      "Render this public route directly in the selected site variant.",
    );
  }
}

const allFiles = await walkFiles(outputDirectory);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
const htmlDocuments = await Promise.all(
  htmlFiles.map(async (file) => ({
    file,
    route: routeForHtmlFile(outputDirectory, file),
    html: await readFile(file, "utf8"),
  })),
);

for (const { file, route, html } of htmlDocuments) {
  const references = extractReferences(html);
  for (const { attribute, value, tag } of references) {
    const internal = internalReference(value, route, site.hostname);
    if (!internal) continue;
    if (internal.unsafe) {
      report(
        route,
        `${tag}[${attribute}] contains the unsafe URL ${JSON.stringify(value)}.`,
        "Use a normal hyperlink or event handler instead of a javascript: URL.",
      );
      continue;
    }
    if (internal.invalid) {
      report(
        route,
        `${tag}[${attribute}] contains the invalid URL ${JSON.stringify(value)}.`,
        "Correct or remove the malformed URL.",
      );
      continue;
    }
    if (!(await findRouteFile(outputDirectory, internal.pathname))) {
      report(
        route,
        `${tag}[${attribute}] points to missing internal target ${JSON.stringify(value)} (resolved as ${internal.pathname}).`,
        `Add the target to the ${variant} artifact or make the link absolute to the other Math Nomad host.`,
      );
    }
  }

  const text = visibleText(html);
  for (const { label, expression } of FORBIDDEN_COPY) {
    const match = text.match(expression);
    if (match) {
      report(
        route,
        `Forbidden ${label} appears in published copy: ${JSON.stringify(match[0])}.`,
        `Replace the unfinished copy in the source page that produces ${portableRelative(outputDirectory, file)}.`,
      );
    }
  }

  const redirect = isRedirectDocument(html);
  if (!redirect) {
    for (const canonical of canonicalValues(html)) {
      let canonicalUrl;
      try {
        canonicalUrl = new URL(canonical);
      } catch {
        report(
          route,
          `Canonical URL ${JSON.stringify(canonical)} is invalid.`,
          `Use an absolute https://${site.hostname}/ URL.`,
        );
        continue;
      }
      if (
        canonicalUrl.protocol !== "https:" ||
        canonicalUrl.hostname.toLowerCase() !== site.hostname
      ) {
        report(
          route,
          `Canonical ${JSON.stringify(canonical)} does not belong to https://${site.hostname}.`,
          `Build this artifact with the ${variant} site variant and its matching metadata origin.`,
        );
      }
    }

    const hrefs = anchorHrefs(html);
    if (hrefs.some((href) => sameRepositoryHref(href, site.otherRepository))) {
      report(
        route,
        `Page links to the wrong GitHub repository (${site.otherRepository}).`,
        `Use ${site.repository} throughout the ${variant} artifact.`,
      );
    }
  }

  for (const href of anchorHrefs(html)) {
    const internal = internalReference(href, route, site.hostname);
    if (!internal || internal.invalid || internal.unsafe) continue;
    if (
      variant === "main" &&
      /^\/lab(?:\/|$)/i.test(internal.pathname)
    ) {
      report(
        route,
        `Journal link ${JSON.stringify(href)} points to an internal /lab path.`,
        `Use an absolute https://lab.mathnomad.in/ URL in the main artifact.`,
      );
    }
    if (
      variant === "lab" &&
      /^\/(?:about|articles|notes|writing|courses)(?:\/|$)/i.test(
        internal.pathname,
      )
    ) {
      report(
        route,
        `Lab link ${JSON.stringify(href)} is a relative journal link.`,
        `Use the absolute journal URL https://mathnomad.in${internal.pathname}.`,
      );
    }
    if (
      variant === "lab" &&
      /^\/feed\.xml$/i.test(internal.pathname)
    ) {
      report(
        route,
        `Lab link ${JSON.stringify(href)} points to the journal feed as a local file.`,
        "Use https://mathnomad.in/feed.xml.",
      );
    }
  }
}

for (const route of expectedRoutes) {
  const page = requiredHtml.get(route);
  if (!page) continue;
  const expected =
    variant === "lab" && route.startsWith("/embed/")
      ? expectedCanonical(
          site.hostname,
          `/${route.split("/").filter(Boolean).at(-1)}/`,
        )
      : expectedCanonical(site.hostname, route);
  const canonicals = canonicalValues(page.html);
  if (canonicals.length !== 1 || canonicals[0] !== expected) {
    report(
      route,
      `Expected exactly one canonical ${JSON.stringify(expected)}; found ${JSON.stringify(canonicals)}.`,
      "Set route metadata with the selected site origin and trailing-slash public path.",
    );
  }

  const hrefs = anchorHrefs(page.html);
  if (!hrefs.some((href) => sameRepositoryHref(href, site.repository))) {
    report(
      route,
      `The page does not link to the ${variant} GitHub repository ${site.repository}.`,
      "Render the site shell using the selected release variant.",
    );
  }
  if (hrefs.some((href) => sameRepositoryHref(href, site.otherRepository))) {
    report(
      route,
      `The page links to the opposite GitHub repository ${site.otherRepository}.`,
      `Render the site shell using ${site.repository}.`,
    );
  }

  const hasHeaderLogo = tagsNamed(page.html, "img").some(
    ({ attributes }) =>
      (attributes.get("src") || "").split(/[?#]/, 1)[0] ===
      "/mathnomad-logo.png",
  );
  if (!hasHeaderLogo || !visibleText(page.html).includes("Math Nomad")) {
    report(
      route,
      "The shared header is missing the Math Nomad logo-and-wordmark pair.",
      "Render /mathnomad-logo.png immediately before the Math Nomad wordmark in the site brand link.",
    );
  }
}

if (variant === "main") {
  for (const { route, destination } of MAIN_REDIRECT_ROUTES) {
    const routeFile = await findRouteFile(outputDirectory, route);
    if (!routeFile) {
      report(
        route,
        "Required historical article redirect is missing.",
        `Export a noindex redirect from ${route} to ${destination}.`,
      );
      continue;
    }
    const html = await readFile(routeFile, "utf8");
    const expected = expectedCanonical(site.hostname, destination);
    const destinationLinked = anchorHrefs(html).some((href) => {
      const internal = internalReference(href, route, site.hostname);
      return internal?.pathname === destination;
    });
    const robots = metaValues(html, "name", "robots");
    if (
      !isRedirectDocument(html) ||
      canonicalValues(html).length !== 1 ||
      canonicalValues(html)[0] !== expected ||
      !destinationLinked ||
      !robots.some((value) => /noindex/i.test(value) && /follow/i.test(value))
    ) {
      report(
        route,
        `Historical route does not fully redirect to ${destination} with canonical and noindex, follow metadata.`,
        "Use the shared StaticRedirect page and staticRedirectMetadata helper.",
      );
    }
  }
}

async function referencedClientSource(route, html) {
  const sources = scriptSources(html);
  const localScripts = [];
  for (const source of sources) {
    const internal = internalReference(source, route, site.hostname);
    if (!internal || internal.invalid || internal.unsafe) continue;
    const scriptFile = await findRouteFile(outputDirectory, internal.pathname);
    if (!scriptFile || path.extname(scriptFile) !== ".js") continue;
    localScripts.push(scriptFile);
  }

  if (!localScripts.length) {
    report(
      route,
      "No local JavaScript client chunks are referenced.",
      "Do not strip the _next/static/chunks scripts from the native Next export.",
    );
    return "";
  }

  const contents = [];
  for (const scriptFile of [...new Set(localScripts)]) {
    if (!clientChunkCache.has(scriptFile)) {
      clientChunkCache.set(scriptFile, await readFile(scriptFile, "utf8"));
    }
    contents.push(clientChunkCache.get(scriptFile));
  }
  return contents.join("\n");
}

const staticFiles = allFiles.filter((file) =>
  portableRelative(outputDirectory, file).startsWith("_next/static/"),
);
const cssFiles = staticFiles.filter((file) => file.endsWith(".css"));
const javascriptFiles = staticFiles.filter((file) => file.endsWith(".js"));
const katexFontFiles = staticFiles.filter(
  (file) =>
    /(?:^|\/)KaTeX_[^/]+\.(?:ttf|woff2?|otf)$/i.test(
      portableRelative(outputDirectory, file),
    ),
);
if (!cssFiles.length) {
  report(
    "_next/static",
    "No exported CSS chunks were found.",
    "Preserve the complete native Next _next/static directory.",
  );
}
if (!javascriptFiles.length) {
  report(
    "_next/static",
    "No exported JavaScript chunks were found.",
    "Preserve the complete native Next _next/static directory.",
  );
}
if (!katexFontFiles.length) {
  report(
    "_next/static",
    "No KaTeX font assets were found.",
    "Keep the KaTeX CSS import and preserve _next/static/media in the release artifact.",
  );
}
if (cssFiles.length) {
  const css = (
    await Promise.all(cssFiles.map((file) => readFile(file, "utf8")))
  ).join("\n");
  if (!/\.katex(?:\W|$)/.test(css)) {
    report(
      "_next/static",
      "Exported CSS does not contain KaTeX styles.",
      "Keep the katex/dist/katex.min.css import in the root layout.",
    );
  }
}

if (variant === "main") {
  let articleDirectoryEntries = [];
  try {
    articleDirectoryEntries = await readdir(
      path.join(outputDirectory, "articles"),
      { withFileTypes: true },
    );
  } catch {
    // The missing /articles route has already been reported.
  }
  const renderedArticleSlugs = [];
  for (const entry of articleDirectoryEntries) {
    if (
      entry.isDirectory() &&
      (await pathExists(
        path.join(outputDirectory, "articles", entry.name, "index.html"),
      ))
    ) {
      const articleHtml = await readFile(
        path.join(outputDirectory, "articles", entry.name, "index.html"),
        "utf8",
      );
      if (!isRedirectDocument(articleHtml)) renderedArticleSlugs.push(entry.name);
    }
  }
  const expectedArticleSlugs = ARTICLES.map(({ slug }) => slug);
  const articleDifference = exactSetDifference(
    renderedArticleSlugs.sort(),
    expectedArticleSlugs.sort(),
  );
  if (articleDifference.missing.length || articleDifference.unexpected.length) {
    report(
      "/articles/",
      `Expected exactly ${ARTICLES.length} article routes. Missing: ${articleDifference.missing.join(", ") || "none"}; unexpected: ${articleDifference.unexpected.join(", ") || "none"}.`,
      "Regenerate the article routes from the frozen publication registry.",
    );
  }

  const expectedArticleTitles = [
    "Starting Later: Geometric Bounds for Stirling’s Formula",
    "The Law of Cosines",
    "Kolams on Octahedron",
    "Infinitely many ‘proofs’ of Pythagoras’ theorem",
    "From Sixteen Tiles to Fifty-One Kolams",
  ];
  const articlesIndex = requiredHtml.get("/articles/");
  if (
    articlesIndex &&
    !markersAppearInOrder(visibleText(articlesIndex.html), expectedArticleTitles)
  ) {
    report(
      "/articles/",
      "Articles are not rendered in the approved newest-first order.",
      "Use the publication-sorted article registry for the Recent first view.",
    );
  }
  const homepage = requiredHtml.get("/");
  if (
    homepage &&
    !markersAppearInOrder(
      visibleText(homepage.html),
      expectedArticleTitles.slice(0, 3),
    )
  ) {
    report(
      "/",
      "The recently published article cards are not in the approved newest-first order.",
      "Use the publication-sorted article registry on the homepage.",
    );
  }

  for (const article of ARTICLES) {
    const route = `/articles/${article.slug}/`;
    const page = requiredHtml.get(route);
    if (!page) continue;

    const publicationTimes = metaValues(
      page.html,
      "property",
      "article:published_time",
    );
    if (
      publicationTimes.length !== 1 ||
      publicationTimes[0] !== article.published
    ) {
      report(
        route,
        `Frozen article:published_time must be ${JSON.stringify(article.published)}; found ${JSON.stringify(publicationTimes)}.`,
        "Restore the original publication timestamp; do not derive it from the build or modification date.",
      );
    }

    const citationDates = metaValues(
      page.html,
      "name",
      "citation_publication_date",
    );
    if (
      citationDates.length !== 1 ||
      citationDates[0] !== article.citationDate
    ) {
      report(
        route,
        `Frozen citation_publication_date must be ${JSON.stringify(article.citationDate)}; found ${JSON.stringify(citationDates)}.`,
        "Restore the original citation date in article metadata.",
      );
    }

    const jsonLdDates = jsonLdStringValues(page.html, "datePublished");
    if (
      jsonLdDates.length !== 1 ||
      jsonLdDates[0] !== article.published
    ) {
      report(
        route,
        `Frozen JSON-LD datePublished must be ${JSON.stringify(article.published)}; found ${JSON.stringify(jsonLdDates)}.`,
        "Restore the original datePublished value in the ScholarlyArticle JSON-LD.",
      );
    }

    const modifiedTimes = metaValues(
      page.html,
      "property",
      "article:modified_time",
    );
    const jsonLdModifiedDates = jsonLdStringValues(page.html, "dateModified");
    if (article.modified) {
      if (
        modifiedTimes.length !== 1 ||
        modifiedTimes[0] !== article.modified
      ) {
        report(
          route,
          `Frozen article:modified_time must be ${JSON.stringify(article.modified)}; found ${JSON.stringify(modifiedTimes)}.`,
          "Restore the recorded modification timestamp; never replace it with the build date.",
        );
      }
      if (
        jsonLdModifiedDates.length !== 1 ||
        jsonLdModifiedDates[0] !== article.modified
      ) {
        report(
          route,
          `Frozen JSON-LD dateModified must be ${JSON.stringify(article.modified)}; found ${JSON.stringify(jsonLdModifiedDates)}.`,
          "Restore the recorded dateModified value in the ScholarlyArticle JSON-LD.",
        );
      }
    } else {
      if (modifiedTimes.length) {
        report(
          route,
          `The article has no approved modification timestamp, but article:modified_time contains ${JSON.stringify(modifiedTimes)}.`,
          "Do not stamp unchanged articles with the build or release date.",
        );
      }
      if (jsonLdModifiedDates.length) {
        report(
          route,
          `The article has no approved modification timestamp, but JSON-LD dateModified contains ${JSON.stringify(jsonLdModifiedDates)}.`,
          "Omit dateModified until an actual editorial revision is approved.",
        );
      }
    }

    if (!visibleText(page.html).includes(article.displayDate)) {
      report(
        route,
        `Visible publication date ${JSON.stringify(article.displayDate)} is missing.`,
        "Keep the original human-readable publication date in the article header.",
      );
    }

    if (!/class=(?:"[^"]*\bkatex\b[^"]*"|'[^']*\bkatex\b[^']*')/i.test(page.html)) {
      report(
        route,
        "The article contains no server-rendered KaTeX output.",
        "Render mathematical expressions through the shared KaTeX component before export.",
      );
    }

    if (!page.html.includes(article.clientMarker)) {
      report(
        route,
        `Embedded interactive markup is missing its identifying text ${JSON.stringify(article.clientMarker)}.`,
        "Keep the relevant interactive embedded directly in the published article.",
      );
    }
    const clientSource = await referencedClientSource(route, page.html);
    if (clientSource && !clientSource.includes(article.clientMarker)) {
      report(
        route,
        `Referenced client chunks do not contain the embedded interactive marker ${JSON.stringify(article.clientMarker)}.`,
        "Ensure the interactive remains a hydrated client component in the native Next build.",
      );
    }

    if (
      article.slug === "kolams-on-a-square" &&
      (!page.html.includes("kolam-shape-row") ||
        [
          "tile-type-0000-m1.webp",
          "tile-type-0001-m4.webp",
          "tile-type-0011-m4.webp",
          "tile-type-0101-m2.webp",
          "tile-type-0111-m4.webp",
          "tile-type-1111-m1.webp",
        ].some((asset) => !page.html.includes(asset)))
    ) {
      report(
        route,
        "The one-row catalogue of all six kolam shape families is incomplete.",
        "Render all six shape images inside the dedicated kolam-shape-row grid.",
      );
    }
  }

  for (const note of NOTES) {
    const page = requiredHtml.get(note.route);
    if (!page) continue;

    const citationDates = metaValues(
      page.html,
      "name",
      "citation_publication_date",
    );
    if (
      citationDates.length !== 1 ||
      citationDates[0] !== note.published
    ) {
      report(
        note.route,
        `Note citation_publication_date must be ${JSON.stringify(note.published)}; found ${JSON.stringify(citationDates)}.`,
        "Use the note's approved publication date in citation metadata.",
      );
    }

    const jsonLdDates = jsonLdStringValues(page.html, "datePublished");
    if (jsonLdDates.length !== 1 || jsonLdDates[0] !== note.published) {
      report(
        note.route,
        `Note JSON-LD datePublished must be ${JSON.stringify(note.published)}; found ${JSON.stringify(jsonLdDates)}.`,
        "Keep the note publication date aligned across visible and machine-readable metadata.",
      );
    }

    const text = visibleText(page.html);
    if (!text.includes(note.displayDate)) {
      report(
        note.route,
        `Visible publication date ${JSON.stringify(note.displayDate)} is missing.`,
        "Render the note publication date in the note metadata panel.",
      );
    }
    if (!text.includes(note.marker)) {
      report(
        note.route,
        `Expected note content marker ${JSON.stringify(note.marker)} is missing.`,
        "Render the body registered for this note instead of another note's content.",
      );
    }
  }

  const rrefNote = NOTES.find(({ pdfAsset }) => pdfAsset);
  if (rrefNote) {
    const page = requiredHtml.get(rrefNote.route);
    const pdfPath = path.join(outputDirectory, rrefNote.pdfAsset);
    if (await pathExists(pdfPath)) {
      const signature = (await readFile(pdfPath)).subarray(0, 5).toString("ascii");
      if (signature !== "%PDF-") {
        report(
          rrefNote.pdfAsset,
          `The note download does not have a PDF signature; found ${JSON.stringify(signature)}.`,
          "Copy the verified source PDF into the public note directory without transforming it.",
        );
      }
    }

    if (page) {
      const text = visibleText(page.html);
      if (text.includes("Caution:")) {
        report(
          rrefNote.route,
          "The RREF note still contains the generic detail-page caution.",
          "Keep the Notes landing caution, but omit it from this approved expository note.",
        );
      }
      const homepageText = visibleText(requiredHtml.get("/")?.html || "");
      if (!homepageText.includes("What Row Reduction Remembers")) {
        report(
          "/",
          "The RREF note is missing from the Recent notes section.",
          "Keep N02 enabled for the homepage Notes shelf.",
        );
      }
      const frames = tagsNamed(page.html, "iframe").filter(({ attributes }) =>
        (attributes.get("src") || "").includes(rrefNote.pdfAsset),
      );
      if (
        frames.length !== 1 ||
        !(frames[0].attributes.get("title") || "").trim()
      ) {
        report(
          rrefNote.route,
          "The full note must have one embedded PDF frame with an accessible title.",
          "Keep the titled first-party PDF iframe as well as its visible open and download links.",
        );
      }
      if (!/class=(?:"[^"]*\bkatex\b[^"]*"|'[^']*\bkatex\b[^']*')/i.test(page.html)) {
        report(
          rrefNote.route,
          "The RREF web introduction contains no server-rendered KaTeX output.",
          "Render its mathematical expressions through the shared KaTeX component.",
        );
      }
    }
  }

  const feedPath = path.join(outputDirectory, "feed.xml");
  if (await pathExists(feedPath)) {
    const feed = await readFile(feedPath, "utf8");
    const items = [...feed.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(
      (match) => match[1],
    );
    if (items.length !== ARTICLES.length) {
      report(
        "feed.xml",
        `Expected exactly ${ARTICLES.length} RSS article items; found ${items.length}.`,
        "Generate the feed from the same frozen publication registry as the Articles page.",
      );
    }

    const feedPaths = items.map((item) => {
      const link = item.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i)?.[1];
      if (!link) return "";
      try {
        return new URL(decodeHtml(link.trim())).pathname.replace(/\/+$/, "");
      } catch {
        return "";
      }
    });
    const expectedFeedPaths = ARTICLES.map(
      ({ slug }) => `/articles/${slug}`,
    );
    if (
      feedPaths.length !== expectedFeedPaths.length ||
      feedPaths.some((feedPath, index) => feedPath !== expectedFeedPaths[index])
    ) {
      report(
        "feed.xml",
        `RSS items are not in approved newest-first order: ${JSON.stringify(feedPaths)}.`,
        `Generate the feed from the sorted article registry: ${JSON.stringify(expectedFeedPaths)}.`,
      );
    }

    for (const article of ARTICLES) {
      const expectedPath = `/articles/${article.slug}`;
      const item = items.find((candidate) => {
        const link = candidate.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i)?.[1];
        if (!link) return false;
        try {
          const linkUrl = new URL(decodeHtml(link.trim()));
          return (
            linkUrl.hostname === site.hostname &&
            linkUrl.pathname.replace(/\/+$/, "") === expectedPath
          );
        } catch {
          return false;
        }
      });
      if (!item) {
        report(
          "feed.xml",
          `RSS item for /articles/${article.slug}/ is missing.`,
          "Include every frozen published article exactly once in the feed.",
        );
        continue;
      }
      const published = decodeHtml(
        item.match(/<pubDate\b[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ||
          "",
      );
      const expectedPublished = new Date(article.published).toUTCString();
      if (published !== expectedPublished) {
        report(
          "feed.xml",
          `RSS date for ${article.slug} must be ${JSON.stringify(expectedPublished)}; found ${JSON.stringify(published)}.`,
          "Derive pubDate from the frozen article publication timestamp, not the build date.",
        );
      }
    }
  }
}

if (variant === "lab") {
  const missingInteractives = INTERACTIVES.filter(
    ({ slug }) => !requiredHtml.has(`/${slug}/`),
  );
  if (missingInteractives.length) {
    report(
      "/",
      `Expected six standalone interactives; missing ${missingInteractives.map(({ slug }) => slug).join(", ")}.`,
      "Export each published interactive at its established top-level Lab URL.",
    );
  }

  for (const interactive of INTERACTIVES) {
    const route = `/${interactive.slug}/`;
    const page = requiredHtml.get(route);
    if (!page) continue;
    if (!page.html.includes(interactive.clientMarker)) {
      report(
        route,
        `Interactive markup is missing its identifying text ${JSON.stringify(interactive.clientMarker)}.`,
        `Render ${interactive.slug} directly at its top-level route instead of exporting a redirect.`,
      );
    }
    const clientSource = await referencedClientSource(route, page.html);
    if (clientSource && !clientSource.includes(interactive.clientMarker)) {
      report(
        route,
        `Referenced client chunks do not contain ${JSON.stringify(interactive.clientMarker)}.`,
        "Ensure the published interactive is hydrated and its client chunk remains in _next/static/chunks.",
      );
    }
  }

  const expectedEmbedSlugs = INTERACTIVES.filter(
    ({ embedded }) => embedded,
  ).map(({ slug }) => slug);
  let actualEmbedSlugs = [];
  try {
    const entries = await readdir(path.join(outputDirectory, "embed"), {
      withFileTypes: true,
    });
    for (const entry of entries) {
      if (
        entry.isDirectory() &&
        (await pathExists(
          path.join(outputDirectory, "embed", entry.name, "index.html"),
        ))
      ) {
        actualEmbedSlugs.push(entry.name);
      }
    }
  } catch {
    // Individual missing embed routes have already been reported.
  }
  actualEmbedSlugs = actualEmbedSlugs.sort();
  const embedDifference = exactSetDifference(
    actualEmbedSlugs,
    [...expectedEmbedSlugs].sort(),
  );
  if (embedDifference.missing.length || embedDifference.unexpected.length) {
    report(
      "/embed/",
      `Expected exactly four embed routes. Missing: ${embedDifference.missing.join(", ") || "none"}; unexpected: ${embedDifference.unexpected.join(", ") || "none"}.`,
      "Publish embeds only for the four interactives in the approved embed registry.",
    );
  }

  for (const interactive of INTERACTIVES.filter(
    ({ embedded }) => embedded,
  )) {
    const route = `/embed/${interactive.slug}/`;
    const page = requiredHtml.get(route);
    if (!page) continue;
    const robotsValues = metaValues(page.html, "name", "robots");
    const robotsTokens = robotsValues
      .flatMap((value) => value.toLowerCase().split(/[\s,]+/))
      .filter(Boolean);
    if (
      robotsValues.length !== 1 ||
      !robotsTokens.includes("noindex") ||
      !robotsTokens.includes("follow")
    ) {
      report(
        route,
        `Embed robots metadata must be exactly one noindex, follow directive; found ${JSON.stringify(robotsValues)}.`,
        "Set embed metadata robots to { index: false, follow: true }.",
      );
    }
    if (!page.html.includes(interactive.clientMarker)) {
      report(
        route,
        `Embed markup is missing ${JSON.stringify(interactive.clientMarker)}.`,
        "Render the corresponding published interactive inside the embed route.",
      );
    }
    const clientSource = await referencedClientSource(route, page.html);
    if (clientSource && !clientSource.includes(interactive.clientMarker)) {
      report(
        route,
        `Embed client chunks do not contain ${JSON.stringify(interactive.clientMarker)}.`,
        "Preserve the interactive client chunk when preparing the Lab artifact.",
      );
    }
  }
}

for (const relative of ["robots.txt", "sitemap.xml"]) {
  const target = path.join(outputDirectory, relative);
  if (!(await pathExists(target))) continue;
  const contents = await readFile(target, "utf8");
  if (!contents.includes(`https://${site.hostname}`)) {
    report(
      relative,
      `The file does not mention the selected host https://${site.hostname}.`,
      `Build metadata with the ${variant} site variant.`,
    );
  }
  const otherHostname =
    variant === "main" ? SITE_VARIANTS.lab.hostname : SITE_VARIANTS.main.hostname;
  if (contents.includes(`https://${otherHostname}`)) {
    report(
      relative,
      `The file contains the opposite site host https://${otherHostname}.`,
      `Generate ${relative} independently for the ${variant} release.`,
    );
  }
}

if (issues.length) {
  console.error(
    `Static release validation FAILED for ${variant} (${site.hostname}) at ${outputDirectory}.\n` +
      `${issues.length} actionable problem${issues.length === 1 ? "" : "s"} found:\n`,
  );
  issues.forEach(({ scope, problem, remediation }, index) => {
    console.error(`${index + 1}. [${scope}] ${problem}`);
    if (remediation) console.error(`   Fix: ${remediation}`);
  });
  process.exitCode = 1;
} else {
  const contentCount =
    variant === "main"
      ? `${ARTICLES.length} articles and ${NOTES.length} notes`
      : `${INTERACTIVES.length} interactives and ${INTERACTIVES.filter(({ embedded }) => embedded).length} embeds`;
  console.log(
    `Static release validation PASSED for ${variant} (${site.hostname}).\n` +
      `Artifact: ${outputDirectory}\n` +
      `Checked: ${expectedRoutes.length} required HTML routes, ${htmlDocuments.length} HTML files, ${contentCount}, internal href/src targets, canonicals, repository identity, frozen metadata, KaTeX/client assets, and publication-copy guards.`,
  );
}
