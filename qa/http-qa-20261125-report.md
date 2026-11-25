# TaskFlow API - Comprehensive HTTP QA Report

- **Generated:** 2026-11-25T04:31:33.451Z
- **Base URL:** http://127.0.0.1:3210
- **Server:** fresh `npm run start` process on port 3210, in-memory repositories (no external database configured)
- **Run id:** 20261125043133-kmwa
- **Org A:** `7ef45cdc-4562-4705-82eb-e3e0e940a5c0`
- **Org B:** `7bb3deaa-5508-4030-8259-58b89f5377e7`
- **Org C:** `c46fbca9-a3ab-44be-9659-2c9e43a17545`
- **HTTP calls recorded:** 218 (including setup and cleanup)

## A. Executive Summary

| Metric | Count |
| --- | ---: |
| Total test cases | 56 |
| Passed | 54 |
| Failed | 2 |
| Blocked | 0 |
| Needs clarification | 0 |
| Pass rate | 96.4% |

**Overall result: FAIL** - 2 of 56 executed cases failed. The five task endpoints are largely functional, but task creation omits the required Location header and unknown task-list query parameters are silently ignored instead of rejected.

## B. Detailed Test Results

| Test ID | Requirement | Endpoint | Expected result | Actual result | Result | Details |
| --- | --- | --- | --- | --- | --- | --- |
| SET-01 | Create isolated test data in Org A and Org B via real HTTP requests | POST /api/v1/projects; POST /api/v1/projects/:projectId/tasks | 201 for both projects and both tasks; each task belongs to its org | 201 for both orgs; task A id=d99b49c7-c579-433b-8177-fcd850a6a80d key=ISA133KMWAORG_A-1, task B id=da1350b7-145b-4a3e-8184-e8db198108be key=ISB133KMWAORG_B-1 | **PASS** | Org A=7ef45cdc-4562-4705-82eb-e3e0e940a5c0, Org B=7bb3deaa-5508-4030-8259-58b89f5377e7; projects ISA133KMWAORG_A / ISB133KMWAORG_B |
| TI-01 | Org B cannot retrieve Org A task | GET /api/v1/tasks/:taskId | 404 Not Found; no Org A task data in body | 404 Task not found | **PASS** | Cross-tenant GET returned no task data. |
| TI-02 | Org B cannot update Org A task | PATCH /api/v1/tasks/:taskId | 404 Not Found; Org A task remains unchanged | PATCH 404 "Task not found"; Org A GET still 200 with title "Tenant A private task" | **PASS** | No cross-tenant mutation occurred. |
| TI-03 | Org B cannot delete Org A task | DELETE /api/v1/tasks/:taskId | 404 Not Found; task still exists for Org A | DELETE 404 "Task not found"; Org A GET still 200 | **PASS** | Task survived cross-tenant delete attempt. |
| TI-04 | Org B cannot list tasks of Org A project (tenant isolation on list endpoint) | GET /api/v1/projects/:projectId/tasks | 404 Project not found | 404 "Project not found" | **PASS** | No cross-tenant list data returned. |
| TI-05 | Org B cannot create a task in Org A project (tenant isolation on create endpoint) | POST /api/v1/projects/:projectId/tasks | 404 Project not found; no task created | POST 404 "Project not found" | **PASS** | No task created in Org A project. |
| TI-06 | Org A can still read its own task after cross-tenant attempts | GET /api/v1/tasks/:taskId | 200 with intact task body | 200 id=d99b49c7-c579-433b-8177-fcd850a6a80d title="Tenant A private task" | **PASS** | Control check after TI-01..TI-05. |
| AR-01 | Prepare active project with tasks before archiving | POST /api/v1/projects; POST /api/v1/projects/:id/tasks | 201 for project and two tasks | 201 project ARC133KMWAARCH; tasks ARC133KMWAARCH-1, ARC133KMWAARCH-2 | **PASS** | Setup for AR-02..AR-08. |
| AR-02 | Archive the project | PATCH /api/v1/projects/:id | 200 with status ARCHIVED | 200 status=ARCHIVED | **PASS** | Project archived via HTTP. |
| AR-03 | Creating a task in an archived project returns 409 | POST /api/v1/projects/:projectId/tasks | 409 Conflict with explainatory message | 409 "Cannot create tasks in an archived project" | **PASS** | Create blocked by archived project rule. |
| AR-04 | Modifying a task in an archived project returns 409 | PATCH /api/v1/tasks/:taskId | 409 Conflict with explainatory message | 409 "Cannot modify tasks in an archived project" | **PASS** | Update blocked by archived project rule. |
| AR-05 | Reading a task in an archived project still works | GET /api/v1/tasks/:taskId | 200 with original task body | 200 title="Archive test task 1" | **PASS** | Read remains allowed for archived projects. |
| AR-06 | Listing tasks in an archived project still works | GET /api/v1/projects/:projectId/tasks | 200 with both tasks | 200 array length=2 | **PASS** | List remains allowed for archived projects. |
| AR-07 | Deleting a task in an archived project follows implemented business rule | DELETE /api/v1/tasks/:taskId | Implemented rule: 409 Conflict "Cannot delete tasks in an archived project" | 409 "Cannot delete tasks in an archived project" | **PASS** | Reported separately as requested: delete is blocked in archived projects; task is retained. |
| AR-08 | Task retained after blocked delete in archived project | GET /api/v1/tasks/:taskId | 200, task still present | 200 id=28319ae2-00b2-4cf5-91a5-619690d6771f | **PASS** | No deletion occurred. |
| PD-01 | Prepare project with multiple tasks for cascade test | POST /api/v1/projects; POST /api/v1/projects/:id/tasks | 201 for project and three tasks | 201 project CSC133KMWACASC; tasks CSC133KMWACASC-1, CSC133KMWACASC-2, CSC133KMWACASC-3 | **PASS** | Setup for PD-02..PD-05. |
| PD-02 | Delete the project | DELETE /api/v1/projects/:id | 204 No Content | 204 empty body | **PASS** | Project deleted via HTTP. |
| PD-03 | Deleting a project also deletes its associated tasks | GET /api/v1/tasks/:taskId (per task) | 404 Task not found for each of the three former task IDs | 404 Task not found; 404 Task not found; 404 Task not found | **PASS** | All three tasks were removed by the project delete cascade. |
| PD-04 | Listing tasks of the deleted project fails | GET /api/v1/projects/:projectId/tasks | 404 Project not found | 404 "Project not found" | **PASS** | Project no longer resolves for task listing. |
| PD-05 | Repeating project deletion returns 404 | DELETE /api/v1/projects/:id | 404 Not Found | 404 "Project not found" | **PASS** | Idempotent delete is not implemented; repeat is correctly not found. |
| EP-01 | Task creation works with correct status, body and defaults | POST /api/v1/projects/:projectId/tasks | 201; full task body; key=projectKey-number; defaults status=TODO, priority=MEDIUM, null optionals; no internal fields | 201 id=62df9b4c-fc56-46c2-bfc7-174448c0ab74 number=2 key=EPJ133KMWAEP-2 | **PASS** | Title trimmed; defaults/null optionals verified in other checks. |
| EP-02 | Creation response includes a valid Location header pointing to the new task | POST /api/v1/projects/:projectId/tasks then GET Location | Location header present; resolving it with GET returns 200 and the same task id | 201 created, but Location header is missing. Response headers: {"connection":"keep-alive","content-length":"340","content-type":"application/json; charset=utf-8","date":"Wed, 25 Nov 2026 04:31:33 GMT","etag":"W/\"154-D223opiEyq9omX7QAUZzcWUrqKM\"","keep-alive":"timeout=5","x-powered-by":"Express"} | **FAIL** | No URL was supplied, so there is no Location value to validate. src/tasks/tasks.controller.ts createTask() returns the service value directly with no @Header/@Res/Location handling. |
| EP-03 | Task retrieval works | GET /api/v1/tasks/:taskId | 200 with the created task body and no internal fields | 200 id=d98be4aa-f8ba-4115-aadc-caf12a54971a key=EPJ133KMWAEP-1 | **PASS** | Body matches creation response. |
| EP-04 | Task listing works | GET /api/v1/projects/:projectId/tasks | 200 array of task bodies sorted by descending number; no internal fields | 200 array length=3, numbers=3,2,1 | **PASS** | Descending number order matches repository implementation. |
| EP-05 | Task listing filters work | GET /api/v1/projects/:projectId/tasks?status=...&priority=...&assigneeId=... | 200 with only matching tasks for each filter | status=TODO -> 3; priority=URGENT -> 1; assignee=qa-user-a -> 2 | **PASS** | All three implemented filters returned only matching tasks. |
| EP-06 | Task updating works and omitted fields are preserved | PATCH /api/v1/tasks/:taskId | 200 with updated title/description; status, priority, assigneeId, dueDate unchanged; persisted value matches response | 200 title="Updated endpoint task" description=null; GET confirms persistence | **PASS** | Partial PATCH preserved all omitted fields. |
| EP-07 | Task deletion works | DELETE /api/v1/tasks/:taskId | 204 No Content with empty body | 204 empty body | **PASS** | Deleted task id=9ed97da7-fea1-496b-a4cf-cd96f094c5d4. |
| EP-08 | Deleted task cannot be retrieved and disappears from listing | GET /api/v1/tasks/:taskId; GET /api/v1/projects/:projectId/tasks | 404 for GET task; task absent from list | GET 404 "Task not found"; list excludes id | **PASS** | Deletion is durable in the in-memory store. |
| EP-09 | Correct HTTP methods and URLs are enforced | POST /api/v1/tasks/:id; PUT /api/v1/tasks/:id; POST /api/v1/tasks; GET /api/v1/projects/:id/tasks/:taskId | 404 for all unimplemented method/path combinations | POST -> 404, PUT -> 404, POST -> 404, GET -> 404 | **PASS** | Only the five defined routes respond. |
| EP-10 | Create validation: body shape and title rules | POST /api/v1/projects/:projectId/tasks | 400 Bad Request for array body, missing title, blank title and title longer than 200 chars | array body: 400 "Request body must be an object"; missing title: 400 "Title must be a string between 1 and 200 characters"; blank title: 400 "Title must be a string between 1 and 200 characters"; whitespace title: 400 "Title must be a string between 1 and 200 characters"; 201-char title: 400 "Title must be a string between 1 and 200 characters" | **PASS** | Manual service validation rejected all five invalid bodies. |
| EP-11 | Create validation: field types, unknown/read-only fields and enum | POST /api/v1/projects/:projectId/tasks | 400 Bad Request for each invalid field | invalid priority: 400, numeric dueDate: 400, numeric description: 400, numeric assigneeId: 400, read-only status: 400, unknown field: 400 | **PASS** | All invalid create fields were rejected with 400. |
| EP-12 | PATCH validation rules | PATCH /api/v1/tasks/:taskId | 400 for empty body, unknown/read-only fields, invalid enum values and wrong types | empty body: 400, unknown field: 400, read-only number: 400, invalid status: 400, invalid priority: 400, empty title: 400, numeric title: 400, numeric dueDate: 400 | **PASS** | All eight invalid PATCH bodies were rejected. |
| EP-13 | Path parameter and X-Org-Id header validation on task endpoints | GET/PATCH/DELETE /api/v1/tasks/:taskId; GET /api/v1/projects/:projectId/tasks | 400 for non-UUID ids, missing header and non-v4 UUID header | GET 400, GET 400, DELETE 400, GET 400, GET 400, PATCH 400, GET 400, POST 400 | **PASS** | Header rule accepts only v4 UUIDs (regex in src/common/decorators/org-id.decorator.ts); v1 org 11111111-1111-1111-8111-111111111111 was rejected. |
| EP-14 | List filter enum validation | GET /api/v1/projects/:projectId/tasks?status=...&priority=... | 400 for invalid status/priority filter values | 400 "Invalid task status filter"; 400 "Invalid task status filter"; 400 "Invalid task priority filter" | **PASS** | Invalid filter enums rejected. |
| EP-15 | Unknown task list query parameters are rejected by service validation | GET /api/v1/projects/:projectId/tasks?foo=bar | 400 based on TasksService.validateFilters() rejectUnknownFields(filters, ...) | 200 [{"id":"513701b1-03aa-4065-9d0f-9eec92f3e888","projectId":"d9169480-637d-4392-8c54-f490e5b5bf29","number":3,"title":"Location header verification task","description":null,"status":"TODO","priority":"MEDIUM","assigneeId":null,"dueDate":null,"createdAt":"2026-11-25T04:31:33.240Z","updatedAt":"2026-11-25T04:31:33.240Z","key":"EPJ133KMWAEP-3"},{"id":"62df9b4c-fc56-46c2-bfc7-174448c0ab74","projectId":"d9169480-637d-4392-8c54-f490e5b5bf29","number":2,"title":"Endpoint creation task","description":"created via HTTP","status":"TODO","priority":"URGENT","assigneeId":"qa-user-a","dueDate":"2026-12-01","createdAt":"2026-11-25T04:31:33.238Z","updatedAt":"2026-11-25T04:31:33.238Z","key":"EPJ133KMWAEP-2"},{"id":"d98be4aa-f8ba-4115-aadc-caf12a54971a","projectId":"d9169480-637d-4392-8c54-f490e5b5bf29","number":1,"title":"Updated endpoint task","description":null,"status":"TODO","priority":"HIGH","assigneeId":"qa-user-a","dueDate":"2026-12-31","createdAt":"2026-11-25T04:31:33.170Z","updatedAt":"2026-11-25T04:31:33.250Z","key":"EPJ133KMWAEP-1"}] | **FAIL** | TasksController uses individual @Query("status"/"priority"/"assigneeId") parameters, so "foo" is dropped before TasksService.validateFilters() sees it. The service-level unknown-field rejection is unreachable over HTTP. |
| EP-16 | Responses do not expose internal database/implementation fields | POST/GET/PATCH /api/v1/tasks and GET /api/v1/projects/:id/tasks | No organizationId, nextTaskNumber, _id, __v or password fields in any task response | No internal fields found in create/get/patch/list responses | **PASS** | organizationId is stripped by toTaskResponse(); nextTaskNumber is never part of a task. |
| ST-01 | Status transition TODO -> IN_PROGRESS (allowed) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 200 with status IN_PROGRESS; GET confirms IN_PROGRESS persisted | PATCH 200 status="IN_PROGRESS"; GET persisted status=IN_PROGRESS | **PASS** | Allowed transition applied and persisted. |
| ST-02 | Status transition IN_PROGRESS -> IN_REVIEW (allowed) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 200 with status IN_REVIEW; GET confirms IN_REVIEW persisted | PATCH 200 status="IN_REVIEW"; GET persisted status=IN_REVIEW | **PASS** | Allowed transition applied and persisted. |
| ST-03 | Status transition IN_REVIEW -> DONE (allowed) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 200 with status DONE; GET confirms DONE persisted | PATCH 200 status="DONE"; GET persisted status=DONE | **PASS** | Allowed transition applied and persisted. |
| ST-04 | Status transition DONE -> IN_PROGRESS (allowed) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 200 with status IN_PROGRESS; GET confirms IN_PROGRESS persisted | PATCH 200 status="IN_PROGRESS"; GET persisted status=IN_PROGRESS | **PASS** | Allowed transition applied and persisted. |
| ST-05 | Status transition IN_PROGRESS -> TODO (allowed) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 200 with status TODO; GET confirms TODO persisted | PATCH 200 status="TODO"; GET persisted status=TODO | **PASS** | Allowed transition applied and persisted. |
| ST-06 | Status transition IN_REVIEW -> IN_PROGRESS (allowed) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 200 with status IN_PROGRESS; GET confirms IN_PROGRESS persisted | PATCH 200 status="IN_PROGRESS"; GET persisted status=IN_PROGRESS | **PASS** | Allowed transition applied and persisted. |
| ST-07 | Status transition TODO -> IN_REVIEW (forbidden) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 422 Unprocessable Entity; status remains TODO | PATCH 422 error="Cannot move task from TODO to IN_REVIEW"; GET persisted status=TODO | **PASS** | Forbidden transition rejected with 422 and no state change. |
| ST-08 | Status transition TODO -> DONE (forbidden) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 422 Unprocessable Entity; status remains TODO | PATCH 422 error="Cannot move task from TODO to DONE"; GET persisted status=TODO | **PASS** | Forbidden transition rejected with 422 and no state change. |
| ST-09 | Status transition IN_PROGRESS -> DONE (forbidden) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 422 Unprocessable Entity; status remains IN_PROGRESS | PATCH 422 error="Cannot move task from IN_PROGRESS to DONE"; GET persisted status=IN_PROGRESS | **PASS** | Forbidden transition rejected with 422 and no state change. |
| ST-10 | Status transition IN_REVIEW -> TODO (forbidden) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 422 Unprocessable Entity; status remains IN_REVIEW | PATCH 422 error="Cannot move task from IN_REVIEW to TODO"; GET persisted status=IN_REVIEW | **PASS** | Forbidden transition rejected with 422 and no state change. |
| ST-11 | Status transition DONE -> TODO (forbidden) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 422 Unprocessable Entity; status remains DONE | PATCH 422 error="Cannot move task from DONE to TODO"; GET persisted status=DONE | **PASS** | Forbidden transition rejected with 422 and no state change. |
| ST-12 | Status transition DONE -> IN_REVIEW (forbidden) | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 422 Unprocessable Entity; status remains DONE | PATCH 422 error="Cannot move task from DONE to IN_REVIEW"; GET persisted status=DONE | **PASS** | Forbidden transition rejected with 422 and no state change. |
| ST-13 | Updating a task to its current status is allowed and is a no-op | PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId | 200; status unchanged; updatedAt unchanged | 200 status=IN_PROGRESS, updatedAt stable (2026-11-25T04:31:33.397Z) | **PASS** | No-op PATCH did not bump updatedAt. |
| ST-14 | Invalid status value is a validation error, not a transition error | PATCH /api/v1/tasks/:taskId | 400 Bad Request "Invalid task status" | 400 "Invalid task status" | **PASS** | Enum validation runs before state-machine check. |
| TN-01 | A new project issues task number 1 with key <projectKey>-1 | POST /api/v1/projects/:projectId/tasks | 201 with number=1 and key=projectKey-1 | number=1 key=NUM133KMWANUM_A-1 | **PASS** | nextTaskNumber starts at 1 in InMemoryProjectsRepository.create(). |
| TN-02 | Multiple sequential tasks in one project get distinct, increasing numbers | POST /api/v1/projects/:projectId/tasks | 201 for each; numbers 2,3,4 with matching keys | numbers=2,3,4; keys=NUM133KMWANUM_A-2,NUM133KMWANUM_A-3,NUM133KMWANUM_A-4 | **PASS** | Sequential numbering is per project and monotonic. |
| TN-03 | Task numbering is scoped per project | POST /api/v1/projects/:projectId/tasks | A second project starts at number 1 independently of the first | number=1 key=NUM133KMWANUM_B-1 (other project at 4) | **PASS** | Per-project counter confirmed. |
| TN-04 | Task numbering is scoped per organization/project, not globally | POST /api/v1/projects; POST /api/v1/projects/:projectId/tasks | A project in Org C starts its own sequence at 1 | Org C NUM133KMWANUM_C-1 number=1 | **PASS** | No global counter; counter lives on each project. |
| TN-05 | Deleting a task does not reuse or reset its number | DELETE /api/v1/tasks/:taskId; POST /api/v1/projects/:projectId/tasks | Next created task receives the next number after the highest previously issued | Deleted #6; next task #7 (no reuse, no reset) | **PASS** | nextTaskNumber is only incremented, never decremented. |
| TN-06 | Concurrent task creation does not produce duplicate numbers | POST /api/v1/projects/:projectId/tasks (3 rounds x 10 parallel requests) | 201 for all 30 requests with 30 distinct task numbers in one project | 30x201; distinct numbers 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30 | **PASS** | No duplicate task numbers across 3 rounds of 10 parallel creates in one project. |

