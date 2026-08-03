# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

nexi toolkit — a self-hostable SvelteKit app that bundles small developer tools (JSON formatter,
text diff, more to come) behind one UI, distributed as a Docker image via GHCR.

## Commands

Package manager is pnpm (pinned via `packageManager` in `package.json`; corepack picks it up
automatically). Don't use npm/yarn — `package-lock.json` is gitignored for that reason.

- `pnpm dev --open` — start the dev server and open it in a browser
- `pnpm build` — production build (outputs a standalone Node server to `build/`)
- `pnpm preview` — build and preview production output locally
- `pnpm check` — svelte-kit sync + svelte-check (type checking)
- `pnpm lint` — `prettier --check .` + `eslint .`
- `pnpm format` — `prettier --write .`
- `pnpm test` — run the vitest suite once (`pnpm test:unit` for watch mode)
- Single test file: `pnpm exec vitest run path/to/file.spec.ts`

Formatting: tabs are **not** used — `prettier.config.js` sets `useTabs: false`, `tabWidth: 2`,
single quotes, no trailing commas, printWidth 100. `prettier-plugin-tailwindcss` auto-sorts class
lists against `src/routes/layout.css` (`tailwindStylesheet` option), so don't hand-order classes.

## Architecture

**Tool registry pattern.** Adding a new tool means two things: append an entry to the `tools` array
in `src/lib/tools.ts` (`slug`, `title`, `description`), and create `src/routes/<slug>/+page.svelte`.
The root layout (`src/routes/+layout.svelte`) and home page (`src/routes/+page.svelte`) both render
their nav/grid by iterating this array — nothing else needs to be touched to wire up a new tool.

**Theming.** Dark/light mode is class-based (`.dark` on `<html>`), not `prefers-color-scheme`
media-query based, because it needs to be user-toggleable. This requires the
`@custom-variant dark (&:where(.dark, .dark *));` line in `src/routes/layout.css` (Tailwind v4's
mechanism for opting into class-based dark mode). Flow:

- `src/app.html` has an inline blocking `<script>` that reads `localStorage.theme` (or falls back
  to `matchMedia('(prefers-color-scheme: dark)')`) and sets the `.dark` class on `<html>` _before_
  paint, to avoid a flash of the wrong theme.
- `src/lib/theme.svelte.ts` exports a singleton `ThemeState` class (module-level `$state`) whose
  `current` field is initialized by reading the class already on `<html>` — this is what keeps
  server-rendered and hydrated state in sync without a mismatch, since the inline script already
  set the class before Svelte hydrates.
- Any component that needs to read/toggle the theme imports the `theme` singleton from that module.

**JSON formatter and text diff are both fully client-side and reactive** — no debounce, no submit
button. Input is bound to `$state`, output is a `$derived`/`$derived.by` computation that
re-runs on every keystroke. Follow this pattern for new tools where computation is cheap enough to
run synchronously.

**Hash generator** (`src/lib/hash.ts` + `src/routes/hash-generator/`) is the async variant of that
pattern: hashing (bcrypt deliberately, WebAssembly hashing via `hash-wasm` inherently) can't be a
plain `$derived`, since Svelte's derived values must be synchronous. Instead the page uses `$effect`
with a `cancelled` flag returned from its cleanup function, so a stale in-flight hash from a
previous keystroke can't overwrite a newer result. Algorithms are a registry, same shape as
`tools.ts`: each entry in the `hashAlgorithms` array declares whether it supports a secret
(implemented as HMAC, not applicable to bcrypt — bcrypt's salt is always random, not user-set) and
an optional `rounds` config (min/max/default/hint) — digest algorithms use rounds to mean "chain the
digest N times," bcrypt uses it as the real cost factor. Add a new algorithm by adding one entry
here; nothing else needs to change.

**Text diff engine** (`src/lib/diff.ts`) is line-based with a similarity fallback to word-level
diffing, built on `diff` (jsdiff)'s `diffLines`/`diffWordsWithSpace`/`diffChars`:

- `diffLines` produces hunks; adjacent removed→added hunks are paired line-by-line by index.
- Each paired line gets a `similarity()` score (Sørensen–Dice over `diffChars` common-length).
  Below `SIMILARITY_THRESHOLD` (0.5), the line is rendered as a full remove/add with no word-level
  highlighting (avoids noisy diffs on genuinely unrelated lines). At or above it, `diffWordsWithSpace`
  produces per-word highlighting within the line.
- Unequal-length removed/added blocks are paired up to `min(length)`; the remainder renders as
  plain (unhighlighted-per-word, but still colored) add/remove lines.

**Icons are components, not inline SVG.** `src/lib/components/icons/` holds one component per icon
(e.g. `SunIcon.svelte`, `MoonIcon.svelte`), each accepting `size` (default `20`) and `color`
(default `'currentColor'`) props. Don't inline `<svg>` markup directly in feature components — add
an icon component instead.

## Deployment

Adapter is `@sveltejs/adapter-node` (not `adapter-auto`) — deliberately, since the app ships as a
Docker image rather than to a specific serverless host. The `Dockerfile` is a multi-stage build:
installs full deps and runs `pnpm build` in a build stage, then a separate runtime stage does a
clean `pnpm install --frozen-lockfile --prod` and copies in only `build/`, so devDependencies never
ship. Runs as a non-root user.

`.github/workflows/docker-publish.yml` builds and pushes multi-arch (amd64/arm64) images to
`ghcr.io/neeppy/neep-tools` on push to `main` (tag `latest`) and on `vX.Y.Z` tags (semver tags),
using the built-in `GITHUB_TOKEN` — no registry secrets needed. The GHCR package is private by
default; nothing in the workflow controls that, it's a manual toggle in GitHub package settings.

Runtime env vars the Node server reads: `PORT` (default 3000), `HOST` (default 0.0.0.0), `ORIGIN`
(public URL — needed when running behind a reverse proxy).
