# TaskFlow API — HTTP QA Test Report

- **Generated:** 2026-11-24T12:32:27.245Z
- **Base URL:** `http://127.0.0.1:3100`
- **Server startup:** local `npm run start` with `PORT=3100`; no application code was modified.
- **Test orgs:** `8b53b0f6-6060-40fe-9b56-5701e61a2667` (A) and `d709fbb6-65df-4287-8813-f3fbdb5d80bf` (B), both randomly generated v4 UUIDs.
- **Data safety:** all created projects/tasks used random QA-only keys and IDs; cleanup requests were sent at the end.

## Summary

| Metric | Count |
| --- | ---: |
| Unique endpoints exercised | 14 |
| Total test cases executed | 189 |
| Passed | 155 |
| Failed | 34 |
| Pass rate | 82.0% |

## Endpoint coverage

| # | Endpoint | Methods | Cases | Result |
| ---: | --- | --- | ---: | --- |
| 1 | `DELETE /api/v1/projects/:id` | DELETE | 16 | PASS |
| 2 | `DELETE /api/v1/tasks/:taskId` | DELETE | 19 | PASS |
| 3 | `GET /api/v1` | GET | 2 | PASS |
| 4 | `GET /api/v1/projects` | GET | 21 | FAIL (2) |
| 5 | `GET /api/v1/projects/:id` | GET | 12 | FAIL (5) |
| 6 | `GET /api/v1/projects/:projectId/tasks` | GET | 16 | FAIL (1) |
| 7 | `GET /api/v1/tasks/:taskId` | GET | 12 | FAIL (2) |
| 8 | `GET /api/v1/test` | GET | 1 | PASS |
| 9 | `GET /docs` | GET | 1 | PASS |
| 10 | `GET /docs-json` | GET | 1 | PASS |
| 11 | `PATCH /api/v1/projects/:id` | PATCH | 17 | FAIL (9) |
| 12 | `PATCH /api/v1/tasks/:taskId` | PATCH | 31 | FAIL (9) |
| 13 | `POST /api/v1/projects` | POST | 12 | FAIL (5) |
| 14 | `POST /api/v1/projects/:projectId/tasks` | POST | 28 | FAIL (1) |

## Detailed test cases

### TC-001 — Application root is exposed under the global prefix and version

- **Phase:** Routing
- **Endpoint:** `GET /api/v1`
- **Scenario:** Application root is exposed under the global prefix and version
- **Actual request:** `GET http://127.0.0.1:3100/api/v1`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with plain-text Hello World!
- **Actual response:**
```text
200 OK
Content-Type: text/html; charset=utf-8
Hello World!
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-002 — Unversioned /api path is not routed

- **Phase:** Routing
- **Endpoint:** `GET /api/v1`
- **Scenario:** Unversioned /api path is not routed
- **Actual request:** `GET http://127.0.0.1:3100/api`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Cannot GET /api",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-003 — Test endpoint returns its plain-text payload

- **Phase:** Routing
- **Endpoint:** `GET /api/v1/test`
- **Scenario:** Test endpoint returns its plain-text payload
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/test`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with plain-text "Wow test works!"
- **Actual response:**
```text
200 OK
Content-Type: text/html; charset=utf-8
Wow test works!
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-004 — Swagger UI is served

- **Phase:** Documentation
- **Endpoint:** `GET /docs`
- **Scenario:** Swagger UI is served
- **Actual request:** `GET http://127.0.0.1:3100/docs`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 HTML containing Swagger UI
- **Actual response:**
```text
200 OK
Content-Type: text/html; charset=utf-8

<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="./docs/swagger-ui.css" >
  <link rel="icon" type="image/png" href="./docs/favicon-32x32.png" sizes="32x32" /><link rel="icon" type="image/png" href="./docs/favicon-16x16.png" sizes="16x16" />
  <style>
    html
    {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *,
    *:before,
    *:after
    {
      box-sizing: inherit;
    }

    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>

<body>

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position:absolute;width:0;height:0">
  <defs>
    <symbol viewBox="0 0 20 20" id="unlocked">
      <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V6h2v-.801C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8z"></path>
    </symbol>

    <symbol viewBox="0 0 20 20" id="locked">
      <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8zM12 8H8V5.199C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="close">
      <path d="M14.348 14.849c-.469.469-1.229.469-1.697 0L10 11.819l-2.651 3.029c-.469.469-1.229.469-1.697 0-.469-.469-.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-.469-.469-.469-1.228 0-1.697.469-.469 1.228-.469 1.697 0L10 8.183l2.651-3.031c.469-.469 1.228-.469 1.697 0 .469.469.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c.469.469.469 1.229 0 1.698z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="large-arrow">
      <path d="M13.25 10L6.109 2.58c-.268-.27-.268-.707 0-.979.268-.27.701-.27.969 0l7.83 7.908c.268.271.268.709 0 .979l-7.83 7.908c-.268.271-.701.27-.969 0-.268-.269-.268-.707 0-.979L13.25 10z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="large-arrow-down">
      <path d="M17.418 6.109c.272-.268.709-.268.979 0s.271.701 0 .969l-7.908 7.83c-.27.268-.707.268-.979 0l-7.908-7.83c-.27-.268-.27-.701 0-.969.271-.268.709-.268.979 0L10 13.25l7.418-7.141z"/>
    </symbol>


    <symbol viewBox="0 0 24 24" id="jump-to">
      <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>
    </symbol>

    <symbol viewBox="0 0 24 24" id="expand">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </symbol>

  </defs>
</svg>

<div id="swagger-ui"></div>

<script src="./docs/swagger-ui-bundle.js"> </script>
<script src="./docs/swagger-ui-standalone-preset.js"> </script>
<script src="./docs/swagger-ui-init.js"> </script>



<style>
  
  .swagger-ui .topbar .download-url-wrapper { display: none }
</style>
</body>

</html>

```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-005 — OpenAPI JSON is served with the expected title and paths