## C. Failed Tests

### 1. EP-02 - Creation response includes a valid Location header pointing to the new task

- **Expected:** Location header present; resolving it with GET returns 200 and the same task id
- **Actual:** 201 created, but Location header is missing. Response headers: {"connection":"keep-alive","content-length":"340","content-type":"application/json; charset=utf-8","date":"Wed, 25 Nov 2026 04:31:33 GMT","etag":"W/\"154-D223opiEyq9omX7QAUZzcWUrqKM\"","keep-alive":"timeout=5","x-powered-by":"Express"}
- **Details / likely source:** No URL was supplied, so there is no Location value to validate. src/tasks/tasks.controller.ts createTask() returns the service value directly with no @Header/@Res/Location handling.

#### Call #42 (test EP-02)

Request:
```http
POST http://127.0.0.1:3210/api/v1/projects/d9169480-637d-4392-8c54-f490e5b5bf29/tasks
X-Org-Id: 7ef45cdc-4562-4705-82eb-e3e0e940a5c0
Content-Type: application/json

{"title":"Location header verification task"}
```

Response:
```http
201 Created
connection: keep-alive
content-length: 340
content-type: application/json; charset=utf-8
date: Wed, 25 Nov 2026 04:31:33 GMT
etag: W/"154-D223opiEyq9omX7QAUZzcWUrqKM"
keep-alive: timeout=5
x-powered-by: Express

{"id":"513701b1-03aa-4065-9d0f-9eec92f3e888","projectId":"d9169480-637d-4392-8c54-f490e5b5bf29","number":3,"title":"Location header verification task","description":null,"status":"TODO","priority":"MEDIUM","assigneeId":null,"dueDate":null,"createdAt":"2026-11-25T04:31:33.240Z","updatedAt":"2026-11-25T04:31:33.240Z","key":"EPJ133KMWAEP-3"}
```
### 2. EP-15 - Unknown task list query parameters are rejected by service validation

