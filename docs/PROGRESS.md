# TaskFlow Learning Progress

> This file records the learner's actual progress. Update it after every completed implementation checkpoint and after verification. Do not mark work complete based only on code being written.
>
> **Source of truth for requirements:** `docs/TASKFLOW-CURRICULUM.pdf`. See `docs/TASKFLOW-CURRICULUM.md` for a navigation summary.

Last reviewed: 2026-11-27

## Current position

- **Current phase:** Phase 2 — Fail-Fast Config, Boundary Validation, DTOs vs Entities, Custom Pipes.
- **Current working unit:** Phase 2 Lab 4 — Query Validation.
- **Current status:** Lab 4 Parts 1–2 implemented and manually exercised; Parts 3–4 remain. Phase 2 remains in progress.
- **Current focus:** Allow-listed query fields and actual sorting (Part 3), then HTTP examples and verification (Part 4).
- **Next action:** Review the Part 1–2 query DTO and filtering behavior before proceeding to Part 3.

## Status definitions

- **Not started:** No implementation work has been reported.
- **In progress:** Work has begun but the checkpoint/lab is not yet verified complete.
- **Implemented:** Code has been written, but tests or demonstration may still be outstanding.
- **Tested:** The relevant tests/checks were run and passed. Record which commands or evidence support this.
- **Demonstrated:** The relevant curriculum acceptance criterion has been exercised and evidence recorded.
- **Viva passed:** The learner has answered the relevant viva questions to the curriculum's required standard.
- **Signed off:** All phase acceptance criteria are demonstrated, CI is green, and the learner has passed the phase viva. Only the learner can declare final sign-off.

Do not collapse these states into a single "done" label.

## Phase and lab status

| Phase / working unit                                                | Status                           | Notes                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 — Architecture, modules, controllers, services, DI and REST | Implementation reported complete | The learner moved on to Phase 2 after completing Phase 1 work. Formal acceptance-criteria evidence, CI sign-off and viva result are not recorded here; do not call the phase formally signed off without checking.                             |
| Phase 2 — Lab 1: fail-fast configuration                            | Completed (learner-reported)     | The learner reported completing Phase 2 Lab 1. Re-open its acceptance criteria only if a regression or explicit review requires it.                                                                                                            |
| Phase 2 — Lab 2: DTOs and boundary validation                       | Completed (learner-reported)     | On 2026-11-26, the learner reported finishing Lab 2. The scope is recorded below. Exact test/check commands and criterion-by-criterion demonstration evidence were not supplied in this progress update; this does not imply Phase 2 sign-off. |
| Phase 2 — Lab 3: update and response DTOs                           | Implemented and tested           | Parts 1–5 implemented and tested: update/response DTOs, explicit mappers, paginated list responses, and updated HTTP examples. Formal Lab 3 acceptance review and Phase 2 sign-off remain.                                                     |
| Phase 2 — Lab 4: query validation                                   | In progress                      | Parts 1–2 implemented and manually exercised. Sorting behavior and multi-field allow-list work (Part 3), HTTP examples, and Lab 4 completion evidence (Part 4) remain.                                                                         |
| Phase 3 — PostgreSQL persistence and data modeling                  | Not started                      | ORM choice must be discussed at kickoff. The PDF specifies Prisma by default; TypeORM requires mentor approval at kickoff and equivalent migrations/schema.                                                                                    |
| Phase 4 — Authentication and authorization                          | Not started                      | Depends on Phase 3 sign-off.                                                                                                                                                                                                                   |
| Phase 5 — Observability and error handling                          | Not started                      | Depends on Phase 4 sign-off.                                                                                                                                                                                                                   |
| Phase 6 — Caching, domain events and background jobs                | Not started                      | Depends on Phase 5 sign-off.                                                                                                                                                                                                                   |
| Phase 7 — Automated testing and production readiness                | Not started                      | Depends on Phase 6 sign-off. Resolve the curriculum's Jest examples vs repository's current Vitest setup at kickoff.                                                                                                                           |

## Completed working unit — Phase 2 Lab 2

### Scope reported complete by the learner

- Create and use `CreateProjectDto`.
- Create and use `CreateTaskDto`.
- Ensure project creation and task creation controllers use the correct DTOs.
- Ensure invalid request input is rejected at the application boundary and does not reach service methods.
- Remove hand-written request validation from controllers/services where the Phase 2 requirements require DTO/pipe validation.
- Ensure global validation configuration is installed exactly once through `configureApp(app)` and reused by application bootstrap and tests.

### Verification record

The learner reported Lab 2 as finished on 2026-11-26. This progress update records that learner-reported completion; it does not independently record the exact test commands/results or mark individual curriculum acceptance criteria as demonstrated. Add specific verification evidence if it is reviewed later. Phase 2 remains in progress until its phase-wide acceptance criteria, CI, viva, and learner sign-off are complete.