- **Phase:** Documentation
- **Endpoint:** `GET /docs-json`
- **Scenario:** OpenAPI JSON is served with the expected title and paths
- **Actual request:** `GET http://127.0.0.1:3100/docs-json`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 JSON with info.title TaskFlow API and all API paths
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "openapi": "3.0.0",
  "paths": {
    "/api/v1": {
      "get": {
        "operationId": "AppController_getHello_v1",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "App"
        ]
      }
    },
    "/api/v1/test": {
      "get": {
        "operationId": "AppController_test_v1",
        "parameters": [],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "App"
        ]
      }
    },
    "/api/v1/projects": {
      "get": {
        "operationId": "ProjectsController_fetchProjects_v1",
        "parameters": [
          {
            "name": "status",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "Projects"
        ]
      },
      "post": {
        "operationId": "ProjectsController_createProject_v1",
        "parameters": [],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "tags": [
          "Projects"
        ]
      }
    },
    "/api/v1/projects/{id}": {
      "get": {
        "operationId": "ProjectsController_fetchProject_v1",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "Projects"
        ]
      },
      "patch": {
        "operationId": "ProjectsController_updateProject_v1",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "Projects"
        ]
      },
      "delete": {
        "operationId": "ProjectsController_deleteProject_v1",
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": ""
          }
        },
        "tags": [
          "Projects"
        ]
      }
    },
    "/api/v1/projects/{projectId}/tasks": {
      "post": {
        "operationId": "TasksController_createTask_v1",
        "parameters": [
          {
            "name": "projectId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": ""
          }
        },
        "tags": [
          "Tasks"
        ]
      },
      "get": {
        "operationId": "TasksController_getProjectTasks_v1",
        "parameters": [
          {
            "name": "projectId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "assigneeId",
            "required": true,
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "Tasks"
        ]
      }
    },
    "/api/v1/tasks/{taskId}": {
      "get": {
        "operationId": "TasksController_getTask_v1",
        "parameters": [
          {
            "name": "taskId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "Tasks"
        ]
      },
      "patch": {
        "operationId": "TasksController_updateTask_v1",
        "parameters": [
          {
            "name": "taskId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": ""
          }
        },
        "tags": [
          "Tasks"
        ]
      },
      "delete": {
        "operationId": "TasksController_deleteTask_v1",
        "parameters": [
          {
            "name": "taskId",
            "required": true,
            "in": "path",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "204": {
            "description": ""
          }
        },
        "tags": [
          "Tasks"
        ]
      }
    }
  },
  "info": {
    "title": "TaskFlow API",
    "description": "API documentation for the TaskFlow application",
    "version": "1.0",
    "contact": {}
  },
  "tags": [],
  "servers": [],
  "components": {
    "schemas": {}
  }
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS
- **Related bug(s):** BUG-07 (observed in this response).

### TC-006 — GET /api/v1/projects: missing X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** GET /api/v1/projects: missing X-Org-Id header
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-007 — GET /api/v1/projects: malformed X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** GET /api/v1/projects: malformed X-Org-Id header
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: not-a-uuid
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-008 — GET /api/v1/projects/:id: missing X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** GET /api/v1/projects/:id: missing X-Org-Id header
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-009 — GET /api/v1/projects/:id: malformed X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** GET /api/v1/projects/:id: malformed X-Org-Id header
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f`
- **Request headers:**
```text
X-Org-Id: not-a-uuid
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-010 — POST /api/v1/projects: missing X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** POST /api/v1/projects: missing X-Org-Id header
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
Content-Type: application/json
```
- **Request body:**
```json
{"key":"QAALSQ4PNZH","name":"Header test project"}
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-011 — POST /api/v1/projects: malformed X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** POST /api/v1/projects: malformed X-Org-Id header
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: not-a-uuid
Content-Type: application/json
```
- **Request body:**
```json
{"key":"QAALSQ4PNZH","name":"Header test project"}
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-012 — PATCH /api/v1/projects/:id: missing X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** PATCH /api/v1/projects/:id: missing X-Org-Id header
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f`
- **Request headers:**
```text
Content-Type: application/json
```
- **Request body:**
```json
{"name":"Header test"}
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-013 — PATCH /api/v1/projects/:id: malformed X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** PATCH /api/v1/projects/:id: malformed X-Org-Id header
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f`
- **Request headers:**
```text
X-Org-Id: not-a-uuid
Content-Type: application/json
```
- **Request body:**
```json
{"name":"Header test"}
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-014 — DELETE /api/v1/projects/:id: missing X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** DELETE /api/v1/projects/:id: missing X-Org-Id header
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-015 — DELETE /api/v1/projects/:id: malformed X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** DELETE /api/v1/projects/:id: malformed X-Org-Id header
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f`
- **Request headers:**
```text
X-Org-Id: not-a-uuid
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-016 — POST /api/v1/projects/:projectId/tasks: missing X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** POST /api/v1/projects/:projectId/tasks: missing X-Org-Id header
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f/tasks`
- **Request headers:**
```text
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Header test task"}
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-017 — POST /api/v1/projects/:projectId/tasks: malformed X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** POST /api/v1/projects/:projectId/tasks: malformed X-Org-Id header
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f/tasks`
- **Request headers:**
```text
X-Org-Id: not-a-uuid
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Header test task"}
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-018 — GET /api/v1/projects/:projectId/tasks: missing X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** GET /api/v1/projects/:projectId/tasks: missing X-Org-Id header
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f/tasks`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-019 — GET /api/v1/projects/:projectId/tasks: malformed X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** GET /api/v1/projects/:projectId/tasks: malformed X-Org-Id header
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f/tasks`
- **Request headers:**
```text
X-Org-Id: not-a-uuid
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-020 — GET /api/v1/tasks/:taskId: missing X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** GET /api/v1/tasks/:taskId: missing X-Org-Id header
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/40fe4a7b-3a01-48a2-9eab-61b9693717ed`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-021 — GET /api/v1/tasks/:taskId: malformed X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** GET /api/v1/tasks/:taskId: malformed X-Org-Id header
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/40fe4a7b-3a01-48a2-9eab-61b9693717ed`
- **Request headers:**
```text
X-Org-Id: not-a-uuid
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-022 — PATCH /api/v1/tasks/:taskId: missing X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** PATCH /api/v1/tasks/:taskId: missing X-Org-Id header
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/40fe4a7b-3a01-48a2-9eab-61b9693717ed`
- **Request headers:**
```text
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Header test"}
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-023 — PATCH /api/v1/tasks/:taskId: malformed X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** PATCH /api/v1/tasks/:taskId: malformed X-Org-Id header
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/40fe4a7b-3a01-48a2-9eab-61b9693717ed`
- **Request headers:**
```text
X-Org-Id: not-a-uuid
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Header test"}
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-024 — DELETE /api/v1/tasks/:taskId: missing X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** DELETE /api/v1/tasks/:taskId: missing X-Org-Id header
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/40fe4a7b-3a01-48a2-9eab-61b9693717ed`
- **Request headers:**
```text
(none)
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-025 — DELETE /api/v1/tasks/:taskId: malformed X-Org-Id header

- **Phase:** Required header
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** DELETE /api/v1/tasks/:taskId: malformed X-Org-Id header
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/40fe4a7b-3a01-48a2-9eab-61b9693717ed`
- **Request headers:**
```text
X-Org-Id: not-a-uuid
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-026 — Lowercase x-org-id header name is accepted

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Lowercase x-org-id header name is accepted
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
x-org-id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with a JSON array (HTTP header names are case-insensitive)
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-027 — Uppercase UUID in X-Org-Id is accepted

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Uppercase UUID in X-Org-Id is accepted
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8B53B0F6-6060-40FE-9B56-5701E61A2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with a JSON array (regex is case-insensitive)
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-028 — Non-v4 UUID in X-Org-Id is rejected

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Non-v4 UUID in X-Org-Id is rejected
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 11111111-1111-1111-8111-111111111111
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-029 — Empty X-Org-Id header is rejected

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Empty X-Org-Id header is rejected
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-030 — Comma-joined duplicate X-Org-Id values are rejected

- **Phase:** Required header
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Comma-joined duplicate X-Org-Id values are rejected
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667, d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "X-Org-Id header must be a UUID"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "X-Org-Id header must be a UUID",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-031 — Request succeeds with no Authorization header

- **Phase:** Authentication
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Request succeeds with no Authorization header
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with a JSON array (no authentication is configured)
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-032 — GET /api/v1/projects/:id: non-UUID path parameter

- **Phase:** UUID validation
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** GET /api/v1/projects/:id: non-UUID path parameter
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/not-a-uuid`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "Validation failed (uuid v 4 is expected)"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Validation failed (uuid v 4 is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-033 — PATCH /api/v1/projects/:id: non-UUID path parameter

- **Phase:** UUID validation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** PATCH /api/v1/projects/:id: non-UUID path parameter
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/not-a-uuid`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"name":"x"}
```
- **Expected response:** 400 Bad Request with "Validation failed (uuid v 4 is expected)"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Validation failed (uuid v 4 is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-034 — DELETE /api/v1/projects/:id: non-UUID path parameter

- **Phase:** UUID validation
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** DELETE /api/v1/projects/:id: non-UUID path parameter
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/not-a-uuid`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "Validation failed (uuid v 4 is expected)"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Validation failed (uuid v 4 is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-035 — POST /api/v1/projects/:projectId/tasks: non-UUID path parameter

- **Phase:** UUID validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** POST /api/v1/projects/:projectId/tasks: non-UUID path parameter
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/not-a-uuid/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"x"}
```
- **Expected response:** 400 Bad Request with "Validation failed (uuid v 4 is expected)"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Validation failed (uuid v 4 is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-036 — GET /api/v1/projects/:projectId/tasks: non-UUID path parameter

- **Phase:** UUID validation
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** GET /api/v1/projects/:projectId/tasks: non-UUID path parameter
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/not-a-uuid/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "Validation failed (uuid v 4 is expected)"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Validation failed (uuid v 4 is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-037 — GET /api/v1/tasks/:taskId: non-UUID path parameter

- **Phase:** UUID validation
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** GET /api/v1/tasks/:taskId: non-UUID path parameter
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/not-a-uuid`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "Validation failed (uuid v 4 is expected)"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Validation failed (uuid v 4 is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-038 — PATCH /api/v1/tasks/:taskId: non-UUID path parameter

- **Phase:** UUID validation
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** PATCH /api/v1/tasks/:taskId: non-UUID path parameter
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/not-a-uuid`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"x"}
```
- **Expected response:** 400 Bad Request with "Validation failed (uuid v 4 is expected)"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Validation failed (uuid v 4 is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-039 — DELETE /api/v1/tasks/:taskId: non-UUID path parameter

- **Phase:** UUID validation
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** DELETE /api/v1/tasks/:taskId: non-UUID path parameter
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/not-a-uuid`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "Validation failed (uuid v 4 is expected)"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Validation failed (uuid v 4 is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-040 — UUID v1 path parameter is rejected by ParseUUIDPipe({ version: "4" })

- **Phase:** UUID validation
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** UUID v1 path parameter is rejected by ParseUUIDPipe({ version: "4" })
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/11111111-1111-1111-8111-111111111111`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "Validation failed (uuid v 4 is expected)"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Validation failed (uuid v 4 is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-041 — Create project in org A with a complete valid payload

- **Phase:** Projects
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** Create project in org A with a complete valid payload
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"key":"QAALSQ4PNZ","name":"QA Project A mwuoczls-q4pnz","description":"Primary QA project"}
```
- **Expected response:** 201 with public fields, status ACTIVE and description preserved
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.070Z"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-042 — Create project in org B for isolation tests

- **Phase:** Projects
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** Create project in org B for isolation tests
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
Content-Type: application/json
```
- **Request body:**
```json
{"key":"QABLSQ4PNZ","name":"QA Project B mwuoczls-q4pnz"}
```
- **Expected response:** 201 with public fields and default description null
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "2da67097-cd79-449a-8379-efe9838bc43f",
  "key": "QABLSQ4PNZ",
  "name": "QA Project B mwuoczls-q4pnz",
  "description": null,
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.072Z",
  "updatedAt": "2026-11-24T12:32:27.072Z"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-043 — Create clean project for the end-to-end task workflow

- **Phase:** Projects
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** Create clean project for the end-to-end task workflow
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"key":"QAWLSQ4PNZ","name":"QA Workflow mwuoczls-q4pnz","description":"Workflow project"}
```
- **Expected response:** 201 with public fields
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "key": "QAWLSQ4PNZ",
  "name": "QA Workflow mwuoczls-q4pnz",
  "description": "Workflow project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.074Z",
  "updatedAt": "2026-11-24T12:32:27.074Z"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-044 — Retrieve an existing project

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** Retrieve an existing project
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with public project fields and no internal fields
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.070Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-045 — List projects for org A only

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** List projects for org A only
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array containing org A projects but not org B project
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "key": "QAWLSQ4PNZ",
    "name": "QA Workflow mwuoczls-q4pnz",
    "description": "Workflow project",
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.074Z",
    "updatedAt": "2026-11-24T12:32:27.074Z"
  },
  {
    "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
    "key": "QAALSQ4PNZ",
    "name": "QA Project A mwuoczls-q4pnz",
    "description": "Primary QA project",
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.070Z",
    "updatedAt": "2026-11-24T12:32:27.070Z"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-046 — List projects for org B only

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** List projects for org B only
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array containing only the org B project
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "2da67097-cd79-449a-8379-efe9838bc43f",
    "key": "QABLSQ4PNZ",
    "name": "QA Project B mwuoczls-q4pnz",
    "description": null,
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.072Z",
    "updatedAt": "2026-11-24T12:32:27.072Z"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-047 — Filter projects by status ACTIVE

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Filter projects by status ACTIVE
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects?status=ACTIVE`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array where every item has status ACTIVE
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "key": "QAWLSQ4PNZ",
    "name": "QA Workflow mwuoczls-q4pnz",
    "description": "Workflow project",
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.074Z",
    "updatedAt": "2026-11-24T12:32:27.074Z"
  },
  {
    "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
    "key": "QAALSQ4PNZ",
    "name": "QA Project A mwuoczls-q4pnz",
    "description": "Primary QA project",
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.070Z",
    "updatedAt": "2026-11-24T12:32:27.070Z"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-048 — Filter projects by status ARCHIVED before archiving anything

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Filter projects by status ARCHIVED before archiving anything
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects?status=ARCHIVED`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with an empty array
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-049 — Invalid project status filter is rejected

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Invalid project status filter is rejected
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects?status=INVALID`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request for an unsupported status filter
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[]
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 200. Assertion: expected JSON object, got [] Related bug(s): BUG-05.

### TC-050 — Lowercase project status filter is rejected

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Lowercase project status filter is rejected
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects?status=active`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request; status enum is case-sensitive
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[]
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 200. Assertion: expected JSON object, got [] Related bug(s): BUG-05.

### TC-051 — Unknown project query parameter is ignored

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Unknown project query parameter is ignored
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects?foo=bar`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array (no unknown-filter validation is implemented)
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "key": "QAWLSQ4PNZ",
    "name": "QA Workflow mwuoczls-q4pnz",
    "description": "Workflow project",
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.074Z",
    "updatedAt": "2026-11-24T12:32:27.074Z"
  },
  {
    "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
    "key": "QAALSQ4PNZ",
    "name": "QA Project A mwuoczls-q4pnz",
    "description": "Primary QA project",
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.070Z",
    "updatedAt": "2026-11-24T12:32:27.070Z"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-052 — Pagination parameters are not implemented and are ignored

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Pagination parameters are not implemented and are ignored
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects?limit=1&offset=99`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with all org A projects; pagination is not implemented
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "key": "QAWLSQ4PNZ",
    "name": "QA Workflow mwuoczls-q4pnz",
    "description": "Workflow project",
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.074Z",
    "updatedAt": "2026-11-24T12:32:27.074Z"
  },
  {
    "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
    "key": "QAALSQ4PNZ",
    "name": "QA Project A mwuoczls-q4pnz",
    "description": "Primary QA project",
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.070Z",
    "updatedAt": "2026-11-24T12:32:27.070Z"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-053 — Retrieve a well-formed but non-existent project UUID

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** Retrieve a well-formed but non-existent project UUID
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Project not found"
- **Actual response:**
```text
200 OK
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 404, got 200. Assertion: expected JSON object, got null Related bug(s): BUG-02.

### TC-054 — Create project with an empty JSON body

- **Phase:** Project validation
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** Create project with an empty JSON body
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{}
```
- **Expected response:** 400 Bad Request because key and name are required
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "c116051f-79c5-4bef-abf3-6ae36ad1185e",
  "description": null,
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.089Z",
  "updatedAt": "2026-11-24T12:32:27.089Z"
}
```
- **HTTP status code:** 201 Created
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 201. Assertion: missing response keys: key, name Related bug(s): BUG-01.

### TC-055 — Create project with key but no name

- **Phase:** Project validation
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** Create project with key but no name
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"key":"QAALSQ4PNZN"}
```
- **Expected response:** 400 Bad Request because name is required
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "a0f07032-1d44-4ebe-8dd2-15083451cfeb",
  "key": "QAALSQ4PNZN",
  "description": null,
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.091Z",
  "updatedAt": "2026-11-24T12:32:27.091Z"
}
```
- **HTTP status code:** 201 Created
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 201. Related bug(s): BUG-01.

### TC-056 — Create project with read-only/unknown fields (status, owner)

- **Phase:** Project validation
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** Create project with read-only/unknown fields (status, owner)
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"key":"QAALSQ4PNZR","name":"Read-only field test","status":"ARCHIVED","owner":"someone-else"}
```
- **Expected response:** 400 Bad Request rejecting read-only/unknown fields
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "fac17340-00d9-4a7f-b567-26b26b726317",
  "key": "QAALSQ4PNZR",
  "name": "Read-only field test",
  "description": null,
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.093Z",
  "updatedAt": "2026-11-24T12:32:27.093Z"
}
```
- **HTTP status code:** 201 Created
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 201. Related bug(s): BUG-01.

