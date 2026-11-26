# Phase 2 Lab 2 Verification Report

**Verification date:** 2026-11-26  
**Final verdict: PASS**

## Summary

The original DTO edge cases were rerun against the actual API after remediation. Project and task validation cases all returned the expected status and response values. The prototype-sensitive `__proto__` request now returns 400 before controller/service execution.

The requested project checks all passed. An application-level test with mocked services proves malformed project/task requests and the prototype-key payload do not invoke their corresponding service methods. The test organization ID was isolated, and test projects/tasks were cleaned up through the API.

## Implementation and boundary checks

| Check | Evidence | Result |
|---|---|---|
| `whitelist: true` | `src/app.setup.ts` | PASS |
| `forbidNonWhitelisted: true` | `src/app.setup.ts` | PASS |
| `transform: true` | `src/app.setup.ts` | PASS |
| Implicit conversion disabled | `src/app.setup.ts` uses `enableImplicitConversion: false` | PASS |
| Shared `configureApp(app)` called by bootstrap | `src/main.ts` | PASS |
| ValidationPipe installed once | Single `useGlobalPipes` call in `configureApp` | PASS |
| Project creation uses `CreateProjectDto` | `src/projects/projects.controller.ts` | PASS |
| Task creation uses `CreateTaskDto` | `src/tasks/tasks.controller.ts` | PASS |
| Invalid project DTO does not invoke project service | `src/app.validation.spec.ts`, mocked `ProjectsService` | PASS |
| Invalid task DTO does not invoke task service | `src/app.validation.spec.ts`, mocked `TasksService` | PASS |
| Prototype-sensitive JSON keys are rejected before service | Parser reviver in `configureApp`; app-level service-spy test | PASS |
| Invalid project UUID route parameter | Live `GET /api/v1/projects/not-a-uuid` returned 400 | PASS |
| No redundant hand-written request validation in the relevant controllers/services | Source inspection; validation is declarative in DTOs, while business rules remain in services | PASS |

### Prototype-key investigation

The original default JSON parsing path followed by DTO transformation allowed the `__proto__` property to disappear before ValidationPipe's whitelist handling could reject it. The fix makes `configureApp` own JSON parsing: bootstrap disables Nest's implicit body parser, and the shared setup installs Express JSON parsing with a reviver that rejects `__proto__`, `constructor`, and `prototype` keys. This happens before DTO transformation and route invocation. The global ValidationPipe remains installed once and unchanged in purpose.

## CreateProjectDto HTTP cases

Requests used `POST /api/v1/projects` with the dedicated QA organization ID.

| Input | Expected | Actual | Result |
|---|---:|---:|---|
| key `"tf"` | 201; normalized to `"TF"` | 201; response key `"TF"` | PASS |
| key `"TF"` | 201 | 201; response key `"TF"` | PASS |
| key `"T"` | 400 | 400 | PASS |
| key `"1AB"` | 400 | 400 | PASS |
| key `"ABCDEF"` | 400 | 400 | PASS |
| name `"   "` | 400 | 400 | PASS |
| Name with 120 characters | 201 | 201; response included the full name | PASS |
| Name with 121 characters | 400 | 400 | PASS |
| Description with 2,001 characters | 400 | 400 | PASS |
| Extra property `isAdmin` | 400 | 400 | PASS |
| Empty request body | 400 | 400 | PASS |
| Body `{"key":"PP","name":"proto","__proto__":{"x":1}}` | 400 | 400; prototype-sensitive property error | PASS |

## CreateTaskDto HTTP cases

A prerequisite project was created successfully. Requests used `POST /api/v1/projects/{projectId}/tasks`.

| Input | Expected | Actual | Result |
|---|---:|---:|---|
| Empty title | 400 | 400 | PASS |
| Title with 200 characters | 201 | 201; response contained title | PASS |
| Title with 201 characters | 400 | 400 | PASS |
| Missing priority | 201; priority `MEDIUM` | 201; response priority `MEDIUM` | PASS |
| Priority `HIGH` | 201 | 201; response priority `HIGH` | PASS |
| Priority `high` | 400 | 400 | PASS |
| Valid UUID assigneeId | 201 | 201; response included UUID | PASS |
| Invalid UUID assigneeId | 400 | 400 | PASS |
| assigneeId `null` | 201 | 201; response value `null` | PASS |
| ISO datetime with `Z` | 201 | 201 | PASS |
| ISO datetime with timezone offset | 201 | 201 | PASS |
| Date without time | 400 | 400 | PASS |
| Impossible date `2026-02-30` | 400 | 400 | PASS |
| Description with 10,001 characters | 400 | 400 | PASS |
| Unknown property | 400 | 400 | PASS |

## Automated test changes

The original failing unit tests called controllers/services directly and expected those methods to independently validate raw request bodies. That contradicted the DTO/global-pipe architecture: Nest applies DTO transformation/validation before invoking controllers, while services should receive typed, already validated input.

- Controller specs now pass DTO instances and verify delegation/response headers, rather than expecting direct method calls to run Nest pipes.
- Service specs no longer expect services to validate request shape, unknown fields, DTO length/value constraints, or filters. They continue to verify repository interactions, response mapping, task numbering, project/task lifecycle rules, status transitions, null-clearing, and partial-update behavior.
- Task title trim expectations now treat trimming as DTO transformation at the boundary. Service tests pass the normalized title they are designed to receive.
- Added `src/app.validation.spec.ts`, which initializes the application with `configureApp`, sends actual HTTP requests, and uses service spies to prove malformed project/task bodies and prototype-sensitive JSON do not invoke the respective service methods.
- No validation decorators were removed, and business rules were not moved out of services.

## Project checks

| Command | Result |
|---|---|
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |
| `npx vitest run` | PASS — 8 test files passed; 109 tests passed |

## Cleanup

The test project and all projects created by the HTTP cases were deleted using the API. The task project deletion also removed its created tasks. Cleanup requests returned 204.

## Overall verdict

**PASS** — all listed DTO HTTP cases, the prototype-pollution boundary case, route UUID validation, service non-invocation tests, implementation inspection criteria, and requested project checks were verified successfully.
