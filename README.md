# Zelun He portfolio

The deployed site is the static 8-bit portfolio in [`dist/`](dist/). It includes the animated header game, project highlights, and contact links.

## Run locally

```sh
python -m http.server 8000 --directory dist
```

Open `http://localhost:8000`.

## Deploy

Vercel is configured by [`vercel.json`](vercel.json) to serve `dist/` as a static site with no install or build step. Once this GitHub repository is connected to a Vercel project, pushes to the production branch deploy automatically and pull requests receive preview deployments. The older Next.js implementation remains under `src/` for reference; Vercel serves `dist/`.
