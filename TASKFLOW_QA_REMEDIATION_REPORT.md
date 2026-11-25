# TaskFlow — Phase 1 Bug Remediation & QA Report

Date: 2026-11-25  
Repository: `taskflow-api`  
Scope source: `TASKFLOW_Phase1_Bug_Remediation_Prompt.md`

---

## 1. Executive summary

All in-scope Phase 1 issues were fixed and verified: **BUG-01, BUG-02, BUG-04, BUG-05, BUG-06, and EP-02**. The two previously fixed issues, **BUG-03** and **BUG-08**, were re-tested and did not regress. **BUG-07** was intentionally **deferred** to the later OpenAPI/Swagger phase and was not implemented or tested as part of this assignment.

Bugs were reproduced over real HTTP before code changes using a temporary Nest server and `qa/remediation-baseline.mjs`. The baseline recorded **28 checks: 10 PASS / 18 FAIL**. After the fixes, the same script recorded **29 checks: 29 PASS / 0 FAIL** against a second temporary server. The extra post-fix record is the successful `Location` follow-up request (`EP-02-F`).

Final automated verification:

- `npm test` — **PASS**, 7 test files, 137 tests.
- `npm run test:e2e` — **PASS**, 3 test files, 10 tests.
- `npm run type-check` — **PASS**.
- `npm run build` — **PASS**.
- `npm run lint` — **PASS**, clean after fixing the pre-existing QA-script lint debt in `qa/taskflow-http-qa-20261125.mjs`.

A Phase 1 HTTP request collection was added at `docs/http/phase1.http`. It covers project setup, all task endpoints, `Location` follow-up, filters, transitions, tenancy, archived-project restrictions, deletion, and cascade behaviour.

The implementation stayed inside Phase 1 boundaries: explicit checks in the existing controller/service/repository architecture, no DTO classes, no `class-validator`, no global `ValidationPipe`, no custom validation pipe, no database/JWT/RBAC changes, and no Swagger/OpenAPI changes.

Remaining notes (not blockers):

1. Runtime validation is intentionally narrow and contract-specific, not a general validation framework.
2. The app remains in-memory; data does not survive restarts. This was not changed.

**Final verdict: READY.**

---

## 2. Issue-by-issue results

### BUG-01 — Project endpoints accept invalid request bodies

- **Severity:** HIGH.
- **Original behaviour reproduced:** Yes. Baseline `POST /api/v1/projects` with `{}`, key-only, numeric description, array body, and read-only fields all returned **201** instead of **400** (`B01-02`–`B01-06`). Baseline `PATCH {}` returned **200** and mutated `updatedAt` (`B01-07`).
- **Actual root cause:** `ProjectsService.createProject()` and `ProjectsService.updateProject()` trusted typed request payloads without runtime shape/type/unknown-field checks. `ProjectsController.updateProject()` did not reject empty, array, null, string, or unsupported PATCH bodies. Read-only/internal fields on create were silently discarded by the repository rather than rejected.
- **Fix:** Added focused explicit checks:
  - create body must be a plain object;
  - `key` and `name` must be non-empty strings;
  - `description` must be a string or null when supplied;
  - only `key`, `name`, and `description` are accepted on create;
  - PATCH body must be a plain object and non-empty;
  - only `name`, `description`, and `status` are public PATCH fields;
  - `key`, `nextTaskNumber`, and unknown fields are rejected at the HTTP boundary;
  - invalid status values on PATCH are rejected in the service.
- **Files changed:** `src/projects/projects.service.ts`, `src/projects/projects.controller.ts`, `src/projects/projects.service.spec.ts`, `src/projects/projects.controller.spec.ts`, `test/remediation.e2e-spec.ts`.
- **Tests added/updated:** Invalid create table cases, invalid PATCH table cases, malformed-body controller cases, immutable/internal field cases, valid create/PATCH cases, `null` body over HTTP.
- **Verification actually performed:** Unit tests, E2E HTTP tests, and live HTTP baseline/post-fix runs. All post-fix create/PATCH body checks returned the expected `400` with Nest's standard `{ message, error, statusCode }` body.
- **Final status:** **Fixed**.
- **Remaining concerns:** Validation is deliberately limited to the documented Phase 1 acceptance cases; it is not comprehensive schema validation.

### BUG-02 — Missing projects return HTTP 200 with an empty body