## Current checkpoint — Phase 2 Lab 3 Parts 1–5

### Implemented

- `UpdateProjectDto` is derived using `PartialType(OmitType(CreateProjectDto, ['key']))`; update-only `status` validation is added separately.
- `UpdateTaskDto` is derived using `PartialType(CreateTaskDto)`; update-only `status` validation is added separately.
- Existing project/task controllers already accepted these update DTOs, so no controller changes were needed.
- Preserved the empty-patch constraint and nullable `assigneeId` / `dueDate` behavior.
- Fixed `AtLeastOneField` to read its nested field-list constraint correctly. Without this, the custom validator reports an error for valid patches.
- Reset the inherited create-time task priority default in `UpdateTaskDto`; otherwise `PartialType` initializes omitted PATCH priority to `MEDIUM`, making an empty patch appear non-empty.
- Configured the mapped types to validate `null` values rather than treating them as omitted; explicitly nullable fields retain their `@IsOptional()` null behavior. Update-only `status` likewise rejects `null`.
- Added `URGENT` to the shared create-task priority allow-list, preserving the prior update behavior while keeping create and update validation derived from the same DTO rules.
- Added focused DTO validation specs for valid partial updates, immutable project key, invalid status/priority/assignee UUID, empty patches, and nullable task fields.
- Updated E2E app setup to use `configureApp(app)` with the default body parser disabled, so HTTP tests exercise the same global validation as the application.
- Updated existing E2E fixtures to conform to DTO contracts (project-key length, assignee UUIDs, and timezone-qualified date values) and added HTTP coverage for rejecting a null task title.
- Added explicit `ProjectResponseDto` and `TaskResponseDto` public response shapes rather than deriving API contracts from entity types.
- Kept project mapping explicit and extracted task mapping into `tasks.mapper.ts`, which selects every public field without spreading the entity.
- Updated services and controller return types to use the response DTOs; internal project/task reads used for business logic still use entity types.
- Added mapper tests that verify exact public fields and prove internal fields (including an unexpected task entity field) are not copied into responses.
- Added explicit query-string number conversion/positive-integer validation to both project and task list DTOs; the pagination boundary pipe supplies `page=1` and the configured `DEFAULT_PAGE_SIZE`.
- Added `PaginationOptionsPipe` to both list endpoints to enforce configured `MAX_PAGE_SIZE` (including the default maximum of 100), while retaining DTO validation and filter fields.
- Updated repository contracts and in-memory implementations to filter/sort, calculate total matching records, then slice the requested page while retaining organization scoping.
- Updated list services and controllers to return `{ data, meta }`, with `totalPages` derived from `total / limit`; past-end and no-result pages remain successful empty responses.
- Added pagination helper, DTO, repository, service/controller, and E2E coverage for page boundaries, invalid query values, filtering, and empty results.
- Updated `docs/http/phase1.http` to show paginated project/task list requests and response examples, public response fields, and request values that satisfy current DTO validation.

### Verification

- Focused DTO specs: passed during Parts 1–2 work; mapper and service specs passed (59 tests) during Part 3 implementation.
- `npm test`: passed after Parts 4–5 (159 tests across 15 files).
- `npm run test:e2e`: passed after Parts 4–5 (12 tests across 4 files), including 57-result page scenarios for both resource lists.
- `npm run type-check`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- Previous E2E run before audit follow-up: failed because test apps omitted `configureApp(app)`. Follow-up fixed the setup and test fixtures.
- Focused Prettier check for the new pagination helpers, query DTOs, and pagination E2E test: passed.
- `npm run format:check`: failed because 19 existing source/test files remain unformatted, including legacy files changed for this work. They were not reformatted wholesale to avoid unrelated formatting churn.
- `git diff --check`: passed.
- Audit correction (2026-11-27): introduced `PaginationOptionsPipe` to apply configured page defaults and maximums to project/task list queries. Focused verification is recorded below.
- `npm install @nestjs/mapped-types` reported engine warnings because the environment is Node 24.14.0 while some existing Nest tooling dependencies require Node 24.15.0 or newer; install completed.

Audit follow-up (2026-11-27): added regression coverage for null non-nullable fields, preserved `URGENT` priority through the shared create/update allow-list, and configured E2E apps through `configureApp(app)`.

Part 3 (2026-11-27): introduced explicit public response DTO shapes and field-by-field mappers for projects and tasks. Service/controller response types and mapper tests were updated. At that point, standardized pagination and HTTP examples remained; Parts 4–5 below record their completion.

