# Schema Designer — Master Requirements (MVP → Tier 1 → Tier 2)

> **Update:** the codebase has been converted to a Turborepo monorepo
> (`apps/web`, `apps/api`, `apps/ws`, `packages/database`, `packages/types`)
> and the real-time layer has been rewritten from Socket.io to a plain `ws`
> WebSocket server (`apps/ws`), following the room/presence pattern used by
> [narsixyz/cosketch](https://github.com/narsixyz/cosketch). The §7
> Collaboration section below is written against the **new** WebSocket
> architecture — "current state" bullets describe what `apps/ws` does today
> (single-instance, in-memory rooms, last-write-wins broadcast), and the
> Tier 2 items (CRDT, horizontal scaling, offline-first) are what would be
> layered on top of it next, not a return to Socket.io.

This is the single, structured requirements spec for the project, combining:

- **Tier 0 — MVP (Implemented)**: what exists in the codebase today, per the
  README and source tree.
- **Tier 1 — Roadmap (Planned)**: the near-term items from
  `docs/requirements.md`. Most are CRUD/config-shaped and buildable directly
  on the current architecture.
- **Tier 2 — Advanced (Hard)**: architecturally hard problems — real
  algorithmic or distributed-systems work, not just more endpoints.

Each requirement is tagged **[MVP]**, **[T1]**, or **[T2]**, so status is
visible without cross-referencing three documents. Sections are organized by
feature domain so related work — regardless of tier — stays together.

---

## 1. Authentication & Users

- [x] **[MVP]** Email/password registration and login
- [x] **[MVP]** JWT auth: short-lived access tokens (15m) + rotating refresh
      tokens (7d), stored server-side so they're revocable
- [x] **[MVP]** httpOnly, sameSite session cookies — no token handling in
      client JS, closing the localStorage XSS token-theft vector
- [x] **[MVP]** Silent token refresh via axios response interceptor on 401
- [x] **[MVP]** OAuth login: Google and GitHub (Passport, `session: false`;
      provider tokens never reach the browser)
- [x] **[MVP]** Optional TOTP 2FA: login returns a single-purpose,
      `aud: "2fa-pending"` token that `requireAuth` explicitly rejects, so it
      can't be replayed as a real session even if leaked
- [ ] **[T1]** Email verification on register (token-based confirmation link)
- [ ] **[T1]** Password reset via magic link
- [ ] **[T1]** Session management: list active sessions/devices, revoke
      individual refresh tokens
- [ ] **[T1]** Profile settings: name, avatar, change password
- [ ] **[T2]** Enterprise SSO: SAML 2.0 and/or OIDC per organization —
      **use a battle-tested library, never hand-roll SAML XML signature
      validation** (a well-known source of real auth-bypass CVEs)
- [ ] **[T2]** Organization → project role hierarchy, with an explicit,
      written precedence rule for org role vs. project role before any code
      is written
- [ ] **[T2]** JIT provisioning/deprovisioning tied to the IdP, so removal
      from the IdP revokes access without a manual step

## 2. Projects

- [x] **[MVP]** Create / rename / delete projects
- [x] **[MVP]** Starter templates (e.g. e-commerce, SaaS multi-tenant, blog)
      to create a project from
- [ ] **[T1]** Per-project collaborator invites by email — **viewer** /
      **editor** roles only (no orgs, no RBAC matrix)
- [ ] **[T1]** Duplicate / fork a project
- [ ] **[T1]** Soft delete with a trash/restore view instead of hard delete
- [ ] **[T1]** Dashboard search, sort, and favorite/pin projects
- [ ] **[T2]** Field/table-level edit locks ("checkout" a table), enforced
      on **both** REST and the Socket.io gateway, auto-released on
      disconnect/timeout
- [ ] **[T2]** Comment-only role vs. edit role enforced server-side; a
      permission downgrade must reject an *already in-flight* edit from a
      connected client, not just hide the UI control

## 3. Schema Editor

- [x] **[MVP]** Monaco-based DBML editor with custom language definition
- [x] **[MVP]** Autosave with save-status indicator
- [x] **[MVP]** DBML is the single source of truth; `SchemaVersion` rows are
      linear snapshots on manual saves and AI edits
- [x] **[MVP]** Undo/redo across AI edits (AI output applied via
      `executeEdits` + `pushUndoStop`, so Ctrl+Z reverts an AI rewrite like
      any manual edit)
- [ ] **[T1]** Inline error diagnostics as Monaco markers (squiggle at the
      exact syntax error, not just a toast)
- [ ] **[T1]** "Prettify DBML" formatting command
- [ ] **[T1]** Reverse-engineer: import a `.sql` file → convert to DBML
      (static file, one-shot — see T2 for the live-DB version)
- [ ] **[T1]** Command palette (Cmd/Ctrl+K)
- [ ] **[T1]** Lightweight comments/notes anchored to specific tables
- [ ] **[T2]** Schema branching: create a branch, edit independently of the
      working copy
- [ ] **[T2]** Three-way merge of two DBML branches **at the AST level**,
      not text diff — must distinguish a rename from a drop+add, since both
      produce the same resulting schema but require different migration SQL
- [ ] **[T2]** Visual diff view: table-by-table, column-by-column, rendered
      from parsed `@dbml/core` ASTs
- [ ] **[T2]** Merge-conflict resolution UI for concurrent edits to the same
      table across branches
- [ ] **[T2]** Live database connection + introspection (Postgres/MySQL,
      read-only credentials) into DBML, including cyclic-FK-safe dependency
      ordering and encrypted-at-rest connection strings
- [ ] **[T2]** Drift detection: periodic re-introspection surfaces what
      changed in the live DB independent of project changes
- [ ] **[T2]** Explicit "features DBML can't represent" report for lossy
      introspection (engine-specific types, generated columns, partial
      indexes) instead of silent data loss

## 4. ER Diagram

- [x] **[MVP]** Client-side DBML parsing (`@dbml/core`) — instant live
      preview, no server round-trip while typing
- [x] **[MVP]** XYFlow canvas with dagre auto-layout (left-to-right)
- [ ] **[T1]** `TableGroup` support — visually cluster related tables
- [ ] **[T1]** Manual per-table color/styling, persisted with the schema
- [ ] **[T1]** Search/highlight a table or field on the canvas
- [ ] **[T1]** Light/dark theme toggle for the diagram
- [ ] **[T1]** Additional auto-layout directions (vertical tree, radial)
- [ ] **[T2]** Virtualized rendering — mount only nodes near the viewport,
      for schemas with 500+ tables
- [ ] **[T2]** Incremental re-layout: adding one table must not re-run dagre
      globally and reset every manually-adjusted position (dagre has no
      native incremental mode — this needs a custom local-placement pass)
- [ ] **[T2]** Level-of-detail rendering: collapse to name-only boxes below
      a zoom threshold, expand above it
- [ ] **[T2]** Edge bundling / on-demand FK-line rendering for
      highly-connected schemas
- [ ] **[T2]** Layout position becomes shared, concurrently-edited state
      once collaboration is CRDT-based (§7) — must be reconciled per-client
      the same way document text is

## 5. Export

- [x] **[MVP]** Export to SQL, DBML, PNG, SVG
- [ ] **[T1]** Additional SQL dialects: MySQL, SQLite, MS SQL Server
- [ ] **[T1]** Export to JSON Schema / OpenAPI component schemas
- [ ] **[T1]** "Export all" as a single zip (dbml + sql + png + svg)
- [ ] **[T1]** Migration diff export: `ALTER TABLE` script between two
      schema versions (stub-level — see T2 for the full engine)
- [ ] **[T2]** Full migration diff engine: FK-aware statement ordering (you
      can't add a FK before the referenced column exists, or drop a column
      still referenced elsewhere)
- [ ] **[T2]** Destructive-operation flagging (type narrowing, drops) with
      an explicit confirmation step and a data-loss estimate
- [ ] **[T2]** Per-dialect code generation — Postgres, MySQL, and SQL Server
      each support different `ALTER` syntax and capabilities (e.g. Postgres
      `USING` expressions have no direct MySQL equivalent)
- [ ] **[T2]** Optional dry-run against a connected DB inside a
      rolled-back transaction, to catch errors before a real apply
      *(this is the single hardest item in the whole spec — treat it as its
      own project)*

## 6. AI

- [x] **[MVP]** Generate / improve schema via Anthropic API
- [x] **[MVP]** Streaming responses (SSE) — DBML renders as it's generated
      instead of a blocking spinner
- [x] **[MVP]** Diff preview before applying AI changes — accept/reject,
      never instant-apply
- [ ] **[T1]** Multi-turn AI chat (conversational refinement) instead of
      one-shot generate/improve
- [ ] **[T1]** Natural-language querying against the parsed schema
      structure ("which tables reference `users`?")
- [ ] **[T1]** Basic AI usage tracking (tokens/requests per user) —
      groundwork for future limits, no billing required
- [ ] **[T2]** Multi-step AI agent mode: plan a sequence of changes (e.g.
      "add soft-delete to every table"), backed by a validated toolset
      (parse, list tables, check FK integrity, introspect) rather than
      free-form generation
- [ ] **[T2]** Every agent action still funnels through the existing
      diff-preview accept/reject gate — the agent may *propose*, never
      *commit* directly, especially once it can call the live-DB connection
      from §3
- [ ] **[T2]** Prompt-injection guard: schema comments/table names planted
      by one collaborator must not be able to redirect another user's AI
      session
- [ ] **[T2]** Index/query recommendation: flag FK columns with no
      supporting index directly from parsed DBML (no DB connection needed);
      with a connected DB, correlate `EXPLAIN`/`pg_stat_statements` output
      against schema structure, without ever executing the underlying query
      against a possibly-production database
- [ ] **[T2]** Impact analysis / lineage: "what breaks if I rename or drop
      this column" — a real FK/index/query dependency graph, not a
      name-string search (which false-positives badly on common names like
      `id`); false negatives here are worse than false positives, so
      detection must err conservative

## 7. Collaboration (Real-Time)

- [x] **[MVP]** WebSocket server (`apps/ws`, raw `ws` over Node's `http`
      server) with a room-per-project model and JWT auth read from the
      shared httpOnly `access_token` cookie on the upgrade request
- [x] **[MVP]** Presence + live cursors, broadcast to all peers in a project
      room via `project:joined` / `presence:join` / `presence:leave` /
      `cursor:move` messages defined in `@repo/types`
- [x] **[MVP]** Live DBML edit broadcast (`schema:edit`) so the diagram
      updates for all viewers without waiting on the debounced autosave;
      last-write-wins on the shared document
- [x] **[MVP]** Heartbeat/ping-pong reaping of dead connections and graceful
      shutdown (drains clients on SIGTERM/SIGINT) — an in-memory room leaks
      forever without this if a client vanishes without a clean close
- [ ] **[T1]** In-app notifications (not email) for schema changes by
      collaborators
- [ ] **[T2]** Replace last-write-wins with a CRDT document (Yjs/Automerge)
      as the source of truth, bound into Monaco via an incremental-edit
      binding (e.g. `y-monaco`) instead of full-buffer replacement
- [ ] **[T2]** Persist CRDT state (not plain text) so reconnects resync via
      delta updates, not a full snapshot
- [ ] **[T2]** Reconcile CRDT merges with AI diff-preview: an AI edit must
      apply as a CRDT transaction, or it can silently discard concurrent
      human edits made during generation
- [ ] **[T2]** Post-merge validation pass: two syntactically valid
      concurrent edits (e.g. a rename vs. a reference to the old name) can
      CRDT-merge cleanly into *semantically invalid* DBML — this must be
      caught and surfaced, not silently accepted
- [ ] **[T2]** Horizontal scaling: Redis adapter for Socket.io so
      presence/broadcast works across multiple backend instances; CRDT
      state needs its own shared persistence/broadcast layer (e.g.
      `y-redis`), since document consistency and cursor-awareness
      consistency have different requirements
- [ ] **[T2]** Graceful instance shutdown: drain and hand off room state
      without dropping active collaborators
- [ ] **[T2]** Offline-first editing: local IndexedDB persistence of the
      CRDT doc, with reconnect reconciliation through the same merge path
      above — offline drift is the same conflict problem, just accumulated
      over a much longer window
- [ ] **[T2]** Clear sync-state UI ("offline — local only" / "syncing" /
      "synced") — as much a UX problem as a technical one

## 8. Quality & DevOps

- [x] **[MVP]** Turborepo monorepo layout (`apps/*`, `packages/*`) with a
      shared `@repo/database` (Prisma) and `@repo/types` (WebSocket
      protocol + domain types) package, so the API and WS server can't drift
      apart on schema or message shape
- [x] **[MVP]** Unit tests (Vitest) for services (auth, TOTP, DBML, JWT,
      password hashing)
- [x] **[MVP]** E2E tests (Playwright) for core flows (auth, app shell)
- [x] **[MVP]** CI pipeline (GitHub Actions): lint → typecheck → test →
      build on every push/PR to `main`, including a Postgres-backed
      migration check
- [x] **[MVP]** API versioning (`/api/v1/...`)
- [x] **[MVP]** Rate limiting on auth and AI endpoints
- [ ] **[T1]** Integration tests (supertest) for API routes
- [ ] **[T1]** Integration/load test for `apps/ws` — a real client opening a
      connection, joining a room, and asserting broadcast fan-out (nothing
      today exercises the WebSocket layer directly)
- [ ] **[T1]** API documentation (OpenAPI/Swagger) generated from routes
- [x] **[MVP]** Structured logging (pino) on both `apps/api` and `apps/ws`
      instead of morgan/console.log
- [ ] **[T1]** Error tracking (Sentry) on frontend and backend

## 9. Security & Performance

- [x] **[MVP]** Refresh tokens in httpOnly cookies (not localStorage)
- [x] **[MVP]** Request validation via Zod on all mutating routes
- [ ] **[T1]** Input sanitization beyond Zod (XSS-safe rendering of the
      notes/comments feature in §3)
- [ ] **[T1]** Pagination for the projects list and schema version history
- [ ] **[T1]** Debounced/cached DBML parsing for large schemas (100+
      tables) to keep the diagram responsive
- [ ] **[T2]** Encrypted-at-rest storage for live-DB connection strings
      (§3), with SSH-tunnel/SSL support for managed databases
- [ ] **[T2]** Auth enforcement duplicated correctly across REST *and*
      Socket.io for the fine-grained roles in §2 — including edits already
      in flight when a permission changes

---

## Explicitly out of scope (all tiers)

Carried forward from the MVP spec and still excluded even at Tier 2 unless
promoted deliberately: billing/subscriptions, full organizations + RBAC
matrix (Tier 2 §1 adds a *minimal* org hierarchy, not this), email-based
notifications, background job queues, feature flags, and a microservices
split. Tier 2's org/SSO items are the one partial exception, and are scoped
narrowly on purpose.

## Suggested build order across all tiers

1. **[T1] auth/security cleanup** (email verification, sanitization,
   pagination) — low effort, closes known gaps, no architecture risk.
2. **[T1] collaborator roles + [T1] tests/CI hardening** — needed before
   more people touch the codebase concurrently.
3. **[T2] §3 AST-level diff engine** — build once, reuse for branching
   (§3), the migration engine (§5), and impact analysis (§6).
4. **[T2] §7 CRDT collaboration** — prerequisite for horizontal scaling and
   offline support; don't build those on last-write-wins.
5. **[T2] §5 migration diff engine** — highest product value, highest risk;
   prototype against Postgres only before generalizing dialects.
6. **[T2] §6 AI agent mode** — sequence after the diff engine (step 3) so
   agent-proposed multi-table changes reuse the same diff/merge machinery
   as manual branches.
7. **[T2] §3 live DB introspection, §6 query recommendations, §4 canvas
   performance, §1 SSO** — each independently schedulable, none blocks or
   is blocked by the others.
