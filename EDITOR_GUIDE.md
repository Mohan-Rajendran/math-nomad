# Editing Math Nomad without using the command line

This guide covers routine additions after the website is online. Quarto builds each section's latest-first listing automatically. Rich metadata should be added from the beginning, but filters and pinned sections should appear to readers only when the collection is large enough for those controls to help.

## Correct a sentence

1. Open the repository on GitHub.
2. Browse to the relevant `.qmd` file.
3. Select the pencil icon labelled **Edit this file**.
4. Make the correction.
5. Select **Commit changes**.

GitHub will rebuild the website automatically. The **Actions** tab shows whether publishing succeeded. Using a branch and opening a pull request is safer than committing directly when the change affects layout, navigation or several files.

## Decide where a new page belongs

- Add a guided course pathway or reusable classroom resource under `courses/`.
- Add research, exposition, outreach and teaching articles under `writing/articles/`.
- Add a YouTube companion page under `videos/entries/`.
- Add a page describing active or completed work under `projects/entries/`.

Each piece should have one main home. Use metadata and links to connect it to other audiences, topics and formats instead of copying the same page into several sections. A flagship investigation may grow into a constellation of outputs, but a strong standalone note, interactive or classroom sheet can be published whenever it is ready.

## Add a piece of writing safely

**Do not copy the folder `writing/articles/binary-kolam-tiles`.** That flagship article contains article-specific canonical metadata, structured data, scripts, styles and assets. Copying the folder can silently give a new article the old article’s identity.

Instead:

1. Open `templates/article.qmd.example` on GitHub and copy its contents.
2. Create a short lower-case folder name joined with hyphens inside `writing/articles/`.
3. Create `index.qmd` inside that folder and paste the template.
4. Replace the sample title, description, `YYYY-MM-DD` date, categories and body.
5. Keep `draft: true` while the page is being prepared.
6. Change it to `draft: false` only after previewing the finished page.

The core metadata looks like this:

```yaml
title: "A clear title"
description: "One sentence used on listing cards and in search results."
date: 2026-07-17
author: "Mohan Rajendran"
categories: [Everyone, Exposition, Geometry]
audience: [everyone]
kind: exposition
featured: false
draft: true
toc: true
```

For `categories`, combine audience, kind and topic labels. Prefer the shared audience labels:

- `Everyone`
- `School teachers`
- `Undergraduate`
- `Graduate & research`

Prefer the shared kinds of writing:

- `Exposition`
- `Research`
- `Outreach`
- `Teaching`
- `Reflections`

Keep `audience`, `kind` and useful categories in the source even while the public collection is small. Add visible filters only when each choice leads to a meaningful group—ideally at least three pieces—rather than to an empty result.

## Feature an item

Set:

```yaml
featured: true
```

This retains the editorial decision in metadata. A separate pinned area should be enabled only after a section has several pieces and pinning genuinely improves discovery; otherwise it merely repeats the latest listing. Change the value back to `false` to unpin an item without deleting anything.

## Add a video companion

Copy `templates/video.qmd.example` into a new `index.qmd` inside a short, lower-case folder under `videos/entries/`. Replace every placeholder, including the date, video ID, thumbnail and image description. Keep it as a draft until the video and its supporting material are both ready. A good companion page contains:

1. the embedded YouTube video;
2. an extended description;
3. key ideas or timestamps;
4. references and further reading;
5. related writing, projects or course material;
6. corrections or later updates when needed.

The Videos index currently shows an honest empty state. When the first companion is ready, replace that empty state with a latest-first Quarto listing of `videos/entries/`; subsequent companions will then appear automatically.

## Add or update a project

Create a folder inside `projects/entries/`. In addition to the shared metadata, add:

```yaml
status: active
featured: true
date-modified: 2026-07-17
```

Use `status: active`, `exploring`, `paused` or `completed`. Update `date-modified` only when a substantial project update is published.

## Develop a course pathway

Courses are curated routes through Math Nomad’s own material, not placeholders for a future archive of lecture notes. Lecture notes, interactives, exercises, reading lists and relevant writing can live together once they form a useful sequence.

Use the public status labels honestly:

- **Planned** — keep the course name in the compact, non-clickable list. Do not send readers to a generic empty hub.
- **In development** — use only when there is a concrete sample, syllabus or dated release plan that is useful to show.
- **Available** — use when a reader can follow a meaningful pathway or use a complete resource now.

Reusable material that does not belong to only one course can go in `courses/resources/`.

## Connect the site to formal publication

Treat a journal or institutional venue as the formal record for the work published there. Math Nomad can add what that format cannot comfortably host: interactives, code, catalogues, computational appendices, classroom adaptations and behind-the-paper notes. Before sharing a manuscript or close derivative, check the journal’s current copyright and self-archiving policy.

## Write mathematics with MathJax

The website renders LaTeX notation with MathJax. Put inline mathematics between single dollar signs:

```markdown
There are $2^4=16$ possible tiles.
```

Put a displayed equation between double dollar signs:

```markdown
$$
e_{x,y}=w_{x+1,y}.
$$
```

Standard LaTeX structures such as `aligned`, `matrix`, `cases`, `\newcommand` and `\newenvironment` are supported. Always use math delimiters; ordinary parentheses such as `(4\times4)` do not tell Quarto to run MathJax.

## Safe publishing habit

For a small text correction, a direct commit can be reasonable. For a new article, interactive, section or redesign, work on a branch, inspect the rendered preview at phone and desktop widths, and merge only after the build succeeds.