- **Severity:** HIGH.
- **Original behaviour reproduced:** Yes. Baseline `GET` and `PATCH` for nonexistent, foreign-organization, and deleted projects returned **200** with a `null` body (`B02-02`–`B02-07`).
- **Actual root cause:** The repository correctly returned `null`, but `ProjectsService.fetchOne()` and `updateProject()` returned `null`/`null`-mapped responses instead of throwing. Nest therefore serialized a successful empty response. The same null/success defect existed in `deleteProject()` for missing projects.
- **Fix:** `ProjectsService.fetchOne()` and `updateProject()` now throw `NotFoundException('Project not found')`. `deleteProject()` now checks `findById()` first and throws the same 404 for missing or inaccessible projects; it also removes the project's tasks before deleting the project.
- **Files changed:** `src/projects/projects.service.ts`, `src/projects/projects.service.spec.ts`, `test/remediation.e2e-spec.ts`.
- **Tests added/updated:** GET existing/missing/foreign/deleted; PATCH existing/missing/foreign/deleted; delete missing-project guard; task cleanup ordering.
- **Verification actually performed:** Unit tests, E2E HTTP tests, live baseline/post-fix runs. Foreign-org and nonexistent IDs return the identical `404` body, preserving organization isolation.
- **Final status:** **Fixed**.
- **Remaining concerns:** In-memory repository semantics only; no database-level constraints were introduced.

### BUG-03 — Project `nextTaskNumber` mass assignment (previously fixed regression baseline)

- **Severity:** HIGH.
- **Original behaviour reproduced:** No. The earlier fix was already present in the working tree; baseline HTTP attempts to PATCH `key` and `nextTaskNumber` both returned **400** (`B01-08`, `B01-09`).
- **Actual root cause:** Originally, public patching could reach the server-controlled counter. The preserved fix separates `ProjectPatch` from `ProjectInternalPatch` and keeps internal counter updates server-side.
- **Fix / preservation:** No new application change was needed for BUG-03. The separation in `src/projects/projects.types.ts`, the repository interface/stub, and `src/projects/repositories/projects.repository.memory.ts` was preserved. HTTP PATCH still rejects `nextTaskNumber`; task creation increments the counter through `ProjectsService.updateTaskNumber()`.
- **Files changed:** No new BUG-03 application edit by this remediation. Regression coverage touched `src/projects/projects.controller.spec.ts`, `src/projects/repositories/projects.repository.memory.spec.ts`, `src/projects/projects.service.spec.ts`, `src/tasks/tasks.service.spec.ts`, `test/remediation.e2e-spec.ts`.
- **Tests added/updated:** Public/internal patch separation, HTTP rejection of `nextTaskNumber`, sequential task numbers `1` and `2`, internal counter update still changes `updatedAt`.
- **Verification actually performed:** Unit, E2E, and live HTTP. Post-fix baseline records `B01-09` remained `400`; E2E asserted keys `PATCH01-1` and `PATCH01-2`.
- **Final status:** **Fixed (regression baseline passed)**.
- **Remaining concerns:** None observed.

### BUG-04 — No-op project PATCH changes `updatedAt`

- **Severity:** MEDIUM.
- **Original behaviour reproduced:** Yes for the acceptance case: baseline `PATCH {}` returned **200** and changed `updatedAt` from `...17.674Z` to `...17.688Z` (`B01-07`).
- **Actual root cause:** The in-memory repository stamped `updatedAt` on update calls without reliably comparing every mutable field, including the internal `nextTaskNumber`. Empty and same-value patches therefore produced a new timestamp.
- **Fix:** `InMemoryProjectsRepository.update()` computes `hasChanges` across `name`, `description`, `status`, and `nextTaskNumber`. `updatedAt` is set to the current time only when at least one supplied value differs from the stored value; otherwise the previous `updatedAt` is retained. Rejected PATCHes never reach the repository.
- **Files changed:** `src/projects/repositories/projects.repository.memory.ts`, `src/projects/repositories/projects.repository.memory.spec.ts`, `test/remediation.e2e-spec.ts`.
- **Tests added/updated:** Rejected empty PATCH causes no mutation; same-value name/description/status patch preserves `updatedAt`; real name/description/status changes update it; fake-timer deterministic assertions; internal counter update updates it.
- **Verification actually performed:** Unit tests with `vi.useFakeTimers()`, E2E assertions comparing timestamps before/after no-op and real patches, and post-fix live HTTP rejected-PATCH check.
- **Final status:** **Fixed**.
- **Remaining concerns:** E2E uses `>=` for real-change timestamps to avoid millisecond flakiness; deterministic exact-time coverage is provided by unit tests.

### BUG-05 — Invalid project status filter silently returns an empty list

