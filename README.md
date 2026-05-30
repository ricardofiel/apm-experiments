# apm-experiments

## Musician Linktree

A "linktree for musicians" — a lightweight Node.js app with a SQLite backend, JSON REST API, and an Apple-inspired HTML+Bootstrap+jQuery frontend. No build step, no authentication required (localhost only).

> ⚠️ **No authentication** — do not expose this server to the public internet.

### Prerequisites

- Node.js 20 LTS or later

### Install & run

```sh
npm install

# Start (production-like)
npm start

# Start with seed data (inserts demo artist "jane-doe")
SEED=1 npm start

# Development (auto-reload via nodemon)
npm run dev

# Seed only (without starting server)
node scripts/seed.js
```

Server binds to `http://127.0.0.1:3000` by default. Override with `PORT` and `HOST` environment variables.

### Pages

| Path | Description |
|------|-------------|
| `/` | Admin console |
| `/admin` | Admin console (alias) |
| `/:handle` | Public artist landing page |

### API Reference

All responses are JSON. Errors return `{ "error": { "code": "...", "message": "..." } }`.

#### Artists

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/artists` | List all artists |
| `POST` | `/api/artists` | Create artist — body: `{ handle, displayName, bio?, avatarUrl? }` |
| `GET` | `/api/artists/:handle` | Get single artist |
| `PATCH` | `/api/artists/:handle` | Update artist — body: any subset of create fields |
| `DELETE` | `/api/artists/:handle` | Delete artist and all links |

#### Links

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/artists/:handle/links` | List links ordered by position |
| `POST` | `/api/artists/:handle/links` | Add link — body: `{ label, url, icon? }` |
| `PATCH` | `/api/links/:id` | Update link — body: `{ label?, url?, icon? }` |
| `DELETE` | `/api/links/:id` | Delete link |
| `POST` | `/api/artists/:handle/links/reorder` | Reorder — body: `{ order: [id, id, …] }` |

#### Handle rules

- Pattern: `/^[a-z0-9][a-z0-9\-_]{1,29}$/`
- Reserved (cannot be used): `api`, `admin`, `assets`, `css`, `js`