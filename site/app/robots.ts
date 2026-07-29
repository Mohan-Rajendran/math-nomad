import type { MetadataRoute } from "next";
import { canonicalUrl, isLabSite, isMainSite, siteOrigin } from "./site-mode";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const disallow = isMainSite
    ? ["/lab/", "/embed/"]
    : isLabSite
      ? [
          "/articles/",
          "/notes/",
          "/writing/",
          "/courses/",
          "/about/",
          "/embed/",
        ]
      : ["/embed/"];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: canonicalUrl("/sitemap.xml"),
    host: siteOrigin,
  };
}