- **Expected:** 400 based on TasksService.validateFilters() rejectUnknownFields(filters, ...)
- **Actual:** 200 [{"id":"513701b1-03aa-4065-9d0f-9eec92f3e888","projectId":"d9169480-637d-4392-8c54-f490e5b5bf29","number":3,"title":"Location header verification task","description":null,"status":"TODO","priority":"MEDIUM","assigneeId":null,"dueDate":null,"createdAt":"2026-11-25T04:31:33.240Z","updatedAt":"2026-11-25T04:31:33.240Z","key":"EPJ133KMWAEP-3"},{"id":"62df9b4c-fc56-46c2-bfc7-174448c0ab74","projectId":"d9169480-637d-4392-8c54-f490e5b5bf29","number":2,"title":"Endpoint creation task","description":"created via HTTP","status":"TODO","priority":"URGENT","assigneeId":"qa-user-a","dueDate":"2026-12-01","createdAt":"2026-11-25T04:31:33.238Z","updatedAt":"2026-11-25T04:31:33.238Z","key":"EPJ133KMWAEP-2"},{"id":"d98be4aa-f8ba-4115-aadc-caf12a54971a","projectId":"d9169480-637d-4392-8c54-f490e5b5bf29","number":1,"title":"Updated endpoint task","description":null,"status":"TODO","priority":"HIGH","assigneeId":"qa-user-a","dueDate":"2026-12-31","createdAt":"2026-11-25T04:31:33.170Z","updatedAt":"2026-11-25T04:31:33.250Z","key":"EPJ133KMWAEP-1"}]
- **Details / likely source:** TasksController uses individual @Query("status"/"priority"/"assigneeId") parameters, so "foo" is dropped before TasksService.validateFilters() sees it. The service-level unknown-field rejection is unreachable over HTTP.

