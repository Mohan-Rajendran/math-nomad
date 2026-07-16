# Editing Math Nomad without using the command line

This guide covers routine additions after the website is online. Quarto builds the section listings automatically: items dated most recently appear first, and items marked `featured: true` also appear in the pinned area.

## Correct a sentence

1. Open the repository on GitHub.
2. Browse to the relevant `.qmd` file.
3. Select the pencil icon labelled **Edit this file**.
4. Make the correction.
5. Select **Commit changes** and keep **Commit directly to the main branch** selected.

GitHub will rebuild the website automatically. The **Actions** tab shows whether publishing succeeded.

## Decide where a new page belongs

- Add lecture notes, interactives, exercises and links for a course under `courses/`.
- Add research, exposition, outreach and teaching articles under `writing/articles/`.
- Add a YouTube companion page under `videos/entries/`.
- Add a page describing active or completed work under `projects/entries/`.

Each piece should have one main home. Use categories and links to connect it to other audiences, topics and formats instead of copying the same page into several sections.

## Add a piece of writing

Copy the folder `writing/articles/binary-kolam-tiles`, give the copy a short lower-case name joined with hyphens, and edit its `index.qmd`.

Keep and update the metadata block between the opening pairs of `---`:

```yaml
title: "A clear title"
description: "One sentence used on listing cards and in search results."
date: 2026-07-16
author: "Mohan Rajendran"
categories: [Everyone, Exposition, Geometry]
image: ../../../assets/example-image.png
image-alt: "A useful description of the image"
audience: [everyone]
kind: exposition
featured: false
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

## Pin an item

Set:

```yaml
featured: true
```

The page will appear in the Featured area of its section. It will still appear in the complete latest-first listing below. Change the value back to `false` to unpin it without deleting anything.

## Add a video companion

Create a folder inside `videos/entries/`, then add an `index.qmd` with the same core metadata. A useful companion page contains:

1. the embedded YouTube video;
2. an extended description;
3. key ideas or timestamps;
4. references and further reading;
5. related writing, projects or course material;
6. corrections or later updates when needed.

## Add or update a project

Create a folder inside `projects/entries/`. In addition to the shared metadata, add:

```yaml
status: active
featured: true
date-modified: 2026-07-16
```

Use `status: active`, `exploring`, `paused` or `completed`. Update `date-modified` when a substantial project update is published.

## Add a course

Give each course a folder inside `courses/`. A full course hub can contain its own pages or folders for:

- overview and schedule;
- lecture notes;
- interactives;
- exercises or assignments;
- resources and useful links.

Reusable material that does not belong to only one course can go in `courses/resources/`.

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

For a small text correction, committing to `main` is fine. For a new section, interactive or major redesign, use a separate branch and preview it before merging.
