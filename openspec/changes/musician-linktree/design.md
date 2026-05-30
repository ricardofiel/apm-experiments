## Context

The repository currently contains no application code — only OpenSpec scaffolding. We are introducing a small, self-contained Node.js web app: a "linktree for musicians" with an Apple-inspired UI. It must be runnable locally with a single `npm install && npm start`, persist data in SQLite, expose a JSON REST API, and serve a public landing page plus a basic admin console. No authentication is in scope for this iteration, so the design intentionally avoids accounts, sessions, or per-user authorization.

## Goals / Non-Goals

**Goals:**
- Single-process Node.js server (Express) that serves both the JSON API and the static frontend.
- File-backed SQLite database with a deterministic startup migration, suitable for local dev and easy backup (single `.db` file).
- REST API that supports listing/getting an artist by handle, and full CRUD on artists and their links.
- Public, mobile-first landing page at `/:handle` that looks and feels "Apple-like": SF-style system font stack, light/dark adaptive palette, generous spacing, soft shadows, rounded corners, subtle translucency.
- Minimal admin UI at `/admin` for creating/editing/deleting artists and their links (drag-free reorder via up/down buttons is acceptable).
- HTML + Bootstrap 5 + jQuery on the client (no SPA framework, no build step).

**Non-Goals:**
- Authentication, authorization, multi-tenant isolation, or rate limiting.
- Analytics, click tracking, or custom domains.
- Image uploads to object storage — avatars are referenced by URL only.
- Server-side rendering of the landing page beyond a static HTML shell; data is fetched via API.
- Production hardening (HTTPS termination, secrets management, deploy pipeline).

## Decisions

### 1. Express over Fastify/Koa/Nest
Express is the most widely known minimal Node web framework and is sufficient for ~10 endpoints. Alternatives (Fastify: faster but more ceremony; Nest: too heavyweight for this scope) offer no benefit at this size.

### 2. `better-sqlite3` over `sqlite3`
`better-sqlite3` is synchronous, single-dependency, and dramatically simpler for a single-process app: no callback/promise wrapping, prepared statements are first-class, and it handles migrations cleanly. The async `sqlite3` package's only advantage (non-blocking I/O) is irrelevant at this traffic level. Trade-off: native build step on install, which is acceptable for a local dev tool.

### 3. Schema: two tables, integer PKs, ordered links
```
artists(id INTEGER PK, handle TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL,
        bio TEXT, avatar_url TEXT, created_at TEXT, updated_at TEXT)

links(id INTEGER PK, artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
      label TEXT NOT NULL, url TEXT NOT NULL, icon TEXT, position INTEGER NOT NULL,
      created_at TEXT, updated_at TEXT)
```
`handle` is the public URL slug (`/:handle`). `position` is a simple integer used for ORDER BY; reordering rewrites the affected rows in one transaction. Considered using a fractional rank — rejected as over-engineered for expected list sizes (<50 links/artist).

### 4. API shape: REST, JSON, no versioning prefix
- `GET    /api/artists`
- `POST   /api/artists`
- `GET    /api/artists/:handle`
- `PATCH  /api/artists/:handle`
- `DELETE /api/artists/:handle`
- `GET    /api/artists/:handle/links`
- `POST   /api/artists/:handle/links`
- `PATCH  /api/links/:id`
- `DELETE /api/links/:id`
- `POST   /api/artists/:handle/links/reorder` — body `{ order: [linkId, ...] }`

No `/v1` prefix — single internal consumer, can rename later. Errors are returned as `{ error: { code, message } }` with appropriate HTTP status.

### 5. Frontend: static HTML + Bootstrap 5 + jQuery, no build
Per requirements. Bootstrap and jQuery loaded via CDN. Apple-like aesthetic implemented in a custom `public/css/apple.css` layered on top of Bootstrap: overrides typography (SF-system stack), increases border-radius, softens shadows, uses `prefers-color-scheme` for dark mode, and uses `backdrop-filter` for a translucent top bar. No CSS preprocessor.

### 6. Routing
- `GET /` → admin console (`public/admin.html`) for this iteration; later can become a marketing page.
- `GET /admin` → same admin console.
- `GET /:handle` → serves `public/artist.html`, which calls `GET /api/artists/:handle` and `GET /api/artists/:handle/links` on load. Reserved paths (`api`, `admin`, `assets`, `css`, `js`) are excluded.

### 7. Validation
Lightweight manual validation in route handlers (handle regex `^[a-z0-9][a-z0-9-_]{1,29}$`, URL parsed with `new URL()`, required-field checks). A schema library (zod/joi) is unnecessary at this size.

## Risks / Trade-offs

- **No auth means anyone can edit any artist** → Mitigation: documented as intentional for this iteration; bind server to `127.0.0.1` by default and call out in README that it is not production-safe.
- **`better-sqlite3` native build can fail on some platforms** → Mitigation: document Node 20 LTS requirement and `node-gyp` prerequisites; fallback to `sqlite3` is left as a future option.
- **No CSRF protection on admin mutations** → Mitigation: acceptable given no-auth scope and local binding; revisit when auth is added.
- **Apple-like design is subjective and trademark-adjacent** → Mitigation: use only generic system font stacks and our own CSS; avoid Apple logos, SF Pro font files, or copied iOS components.
- **Single-file SQLite limits concurrent writers** → Acceptable: target is a single small instance; enable WAL mode to reduce contention.

## Migration Plan

This is a greenfield addition; no existing data or routes to migrate. Deployment is `npm install && npm start`, which:
1. Creates `data/` if missing.
2. Opens/creates `data/app.db`.
3. Runs the schema migration (idempotent `CREATE TABLE IF NOT EXISTS`).
4. Optionally seeds demo data when `SEED=1`.

Rollback: delete the `data/app.db` file and the new source tree; no other systems are touched.

## Open Questions

- Should the admin console live at `/` long-term, or should `/` become a marketing/landing page once auth is added? (Deferred — out of scope.)
- Do we want a `slug`-based public path for individual links (`/:handle/:linkSlug`) for share previews? (Deferred — current scope ships only the aggregate page.)
