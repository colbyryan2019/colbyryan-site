<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Site structure

This is Colby Ryan's personal site. Games are the primary/home content;
the resume material is secondary, reached via "About."

- `/` — homepage, renders `components/Games.tsx` (the games hub/grid).
- `/games/bubble-burst` — an individual game page. New games get their own
  `app/games/<name>/page.tsx` and an entry in the `games` array in
  `lib/content.ts`; they stay listed on `/`, no separate index page.
- `/about` (`app/about/page.tsx`) — single consolidated resume page,
  composed of `AboutIntro` (headshot, name, contact, resume link) +
  `About` + `Experience` + `Education` + `Projects`, stacked as sections
  with anchor ids (`#experience`, `#education`, `#projects`). Those
  section components render `<h2>`/`<h3>` headings, not `<h1>` — they're
  no longer standalone pages, `AboutIntro`'s `<h1>` is the page's only one.
- `/games`, `/experience`, `/education`, `/projects` no longer exist as
  pages — they 308-redirect (see `next.config.ts`) to `/` and
  `/about#<section>` respectively, for old links/SEO.
- Nav (`components/Nav.tsx`) is intentionally just: Games (`/`), About
  (`/about`), Resume (external PDF). Don't re-add per-section nav links
  (Experience/Education/Projects) — they live inside `/about` instead.
- Anchor jumps use `scroll-smooth` (set on `<html>` in `app/layout.tsx`)
  and each anchored section has `scroll-mt-24` so it clears the sticky
  nav — keep both when touching this flow.
- All resume/game content data (contact info, experience, education,
  projects, games) lives in `lib/content.ts`, not hardcoded in
  components.

## Games architecture

Each game follows the same three-piece shape (see Bubble Burst as the
reference implementation):

- `lib/<game>.ts` — pure state/logic only: an initial-state factory
  plus small state-transition functions (no React, no DOM). Covered by
  `lib/__tests__/<game>.test.ts`.
- `components/<GameName>.tsx` — the client component (`'use client'`).
  Owns the `useReducer` wiring to the `lib/<game>.ts` functions, the
  timers/animations, and the finished/result screen.
- `app/games/<name>/page.tsx` — a thin route: just `metadata` and
  rendering the game component. No game logic or headings here.
- Add an entry to the `games` array in `lib/content.ts` so it's listed
  on `/`.

Convention: the on-page `<h1>` for a game lives inside the game
component itself (not the page), and only renders on the
finished/result screen — not while the round is actively being played.
