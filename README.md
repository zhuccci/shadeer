# Neuroshade

Neuroshade is a Vite + React app for experimenting with image effects and shader-style filters.

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The production output is written to `docs/`.

## Publish To GitHub Pages

This repo is already configured for GitHub Pages on the `/neuroshade/` path in [`vite.config.ts`](/Users/boda/Documents/web_works/neuroshade/vite.config.ts), which matches the repository name `neuroshade`.

Your site URL will be:

`https://zhuccci.github.io/neuroshade/`

### Deploy From `main /docs`

GitHub Pages branch publishing supports only:

- the branch root: `/`
- the `/docs` folder on a branch

This project builds directly into `docs/`, so you can publish from the `main` branch without using a separate `gh-pages` branch.

1. Build the app:

```bash
npm run build
```

2. Commit and push the updated `docs/` output:

```bash
git add .
git commit -m "Build site for GitHub Pages"
git push origin <your-branch>
```

3. On GitHub for [`zhuccci/neuroshade`](https://github.com/zhuccci/neuroshade), open `Settings -> Pages`.
4. Set `Source` to `Deploy from a branch`.
5. Choose branch `main` and folder `/docs`.
6. Merge your changes to `main` if needed.

After GitHub finishes publishing, the site should be live at `https://zhuccci.github.io/neuroshade/`.

## Notes

- GitHub Pages cannot publish directly from `dist/`, so this repo uses `docs/` as the build output folder instead.
- If you rename the repository, update the `base` value in [`vite.config.ts`](/Users/boda/Documents/web_works/neuroshade/vite.config.ts) to match the new repo path.
