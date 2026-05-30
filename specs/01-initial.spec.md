# Plan: Linktree for Musicians (Node.js + SQLite)

A single-page-feel Node.js web app where each musician has a public profile page (`/u/:slug`) showing their photo, bio, and a list of links (Spotify, YouTube, shows, merch, etc.). REST API backs all data, SQLite for storage, server-rendered HTML + Bootstrap 5 + jQuery on the frontend with an "Apple-like" minimal aesthetic (lots of whitespace, SF-style system fonts, subtle blur/translucency, soft shadows, rounded corners). No auth — any visitor can create/edit artists and links via an admin UI at `/admin`.

## Steps

1. **Project scaffold** — `npm init`, install `express`, `better-sqlite3`, `nanoid` (slug/id), `morgan` (logs). Add `package.json` scripts (`start`, `dev` via `node --watch`). Create folder layout: `src/` (server), `src/db/`, `public/` (static assets), `views/` (HTML templates).
2. **Database layer** — `src/db/index.js` opens `data.db` via `better-sqlite3` and runs schema migration on boot. Tables: `artists(id, slug UNIQUE, name, tagline, bio, avatar_url, theme, created_at)` and `links(id, artist_id FK, label, url, icon, sort_order, created_at)`. Add a `seed.js` with 1–2 example artists.
3. **REST API** — `src/routes/api.js` mounted at `/api`:
   - `GET /api/artists`, `POST /api/artists`, `GET /api/artists/:slug`, `PATCH /api/artists/:id`, `DELETE /api/artists/:id`
   - `GET /api/artists/:id/links`, `POST /api/artists/:id/links`, `PATCH /api/links/:id`, `DELETE /api/links/:id`, `POST /api/links/reorder` (array of `{id, sort_order}`)
   - JSON in/out, input validation (required fields, URL format, slug regex), proper status codes, centralized error handler.
4. **Public profile page** — `GET /u/:slug` renders `views/profile.html` server-side (simple string template or `res.sendFile` + client-side fetch). Layout: centered column, circular avatar, name, tagline, stacked full-width link "pills". *Parallel with step 5.*
5. **Admin UI** — `GET /admin` lists artists with "New artist" button; `GET /admin/:slug` edits artist fields and manages links (add/edit/delete/drag-reorder using jQuery UI sortable or SortableJS). All actions hit the REST API via `$.ajax`. *Parallel with step 4.*
6. **Apple-like styling** — `public/css/app.css` on top of Bootstrap 5 CDN:
   - System font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text", ...`)
   - Design tokens as CSS custom properties (`--bg`, `--surface`, `--text`, `--muted`, `--accent`, `--radius-lg: 18px`, `--shadow-sm`)
   - Light/dark via `prefers-color-scheme`
   - Translucent nav with `backdrop-filter: blur(20px)`, soft shadows, generous spacing, 17px base body text, large tight-tracked headings
   - Link pills: full-width, `border-radius: 14px`, subtle hover lift (`transform: translateY(-1px)`, shadow increase, 150ms ease)
   - Visible `:focus-visible` rings, ≥44px touch targets, semantic `<main>`/`<nav>`/`<section>` per design standards instruction
7. **Polish & docs** — root redirect `/` → `/admin`, 404 page, basic `helmet` headers, update `README.md` with run instructions, add `data.db` to `.gitignore`.

## Relevant files (all new)

- [package.json](package.json) — deps and scripts
- [src/server.js](src/server.js) — Express app, static middleware, route mounting
- [src/db/index.js](src/db/index.js) — SQLite connection + schema
- [src/db/seed.js](src/db/seed.js) — sample data
- [src/routes/api.js](src/routes/api.js) — REST endpoints
- [src/routes/pages.js](src/routes/pages.js) — `/u/:slug`, `/admin`, `/admin/:slug`
- [views/profile.html](views/profile.html), [views/admin-list.html](views/admin-list.html), [views/admin-edit.html](views/admin-edit.html)
- [public/css/app.css](public/css/app.css) — design tokens + Apple-like styling
- [public/js/admin.js](public/js/admin.js), [public/js/profile.js](public/js/profile.js) — jQuery + AJAX
- [README.md](README.md) — usage
- [.gitignore](.gitignore)

## Verification

1. `npm start` boots without error; visiting `/` redirects to `/admin`.
2. Create an artist via admin UI → appears in list; profile resolves at `/u/:slug` with correct content.
3. Add 3 links, drag-reorder → reload profile, order persists.
4. Hit each API endpoint with `curl` and confirm JSON shapes + status codes (404 on missing slug, 400 on invalid URL, 409 on duplicate slug).
5. DevTools Lighthouse on a profile page: Accessibility ≥ 95, no contrast or touch-target violations; tab through admin form and confirm visible focus rings.
6. Toggle OS light/dark mode → theme follows; resize to 375px width → layout remains single-column with no horizontal scroll.

## Decisions

- **Server-rendered HTML templates** (no SPA framework) — keeps jQuery the primary client lib as requested.
- **`better-sqlite3`** over `sqlite3` — synchronous API, simpler code, no callback noise.
- **No auth** — admin UI is fully open; clearly noted in README as dev-only.
- **Excluded:** user accounts, analytics, custom themes per artist beyond a single `theme` column placeholder, file uploads (avatar is a URL field), tests, deployment config.

## Further Considerations

1. **Avatar handling** — recommend URL-only (Option A) for v1; Option B = multer file upload to `public/uploads/`; Option C = both. *Recommend A.*
2. **Templating engine** — recommend plain HTML files + client fetch for profile (Option A, keeps stack minimal); Option B = EJS for true server-side rendering. *Recommend A.*
3. **Per-artist theming** — recommend a `theme` column storing one of `{light, dark, auto}` now and defer custom accent colors. OK to skip entirely if you'd prefer.
