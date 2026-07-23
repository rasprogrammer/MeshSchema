# Advanced Requirements Roadmap — Schema Designer

This document defines the next tier of requirements to evolve the MVP into a
more capable, production-leaning product. It follows the same structure as
the original MVP spec so each section can be picked up independently.

Scope note: a few items here intentionally touch areas the MVP spec excluded
(sharing, notifications). They are kept deliberately small — **project-level
roles, not organizations; in-app only, not email** — rather than reintroducing
full enterprise scope.

---

## 1. Authentication & Users

- [ ] Email verification on register (token-based confirmation link)
- [ ] Password reset via magic link
- [ ] OAuth login: Google and GitHub, alongside email/password
- [ ] Session management: list active sessions/devices, revoke individual refresh tokens
- [ ] Profile settings: name, avatar, change password
- [ ] Optional 2FA (TOTP-based)

## 2. Projects

- [ ] Per-project collaborator invites by email with **viewer** / **editor** roles (no orgs, no RBAC matrix)
- [ ] Project templates (e.g. "E-commerce", "SaaS multi-tenant", "Blog") to start from
- [ ] Duplicate / fork a project
- [ ] Soft delete with a trash/restore view instead of hard delete
- [ ] Dashboard search, sort, and favorite/pin projects

## 3. Schema Editor

- [ ] Inline error diagnostics as Monaco markers (squiggle at the exact DBML syntax error, not just a toast)
- [ ] "Prettify DBML" formatting command
- [ ] Reverse-engineer: import an existing `.sql` file and convert it to DBML
- [ ] Command palette (Cmd/Ctrl+K) for quick actions
- [ ] Lightweight comments/notes anchored to specific tables, stored with the schema

## 4. ER Diagram

- [ ] DBML `TableGroup` support — visually cluster related tables
- [ ] Manual per-table color/styling, persisted with the schema
- [ ] Search/highlight a table or field on the canvas
- [ ] Light/dark theme toggle for the diagram itself
- [ ] Additional auto-layout directions (vertical tree, radial) beyond left-to-right dagre

## 5. Export

- [ ] Additional SQL dialects: MySQL, SQLite, MS SQL Server
- [ ] Export to JSON Schema / OpenAPI component schemas
- [ ] "Export all" as a single zip (dbml + sql + png + svg)
- [ ] Migration diff export: given two schema versions, generate the `ALTER TABLE` script between them

## 6. AI

- [ ] Multi-turn AI chat (conversation-based refinement) instead of one-shot generate/improve
- [ ] Diff preview before applying AI changes — accept/reject instead of instant apply
- [ ] Streaming responses (SSE) so generation feels live instead of a spinner
- [ ] Natural-language querying against the parsed schema structure (e.g. "which tables reference `users`?")
- [ ] Basic AI usage tracking (tokens/requests per user) — groundwork for future limits, no billing required

## 7. Collaboration (real-time)

- [ ] WebSocket layer (Socket.io) for live presence — who else is viewing/editing a project
- [ ] Live cursor + live diagram updates when multiple people have a project open
- [ ] In-app notifications (not email) for schema changes by collaborators

## 8. Quality & DevOps

- [ ] Unit tests (Vitest/Jest) for services
- [ ] Integration tests (supertest) for API routes
- [ ] E2E tests (Playwright) for core flows (auth, project CRUD, editor, export)
- [ ] CI pipeline (GitHub Actions): lint → typecheck → test → build on every PR
- [ ] API documentation (OpenAPI/Swagger) generated from route definitions
- [ ] Structured logging (pino) instead of morgan/console.log
- [ ] Error tracking (Sentry) on frontend and backend
- [ ] Rate limiting specifically on auth and AI endpoints
- [ ] API versioning (`/api/v1/...`)

## 9. Security & Performance

- [ ] Move refresh tokens to httpOnly cookies instead of localStorage
- [ ] Input sanitization beyond Zod validation (XSS-safe rendering of notes/comments)
- [ ] Pagination for the projects list and schema version history
- [ ] Debounced/cached DBML parsing for large schemas (100+ tables) to keep the diagram responsive

---

## Suggested prioritization

1. **Security & Performance** items 1–2 (cookie-based refresh tokens, sanitization) — closes known MVP gaps, low effort
2. **AI**: diff preview + streaming — highest visible product impact
3. **Schema Editor**: inline diagnostics + SQL import — most requested developer-experience wins
4. **Projects**: collaborator invites — unlocks team use without full RBAC/orgs complexity
5. **Quality & DevOps**: tests + CI — do this before the codebase grows much further

Pick a cluster and it can be implemented directly into the existing codebase
without restructuring the current layered (backend) / feature-based (frontend)
architecture.