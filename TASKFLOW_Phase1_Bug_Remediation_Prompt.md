# TaskFlow — Phase 1 Bug Remediation & QA Assignment

## Your role

Act as a senior NestJS backend engineer, QA engineer, and API security reviewer.

Investigate and fix the in-scope TaskFlow API issues below. Add regression tests, verify actual HTTP behaviour, and produce a detailed engineering report. Work within the project's current implementation and learning stage; do not introduce architecture that belongs to later curriculum phases.

You do **not** have the curriculum PDF. The following section therefore defines exactly what “Phase 1 architecture” means for this assignment. Treat these instructions as the source of truth.

---

## 1. Project context and architectural boundaries

TaskFlow is a NestJS backend written in TypeScript. It currently uses in-memory repositories and the project's existing Vitest/unit/E2E test setup. Inspect the actual repository before making assumptions about file names, commands, routes, or conventions.

### What “Phase 1 architecture” means here

This is the initial NestJS REST/API architecture stage. The application should use the concepts and structures already present in the repository:

- NestJS modules, controllers, services, and dependency injection.
- Controllers handle HTTP concerns and delegate application work to services.
- Services contain application/business rules.
- Repository interfaces/abstractions separate services from the in-memory persistence implementation.
- Basic REST endpoints and HTTP status/error handling.
- TypeScript types/interfaces for compile-time structure.
- Simple, explicit checks where the Phase 1 API contract requires runtime rejection of invalid input.
- In-memory CRUD behaviour, including organization scoping and the project's existing domain rules.

### Do not introduce later-phase architecture

For this assignment, **do not** add or migrate to any of the following:

- DTO classes as a new validation architecture.
- `class-validator` or `class-transformer`.
- A global NestJS `ValidationPipe`.
- Custom validation pipes or a generalized validation framework.
- PostgreSQL, TypeORM, migrations, or database repositories.
- JWT authentication, RBAC, or authorization framework changes.
- Swagger/OpenAPI work.

Those concepts are intentionally introduced in later phases. Do not install packages or create abstractions for them as part of these fixes. If the existing repository already contains any such code, do not remove unrelated existing functionality; simply do not expand or rely on it for this assignment.

For request checks required now, use the simplest appropriate mechanism consistent with the existing codebase. Keep checks explicit, focused, and located at the correct boundary. Do not build a miniature DTO/validation framework.

### Previously fixed bugs

Eight bugs were identified during earlier manual HTTP QA. Two are already fixed:

- **BUG-03:** Project `nextTaskNumber` mass assignment.
- **BUG-08:** Partial task PATCH wipes omitted fields.

Do not regress either fix. Re-test them as regression baselines.

---

## 2. Scope: issues to fix now

Fix **BUG-01, BUG-02, BUG-04, BUG-05, BUG-06, and EP-02**.

Do not implement BUG-07 in this assignment; it is explicitly deferred to the later OpenAPI/Swagger phase.

### BUG-01 — HIGH: Project endpoints accept invalid request bodies

**Previously observed behaviour:**

- `POST /projects` with `{}` returned 201 and created a project without required values.
- A missing name was accepted.
- A numeric description was accepted and persisted.
- An array body was accepted.
- Read-only or unsupported properties were silently ignored.

**What to do:**

1. Inspect the current project create/update controller and service flow.
2. Reproduce the Phase 1 contract failures before changing code, where possible.
3. Correct only the invalid behaviours required by the current Phase 1 contract.
4. Keep the implementation simple and consistent with the existing controller/service architecture.
5. Reject malformed or structurally invalid project request bodies with HTTP 400.
6. Reject attempts to set server-controlled/internal fields, especially `nextTaskNumber`, with HTTP 400. Preserve the existing BUG-03 public/internal patch separation.
7. Do not silently accept a request body that violates the documented Phase 1 contract.

**Important scope limit:** Do not interpret this as permission to implement comprehensive field validation. Do not add DTO classes, decorators, `class-validator`, `ValidationPipe`, custom pipes, or a general validation layer. Only implement the basic checks necessary for the Phase 1 acceptance cases and the existing documented API contract. Do not invent new restrictions (such as arbitrary maximum lengths or new enum rules) unless they are already required by the project's contract.

