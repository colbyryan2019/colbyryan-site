# colbyryan.com Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild colbyryan2019.github.io as a Next.js + TypeScript + Tailwind CSS site (App Router, dark-mode-first, 5 routes) in this repo, ready to deploy to Vercel under colbyryan.com.

**Architecture:** Next.js App Router with a persistent root layout (Nav + Footer + ThemeProvider) wrapping five routes (`/`, `/about`, `/experience`, `/education`, `/projects`), each rendering one section component. Content (contact info, experience, education, projects) lives in a single typed data module so components stay presentational. Dark mode is class-based via `next-themes`, defaulting to dark. No backend, no CMS — everything is static.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS v4, next-themes, Vitest + React Testing Library for component tests.

**Spec:** `docs/superpowers/specs/2026-08-19-site-rebuild-design.md`

## Global Constraints

- Next.js App Router, TypeScript, Tailwind CSS — no backend, static/SSG-friendly (per spec "Tech stack")
- Dark background by default, light mode via toggle in Nav, class-based dark mode (`next-themes`, `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`) (per spec "Visual design")
- Exactly 5 routes: `/`, `/about`, `/experience`, `/education`, `/projects`, sharing one root layout with Nav + Footer (per spec "Site structure")
- Content text is locked verbatim in the spec's "Content" section — do not paraphrase when copying into components
- Assets move (not copy) from `images/`, `theses/`, `Resume/` at the repo root into `public/images/`, `public/theses/`, `public/resume/`; old top-level folders are deleted once moved (per spec "Assets")
- Accent color: `#38bdf8` (sky blue), registered as a Tailwind theme color so `bg-accent`/`text-accent`/`border-accent` utilities are available
- Production domain for metadata/sitemap/robots: `https://colbyryan.com`

---

## Task 1: Scaffold the Next.js project into the repo root