- **Severity:** MEDIUM.
- **Original behaviour reproduced:** Yes. Baseline `?status=INVALID`, `?status=active`, and `?status=` all returned **200** with `[]` (`B05-04`–`B05-06`).
- **Actual root cause:** `ProjectsController.fetchProjects()` forwarded the raw query string to `ProjectsService.fetchProjects()`, which passed it to the repository without validating it against the existing `ProjectStatus` union (`ACTIVE` / `ARCHIVED`).
- **Fix:** `ProjectsService.fetchProjects()` now rejects any supplied status not in `PROJECT_STATUSES` with `BadRequestException('Invalid project status filter')` before calling the repository.
- **Files changed:** `src/projects/projects.service.ts`, `src/projects/projects.service.spec.ts`, `test/remediation.e2e-spec.ts`.
- **Tests added/updated:** No filter; each valid status; invalid uppercase, lowercase, and empty values; valid filtering returns the correct projects.
- **Verification actually performed:** Unit, E2E, and live HTTP. Post-fix all three invalid cases returned **400** with the expected message.
- **Final status:** **Fixed**.
- **Remaining concerns:** Empty `?status=` is treated as invalid per the existing API contract; this is intentional and documented below.

### BUG-06 — Unknown task-list query parameters are silently ignored

- **Severity:** LOW.
- **Original behaviour reproduced:** Yes. Baseline `?foo=bar` and `?foo=bar&status=TODO` returned **200** with all tasks (`B06-02`, `B06-03`).
- **Actual root cause:** `TasksController.getProjectTasks()` extracted only `status`, `priority`, and `assigneeId` from `@Query()` and built a new object. The service's existing `validateFilters()` never saw unknown keys, so its `rejectUnknownFields()` check could not fire.
- **Fix:** The controller now forwards the whole `@Query()` object to `TasksService.getProjectTasks()`. No validation logic was duplicated; the existing service `validateFilters()` rejects unknown keys and invalid supported values.
- **Files changed:** `src/tasks/tasks.controller.ts`, `src/tasks/tasks.controller.spec.ts`, `src/tasks/tasks.service.spec.ts`, `test/remediation.e2e-spec.ts`.
- **Tests added/updated:** No filters; each supported filter alone; multiple supported filters; unknown `foo`; unknown + valid; invalid status/priority; empty status/priority; valid filtering still works.
- **Verification actually performed:** Unit, E2E, and live HTTP. Post-fix unknown keys returned **400** with `Unknown or read-only fields: foo`.
- **Final status:** **Fixed**.
- **Remaining concerns:** Empty `assigneeId` remains an allowed string value because no existing contract rule forbids it; no new restriction was invented.

### BUG-07 — Swagger/OpenAPI documentation gaps

- **Severity:** LOW.
- **Original behaviour reproduced:** Not tested. Explicitly out of scope.
- **Actual root cause:** Documentation gaps exist in the existing Swagger document, but the assignment defers this work.
- **Fix / reason for deferral:** **Deferred — later OpenAPI phase.** No Swagger decorators, request schemas, DTOs, or `/docs-json` changes were made.
- **Files changed:** None.
- **Tests added/updated:** None.
- **Verification actually performed:** None; Swagger verification was not a required test for this assignment.
- **Final status:** **Deferred**.
- **Remaining concerns:** Must be tracked separately in the OpenAPI phase.

### BUG-08 — Partial task PATCH wipes omitted fields (previously fixed regression baseline)

- **Severity:** HIGH.
- **Original behaviour reproduced:** No. The earlier sparse-patch fix was already present in the working tree.
- **Actual root cause:** Originally the task service built a full replacement object, causing omitted fields to become `undefined` and overwriting stored values.
- **Fix / preservation:** No new application change was needed. `TasksService.updateTask()` continues to construct a sparse patch only from fields present in the request, treats explicit `null` as a real update, avoids repository updates for no-op patches, and the repository spreads the stored task before applying the patch.
- **Files changed:** No new BUG-08 application edit by this remediation. Regression coverage touched `src/tasks/tasks.service.spec.ts`, `src/tasks/Repositories/tasks.repository.memory.spec.ts`, and `test/remediation.e2e-spec.ts`.
- **Tests added/updated:** Single-field patches preserve all other fields; explicit `null` clears only the named field; no-op PATCH does not call repository update; live sparse PATCH check.
- **Verification actually performed:** Unit, E2E, and live HTTP console check. Post-fix sparse PATCH preserved description, status, priority, assigneeId, and dueDate.
- **Final status:** **Fixed (regression baseline passed)**.
- **Remaining concerns:** None observed.