**Required checks/tests:**

- Valid project creation still works.
- Empty create body is rejected where required by the existing contract.
- Missing required project fields are rejected.
- Invalid body shape (such as an array or `null`, where it can reach the controller) is rejected.
- Unsupported/read-only/internal properties are rejected rather than silently ignored.
- `PATCH {}` returns HTTP 400, as required by the Phase 1 acceptance criteria.
- PATCH attempting to change `key` returns HTTP 400, as required by the Phase 1 acceptance criteria.
- Existing valid partial updates continue to work.

If any observed behaviour is not actually required by the Phase 1 contract, document it rather than broadening validation unnecessarily.

### BUG-02 — HIGH: Missing projects return HTTP 200 with an empty body

**Previously observed behaviour:**

- `GET /projects/:id` for a nonexistent, foreign-organization, or deleted project returned 200 with an empty body.
- `PATCH /projects/:id` for a nonexistent, foreign-organization, or deleted project returned 200 with an empty body.
- Comparable task endpoints already return 404.

**What to do:**

- Make project retrieval and update return a proper 404 when the project is not found or is not accessible in the supplied organization.
- Use NestJS's existing exception conventions, such as `NotFoundException`, where appropriate.
- Preserve organization isolation: a project belonging to another organization must look the same as a nonexistent project to the caller.
- Inspect other project operations for the same null-return/success-response defect, but do not expand scope into unrelated refactoring.

**Required tests:**

- GET existing project → 200.
- GET nonexistent, foreign-organization, and deleted project → 404.
- PATCH existing project → expected success.
- PATCH nonexistent, foreign-organization, and deleted project → 404.
- Assert both status and response behaviour.

### BUG-04 — MEDIUM: No-op project PATCH changes `updatedAt`

**Previously observed behaviour:**

- An empty/no-op project PATCH or a PATCH that repeats the current value changes `updatedAt`.

**What to do:**

- Ensure `updatedAt` changes only when a real project field value changes.
- A request that is rejected (including `PATCH {}` under the Phase 1 contract) must not mutate the project.
- Repeating an identical field value must not mutate `updatedAt`.
- Actual changes must update `updatedAt`.
- Internal `nextTaskNumber` updates must continue working correctly.
- Preserve BUG-03's public/internal patch separation.

**Required tests:**

- Empty PATCH rejected and no mutation occurs.
- Same-name/same-description/same-status updates do not change `updatedAt` when those fields are supplied with their existing values.
- Actual name, description, and status changes update `updatedAt`.
- Internal task-counter updates still work.
- Use deterministic timestamp assertions; avoid fragile sleeps/timing assumptions.

### BUG-05 — MEDIUM: Invalid project status filter silently returns an empty list

**Previously observed behaviour:**

- `GET /projects?status=INVALID` returned 200 with `[]`.
- `GET /projects?status=active` returned 200 with `[]`.
- Invalid task filter values are already rejected with 400.

**What to do:**

- Validate a supplied project status against the actual `ProjectStatus` values already defined in the project.
- Invalid values must return HTTP 400, not an empty list.
- Do not add a DTO/pipe validation framework. Use a focused explicit check that fits the existing code.
- Preserve valid project filtering.

**Required tests:**

- No status filter.
- Each valid project status.
- Invalid uppercase and lowercase values.
- Empty status value, according to the existing API contract.
- Confirm valid filtering still returns the correct projects.

### BUG-06 — LOW: Unknown task-list query parameters are silently ignored

**Previously observed behaviour:**

- `GET /projects/:projectId/tasks?foo=bar` returned 200 with all tasks.
- The service has a `validateFilters()`-style check, but the controller forwards only recognized fields (`status`, `priority`, and `assigneeId`), so unknown query keys never reach it.

**What to do:**

- Inspect the full incoming query object at the HTTP boundary before discarding unknown keys.
- Reject unsupported task-list query parameters with HTTP 400.
- Preserve the supported filters: `status`, `priority`, and `assigneeId`.
- Preserve existing validation of invalid supported filter values.
- Avoid duplicate validation logic and avoid adding DTO classes, decorators, `ValidationPipe`, or custom pipes.

**Required tests:**

