## 1. Project setup

- [x] 1.1 Initialize Node project: `package.json` with `start`, `dev`, `seed` scripts; pin Node 20 LTS in `engines`
- [x] 1.2 Install runtime deps: `express`, `better-sqlite3`, `morgan`
- [x] 1.3 Install dev dep: `nodemon`
- [x] 1.4 Add `.gitignore` (node_modules, data/*.db, .env)
- [x] 1.5 Create top-level layout: `src/`, `public/`, `public/css/`, `public/js/`, `data/`, `scripts/`

## 2. Database layer

- [x] 2.1 Add `src/db.js` that opens `data/app.db`, enables `journal_mode=WAL` and `foreign_keys=ON`
- [x] 2.2 Add `src/migrate.js` with idempotent `CREATE TABLE IF NOT EXISTS` for `artists` and `links` matching the design schema
- [x] 2.3 Wire migrate to run on server start
- [x] 2.4 Add `scripts/seed.js` that inserts one demo artist with 4–5 demo links when `SEED=1` or when run directly

## 3. Domain modules

- [x] 3.1 Add `src/repositories/artistsRepo.js` with `list`, `getByHandle`, `create`, `updateByHandle`, `deleteByHandle` using prepared statements
- [x] 3.2 Add `src/repositories/linksRepo.js` with `listByArtistId`, `create`, `updateById`, `deleteById`, `reorderForArtist` (transactional)
- [x] 3.3 Add `src/validation.js` with handle regex, URL parser check, and required-field helpers; return `{ ok, error }` shape

## 4. HTTP API

- [x] 4.1 Add `src/app.js` Express app with `express.json()`, `morgan`, and a JSON error handler returning `{ error: { code, message } }`
- [x] 4.2 Mount `src/routes/artists.js` covering `GET/POST /api/artists`, `GET/PATCH/DELETE /api/artists/:handle` (artist-profile spec)
- [x] 4.3 Mount `src/routes/links.js` covering `GET/POST /api/artists/:handle/links`, `PATCH/DELETE /api/links/:id`, `POST /api/artists/:handle/links/reorder` (artist-links spec)
- [x] 4.4 Reserve `api`, `admin`, `assets`, `css`, `js` so they cannot be used as artist handles or matched by the public landing route
- [x] 4.5 Add `src/server.js` that loads config (PORT, default `127.0.0.1`), runs migrate, starts the server

## 5. Static frontend shells

- [x] 5.1 Add `public/artist.html` landing-page shell: meta viewport, Bootstrap 5 + jQuery via CDN, links to `css/apple.css` and `js/artist.js`
- [x] 5.2 Add `public/admin.html` admin-console shell with artist list pane, artist edit form, and link list/edit form
- [x] 5.3 Add server route `GET /:handle` to serve `public/artist.html` (excluding reserved paths) and `GET /` + `GET /admin` to serve `public/admin.html`

## 6. Apple-inspired styling

- [x] 6.1 Add `public/css/apple.css`: SF-style system font stack, generous spacing, 12–16 px button radius, soft shadows, circular avatar
- [x] 6.2 Add light/dark adaptive palette via `@media (prefers-color-scheme: dark)`
- [x] 6.3 Add subtle translucent top bar using `backdrop-filter: saturate(180%) blur(20px)`
- [x] 6.4 Verify link buttons render at ≥ 44 × 44 CSS px and full-width on mobile

## 7. Landing-page client logic

- [x] 7.1 Add `public/js/artist.js`: read handle from `location.pathname`, fetch artist + links via `$.ajax`
- [x] 7.2 Render avatar, display name, bio, and link buttons (links open in new tab with `rel="noopener noreferrer"`)
- [x] 7.3 Render loading, "Artist not found", and "No links yet" states per spec

## 8. Admin client logic

- [x] 8.1 Add `public/js/admin.js`: load artist list, support selection
- [x] 8.2 Implement create / edit / delete artist forms wired to the API
- [x] 8.3 Implement add / edit / delete link forms wired to the API
- [x] 8.4 Implement move-up / move-down reorder with optimistic UI and rollback on API failure
- [x] 8.5 Add persistent "Unauthenticated mode — do not expose this server to the public internet." banner
- [x] 8.6 Add dismissable Bootstrap alert that surfaces API `error.message` on any non-2xx response

## 9. Documentation

- [x] 9.1 Update `README.md` with prerequisites (Node 20), install / start / seed commands, and a clear "no auth, localhost only" warning
- [x] 9.2 Document the API endpoints in the README (method, path, request/response shape, error codes)

## 10. Manual verification

- [x] 10.1 Run `npm install && SEED=1 npm start`; confirm `data/app.db` is created and seeded
- [x] 10.2 Open `/jane-doe` (seeded handle) in a 360-px-wide viewport and verify the Apple-style landing page renders with tappable link buttons
- [x] 10.3 Open `/admin`, create a new artist + 3 links, reorder them, edit one, delete one — verify all changes round-trip via the API
- [x] 10.4 Verify dark mode by toggling OS color scheme
- [x] 10.5 Verify reserved paths (`/api`, `/admin`, `/css`, `/js`, `/assets`) are not treated as artist handles
