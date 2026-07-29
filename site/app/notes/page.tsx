import type { Metadata } from "next";
import { NoteCard } from "../components/ContentCards";
import { noteFields, notes } from "../data";
import { journalHref } from "../site-mode";

export const metadata: Metadata = {
  title: "Notes",
  description: "Lecture review notes, worksheets and workshop handouts.",
  alternates: { canonical: journalHref("/notes") },
};

export default function NotesPage() {
  return (
    <main id="main-content" className="page-shell listing-page notes-page">
      <header className="page-intro notes-intro">
        <p className="eyebrow">Working material</p>
        <h1>Notes</h1>
        <p>These notes were written up as lecture review notes, worksheets and handouts as part of courses, mathematical talks and workshops.</p>
        <p className="caution"><strong>Caution:</strong> These notes might contain errors and the revised notes will be reposted regularly.</p>
      </header>
      <nav className="field-jump" aria-label="Jump to mathematical field">
        {noteFields.map((field) => <a key={field} href={`#${field.toLowerCase().replaceAll(" ", "-")}`}>{field}</a>)}
      </nav>
      <div className="note-fields">
        {noteFields.map((field) => {
          const fieldNotes = notes.filter((note) => note.field === field);
          return (
            <section className="note-field" id={field.toLowerCase().replaceAll(" ", "-")} key={field}>
              <div className="field-heading"><h2>{field}</h2></div>
              <div className="note-grid">{fieldNotes.map((note) => <NoteCard note={note} key={note.id} />)}</div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