### EP-02 — Task creation is missing the required `Location` header

- **Severity:** MEDIUM.
- **Original behaviour reproduced:** Yes. Baseline successful task creation returned **201** with no `Location` header (`EP-02`).
- **Actual root cause:** `TasksController.createTask()` returned the created task directly without setting a response header.
- **Fix:** After successful creation, the controller sets `Location: /api/v1/tasks/${task.id}`. The path was confirmed from the existing `@Get('tasks/:taskId')` route combined with the app's `/api` prefix and default v1 URI versioning. The header is set only after `TasksService.createTask()` resolves, so failed creation cannot emit a misleading header.
- **Files changed:** `src/tasks/tasks.controller.ts`, `src/tasks/tasks.controller.spec.ts`, `test/remediation.e2e-spec.ts`. `src/main.ts` was inspected to confirm the prefix/version but not changed.
- **Tests added/updated:** Successful creation sets header; failed creation does not set header; E2E follows the header and asserts the same task id/key; live HTTP follow-up.
- **Verification actually performed:** Unit, E2E, and live HTTP. Post-fix `Location: /api/v1/tasks/f3cec5e1-bcdb-46c6-86e4-a7e349181d94` was followed with **200** and the same id. A failed creation returned **404** with no `Location`.
- **Final status:** **Fixed**.
- **Remaining concerns:** The header is a relative URL, matching the confirmed in-app route shape.

---

## 3. Failed fixes and incomplete work

- No in-scope application fix was attempted, failed, and abandoned. All recorded failures in the baseline JSON were pre-fix bug reproductions, not failed fix attempts.
- During baseline tooling, an early version of `qa/remediation-baseline.mjs` introduced **9 new lint errors** (unused variables / console usage). These were removed before final verification.
- The remaining **16 pre-existing lint errors** in `qa/taskflow-http-qa-20261125.mjs` were subsequently cleaned up: unused helpers/variables were removed, `URL` was imported explicitly, and `console.log` calls were replaced with `process.stdout.write`. No ESLint rule or config was weakened.
- The complete project lint check now **PASSES**.
- BUG-07 is intentionally incomplete by design; it is deferred, not failed.
- No environment blocker prevented live HTTP verification. Temporary servers on ports 3301 and 3302 were started, used, and stopped; generated in-memory data was discarded with those servers.

---

## 4. New bugs discovered

### NB-01 — Deleting a missing project returned 204

- **Severity:** MEDIUM.
- **Reproduction steps:** Before the fix, send `DELETE /api/v1/projects/<nonexistent-uuid>` with a valid `X-Org-Id`; response was `204 No Content`.
- **Expected:** `404 Not Found`, consistent with GET/PATCH and comparable task endpoints.
- **Actual:** `204`, because `ProjectsService.deleteProject()` returned the repository's `false` without checking existence.
- **Affected files:** `src/projects/projects.service.ts`, `src/projects/projects.service.spec.ts`.
- **Fixed:** Yes. The service now calls `findById()` first and throws `NotFoundException`; it also deletes the project's tasks before deleting the project. Unit tests cover both the missing-project throw and the cleanup ordering.
- **Live HTTP coverage:** Not separately recorded in the JSON script; verified by unit tests and included in the API contract changes below.

### NB-02 — Pre-existing lint failures in QA script

- **Severity:** LOW (tooling/hygiene, not runtime API behaviour).
- **Reproduction steps:** Run `npm run lint`.
- **Expected:** Clean lint.
- **Actual:** 16 errors in `qa/taskflow-http-qa-20261125.mjs` (unused variables, `console` usage, `URL` global not defined).
- **Affected files:** `qa/taskflow-http-qa-20261125.mjs`.
- **Fixed:** Yes. Unused helpers/variables were removed, `URL` is imported from `node:url`, and the five `console.log` calls now use `process.stdout.write`. `npm run lint` exits 0.

No other new application bugs were discovered. No scope was silently expanded into later-phase architecture.

---

## 5. Automated test results

### Final results (after fixes)

| Check | Command | Result | Evidence |
|---|---|---|---|
| Unit tests | `npm test` | **PASS** | `Test Files 7 passed (7)`, `Tests 137 passed (137)` |
| E2E tests | `npm run test:e2e` | **PASS** | `Test Files 3 passed (3)`, `Tests 10 passed (10)` |
| Type checking | `npm run type-check` | **PASS** | `tsc --noEmit` produced no output |
| Linting | `npm run lint` | **PASS** | `eslint .` produced no output; exit code 0 |
| Production build | `npm run build` | **PASS** | `nest build` produced no output |