**Files:**
- Create (via `create-next-app`, merged into repo root): `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `public/*.svg`, `.gitignore`
- Modify: repo root (existing `docs/`, `images/`, `theses/`, `Resume/`, `.git/` must survive the merge untouched)

**Interfaces:**
- Produces: a working `npm run dev` / `npm run build` / `npm run lint` Next.js + TypeScript + Tailwind project at the repo root, which every later task builds on.

- [ ] **Step 1: Scaffold into a throwaway sibling directory**

The repo root already has non-empty content (`docs/`, `images/`, `theses/`, `Resume/`, `.git/`), so `create-next-app` must run somewhere empty first, then get merged in.

```bash
cd /Users/colbyryan/Desktop/Coding
npx create-next-app@latest scaffold-tmp \
  --typescript --tailwind --eslint --app \
  --src-dir=false --import-alias "@/*" --use-npm --yes
```

If it prompts interactively for anything not covered by these flags, accept the default.

- [ ] **Step 2: Strip the scaffold's own git history and dependencies**

```bash
rm -rf /Users/colbyryan/Desktop/Coding/scaffold-tmp/.git
rm -rf /Users/colbyryan/Desktop/Coding/scaffold-tmp/node_modules
```

- [ ] **Step 3: Merge the scaffold into the repo root**

```bash
rsync -a /Users/colbyryan/Desktop/Coding/scaffold-tmp/ /Users/colbyryan/Desktop/Coding/colbyryan-site/
rm -rf /Users/colbyryan/Desktop/Coding/scaffold-tmp
```

`rsync -a` merges recursively without deleting anything already in the destination, so `docs/`, `images/`, `theses/`, `Resume/`, and `.git/` are untouched.

- [ ] **Step 4: Remove unused scaffold placeholder assets**

```bash
cd /Users/colbyryan/Desktop/Coding/colbyryan-site
rm -f public/vercel.svg public/next.svg public/globe.svg public/file.svg public/window.svg
```

- [ ] **Step 5: Install dependencies and verify the build**

```bash
npm install
npm run build
```

Expected: build completes successfully and prints the default `/` route in the route summary.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js + TypeScript + Tailwind project"
```

---

## Task 2: Configure Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `components/__tests__/smoke.test.tsx`
- Modify: `package.json` (add `test` script and devDependencies)

**Interfaces:**
- Produces: `npm test` runs Vitest with jsdom + React Testing Library + jest-dom matchers available to every later component test task.

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Write the failing smoke test**

Create `components/__tests__/smoke.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('test harness smoke test', () => {
  it('renders a component and finds it in the DOM', () => {
    render(<p>ok</p>)
    expect(screen.getByText('ok')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run it to confirm it fails (no config yet)**

```bash
npx vitest run
```

Expected: FAIL — Vitest has no config, `toBeInTheDocument` matcher unavailable, or the command errors out because `vitest` isn't wired to jsdom/jest-dom yet.

- [ ] **Step 4: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}
```

Add to `package.json` `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 5: Run the test again to confirm it passes**

```bash
npm test
```

Expected: PASS — 1 test passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts components/__tests__/smoke.test.tsx
git commit -m "Add Vitest + React Testing Library test harness"
```

---

## Task 3: Relocate real assets into public/

**Files:**
- Move: `images/headshot.jpg` → `public/images/headshot.jpg`
- Move: `images/panagora_logo.png` → `public/images/panagora_logo.png`
- Move: `images/tandemai_logo.png` → `public/images/tandemai_logo.png`
- Move: `images/union_logo.png` → `public/images/union_logo.png`
- Move: `theses/Math Thesis.pdf` → `public/theses/Math Thesis.pdf`
- Move: `theses/Computer Science Thesis.pdf` → `public/theses/Computer Science Thesis.pdf`
- Move: `Resume/Colby_Ryan_Resume (1).pdf` → `public/resume/Colby_Ryan_Resume.pdf`
- Delete: top-level `images/`, `theses/`, `Resume/` (after the moves above, these are empty)

**Interfaces:**
- Produces: `/public/images/headshot.jpg`, `/public/images/panagora_logo.png`, `/public/images/tandemai_logo.png`, `/public/images/union_logo.png`, `/public/theses/Math Thesis.pdf`, `/public/theses/Computer Science Thesis.pdf`, `/public/resume/Colby_Ryan_Resume.pdf` — every later component task that references an image, thesis, or resume link uses these exact paths.

- [ ] **Step 1: Move the files**

```bash
cd /Users/colbyryan/Desktop/Coding/colbyryan-site
mkdir -p public/images public/theses public/resume
mv images/headshot.jpg public/images/headshot.jpg
mv images/panagora_logo.png public/images/panagora_logo.png
mv images/tandemai_logo.png public/images/tandemai_logo.png
mv images/union_logo.png public/images/union_logo.png
mv "theses/Math Thesis.pdf" "public/theses/Math Thesis.pdf"
mv "theses/Computer Science Thesis.pdf" "public/theses/Computer Science Thesis.pdf"
mv "Resume/Colby_Ryan_Resume (1).pdf" "public/resume/Colby_Ryan_Resume.pdf"
```

- [ ] **Step 2: Remove the now-unused old folders and any leftover files inside them (unused logos, .DS_Store)**

```bash
rm -rf images theses Resume
```

- [ ] **Step 3: Verify**

```bash
ls public/images public/theses public/resume
```

Expected: each directory lists exactly the files moved into it above.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Move real assets into public/"
```

---

## Task 4: Content data module

**Files:**
- Create: `lib/content.ts`
- Test: `lib/__tests__/content.test.ts`

**Interfaces:**
- Consumes: asset paths produced by Task 3 (`/images/...`, `/theses/...`, `/resume/...`)
- Produces: `contact: ContactInfo`, `experience: ExperienceEntry[]`, `education: EducationEntry[]`, `projects: ProjectEntry[]` exported from `@/lib/content` — every component task (Nav, Footer, Hero, About, Experience, Education, Projects) imports from here.

- [ ] **Step 1: Write the failing test**

Create `lib/__tests__/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { contact, experience, education, projects } from '../content'

describe('content data', () => {
  it('has complete contact info', () => {
    expect(contact.name).toBe('Colby Ryan')
    expect(contact.email).toBe('colbyryan2019@gmail.com')
    expect(contact.github).toBe('https://github.com/colbyryan2019')
    expect(contact.linkedin).toBe('https://www.linkedin.com/in/colby-ryan/')
    expect(contact.resumeHref).toBe('/resume/Colby_Ryan_Resume.pdf')
  })

  it('lists three experience entries in reverse-chronological order', () => {
    expect(experience.map((e) => e.company)).toEqual([
      'Panoramix Financial',
      'PanAgora Asset Management',
      'TandemAI',
    ])
    for (const entry of experience) {
      expect(entry.bullets.length).toBeGreaterThan(0)
    }
  })

  it('lists two education entries starting with Union College', () => {
    expect(education).toHaveLength(2)
    expect(education[0].school).toBe('Union College')
    expect(education[1].school).toBe('TEFL Iberia')
  })

  it('lists four projects with non-empty links', () => {
    expect(projects).toHaveLength(4)
    for (const project of projects) {
      expect(project.href.length).toBeGreaterThan(0)
    }
    expect(projects[2].href).toBe('/theses/Math%20Thesis.pdf')
    expect(projects[3].href).toBe('/theses/Computer%20Science%20Thesis.pdf')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run lib/__tests__/content.test.ts
```

Expected: FAIL — `../content` does not exist.

- [ ] **Step 3: Write the content module**

Create `lib/content.ts`:

```ts
export interface ContactInfo {
  name: string
  title: string
  location: string
  email: string
  phone: string
  github: string
  linkedin: string
  resumeHref: string
}

export const contact: ContactInfo = {
  name: 'Colby Ryan',
  title: 'Software Engineer',
  location: 'New York City, NY',
  email: 'colbyryan2019@gmail.com',
  phone: '(508) 330-8410',
  github: 'https://github.com/colbyryan2019',
  linkedin: 'https://www.linkedin.com/in/colby-ryan/',
  resumeHref: '/resume/Colby_Ryan_Resume.pdf',
}

export interface ExperienceEntry {
  company: string
  role: string
  dates: string
  bullets: string[]
  logo?: string
}

export const experience: ExperienceEntry[] = [
  {
    company: 'Panoramix Financial',
    role: 'Software Engineer',
    dates: 'Aug 2024 – Present',
    bullets: [
      'Led development of FacetAI, announced at the T3 conference and now live',
      'Developed and maintained full-stack financial applications using C#, .NET, ASP.NET Core, SQL Server, and modern web technologies',
      'Engineered a nearest-neighbor search system for embedded text retrieval using multivector calculus to improve response precision',
      'Built a Retrieval-Augmented Generation bot from documentation to assist clients',
      'Created user-query tracking in a SQL database to understand common user errors',
      'Built pages for users to create/edit investment models, asset classes, user-defined fields, and more',
    ],
  },
  {
    company: 'PanAgora Asset Management',
    role: 'Data Science Intern',
    dates: 'Summer 2023',
    bullets: [
      'Wrote Python scripts connecting to the FBI API to extract, transform, and load data into a SQL server for Portfolio Manager',
      'Transitioned a daily data-diagnostic email tracking security performance into a full-stack interactive webpage',
    ],
    logo: '/images/panagora_logo.png',
  },
  {
    company: 'TandemAI',
    role: 'Software Engineer Intern',
    dates: 'Summer 2022',
    bullets: [
      'Automated fio storage testing on an HPC cluster',
      'Created flexible scripts to test storage bandwidth/latency; graphed results with matplotlib',
    ],
    logo: '/images/tandemai_logo.png',
  },
]

export interface EducationEntry {
  school: string
  location: string
  credential: string
  dates: string
  bullets: string[]
  logo?: string
}

export const education: EducationEntry[] = [
  {
    school: 'Union College',
    location: 'Schenectady, NY',
    credential: 'B.S. Computer Science & Mathematics (double major)',
    dates: 'Sept 2020 – June 2024',
    bullets: [
      'Elected Class Vice President, Theta Delta Chi Social Chair, Philosophy Club Member',
      'Completed undergraduate theses in both Computer Science and Mathematics',
    ],
    logo: '/images/union_logo.png',
  },
  {
    school: 'TEFL Iberia',
    location: 'Barcelona, Spain',
    credential: 'TEFL Certification & English Instructor',
    dates: 'Sept 2019 – March 2020',
    bullets: [
      'Taught private English classes of all levels part-time',
      'Learned conversational Spanish during an immersive gap year abroad',
    ],
  },
]

export interface ProjectEntry {
  title: string
  description: string
  href: string
  linkLabel: string
}

export const projects: ProjectEntry[] = [
  {
    title: 'Mello Life',
    description:
      'Gamified habit-tracking/productivity app with daily challenges and streak-based rewards. Full stack built with React Native, TypeScript, Supabase, RevenueCat.',
    href: 'https://apps.apple.com/us/app/mello-life/id6759076619',
    linkLabel: 'App Store',
  },
  {
    title: 'Mathematica',
    description:
      'Math-based iOS app; handled entire codebase and App Store publishing independently.',
    href: 'https://apps.apple.com/us/app/mathematica-original/id6743127573',
    linkLabel: 'App Store',
  },
  {
    title: 'Mathematics Thesis',
    description:
      'Investigated properties, theorems, and structures of hypergraphs, an extension of graph theory where edges may link multiple vertices simultaneously.',
    href: '/theses/Math%20Thesis.pdf',
    linkLabel: 'Read PDF',
  },
  {
    title: 'Computer Science Thesis',
    description:
      'Compared two leading chess engines on how they evaluated intricately designed chess positions.',
    href: '/theses/Computer%20Science%20Thesis.pdf',
    linkLabel: 'Read PDF',
  },
]
```

- [ ] **Step 4: Run the test again to verify it passes**

```bash
npx vitest run lib/__tests__/content.test.ts
```

Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add lib/content.ts lib/__tests__/content.test.ts
git commit -m "Add typed content data module"
```

---

## Task 5: Theme tokens, dark mode, ThemeProvider, ThemeToggle

**Files:**
- Modify: `app/globals.css`
- Create: `components/ThemeProvider.tsx`, `components/ThemeToggle.tsx`
- Test: `components/__tests__/ThemeToggle.test.tsx`

**Interfaces:**
- Produces: `bg-accent`/`text-accent`/`border-accent` Tailwind utilities, a `.fade-in-section` CSS animation class, `<ThemeProvider>` (wraps children, default export) for Task 8's layout, `<ThemeToggle>` (default export) for Task 6's Nav.

- [ ] **Step 1: Install next-themes**

```bash
npm install next-themes
```

- [ ] **Step 2: Update globals.css with accent color, class-based dark mode, and the fade-in keyframe**

Replace the contents of `app/globals.css` with:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-accent: #38bdf8;
}

html {
  color-scheme: dark;
}

body {
  @apply bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-section {
  animation: fade-in-up 0.6s ease-out both;
}
```

- [ ] **Step 3: Create the ThemeProvider wrapper**

Create `components/ThemeProvider.tsx`:

```tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}
```

- [ ] **Step 4: Write the failing test for ThemeToggle**

Create `components/__tests__/ThemeToggle.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import ThemeToggle from '../ThemeToggle'

function renderToggle() {
  return render(
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeToggle', () => {
  it('starts in dark mode and switches to light on click', async () => {
    renderToggle()
    const button = await screen.findByRole('button', { name: /toggle theme/i })

    await waitFor(() => expect(button).toHaveTextContent('☀️'))

    fireEvent.click(button)

    await waitFor(() => expect(document.documentElement.classList.contains('dark')).toBe(false))
    expect(button).toHaveTextContent('🌙')
  })
})
```

- [ ] **Step 5: Run it to verify it fails**

```bash
npx vitest run components/__tests__/ThemeToggle.test.tsx
```

Expected: FAIL — `../ThemeToggle` does not exist.

- [ ] **Step 6: Write ThemeToggle**

Create `components/ThemeToggle.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <button aria-label="Toggle theme" className="h-9 w-9" />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-9 w-9 rounded-full border border-gray-300 text-sm transition-colors hover:border-accent hover:text-accent dark:border-gray-700"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
```

- [ ] **Step 7: Run the test again to verify it passes**

```bash
npx vitest run components/__tests__/ThemeToggle.test.tsx
```

Expected: PASS — 1 test passed.

- [ ] **Step 8: Commit**

```bash
git add app/globals.css components/ThemeProvider.tsx components/ThemeToggle.tsx components/__tests__/ThemeToggle.test.tsx package.json package-lock.json
git commit -m "Add dark-mode-first theme with accent color and toggle"
```

---

## Task 6: Nav component

**Files:**
- Create: `components/Nav.tsx`
- Test: `components/__tests__/Nav.test.tsx`

**Interfaces:**
- Consumes: `contact` from `@/lib/content` (Task 4), `ThemeToggle` default export from `@/components/ThemeToggle` (Task 5)
- Produces: `<Nav>` default export for Task 8's root layout.

- [ ] **Step 1: Write the failing test**

Create `components/__tests__/Nav.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import Nav from '../Nav'

describe('Nav', () => {
  it('renders a link to every section route', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <Nav />
      </ThemeProvider>,
    )

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '/experience')
    expect(screen.getByRole('link', { name: 'Education' })).toHaveAttribute('href', '/education')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run components/__tests__/Nav.test.tsx
```

Expected: FAIL — `../Nav` does not exist.

- [ ] **Step 3: Write Nav**

Create `components/Nav.tsx`:

```tsx
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { contact } from '@/lib/content'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/experience', label: 'Experience' },
  { href: '/education', label: 'Education' },
  { href: '/projects', label: 'Projects' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-wide">
          {contact.name.toUpperCase()}
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-accent">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  )
}
```

- [ ] **Step 4: Run the test again to verify it passes**

```bash
npx vitest run components/__tests__/Nav.test.tsx
```

Expected: PASS — 1 test passed.

- [ ] **Step 5: Commit**

```bash
git add components/Nav.tsx components/__tests__/Nav.test.tsx
git commit -m "Add Nav component"
```

---

## Task 7: Footer component

**Files:**
- Create: `components/Footer.tsx`
- Test: `components/__tests__/Footer.test.tsx`

**Interfaces:**
- Consumes: `contact` from `@/lib/content` (Task 4)
- Produces: `<Footer>` default export for Task 8's root layout.

- [ ] **Step 1: Write the failing test**

Create `components/__tests__/Footer.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../Footer'
import { contact } from '@/lib/content'

describe('Footer', () => {
  it('renders contact, GitHub, LinkedIn, and resume links', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: contact.email })).toHaveAttribute(
      'href',
      `mailto:${contact.email}`,
    )
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', contact.github)
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', contact.linkedin)
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', contact.resumeHref)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run components/__tests__/Footer.test.tsx
```

Expected: FAIL — `../Footer` does not exist.

- [ ] **Step 3: Write Footer**

Create `components/Footer.tsx`:

```tsx
import { contact } from '@/lib/content'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-200 py-10 dark:border-gray-800">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href={`mailto:${contact.email}`} className="transition-colors hover:text-accent">
            {contact.email}
          </a>
          <span>·</span>
          <a
            href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
            className="transition-colors hover:text-accent"
          >
            {contact.phone}
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href={contact.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
            GitHub
          </a>
          <a href={contact.linkedin} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
            LinkedIn
          </a>
          <a href={contact.resumeHref} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
            Resume
          </a>
        </div>
        <p>
          © {new Date().getFullYear()} {contact.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Run the test again to verify it passes**

```bash
npx vitest run components/__tests__/Footer.test.tsx
```

Expected: PASS — 1 test passed.

- [ ] **Step 5: Commit**

```bash
git add components/Footer.tsx components/__tests__/Footer.test.tsx
git commit -m "Add Footer component"
```

---

## Task 8: Root layout — wire ThemeProvider, Nav, Footer, and site metadata

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `ThemeProvider` (Task 5), `Nav` (Task 6), `Footer` (Task 7)
- Produces: the shared shell every route (Tasks 9–13) renders inside; root `metadata` export that per-page metadata (Tasks 10–13) extends via the title template `"%s · Colby Ryan"`.

- [ ] **Step 1: Replace app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const description =
  'Colby Ryan is a Software Engineer at Panoramix Financial in New York City, building AI-powered financial tooling.'

export const metadata: Metadata = {
  metadataBase: new URL('https://colbyryan.com'),
  title: {
    default: 'Colby Ryan — Software Engineer',
    template: '%s · Colby Ryan',
  },
  description,
  openGraph: {
    title: 'Colby Ryan — Software Engineer',
    description,
    url: 'https://colbyryan.com',
    siteName: 'Colby Ryan',
    images: ['/images/headshot.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Colby Ryan — Software Engineer',
    description,
    images: ['/images/headshot.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Nav />
          <main className="mx-auto max-w-4xl px-6 py-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify the app still builds with the new layout wrapping the scaffold's default home page**

```bash
npm run build
```

Expected: build succeeds; route summary includes `/`.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "Wire root layout with theme, nav, footer, and site metadata"
```

---

## Task 9: Hero component and home page

**Files:**
- Create: `components/Hero.tsx`
- Test: `components/__tests__/Hero.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `contact` from `@/lib/content` (Task 4)
- Produces: `/` route rendering `<Hero>`.

- [ ] **Step 1: Write the failing test**

Create `components/__tests__/Hero.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Hero from '../Hero'
import { contact } from '@/lib/content'

describe('Hero', () => {
  it('renders name, title, and contact links', () => {
    render(<Hero />)

    expect(screen.getByRole('heading', { name: contact.name })).toBeInTheDocument()
    expect(screen.getByText(contact.title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: contact.email })).toHaveAttribute(
      'href',
      `mailto:${contact.email}`,
    )
    expect(screen.getByRole('link', { name: 'About Me' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'View Projects' })).toHaveAttribute('href', '/projects')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run components/__tests__/Hero.test.tsx
```

Expected: FAIL — `../Hero` does not exist.

- [ ] **Step 3: Write Hero**

Create `components/Hero.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { contact } from '@/lib/content'

export default function Hero() {
  return (
    <section className="fade-in-section flex flex-col items-center gap-6 text-center">
      <Image
        src="/images/headshot.jpg"
        alt={contact.name}
        width={144}
        height={144}
        className="rounded-full object-cover"
        priority
      />
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{contact.name}</h1>
        <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">{contact.title}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{contact.location}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <a href={`mailto:${contact.email}`} className="transition-colors hover:text-accent">
          {contact.email}
        </a>
        <span>·</span>
        <a
          href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
          className="transition-colors hover:text-accent"
        >
          {contact.phone}
        </a>
      </div>
      <p className="max-w-xl text-gray-600 dark:text-gray-400">
        Software Engineer at Panoramix Financial in New York City, building AI-powered
        financial tooling. Union College &apos;24, double major in Computer Science and
        Mathematics.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/about"
          className="rounded-full border border-accent px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-gray-950"
        >
          About Me
        </Link>
        <Link
          href="/projects"
          className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent dark:border-gray-700"
        >
          View Projects
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the test again to verify it passes**

```bash
npx vitest run components/__tests__/Hero.test.tsx
```

Expected: PASS — 1 test passed.

- [ ] **Step 5: Replace app/page.tsx**

```tsx
import Hero from '@/components/Hero'

export default function HomePage() {
  return <Hero />
}
```

- [ ] **Step 6: Verify the full app builds with the real home page**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add components/Hero.tsx components/__tests__/Hero.test.tsx app/page.tsx
git commit -m "Add Hero component and wire up home page"
```

---

## Task 10: About component and page

**Files:**
- Create: `components/About.tsx`, `app/about/page.tsx`
- Test: `components/__tests__/About.test.tsx`

**Interfaces:**
- Produces: `/about` route rendering `<About>`.

- [ ] **Step 1: Write the failing test**

Create `components/__tests__/About.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import About from '../About'

describe('About', () => {
  it('mentions Panoramix Financial, Union College, and FacetAI', () => {
    render(<About />)

    expect(screen.getByText(/Panoramix Financial/)).toBeInTheDocument()
    expect(screen.getByText(/Union College/)).toBeInTheDocument()
    expect(screen.getByText(/FacetAI/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run components/__tests__/About.test.tsx
```

Expected: FAIL — `../About` does not exist.

- [ ] **Step 3: Write About**

Create `components/About.tsx`:

```tsx
export default function About() {
  return (
    <section className="fade-in-section space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <p>
          Software Engineer at Panoramix Financial in New York City. Graduated Union
          College in 2024, double major Computer Science and Mathematics.
        </p>
        <p>
          At Panoramix, led development of FacetAI (an AI-powered assistant announced at
          the T3 conference), and built full-stack features including a
          Retrieval-Augmented Generation bot, nearest-neighbor search for embedded text
          retrieval, and user-facing investment model tooling.
        </p>
        <p>
          Previously interned at PanAgora Asset Management (data science) and TandemAI
          (HPC storage performance). Spent a gap year in Barcelona, Spain after high
          school, earning a TEFL certification and teaching English.
        </p>
        <p>Outside work: building mobile apps, traveling, soccer, basketball, chess.</p>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the test again to verify it passes**

```bash
npx vitest run components/__tests__/About.test.tsx
```

Expected: PASS — 1 test passed.

- [ ] **Step 5: Create the About route**

Create `app/about/page.tsx`:

```tsx
import type { Metadata } from 'next'
import About from '@/components/About'

export const metadata: Metadata = {
  title: 'About',
  description:
    "Software Engineer at Panoramix Financial in New York City, Union College '24 grad in Computer Science and Mathematics.",
}

export default function AboutPage() {
  return <About />
}
```

- [ ] **Step 6: Verify the full app builds with the new route**

```bash
npm run build
```

Expected: build succeeds; route summary includes `/about`.

- [ ] **Step 7: Commit**

```bash
git add components/About.tsx components/__tests__/About.test.tsx app/about/page.tsx
git commit -m "Add About component and page"
```

---

## Task 11: Experience component and page

**Files:**
- Create: `components/Experience.tsx`, `app/experience/page.tsx`
- Test: `components/__tests__/Experience.test.tsx`

**Interfaces:**
- Consumes: `experience` from `@/lib/content` (Task 4)
- Produces: `/experience` route rendering `<Experience>`.

- [ ] **Step 1: Write the failing test**

Create `components/__tests__/Experience.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Experience from '../Experience'
import { experience } from '@/lib/content'

describe('Experience', () => {
  it('renders every experience entry with its role and dates', () => {
    render(<Experience />)

    for (const entry of experience) {
      expect(screen.getByRole('heading', { name: entry.company })).toBeInTheDocument()
      expect(screen.getByText(entry.role)).toBeInTheDocument()
      expect(screen.getByText(entry.dates)).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run components/__tests__/Experience.test.tsx
```

Expected: FAIL — `../Experience` does not exist.

- [ ] **Step 3: Write Experience**

Create `components/Experience.tsx`:

```tsx
import Image from 'next/image'
import { experience } from '@/lib/content'

export default function Experience() {
  return (
    <section className="fade-in-section space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
      <ol className="space-y-10">
        {experience.map((entry) => (
          <li
            key={entry.company}
            className="rounded-xl border border-gray-200 p-6 transition-colors hover:border-accent dark:border-gray-800"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {entry.logo && (
                  <Image
                    src={entry.logo}
                    alt={`${entry.company} logo`}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">{entry.company}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{entry.role}</p>
                </div>
              </div>
              <p className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">{entry.dates}</p>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
              {entry.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
```

- [ ] **Step 4: Run the test again to verify it passes**

```bash
npx vitest run components/__tests__/Experience.test.tsx
```

Expected: PASS — 1 test passed.

- [ ] **Step 5: Create the Experience route**

Create `app/experience/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Experience from '@/components/Experience'

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Work experience: Panoramix Financial, PanAgora Asset Management, TandemAI.',
}

export default function ExperiencePage() {
  return <Experience />
}
```

- [ ] **Step 6: Verify the full app builds with the new route**

```bash
npm run build
```

Expected: build succeeds; route summary includes `/experience`.

- [ ] **Step 7: Commit**

```bash
git add components/Experience.tsx components/__tests__/Experience.test.tsx app/experience/page.tsx
git commit -m "Add Experience component and page"
```

---

## Task 12: Education component and page

**Files:**
- Create: `components/Education.tsx`, `app/education/page.tsx`
- Test: `components/__tests__/Education.test.tsx`

**Interfaces:**
- Consumes: `education` from `@/lib/content` (Task 4)
- Produces: `/education` route rendering `<Education>`.

- [ ] **Step 1: Write the failing test**

Create `components/__tests__/Education.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Education from '../Education'
import { education } from '@/lib/content'

describe('Education', () => {
  it('renders every education entry with its credential and dates', () => {
    render(<Education />)

    for (const entry of education) {
      expect(screen.getByRole('heading', { name: entry.school })).toBeInTheDocument()
      expect(screen.getByText(entry.dates)).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run components/__tests__/Education.test.tsx
```

Expected: FAIL — `../Education` does not exist.

- [ ] **Step 3: Write Education**

Create `components/Education.tsx`:

```tsx
import Image from 'next/image'
import { education } from '@/lib/content'

export default function Education() {
  return (
    <section className="fade-in-section space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Education</h1>
      <ol className="space-y-10">
        {education.map((entry) => (
          <li
            key={entry.school}
            className="rounded-xl border border-gray-200 p-6 transition-colors hover:border-accent dark:border-gray-800"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {entry.logo && (
                  <Image
                    src={entry.logo}
                    alt={`${entry.school} logo`}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">{entry.school}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.credential} · {entry.location}
                  </p>
                </div>
              </div>
              <p className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">{entry.dates}</p>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
              {entry.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
```

- [ ] **Step 4: Run the test again to verify it passes**

```bash
npx vitest run components/__tests__/Education.test.tsx
```

Expected: PASS — 1 test passed.

- [ ] **Step 5: Create the Education route**

Create `app/education/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Education from '@/components/Education'

export const metadata: Metadata = {
  title: 'Education',
  description: 'Education: Union College (B.S. Computer Science & Mathematics) and TEFL Iberia.',
}

export default function EducationPage() {
  return <Education />
}
```

- [ ] **Step 6: Verify the full app builds with the new route**

```bash
npm run build
```

Expected: build succeeds; route summary includes `/education`.

- [ ] **Step 7: Commit**

```bash
git add components/Education.tsx components/__tests__/Education.test.tsx app/education/page.tsx
git commit -m "Add Education component and page"
```

---

## Task 13: Projects component and page

**Files:**
- Create: `components/Projects.tsx`, `app/projects/page.tsx`
- Test: `components/__tests__/Projects.test.tsx`

**Interfaces:**
- Consumes: `projects` from `@/lib/content` (Task 4)
- Produces: `/projects` route rendering `<Projects>`.

- [ ] **Step 1: Write the failing test**

Create `components/__tests__/Projects.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Projects from '../Projects'
import { projects } from '@/lib/content'

describe('Projects', () => {
  it('renders every project with a working link', () => {
    render(<Projects />)

    for (const project of projects) {
      expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: `${project.linkLabel} →` })).toHaveAttribute(
        'href',
        project.href,
      )
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run components/__tests__/Projects.test.tsx
```

Expected: FAIL — `../Projects` does not exist.

- [ ] **Step 3: Write Projects**

Create `components/Projects.tsx`:

```tsx
import { projects } from '@/lib/content'

export default function Projects() {
  return (
    <section className="fade-in-section space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <ul className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <li
            key={project.title}
            className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 p-6 transition-colors hover:border-accent dark:border-gray-800"
          >
            <div>
              <h2 className="text-lg font-semibold">{project.title}</h2>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{project.description}</p>
            </div>
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-accent hover:underline"
            >
              {project.linkLabel} →
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 4: Run the test again to verify it passes**

```bash
npx vitest run components/__tests__/Projects.test.tsx
```

Expected: PASS — 1 test passed.

- [ ] **Step 5: Create the Projects route**

Create `app/projects/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Projects from '@/components/Projects'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Projects: Mello Life, Mathematica, Mathematics Thesis, Computer Science Thesis.',
}

export default function ProjectsPage() {
  return <Projects />
}
```

- [ ] **Step 6: Verify the full app builds with the new route**

```bash
npm run build
```

Expected: build succeeds; route summary includes `/projects`.

- [ ] **Step 7: Commit**

```bash
git add components/Projects.tsx components/__tests__/Projects.test.tsx app/projects/page.tsx
git commit -m "Add Projects component and page"
```

---

## Task 14: Sitemap and robots.txt

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`
- Test: `app/__tests__/sitemap.test.ts`

**Interfaces:**
- Produces: `/sitemap.xml` and `/robots.txt` at build/runtime.

- [ ] **Step 1: Write the failing test**

Create `app/__tests__/sitemap.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import sitemap from '../sitemap'

describe('sitemap', () => {
  it('includes all five routes with the production domain', () => {
    const entries = sitemap()

    expect(entries).toHaveLength(5)
    const urls = entries.map((entry) => entry.url)
    expect(urls).toEqual([
      'https://colbyryan.com',
      'https://colbyryan.com/about',
      'https://colbyryan.com/experience',
      'https://colbyryan.com/education',
      'https://colbyryan.com/projects',
    ])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run app/__tests__/sitemap.test.ts
```

Expected: FAIL — `../sitemap` does not exist.

- [ ] **Step 3: Write sitemap.ts and robots.ts**

Create `app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'

const routes = ['', '/about', '/experience', '/education', '/projects']

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://colbyryan.com${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.7,
  }))
}
```

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://colbyryan.com/sitemap.xml',
  }
}
```

- [ ] **Step 4: Run the test again to verify it passes**

```bash
npx vitest run app/__tests__/sitemap.test.ts
```

Expected: PASS — 1 test passed.

- [ ] **Step 5: Verify the full app builds with the new routes**

```bash
npm run build
```

Expected: build succeeds; route summary includes `/sitemap.xml` and `/robots.txt`.

- [ ] **Step 6: Commit**

```bash
git add app/sitemap.ts app/robots.ts app/__tests__/sitemap.test.ts
git commit -m "Add sitemap and robots.txt"
```

---

## Task 15: README

**Files:**
- Create: `README.md` (overwrite the scaffold's default one)

**Interfaces:**
- None — documentation only.

- [ ] **Step 1: Write README.md**

```markdown
# colbyryan.com

Colby Ryan's personal site — Next.js (App Router) + TypeScript + Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Testing

```bash
npm test
```

Runs the Vitest + React Testing Library component suite.

## Building

```bash
npm run build
npm run start
```

## Deploying to Vercel

1. Push this repo to GitHub (already connected to `colbyryan2019/colbyryan-site`).
2. In the [Vercel dashboard](https://vercel.com/new), import the repo — Vercel auto-detects
   Next.js, no config needed.
3. After the first deploy, go to the project's **Settings → Domains** and add
   `colbyryan.com` (and `www.colbyryan.com` if desired).
4. Vercel shows the DNS records to add at your domain registrar — typically an `A` record
   for the apex domain and a `CNAME` for `www`. Add them there; Vercel issues an SSL
   certificate automatically once DNS propagates.
5. Every push to `main` redeploys to production automatically.
```

- [ ] **Step 2: Review it renders sensibly**

```bash
cat README.md
```

Expected: matches the content above.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Add README with local dev and Vercel deploy instructions"
```

---

## Task 16: Final verification pass

**Files:** none (verification only)

**Interfaces:** none

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: all tests pass (smoke + content + ThemeToggle + Nav + Footer + Hero + About + Experience + Education + Projects + sitemap).

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Run a full production build**

```bash
npm run build
```

Expected: build succeeds; route summary shows `/`, `/about`, `/experience`, `/education`, `/projects`, `/sitemap.xml`, `/robots.txt`.

- [ ] **Step 4: Manual smoke check**

```bash
npm run start
```

Open http://localhost:3000 in a browser. Click through all 5 nav links, toggle dark/light mode, click the resume link and both thesis PDF links, and confirm the headshot and company logos load. Stop the server (Ctrl+C) when done.

- [ ] **Step 5: Final commit (if anything changed during verification)**

```bash
git add -A
git commit -m "Final verification pass"
```

(Skip this step if nothing changed.)
