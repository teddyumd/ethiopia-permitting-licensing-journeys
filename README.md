# Ethiopia Permit & Public Service Journey Explorer

An interactive SvelteKit site for exploring how people and businesses move through permit, licensing, registration, tax, identity, property, transport, utility, and other public-service processes in Ethiopia.

The project is meant to make service journeys easier to inspect, compare, and improve. It is especially useful for entrepreneurs, residents, practitioners, policymakers, and digital government teams who need a practical view of which offices, prerequisites, documents, dependencies, and process phases are involved.

## What The Site Maps

The explorer maps journeys as sequences of public-service steps. Each journey is connected to reusable process nodes, with metadata such as:

- jurisdiction or office level
- phase of the journey
- responsible agency or office, where known
- estimated timing, fees, renewal terms, and notes, where available
- dependencies between steps
- references and sources

The interface supports searching, filtering by audience, filtering by jurisdiction, filtering by category, and opening individual journey maps.

## Current Scope

The current dataset contains 27 Ethiopia journeys:

- 11 business journeys, such as restaurants, retail, consultancy, health, pharmacy, construction, logistics, technology, tourism, manufacturing, and education/training examples.
- 16 individual public-service journeys, such as identity, tax, property, banking, insurance, transport, passport/travel, and utility-related services.

The source data lives in [`static/data/journeys.json`](static/data/journeys.json). The app reads from this file at runtime.

## Data Status

The data is a draft and is still under verification.

Some steps, office names, dependencies, fees, timelines, renewal rules, and source links may be incomplete, outdated, or different in practice across offices and locations. The site should be treated as an exploratory public-interest mapping tool, not as legal advice or an official government guide.

## Contributing Corrections

Practical feedback is welcome, especially from people who have gone through one of these journeys or work with the responsible offices.

Useful corrections include:

- missing steps
- outdated information
- office-specific differences
- incorrect agencies, prerequisites, fees, or timelines
- lived experience from completing a journey
- better official sources or guidance links

You can contribute by:

- opening an issue in this repository
- submitting a pull request with changes to [`static/data/journeys.json`](static/data/journeys.json)
- using the contact page in the live site to share notes

When possible, include the journey name, the specific step, the office or location, and a source or explanation.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run checks and tests:

```bash
npm run check
npm test
npm run test:e2e
```

Build and preview the static site:

```bash
npm run build
npm run preview
```

## GitHub Pages Deployment

This project is configured for GitHub Pages using `@sveltejs/adapter-static`.

Deployment is handled by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. The workflow runs on pushes to `master` or manual dispatch.
2. GitHub Actions installs dependencies with `npm ci`.
3. The site is built with `npm run build`.
4. The generated static output in `build/` is uploaded as a Pages artifact.
5. `actions/deploy-pages` publishes the site to GitHub Pages.

The workflow sets `BASE_PATH=/${{ github.event.repository.name }}` during the build so routes and assets work under the repository subpath on GitHub Pages.

Continuous integration is handled by [`.github/workflows/ci.yml`](.github/workflows/ci.yml). It runs type checking, unit/component tests, and Playwright e2e tests on pushes and pull requests to `master`.

For a fresh fork, enable Pages in repository settings and set the Pages source to **GitHub Actions**.

## Stack

SvelteKit 2, Svelte 5, Vite, TypeScript, Tailwind CSS, shadcn-svelte, and Playwright.

## License

[MIT](LICENSE)
