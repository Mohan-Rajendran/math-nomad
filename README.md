# Math Nomad

Math Nomad is Mohan Rajendran's website for mathematical exposition, interactive investigations, classroom material and problems. It is built with [Quarto](https://quarto.org/) and published through GitHub Pages.

## Site map

- `index.qmd` — home page
- `explore/` — interactive laboratories
- `read/` — mathematical notes and essays
- `teach/` — classroom investigations
- `problems/` — problem sequences
- `collections/` — topic-based pathways
- `about.qmd` — project and author information
- `styles.scss` — the visual design
- `.github/workflows/publish.yml` — automatic publishing

## Preview locally

Install Quarto, then run:

```bash
quarto preview
```

## Publish

Pushing a commit to `main` starts the GitHub Pages workflow. In the repository settings, choose **Settings → Pages → Source → GitHub Actions** once. The site will then rebuild automatically after every push to `main`.

Do not add the custom domain until the temporary GitHub Pages address works. The domain `mathnomad.in` will be connected as a separate launch step.