### TC-057 — Create project with numeric description

- **Phase:** Project validation
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** Create project with numeric description
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"key":"QAALSQ4PNZD","name":"Bad description","description":123}
```
- **Expected response:** 400 Bad Request because description must be string or null
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "055fdf87-5914-4bf8-849a-6f22acfa47cf",
  "key": "QAALSQ4PNZD",
  "name": "Bad description",
  "description": 123,
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.094Z",
  "updatedAt": "2026-11-24T12:32:27.094Z"
}
```
- **HTTP status code:** 201 Created
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 201. Related bug(s): BUG-01.

### TC-058 — Create project with a JSON array body

- **Phase:** Project validation
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** Create project with a JSON array body
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
[{"key":"QAALSQ4PNZ","name":"Array project"}]
```
- **Expected response:** 400 Bad Request because the body must be an object
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "08c3be3d-88f3-4e64-bde6-bb2d7b04b71c",
  "description": null,
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.096Z",
  "updatedAt": "2026-11-24T12:32:27.096Z"
}
```
- **HTTP status code:** 201 Created
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 201. Related bug(s): BUG-01.

### TC-059 — Create project with malformed JSON

- **Phase:** Project validation
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** Create project with malformed JSON
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"key": 
```
- **Expected response:** 400 Bad Request from the JSON parser
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Unexpected end of JSON input",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-060 — Update project name with a valid patch

- **Phase:** Projects
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Update project name with a valid patch
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"name":"QA Project A renamed mwuoczls-q4pnz"}
```
- **Expected response:** 200 with the new name and public fields only
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A renamed mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.099Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-061 — Capture updatedAt before an empty PATCH

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** Capture updatedAt before an empty PATCH
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with current project state
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A renamed mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.099Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-062 — Empty PATCH body is rejected and does not change updatedAt

- **Phase:** Project validation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Empty PATCH body is rejected and does not change updatedAt
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{}
```
- **Expected response:** 400 Bad Request for an empty patch
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A renamed mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.100Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 200. Observed side effect: updatedAt changed from 2026-11-24T12:32:27.099Z to 2026-11-24T12:32:27.100Z Related bug(s): BUG-04.

### TC-063 — Capture updatedAt before a no-op PATCH

- **Phase:** Projects
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** Capture updatedAt before a no-op PATCH
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with current project state
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A renamed mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.100Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-064 — No-op PATCH preserves updatedAt

- **Phase:** Project validation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** No-op PATCH preserves updatedAt
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"name":"QA Project A renamed mwuoczls-q4pnz"}
```
- **Expected response:** 200 with updatedAt unchanged
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A renamed mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.103Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: updatedAt="2026-11-24T12:32:27.103Z", expected "2026-11-24T12:32:27.100Z" Related bug(s): BUG-04.

### TC-065 — Internal nextTaskNumber cannot be patched by a client

- **Phase:** Project validation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Internal nextTaskNumber cannot be patched by a client
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"nextTaskNumber":50}
```
- **Expected response:** 400 Bad Request rejecting the read-only nextTaskNumber field
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A renamed mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.104Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 200. Related bug(s): BUG-03.

### TC-066 — Task numbering after the tampered counter shows the mass-assignment impact

- **Phase:** Project validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Task numbering after the tampered counter shows the mass-assignment impact
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Task number probe"}
```
- **Expected response:** 201 with key QAALSQ4PNZ-1 (counter should not be client-controlled)
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "380d9e49-728d-4d4a-87fa-787e6720213d",
  "projectId": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "number": 50,
  "title": "Task number probe",
  "description": null,
  "status": "TODO",
  "priority": "MEDIUM",
  "assigneeId": null,
  "dueDate": null,
  "createdAt": "2026-11-24T12:32:27.105Z",
  "updatedAt": "2026-11-24T12:32:27.105Z",
  "key": "QAALSQ4PNZ-50"
}
```
- **HTTP status code:** 201 Created
- **Result:** FAIL
- **Explanation:** Assertion: key="QAALSQ4PNZ-50", expected "QAALSQ4PNZ-1" Related bug(s): BUG-03.

### TC-067 — Invalid project status value is rejected

- **Phase:** Project validation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Invalid project status value is rejected
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"BANANA"}
```
- **Expected response:** 400 Bad Request for a status outside ACTIVE|ARCHIVED
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A renamed mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "BANANA",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.106Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 200. Assertion: status="BANANA", expected "ACTIVE"

### TC-068 — Verify invalid status was persisted by the rejected PATCH

- **Phase:** Project validation
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** Verify invalid status was persisted by the rejected PATCH
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with status still ACTIVE
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A renamed mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "BANANA",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.106Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: status="BANANA", expected "ACTIVE"

### TC-069 — Restore project status to ACTIVE

- **Phase:** Project validation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Restore project status to ACTIVE
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"ACTIVE"}
```
- **Expected response:** 200 with status ACTIVE
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A renamed mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.109Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-070 — Numeric name is rejected by PATCH

- **Phase:** Project validation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Numeric name is rejected by PATCH
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"name":123}
```
- **Expected response:** 400 Bad Request because name must be a string
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": 123,
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.110Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 200. Related bug(s): BUG-01.

### TC-071 — Restore project name to a string

- **Phase:** Project validation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Restore project name to a string
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"name":"QA Project A restored mwuoczls-q4pnz"}
```
- **Expected response:** 200 with string name
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A restored mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.111Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-072 — Read-only key field is rejected by PATCH

- **Phase:** Project validation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Read-only key field is rejected by PATCH
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"key":"HACKED"}
```
- **Expected response:** 400 Bad Request rejecting the read-only key field
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A restored mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.113Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 200. Related bug(s): BUG-01.

### TC-073 — Unknown field is rejected by PATCH

- **Phase:** Project validation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Unknown field is rejected by PATCH
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"owner":"someone-else"}
```
- **Expected response:** 400 Bad Request rejecting an unknown field
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
  "key": "QAALSQ4PNZ",
  "name": "QA Project A restored mwuoczls-q4pnz",
  "description": "Primary QA project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.070Z",
  "updatedAt": "2026-11-24T12:32:27.114Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 200. Related bug(s): BUG-01.

### TC-074 — PATCH a well-formed but non-existent project UUID

- **Phase:** Projects
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** PATCH a well-formed but non-existent project UUID
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"name":"Nobody"}
```
- **Expected response:** 404 Not Found with "Project not found"
- **Actual response:**
```text
200 OK
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 404, got 200. Assertion: expected JSON object, got null Related bug(s): BUG-02.

### TC-075 — DELETE a well-formed but non-existent project UUID

- **Phase:** Projects
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** DELETE a well-formed but non-existent project UUID
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Project not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Project not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-076 — Create task with only the required title

- **Phase:** Tasks
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with only the required title
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Minimal task"}
```
- **Expected response:** 201 with key W-1, status TODO, priority MEDIUM, null optional fields, no organizationId
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 1,
  "title": "Minimal task",
  "description": null,
  "status": "TODO",
  "priority": "MEDIUM",
  "assigneeId": null,
  "dueDate": null,
  "createdAt": "2026-11-24T12:32:27.117Z",
  "updatedAt": "2026-11-24T12:32:27.117Z",
  "key": "QAWLSQ4PNZ-1"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-077 — Create task with all optional fields and whitespace in title

- **Phase:** Tasks
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with all optional fields and whitespace in title
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"  Full task with whitespace  ","description":"Full description","priority":"HIGH","assigneeId":"qa-user-a-mwuoczls-q4pnz","dueDate":"2026-12-31"}
```
- **Expected response:** 201 with trimmed title, key W-2 and all supplied fields preserved
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 2,
  "title": "Full task with whitespace",
  "description": "Full description",
  "status": "TODO",
  "priority": "HIGH",
  "assigneeId": "qa-user-a-mwuoczls-q4pnz",
  "dueDate": "2026-12-31",
  "createdAt": "2026-11-24T12:32:27.118Z",
  "updatedAt": "2026-11-24T12:32:27.118Z",
  "key": "QAWLSQ4PNZ-2"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-078 — Create low-priority task assigned to org B user string

- **Phase:** Tasks
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create low-priority task assigned to org B user string
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Low priority task","priority":"LOW","assigneeId":"qa-user-b-mwuoczls-q4pnz"}
```
- **Expected response:** 201 with key W-3, priority LOW and assigneeId preserved
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "a830f772-5848-4623-9d34-538edb4c7f21",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 3,
  "title": "Low priority task",
  "description": null,
  "status": "TODO",
  "priority": "LOW",
  "assigneeId": "qa-user-b-mwuoczls-q4pnz",
  "dueDate": null,
  "createdAt": "2026-11-24T12:32:27.120Z",
  "updatedAt": "2026-11-24T12:32:27.120Z",
  "key": "QAWLSQ4PNZ-3"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-079 — Create urgent task used for state-transition tests

- **Phase:** Tasks
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create urgent task used for state-transition tests
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Status transition task","priority":"URGENT","assigneeId":"qa-user-a-mwuoczls-q4pnz"}
```
- **Expected response:** 201 with key W-4, status TODO and priority URGENT
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "title": "Status transition task",
  "description": null,
  "status": "TODO",
  "priority": "URGENT",
  "assigneeId": "qa-user-a-mwuoczls-q4pnz",
  "dueDate": null,
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.121Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-080 — Create task without title

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task without title
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"priority":"HIGH"}
```
- **Expected response:** 400 Bad Request with "Title must be a string between 1 and 200 characters"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Title must be a string between 1 and 200 characters",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-081 — Create task with whitespace-only title

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with whitespace-only title
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"   "}
```
- **Expected response:** 400 Bad Request with "Title must be a string between 1 and 200 characters"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Title must be a string between 1 and 200 characters",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-082 — Create task with a 201-character title

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with a 201-character title
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
```
- **Expected response:** 400 Bad Request with "Title must be a string between 1 and 200 characters"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Title must be a string between 1 and 200 characters",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-083 — Create task with numeric title

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with numeric title
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":42}
```
- **Expected response:** 400 Bad Request with "Title must be a string between 1 and 200 characters"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Title must be a string between 1 and 200 characters",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-084 — Create task with unsupported priority

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with unsupported priority
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Bad priority","priority":"CRITICAL"}
```
- **Expected response:** 400 Bad Request with "Invalid task priority"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Invalid task priority",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-085 — Create task with numeric description

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with numeric description
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Bad description","description":42}
```
- **Expected response:** 400 Bad Request with "Description must be a string or null"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Description must be a string or null",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-086 — Create task with numeric assigneeId

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with numeric assigneeId
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Bad assignee","assigneeId":42}
```
- **Expected response:** 400 Bad Request with "Assignee ID must be a string or null"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Assignee ID must be a string or null",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-087 — Create task with numeric dueDate

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with numeric dueDate
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Bad due date","dueDate":20261231}
```
- **Expected response:** 400 Bad Request with "Due date must be a string or null"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Due date must be a string or null",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-088 — Create task with server-managed status field

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with server-managed status field
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Read-only status","status":"DONE"}
```
- **Expected response:** 400 Bad Request with "Unknown or read-only fields: status"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Unknown or read-only fields: status",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-089 — Create task with a JSON array body

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with a JSON array body
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
[{"title":"Array body"}]
```
- **Expected response:** 400 Bad Request with "Request body must be an object"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Request body must be an object",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-090 — Create task with an empty JSON body

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with an empty JSON body
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{}
```
- **Expected response:** 400 Bad Request with "Title must be a string between 1 and 200 characters"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Title must be a string between 1 and 200 characters",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-091 — Create task with malformed JSON