#### Call #89 (test EP-15)

Request:
```http
GET http://127.0.0.1:3210/api/v1/projects/d9169480-637d-4392-8c54-f490e5b5bf29/tasks?foo=bar
X-Org-Id: 7ef45cdc-4562-4705-82eb-e3e0e940a5c0

(no body)
```

Response:
```http
200 OK
connection: keep-alive
content-length: 1043
content-type: application/json; charset=utf-8
date: Wed, 25 Nov 2026 04:31:33 GMT
etag: W/"413-quVvCVSxLO+pbZFF7/dFns/jFJ0"
keep-alive: timeout=5
x-powered-by: Express

[{"id":"513701b1-03aa-4065-9d0f-9eec92f3e888","projectId":"d9169480-637d-4392-8c54-f490e5b5bf29","number":3,"title":"Location header verification task","description":null,"status":"TODO","priority":"MEDIUM","assigneeId":null,"dueDate":null,"createdAt":"2026-11-25T04:31:33.240Z","updatedAt":"2026-11-25T04:31:33.240Z","key":"EPJ133KMWAEP-3"},{"id":"62df9b4c-fc56-46c2-bfc7-174448c0ab74","projectId":"d9169480-637d-4392-8c54-f490e5b5bf29","number":2,"title":"Endpoint creation task","description":"created via HTTP","status":"TODO","priority":"URGENT","assigneeId":"qa-user-a","dueDate":"2026-12-01","createdAt":"2026-11-25T04:31:33.238Z","updatedAt":"2026-11-25T04:31:33.238Z","key":"EPJ133KMWAEP-2"},{"id":"d98be4aa-f8ba-4115-aadc-caf12a54971a","projectId":"d9169480-637d-4392-8c54-f490e5b5bf29","number":1,"title":"Updated endpoint task","description":null,"status":"TODO","priority":"HIGH","assigneeId":"qa-user-a","dueDate":"2026-12-31","createdAt":"2026-11-25T04:31:33.170Z","updatedAt":"2026-11-25T04:31:33.250Z","key":"EPJ133KMWAEP-1"}]
```