Additional final output detail:

- Unit runner: Vitest 4.1.12, duration 10.11s on the final run.
- E2E runner: Vitest 4.1.12 with `vitest.config.e2e.ts`, duration 9.22s on the final run.
- `node --check qa/taskflow-http-qa-20261125.mjs` — **PASS**, no output.

### Baseline results (before fixes)

| Check | Result | Evidence |
|---|---|---|
| `npm test` | **PASS** | 7 test files, 106 tests passed |
| `npm run test:e2e` | **PASS** | 2 test files, 2 tests passed |
| `npm run type-check` | **PASS** | Clean |
| `npm run lint` | **FAIL** | 25 errors at that time: 16 pre-existing QA-script errors + 9 from the initial baseline script; all were later removed and the final check passes |
| `npm run build` | Not separately recorded at baseline | Final build is PASS |

Test counts increased from 106 to 137 unit tests and from 2 to 10 E2E tests. No existing test was weakened, skipped, or deleted merely to make the suite pass.

---

## 6. HTTP QA results

Live verification used the real Nest application with `/api` prefix and URI versioning (`/api/v1`). Baseline server: `http://127.0.0.1:3301`. Post-fix server: `http://127.0.0.1:3302`. Evidence files:

- `qa/remediation-baseline-results.json` — 28 records, **10 PASS / 18 FAIL**.
- `qa/remediation-postfix-results.json` — 29 records, **29 PASS / 0 FAIL**.

All requests included a valid UUID `X-Org-Id` header unless testing organization isolation. Error bodies used Nest's standard `{ message, error, statusCode }` shape.

| Method | Endpoint | Scenario | Expected | Baseline actual | Post-fix actual | Result | Notes |
|---|---|---|---:|---:|---:|---|---|
| POST | `/api/v1/projects` | Valid create | 201 | 201 | 201 | PASS | Response contains only public project fields |
| POST | `/api/v1/projects` | Empty `{}` body | 400 | 201 | 400 | PASS | Post-fix message: `Key is required and must be a non-empty string` |
| POST | `/api/v1/projects` | Key only, missing name | 400 | 201 | 400 | PASS | Post-fix message: `Name is required and must be a non-empty string` |
| POST | `/api/v1/projects` | Numeric description | 400 | 201 | 400 | PASS | Post-fix message: `Description must be a string or null` |
| POST | `/api/v1/projects` | Array body | 400 | 201 | 400 | PASS | Post-fix message: `Request body must be an object` |
| POST | `/api/v1/projects` | Read-only `status` / `owner` | 400 | 201 | 400 | PASS | Post-fix: `Unknown or read-only fields: status, owner` |
| POST | `/api/v1/projects` | Internal `nextTaskNumber` | 400 | Not recorded in JSON | 400 | PASS | Covered by unit + E2E |
| GET | `/api/v1/projects/:id` | Existing project | 200 | 200 | 200 | PASS | Public key/name/status returned |
| GET | `/api/v1/projects/:id` | Nonexistent project | 404 | 200, body `null` | 404 | PASS | Post-fix message: `Project not found` |
| GET | `/api/v1/projects/:id` | Foreign-org project | 404 | 200, body `null` | 404 | PASS | Same response as nonexistent; isolation preserved |
| PATCH | `/api/v1/projects/:id` | Nonexistent project | 404 | 200, body `null` | 404 | PASS | No mutation |
| PATCH | `/api/v1/projects/:id` | Foreign-org project | 404 | 200, body `null` | 404 | PASS | Same response as nonexistent; isolation preserved |
| PATCH | `/api/v1/projects/:id` | Empty `{}` body | 400 | 200, `updatedAt` changed | 400 | PASS | Rejected before repository call; no mutation |
| PATCH | `/api/v1/projects/:id` | Immutable `key` | 400 | 400 | 400 | PASS | Baseline BUG-03-era protection preserved |
| PATCH | `/api/v1/projects/:id` | Internal `nextTaskNumber` | 400 | 400 | 400 | PASS | Baseline BUG-03-era protection preserved |
| PATCH | `/api/v1/projects/:id` | Valid partial update | 200 | 200 | 200 | PASS | `updatedAt` changes for a real change |
| GET | `/api/v1/projects` | No status filter | 200 | 200 | 200 | PASS | Lists only the caller's org |
| GET | `/api/v1/projects?status=ACTIVE` | Valid uppercase status | 200 | 200 | 200 | PASS | Correct projects returned |
| GET | `/api/v1/projects?status=ARCHIVED` | Valid uppercase status | 200 | 200 | 200 | PASS | Empty list when none archived |
| GET | `/api/v1/projects?status=INVALID` | Invalid status | 400 | 200 `[]` | 400 | PASS | Post-fix: `Invalid project status filter` |
| GET | `/api/v1/projects?status=active` | Lowercase status | 400 | 200 `[]` | 400 | PASS | Post-fix: `Invalid project status filter` |
| GET | `/api/v1/projects?status=` | Empty status | 400 | 200 `[]` | 400 | PASS | Post-fix: `Invalid project status filter` |
| GET | `/api/v1/projects/:id/tasks` | No filters | 200 | 200 | 200 | PASS | Supported filter validation preserved |
| GET | `/api/v1/projects/:id/tasks?foo=bar` | Unknown query key | 400 | 200 | 400 | PASS | Post-fix: `Unknown or read-only fields: foo` |
| GET | `/api/v1/projects/:id/tasks?foo=bar&status=TODO` | Unknown + valid key | 400 | 200 | 400 | PASS | Unknown key rejected before filtering |
| GET | `/api/v1/projects/:id/tasks?status=BANANA` | Invalid status filter | 400 | 400 | 400 | PASS | Existing task validation preserved |
| POST | `/api/v1/projects/:id/tasks` | Successful creation | 201 + `Location` | 201, no header | 201, `Location: /api/v1/tasks/<uuid>` | PASS | Header points to confirmed retrieval route |
| GET | `/api/v1/tasks/<uuid>` | Follow `Location` | 200 | Not run pre-fix | 200 | PASS | Returned task id matched created id |
| POST | `/api/v1/projects/<missing>/tasks` | Failed creation | No `Location` | No header | 404, no header | PASS | Live console check `EP-02-N` |
| PATCH | `/api/v1/tasks/:id` | Sparse patch | Preserves omitted fields | Already fixed | 200, fields preserved | PASS | Live console check `B08-01` + E2E |
| GET | `/api/v1/projects/:id` | After project deletion | 404 | 200, body `null` | 404 | PASS | Record `B02-06` |
| PATCH | `/api/v1/projects/:id` | After project deletion | 404 | 200, body `null` | 404 | PASS | Record `B02-07` |

