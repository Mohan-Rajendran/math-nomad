import { Download, ExternalLink } from "lucide-react";

export function PdfEmbed({
  href,
  title,
  pages,
}: {
  href: string;
  title: string;
  pages?: number;
}) {
  const viewerTitle = `${title} PDF viewer`;

  return (
    <section className="pdf-resource" aria-labelledby="full-note-heading">
      <div className="pdf-resource-header">
        <div>
          <p className="eyebrow">
            Full note{pages ? ` · ${pages} pages` : ""}
          </p>
          <h3 id="full-note-heading">Read the complete exposition</h3>
          <p>
            The PDF contains the complete proofs, worked examples, figures,
            geometric dictionary and references.
          </p>
        </div>
        <div className="pdf-resource-actions">
          <a
            className="button button-primary"
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label="Open PDF in a new tab"
          >
            Open PDF <ExternalLink size={15} />
          </a>
          <a className="button button-secondary" href={href} download>
            Download PDF <Download size={15} />
          </a>
        </div>
      </div>

      <div className="pdf-viewer-shell">
        <iframe
          className="pdf-viewer"
          src={`${href}#view=FitH&toolbar=1&navpanes=0`}
          title={viewerTitle}
          loading="lazy"
        />
      </div>
      <p className="pdf-viewer-fallback">
        If the embedded reader is not available on your device, use Open PDF
        or Download PDF above.
      </p>
    </section>
  );
}
