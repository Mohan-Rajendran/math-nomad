export type SiteMode = "combined" | "main" | "lab";

export const MAIN_SITE_ORIGIN = "https://mathnomad.in";
export const LAB_SITE_ORIGIN = "https://lab.mathnomad.in";

function resolveSiteMode(
  value = process.env.NEXT_PUBLIC_MATH_NOMAD_SITE_MODE,
): SiteMode {
  return value === "main" || value === "lab" ? value : "combined";
}

export const siteMode = resolveSiteMode();
export const isCombinedSite = siteMode === "combined";
export const isMainSite = siteMode === "main";
export const isLabSite = siteMode === "lab";
export const siteOrigin = isLabSite ? LAB_SITE_ORIGIN : MAIN_SITE_ORIGIN;

function withLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function withTrailingSlash(path: string): string {
  const normalised = withLeadingSlash(path);
  return normalised === "/" || normalised.endsWith("/")
    ? normalised
    : `${normalised}/`;
}

export function canonicalUrl(path = "/"): string {
  return new URL(withLeadingSlash(path), siteOrigin).toString();
}

export function journalHref(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalised = withLeadingSlash(path);
  return isLabSite
    ? new URL(normalised, MAIN_SITE_ORIGIN).toString()
    : normalised;
}

export function labRootHref(): string {
  if (isCombinedSite) return "/lab";
  return isMainSite ? `${LAB_SITE_ORIGIN}/` : "/";
}

export function labProjectHref(projectKey: string): string {
  if (isCombinedSite) return `/lab/${projectKey}`;
  const path = withTrailingSlash(`/projects/${projectKey}`);
  return isMainSite ? new URL(path, LAB_SITE_ORIGIN).toString() : path;
}

export function labInteractiveHref(
  projectKey: string,
  interactiveSlug: string,
): string {
  if (isCombinedSite) return `/lab/${projectKey}/${interactiveSlug}`;
  const path = withTrailingSlash(interactiveSlug);
  return isMainSite ? new URL(path, LAB_SITE_ORIGIN).toString() : path;
}

export function labEmbedHref(interactiveSlug: string): string {
  const path = withTrailingSlash(`/embed/${interactiveSlug}`);
  if (isCombinedSite || isLabSite) return path;
  return new URL(path, LAB_SITE_ORIGIN).toString();
}
