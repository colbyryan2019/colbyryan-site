# colbyryan.com Rebuild — Design Spec

## Goal
Rebuild the personal site currently at colbyryan2019.github.io as a Next.js + TypeScript +
Tailwind CSS site, deployed to Vercel under the custom domain colbyryan.com. Content is
carried over from the old static site (and the updated resume), refreshed with a
dark-mode-first visual design, multi-page routing, and Next.js-native SEO.

## Tech stack
- Next.js (App Router), TypeScript, Tailwind CSS
- `next-themes` for dark/light toggle (class-based dark mode strategy, default dark)
- No backend — static/SSG-friendly, deployable to Vercel

## Site structure — multi-page routing
Persistent layout (`app/layout.tsx`) wraps every route with:
- `components/Nav.tsx` — top nav: Home / About / Experience / Education / Projects, plus a
  dark/light toggle and a resume link
- `components/Footer.tsx` — contact info, GitHub, LinkedIn, resume link, copyright (doubles
  as the brief's "Footer/Contact" component)

Routes, each rendering one focused section component:
| Route | Component | Content |
|---|---|---|
| `/` | `components/Hero.tsx` | Name, title, location, contact links, short intro, CTAs into other pages |
| `/about` | `components/About.tsx` | About paragraph |
| `/experience` | `components/Experience.tsx` | Panoramix, PanAgora, TandemAI |
| `/education` | `components/Education.tsx` | Union College, TEFL Iberia |
| `/projects` | `components/Projects.tsx` | Mello Life, Mathematica, Math Thesis, CS Thesis |

Each `page.tsx` is a thin wrapper importing its section component — keeps the "one component
per section" structure the brief asked for while giving each page its own metadata/URL for
SEO and deep-linking.

## Visual design
- Dark background by default (near-black), single accent color (cool blue/teal), light mode
  available via toggle in the nav — respects `prefers-color-scheme` as a fallback but
  defaults to dark on first visit (`next-themes` with `defaultTheme="dark"`)
- Minimal/editorial typographic feel within the dark-mode aesthetic: generous whitespace,
  strong heading hierarchy, one accent color used sparingly (links, hover states, section
  markers)
- Subtle motion: scroll-fade-in on section content, hover-lift/glow on cards (experience
  entries, project cards, education entries, company logos) via Tailwind transitions — no
  animation library needed

## Content (final, post-clarification)

### Header / Contact (Nav + Footer + Hero)
- Colby Ryan — Software Engineer
- New York City, NY
- colbyryan2019@gmail.com · (508) 330-8410
- GitHub: https://github.com/colbyryan2019
- LinkedIn: https://www.linkedin.com/in/colby-ryan/
- Resume PDF linked from `/public/resume/Colby_Ryan_Resume.pdf`

### About
Software Engineer at Panoramix Financial in New York City. Graduated Union College in 2024,
double major Computer Science and Mathematics.

At Panoramix, led development of FacetAI (an AI-powered assistant announced at the T3
conference), and built full-stack features including a Retrieval-Augmented Generation bot,
nearest-neighbor search for embedded text retrieval, and user-facing investment model
tooling.

Previously interned at PanAgora Asset Management (data science) and TandemAI (HPC storage
performance). Spent a gap year in Barcelona, Spain after high school, earning a TEFL
certification and teaching English.

Outside work: building mobile apps, traveling, soccer, basketball, chess.

### Experience
**Panoramix Financial — Software Engineer** (Aug 2024 – Present)
- Led development of FacetAI, announced at the T3 conference and now live
- Developed and maintained full-stack financial applications using C#, .NET, ASP.NET Core,
  SQL Server, and modern web technologies
- Engineered a nearest-neighbor search system for embedded text retrieval using multivector
  calculus to improve response precision
- Built a Retrieval-Augmented Generation bot from documentation to assist clients
- Created user-query tracking in a SQL database to understand common user errors
- Built pages for users to create/edit investment models, asset classes, user-defined
  fields, and more

**PanAgora Asset Management — Data Science Intern** (Summer 2023)
- Wrote Python scripts connecting to the FBI API to extract, transform, and load data into a
  SQL server for Portfolio Manager
- Transitioned a daily data-diagnostic email tracking security performance into a full-stack
  interactive webpage

**TandemAI — Software Engineer Intern** (Summer 2022)
- Automated fio storage testing on an HPC cluster
- Created flexible scripts to test storage bandwidth/latency; graphed results with matplotlib

(Sapphire Software Services 2021 internship intentionally excluded — absent from current
resume.)

### Education
**Union College — Schenectady, NY** — B.S. Computer Science & Mathematics (double major),
Sept 2020 – June 2024
- Elected Class Vice President, Theta Delta Chi Social Chair, Philosophy Club Member
- Completed undergraduate theses in both Computer Science and Mathematics

**TEFL Iberia — Barcelona, Spain** — TEFL Certification & English Instructor, Sept 2019 –
March 2020
- Taught private English classes of all levels part-time
- Learned conversational Spanish during an immersive gap year abroad

### Projects
- **Mello Life** — Gamified habit-tracking/productivity app with daily challenges and
  streak-based rewards. Full stack built with React Native, TypeScript, Supabase,
  RevenueCat. [App Store](https://apps.apple.com/us/app/mello-life/id6759076619)
- **Mathematica** — Math-based iOS app; handled entire codebase and App Store publishing
  independently. [App Store](https://apps.apple.com/us/app/mathematica-original/id6743127573)
- **Mathematics Thesis** — Investigated properties, theorems, and structures of hypergraphs.
  Links to `/theses/Math Thesis.pdf`
- **Computer Science Thesis** — Compared two leading chess engines on evaluation of complex
  positions. Links to `/theses/Computer Science Thesis.pdf`

## Assets
Move (not duplicate) from repo root into `public/`:
- `images/headshot.jpg` → `public/images/headshot.jpg`
- `images/panagora_logo.png` → `public/images/panagora_logo.png`
- `images/tandemai_logo.png` → `public/images/tandemai_logo.png`
- `images/union_logo.png` → `public/images/union_logo.png`
- `theses/Math Thesis.pdf` → `public/theses/Math Thesis.pdf`
- `theses/Computer Science Thesis.pdf` → `public/theses/Computer Science Thesis.pdf`
- `Resume/Colby_Ryan_Resume (1).pdf` → `public/resume/Colby_Ryan_Resume.pdf` (renamed, no
  space/parens for a clean download URL)

Not carried over (present in old repo/images but unused by current content): amsa_logo.png,
cfa_logo.png, header.jpg, header.png, kwons_logo.jpeg, sapphire_software_services_logo.jpeg,
smart_school_logo.png. These stay out of `public/`.

After the move, the old top-level `images/`, `theses/`, and `Resume/` folders are removed
from the repo (their contents now live under `public/`).

## SEO
- `app/sitemap.ts` — generates sitemap covering all 5 routes
- `app/robots.ts` — allow-all robots config pointing at the sitemap
- Root `metadata` in `app/layout.tsx`: title template, description, OG tags (og:title,
  og:description, og:image using headshot or a generated card), twitter card, canonical
  domain colbyryan.com
- Per-route `metadata` export in each `page.tsx` (unique title/description per section)

## Deployment
- Vercel project linked to `colbyryan2019/colbyryan-site` GitHub repo
- README documents: `npm install`, `npm run dev` for local dev; Vercel import + custom
  domain (colbyryan.com) setup with DNS instructions (A/CNAME records per Vercel's domain
  settings page)

## Out of scope
- No CMS/backend — all content is static/hardcoded in components
- No blog
- No contact form (mailto/tel links only, matching the original site)
