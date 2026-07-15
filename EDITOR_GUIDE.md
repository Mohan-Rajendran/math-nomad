# Editing Math Nomad without using the command line

This guide is for routine changes after the website is online.

## Correct a sentence

1. Open the repository on GitHub.
2. Browse to the relevant `.qmd` file.
3. Select the pencil icon labelled **Edit this file**.
4. Make the correction.
5. Select **Commit changes** and keep **Commit directly to the main branch** selected.

GitHub will rebuild the website automatically. The **Actions** tab shows whether publishing succeeded.

## Add an article

Copy the folder `read/articles/binary-kolam-tiles`, give the copy a short lower-case name joined with hyphens, and edit its `index.qmd`. Keep the block between the opening pairs of `---`; it supplies the title, date, description, author, categories and card image.

## Safe publishing habit

For a small text correction, committing to `main` is fine. For a new interactive or a major redesign, use a separate branch and preview it before merging.

