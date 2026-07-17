# Math Nomad

Math Nomad is Mohan Rajendran's website for courses, mathematical writing, videos and projects in progress. It is built with [Quarto](https://quarto.org/) and published through GitHub Pages.

## Site map

- `index.qmd` — home page
- `courses/` — curated course pathways and reusable course resources
- `writing/` — research, exposition, outreach and teaching writing
- `videos/` — YouTube companion pages
- `projects/` — active and archived projects
- `about.qmd` — project and author information
- `styles.scss` — the visual design
- `.github/workflows/publish.yml` — automatic publishing

The former `explore/`, `read/`, `teach/`, `problems/` and `collections/` routes remain as short signposts so existing links do not fail.

## Preview locally

Install Quarto, then run:

```bash
quarto preview
```

## Publish

Pushing a commit to `main` starts the GitHub Pages workflow. In the repository settings, choose **Settings → Pages → Source → GitHub Actions** once. The site will then rebuild automatically after every push to `main`.

Do not add the custom domain until the temporary GitHub Pages address works. The domain `mathnomad.in` will be connected as a separate launch step.
