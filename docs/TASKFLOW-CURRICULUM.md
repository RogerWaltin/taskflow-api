# TaskFlow Engineering Curriculum — Navigation Guide

> **Purpose:** This file is a compact navigation and working summary of the authoritative curriculum. It is not a replacement for the original specification.
>
> **Authoritative source:** `docs/TASKFLOW-CURRICULUM.pdf` — _TaskFlow Engineering Curriculum: 7-Phase Backend Requirements Spec_, 39 pages, Library copy dated 2026-11-25.
>
> Read the original PDF for exact functional requirements, API contracts, schemas, edge cases, acceptance criteria, architectural constraints, viva questions, and appendices. This Markdown file helps an agent and developer find the relevant material quickly.

## How to use this curriculum

1. At the start of a phase, read the entire relevant phase in the PDF, not just this summary.
2. Read `docs/PROGRESS.md` to establish the current position and prerequisites.
3. Inspect the current implementation before planning changes.
4. Follow the phases sequentially. Do not start Phase N+1 code on `main` until Phase N is signed off.
5. Use the curriculum's requirement identifiers exactly:
   - **G** — global rule, active from Phase 1 and never relaxed.
   - **C** — architectural constraint.
   - **AC** — acceptance criterion.
   - **V** — viva question.
6. Distinguish curriculum requirements from implementation suggestions. If code and curriculum disagree, report the discrepancy; do not silently rewrite either.
7. The PDF's exact acceptance criteria and viva questions govern completion. A working implementation alone does not mean a phase is signed off.

## Course operating rules

The curriculum's central objective is that the developer can explain why each pattern exists, what breaks without it, and what it costs. The product is the vehicle for learning.

- Work in small pull requests, aiming for fewer than 400 changed lines excluding lockfiles and generated files, with one concern per PR.
- Each PR description should state what changed, why, how it was verified, and one trade-off considered and rejected.
- A phase is signed off only when every acceptance criterion is demonstrated, CI is green, and the developer passes the viva.
- Viva scoring per question: 0 = cannot answer; 1 = recites a definition; 2 = explains it and points to the exact line or behavior in the code; 3 = also names trade-offs and an alternative. Every ★ question must score at least 2, and the average across all questions must be at least 1.5.
- The developer owns every line committed. Code the developer cannot explain in the viva is rejected, regardless of who or what wrote it.
- Use current stable major versions and pin exact versions through the lockfile. When a package/API has changed name, follow official documentation and note the difference in the PR.
- Create phase-specific executable HTTP examples under `docs/http/phaseN.http`; later phases turn these scenarios into automated tests.

## Product and domain overview

TaskFlow is a multi-tenant project and issue-tracking API. Each organization owns users, projects, and tasks.

| Entity       | Purpose                                                 | Curriculum introduction                |
| ------------ | ------------------------------------------------------- | -------------------------------------- |
| Organization | Tenant; owns all tenant data                            | Phase 1 as an ID, Phase 3 as a table   |
| Project      | Container for tasks, with a short key such as `TF`      | Phase 1                                |
| Task         | Unit of work, with a per-project number such as `TF-12` | Phase 1                                |
| User         | Person with one role                                    | Phase 3 as a table, Phase 4 with login |

Fixed enums: `ProjectStatus` = ACTIVE, ARCHIVED; `TaskStatus` = TODO, IN_PROGRESS, IN_REVIEW, DONE; `TaskPriority` = LOW, MEDIUM, HIGH, URGENT; `UserRole` = ADMIN, MANAGER, MEMBER.

Task status transitions, enforced from Phase 1:

| From        | Allowed destinations |
| ----------- | -------------------- |
| TODO        | IN_PROGRESS          |
| IN_PROGRESS | TODO, IN_REVIEW      |
| IN_REVIEW   | IN_PROGRESS, DONE    |
| DONE        | IN_PROGRESS (reopen) |

Setting a task to its existing status is an allowed no-op.

**Tenant isolation:** every tenant-owned read or write is scoped to one organization. A resource belonging to another organization must be indistinguishable from a missing resource: return 404, not 403. Phases 1–3 use an `X-Org-Id` header as a stand-in; Phase 4 replaces it with verified token identity. The header is not authentication.

