import { articles } from "../data";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET() {
  const items = articles
    .filter((article) => !article.draft)
    .map(
      (article) =>
        `<item><title>${escapeXml(article.title)}</title><link>${escapeXml(article.sourceHref)}</link><guid isPermaLink="true">${escapeXml(article.sourceHref)}</guid><pubDate>${new Date(article.published).toUTCString()}</pubDate><description>${escapeXml(article.glimpse)}</description></item>`,
    )
    .join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Math Nomad</title><link>https://mathnomad.in/</link><description>Articles, notes and interactive investigations from Math Nomad.</description>${items}</channel></rss>`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