- **Phase:** Task validation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task with malformed JSON
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title": 
```
- **Expected response:** 400 Bad Request from the JSON parser
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Unexpected end of JSON input",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-092 — Create task in a non-existent project

- **Phase:** Tasks
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create task in a non-existent project
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Orphan task"}
```
- **Expected response:** 404 Not Found with "Project not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Project not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-093 — List all tasks in the workflow project

- **Phase:** Tasks
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** List all tasks in the workflow project
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array of 4 tasks sorted by number descending
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 4,
    "title": "Status transition task",
    "description": null,
    "status": "TODO",
    "priority": "URGENT",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.121Z",
    "updatedAt": "2026-11-24T12:32:27.121Z",
    "key": "QAWLSQ4PNZ-4"
  },
  {
    "id": "a830f772-5848-4623-9d34-538edb4c7f21",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 3,
    "title": "Low priority task",
    "description": null,
    "status": "TODO",
    "priority": "LOW",
    "assigneeId": "qa-user-b-mwuoczls-q4pnz",
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.120Z",
    "updatedAt": "2026-11-24T12:32:27.120Z",
    "key": "QAWLSQ4PNZ-3"
  },
  {
    "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 2,
    "title": "Full task with whitespace",
    "description": "Full description",
    "status": "TODO",
    "priority": "HIGH",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": "2026-12-31",
    "createdAt": "2026-11-24T12:32:27.118Z",
    "updatedAt": "2026-11-24T12:32:27.118Z",
    "key": "QAWLSQ4PNZ-2"
  },
  {
    "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 1,
    "title": "Minimal task",
    "description": null,
    "status": "TODO",
    "priority": "MEDIUM",
    "assigneeId": null,
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.117Z",
    "updatedAt": "2026-11-24T12:32:27.117Z",
    "key": "QAWLSQ4PNZ-1"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-094 — Filter tasks by status TODO

- **Phase:** Task filters
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Filter tasks by status TODO
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks?status=TODO`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array containing only TODO tasks
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 4,
    "title": "Status transition task",
    "description": null,
    "status": "TODO",
    "priority": "URGENT",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.121Z",
    "updatedAt": "2026-11-24T12:32:27.121Z",
    "key": "QAWLSQ4PNZ-4"
  },
  {
    "id": "a830f772-5848-4623-9d34-538edb4c7f21",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 3,
    "title": "Low priority task",
    "description": null,
    "status": "TODO",
    "priority": "LOW",
    "assigneeId": "qa-user-b-mwuoczls-q4pnz",
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.120Z",
    "updatedAt": "2026-11-24T12:32:27.120Z",
    "key": "QAWLSQ4PNZ-3"
  },
  {
    "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 2,
    "title": "Full task with whitespace",
    "description": "Full description",
    "status": "TODO",
    "priority": "HIGH",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": "2026-12-31",
    "createdAt": "2026-11-24T12:32:27.118Z",
    "updatedAt": "2026-11-24T12:32:27.118Z",
    "key": "QAWLSQ4PNZ-2"
  },
  {
    "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 1,
    "title": "Minimal task",
    "description": null,
    "status": "TODO",
    "priority": "MEDIUM",
    "assigneeId": null,
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.117Z",
    "updatedAt": "2026-11-24T12:32:27.117Z",
    "key": "QAWLSQ4PNZ-1"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-095 — Filter tasks by priority HIGH

- **Phase:** Task filters
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Filter tasks by priority HIGH
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks?priority=HIGH`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array containing only the HIGH priority task
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 2,
    "title": "Full task with whitespace",
    "description": "Full description",
    "status": "TODO",
    "priority": "HIGH",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": "2026-12-31",
    "createdAt": "2026-11-24T12:32:27.118Z",
    "updatedAt": "2026-11-24T12:32:27.118Z",
    "key": "QAWLSQ4PNZ-2"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-096 — Filter tasks by assigneeId

- **Phase:** Task filters
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Filter tasks by assigneeId
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks?assigneeId=qa-user-a-mwuoczls-q4pnz`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array containing the two tasks assigned to USER_A
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 4,
    "title": "Status transition task",
    "description": null,
    "status": "TODO",
    "priority": "URGENT",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.121Z",
    "updatedAt": "2026-11-24T12:32:27.121Z",
    "key": "QAWLSQ4PNZ-4"
  },
  {
    "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 2,
    "title": "Full task with whitespace",
    "description": "Full description",
    "status": "TODO",
    "priority": "HIGH",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": "2026-12-31",
    "createdAt": "2026-11-24T12:32:27.118Z",
    "updatedAt": "2026-11-24T12:32:27.118Z",
    "key": "QAWLSQ4PNZ-2"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-097 — Combine status, priority and assigneeId filters

- **Phase:** Task filters
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Combine status, priority and assigneeId filters
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks?status=TODO&priority=HIGH&assigneeId=qa-user-a-mwuoczls-q4pnz`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array containing exactly the matching task W-2
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 2,
    "title": "Full task with whitespace",
    "description": "Full description",
    "status": "TODO",
    "priority": "HIGH",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": "2026-12-31",
    "createdAt": "2026-11-24T12:32:27.118Z",
    "updatedAt": "2026-11-24T12:32:27.118Z",
    "key": "QAWLSQ4PNZ-2"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-098 — Invalid task status filter

- **Phase:** Task filters
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Invalid task status filter
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks?status=BANANA`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "Invalid task status filter"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Invalid task status filter",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-099 — Invalid task priority filter

- **Phase:** Task filters
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Invalid task priority filter
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks?priority=CRITICAL`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "Invalid task priority filter"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Invalid task priority filter",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-100 — Empty task status filter

- **Phase:** Task filters
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Empty task status filter
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks?status=`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "Invalid task status filter"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Invalid task status filter",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-101 — Unknown task query parameter is rejected by filter validation

- **Phase:** Task filters
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Unknown task query parameter is rejected by filter validation
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks?foo=bar`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 400 Bad Request with "Unknown or read-only fields: foo"
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 4,
    "title": "Status transition task",
    "description": null,
    "status": "TODO",
    "priority": "URGENT",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.121Z",
    "updatedAt": "2026-11-24T12:32:27.121Z",
    "key": "QAWLSQ4PNZ-4"
  },
  {
    "id": "a830f772-5848-4623-9d34-538edb4c7f21",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 3,
    "title": "Low priority task",
    "description": null,
    "status": "TODO",
    "priority": "LOW",
    "assigneeId": "qa-user-b-mwuoczls-q4pnz",
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.120Z",
    "updatedAt": "2026-11-24T12:32:27.120Z",
    "key": "QAWLSQ4PNZ-3"
  },
  {
    "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 2,
    "title": "Full task with whitespace",
    "description": "Full description",
    "status": "TODO",
    "priority": "HIGH",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": "2026-12-31",
    "createdAt": "2026-11-24T12:32:27.118Z",
    "updatedAt": "2026-11-24T12:32:27.118Z",
    "key": "QAWLSQ4PNZ-2"
  },
  {
    "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 1,
    "title": "Minimal task",
    "description": null,
    "status": "TODO",
    "priority": "MEDIUM",
    "assigneeId": null,
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.117Z",
    "updatedAt": "2026-11-24T12:32:27.117Z",
    "key": "QAWLSQ4PNZ-1"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 400, got 200. Assertion: expected JSON object, got [{"id":"75c7172b-6fff-42bb-bbd1-482fb18cf9a5","projectId":"beb4e9af-a663-49e7-bc77-7c20a574f263","number":4,"title":"Status transition task","description":null,"status":"TODO","priority":"URGENT","assigneeId":"qa-user-a-mwuoczls-q4pnz","dueDate":null,"createdAt":"2026-11-24T12:32:27.121Z","updatedAt":"2026-11-24T12:32:27.121Z","key":"QAWLSQ4PNZ-4"},{"id":"a830f772-5848-4623-9d34-538edb4c7f21","projectId":"beb4e9af-a663-49e7-bc77-7c20a574f263","number":3,"title":"Low priority task","description":null,"status":"TODO","priority":"LOW","assigneeId":"qa-user-b-mwuoczls-q4pnz","dueDate":null,"createdAt":"2026-11-24T12:32:27.120Z","updatedAt":"2026-11-24T12:32:27.120Z","key":"QAWLSQ4PNZ-3"},{"id":"bd7abfca-86ae-472c-889c-faefb2f07a6a","projectId":"beb4e9af-a663-49e7-bc77-7c20a574f263","number":2,"title":"Full task with whitespace","description":"Full description","status":"TODO","priority":"HIGH","assigneeId":"qa-user-a-mwuoczls-q4pnz","dueDate":"2026-12-31","createdAt":"2026-11-24T12:32:27.118Z","updatedAt":"2026-11-24T12:32:27.118Z","key":"QAWLSQ4PNZ-2"},{"id":"9d8628bd-fc16-4ee2-98ac-9bbad929420f","projectId":"beb4e9af-a663-49e7-bc77-7c20a574f263","number":1,"title":"Minimal task","description":null,"status":"TODO","priority":"MEDIUM","assigneeId":null,"dueDate":null,"createdAt":"2026-11-24T12:32:27.117Z","updatedAt":"2026-11-24T12:32:27.117Z","key":"QAWLSQ4PNZ-1"}] Related bug(s): BUG-06.

### TC-102 — Task pagination parameters are not implemented and are ignored

- **Phase:** Task filters
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Task pagination parameters are not implemented and are ignored
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks?limit=1&offset=99`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with all 4 tasks; pagination is not implemented
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 4,
    "title": "Status transition task",
    "description": null,
    "status": "TODO",
    "priority": "URGENT",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.121Z",
    "updatedAt": "2026-11-24T12:32:27.121Z",
    "key": "QAWLSQ4PNZ-4"
  },
  {
    "id": "a830f772-5848-4623-9d34-538edb4c7f21",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 3,
    "title": "Low priority task",
    "description": null,
    "status": "TODO",
    "priority": "LOW",
    "assigneeId": "qa-user-b-mwuoczls-q4pnz",
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.120Z",
    "updatedAt": "2026-11-24T12:32:27.120Z",
    "key": "QAWLSQ4PNZ-3"
  },
  {
    "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 2,
    "title": "Full task with whitespace",
    "description": "Full description",
    "status": "TODO",
    "priority": "HIGH",
    "assigneeId": "qa-user-a-mwuoczls-q4pnz",
    "dueDate": "2026-12-31",
    "createdAt": "2026-11-24T12:32:27.118Z",
    "updatedAt": "2026-11-24T12:32:27.118Z",
    "key": "QAWLSQ4PNZ-2"
  },
  {
    "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 1,
    "title": "Minimal task",
    "description": null,
    "status": "TODO",
    "priority": "MEDIUM",
    "assigneeId": null,
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.117Z",
    "updatedAt": "2026-11-24T12:32:27.117Z",
    "key": "QAWLSQ4PNZ-1"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-103 — List tasks for a non-existent project

- **Phase:** Tasks
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** List tasks for a non-existent project
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Project not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Project not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-104 — Retrieve an existing task

- **Phase:** Tasks
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** Retrieve an existing task
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with public task fields and derived key
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 1,
  "title": "Minimal task",
  "description": null,
  "status": "TODO",
  "priority": "MEDIUM",
  "assigneeId": null,
  "dueDate": null,
  "createdAt": "2026-11-24T12:32:27.117Z",
  "updatedAt": "2026-11-24T12:32:27.117Z",
  "key": "QAWLSQ4PNZ-1"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-105 — Retrieve a non-existent task UUID

- **Phase:** Tasks
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** Retrieve a non-existent task UUID
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/40fe4a7b-3a01-48a2-9eab-61b9693717ed`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Task not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-106 — Update task title and verify trimming

- **Phase:** Tasks
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Update task title and verify trimming
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"  Minimal task renamed  "}
```
- **Expected response:** 200 with title trimmed to "Minimal task renamed"
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 1,
  "title": "Minimal task renamed",
  "createdAt": "2026-11-24T12:32:27.117Z",
  "updatedAt": "2026-11-24T12:32:27.153Z",
  "key": "QAWLSQ4PNZ-1"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: description, status, priority, assigneeId, dueDate Related bug(s): BUG-08.

### TC-107 — Clear task description with null

- **Phase:** Tasks
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Clear task description with null
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/bd7abfca-86ae-472c-889c-faefb2f07a6a`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"description":null}
```
- **Expected response:** 200 with description null
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 2,
  "description": null,
  "createdAt": "2026-11-24T12:32:27.118Z",
  "updatedAt": "2026-11-24T12:32:27.154Z",
  "key": "QAWLSQ4PNZ-2"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-108 — Update priority, assigneeId and dueDate together

- **Phase:** Tasks
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Update priority, assigneeId and dueDate together
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/bd7abfca-86ae-472c-889c-faefb2f07a6a`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"priority":"URGENT","assigneeId":"qa-user-b-mwuoczls-q4pnz","dueDate":"2027-01-15"}
```
- **Expected response:** 200 with all three fields updated
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 2,
  "priority": "URGENT",
  "assigneeId": "qa-user-b-mwuoczls-q4pnz",
  "dueDate": "2027-01-15",
  "createdAt": "2026-11-24T12:32:27.118Z",
  "updatedAt": "2026-11-24T12:32:27.155Z",
  "key": "QAWLSQ4PNZ-2"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-109 — Empty PATCH body

- **Phase:** Task validation
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Empty PATCH body
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{}
```
- **Expected response:** 400 Bad Request with "PATCH body cannot be empty"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "PATCH body cannot be empty",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-110 — PATCH a read-only task field