## D. Requirements Coverage

| Requirement | Test IDs | Status |
| --- | --- | --- |
| Preparation: inspect structure, five endpoints, headers, status codes, validation, archiving, numbering, DB config | Source inspection performed; PREP via SET-01 and endpoint tests | COMPLETE |
| Start the application if necessary | Fresh server started on http://127.0.0.1:3210 | COMPLETE |
| Org B cannot retrieve Org A task | TI-01 | PASS |
| Org B cannot update Org A task | TI-02 | PASS |
| Org B cannot delete Org A task | TI-03 | PASS |
| Create archived project scenario | AR-01..AR-08 | PASS |
| Creating task in archived project -> 409 | AR-03 | PASS |
| Modifying task in archived project -> 409 | AR-04 | PASS |
| Reading task in archived project still works | AR-05 | PASS |
| Deleting task in archived project: observed behaviour reported separately | AR-07, AR-08 | PASS (409, blocked) |
| Project deletion cascades to tasks | PD-01..PD-05 | PASS |
| Task creation works | EP-01 | PASS |
| Task retrieval works | EP-03 | PASS |
| Task listing works | EP-04, EP-05 | PASS |
| Task updating works | EP-06 | PASS |
| Task deletion works | EP-07, EP-08 | PASS |
| Correct HTTP method and URL for every endpoint | EP-09 | PASS |
| Correct HTTP status codes | All test cases | See detail table |
| Correct response bodies | All endpoint tests | See detail table |
| Correct validation behaviour | EP-10..EP-15 | FAIL (EP-15) |
| Tenant isolation enforced on all endpoints | TI-01..TI-06 | PASS |
| Responses do not expose internal fields | EP-16 | PASS |
| Creation response has valid Location header pointing to new task | EP-02 | FAIL |
| Valid status transitions work | ST-01..ST-06, ST-13 | PASS |
| Invalid status transitions return 422 | ST-07..ST-12 | PASS |
| Same-status update works | ST-13 | PASS |
| Persisted status matches response after each update | ST-01..ST-13 | See detail table |
| Expected task numbers on creation | TN-01, TN-02 | PASS |
| Distinct numbers for multiple tasks | TN-02 | PASS |
| Numbering across projects | TN-03 | PASS |
| Numbering across organizations | TN-04 | PASS |
| Deleting a task does not cause unexpected numbering | TN-05 | PASS |
| Concurrent creation produces no duplicates | TN-06 | PASS |
| Unique test data used | RUN=20261125043133-kmwa; random v4 org ids | COMPLETE |
| Clean up test data | 10 project DELETE calls | COMPLETE |

## E. Final Assessment

- **Fully working:** task create/get/list/update/delete happy paths, manual validation for bodies/headers/filters, tenant isolation on all five endpoints, archived-project rules (create/update blocked, read allowed, delete blocked with 409), project-delete cascade, status state machine including same-status no-op, per-project/per-org numbering and non-reuse after deletion.
- **Bugs found:** missing `Location` header on task creation (EP-02); unknown task-list query parameters silently ignored (EP-15). Concurrent/sequential numbering was verified duplicate-free (TN-02, TN-06).
- **Untested / not applicable:** persistence across restarts (in-memory repositories only), true DB-level cascade constraints, auth/role flows (none implemented), pagination (none implemented).
- **Environmental blockers:** none. A fresh local server was reachable and all tests executed.

## Appendix: raw data

- `qa/http-qa-20261125-results.json` - test results and all HTTP call records.
