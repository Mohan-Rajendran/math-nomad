import {
  access,
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const MODES = new Set(["combined", "main", "lab"]);
const mode =
  process.env.NEXT_PUBLIC_MATH_NOMAD_SITE_MODE?.trim() || "combined";
const outputDirectory = path.resolve(process.argv[2] || "out");

if (!MODES.has(mode)) {
  throw new Error(
    `Unsupported NEXT_PUBLIC_MATH_NOMAD_SITE_MODE ${JSON.stringify(mode)}.`,
  );
}

await access(path.join(outputDirectory, "index.html")).catch(() => {
  throw new Error(
    `Refusing to prepare ${outputDirectory}: index.html was not found.`,
  );
});

async function removeOutputRoute(route) {
  const relative = route.replace(/^\/+|\/+$/g, "");
  if (!relative) return;
  const routePath = path.join(outputDirectory, relative);
  await Promise.all([
    rm(routePath, { recursive: true, force: true }),
    rm(`${routePath}.html`, { force: true }),
    rm(`${routePath}.txt`, { force: true }),
  ]);
}

async function copyLegacyFeeds() {
  const feedPath = path.join(outputDirectory, "feed.xml");
  await access(feedPath).catch(() => {
    throw new Error("The static build did not produce feed.xml.");
  });

  for (const relative of [
    "index.xml",
    "writing/index.xml",
    "courses/index.xml",
    "projects/index.xml",
  ]) {
    const destination = path.join(outputDirectory, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(feedPath, destination);
  }
}

const LEGACY_MEDIA_EXTENSIONS = new Set([
  ".jpeg",
  ".jpg",
  ".pdf",
  ".png",
  ".svg",
  ".webp",
]);

async function copyArticleMedia(source, destination) {
  let entries;
  try {
    entries = await readdir(source, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      await copyArticleMedia(sourcePath, destinationPath);
      continue;
    }
    if (!LEGACY_MEDIA_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
  }
}

async function writeAboutHtmlRedirect() {
  const destination = "https://mathnomad.in/about/";
  const scriptDestination = JSON.stringify(destination).replaceAll("<", "\\u003c");
  const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>About has moved · Math Nomad</title>
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="${destination}">
<meta http-equiv="refresh" content="0;url=${destination}">
<script>window.location.replace(${scriptDestination})</script>
</head>
<body>
<main>
<h1>About has moved.</h1>
<p><a href="${destination}">Continue to the About page</a>.</p>
</main>
</body>
</html>
`;
  await writeFile(path.join(outputDirectory, "about.html"), html);
}

await writeFile(path.join(outputDirectory, ".nojekyll"), "");
if (mode === "main" || mode === "lab") {
  await writeFile(
    path.join(outputDirectory, "CNAME"),
    `${mode === "lab" ? "lab.mathnomad.in" : "mathnomad.in"}\n`,
  );
}

if (mode === "main") {
  for (const route of [
    "lab",
    "embed",
    "law-of-cosines",
    "pythagorean-tiling-proofs",
    "square-kolam-tile-challenge",
    "sandbox-2",
    "sandbox-3",
    "kolams-on-an-octahedron",
  ]) {
    await removeOutputRoute(route);
  }
}

if (mode === "lab") {
  for (const route of [
    "articles",
    "notes",
    "writing",
    "courses",
    "about",
    "about.html",
    "feed.xml",
    "index.xml",
    "lab",
    "projects/entries",
  ]) {
    await removeOutputRoute(route);
  }
} else {
  await copyLegacyFeeds();
  await copyArticleMedia(
    path.join(outputDirectory, "articles"),
    path.join(outputDirectory, "writing", "articles"),
  );
  await writeAboutHtmlRedirect();
}

const rootHtml = await readFile(
  path.join(outputDirectory, "index.html"),
  "utf8",
);
if (!rootHtml.includes("<html")) {
  throw new Error("The prepared artifact does not contain a valid root page.");
}

console.log(
  `Prepared ${mode} GitHub Pages artifact at ${outputDirectory}.`,
);