## Global rules (G1–G9)

These rules apply from Phase 1 onward and are never relaxed. See PDF section 2.3 for full wording and context.

- **G1:** No business logic in controllers. A controller extracts input, calls exactly one service method, and returns the result.
- **G2:** No `any`; use `unknown` and narrow it. No unjustified `@ts-ignore`.
- **G3:** Use dependency injection. Do not construct services manually outside tests; avoid module-level singletons and mutable static state.
- **G4:** No `console.*`. Use Nest's Logger until Phase 5, then pino.
- **G5:** Never commit secrets. Ignore `.env`; keep `.env.example` committed and current.
- **G6:** JSON timestamps are UTC ISO-8601 strings with milliseconds and a trailing `Z`.
- **G7:** JSON fields use camelCase; IDs are UUID v4 strings; every list has a documented maximum size.
- **G8:** Every tenant-owned read/write is organization-scoped. Repository methods that touch tenant data take the organization ID.
- **G9:** API paths use `/api/v1` (global prefix plus URI versioning).

## Seven-phase map

Timeboxes below are the curriculum's estimates, not deadlines.

| Phase | Theme                                                                 | Goal                                                                                                 |  Timebox | PDF pages |
| ----- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------: | --------: |
| 1     | Modules, controllers, services, DI, REST, in-memory CRUD              | Build a correct tenant-aware in-memory REST API with clean layering                                  | 4–5 days |       4–8 |
| 2     | Fail-fast config, boundary validation, DTOs vs entities, custom pipes | Reject invalid input at the system boundary and refuse to start with invalid configuration           | 4–5 days |      8–13 |
| 3     | PostgreSQL, modeling, indexes, pagination, N+1, transactions          | Replace memory with PostgreSQL without rewriting services and preserve correctness under concurrency | 6–8 days |     13–18 |
| 4     | Authentication, JWT rotation, RBAC, ownership, request lifecycle      | Replace header-based tenant identity with verified identity and enforce authorization                | 7–9 days |     18–23 |
| 5     | Structured logging, correlation IDs, error envelope, interceptors     | Make requests traceable, errors predictable, and sensitive information safe                          | 5–6 days |     23–28 |
| 6     | Redis cache-aside, domain events, BullMQ jobs                         | Speed up an expensive read, decouple side effects, and run reliable asynchronous work                | 6–8 days |     28–33 |
| 7     | Automated tests and production readiness                              | Prove the system works, document it, and ship it safely                                              | 7–9 days |     33–37 |

### Phase 1 — Architecture, modules, controllers, services, DI and REST

**Goal:** a correct, tenant-aware, in-memory REST API with clean layering.

**Learn:** HTTP anatomy and method semantics; status codes; resource modeling; statelessness; controller/service/repository separation; inversion of control and dependency injection; Nest modules, providers, controllers and exports; custom provider tokens; built-in HTTP exceptions; URI versioning.

**Build:** in-memory Projects and Tasks features, tenant scoping through `X-Org-Id`, task numbering and status transitions, project/task lifecycle behavior, and the ten specified endpoints.

**Key architectural ideas:** controllers stay thin; business rules stay in services; services depend on abstract repositories; only repositories own in-memory storage; explicitly select writable fields; every tenant-owned repository method takes organization ID.

**Completion:** demonstrate all Phase 1 endpoint behavior and edge cases in `docs/http/phase1.http`; prove repository implementations can be swapped without changing the service; pass lint, type-check, build, and the Phase 1 viva. See PDF sections 1.5–1.6 and 1.4.

### Phase 2 — Fail-fast configuration, boundary validation, DTOs and custom pipes

**Goal:** nothing invalid gets past the edge of the system, and a misconfigured server refuses to start.

**Learn:** twelve-factor configuration; fail-fast versus fail-late; trust boundaries; syntactic versus semantic validation; mass assignment/over-posting; request DTO vs entity vs response DTO; parsing versus validation; explicit transformation; allow-lists; Nest config, class-validator, class-transformer, ValidationPipe, built-in and custom pipes, mapped types, and pipe lifecycle position.