- No filters.
- Each supported filter individually.
- Multiple supported filters together.
- Unknown `foo` parameter.
- Unknown parameter mixed with a valid filter.
- Invalid status and priority.
- Empty filter values according to the existing contract.
- Valid filtering continues to return the correct tasks.

### EP-02 — MEDIUM: Task creation is missing the required `Location` header

The Phase 1 API contract explicitly requires successful resource creation endpoints to return **HTTP 201 with a `Location` header**. The task creation endpoint currently returns 201 without that header.

**What to do:**

- Inspect the actual task routes before constructing the header.
- On successful `POST /projects/:projectId/tasks`, return a `Location` header pointing to the newly created task's existing retrieval endpoint.
- The current task retrieval route is expected to be `GET /tasks/:taskId`, but confirm this in the code rather than assuming.
- Keep the existing 201 status and response body unless the existing contract requires otherwise.
- Do not emit a misleading Location header when task creation fails.

**Required tests:**

- Successful task creation returns 201.
- The response includes `Location`.
- The Location value identifies the created task's retrieval endpoint.
- Following the Location value retrieves the same task.
- Failed task creation does not return a misleading Location header.
- Task key generation and sequential numbering remain correct.

---

## 3. Explicitly deferred issue

### BUG-07 — LOW: Swagger/OpenAPI documentation gaps — DEFERRED

Do not implement this issue now. The curriculum places OpenAPI/Swagger documentation work in a later phase.

Previously observed gaps included missing request-body schemas and incorrectly required optional query parameters in `/docs-json`.

For this assignment:

- Do not add Swagger decorators or request schemas.
- Do not add DTO classes just to improve Swagger output.
- Do not modify the OpenAPI document.
- Record BUG-07 in the final report as **Deferred — later OpenAPI phase**, not Fixed, Not Reproduced, or Failed.
- Do not include Swagger verification as a required test for this assignment.

---

## 4. Preserve and verify earlier fixes

### BUG-03 — HIGH: Project `nextTaskNumber` mass assignment — ALREADY FIXED

Preserve and verify:

