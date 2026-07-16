# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Dev server at localhost:4321
pnpm build            # Type-check, build, run Pagefind search index, copy to public/
pnpm preview          # Preview production build locally
pnpm sync             # Generate Astro type definitions
pnpm format           # Prettier format all files
pnpm format:check     # Check formatting
pnpm lint             # ESLint all files
```

## Architecture

This is **AstroPaper**, an Astro v7 blog theme using Tailwind CSS v4, TypeScript, and MDX.

### Configuration layering

User-editable config lives in `astro-paper.config.ts` (typed via `defineAstroPaperConfig()`). This is imported by `src/config.ts`, which merges it with defaults and env vars into the fully-resolved `ResolvedAstroPaperConfig` shape consumed everywhere else.

### Content collections

Defined in `src/content.config.ts`. Two collections — `posts` and `pages` — both use glob loaders with Zod schemas. Blog posts go in `src/content/posts/` and support nested subdirectories (the directory path becomes part of the post URL). Pages are in `src/content/pages/`. Files prefixed with `_` are excluded from the glob.

### Routing & post URLs

- `src/pages/posts/[...slug]/index.astro` — post detail page. `getStaticPaths()` uses `getPostSlug()` from `src/utils/getPostPaths.ts` to map `id` + `filePath` into route params. Subdirectory paths are preserved in the slug.
- `src/pages/posts/[...page].astro` — paginated post listing using Astro's `paginate()`.
- `src/pages/tags/[tag]/[...page].astro` — paginated tag-filtered listing.
- `getPostUrl()` produces a locale-aware, base-prefixed URL for `<a href>` and RSS.

### Post visibility pipeline

`src/utils/getSortedPosts.ts` chains `postFilter()` (hide drafts, gate scheduled posts by `scheduledPostMargin` in dev) then sorts by `modDatetime ?? pubDatetime` descending.

### Layout hierarchy

`Layout.astro` is the base shell: `<html>`, `<head>` (SEO, OG, RSS autodiscovery, FOUC-prevention inline script), `<body>` with Tailwind classes, `<ClientRouter />` for view transitions, and a slot for page content. `PostLayout.astro` wraps `Layout` and adds JSON-LD structured data (`BlogPosting`) and article-specific meta tags (`article:published_time`, `article:modified_time`).

### i18n

Astro's built-in `i18n` routing (currently single-locale `"en"`). UI strings live in `src/i18n/lang/<locale>.ts` and are loaded via `import.meta.glob` in `src/i18n/index.ts`. The `useTranslations(locale)` hook returns the matching locale object (falls back to `"en"`). Add a new locale by creating `src/i18n/lang/<code>.ts`.

### Theme (dark/light mode)

Two layers: an inline `<script is:inline>` in `Layout.astro` sets `data-theme` on `<html>` before first paint (prevents FOUC), then `src/scripts/theme.ts` handles the toggle button, persistence to `localStorage`, syncing with OS preference changes, and carrying `theme-color` across view transitions.

### Markdown processing

Declared in `astro.config.ts` via the Unified ecosystem: `remark-toc` → `remark-collapse` (collapses the "Table of contents" heading) → `rehype-callouts`. Shiki syntax highlighting uses dual themes (`min-light` / `night-owl`) with transformers for notation diff, notation highlight, notation word highlight, and a custom `transformerFileName` (in `src/utils/transformers/fileName.js`) that adds file-name labels to code blocks.

### OG image generation

Satori + Sharp. Two routes generate PNGs at build/request time:
- `src/pages/og.png.ts` — site-wide fallback OG image (`/og.png`)
- `src/pages/posts/[...slug]/index.png.ts` — per-post dynamic OG image

Font data comes from Astro's font system (`astro:assets`).

### Search

Pagefind-based static search. The build step runs `pagefind --site dist` and copies the index to `public/pagefind/` so `pnpm dev` also has search. The search UI is at `src/pages/search.astro`.

### Post detail page features

The post detail page (`[...slug]/index.astro`) includes: scroll progress bar, heading anchor links (`#`), code block copy buttons, accessible image lightbox (click/keyboard to open, pinch-zoom, double-tap zoom, ESC to close, focus trap), previous/next post navigation, share links, and an "Edit page" link.

### Key utilities

| Utility | Purpose |
|---------|---------|
| `src/utils/postFilter.ts` | Decides whether a post is visible (draft check, scheduled post time-gating) |
| `src/utils/getSortedPosts.ts` | Filters + sorts posts by mod/pub datetime |
| `src/utils/getPostPaths.ts` | Generates URL slugs and full navigable URLs from post id + filePath |
| `src/utils/slugify.ts` | Hybrid slugify — Latin chars via `slugify`, non-Latin via `lodash.kebabcase` |
| `src/utils/getUniqueTags.ts` | Deduplicated, sorted tag list from visible posts |
| `src/utils/withBase.ts` | Prepends the configured Astro `base` path to asset URLs |

### Path aliases

`@/*` maps to `./src/*`. `@/astro-paper.config` maps to `./astro-paper.config`. Configured in `tsconfig.json`.