**Build:** validated environment configuration; a single global ValidationPipe; Create/Update DTOs; response DTOs and mappers; query DTOs; ParseSortPipe and ParseCsvEnumPipe; explicit JSON body-size limit; the shared `configureApp(app)` setup used by main and tests; Phase 2 HTTP examples.

**Key architectural ideas:** remove hand-written input validation from controllers/services; keep DTOs declarative; derive update DTOs with mapped-types; use allow-lists for sort/filter fields; make coercion explicit; never enable implicit conversion; configure the global ValidationPipe only once through `configureApp(app)`.

**Completion:** demonstrate every Phase 2 edge case; show environment boot drills; prove `process.env` access is confined to config; prove service/controller hand-written validation is removed; verify response DTO fields; verify both custom pipes have at least two call sites; retain Phase 1 regression behavior except intentional changes. See PDF sections 2.1–2.6.

### Phase 3 — PostgreSQL persistence, modeling, indexing, pagination, N+1 and transactions

**Goal:** replace in-memory persistence with PostgreSQL without rewriting the services, while keeping data correct under concurrency.

**Learn:** relational modeling, keys and cardinality, normalization and deliberate denormalization, database constraints, forward-only migrations, B-tree and composite indexes, EXPLAIN, offset vs keyset pagination, N+1 queries, ACID, isolation levels, lost updates, atomic counters, connection pooling, and transaction boundaries.

**Build:** PostgreSQL infrastructure; relational schema and migrations; organization, user, project and task tables; persistence repositories bound through existing abstractions; indexes and constraints; offset and keyset pagination; bulk creation; transactional writes; seed data and documented HTTP scenarios.

**Important decision at kickoff:** the source curriculum specifies Prisma. TypeORM is allowed only with mentor approval at kickoff, and then must produce equivalent tables, constraints and indexes through migrations (never `synchronize`). The current repository uses in-memory repositories and does not yet establish an ORM choice. Do not silently choose or install an ORM; discuss this with the user at Phase 3 kickoff.

**Completion:** migration/seed drill; Phase 1 and 2 regression proof against PostgreSQL; concurrency and rollback drills; before/after N+1 evidence; EXPLAIN evidence; cursor-walk proof; cross-tenant tests; database constraint proof; Phase 3 viva. See PDF sections 3.1–3.6.

### Phase 4 — Authentication and authorization

**Goal:** replace `X-Org-Id` with real identity, enforce roles and ownership, and learn the full Nest request lifecycle.

**Learn:** authentication vs authorization; password hashing with Argon2id; stateless tokens vs sessions; JWT claims and attacks; access/refresh tokens and rotation; reuse detection; account enumeration; BOLA/IDOR; rate limiting; guards, ExecutionContext, metadata decorators, Reflector, custom user decorators, and lifecycle ordering.

**Build:** registration/login/refresh/logout/me; password hashes; access and rotating refresh tokens; refresh-token storage; JWT and role guards; public/role metadata; current-user decorator; ownership policies; organization and user flows; rate limiting; the access-token validation ADR; lifecycle probe.

**Key architectural ideas:** secure by default; verified token is the only identity/tenant source; role checks in guards and ownership checks in policy functions called by services; never expose password hashes or tokens; pin JWT algorithms and validate issuer/audience/expiry; protect refresh rotation against replay and races.

**Completion:** auth and refresh rotation drills; byte-identical login failure responses; full RBAC matrix; cross-tenant 404 tests; last-admin rule; lifecycle evidence; rate-limit drill; sensitive-data scan; ADR and Argon2 evidence; Phase 4 viva. See PDF sections 4.1–4.6.

### Phase 5 — Observability and error handling

**Goal:** every request is traceable end to end, every error has one predictable shape, and sensitive information does not leak.

**Learn:** structured logging; correlation/request IDs; AsyncLocalStorage; redaction; operational vs programmer errors; error taxonomy and RFC 9457 context; latency measurement; contract evolution; middleware; pino; exception filters; interceptors and RxJS operators.

**Build:** validated request-ID middleware; structured JSON logs; redaction; shared request context; Error Envelope v2; stable error-code catalog; global exception filter; timing and logging interceptors; dev-only diagnostic routes.

**Key architectural ideas:** log once at the boundary; never send unexpected error messages/stacks to clients; keep request context in AsyncLocalStorage; use dependency-injected global filters/interceptors; move persistence error mapping out of repositories as required.

