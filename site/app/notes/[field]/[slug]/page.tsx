import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpenText,
  Download,
  FileText,
  FlaskConical,
} from "lucide-react";
import { notes, type Note, type NoteResource } from "../../../data";
import { noteBodies } from "../../../note-content/NoteBodies";

type NoteRouteParams = { field: string; slug: string };

function paramsForNote(note: Note): NoteRouteParams {
  const match = note.slug.match(/^\/notes\/([^/]+)\/([^/]+)$/);
  if (!match) {
    throw new Error(`Invalid note route: ${note.slug}`);
  }
  return { field: match[1], slug: match[2] };
}

function noteForParams({ field, slug }: NoteRouteParams) {
  return notes.find((note) => note.slug === `/notes/${field}/${slug}`);
}

function pdfResource(note: Note) {
  return note.resources.find(
    (resource): resource is Extract<NoteResource, { kind: "PDF" }> =>
      resource.kind === "PDF",
  );
}

function absoluteUrl(href: string) {
  return new URL(href, "https://mathnomad.in").toString();
}

export function generateStaticParams() {
  return notes.map(paramsForNote);
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<NoteRouteParams>;
}): Promise<Metadata> {
  const note = noteForParams(await params);
  if (!note) return { title: "Note not found" };

  const pdf = pdfResource(note);
  const keywords = note.keywords ?? note.topics;

  return {
    title: note.title,
    description: note.abstract,
    authors: [{ name: "Mohan R" }],
    keywords: [...keywords],
    alternates: { canonical: note.sourceHref },
    openGraph: {
      type: "article",
      title: note.title,
      description: note.abstract,
      publishedTime: note.publishedAt,
      modifiedTime:
        note.revisedAt !== note.publishedAt ? note.revisedAt : undefined,
      authors: ["Mohan R"],
    },
    other: {
      citation_author: "Mohan R",
      citation_title: note.subtitle
        ? `${note.title}: ${note.subtitle}`
        : note.title,
      citation_publication_date: note.publishedAt,
      citation_public_url: note.sourceHref,
      citation_keywords: keywords.join("; "),
      citation_msc: note.msc?.map((item) => item.code).join("; ") ?? "",
      ...(pdf ? { citation_pdf_url: absoluteUrl(pdf.href) } : {}),
      "DC.Subject": note.msc?.map((item) => item.code).join(", ") ?? "",
    },
  };
}

function ResourceIcon({ kind }: { kind: NoteResource["kind"] }) {
  if (kind === "Interactive") return <FlaskConical size={16} />;
  if (kind === "Article") return <BookOpenText size={16} />;
  return <FileText size={16} />;
}

function NoteResourceLink({
  resource,
  primary,
}: {
  resource: NoteResource;
  primary: boolean;
}) {
  const className = `button ${primary ? "button-primary" : "button-secondary"}`;
  const content = (
    <>
      <ResourceIcon kind={resource.kind} /> {resource.label}
      {resource.kind !== "Interactive" ? <ArrowUpRight size={15} /> : null}
    </>
  );

  if (resource.kind === "PDF") {
    return (
      <a
        className={className}
        href={resource.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`${resource.label} (opens in a new tab)`}
      >
        {content}
      </a>
    );
  }

  if (resource.href.startsWith("http")) {
    return (
      <a className={className} href={resource.href}>
        {content}
      </a>
    );
  }

  return (
    <Link className={className} href={resource.href}>
      {content}
    </Link>
  );
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<NoteRouteParams>;
}) {
  const note = noteForParams(await params);
  if (!note) notFound();

  const NoteBody = noteBodies[note.bodyKey];
  const pdf = pdfResource(note);
  const structuredData = {
    "@context": "https://schema.org",
    "@type":
      note.kind === "Expository note" ? "ScholarlyArticle" : "LearningResource",
    headline: note.title,
    name: note.title,
    alternativeHeadline: note.subtitle,
    abstract: note.abstract,
    author: { "@type": "Person", name: "Mohan R" },
    datePublished: note.publishedAt,
    dateModified:
      note.revisedAt !== note.publishedAt ? note.revisedAt : undefined,
    educationalLevel: note.level,
    learningResourceType: note.kind,
    keywords: note.keywords ?? note.topics,
    about: note.msc?.map((item) => ({
      "@type": "DefinedTerm",
      termCode: item.code,
      name: item.label,
      inDefinedTermSet: "MSC2020",
    })),
    mainEntityOfPage: note.sourceHref,
    isAccessibleForFree: true,
    hasPart: pdf
      ? {
          "@type": "DigitalDocument",
          name: `${note.title} PDF`,
          encodingFormat: "application/pdf",
          contentUrl: absoluteUrl(pdf.href),
          numberOfPages: pdf.pages,
        }
      : undefined,
  };

  return (
    <main id="main-content" className="note-detail page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Link className="back-link" href="/notes">
        <ArrowLeft size={15} /> All notes
      </Link>

      <header className="note-detail-header">
        <p className="eyebrow">Notes / {note.field}</p>
        <h1>{note.title}</h1>
        <p>{note.subtitle ?? note.abstract}</p>
      </header>

      <div className="note-detail-grid">
        <aside className="note-metadata">
          <dl>
            <div>
              <dt>Kind</dt>
              <dd>{note.kind}</dd>
            </div>
            <div>
              <dt>Audience</dt>
              <dd>{note.level.join(" · ")}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>{note.format}</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{note.published}</dd>
            </div>
            {note.estimatedTime ? (
              <div>
                <dt>Reading</dt>
                <dd>{note.estimatedTime}</dd>
              </div>
            ) : null}
            {note.prerequisites?.length ? (
              <div>
                <dt>Prerequisites</dt>
                <dd>{note.prerequisites.join("; ")}</dd>
              </div>
            ) : null}
          </dl>

          <div className="note-resource-links">
            {note.resources.map((resource, index) => (
              <NoteResourceLink
                key={`${resource.kind}-${resource.href}`}
                resource={resource}
                primary={index === 0}
              />
            ))}
            {pdf ? (
              <a
                className="button button-secondary"
                href={pdf.href}
                download
              >
                <Download size={16} /> Download PDF
              </a>
            ) : null}
          </div>
        </aside>

        <article className="prose note-prose" id="note">
          {note.showCaution !== false ? (
            <div className="note-caution">
              <strong>Caution:</strong> These notes might contain errors and the
              revised notes will be reposted regularly.
            </div>
          ) : null}
          <NoteBody note={note} />
        </article>
      </div>
    </main>
  );
}