Parts 4–5 (2026-11-27): added validated pagination query parameters and standard `{ data, meta }` list responses; verified page 1–4 and zero-result behavior for projects and tasks; updated `docs/http/phase1.http`. Parts 1–5 are implemented and tested. Formal Lab 3 acceptance review and Phase 2 sign-off remain outstanding.

Pagination audit correction (2026-11-27): project and task list queries now use configured `DEFAULT_PAGE_SIZE` and reject values above `MAX_PAGE_SIZE`. DTO defaults are intentionally left unset so configuration is applied at the request boundary. Stale historical Part 3 wording corrected. Verified with focused unit tests (37 passed), focused pagination E2E tests (2 passed), `npm run type-check`, `npm run lint`, and `npm run build`. Prettier formatting was applied to the new pipe and this progress file.

## Current checkpoint — Phase 2 Lab 4 Parts 1–2

### Implemented

- Extended the existing project list DTO with the `name`, `key`, and `createdAt` sort-field allow-list and the `-createdAt` default. Project pagination/default/max validation remains in place.
- Extended the task list DTO with comma-separated status and priority validation, UUID validation for `assigneeId`, strict boolean conversion/validation for `unassigned`, and rejection of `unassigned=true` combined with `assigneeId`.
- Added task repository filtering for multiple statuses/priorities and assigned/unassigned state while retaining organization and project scoping.
- Added the specified task sort-field allow-list and `-number` default. Actual user-selected ordering and multi-field parsing are intentionally deferred to Part 3.

### Verification

- Manual HTTP checks passed for multi-status/priority filters, assignee and unassigned filters, invalid project page/limit/sort, invalid task boolean/UUID/enum, and conflicting task filters.
- `npm test`: passed (162 tests across 16 files).
- `npm run test:e2e`: passed (12 tests across 4 files).
- `npm run type-check`, `npm run lint`, `npm run build`, and focused Prettier check: passed.
- Automated acceptance-specific coverage and HTTP examples are not yet recorded; the learner plans to address the complete testing work later. Actual sorting is not implemented in this checkpoint.

## Phase sign-off record

| Phase   | Acceptance criteria demonstrated | CI green                             | Viva passed  | Learner sign-off |
| ------- | -------------------------------- | ------------------------------------ | ------------ | ---------------- |
| Phase 1 | Not recorded                     | Not recorded                         | Not recorded | Not recorded     |
| Phase 2 | In progress                      | Not recorded for phase-wide sign-off | Not recorded | Not signed off   |
| Phase 3 | Not started                      | —                                    | —            | —                |
| Phase 4 | Not started                      | —                                    | —            | —                |
| Phase 5 | Not started                      | —                                    | —            | —                |
| Phase 6 | Not started                      | —                                    | —            | —                |
| Phase 7 | Not started                      | —                                    | —            | —                |

## Progress log

- **2026-11-26:** Set up the TaskFlow project instructions to require phase kickoff planning, conceptual discussion, feature-sized checkpoints, checkpoint review pauses, and evidence-based progress updates.
- **2026-11-26:** Recorded Phase 2 Lab 2 as completed (learner-reported). Formal Phase 2 sign-off remains outstanding; exact test/check evidence was not added in this update.
- **2026-11-26:** Implemented and verified Phase 2 Lab 3 Parts 1–2 (mapped update DTOs); Parts 3–5 remain.
- **2026-11-26:** Formal Phase 1 sign-off remains unverified.
- **2026-11-27:** Addressed the Lab 3 Parts 1–2 audit findings: null rejection for non-nullable update fields, consistent `URGENT` task priority validation, and E2E setup through `configureApp(app)`. Updated DTO and HTTP tests pass.
- **2026-11-27:** Implemented and verified Lab 3 Part 3: explicit project/task response DTOs, allow-list mappers, and typed service/controller response contracts.
- **2026-11-27:** Implemented and verified Lab 3 Parts 4–5: paginated project/task lists, pagination validation and metadata, E2E boundary scenarios, and updated HTTP examples.
- **2026-11-27:** Implemented and manually exercised Lab 4 Parts 1–2: project/task query DTO validation, CSV task filters, assignee/unassigned filters, and query conflicts. Lab 4 Parts 3–4 remain.

## Update protocol

After each implementation checkpoint:

1. Record the checkpoint and its scope.
2. Record changed files or the feature delivered where useful.
3. Mark implementation status based on actual code changes.
4. Record exact test/check commands and results; failures stay visible.
5. Mark acceptance criteria demonstrated only when evidence exists.
6. Record unresolved issues and the next action.
7. Stop before the next checkpoint until the learner has reviewed and understood the current one.

Never fabricate dates, test results, completed labs, demonstrated acceptance criteria, viva results, or phase sign-offs. If the current state is unclear, ask the learner rather than guessing.