- Public `ProjectPatch` cannot modify `nextTaskNumber`.
- Internal `ProjectInternalPatch` (or the repository's equivalent separation) permits legitimate server-side counter updates.
- HTTP attempts to submit `nextTaskNumber` are rejected with 400.
- Task numbering remains sequential and server-controlled.

### BUG-08 — HIGH: Partial task PATCH wipes omitted fields — ALREADY FIXED

Preserve and verify:

- Task service constructs a sparse patch.
- Omitted properties remain unchanged.
- Explicit `null` is handled according to the existing contract.
- Repository updates do not overwrite omitted values with `undefined`.

Do not rewrite these fixes unnecessarily. Add or retain regression coverage and run it after the in-scope changes.

---

## 5. General implementation requirements

- Inspect the repository before editing. Read the relevant controllers, services, repository interfaces/implementations, types, modules, decorators, and tests.
- Confirm the actual package scripts and test infrastructure from `package.json`.
- Reproduce the reported bugs where practical before fixing them.
- Follow the existing ES module/import conventions and project style.
- Keep changes focused. Avoid unrelated refactors and new dependencies.
- Do not use `any`.
- Do not weaken, skip, delete, or rewrite existing tests merely to make the suite pass.
- Do not silently swallow errors or return success for invalid requests.
- Preserve organization isolation and prevent internal fields from being exposed or mass-assigned.
- Do not claim a bug is fixed based only on code inspection.

---

## 6. Verification requirements

### A. Unit tests

Add or update focused unit tests for each changed service/repository behaviour. Cover valid operations, invalid operations, missing resources, organization isolation, no-op updates, filters, task creation, and the BUG-03/BUG-08 regression baselines.

### B. E2E tests

Use the project's existing E2E infrastructure to test real HTTP requests against the NestJS application. Do not substitute direct service calls for HTTP tests.

Include methods, URLs, headers, request bodies/query parameters, status assertions, response-body assertions, and relevant headers.

### C. Live HTTP verification

Where the repository and environment support it:

- Start the application using its intended local test configuration.
- Send actual HTTP requests to affected endpoints.
- Verify responses and headers.
- Use unique test data and clean it up.
- Never run destructive tests against production data.
- Clearly report any environment blocker.
- Do not call unit tests or in-process E2E tests “live HTTP verification” unless you actually started the server and made HTTP requests to it.

### D. Run the complete project checks

Inspect `package.json` and run the actual available scripts for:

- Unit tests (expected script may be `npm test`).
- E2E tests (expected script may be `npm run test:e2e`).
- Type checking (expected script may be `npm run type-check`).
- Linting (expected script may be `npm run lint`).
- Production build (use the project's actual build script).

If a named script does not exist, do not invent a passing result. Identify the correct available equivalent or report it as unavailable. Investigate failures caused by your changes. Report pre-existing failures separately.

---

## 7. Required final report

Create `TASKFLOW_QA_REMEDIATION_REPORT.md` in the project root. The report must be detailed and evidence-based.

### 1. Executive summary

State the overall outcome, issues fixed, issues deferred, unresolved issues, verification status, and significant risks.

### 2. Issue-by-issue results

Include a table or clearly separated sections for:

- BUG-01
- BUG-02
- BUG-03 (previously fixed regression baseline)
- BUG-04
- BUG-05
- BUG-06
- BUG-07 (deferred)
- BUG-08 (previously fixed regression baseline)
- EP-02

For each, report:

- Severity.
- Whether the original behaviour was reproduced.
- Actual root cause.
- Fix or reason for deferral.
- Exact files changed.
- Tests added/updated.
- Verification actually performed.
- Final status: Fixed / Partially Fixed / Unresolved / Deferred.
- Remaining concerns.

### 3. Failed fixes and incomplete work

Document attempted fixes that failed, why they failed, alternatives used, incomplete work, and blockers. Do not conceal unsuccessful attempts.

### 4. New bugs discovered

For every newly discovered issue, include severity, reproduction steps, expected/actual behaviour, affected files, and whether it was fixed. Do not silently expand scope to unrelated work.

### 5. Automated test results

Provide actual PASS / FAIL / BLOCKED results for unit tests, E2E tests, type-check, lint, and build. Include test-file counts, test counts, and failure summaries only when the tools actually report them. Never invent counts.

### 6. HTTP QA results

Provide a table with endpoint, method, scenario, expected status, actual status, result, and notes. Include relevant request/response headers, organization isolation, missing resources, PATCH semantics, project status filters, task filters, and task creation Location behaviour.

### 7. Files changed

List every added, modified, and deleted file with a concise reason. Group application code, tests, configuration, and documentation.

### 8. API contract changes

Document accepted/rejected request fields, required fields, HTTP status codes, error behaviour, query parameters, and response headers. Identify breaking changes explicitly.

### 9. Security and data-integrity review

Summarize organization isolation, mass assignment, internal-field exposure, PATCH data preservation, deletion behaviour, task numbering, and invalid-input handling.

### 10. Deferred work and technical debt

Clearly separate:

- BUG-07 Swagger/OpenAPI work deferred to the later OpenAPI phase.
- Any Phase 2 validation architecture intentionally not introduced here.
- Other recommendations or unrelated issues discovered.

Do not describe deferred work as fixed.

### 11. Final verdict

Choose one:

- **READY** — all in-scope issues fixed and all required verification passed.
- **READY WITH CAVEATS** — implementation is complete, but some verification or lower-risk concerns remain.
- **NOT READY** — important in-scope issues or required verification remain incomplete/failed.

Explain the verdict with evidence.

---

## 8. Final operating instructions

Proceed in this order:

1. Inspect the repository and package scripts.
2. Map each issue to the actual implementation.
3. Reproduce the bugs and record baseline behaviour.
4. Implement only the in-scope fixes, respecting the architectural boundaries above.
5. Add unit and E2E regression tests.
6. Run the complete test, type-check, lint, and build commands.
7. Perform live HTTP verification where possible.
8. Review the diff for unrelated changes and regressions.
9. Write `TASKFLOW_QA_REMEDIATION_REPORT.md`.
10. In your terminal response, provide a concise summary, the checks actually run, and the final verdict.

Be precise and honest. A code change is not proof of correctness. A test that was not run is not a passing test. A deferred issue is not a fixed issue.
