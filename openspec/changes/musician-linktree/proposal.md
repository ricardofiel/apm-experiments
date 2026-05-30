## Why

Musicians need a single, mobile-friendly landing page to share streaming, social, booking, and merch links with fans, but most existing "linktree" tools are generic and visually noisy. A purpose-built, minimalist app — with an Apple-inspired aesthetic — gives musicians a polished home for their links without the clutter or per-feature paywalls of mainstream tools.

## What Changes

- Add a Node.js (Express) backend serving JSON API endpoints and static assets.
- Add a SQLite database (single-file, file-backed) with tables for `artists` and `links`.
- Add REST API endpoints for reading artist profiles and links, and for creating/updating/deleting artists and links (no authentication in this iteration).
- Add a public artist page rendered with server-served HTML + Bootstrap 5 + jQuery that fetches data via the API and displays the artist's avatar, name, bio, and tap-friendly link buttons.
- Add a minimal admin page (HTML + Bootstrap + jQuery) for managing artists and their links via the API.
- Add an "Apple-like" visual layer: SF-style system font stack, generous spacing, subtle blur/translucency, soft shadows, rounded corners, light/dark adaptive palette.
- Add a seeded SQLite schema and a small demo dataset for local development.

## Capabilities

### New Capabilities
- `artist-profile`: Stores and serves a musician's public profile (handle, display name, bio, avatar) used by the public landing page.
- `artist-links`: Stores and serves the ordered list of external links (label, URL, icon, position) attached to an artist.
- `public-landing-page`: Renders the public, mobile-first "Apple-like" landing page that displays an artist's profile and link buttons.
- `admin-console`: Provides an unauthenticated browser UI to create, update, reorder, and delete artists and their links via the API.

### Modified Capabilities
<!-- None: no existing specs in this workspace. -->

## Impact

- New runtime dependency on Node.js 20+ and npm.
- New libraries: `express`, `better-sqlite3` (or `sqlite3`), `morgan` (logging). Frontend pulls Bootstrap 5 and jQuery via CDN.
- New `data/app.db` SQLite file created on first run; schema applied via a startup migration script.
- New top-level project layout (`src/`, `public/`, `data/`, `scripts/`) introduced into the repo.
- No authentication, no external services, no CI/CD changes in this change.
