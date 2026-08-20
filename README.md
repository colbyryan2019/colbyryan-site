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