Notable post-fix response details from `qa/remediation-postfix-results.json`:

- Not found: `{ "message": "Project not found", "error": "Not Found", "statusCode": 404 }`.
- Invalid create/PATCH/filter: `{ "message": "...", "error": "Bad Request", "statusCode": 400 }`.
- Created task key remained sequential, e.g. `BASE014BF2EFW-1`, confirming BUG-03 did not regress.
- Test data used unique generated organization and project IDs; no production data was touched.

---

## 7. Files changed

### Application code changed by this remediation

| File | Reason |
|---|---|
| `src/projects/projects.service.ts` | Create/PATCH validation, project status filter validation, 404 semantics, delete guard/task cleanup, internal counter update helper. |
| `src/projects/projects.controller.ts` | HTTP-boundary rejection of malformed PATCH bodies and immutable/internal/unknown PATCH fields. |
| `src/projects/repositories/projects.repository.memory.ts` | No-op-aware `updatedAt` and internal `nextTaskNumber` patch support. |
| `src/tasks/tasks.controller.ts` | Successful task creation `Location` header; whole query object forwarding for BUG-06. |

### Tests added or updated by this remediation

| File | Reason |
|---|---|
| `src/projects/projects.service.spec.ts` | Create/PATCH validation, 404s, filters, delete guard, internal counter behavior. |
| `src/projects/projects.controller.spec.ts` | Malformed and unsupported PATCH body rejection at controller boundary. |
| `src/projects/repositories/projects.repository.memory.spec.ts` | Deterministic timestamp/no-op/internal-counter tests. |
| `src/tasks/tasks.controller.spec.ts` | `Location` header success/failure and complete query forwarding. |
| `src/tasks/tasks.service.spec.ts` | Filter validation, sparse PATCH regression, task numbering/creation behavior. |
| `test/remediation.e2e-spec.ts` | New real-HTTP regression suite covering BUG-01/02/04/05/06, EP-02, BUG-03, BUG-08. |

### QA evidence added or cleaned

| File | Reason |
|---|---|
| `qa/remediation-baseline.mjs` | Reusable live HTTP reproduction/verification script. |
| `qa/remediation-baseline-results.json` | Recorded pre-fix HTTP behaviour. |
| `qa/remediation-postfix-results.json` | Recorded post-fix HTTP behaviour. |
| `qa/taskflow-http-qa-20261125.mjs` | Cleaned pre-existing lint errors: removed unused helpers/variables, imported `URL`, replaced `console.log` with `process.stdout.write`. |