**Completion:** correlation proof; redaction proof; JSON log validation; every error catalog/edge case tested; Server-Timing and slow-request proof; no console usage; error-shape rollout plan; Phase 5 viva. See PDF sections 5.1–5.6.

### Phase 6 — Caching, domain events and background jobs

**Goal:** make an expensive read fast, decouple side effects from the request, and run reliable asynchronous work.

**Learn:** cache strategies and invalidation; stale-data races; cache stampedes; tenant-safe key design; fail-open behavior; in-process event vs durable queue guarantees; retries/backoff/jitter; poison jobs; idempotent consumers; transactional outbox awareness; Redis eviction policy.

**Build:** Redis infrastructure/config; CacheService and CacheKeys; project statistics endpoint using aggregate queries; tenant-scoped cache-aside; TTL jitter, single-flight and fail-open behavior; domain events emitted after commit; cache invalidation listener; BullMQ notifications queue and worker; fake email sender; notification idempotency log; Redis-backed rate limiting.

**Key architectural ideas:** only CacheService handles cache Redis; only producers/processors handle BullMQ; services emit events but do not import cache/queue; events happen after commit; event/job payloads contain IDs and minimal facts; listeners/processors are idempotent; cache keys include tenant and version.

**Completion:** HIT/MISS/invalidation tests; stampede proof; Redis-down drill; cross-tenant cache proof; async notification and retry drill; idempotency proof; commit-order proof; multi-instance rate-limit proof; Phase 6 viva. See PDF sections 6.1–6.6.

### Phase 7 — Automated testing and production readiness

**Goal:** prove the system works, document it, and ship it safely.

**Learn:** testing pyramid; test doubles; deterministic tests; database/Redis test isolation; meaning and limits of coverage; OpenAPI as contract; liveness/readiness; graceful shutdown; container hygiene; CI gates; separate migration deployment.

**Build:** unit and E2E suites; coverage thresholds; full auth/tenant/RBAC/validation/concurrency/cache/event/queue/health scenarios; complete Swagger docs and OpenAPI drift check; health endpoints; graceful shutdown; multi-stage non-root Docker image; production-like Compose; final README and operational drills.

**Key architectural ideas:** unit tests do not touch real infrastructure; E2E tests use real PostgreSQL and Redis; tests are independent and deterministic; liveness does not depend on external services; migrations never run automatically on app startup; containers do not run as root or contain secrets.

**Completion:** clean-runner CI; coverage evidence; mutation drills; repeated parallel E2E runs without flakes; all 24 endpoints documented; shutdown drill; image/security checks; HTTP scenarios converted to automated tests or justified; final README; Phase 7 viva and overall production-readiness review. See PDF sections 7.1–7.6 and appendices.

**Repository/curriculum discrepancy to resolve before Phase 7:** the curriculum's Phase 7 test examples refer to Jest, while this repository currently uses Vitest. Do not switch test frameworks automatically. Raise the discrepancy at Phase 7 kickoff and agree whether to adapt the curriculum's examples to Vitest or obtain an explicit decision to migrate.

## Appendices in the original PDF

- **Appendix A (PDF pages 37–38):** final API inventory of 24 endpoints: Auth (5), Users (4), Projects (6), Tasks (7), Health (2).
- **Appendix B (PDF pages 37–38):** environment variable registry, defaults, validation rules and phase of introduction.
- **Appendix C (PDF page 39):** final sign-off criteria and stretch goals.

The original PDF remains authoritative for the full endpoint inventory, environment-variable details, exact schemas, examples, edge cases, architectural constraints, acceptance criteria and viva questions.

## Important source notes

- This Markdown is a navigation aid and intentionally does not reproduce every endpoint table, example payload, schema, edge case, acceptance criterion, or viva question. Consult the corresponding PDF section before implementing or signing off work.
- The source PDF is the 39-page Library copy dated 2026-11-25. Keep it unchanged.
- Lab/checkpoint names used in `docs/PROGRESS.md` may be working subdivisions created during tutoring. The source PDF defines seven phases and its numbered sections; it does not necessarily use those tutoring lab labels.
