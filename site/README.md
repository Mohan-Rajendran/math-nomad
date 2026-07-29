# Math Nomad site

This directory contains the approved shared design and content for both
`mathnomad.in` and `lab.mathnomad.in`.

- Article and publication metadata: `app/data.ts`
- Article bodies: `app/article-content/`
- Page templates and shared shell: `app/`
- Images and downloadable files: `public/`
- Release checks: `scripts/validate-static-release.mjs`

Run `npm run dev` for the combined local preview. The publication workflows use
`npm run validate:main` for the journal and `npm run validate:lab` for the Lab.
The two repositories must carry byte-identical copies of this directory for
each coordinated release. Article publication and modification dates are frozen
unless Mohan explicitly approves a date change.