### Documentation

| File | Reason |
|---|---|
| `TASKFLOW_QA_REMEDIATION_REPORT.md` | This required engineering report. |
| `docs/http/phase1.http` | Phase 1 HTTP request collection covering project setup, all task endpoints, filters, transitions, tenancy, archived projects, deletion, and cascade behaviour. |
| `TASKFLOW_Phase1_Bug_Remediation_Prompt.md` | Assignment file supplied by the user; present untracked, not modified. |

### Pre-existing working-tree changes preserved, not authored by this remediation

These were already modified/untracked when work began and were deliberately left intact except where the table above says otherwise:

- `src/app.controller.spec.ts` — Vitest-style app controller tests.
- `src/app.module.ts` — `TasksModule` registration.
- `src/projects/projects.module.ts` — `TasksRepositoryModule` import and `ProjectsService` export.
- `src/projects/projects.types.ts` — `ProjectUpdate` / `ProjectInternalPatch` separation.
- `src/projects/repositories/projects.repository.ts` and `src/projects/repositories/projects.repository.stub.ts` — internal patch type usage.
- `src/common/decorators/org-id.decorator.ts` — `X-Org-Id` validation.
- `src/tasks/` — tasks module, controller, service, repository, types, and most specs (BUG-08 fix and tasks feature).
- `test/projects.e2e-spec.ts` — existing HTTP suite.
- `qa/TaskFlow-API-Test-Report.md`, `qa/api-qa-results.json`, `qa/api-qa.mjs`, `qa/http-qa-20261125-report.md`, `qa/http-qa-20261125-results.json` — earlier QA artifacts. `qa/taskflow-http-qa-20261125.mjs` was already present but has since been lint-cleaned as listed above.

No files were deleted. `git diff --check` reported no whitespace errors.

---

## 8. API contract changes

### Project creation — `POST /api/v1/projects`

- **Accepted body:** plain JSON object with:
  - `key`: required non-empty string.
  - `name`: required non-empty string.
  - `description`: optional string or `null`.
- **Rejected:** empty/null/array/string body, missing/blank `key` or `name`, non-string/non-null `description`, and any unknown/read-only/internal field such as `status`, `owner`, `id`, timestamps, `organizationId`, `nextTaskNumber`.
- **Success:** `201` with public project fields only.
- **Failure:** `400` with standard Nest error body.

### Project retrieval/list — `GET /api/v1/projects`, `GET /api/v1/projects/:id`

- List accepts no filter or `status=ACTIVE|ARCHIVED`.
- Invalid/lowercase/empty `status` now returns `400`.
- Missing, foreign-org, or deleted project by ID returns `404` with `Project not found`.
- Responses omit `organizationId` and `nextTaskNumber`.

### Project update — `PATCH /api/v1/projects/:id`

- **Accepted body:** non-empty plain object containing only `name`, `description`, and/or `status`.
- `status` must be `ACTIVE` or `ARCHIVED`.
- **Rejected:** `{}`, `null`, arrays, strings, `key`, `nextTaskNumber`, unknown fields, invalid status, wrong value types → `400`.
- Missing/foreign/deleted project → `404`.
- Repeated current values → `200` with unchanged `updatedAt`.
- Real changes → `200` with refreshed `updatedAt`.

### Project deletion — `DELETE /api/v1/projects/:id`

- Existing project → `204` and its tasks are removed first.
- Missing/foreign/deleted project → **404** (intentional change from the previous `204` success).

### Task list — `GET /api/v1/projects/:projectId/tasks`

- Supported filters: `status`, `priority`, `assigneeId`.
- Unknown keys are rejected with `400`.
- Invalid `status` or `priority`, including empty strings, are rejected with `400`.
- Empty `assigneeId` remains accepted because no existing contract rule forbids it.
- Missing/foreign project → `404`.

### Task creation — `POST /api/v1/projects/:projectId/tasks`

- Success remains `201` with the existing task body.
- New response header: `Location: /api/v1/tasks/:taskId`.
- Failed creation returns `400`/`404`/`409` as appropriate and no `Location`.
- Task numbering remains sequential and server-controlled; response `key` is `<projectKey>-<number>`.

### Breaking changes

The following are intentional contract corrections and may affect clients that relied on the buggy behaviour:

1. Invalid project create bodies now return `400` instead of `201`.
2. `PATCH /projects/:id` with `{}` now returns `400` instead of `200`.
3. Missing/foreign/deleted project GET and PATCH now return `404` instead of `200` with an empty body.
4. Missing project DELETE now returns `404` instead of `204`.
5. Invalid/empty project status filters now return `400` instead of `200 []`.
6. Unknown task-list query keys now return `400` instead of being ignored.
7. Successful task creation now includes a `Location` response header.

---

## 9. Security and data-integrity review

- **Organization isolation:** All repository reads/writes remain scoped by `orgId`. A project belonging to another organization produces the same `404 Project not found` as a nonexistent ID for GET, PATCH, and DELETE. Task operations resolve the parent project through the same org-scoped path.
- **Mass assignment:** Create accepts only `key`, `name`, `description`. PATCH accepts only `name`, `description`, `status`. Unknown/read-only/internal fields are rejected before service mutation.
- **Internal-field exposure:** `ProjectResponse` omits `organizationId` and `nextTaskNumber`; task responses omit `organizationId`. The counter is updated only via the server-side internal patch path used by task creation.
- **PATCH data preservation:** Project updates preserve omitted fields. Task updates construct sparse patches so omitted fields are not overwritten; explicit `null` is a deliberate clear operation.
- **Deletion behaviour:** Project deletion is guarded by existence and removes dependent tasks before removing the project, avoiding orphaned tasks in memory.
- **Task numbering:** `nextTaskNumber` is incremented by `TasksService` after creation; failed counter updates roll back the created task. E2E verified numbers `1` and `2`.
- **Invalid-input handling:** Explicit checks reject malformed bodies and invalid filters with `400` before repository calls. Rejected PATCHes do not mutate `updatedAt` or any other field.
- **No new attack surface:** No new dependencies, no DTO/decorator validation framework, no DB, no auth/RBAC changes, and no Swagger changes were introduced. The only pipe-related code is Nest's built-in `ParseUUIDPipe` already used for path IDs in the working tree.

---

## 10. Deferred work and technical debt

### BUG-07 — Swagger/OpenAPI work

Deferred to the later OpenAPI phase. No request-body schemas, no `/docs-json` modifications, no Swagger decorators, and no DTOs added for documentation purposes. Previously observed gaps remain open.

### Phase 2 validation architecture intentionally not introduced

No DTO classes, `class-validator`, `class-transformer`, global `ValidationPipe`, custom validation pipes, or generalized validation framework were added. The checks in this change set are narrow, explicit, and tied to the Phase 1 acceptance contract.

### Other notes, resolved items, and recommendations

1. **Pre-existing lint debt — resolved:** `qa/taskflow-http-qa-20261125.mjs` was cleaned up (unused helpers/variables removed, `URL` imported, `console.log` replaced with `process.stdout.write`). `npm run lint` now exits 0.
2. **Phase 1 HTTP documentation — added:** `docs/http/phase1.http` contains the manual request collection for the implemented endpoints and acceptance scenarios.
3. **QA script organization:** Several older QA artifacts still exist in `qa/`. Consider consolidating them once the OpenAPI phase is complete.
4. **In-memory persistence:** State is intentionally ephemeral. Any future database phase should enforce key uniqueness/status values/organization scoping at the persistence layer as well.
5. **Timestamp precision:** E2E timestamp comparisons avoid exact equality for real changes; deterministic unit tests use fake timers. Keep this pattern if more timestamp assertions are added.

Items 3-5 are not represented as fixed in this report.

---

## 11. Final verdict

**READY.**

Evidence:

- All six in-scope issues (**BUG-01, BUG-02, BUG-04, BUG-05, BUG-06, EP-02**) are fixed and verified by unit tests, E2E HTTP tests, and live HTTP runs.
- Both regression baselines (**BUG-03, BUG-08**) passed after the changes.
- BUG-07 remains explicitly **Deferred**, as required.
- Unit tests: **137 passed**. E2E tests: **10 passed**. Type-check: **PASS**. Build: **PASS**. Lint: **PASS**.
- `node --check qa/taskflow-http-qa-20261125.mjs`: **PASS**.
- Live HTTP evidence improved from **10 PASS / 18 FAIL** at baseline to **29 PASS / 0 FAIL** after the fixes.
- `docs/http/phase1.http` was added as the Phase 1 HTTP request collection, covering project setup, all task endpoints, filters, transitions, tenancy, archived projects, deletion, and cascade behaviour.
- The previous lint blocker was resolved by cleaning `qa/taskflow-http-qa-20261125.mjs` without weakening ESLint configuration.

The implementation is complete, behaviourally ready, and all required final checks pass.