- **Phase:** Task validation
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** PATCH a read-only task field
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"number":99}
```
- **Expected response:** 400 Bad Request with "Unknown or read-only fields: number"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Unknown or read-only fields: number",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-111 — PATCH with a blank title

- **Phase:** Task validation
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** PATCH with a blank title
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"  "}
```
- **Expected response:** 400 Bad Request for an invalid title
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Title must be a string between 1 and 200 characters",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-112 — PATCH with an unsupported status value

- **Phase:** Task validation
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** PATCH with an unsupported status value
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"BANANA"}
```
- **Expected response:** 400 Bad Request with "Invalid task status"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Invalid task status",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-113 — PATCH with an unsupported priority value

- **Phase:** Task validation
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** PATCH with an unsupported priority value
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"priority":"CRITICAL"}
```
- **Expected response:** 400 Bad Request with "Invalid task priority"
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Invalid task priority",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-114 — PATCH with malformed JSON

- **Phase:** Task validation
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** PATCH with malformed JSON
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title": 
```
- **Expected response:** 400 Bad Request from the JSON parser
- **Actual response:**
```text
400 Bad Request
Content-Type: application/json; charset=utf-8
{
  "message": "Unexpected end of JSON input",
  "error": "Bad Request",
  "statusCode": 400
}
```
- **HTTP status code:** 400 Bad Request
- **Result:** PASS

### TC-115 — PATCH a non-existent task UUID

- **Phase:** Tasks
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** PATCH a non-existent task UUID
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/40fe4a7b-3a01-48a2-9eab-61b9693717ed`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Nobody"}
```
- **Expected response:** 404 Not Found with "Task not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-116 — Capture task state before a no-op PATCH

- **Phase:** Tasks
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** Capture task state before a no-op PATCH
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with current task state
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 1,
  "title": "Minimal task renamed",
  "createdAt": "2026-11-24T12:32:27.117Z",
  "updatedAt": "2026-11-24T12:32:27.153Z",
  "key": "QAWLSQ4PNZ-1"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: description, status, priority, assigneeId, dueDate Related bug(s): BUG-08.

### TC-117 — No-op PATCH with whitespace around the current title preserves updatedAt

- **Phase:** Tasks
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** No-op PATCH with whitespace around the current title preserves updatedAt
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"  Minimal task renamed  "}
```
- **Expected response:** 200 with updatedAt unchanged
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 1,
  "title": "Minimal task renamed",
  "createdAt": "2026-11-24T12:32:27.117Z",
  "updatedAt": "2026-11-24T12:32:27.153Z",
  "key": "QAWLSQ4PNZ-1"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-118 — Status transition TODO -> IN_PROGRESS

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition TODO -> IN_PROGRESS
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"IN_PROGRESS"}
```
- **Expected response:** 200 with status IN_PROGRESS
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "status": "IN_PROGRESS",
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.168Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: title, description, priority, assigneeId, dueDate Related bug(s): BUG-08.

### TC-119 — Status transition IN_PROGRESS -> IN_REVIEW

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition IN_PROGRESS -> IN_REVIEW
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"IN_REVIEW"}
```
- **Expected response:** 200 with status IN_REVIEW
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "status": "IN_REVIEW",
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.169Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: title, description, priority, assigneeId, dueDate

### TC-120 — Status transition IN_REVIEW -> DONE

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition IN_REVIEW -> DONE
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"DONE"}
```
- **Expected response:** 200 with status DONE
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "status": "DONE",
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.170Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: title, description, priority, assigneeId, dueDate

### TC-121 — Status transition DONE -> IN_PROGRESS

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition DONE -> IN_PROGRESS
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"IN_PROGRESS"}
```
- **Expected response:** 200 with status IN_PROGRESS
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "status": "IN_PROGRESS",
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.172Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: title, description, priority, assigneeId, dueDate

### TC-122 — Status transition IN_PROGRESS -> TODO

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition IN_PROGRESS -> TODO
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"TODO"}
```
- **Expected response:** 200 with status TODO
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "status": "TODO",
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.173Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: title, description, priority, assigneeId, dueDate

### TC-123 — Status transition TODO -> DONE

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition TODO -> DONE
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"DONE"}
```
- **Expected response:** 422 with "Cannot move task from TODO to DONE"
- **Actual response:**
```text
422 Unprocessable Entity
Content-Type: application/json; charset=utf-8
{
  "message": "Cannot move task from TODO to DONE",
  "error": "Unprocessable Entity",
  "statusCode": 422
}
```
- **HTTP status code:** 422 Unprocessable Entity
- **Result:** PASS

### TC-124 — Status transition TODO -> IN_REVIEW

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition TODO -> IN_REVIEW
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"IN_REVIEW"}
```
- **Expected response:** 422 with "Cannot move task from TODO to IN_REVIEW"
- **Actual response:**
```text
422 Unprocessable Entity
Content-Type: application/json; charset=utf-8
{
  "message": "Cannot move task from TODO to IN_REVIEW",
  "error": "Unprocessable Entity",
  "statusCode": 422
}
```
- **HTTP status code:** 422 Unprocessable Entity
- **Result:** PASS

### TC-125 — Status transition TODO -> IN_PROGRESS

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition TODO -> IN_PROGRESS
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"IN_PROGRESS"}
```
- **Expected response:** 200 with status IN_PROGRESS
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "status": "IN_PROGRESS",
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.177Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: title, description, priority, assigneeId, dueDate

### TC-126 — Status transition IN_PROGRESS -> DONE

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition IN_PROGRESS -> DONE
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"DONE"}
```
- **Expected response:** 422 with "Cannot move task from IN_PROGRESS to DONE"
- **Actual response:**
```text
422 Unprocessable Entity
Content-Type: application/json; charset=utf-8
{
  "message": "Cannot move task from IN_PROGRESS to DONE",
  "error": "Unprocessable Entity",
  "statusCode": 422
}
```
- **HTTP status code:** 422 Unprocessable Entity
- **Result:** PASS

### TC-127 — Status transition IN_PROGRESS -> IN_REVIEW

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition IN_PROGRESS -> IN_REVIEW
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"IN_REVIEW"}
```
- **Expected response:** 200 with status IN_REVIEW
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "status": "IN_REVIEW",
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.181Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: title, description, priority, assigneeId, dueDate

### TC-128 — Status transition IN_REVIEW -> TODO

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition IN_REVIEW -> TODO
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"TODO"}
```
- **Expected response:** 422 with "Cannot move task from IN_REVIEW to TODO"
- **Actual response:**
```text
422 Unprocessable Entity
Content-Type: application/json; charset=utf-8
{
  "message": "Cannot move task from IN_REVIEW to TODO",
  "error": "Unprocessable Entity",
  "statusCode": 422
}
```
- **HTTP status code:** 422 Unprocessable Entity
- **Result:** PASS

### TC-129 — Status transition IN_REVIEW -> DONE

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition IN_REVIEW -> DONE
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"DONE"}
```
- **Expected response:** 200 with status DONE
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "status": "DONE",
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.184Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: title, description, priority, assigneeId, dueDate

### TC-130 — Status transition DONE -> TODO

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition DONE -> TODO
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"TODO"}
```
- **Expected response:** 422 with "Cannot move task from DONE to TODO"
- **Actual response:**
```text
422 Unprocessable Entity
Content-Type: application/json; charset=utf-8
{
  "message": "Cannot move task from DONE to TODO",
  "error": "Unprocessable Entity",
  "statusCode": 422
}
```
- **HTTP status code:** 422 Unprocessable Entity
- **Result:** PASS

### TC-131 — Status transition DONE -> IN_REVIEW

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Status transition DONE -> IN_REVIEW
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"IN_REVIEW"}
```
- **Expected response:** 422 with "Cannot move task from DONE to IN_REVIEW"
- **Actual response:**
```text
422 Unprocessable Entity
Content-Type: application/json; charset=utf-8
{
  "message": "Cannot move task from DONE to IN_REVIEW",
  "error": "Unprocessable Entity",
  "statusCode": 422
}
```
- **HTTP status code:** 422 Unprocessable Entity
- **Result:** PASS

### TC-132 — Capture task state before patching to the same status

- **Phase:** Task state machine
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** Capture task state before patching to the same status
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with status DONE
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "status": "DONE",
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.184Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-133 — Patch a task to its current status is a no-op

- **Phase:** Task state machine
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Patch a task to its current status is a no-op
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"DONE"}
```
- **Expected response:** 200 with status DONE and updatedAt unchanged
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 4,
  "status": "DONE",
  "createdAt": "2026-11-24T12:32:27.121Z",
  "updatedAt": "2026-11-24T12:32:27.184Z",
  "key": "QAWLSQ4PNZ-4"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-134 — Create a task that will be deleted

- **Phase:** Tasks
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create a task that will be deleted
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Delete me"}
```
- **Expected response:** 201 with key W-5
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "5bf7007d-cb21-45b3-a8e1-b13ffb29aeb9",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 5,
  "title": "Delete me",
  "description": null,
  "status": "TODO",
  "priority": "MEDIUM",
  "assigneeId": null,
  "dueDate": null,
  "createdAt": "2026-11-24T12:32:27.189Z",
  "updatedAt": "2026-11-24T12:32:27.189Z",
  "key": "QAWLSQ4PNZ-5"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-135 — Delete an existing task

