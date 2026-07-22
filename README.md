# BBAlliance — bballiance.org.uk

The website for **BBAlliance**, a community charity in Blackburn with Darwen, Lancashire.
One application, zero subscription costs: a [Next.js](https://nextjs.org) site with
[Payload CMS 3](https://payloadcms.com) embedded in it — the public site and the admin panel
(`/admin`) deploy together.

Everything on the site is editable by non-technical administrators through the admin panel:
pages, menus, settings, images, forms, colours. If you're a trustee or editor, you want
**[ADMIN-GUIDE.md](./ADMIN-GUIDE.md)** — this file is for developers.

Design decisions (palette, type, the weave motif) are recorded in **[DESIGN.md](./DESIGN.md)**.

## Quick start

```bash
pnpm install
cp .env.example .env        # defaults work for local dev — SQLite, console email
pnpm seed                   # creates the database and fills it with demo content
pnpm dev                    # http://localhost:3000  (admin at /admin)
```

Demo sign-ins created by the seed (password `bballiance-demo`, or whatever
`SEED_ADMIN_PASSWORD` is set to — **change these in production**):

| Email                          | Role        |
| ------------------------------ | ----------- |
| admin@bballiance.org.uk        | Admin       |
| editor@bballiance.org.uk       | Editor      |
| contributor@bballiance.org.uk  | Contributor |

The seed **replaces all content** (users are kept) and marks every invented fact
`[PLACEHOLDER — replace]` so the charity can spot what needs real details.

## Environment variables

| Variable                 | Required | Purpose |
| ------------------------ | -------- | ------- |
| `DATABASE_URI`           | yes      | `file:./bba.db` (SQLite, local dev) **or** `postgres://…` (production). The adapter switches automatically on the URL scheme. |
| `PAYLOAD_SECRET`         | yes      | Long random string; encrypts sessions. |
| `NEXT_PUBLIC_SERVER_URL` | yes      | Public URL, no trailing slash (e.g. `https://bballiance.org.uk`). Used for CORS, canonical links, sitemaps, emails. |
| `CRON_SECRET`            | prod     | Authorises the scheduled-publish job endpoint (`Authorization: Bearer …`). |
| `PREVIEW_SECRET`         | prod     | Validates live-preview/draft links. |
| `RESEND_API_KEY`         | optional | Email route A: [Resend](https://resend.com). |
| `SMTP_HOST/PORT/USER/PASS` | optional | Email route B: any SMTP provider. If neither route is set, emails print to the server console (dev). |
| `EMAIL_FROM`, `EMAIL_FROM_NAME` | optional | Transactional from-address (must be permitted by your provider). |
| `SEED_ADMIN_PASSWORD`    | optional | Password for the demo users the seed creates. |
| `POSTGRES_PASSWORD`      | docker   | Password for the bundled Postgres in `docker-compose.yml`. |

## Stack

- **Next.js 16** (App Router, TypeScript strict) + **Payload CMS 3.86** in one app
- **Tailwind CSS 4** with the BBAlliance token system (see `src/app/(frontend)/globals.css`)
- **Framer Motion** for animation (globally reduced-motion aware)
- **React Hook Form + Zod** for forms (client *and* server validation)
- Payload plugins: SEO, Form Builder, Redirects, Search
- Email: Resend or Nodemailer (SMTP), env-driven
- DB: SQLite (dev) / Postgres (production) via one env var

### Project structure (the short version)

```
src/
  payload.config.ts       # everything registers here
  collections/            # Pages, News, Projects, People, Vacancies, Events,
                          # Appeals, Testimonials, Partners, FAQs, Documents,
                          # JobApplications (+ private CVUploads), Subscribers,
                          # ActivityLog, Users, Media
  globals/                # Site Identity, Contact, Appearance, Announcement Bar,
                          # Donation, Email, SEO, Custom Code, Cookies, Maintenance
  blocks/                 # the layout-builder blocks (config + component each)
  app/(frontend)/         # public routes
  app/(payload)/          # the admin panel + API
  design/                 # palette tokens + WCAG contrast maths
  endpoints/seed/         # demo content
  scripts/                # seed.ts, backup.ts
```

## Database story

- **Local dev**: SQLite (`DATABASE_URI=file:./bba.db`). Schema changes push
  automatically in dev mode — no migrations needed.
- **Production (Postgres)**: use Payload's migration workflow rather than dev push:

  ```bash
  pnpm payload migrate:create   # after changing collections/globals
  pnpm payload migrate          # on deploy, before starting the app
  ```

## Deployment

### Path A — Vercel + Neon/Supabase Postgres

1. Create a Postgres database (Neon or Supabase free tier is fine) and copy the
   connection string.
2. Import the repo into Vercel. Framework preset: Next.js. Build command `pnpm build`.
3. Set the environment variables from the table above (`DATABASE_URI` = the Postgres URL,
   `NEXT_PUBLIC_SERVER_URL` = `https://bballiance.org.uk`).
4. Add a Vercel Cron job hitting `/api/payload-jobs/run` every 5 minutes with the
   `Authorization: Bearer $CRON_SECRET` header — this is what makes **scheduled
   publishing** fire.
5. Run the seed once against the production database if you want the starter content:
   `DATABASE_URI=postgres://… pnpm seed`

> Note on uploads: on Vercel the filesystem is ephemeral. For production use, add a
> Payload storage adapter (e.g. `@payloadcms/storage-vercel-blob` or S3) for the
> `media`, `documents` and `cv-uploads` collections — a small, well-documented change in
> `payload.config.ts`. The VPS route below needs no such change.

### Path B — VPS with Docker

`docker-compose.yml` ships the app plus Postgres, with named volumes for uploads:

```bash
cp .env.example .env         # set PAYLOAD_SECRET, POSTGRES_PASSWORD, NEXT_PUBLIC_SERVER_URL
docker compose up -d --build
docker compose exec app node --import tsx/esm -r dotenv/config src/scripts/seed.ts   # once
```

Put a reverse proxy (Caddy/nginx) in front for TLS.

### Connecting bballiance.org.uk

- **Vercel**: Project → Settings → Domains → add `bballiance.org.uk` and `www.` →
  follow the DNS instructions (A record `76.76.21.21` / CNAME `cname.vercel-dns.com`).
- **VPS**: point an A record at the server, terminate TLS at the reverse proxy.
- Either way, set `NEXT_PUBLIC_SERVER_URL=https://bballiance.org.uk` and redeploy —
  sitemaps, canonical URLs and emails all key off it.

## Backups & restore

```bash
pnpm backup
```

Writes `backups/<timestamp>/` containing the database (SQLite file copy or `pg_dump`
output), a `media-manifest.json`, and copies of `public/media`, `public/documents` and
`private-uploads` (CVs).

Schedule it (VPS example, daily at 02:30):

```cron
30 2 * * * cd /srv/bballiance && pnpm backup >> /var/log/bba-backup.log 2>&1
```

**Restore**: stop the app; SQLite — copy the `.db` file back; Postgres —
`psql $DATABASE_URI < backups/<ts>/database.sql`; copy the three upload folders back;
start the app.

## Tests

```bash
pnpm test:int   # vitest — form validation, WCAG contrast of every accent option, API
pnpm test:e2e   # Playwright — public page smoke tests, admin login/edit flow,
                # and an axe-core WCAG 2.2 AA scan of key pages
pnpm test       # both
```

## Troubleshooting

- **`payload run` exits silently** in some sandboxed/non-TTY environments — this is why
  `pnpm seed`/`pnpm backup` invoke `node --import tsx/esm` directly. Use the pnpm scripts.
- **"Error hitting revalidate route" warnings during `pnpm seed`** are normal when the
  dev server isn't running — the seed disables revalidation but Next may still log.
- **Build fails with "no such table"**: the database schema is behind the code. In dev,
  start `pnpm dev` once (auto-push) or re-run `pnpm seed`; in production run
  `pnpm payload migrate`.
- **Fonts fail to download at build time**: `next/font` fetches Bricolage Grotesque and
  Figtree from Google at build (then self-hosts them — no runtime requests). Build
  machines need outbound HTTPS.

## Known deferral

Payload **localization is fully wired** (English default, Urdu scaffolded, all public
text fields localized, RTL flagged) — translating content is a pure admin task. The
public-site language *switcher* is intentionally not exposed yet: enabling it means
adding a `[locale]` route segment, which we've kept out of scope until real translated
content exists. The Appearance setting "Show language switcher" is the hook for it.
