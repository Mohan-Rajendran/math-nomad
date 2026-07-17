import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "_site");

const notFoundPath = path.join(outputRoot, "not-found.html");
const errorPath = path.join(outputRoot, "404.html");
const sitemapPath = path.join(outputRoot, "sitemap.xml");

const notFoundHtml = await readFile(notFoundPath, "utf8");
const errorHtml = notFoundHtml.replace("<head>", '<head>\n<base href="/">');
await writeFile(errorPath, errorHtml);

const sitemap = await readFile(sitemapPath, "utf8");
const cleanedSitemap = sitemap.replace(
  /\s*<url>\s*<loc>https:\/\/mathnomad\.in\/not-found\.html<\/loc>[\s\S]*?<\/url>/,
  "",
);
await writeFile(sitemapPath, cleanedSitemap);

console.log("Built root-safe 404.html and removed not-found.html from the sitemap");