- **Phase:** Tasks
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Delete an existing task
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/5bf7007d-cb21-45b3-a8e1-b13ffb29aeb9`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 No Content with empty body
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-136 — Retrieve a deleted task

- **Phase:** Tasks
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** Retrieve a deleted task
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/5bf7007d-cb21-45b3-a8e1-b13ffb29aeb9`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Task not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-137 — Delete the same task a second time

- **Phase:** Tasks
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Delete the same task a second time
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/5bf7007d-cb21-45b3-a8e1-b13ffb29aeb9`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Task not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-138 — Delete a non-existent task UUID

- **Phase:** Tasks
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Delete a non-existent task UUID
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/40fe4a7b-3a01-48a2-9eab-61b9693717ed`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Task not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-139 — Org B project list does not leak org A projects

- **Phase:** Organization isolation
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Org B project list does not leak org A projects
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array containing only KEY_B
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "2da67097-cd79-449a-8379-efe9838bc43f",
    "key": "QABLSQ4PNZ",
    "name": "QA Project B mwuoczls-q4pnz",
    "description": null,
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.072Z",
    "updatedAt": "2026-11-24T12:32:27.072Z"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-140 — Org B cannot read org A project

- **Phase:** Organization isolation
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** Org B cannot read org A project
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found
- **Actual response:**
```text
200 OK
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 404, got 200. Assertion: expected JSON object, got null Related bug(s): BUG-02.

### TC-141 — Org B cannot update org A project

- **Phase:** Organization isolation
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Org B cannot update org A project
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
Content-Type: application/json
```
- **Request body:**
```json
{"name":"Hacked by org B"}
```
- **Expected response:** 404 Not Found
- **Actual response:**
```text
200 OK
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 404, got 200. Assertion: expected JSON object, got null Related bug(s): BUG-02.

### TC-142 — Org B cannot delete org A project

- **Phase:** Organization isolation
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Org B cannot delete org A project
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Project not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Project not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-143 — Org B cannot list tasks in org A project

- **Phase:** Organization isolation
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Org B cannot list tasks in org A project
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Project not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Project not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-144 — Org B cannot create a task in org A project

- **Phase:** Organization isolation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Org B cannot create a task in org A project
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Cross-org task"}
```
- **Expected response:** 404 Not Found with "Project not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Project not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-145 — Org B cannot read org A task

- **Phase:** Organization isolation
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** Org B cannot read org A task
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Task not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-146 — Org B cannot update org A task

- **Phase:** Organization isolation
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Org B cannot update org A task
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Cross-org title"}
```
- **Expected response:** 404 Not Found with "Task not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-147 — Org B cannot delete org A task

- **Phase:** Organization isolation
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Org B cannot delete org A task
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Task not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-148 — Org A cannot read org B project

- **Phase:** Organization isolation
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** Org A cannot read org B project
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/2da67097-cd79-449a-8379-efe9838bc43f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found
- **Actual response:**
```text
200 OK
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 404, got 200. Assertion: expected JSON object, got null Related bug(s): BUG-02.

### TC-149 — Org B can create a task in its own project

- **Phase:** Organization isolation
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Org B can create a task in its own project
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/2da67097-cd79-449a-8379-efe9838bc43f/tasks`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Org B own task"}
```
- **Expected response:** 201 with key B-1
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "431ce542-0e2b-46d9-987c-7361043186c6",
  "projectId": "2da67097-cd79-449a-8379-efe9838bc43f",
  "number": 1,
  "title": "Org B own task",
  "description": null,
  "status": "TODO",
  "priority": "MEDIUM",
  "assigneeId": null,
  "dueDate": null,
  "createdAt": "2026-11-24T12:32:27.205Z",
  "updatedAt": "2026-11-24T12:32:27.205Z",
  "key": "QABLSQ4PNZ-1"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-150 — Archive a project

- **Phase:** Archived project
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Archive a project
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"ARCHIVED"}
```
- **Expected response:** 200 with status ARCHIVED
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "key": "QAWLSQ4PNZ",
  "name": "QA Workflow mwuoczls-q4pnz",
  "description": "Workflow project",
  "status": "ARCHIVED",
  "createdAt": "2026-11-24T12:32:27.074Z",
  "updatedAt": "2026-11-24T12:32:27.206Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-151 — Archived project appears in ARCHIVED filter

- **Phase:** Archived project
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Archived project appears in ARCHIVED filter
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects?status=ARCHIVED`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array containing the archived project
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "key": "QAWLSQ4PNZ",
    "name": "QA Workflow mwuoczls-q4pnz",
    "description": "Workflow project",
    "status": "ARCHIVED",
    "createdAt": "2026-11-24T12:32:27.074Z",
    "updatedAt": "2026-11-24T12:32:27.206Z"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-152 — Archived project is excluded from ACTIVE filter

- **Phase:** Archived project
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Archived project is excluded from ACTIVE filter
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects?status=ACTIVE`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array without the archived project
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "08c3be3d-88f3-4e64-bde6-bb2d7b04b71c",
    "description": null,
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.096Z",
    "updatedAt": "2026-11-24T12:32:27.096Z"
  },
  {
    "id": "055fdf87-5914-4bf8-849a-6f22acfa47cf",
    "key": "QAALSQ4PNZD",
    "name": "Bad description",
    "description": 123,
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.094Z",
    "updatedAt": "2026-11-24T12:32:27.094Z"
  },
  {
    "id": "fac17340-00d9-4a7f-b567-26b26b726317",
    "key": "QAALSQ4PNZR",
    "name": "Read-only field test",
    "description": null,
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.093Z",
    "updatedAt": "2026-11-24T12:32:27.093Z"
  },
  {
    "id": "a0f07032-1d44-4ebe-8dd2-15083451cfeb",
    "key": "QAALSQ4PNZN",
    "description": null,
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.091Z",
    "updatedAt": "2026-11-24T12:32:27.091Z"
  },
  {
    "id": "c116051f-79c5-4bef-abf3-6ae36ad1185e",
    "description": null,
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.089Z",
    "updatedAt": "2026-11-24T12:32:27.089Z"
  },
  {
    "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20",
    "key": "QAALSQ4PNZ",
    "name": "QA Project A restored mwuoczls-q4pnz",
    "description": "Primary QA project",
    "status": "ACTIVE",
    "createdAt": "2026-11-24T12:32:27.070Z",
    "updatedAt": "2026-11-24T12:32:27.114Z"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-153 — Creating a task in an archived project is blocked

- **Phase:** Archived project
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Creating a task in an archived project is blocked
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Should not be created"}
```
- **Expected response:** 409 Conflict with "Cannot create tasks in an archived project"
- **Actual response:**
```text
409 Conflict
Content-Type: application/json; charset=utf-8
{
  "message": "Cannot create tasks in an archived project",
  "error": "Conflict",
  "statusCode": 409
}
```
- **HTTP status code:** 409 Conflict
- **Result:** PASS

### TC-154 — Updating a task in an archived project is blocked

- **Phase:** Archived project
- **Endpoint:** `PATCH /api/v1/tasks/:taskId`
- **Scenario:** Updating a task in an archived project is blocked
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Should not be updated"}
```
- **Expected response:** 409 Conflict with "Cannot modify tasks in an archived project"
- **Actual response:**
```text
409 Conflict
Content-Type: application/json; charset=utf-8
{
  "message": "Cannot modify tasks in an archived project",
  "error": "Conflict",
  "statusCode": 409
}
```
- **HTTP status code:** 409 Conflict
- **Result:** PASS

### TC-155 — Deleting a task in an archived project is blocked

- **Phase:** Archived project
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Deleting a task in an archived project is blocked
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 409 Conflict with "Cannot delete tasks in an archived project"
- **Actual response:**
```text
409 Conflict
Content-Type: application/json; charset=utf-8
{
  "message": "Cannot delete tasks in an archived project",
  "error": "Conflict",
  "statusCode": 409
}
```
- **HTTP status code:** 409 Conflict
- **Result:** PASS

### TC-156 — Reading a task in an archived project is still allowed

- **Phase:** Archived project
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** Reading a task in an archived project is still allowed
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with the task
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 1,
  "title": "Minimal task renamed",
  "createdAt": "2026-11-24T12:32:27.117Z",
  "updatedAt": "2026-11-24T12:32:27.153Z",
  "key": "QAWLSQ4PNZ-1"
}
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Assertion: missing response keys: description, status, priority, assigneeId, dueDate Related bug(s): BUG-08.

### TC-157 — Listing tasks in an archived project is still allowed

- **Phase:** Archived project
- **Endpoint:** `GET /api/v1/projects/:projectId/tasks`
- **Scenario:** Listing tasks in an archived project is still allowed
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 array of existing tasks
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[
  {
    "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 4,
    "status": "DONE",
    "createdAt": "2026-11-24T12:32:27.121Z",
    "updatedAt": "2026-11-24T12:32:27.184Z",
    "key": "QAWLSQ4PNZ-4"
  },
  {
    "id": "a830f772-5848-4623-9d34-538edb4c7f21",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 3,
    "title": "Low priority task",
    "description": null,
    "status": "TODO",
    "priority": "LOW",
    "assigneeId": "qa-user-b-mwuoczls-q4pnz",
    "dueDate": null,
    "createdAt": "2026-11-24T12:32:27.120Z",
    "updatedAt": "2026-11-24T12:32:27.120Z",
    "key": "QAWLSQ4PNZ-3"
  },
  {
    "id": "bd7abfca-86ae-472c-889c-faefb2f07a6a",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 2,
    "priority": "URGENT",
    "assigneeId": "qa-user-b-mwuoczls-q4pnz",
    "dueDate": "2027-01-15",
    "createdAt": "2026-11-24T12:32:27.118Z",
    "updatedAt": "2026-11-24T12:32:27.155Z",
    "key": "QAWLSQ4PNZ-2"
  },
  {
    "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f",
    "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
    "number": 1,
    "title": "Minimal task renamed",
    "createdAt": "2026-11-24T12:32:27.117Z",
    "updatedAt": "2026-11-24T12:32:27.153Z",
    "key": "QAWLSQ4PNZ-1"
  }
]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-158 — Restore project to ACTIVE

- **Phase:** Archived project
- **Endpoint:** `PATCH /api/v1/projects/:id`
- **Scenario:** Restore project to ACTIVE
- **Actual request:** `PATCH http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"status":"ACTIVE"}
```
- **Expected response:** 200 with status ACTIVE
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
{
  "id": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "key": "QAWLSQ4PNZ",
  "name": "QA Workflow mwuoczls-q4pnz",
  "description": "Workflow project",
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.074Z",
  "updatedAt": "2026-11-24T12:32:27.218Z"
}
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-159 — Task creation works again after restoring the project

- **Phase:** Archived project
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Task creation works again after restoring the project
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Created after restore"}
```
- **Expected response:** 201 with key W-6
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "f1ac1e69-6ff4-4feb-b0cc-e94f35fa6af5",
  "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263",
  "number": 6,
  "title": "Created after restore",
  "description": null,
  "status": "TODO",
  "priority": "MEDIUM",
  "assigneeId": null,
  "dueDate": null,
  "createdAt": "2026-11-24T12:32:27.220Z",
  "updatedAt": "2026-11-24T12:32:27.220Z",
  "key": "QAWLSQ4PNZ-6"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-160 — Remove the post-restore task

- **Phase:** Archived project
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Remove the post-restore task
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/f1ac1e69-6ff4-4feb-b0cc-e94f35fa6af5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 No Content
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-161 — Create a project for cascade-deletion testing

