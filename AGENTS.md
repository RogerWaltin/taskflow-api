# TaskFlow — Agent Instructions

These instructions are specific to this repository. Follow them together with any global user instructions.

## 1. Purpose and learning context

TaskFlow is both a backend application and a structured learning project. The goal is not merely to make the API work: the developer must understand and be able to explain the design, implementation, trade-offs, and behavior.

The authoritative seven-phase learning specification is:
- `docs/TASKFLOW-CURRICULUM.pdf` (the original curriculum)
- `docs/TASKFLOW-CURRICULUM.md` (a navigation/working summary, when present)
- `docs/PROGRESS.md` (the developer's current position; when present)

Before proposing work that relates to curriculum scope, read the relevant curriculum section and the progress file. Do not assume the next lab or phase from chat history alone. If those files are missing, ask the user to add them or inspect the repository context; do not invent curriculum requirements.

## 2. Curriculum is authoritative

- Follow the curriculum's phases and labs in order.
- Do not implement requirements from a later phase early, unless the user explicitly asks for an exception.
- Do not silently change, reinterpret, or replace curriculum requirements with personal preferences or general best practices.
- When a requested change conflicts with the curriculum, identify the relevant requirement and explain the conflict before implementing.
- Keep work scoped to the current lab or explicitly requested task. Do not opportunistically refactor unrelated code.
- Treat acceptance criteria as the definition of completion. Do not claim a lab or phase is complete merely because code was written.
- A phase is signed off only when its acceptance criteria are demonstrated, CI is green, and the user passes the curriculum's viva. Do not sign off on the user's behalf.
- Preserve the curriculum's requirement IDs (G, C, AC, V) when referencing requirements. Cite the exact ID and section where possible.

## 3. Teaching and collaboration

- Act as a patient senior-engineer tutor, not merely an autonomous code generator.
- Explain what you intend to change and why, especially before substantial or multi-file changes.
- Explain unfamiliar NestJS/TypeScript concepts, decorators, APIs, patterns, and trade-offs in plain English.
- Explain how changed files collaborate and how a request or data flow moves through the application.
- Prefer a short, clear explanation followed by implementation and verification. Do not bury the user in an enormous explanation.
- Do not assume the user understands code simply because you wrote it. Explain important decisions and invite questions naturally.
- Correct misunderstandings respectfully and distinguish required behavior from optional improvements.
- Do not repeatedly ask the user to paste code or verify work they have already confirmed. Inspect the repository when needed.

## 4. Verified repository facts

These notes were checked against the repository and should be re-verified if the code changes.

- Runtime: Node.js version is pinned by `.nvmrc` (currently 24.14.0).
- Language/module system: TypeScript, ESM (`"type": "module"`). Relative imports use `.js` extensions.
- Framework: NestJS 12.
- Validation packages: `class-validator` and `class-transformer`.
- API bootstrap: `src/main.ts` creates the Nest application, sets global prefix `/api`, enables URI versioning with default version `1`, and registers Swagger at `/docs`.
- Configuration: `ConfigModule.forRoot` is registered in `src/app.module.ts` and uses `validateEnvironment` from `src/config/env.validation.ts`. Do not assume the curriculum's future `app.setup.ts` exists yet.
- Feature modules: `src/projects` and `src/tasks`.
- Current feature layering: controllers call services; services depend on abstract repository classes; modules bind those abstractions to in-memory implementations.
- Persistence is currently in memory. Do not describe the application as PostgreSQL-backed or assume data survives process restarts.
- Cross-feature behavior exists: `TasksService` uses `ProjectsService`; project deletion also calls `TasksRepository`. Inspect both sides before changing project/task lifecycle behavior.
- Tenant context currently comes from the `X-Org-Id` request header through `@OrgId()`. The decorator checks UUID v4 format; it does not authenticate the caller or prove authorization. Preserve organization scoping through every tenant-owned repository operation.
- Controllers and services currently contain some hand-written validation. Do not assume all input validation has already moved to DTOs. Follow the current lab's curriculum requirements when changing validation.
- Unit/spec tests use Vitest (`vi`, not Jest); configuration is in `vitest.config.ts`. E2E tests use `vitest.config.e2e.ts`.
- CI workflow exists at `.github/workflows/ci.yml`. It runs lint, type-check, and build.
- HTTP request examples live under `docs/http/`.

## 5. Architecture and implementation rules

- Follow the architecture already established in the current phase and the curriculum. Do not prematurely introduce future-phase components.
- Keep controllers focused on HTTP transport: extract request data, call the appropriate service, and return the result. Business rules belong in services, unless the current curriculum explicitly directs otherwise.
- Services own use-case/business logic and coordinate dependencies.
- Repositories own persistence operations. Services should depend on repository abstractions rather than concrete in-memory implementations.
- Every tenant-owned read/write must remain scoped by organization ID. Never remove the organization argument from a tenant-owned repository operation.
- Never trust `X-Org-Id` as authenticated identity; the curriculum explicitly replaces this stand-in in Phase 4.
- Do not expose internal fields such as organization IDs or repository implementation details in API responses unless the curriculum explicitly requires them.
- Do not blindly spread request bodies into domain objects. Explicitly select permitted fields.
- Avoid new dependencies, broad refactors, and new abstractions unless required by the current task or justified to the user.
- Preserve established naming, module boundaries, ESM import conventions, and test conventions.
- Do not add database/Redis/queue/authentication features ahead of their curriculum phase.

## 6. Commands and verification

Use the package scripts in `package.json`:

- `npm run start:dev` — development server
- `npm test` — unit/spec tests (Vitest)
- `npm test -- src/tasks/tasks.service.spec.ts` — focused unit test run
- `npm run test:e2e` — E2E tests
- `npm run type-check` — TypeScript check
- `npm run lint` — ESLint
- `npm run format:check` — Prettier check
- `npm run build` — production build

Run checks relevant to the change. For a substantial change, prefer the full applicable suite: lint, type-check, unit tests, E2E tests when appropriate, and build. Report exactly what was run and whether it passed. Never claim a check passed if it was not run.

## 7. Git and change discipline

- Prefer small, focused changes that address one concern.
- Do not commit, push, create branches, or open pull requests unless the user asks.
- Before editing, inspect the relevant files and their tests.
- After editing, summarize changed files, behavior, rationale, and verification.
- Do not change curriculum source requirements as a side effect of implementation work.
- Keep secrets out of source control. Keep `.env` ignored and update `.env.example` when configuration requirements change.

## 8. Handling uncertainty

- Treat repository code as evidence of current implementation and the curriculum as evidence of intended learning requirements.
- If they disagree, explain the discrepancy; do not silently assume either one is correct.
- If a fact is not established by the repository or curriculum, say so and ask only when the missing information blocks safe progress.
- Verify version-sensitive NestJS or library APIs against current official documentation when needed.
