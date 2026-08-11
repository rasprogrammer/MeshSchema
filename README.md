# Schema Designer — AI-powered Database Schema Designer

A self-hosted, full-stack tool for designing database schemas in DBML, visualizing them as an ER diagram, and exporting to SQL/DBML/PNG/SVG — with an AI assistant and live multiplayer collaboration.

- **API**: Node.js 20 + Express + TypeScript + Prisma 7 + PostgreSQL 16
- **Realtime**: raw `ws` WebSocket server (no Socket.io) — presence, live cursors, DBML edit broadcast
- **Web**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + Zustand + Monaco Editor + XYFlow
- **AI**: Anthropic API (Claude), streaming (SSE) generation with diff-preview
- **Shared**: `@repo/database` (Prisma client) + `@repo/types` (WebSocket protocol + domain types)
- **Monorepo**: npm workspaces + Turborepo

## Quick start

### Prerequisites
- Node.js 20+
- Docker Desktop (for Postgres)
- An Anthropic API key (for AI features — everything else works without one)

### 1. Install
```bash
npm install
```

### 2. Configure env
```bash
cp apps/api/.env.example apps/api/.env
cp apps/ws/.env.example apps/ws/.env
cp apps/web/.env.local.example apps/web/.env.local
```
Set `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` and `ANTHROPIC_API_KEY` in `apps/api/.env`. `apps/ws/.env`'s `JWT_ACCESS_SECRET` must match `apps/api/.env` exactly — both verify the same access token. To enable Google/GitHub OAuth, set the corresponding client id/secret (a provider is skipped if its client id is blank).

### 3. Start infrastructure (Postgres)
```bash
npm run db:up
```
- Postgres → `localhost:5432`

### 4. Run migrations + generate the Prisma client
```bash
npx prisma migrate dev --schema=packages/database/prisma/schema.prisma --name init
npm run generate
```

### 5. Start the apps (in parallel)
```bash
npm run dev
```
- Web → http://localhost:3000
- API → http://localhost:4000/api/v1
- WebSocket → ws://localhost:4001

### Demo credentials
None included — there's no seed script yet. Register an account at http://localhost:3000/register to get started.

## Common scripts

| Script | Description |
|---|---|
| `npm run dev` | Run web + api + ws in parallel (Turborepo) |
| `npm run build` | Build all apps and packages, dependency-ordered |
| `npm run test` | Unit tests across every workspace |
| `npm run test:e2e` | Playwright e2e (requires api + ws + web running) |
| `npm run lint` / `npm run check-types` | Lint / typecheck every workspace |
| `npm run db:up` / `npm run db:down` | Start/stop the Postgres container |
| `npm run db:migrate` | Apply Prisma migrations (dev) |
| `npm run db:deploy` | Apply Prisma migrations (deploy, non-interactive) |
| `npm run generate` | Regenerate the Prisma client into `packages/database` |

## Implemented requirement coverage

Full spec in [`docs/requirements-master.md`](./docs/requirements-master.md) (MVP → Tier 1 → Tier 2, status-tagged). MVP is fully wired:

- **Auth**: Email/password, Google + GitHub OAuth, JWT (15m access / 7d refresh, rotating, revocable), TOTP 2FA with a single-purpose `aud: "2fa-pending"` token rejected by both the REST API and the WebSocket server, httpOnly/sameSite session cookies.
- **Projects**: Create/rename/delete, starter templates.
- **Schema Editor**: Monaco with custom DBML language definition, autosave, undo/redo across AI edits, linear version snapshots.
- **ER Diagram**: Client-side DBML parsing (`@dbml/core`) for instant live preview, XYFlow canvas with dagre auto-layout.
- **Export**: SQL, DBML, PNG, SVG.
- **AI**: Generate/improve via the Anthropic API, SSE streaming, accept/reject diff-preview before anything is applied — never an instant write.
- **Collaboration**: Presence + live cursors + DBML edit broadcast over `apps/ws`, a raw WebSocket server with room-per-project, authenticated off the same httpOnly cookie as the REST API, heartbeat-based dead-connection reaping, graceful shutdown.
- **Quality/DevOps**: Turborepo monorepo, Vitest unit tests, Playwright e2e, GitHub Actions CI (lint → typecheck → test → build → e2e) with a Postgres service container.

## Key decisions

| # | Decision |
|---|---|
| D-01 | Realtime transport: **raw `ws`**, not Socket.io — room manager modeled on `narsixyz/cosketch` |
| D-02 | WebSocket auth: **same httpOnly `access_token` cookie** as the REST API (handshake is a plain HTTP request, so the browser attaches it automatically) — no token in the connection URL |
| D-03 | Prisma client: **shared `@repo/database` package**, one schema for `apps/api` and `apps/ws` instead of two copies |
| D-04 | Module system: **CommonJS** across `apps/api`, `apps/ws`, and both shared packages, to avoid ESM/CJS interop issues in a mixed monorepo |
| D-05 | Component library: **shadcn/ui only** — Radix primitives + `class-variance-authority`, no MUI/Ant/Chakra |
| D-06 | Document sync: **last-write-wins** on DBML broadcast for v1; CRDT/OT is tracked as a Tier 2 item, not built yet |
| D-07 | Schema version history: **linear snapshots**, no branching/merge UI yet (also Tier 2) |

## Architecture

```
schema-designer/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   ├── api/           # Express REST API (port 4000)
│   └── ws/             # WebSocket server (port 4001)
├── packages/
│   ├── database/      # Prisma schema + shared client
│   ├── types/           # Shared WebSocket protocol + domain types
│   ├── typescript-config/
│   └── eslint-config/
├── docs/
│   └── requirements-master.md
└── docker-compose.yml
```

## Security highlights
- Passwords hashed with **bcrypt cost 10**.
- JWT access tokens are short-lived (15m); refresh tokens rotate on each use and are stored server-side so they're revocable.
- Refresh tokens delivered as **httpOnly, sameSite cookies** — never exposed to JS.
- TOTP 2FA: the post-login `2fa-pending` token is rejected as an access token by both `requireAuth` (REST) and `authenticateConnection` (WebSocket) even if it leaks.
- OAuth via Passport with `session: false` — provider tokens never reach the browser.
- `helmet`, CORS limited via `CORS_ORIGIN`, auth-endpoint rate limiting (20 req / 15 min).
- WebSocket connections are origin-checked against `CORS_ORIGIN` as a defense-in-depth layer on top of the per-connection JWT check.