- **Phase:** Cascade deletion
- **Endpoint:** `POST /api/v1/projects`
- **Scenario:** Create a project for cascade-deletion testing
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"key":"QACLSQ4PNZ","name":"QA Cascade mwuoczls-q4pnz"}
```
- **Expected response:** 201 with public fields
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "e1842121-5f3d-440a-9bd4-db71e232103a",
  "key": "QACLSQ4PNZ",
  "name": "QA Cascade mwuoczls-q4pnz",
  "description": null,
  "status": "ACTIVE",
  "createdAt": "2026-11-24T12:32:27.221Z",
  "updatedAt": "2026-11-24T12:32:27.221Z"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-162 — Create first task in cascade project

- **Phase:** Cascade deletion
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create first task in cascade project
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/e1842121-5f3d-440a-9bd4-db71e232103a/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Cascade task 1"}
```
- **Expected response:** 201 with key C-1
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "51a836f8-d90a-482e-8940-5f3bff83fb1e",
  "projectId": "e1842121-5f3d-440a-9bd4-db71e232103a",
  "number": 1,
  "title": "Cascade task 1",
  "description": null,
  "status": "TODO",
  "priority": "MEDIUM",
  "assigneeId": null,
  "dueDate": null,
  "createdAt": "2026-11-24T12:32:27.222Z",
  "updatedAt": "2026-11-24T12:32:27.222Z",
  "key": "QACLSQ4PNZ-1"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-163 — Create second task in cascade project

- **Phase:** Cascade deletion
- **Endpoint:** `POST /api/v1/projects/:projectId/tasks`
- **Scenario:** Create second task in cascade project
- **Actual request:** `POST http://127.0.0.1:3100/api/v1/projects/e1842121-5f3d-440a-9bd4-db71e232103a/tasks`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
Content-Type: application/json
```
- **Request body:**
```json
{"title":"Cascade task 2"}
```
- **Expected response:** 201 with key C-2
- **Actual response:**
```text
201 Created
Content-Type: application/json; charset=utf-8
{
  "id": "36ca5373-3f88-4bc9-bab3-c3cfcce6f24f",
  "projectId": "e1842121-5f3d-440a-9bd4-db71e232103a",
  "number": 2,
  "title": "Cascade task 2",
  "description": null,
  "status": "TODO",
  "priority": "MEDIUM",
  "assigneeId": null,
  "dueDate": null,
  "createdAt": "2026-11-24T12:32:27.223Z",
  "updatedAt": "2026-11-24T12:32:27.223Z",
  "key": "QACLSQ4PNZ-2"
}
```
- **HTTP status code:** 201 Created
- **Result:** PASS

### TC-164 — Delete the project with two tasks

- **Phase:** Cascade deletion
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Delete the project with two tasks
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/e1842121-5f3d-440a-9bd4-db71e232103a`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 No Content
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-165 — Retrieve the deleted project

- **Phase:** Cascade deletion
- **Endpoint:** `GET /api/v1/projects/:id`
- **Scenario:** Retrieve the deleted project
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects/e1842121-5f3d-440a-9bd4-db71e232103a`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Project not found"
- **Actual response:**
```text
200 OK
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 200 OK
- **Result:** FAIL
- **Explanation:** Expected HTTP 404, got 200. Assertion: expected JSON object, got null Related bug(s): BUG-02.

### TC-166 — Verify first task was cascade-deleted

- **Phase:** Cascade deletion
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** Verify first task was cascade-deleted
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/51a836f8-d90a-482e-8940-5f3bff83fb1e`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Task not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-167 — Verify second task was cascade-deleted

- **Phase:** Cascade deletion
- **Endpoint:** `GET /api/v1/tasks/:taskId`
- **Scenario:** Verify second task was cascade-deleted
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/tasks/36ca5373-3f88-4bc9-bab3-c3cfcce6f24f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Task not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-168 — Delete the already-deleted project again

- **Phase:** Cascade deletion
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Delete the already-deleted project again
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/e1842121-5f3d-440a-9bd4-db71e232103a`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 404 Not Found with "Project not found"
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Project not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-169 — Cleanup task 380d9e49-728d-4d4a-87fa-787e6720213d

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Cleanup task 380d9e49-728d-4d4a-87fa-787e6720213d
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/380d9e49-728d-4d4a-87fa-787e6720213d`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-170 — Cleanup task 9d8628bd-fc16-4ee2-98ac-9bbad929420f

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Cleanup task 9d8628bd-fc16-4ee2-98ac-9bbad929420f
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-171 — Cleanup task bd7abfca-86ae-472c-889c-faefb2f07a6a

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Cleanup task bd7abfca-86ae-472c-889c-faefb2f07a6a
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/bd7abfca-86ae-472c-889c-faefb2f07a6a`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-172 — Cleanup task a830f772-5848-4623-9d34-538edb4c7f21

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Cleanup task a830f772-5848-4623-9d34-538edb4c7f21
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/a830f772-5848-4623-9d34-538edb4c7f21`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-173 — Cleanup task 75c7172b-6fff-42bb-bbd1-482fb18cf9a5

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Cleanup task 75c7172b-6fff-42bb-bbd1-482fb18cf9a5
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-174 — Cleanup task 5bf7007d-cb21-45b3-a8e1-b13ffb29aeb9

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Cleanup task 5bf7007d-cb21-45b3-a8e1-b13ffb29aeb9
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/5bf7007d-cb21-45b3-a8e1-b13ffb29aeb9`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-175 — Cleanup task 431ce542-0e2b-46d9-987c-7361043186c6

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Cleanup task 431ce542-0e2b-46d9-987c-7361043186c6
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/431ce542-0e2b-46d9-987c-7361043186c6`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-176 — Cleanup task f1ac1e69-6ff4-4feb-b0cc-e94f35fa6af5

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Cleanup task f1ac1e69-6ff4-4feb-b0cc-e94f35fa6af5
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/f1ac1e69-6ff4-4feb-b0cc-e94f35fa6af5`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-177 — Cleanup task 51a836f8-d90a-482e-8940-5f3bff83fb1e

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Cleanup task 51a836f8-d90a-482e-8940-5f3bff83fb1e
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/51a836f8-d90a-482e-8940-5f3bff83fb1e`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-178 — Cleanup task 36ca5373-3f88-4bc9-bab3-c3cfcce6f24f

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/tasks/:taskId`
- **Scenario:** Cleanup task 36ca5373-3f88-4bc9-bab3-c3cfcce6f24f
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/tasks/36ca5373-3f88-4bc9-bab3-c3cfcce6f24f`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Task not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-179 — Cleanup project 6c486ed2-74d7-43d0-bc4e-881cc0c3be20

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Cleanup project 6c486ed2-74d7-43d0-bc4e-881cc0c3be20
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-180 — Cleanup project 2da67097-cd79-449a-8379-efe9838bc43f

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Cleanup project 2da67097-cd79-449a-8379-efe9838bc43f
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/2da67097-cd79-449a-8379-efe9838bc43f`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-181 — Cleanup project beb4e9af-a663-49e7-bc77-7c20a574f263

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Cleanup project beb4e9af-a663-49e7-bc77-7c20a574f263
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-182 — Cleanup project c116051f-79c5-4bef-abf3-6ae36ad1185e

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Cleanup project c116051f-79c5-4bef-abf3-6ae36ad1185e
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/c116051f-79c5-4bef-abf3-6ae36ad1185e`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-183 — Cleanup project a0f07032-1d44-4ebe-8dd2-15083451cfeb

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Cleanup project a0f07032-1d44-4ebe-8dd2-15083451cfeb
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/a0f07032-1d44-4ebe-8dd2-15083451cfeb`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-184 — Cleanup project fac17340-00d9-4a7f-b567-26b26b726317

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Cleanup project fac17340-00d9-4a7f-b567-26b26b726317
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/fac17340-00d9-4a7f-b567-26b26b726317`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-185 — Cleanup project 055fdf87-5914-4bf8-849a-6f22acfa47cf

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Cleanup project 055fdf87-5914-4bf8-849a-6f22acfa47cf
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/055fdf87-5914-4bf8-849a-6f22acfa47cf`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-186 — Cleanup project 08c3be3d-88f3-4e64-bde6-bb2d7b04b71c

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Cleanup project 08c3be3d-88f3-4e64-bde6-bb2d7b04b71c
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/08c3be3d-88f3-4e64-bde6-bb2d7b04b71c`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
204 No Content
Content-Type: (none)
(empty body)
```
- **HTTP status code:** 204 No Content
- **Result:** PASS

### TC-187 — Cleanup project e1842121-5f3d-440a-9bd4-db71e232103a

- **Phase:** Cleanup
- **Endpoint:** `DELETE /api/v1/projects/:id`
- **Scenario:** Cleanup project e1842121-5f3d-440a-9bd4-db71e232103a
- **Actual request:** `DELETE http://127.0.0.1:3100/api/v1/projects/e1842121-5f3d-440a-9bd4-db71e232103a`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 204 if still present, 404 if already deleted
- **Actual response:**
```text
404 Not Found
Content-Type: application/json; charset=utf-8
{
  "message": "Project not found",
  "error": "Not Found",
  "statusCode": 404
}
```
- **HTTP status code:** 404 Not Found
- **Result:** PASS

### TC-188 — Verify no QA projects remain in org A

- **Phase:** Cleanup
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Verify no QA projects remain in org A
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: 8b53b0f6-6060-40fe-9b56-5701e61a2667
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with an empty array
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

### TC-189 — Verify no QA projects remain in org B

- **Phase:** Cleanup
- **Endpoint:** `GET /api/v1/projects`
- **Scenario:** Verify no QA projects remain in org B
- **Actual request:** `GET http://127.0.0.1:3100/api/v1/projects`
- **Request headers:**
```text
X-Org-Id: d709fbb6-65df-4287-8813-f3fbdb5d80bf
```
- **Request body:**
```json
(none)
```
- **Expected response:** 200 with an empty array
- **Actual response:**
```text
200 OK
Content-Type: application/json; charset=utf-8
[]
```
- **HTTP status code:** 200 OK
- **Result:** PASS

## Bugs discovered

### BUG-01 — Project create/update endpoints have no runtime request validation

- **Severity:** High
- **Evidence cases:** TC-054 (project-create-empty), TC-055 (project-create-missing-name), TC-056 (project-create-readonly-fields), TC-057 (project-create-description-number), TC-058 (project-create-array), TC-070 (project-patch-name-number), TC-072 (project-patch-readonly-key), TC-073 (project-patch-unknown-field)
- **Files:** `src/main.ts`, `src/projects/projects.controller.ts`, `src/projects/projects.service.ts`
- **Explanation:** No global ValidationPipe is registered and the project DTOs are TypeScript-only interfaces, so they vanish at runtime. POST /projects accepts an empty body, missing key/name, arrays, wrong field types, unknown fields and read-only fields. PATCH /projects/:id accepts read-only fields and wrong types, and the repository stores them verbatim.
- **Observed responses:**
  - TC-054: `POST http://127.0.0.1:3100/api/v1/projects` → HTTP 201; { "id": "c116051f-79c5-4bef-abf3-6ae36ad1185e", "description": null, "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.089Z", "updatedAt": "2026-11-24T12:32:27.089Z" }
  - TC-055: `POST http://127.0.0.1:3100/api/v1/projects` → HTTP 201; { "id": "a0f07032-1d44-4ebe-8dd2-15083451cfeb", "key": "QAALSQ4PNZN", "description": null, "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.091Z", "updatedAt": "2026-11-24T12:32:27.091Z" }
  - TC-056: `POST http://127.0.0.1:3100/api/v1/projects` → HTTP 201; { "id": "fac17340-00d9-4a7f-b567-26b26b726317", "key": "QAALSQ4PNZR", "name": "Read-only field test", "description": null, "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.093Z", "updatedAt": "2026-11-24T12:32:27.093Z" }
  - TC-057: `POST http://127.0.0.1:3100/api/v1/projects` → HTTP 201; { "id": "055fdf87-5914-4bf8-849a-6f22acfa47cf", "key": "QAALSQ4PNZD", "name": "Bad description", "description": 123, "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.094Z", "updatedAt": "2026-11-24T12:32:27.094Z" }
  - TC-058: `POST http://127.0.0.1:3100/api/v1/projects` → HTTP 201; { "id": "08c3be3d-88f3-4e64-bde6-bb2d7b04b71c", "description": null, "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.096Z", "updatedAt": "2026-11-24T12:32:27.096Z" }
  - TC-070: `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20` → HTTP 200; { "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20", "key": "QAALSQ4PNZ", "name": 123, "description": "Primary QA project", "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.070Z", "updatedAt": "2026-11-24T12:32:27.110Z" }
  - TC-072: `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20` → HTTP 200; { "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20", "key": "QAALSQ4PNZ", "name": "QA Project A restored mwuoczls-q4pnz", "description": "Primary QA project", "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.070Z", "updatedAt": "2026-11-24T12:32:27.113Z" }
  - TC-073: `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20` → HTTP 200; { "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20", "key": "QAALSQ4PNZ", "name": "QA Project A restored mwuoczls-q4pnz", "description": "Primary QA project", "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.070Z", "updatedAt": "2026-11-24T12:32:27.114Z" }

### BUG-02 — Missing projects return HTTP 200 with an empty body instead of 404

- **Severity:** High
- **Evidence cases:** TC-053 (project-get-missing), TC-074 (project-patch-missing), TC-140 (isolation-orgb-get-project-a), TC-141 (isolation-orgb-patch-project-a), TC-148 (isolation-orga-get-project-b), TC-165 (cascade-get-deleted-project)
- **Files:** `src/projects/projects.controller.ts`, `src/projects/projects.service.ts`
- **Explanation:** fetchOne() and updateProject() return null for a missing/foreign project and the controller returns that value directly. Nest serialises null as 200 with Content-Length: 0. Task endpoints correctly throw NotFoundException, so this is inconsistent.
- **Observed responses:**
  - TC-053: `GET http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f` → HTTP 200; (empty body)
  - TC-074: `PATCH http://127.0.0.1:3100/api/v1/projects/1abcf525-b2da-4ce2-8f05-c00f7679a16f` → HTTP 200; (empty body)
  - TC-140: `GET http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20` → HTTP 200; (empty body)
  - TC-141: `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20` → HTTP 200; (empty body)
  - TC-148: `GET http://127.0.0.1:3100/api/v1/projects/2da67097-cd79-449a-8379-efe9838bc43f` → HTTP 200; (empty body)
  - TC-165: `GET http://127.0.0.1:3100/api/v1/projects/e1842121-5f3d-440a-9bd4-db71e232103a` → HTTP 200; (empty body)

### BUG-03 — PATCH /projects/:id allows mass assignment of internal nextTaskNumber

- **Severity:** High
- **Evidence cases:** TC-065 (project-patch-next-task-number), TC-066 (project-task-number-tampered)
- **Files:** `src/projects/projects.types.ts`, `src/projects/projects.controller.ts`, `src/projects/repositories/projects.repository.memory.ts`
- **Explanation:** ProjectPatch publicly includes nextTaskNumber and the repository applies any supplied value. A client can set the task counter (e.g. to 50), and the next task key becomes KEY-50 instead of continuing the sequence. Internal server-managed state must not be client-writable.
- **Observed responses:**
  - TC-065: `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20` → HTTP 200; { "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20", "key": "QAALSQ4PNZ", "name": "QA Project A renamed mwuoczls-q4pnz", "description": "Primary QA project", "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.070Z", "updatedAt": "2026-11-24T12:32:27.104Z" }
  - TC-066: `POST http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20/tasks` → HTTP 201; { "id": "380d9e49-728d-4d4a-87fa-787e6720213d", "projectId": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20", "number": 50, "title": "Task number probe", "description": null, "status": "TODO", "priority": "MEDIUM", "assigneeId": null, "dueDate": null, "createdAt": "2026-11-24T12:32:27.105Z", "updatedAt": "20

### BUG-04 — Invalid and empty project PATCH requests mutate updatedAt

- **Severity:** Medium
- **Evidence cases:** TC-062 (project-patch-empty), TC-064 (project-patch-no-op)
- **Files:** `src/projects/repositories/projects.repository.memory.ts`
- **Explanation:** update() unconditionally writes a fresh updatedAt even when the patch is empty or all values are unchanged. Task PATCH correctly implements a no-op check and preserves updatedAt.
- **Observed responses:**
  - TC-062: `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20` → HTTP 200; { "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20", "key": "QAALSQ4PNZ", "name": "QA Project A renamed mwuoczls-q4pnz", "description": "Primary QA project", "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.070Z", "updatedAt": "2026-11-24T12:32:27.100Z" }
  - TC-064: `PATCH http://127.0.0.1:3100/api/v1/projects/6c486ed2-74d7-43d0-bc4e-881cc0c3be20` → HTTP 200; { "id": "6c486ed2-74d7-43d0-bc4e-881cc0c3be20", "key": "QAALSQ4PNZ", "name": "QA Project A renamed mwuoczls-q4pnz", "description": "Primary QA project", "status": "ACTIVE", "createdAt": "2026-11-24T12:32:27.070Z", "updatedAt": "2026-11-24T12:32:27.103Z" }

### BUG-05 — Invalid project status filter is silently treated as "no matches"

- **Severity:** Medium
- **Evidence cases:** TC-049 (project-filter-invalid-status), TC-050 (project-filter-lowercase-status)
- **Files:** `src/projects/projects.controller.ts`, `src/projects/projects.service.ts`
- **Explanation:** The status query parameter is passed straight to the repository as a ProjectStatus with no validation. An invalid value such as INVALID or active returns 200 [] instead of 400. Task filters are validated.
- **Observed responses:**
  - TC-049: `GET http://127.0.0.1:3100/api/v1/projects?status=INVALID` → HTTP 200; []
  - TC-050: `GET http://127.0.0.1:3100/api/v1/projects?status=active` → HTTP 200; []

### BUG-06 — Unknown task query filters are silently ignored

- **Severity:** Low
- **Evidence cases:** TC-101 (task-filter-unknown-param)
- **Files:** `src/tasks/tasks.controller.ts`, `src/tasks/tasks.service.ts`
- **Explanation:** TasksService.validateFilters() rejects unknown fields, but the controller only forwards status, priority and assigneeId via individual @Query decorators. An unknown query parameter never reaches the service, so ?foo=bar returns 200 instead of 400. The service-level validation is unreachable over HTTP.
- **Observed responses:**
  - TC-101: `GET http://127.0.0.1:3100/api/v1/projects/beb4e9af-a663-49e7-bc77-7c20a574f263/tasks?foo=bar` → HTTP 200; [ { "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5", "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263", "number": 4, "title": "Status transition task", "description": null, "status": "TODO", "priority": "URGENT", "assigneeId": "qa-user-a-mwuoczls-q4pnz", "dueDate": null, "createdAt": "2026-11-24T12:3

### BUG-07 — Swagger documentation omits request bodies and mislabels optional query params

- **Severity:** Low
- **Evidence cases:** TC-005 (docs-json)
- **Files:** `src/main.ts`, `src/projects/projects.controller.ts`, `src/tasks/tasks.controller.ts`
- **Explanation:** /docs-json contains no requestBody schemas for POST/PATCH operations. Query parameters derived from @Query("name") are marked required: true even though they are optional in code. This is a documentation defect, not a runtime failure.
- **Observed responses:**
  - TC-005: `GET http://127.0.0.1:3100/docs-json` → HTTP 200; { "openapi": "3.0.0", "paths": { "/api/v1": { "get": { "operationId": "AppController_getHello_v1", "parameters": [], "responses": { "200": { "description": "" } }, "tags": [ "App" ] } }, "/api/v1/test": { "get": { "operationId": "AppController_test_v1", "parameters": [], "responses": { "200": { "des

### BUG-08 — Partial task PATCH overwrites unspecified fields with undefined

- **Severity:** High
- **Evidence cases:** TC-106 (task-patch-title-trim), TC-116 (task-get-before-noop-patch), TC-118 (transition-todo-inprogress), TC-156 (archive-get-task-allowed)
- **Files:** `src/tasks/tasks.service.ts`, `src/tasks/Repositories/tasks.repository.memory.ts`
- **Explanation:** TasksService.updateTask() builds a patch containing every optional key, using undefined for fields the client did not send. InMemoryTasksRepository.update() spreads that patch over the stored task, so undefined replaces existing values and JSON.stringify omits them. A PATCH that only changes title silently wipes status, priority, description, assigneeId and dueDate.
- **Observed responses:**
  - TC-106: `PATCH http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f` → HTTP 200; { "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f", "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263", "number": 1, "title": "Minimal task renamed", "createdAt": "2026-11-24T12:32:27.117Z", "updatedAt": "2026-11-24T12:32:27.153Z", "key": "QAWLSQ4PNZ-1" }
  - TC-116: `GET http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f` → HTTP 200; { "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f", "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263", "number": 1, "title": "Minimal task renamed", "createdAt": "2026-11-24T12:32:27.117Z", "updatedAt": "2026-11-24T12:32:27.153Z", "key": "QAWLSQ4PNZ-1" }
  - TC-118: `PATCH http://127.0.0.1:3100/api/v1/tasks/75c7172b-6fff-42bb-bbd1-482fb18cf9a5` → HTTP 200; { "id": "75c7172b-6fff-42bb-bbd1-482fb18cf9a5", "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263", "number": 4, "status": "IN_PROGRESS", "createdAt": "2026-11-24T12:32:27.121Z", "updatedAt": "2026-11-24T12:32:27.168Z", "key": "QAWLSQ4PNZ-4" }
  - TC-156: `GET http://127.0.0.1:3100/api/v1/tasks/9d8628bd-fc16-4ee2-98ac-9bbad929420f` → HTTP 200; { "id": "9d8628bd-fc16-4ee2-98ac-9bbad929420f", "projectId": "beb4e9af-a663-49e7-bc77-7c20a574f263", "number": 1, "title": "Minimal task renamed", "createdAt": "2026-11-24T12:32:27.117Z", "updatedAt": "2026-11-24T12:32:27.153Z", "key": "QAWLSQ4PNZ-1" }

## Untested scenarios and limitations

- Pagination: no limit/offset/page parameters are implemented. Requests with limit/offset were sent and observed to be ignored; there is no contract to assert beyond that.
- Authentication/authorization: no auth mechanism exists. Every request was sent without an Authorization header and succeeded; protected-role flows cannot be exercised.
- Persistence across restarts: repositories are in-memory only, so no database-backed durability, transactions or concurrent-write behaviour can be tested.
- Duplicate project key uniqueness: no uniqueness rule is documented or enforced; no pass/fail expectation can be defined.
- Due-date semantic validation: only the JSON type is checked. ISO date-format validation is not implemented and was not asserted.
- Concurrency/race conditions on task numbering: all requests were sent sequentially.

## Notes on expectations

- Expectations were derived from the declared TypeScript types, the OrgId decorator, ParseUUIDPipe configuration, TasksService business rules, REST conventions and the startup route table.
- A case is marked PASS only after an actual HTTP response was received and asserted. FAIL means the observed status and/or body did not match the documented expectation.
- Setup, probing, negative and cleanup requests are all included in the case totals.
