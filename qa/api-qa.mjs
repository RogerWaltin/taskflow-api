/* global process, fetch */
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3100';
const OUT_DIR = path.resolve('qa');
mkdirSync(OUT_DIR, { recursive: true });

const RUN = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const SUFFIX = RUN.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(-7);
const ORG_A = randomUUID();
const ORG_B = randomUUID();
const ORG_V1 = '11111111-1111-1111-8111-111111111111';
const MISSING_PROJECT_ID = randomUUID();
const MISSING_TASK_ID = randomUUID();
const KEY_A = `QAA${SUFFIX}`;
const KEY_W = `QAW${SUFFIX}`;
const KEY_B = `QAB${SUFFIX}`;
const KEY_C = `QAC${SUFFIX}`;
const USER_A = `qa-user-a-${RUN}`;
const USER_B = `qa-user-b-${RUN}`;

const results = [];
const endpoints = new Map();
const createdProjects = [];
const createdTasks = [];
const ctx = { RUN, ORG_A, ORG_B, USER_A, USER_B, KEY_A, KEY_W, KEY_B, KEY_C };
let fatal = null;

const BUGS = [
  {
    id: 'BUG-01',
    title: 'Project create/update endpoints have no runtime request validation',
    severity: 'High',
    files: [
      'src/main.ts',
      'src/projects/projects.controller.ts',
      'src/projects/projects.service.ts',
    ],
    explanation:
      'No global ValidationPipe is registered and the project DTOs are TypeScript-only interfaces, so they vanish at runtime. POST /projects accepts an empty body, missing key/name, arrays, wrong field types, unknown fields and read-only fields. PATCH /projects/:id accepts read-only fields and wrong types, and the repository stores them verbatim.',
    evidenceKeys: [
      'project-create-empty',
      'project-create-missing-name',
      'project-create-readonly-fields',
      'project-create-description-number',
      'project-create-array',
      'project-patch-name-number',
      'project-patch-readonly-key',
      'project-patch-unknown-field',
    ],
  },
  {
    id: 'BUG-02',
    title: 'Missing projects return HTTP 200 with an empty body instead of 404',
    severity: 'High',
    files: [
      'src/projects/projects.controller.ts',
      'src/projects/projects.service.ts',
    ],
    explanation:
      'fetchOne() and updateProject() return null for a missing/foreign project and the controller returns that value directly. Nest serialises null as 200 with Content-Length: 0. Task endpoints correctly throw NotFoundException, so this is inconsistent.',
    evidenceKeys: [
      'project-get-missing',
      'project-patch-missing',
      'isolation-orgb-get-project-a',
      'isolation-orgb-patch-project-a',
      'isolation-orga-get-project-b',
      'cascade-get-deleted-project',
    ],
  },
  {
    id: 'BUG-03',
    title: 'PATCH /projects/:id allows mass assignment of internal nextTaskNumber',
    severity: 'High',
    files: [
      'src/projects/projects.types.ts',
      'src/projects/projects.controller.ts',
      'src/projects/repositories/projects.repository.memory.ts',
    ],
    explanation:
      'ProjectPatch publicly includes nextTaskNumber and the repository applies any supplied value. A client can set the task counter (e.g. to 50), and the next task key becomes KEY-50 instead of continuing the sequence. Internal server-managed state must not be client-writable.',
    evidenceKeys: ['project-patch-next-task-number', 'project-task-number-tampered'],
  },
  {
    id: 'BUG-04',
    title: 'Invalid and empty project PATCH requests mutate updatedAt',
    severity: 'Medium',
    files: ['src/projects/repositories/projects.repository.memory.ts'],
    explanation:
      'update() unconditionally writes a fresh updatedAt even when the patch is empty or all values are unchanged. Task PATCH correctly implements a no-op check and preserves updatedAt.',
    evidenceKeys: ['project-patch-empty', 'project-patch-no-op'],
  },
  {
    id: 'BUG-05',
    title: 'Invalid project status filter is silently treated as "no matches"',
    severity: 'Medium',
    files: [
      'src/projects/projects.controller.ts',
      'src/projects/projects.service.ts',
    ],
    explanation:
      'The status query parameter is passed straight to the repository as a ProjectStatus with no validation. An invalid value such as INVALID or active returns 200 [] instead of 400. Task filters are validated.',
    evidenceKeys: ['project-filter-invalid-status', 'project-filter-lowercase-status'],
  },
  {
    id: 'BUG-06',
    title: 'Unknown task query filters are silently ignored',
    severity: 'Low',
    files: ['src/tasks/tasks.controller.ts', 'src/tasks/tasks.service.ts'],
    explanation:
      'TasksService.validateFilters() rejects unknown fields, but the controller only forwards status, priority and assigneeId via individual @Query decorators. An unknown query parameter never reaches the service, so ?foo=bar returns 200 instead of 400. The service-level validation is unreachable over HTTP.',
    evidenceKeys: ['task-filter-unknown-param'],
  },
  {
    id: 'BUG-07',
    title: 'Swagger documentation omits request bodies and mislabels optional query params',
    severity: 'Low',
    files: ['src/main.ts', 'src/projects/projects.controller.ts', 'src/tasks/tasks.controller.ts'],
    explanation:
      '/docs-json contains no requestBody schemas for POST/PATCH operations. Query parameters derived from @Query("name") are marked required: true even though they are optional in code. This is a documentation defect, not a runtime failure.',
    evidenceKeys: ['docs-json'],
  },
  {
    id: 'BUG-08',
    title: 'Partial task PATCH overwrites unspecified fields with undefined',
    severity: 'High',
    files: [
      'src/tasks/tasks.service.ts',
      'src/tasks/Repositories/tasks.repository.memory.ts',
    ],
    explanation:
      'TasksService.updateTask() builds a patch containing every optional key, using undefined for fields the client did not send. InMemoryTasksRepository.update() spreads that patch over the stored task, so undefined replaces existing values and JSON.stringify omits them. A PATCH that only changes title silently wipes status, priority, description, assigneeId and dueDate.',
    evidenceKeys: [
      'task-patch-title-trim',
      'task-get-before-noop-patch',
      'transition-todo-inprogress',
      'archive-get-task-allowed',
    ],
  },
];

const UNTESTED = [
  'Pagination: no limit/offset/page parameters are implemented. Requests with limit/offset were sent and observed to be ignored; there is no contract to assert beyond that.',
  'Authentication/authorization: no auth mechanism exists. Every request was sent without an Authorization header and succeeded; protected-role flows cannot be exercised.',
  'Persistence across restarts: repositories are in-memory only, so no database-backed durability, transactions or concurrent-write behaviour can be tested.',
  'Duplicate project key uniqueness: no uniqueness rule is documented or enforced; no pass/fail expectation can be defined.',
  'Due-date semantic validation: only the JSON type is checked. ISO date-format validation is not implemented and was not asserted.',
  'Concurrency/race conditions on task numbering: all requests were sent sequentially.',
];

function describe(value) {
  return JSON.stringify(value);
}

function all(...checks) {
  return (r, ctxValue) => {
    for (const check of checks) {
      const result = check(r, ctxValue);
      if (result !== true) return result;
    }
    return true;
  };
}

const isObject = (r) =>
  r.body && typeof r.body === 'object' && !Array.isArray(r.body)
    ? true
    : `expected JSON object, got ${describe(r.body)}`;
const isArray = (r) =>
  Array.isArray(r.body) ? true : `expected JSON array, got ${describe(r.body)}`;
const messageIs = (message) =>
  all(
    isObject,
    (r) =>
      r.body.message === message
        ? true
        : `message=${describe(r.body.message)}, expected ${describe(message)}`,
  );
const hasKeys = (...keys) => (r) => {
  const missing = keys.filter((key) => !(key in r.body));
  return missing.length ? `missing response keys: ${missing.join(', ')}` : true;
};
const hasNoKeys = (...keys) => (r) => {
  const leaked = keys.filter((key) => key in r.body);
  return leaked.length ? `unexpected response keys: ${leaked.join(', ')}` : true;
};
const fieldEquals = (dottedPath, value) => (r) => {
  const actual = dottedPath
    .split('.')
    .reduce((obj, key) => (obj == null ? undefined : obj[key]), r.body);
  return actual === value
    ? true
    : `${dottedPath}=${describe(actual)}, expected ${describe(value)}`;
};
const rawEquals = (value) => (r) =>
  r.raw === value ? true : `raw body=${describe(r.raw)}, expected ${describe(value)}`;
const rawIncludes = (needle) => (r) =>
  r.raw.includes(needle) ? true : `raw body does not contain ${describe(needle)}`;
const arrayLength = (length) =>
  all(isArray, (r) =>
    r.body.length === length
      ? true
      : `array length ${r.body.length}, expected ${length}`,
  );
const emptyArray = all(isArray, (r) =>
  r.body.length === 0 ? true : `expected empty array, got ${describe(r.body)}`,
);

const publicProjectShape = all(
  isObject,
  hasKeys(
    'id',
    'key',
    'name',
    'description',
    'status',
    'createdAt',
    'updatedAt',
  ),
  hasNoKeys('organizationId', 'nextTaskNumber'),
);
const publicTaskShape = all(
  isObject,
  hasKeys(
    'id',
    'projectId',
    'number',
    'title',
    'description',
    'status',
    'priority',
    'assigneeId',
    'dueDate',
    'createdAt',
    'updatedAt',
    'key',
  ),
  hasNoKeys('organizationId'),
);

function formatBody(raw, parsed) {
  if (raw === '') return '(empty body)';
  if (parsed !== null && typeof parsed === 'object') {
    return JSON.stringify(parsed, null, 2);
  }
  return raw;
}

function formatHeaders(headers) {
  if (!headers || Object.keys(headers).length === 0) return '(none)';
  return Object.entries(headers)
    .map(([name, value]) => `${name}: ${value}`)
    .join('\n');
}

function responseSummary(r) {
  const contentType = r.responseHeaders['content-type'] ?? '(none)';
  return `${r.status} ${r.statusText}\nContent-Type: ${contentType}\n${r.bodyPretty}`;
}

async function call(options) {
  const id = `TC-${String(results.length + 1).padStart(3, '0')}`;
  const requestHeaders = { ...(options.headers ?? {}) };
  if (options.org !== undefined) requestHeaders['X-Org-Id'] = options.org;

  let bodyText;
  if (options.body !== undefined) {
    const hasContentType = Object.keys(requestHeaders).some(
      (name) => name.toLowerCase() === 'content-type',
    );
    if (!hasContentType) requestHeaders['Content-Type'] = 'application/json';
    bodyText =
      typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);
  }

  const expectedStatuses = Array.isArray(options.status)
    ? options.status
    : [options.status];
  const startedAt = new Date().toISOString();
  let status = 0;
  let statusText = 'NETWORK ERROR';
  let raw = '';
  let parsed = null;
  let responseHeaders = {};
  let networkError = null;

  try {
    const response = await fetch(`${BASE}${options.path}`, {
      method: options.method,
      headers: requestHeaders,
      body: bodyText,
    });
    status = response.status;
    statusText = response.statusText;
    responseHeaders = Object.fromEntries(response.headers.entries());
    raw = await response.text();
    try {
      parsed = raw === '' ? null : JSON.parse(raw);
    } catch {
      parsed = null;
    }
  } catch (error) {
    networkError = String(error?.stack ?? error);
  }

  const result = {
    id,
    key: options.key ?? id,
    phase: options.phase ?? 'General',
    endpoint: options.endpoint,
    name: options.name,
    method: options.method,
    url: `${BASE}${options.path}`,
    requestHeaders,
    requestBody: bodyText ?? null,
    status,
    statusText,
    responseHeaders,
    raw,
    body: parsed,
    bodyPretty: formatBody(raw, parsed),
    expected: options.expected ?? `HTTP ${expectedStatuses.join(' or ')}`,
    expectedStatuses,
    networkError,
    startedAt,
    durationMs: Date.now() - new Date(startedAt).getTime(),
  };

  const statusOk = expectedStatuses.includes(status);
  let assertionResult = true;
  if (!networkError && options.check) {
    try {
      assertionResult = options.check(result, ctx);
    } catch (error) {
      assertionResult = `check threw: ${String(error?.stack ?? error)}`;
    }
  }
  result.pass = !networkError && statusOk && assertionResult === true;
  const detail = options.detail ? String(options.detail(result, ctx)) : '';
  result.failure = result.pass
    ? ''
    : [
        networkError ? `Network error: ${networkError}` : '',
        statusOk ? '' : `Expected HTTP ${expectedStatuses.join(' or ')}, got ${status}.`,
        assertionResult === true ? '' : `Assertion: ${assertionResult}`,
        detail,
      ]
        .filter(Boolean)
        .join(' ');
  results.push(result);

  if (!endpoints.has(options.endpoint)) {
    endpoints.set(options.endpoint, { endpoint: options.endpoint, methods: new Set() });
  }
  endpoints.get(options.endpoint).methods.add(options.method);
  return result;
}

function mustSucceed(result, label) {
  if (!result.pass) {
    throw new Error(`${label} failed: ${result.failure} (${result.bodyPretty})`);
  }
  return result.body;
}

function trackProject(result, org) {
  if (result.body?.id) createdProjects.push({ id: result.body.id, org });
  return result;
}

function trackTask(result, org) {
  if (result.body?.id) createdTasks.push({ id: result.body.id, org });
  return result;
}

async function missingHeaderCase(key, endpoint, method, path, body) {
  return call({
    key: `${key}-missing`,
    phase: 'Required header',
    endpoint,
    name: `${endpoint}: missing X-Org-Id header`,
    method,
    path,
    body,
    status: 400,
    expected: '400 Bad Request with "X-Org-Id header must be a UUID"',
    check: messageIs('X-Org-Id header must be a UUID'),
  });
}

async function invalidHeaderCase(key, endpoint, method, path, body) {
  return call({
    key: `${key}-invalid`,
    phase: 'Required header',
    endpoint,
    name: `${endpoint}: malformed X-Org-Id header`,
    method,
    path,
    org: 'not-a-uuid',
    body,
    status: 400,
    expected: '400 Bad Request with "X-Org-Id header must be a UUID"',
    check: messageIs('X-Org-Id header must be a UUID'),
  });
}

async function invalidUuidCase(key, endpoint, method, path, body) {
  return call({
    key,
    phase: 'UUID validation',
    endpoint,
    name: `${endpoint}: non-UUID path parameter`,
    method,
    path,
    org: ORG_A,
    body,
    status: 400,
    expected: '400 Bad Request with "Validation failed (uuid v 4 is expected)"',
    check: messageIs('Validation failed (uuid v 4 is expected)'),
  });
}

try {
// ---------------------------------------------------------------------------
// Routing, smoke and generated documentation
// ---------------------------------------------------------------------------
await call({
  key: 'routing-root',
  phase: 'Routing',
  endpoint: 'GET /api/v1',
  name: 'Application root is exposed under the global prefix and version',
  method: 'GET',
  path: '/api/v1',
  status: 200,
  expected: '200 with plain-text Hello World!',
  check: rawEquals('Hello World!'),
});
await call({
  key: 'routing-unversioned',
  phase: 'Routing',
  endpoint: 'GET /api/v1',
  name: 'Unversioned /api path is not routed',
  method: 'GET',
  path: '/api',
  status: 404,
  expected: '404 Not Found',
  check: messageIs('Cannot GET /api'),
});
await call({
  key: 'routing-test',
  phase: 'Routing',
  endpoint: 'GET /api/v1/test',
  name: 'Test endpoint returns its plain-text payload',
  method: 'GET',
  path: '/api/v1/test',
  status: 200,
  expected: '200 with plain-text "Wow test works!"',
  check: rawEquals('Wow test works!'),
});
await call({
  key: 'docs-ui',
  phase: 'Documentation',
  endpoint: 'GET /docs',
  name: 'Swagger UI is served',
  method: 'GET',
  path: '/docs',
  status: 200,
  expected: '200 HTML containing Swagger UI',
  check: all(rawIncludes('Swagger UI')),
});
await call({
  key: 'docs-json',
  phase: 'Documentation',
  endpoint: 'GET /docs-json',
  name: 'OpenAPI JSON is served with the expected title and paths',
  method: 'GET',
  path: '/docs-json',
  status: 200,
  expected: '200 JSON with info.title TaskFlow API and all API paths',
  check: all(
    isObject,
    fieldEquals('info.title', 'TaskFlow API'),
    (r) =>
      r.body.paths?.['/api/v1/projects']?.post !== undefined &&
      r.body.paths?.['/api/v1/tasks/{taskId}']?.delete !== undefined
        ? true
        : 'expected project POST and task DELETE paths in OpenAPI document',
  ),
});

// ---------------------------------------------------------------------------
// X-Org-Id header validation on every org-scoped endpoint
// ---------------------------------------------------------------------------
const headerTargets = [
  {
    key: 'h-projects-list',
    endpoint: 'GET /api/v1/projects',
    method: 'GET',
    path: '/api/v1/projects',
  },
  {
    key: 'h-project-get',
    endpoint: 'GET /api/v1/projects/:id',
    method: 'GET',
    path: `/api/v1/projects/${MISSING_PROJECT_ID}`,
  },
  {
    key: 'h-project-create',
    endpoint: 'POST /api/v1/projects',
    method: 'POST',
    path: '/api/v1/projects',
    body: { key: `${KEY_A}H`, name: 'Header test project' },
  },
  {
    key: 'h-project-patch',
    endpoint: 'PATCH /api/v1/projects/:id',
    method: 'PATCH',
    path: `/api/v1/projects/${MISSING_PROJECT_ID}`,
    body: { name: 'Header test' },
  },
  {
    key: 'h-project-delete',
    endpoint: 'DELETE /api/v1/projects/:id',
    method: 'DELETE',
    path: `/api/v1/projects/${MISSING_PROJECT_ID}`,
  },
  {
    key: 'h-task-create',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    method: 'POST',
    path: `/api/v1/projects/${MISSING_PROJECT_ID}/tasks`,
    body: { title: 'Header test task' },
  },
  {
    key: 'h-task-list',
    endpoint: 'GET /api/v1/projects/:projectId/tasks',
    method: 'GET',
    path: `/api/v1/projects/${MISSING_PROJECT_ID}/tasks`,
  },
  {
    key: 'h-task-get',
    endpoint: 'GET /api/v1/tasks/:taskId',
    method: 'GET',
    path: `/api/v1/tasks/${MISSING_TASK_ID}`,
  },
  {
    key: 'h-task-patch',
    endpoint: 'PATCH /api/v1/tasks/:taskId',
    method: 'PATCH',
    path: `/api/v1/tasks/${MISSING_TASK_ID}`,
    body: { title: 'Header test' },
  },
  {
    key: 'h-task-delete',
    endpoint: 'DELETE /api/v1/tasks/:taskId',
    method: 'DELETE',
    path: `/api/v1/tasks/${MISSING_TASK_ID}`,
  },
];
for (const target of headerTargets) {
  await missingHeaderCase(
    target.key,
    target.endpoint,
    target.method,
    target.path,
    target.body,
  );
  await invalidHeaderCase(
    target.key,
    target.endpoint,
    target.method,
    target.path,
    target.body,
  );
}

await call({
  key: 'org-lowercase-header-name',
  phase: 'Required header',
  endpoint: 'GET /api/v1/projects',
  name: 'Lowercase x-org-id header name is accepted',
  method: 'GET',
  path: '/api/v1/projects',
  headers: { 'x-org-id': ORG_A },
  status: 200,
  expected: '200 with a JSON array (HTTP header names are case-insensitive)',
  check: isArray,
});
await call({
  key: 'org-uppercase-uuid',
  phase: 'Required header',
  endpoint: 'GET /api/v1/projects',
  name: 'Uppercase UUID in X-Org-Id is accepted',
  method: 'GET',
  path: '/api/v1/projects',
  org: ORG_A.toUpperCase(),
  status: 200,
  expected: '200 with a JSON array (regex is case-insensitive)',
  check: isArray,
});
await call({
  key: 'org-v1-rejected',
  phase: 'Required header',
  endpoint: 'GET /api/v1/projects',
  name: 'Non-v4 UUID in X-Org-Id is rejected',
  method: 'GET',
  path: '/api/v1/projects',
  org: ORG_V1,
  status: 400,
  expected: '400 Bad Request with "X-Org-Id header must be a UUID"',
  check: messageIs('X-Org-Id header must be a UUID'),
});
await call({
  key: 'org-empty-rejected',
  phase: 'Required header',
  endpoint: 'GET /api/v1/projects',
  name: 'Empty X-Org-Id header is rejected',
  method: 'GET',
  path: '/api/v1/projects',
  org: '',
  status: 400,
  expected: '400 Bad Request with "X-Org-Id header must be a UUID"',
  check: messageIs('X-Org-Id header must be a UUID'),
});
await call({
  key: 'org-duplicate-rejected',
  phase: 'Required header',
  endpoint: 'GET /api/v1/projects',
  name: 'Comma-joined duplicate X-Org-Id values are rejected',
  method: 'GET',
  path: '/api/v1/projects',
  headers: { 'X-Org-Id': `${ORG_A}, ${ORG_B}` },
  status: 400,
  expected: '400 Bad Request with "X-Org-Id header must be a UUID"',
  check: messageIs('X-Org-Id header must be a UUID'),
});
await call({
  key: 'no-authorization-required',
  phase: 'Authentication',
  endpoint: 'GET /api/v1/projects',
  name: 'Request succeeds with no Authorization header',
  method: 'GET',
  path: '/api/v1/projects',
  org: ORG_A,
  status: 200,
  expected: '200 with a JSON array (no authentication is configured)',
  check: isArray,
});

// ---------------------------------------------------------------------------
// UUID path-parameter validation
// ---------------------------------------------------------------------------
const uuidTargets = [
  {
    key: 'uuid-project-get',
    endpoint: 'GET /api/v1/projects/:id',
    method: 'GET',
    path: '/api/v1/projects/not-a-uuid',
  },
  {
    key: 'uuid-project-patch',
    endpoint: 'PATCH /api/v1/projects/:id',
    method: 'PATCH',
    path: '/api/v1/projects/not-a-uuid',
    body: { name: 'x' },
  },
  {
    key: 'uuid-project-delete',
    endpoint: 'DELETE /api/v1/projects/:id',
    method: 'DELETE',
    path: '/api/v1/projects/not-a-uuid',
  },
  {
    key: 'uuid-task-create',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    method: 'POST',
    path: '/api/v1/projects/not-a-uuid/tasks',
    body: { title: 'x' },
  },
  {
    key: 'uuid-task-list',
    endpoint: 'GET /api/v1/projects/:projectId/tasks',
    method: 'GET',
    path: '/api/v1/projects/not-a-uuid/tasks',
  },
  {
    key: 'uuid-task-get',
    endpoint: 'GET /api/v1/tasks/:taskId',
    method: 'GET',
    path: '/api/v1/tasks/not-a-uuid',
  },
  {
    key: 'uuid-task-patch',
    endpoint: 'PATCH /api/v1/tasks/:taskId',
    method: 'PATCH',
    path: '/api/v1/tasks/not-a-uuid',
    body: { title: 'x' },
  },
  {
    key: 'uuid-task-delete',
    endpoint: 'DELETE /api/v1/tasks/:taskId',
    method: 'DELETE',
    path: '/api/v1/tasks/not-a-uuid',
  },
];
for (const target of uuidTargets) {
  await invalidUuidCase(
    target.key,
    target.endpoint,
    target.method,
    target.path,
    target.body,
  );
}
await call({
  key: 'uuid-v1-project-rejected',
  phase: 'UUID validation',
  endpoint: 'GET /api/v1/projects/:id',
  name: 'UUID v1 path parameter is rejected by ParseUUIDPipe({ version: "4" })',
  method: 'GET',
  path: `/api/v1/projects/${ORG_V1}`,
  org: ORG_A,
  status: 400,
  expected: '400 Bad Request with "Validation failed (uuid v 4 is expected)"',
  check: messageIs('Validation failed (uuid v 4 is expected)'),
});

// ---------------------------------------------------------------------------
// Project setup — three isolated orgs/projects used by later scenarios
// ---------------------------------------------------------------------------
const projectACreate = trackProject(
  await call({
    key: 'project-a-create',
    phase: 'Projects',
    endpoint: 'POST /api/v1/projects',
    name: 'Create project in org A with a complete valid payload',
    method: 'POST',
    path: '/api/v1/projects',
    org: ORG_A,
    body: {
      key: KEY_A,
      name: `QA Project A ${RUN}`,
      description: 'Primary QA project',
    },
    status: 201,
    expected: '201 with public fields, status ACTIVE and description preserved',
    check: all(
      publicProjectShape,
      fieldEquals('key', KEY_A),
      fieldEquals('status', 'ACTIVE'),
      fieldEquals('description', 'Primary QA project'),
    ),
  }),
  ORG_A,
);
ctx.projectA = mustSucceed(projectACreate, 'project-a-create');

const projectBCreate = trackProject(
  await call({
    key: 'project-b-create',
    phase: 'Projects',
    endpoint: 'POST /api/v1/projects',
    name: 'Create project in org B for isolation tests',
    method: 'POST',
    path: '/api/v1/projects',
    org: ORG_B,
    body: { key: KEY_B, name: `QA Project B ${RUN}` },
    status: 201,
    expected: '201 with public fields and default description null',
    check: all(
      publicProjectShape,
      fieldEquals('key', KEY_B),
      fieldEquals('description', null),
      fieldEquals('status', 'ACTIVE'),
    ),
  }),
  ORG_B,
);
ctx.projectB = mustSucceed(projectBCreate, 'project-b-create');

const projectWorkCreate = trackProject(
  await call({
    key: 'project-work-create',
    phase: 'Projects',
    endpoint: 'POST /api/v1/projects',
    name: 'Create clean project for the end-to-end task workflow',
    method: 'POST',
    path: '/api/v1/projects',
    org: ORG_A,
    body: { key: KEY_W, name: `QA Workflow ${RUN}`, description: 'Workflow project' },
    status: 201,
    expected: '201 with public fields',
    check: all(publicProjectShape, fieldEquals('key', KEY_W)),
  }),
  ORG_A,
);
ctx.projectWork = mustSucceed(projectWorkCreate, 'project-work-create');

// ---------------------------------------------------------------------------
// Project read, list and filtering
// ---------------------------------------------------------------------------
await call({
  key: 'project-get-valid',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects/:id',
  name: 'Retrieve an existing project',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  status: 200,
  expected: '200 with public project fields and no internal fields',
  check: all(publicProjectShape, fieldEquals('id', ctx.projectA.id)),
});
await call({
  key: 'project-list-org-a',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects',
  name: 'List projects for org A only',
  method: 'GET',
  path: '/api/v1/projects',
  org: ORG_A,
  status: 200,
  expected: '200 array containing org A projects but not org B project',
  check: all(
    isArray,
    (r) =>
      r.body.some((item) => item.key === KEY_A) &&
      r.body.some((item) => item.key === KEY_W) &&
      !r.body.some((item) => item.key === KEY_B)
        ? true
        : `org A list has keys ${r.body.map((item) => item.key).join(', ')}`,
  ),
});
await call({
  key: 'project-list-org-b',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects',
  name: 'List projects for org B only',
  method: 'GET',
  path: '/api/v1/projects',
  org: ORG_B,
  status: 200,
  expected: '200 array containing only the org B project',
  check: all(
    isArray,
    (r) =>
      r.body.length === 1 && r.body[0].key === KEY_B
        ? true
        : `org B list: ${describe(r.body)}`,
  ),
});
await call({
  key: 'project-filter-active',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects',
  name: 'Filter projects by status ACTIVE',
  method: 'GET',
  path: '/api/v1/projects?status=ACTIVE',
  org: ORG_A,
  status: 200,
  expected: '200 array where every item has status ACTIVE',
  check: all(
    isArray,
    (r) =>
      r.body.length > 0 && r.body.every((item) => item.status === 'ACTIVE')
        ? true
        : `unexpected statuses: ${describe(r.body.map((item) => item.status))}`,
  ),
});
await call({
  key: 'project-filter-archived-empty',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects',
  name: 'Filter projects by status ARCHIVED before archiving anything',
  method: 'GET',
  path: '/api/v1/projects?status=ARCHIVED',
  org: ORG_A,
  status: 200,
  expected: '200 with an empty array',
  check: emptyArray,
});
await call({
  key: 'project-filter-invalid-status',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects',
  name: 'Invalid project status filter is rejected',
  method: 'GET',
  path: '/api/v1/projects?status=INVALID',
  org: ORG_A,
  status: 400,
  expected: '400 Bad Request for an unsupported status filter',
  check: all(isObject, fieldEquals('statusCode', 400)),
});
await call({
  key: 'project-filter-lowercase-status',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects',
  name: 'Lowercase project status filter is rejected',
  method: 'GET',
  path: '/api/v1/projects?status=active',
  org: ORG_A,
  status: 400,
  expected: '400 Bad Request; status enum is case-sensitive',
  check: all(isObject, fieldEquals('statusCode', 400)),
});
await call({
  key: 'project-filter-unknown-param',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects',
  name: 'Unknown project query parameter is ignored',
  method: 'GET',
  path: '/api/v1/projects?foo=bar',
  org: ORG_A,
  status: 200,
  expected: '200 array (no unknown-filter validation is implemented)',
  check: isArray,
});
await call({
  key: 'project-pagination-ignored',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects',
  name: 'Pagination parameters are not implemented and are ignored',
  method: 'GET',
  path: '/api/v1/projects?limit=1&offset=99',
  org: ORG_A,
  status: 200,
  expected: '200 with all org A projects; pagination is not implemented',
  check: all(
    isArray,
    (r) =>
      r.body.some((item) => item.key === KEY_A) &&
      r.body.some((item) => item.key === KEY_W)
        ? true
        : 'expected both org A projects despite limit/offset',
  ),
});
await call({
  key: 'project-get-missing',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects/:id',
  name: 'Retrieve a well-formed but non-existent project UUID',
  method: 'GET',
  path: `/api/v1/projects/${MISSING_PROJECT_ID}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Project not found"',
  check: messageIs('Project not found'),
});

// ---------------------------------------------------------------------------
// Project creation validation (expected failures based on DTO/business rules)
// ---------------------------------------------------------------------------
trackProject(
  await call({
    key: 'project-create-empty',
    phase: 'Project validation',
    endpoint: 'POST /api/v1/projects',
    name: 'Create project with an empty JSON body',
    method: 'POST',
    path: '/api/v1/projects',
    org: ORG_A,
    body: {},
    status: 400,
    expected: '400 Bad Request because key and name are required',
    check: all(publicProjectShape, hasNoKeys('key', 'name')),
  }),
  ORG_A,
);
trackProject(
  await call({
    key: 'project-create-missing-name',
    phase: 'Project validation',
    endpoint: 'POST /api/v1/projects',
    name: 'Create project with key but no name',
    method: 'POST',
    path: '/api/v1/projects',
    org: ORG_A,
    body: { key: `${KEY_A}N` },
    status: 400,
    expected: '400 Bad Request because name is required',
    check: hasNoKeys('name'),
  }),
  ORG_A,
);
trackProject(
  await call({
    key: 'project-create-readonly-fields',
    phase: 'Project validation',
    endpoint: 'POST /api/v1/projects',
    name: 'Create project with read-only/unknown fields (status, owner)',
    method: 'POST',
    path: '/api/v1/projects',
    org: ORG_A,
    body: {
      key: `${KEY_A}R`,
      name: 'Read-only field test',
      status: 'ARCHIVED',
      owner: 'someone-else',
    },
    status: 400,
    expected: '400 Bad Request rejecting read-only/unknown fields',
    check: fieldEquals('status', 'ACTIVE'),
  }),
  ORG_A,
);
trackProject(
  await call({
    key: 'project-create-description-number',
    phase: 'Project validation',
    endpoint: 'POST /api/v1/projects',
    name: 'Create project with numeric description',
    method: 'POST',
    path: '/api/v1/projects',
    org: ORG_A,
    body: { key: `${KEY_A}D`, name: 'Bad description', description: 123 },
    status: 400,
    expected: '400 Bad Request because description must be string or null',
    check: fieldEquals('description', 123),
  }),
  ORG_A,
);
trackProject(
  await call({
    key: 'project-create-array',
    phase: 'Project validation',
    endpoint: 'POST /api/v1/projects',
    name: 'Create project with a JSON array body',
    method: 'POST',
    path: '/api/v1/projects',
    org: ORG_A,
    body: [{ key: KEY_A, name: 'Array project' }],
    status: 400,
    expected: '400 Bad Request because the body must be an object',
    check: hasNoKeys('key', 'name'),
  }),
  ORG_A,
);
await call({
  key: 'project-create-malformed-json',
  phase: 'Project validation',
  endpoint: 'POST /api/v1/projects',
  name: 'Create project with malformed JSON',
  method: 'POST',
  path: '/api/v1/projects',
  org: ORG_A,
  body: '{"key": ',
  status: 400,
  expected: '400 Bad Request from the JSON parser',
  check: all(isObject, fieldEquals('statusCode', 400)),
});

// ---------------------------------------------------------------------------
// Project update validation, state changes and internal-field tampering
// ---------------------------------------------------------------------------
await call({
  key: 'project-patch-name',
  phase: 'Projects',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Update project name with a valid patch',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  body: { name: `QA Project A renamed ${RUN}` },
  status: 200,
  expected: '200 with the new name and public fields only',
  check: all(
    publicProjectShape,
    fieldEquals('name', `QA Project A renamed ${RUN}`),
  ),
});
ctx.beforeEmptyPatch = (await call({
  key: 'project-get-before-empty-patch',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects/:id',
  name: 'Capture updatedAt before an empty PATCH',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  status: 200,
  expected: '200 with current project state',
  check: publicProjectShape,
})).body;
await call({
  key: 'project-patch-empty',
  phase: 'Project validation',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Empty PATCH body is rejected and does not change updatedAt',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  body: {},
  status: 400,
  expected: '400 Bad Request for an empty patch',
  check: publicProjectShape,
  detail: (r) =>
    r.body?.updatedAt !== ctx.beforeEmptyPatch?.updatedAt
      ? `Observed side effect: updatedAt changed from ${ctx.beforeEmptyPatch?.updatedAt} to ${r.body?.updatedAt}`
      : '',
});
ctx.beforeNoOpPatch = (await call({
  key: 'project-get-before-noop-patch',
  phase: 'Projects',
  endpoint: 'GET /api/v1/projects/:id',
  name: 'Capture updatedAt before a no-op PATCH',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  status: 200,
  expected: '200 with current project state',
  check: publicProjectShape,
})).body;
await call({
  key: 'project-patch-no-op',
  phase: 'Project validation',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'No-op PATCH preserves updatedAt',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  body: { name: ctx.beforeNoOpPatch.name },
  status: 200,
  expected: '200 with updatedAt unchanged',
  check: fieldEquals('updatedAt', ctx.beforeNoOpPatch.updatedAt),
});
await call({
  key: 'project-patch-next-task-number',
  phase: 'Project validation',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Internal nextTaskNumber cannot be patched by a client',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  body: { nextTaskNumber: 50 },
  status: 400,
  expected: '400 Bad Request rejecting the read-only nextTaskNumber field',
  check: publicProjectShape,
});
trackTask(
  await call({
    key: 'project-task-number-tampered',
    phase: 'Project validation',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: 'Task numbering after the tampered counter shows the mass-assignment impact',
    method: 'POST',
    path: `/api/v1/projects/${ctx.projectA.id}/tasks`,
    org: ORG_A,
    body: { title: 'Task number probe' },
    status: 201,
    expected: `201 with key ${KEY_A}-1 (counter should not be client-controlled)`,
    check: all(publicTaskShape, fieldEquals('key', `${KEY_A}-1`)),
  }),
  ORG_A,
);
await call({
  key: 'project-patch-invalid-status',
  phase: 'Project validation',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Invalid project status value is rejected',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  body: { status: 'BANANA' },
  status: 400,
  expected: '400 Bad Request for a status outside ACTIVE|ARCHIVED',
  check: fieldEquals('status', 'ACTIVE'),
});
await call({
  key: 'project-get-invalid-status',
  phase: 'Project validation',
  endpoint: 'GET /api/v1/projects/:id',
  name: 'Verify invalid status was persisted by the rejected PATCH',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  status: 200,
  expected: '200 with status still ACTIVE',
  check: fieldEquals('status', 'ACTIVE'),
});
await call({
  key: 'project-patch-restore-status',
  phase: 'Project validation',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Restore project status to ACTIVE',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  body: { status: 'ACTIVE' },
  status: 200,
  expected: '200 with status ACTIVE',
  check: fieldEquals('status', 'ACTIVE'),
});
await call({
  key: 'project-patch-name-number',
  phase: 'Project validation',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Numeric name is rejected by PATCH',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  body: { name: 123 },
  status: 400,
  expected: '400 Bad Request because name must be a string',
  check: fieldEquals('name', 123),
});
await call({
  key: 'project-patch-restore-name',
  phase: 'Project validation',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Restore project name to a string',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  body: { name: `QA Project A restored ${RUN}` },
  status: 200,
  expected: '200 with string name',
  check: fieldEquals('name', `QA Project A restored ${RUN}`),
});
await call({
  key: 'project-patch-readonly-key',
  phase: 'Project validation',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Read-only key field is rejected by PATCH',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  body: { key: 'HACKED' },
  status: 400,
  expected: '400 Bad Request rejecting the read-only key field',
  check: fieldEquals('key', KEY_A),
});
await call({
  key: 'project-patch-unknown-field',
  phase: 'Project validation',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Unknown field is rejected by PATCH',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_A,
  body: { owner: 'someone-else' },
  status: 400,
  expected: '400 Bad Request rejecting an unknown field',
  check: publicProjectShape,
});
await call({
  key: 'project-patch-missing',
  phase: 'Projects',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'PATCH a well-formed but non-existent project UUID',
  method: 'PATCH',
  path: `/api/v1/projects/${MISSING_PROJECT_ID}`,
  org: ORG_A,
  body: { name: 'Nobody' },
  status: 404,
  expected: '404 Not Found with "Project not found"',
  check: messageIs('Project not found'),
});
await call({
  key: 'project-delete-missing',
  phase: 'Projects',
  endpoint: 'DELETE /api/v1/projects/:id',
  name: 'DELETE a well-formed but non-existent project UUID',
  method: 'DELETE',
  path: `/api/v1/projects/${MISSING_PROJECT_ID}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Project not found"',
  check: messageIs('Project not found'),
});

// ---------------------------------------------------------------------------
// Task creation workflow
// ---------------------------------------------------------------------------
const task1Result = trackTask(
  await call({
    key: 'task-create-minimal',
    phase: 'Tasks',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: 'Create task with only the required title',
    method: 'POST',
    path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
    org: ORG_A,
    body: { title: 'Minimal task' },
    status: 201,
    expected:
      '201 with key W-1, status TODO, priority MEDIUM, null optional fields, no organizationId',
    check: all(
      publicTaskShape,
      fieldEquals('key', `${KEY_W}-1`),
      fieldEquals('number', 1),
      fieldEquals('status', 'TODO'),
      fieldEquals('priority', 'MEDIUM'),
      fieldEquals('description', null),
      fieldEquals('assigneeId', null),
      fieldEquals('dueDate', null),
    ),
  }),
  ORG_A,
);
ctx.task1 = mustSucceed(task1Result, 'task-create-minimal');

const task2Result = trackTask(
  await call({
    key: 'task-create-full',
    phase: 'Tasks',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: 'Create task with all optional fields and whitespace in title',
    method: 'POST',
    path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
    org: ORG_A,
    body: {
      title: '  Full task with whitespace  ',
      description: 'Full description',
      priority: 'HIGH',
      assigneeId: USER_A,
      dueDate: '2026-12-31',
    },
    status: 201,
    expected: '201 with trimmed title, key W-2 and all supplied fields preserved',
    check: all(
      publicTaskShape,
      fieldEquals('key', `${KEY_W}-2`),
      fieldEquals('number', 2),
      fieldEquals('title', 'Full task with whitespace'),
      fieldEquals('description', 'Full description'),
      fieldEquals('priority', 'HIGH'),
      fieldEquals('assigneeId', USER_A),
      fieldEquals('dueDate', '2026-12-31'),
    ),
  }),
  ORG_A,
);
ctx.task2 = mustSucceed(task2Result, 'task-create-full');

const task3Result = trackTask(
  await call({
    key: 'task-create-low-priority',
    phase: 'Tasks',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: 'Create low-priority task assigned to org B user string',
    method: 'POST',
    path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
    org: ORG_A,
    body: { title: 'Low priority task', priority: 'LOW', assigneeId: USER_B },
    status: 201,
    expected: '201 with key W-3, priority LOW and assigneeId preserved',
    check: all(
      publicTaskShape,
      fieldEquals('key', `${KEY_W}-3`),
      fieldEquals('priority', 'LOW'),
      fieldEquals('assigneeId', USER_B),
    ),
  }),
  ORG_A,
);
ctx.task3 = mustSucceed(task3Result, 'task-create-low-priority');

const statusTaskResult = trackTask(
  await call({
    key: 'task-create-status-probe',
    phase: 'Tasks',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: 'Create urgent task used for state-transition tests',
    method: 'POST',
    path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
    org: ORG_A,
    body: { title: 'Status transition task', priority: 'URGENT', assigneeId: USER_A },
    status: 201,
    expected: '201 with key W-4, status TODO and priority URGENT',
    check: all(
      publicTaskShape,
      fieldEquals('key', `${KEY_W}-4`),
      fieldEquals('status', 'TODO'),
      fieldEquals('priority', 'URGENT'),
    ),
  }),
  ORG_A,
);
ctx.statusTask = mustSucceed(statusTaskResult, 'task-create-status-probe');

const invalidTaskPayloads = [
  {
    key: 'task-create-missing-title',
    body: { priority: 'HIGH' },
    message: 'Title must be a string between 1 and 200 characters',
    name: 'Create task without title',
  },
  {
    key: 'task-create-blank-title',
    body: { title: '   ' },
    message: 'Title must be a string between 1 and 200 characters',
    name: 'Create task with whitespace-only title',
  },
  {
    key: 'task-create-long-title',
    body: { title: 'x'.repeat(201) },
    message: 'Title must be a string between 1 and 200 characters',
    name: 'Create task with a 201-character title',
  },
  {
    key: 'task-create-numeric-title',
    body: { title: 42 },
    message: 'Title must be a string between 1 and 200 characters',
    name: 'Create task with numeric title',
  },
  {
    key: 'task-create-invalid-priority',
    body: { title: 'Bad priority', priority: 'CRITICAL' },
    message: 'Invalid task priority',
    name: 'Create task with unsupported priority',
  },
  {
    key: 'task-create-numeric-description',
    body: { title: 'Bad description', description: 42 },
    message: 'Description must be a string or null',
    name: 'Create task with numeric description',
  },
  {
    key: 'task-create-numeric-assignee',
    body: { title: 'Bad assignee', assigneeId: 42 },
    message: 'Assignee ID must be a string or null',
    name: 'Create task with numeric assigneeId',
  },
  {
    key: 'task-create-numeric-due-date',
    body: { title: 'Bad due date', dueDate: 20261231 },
    message: 'Due date must be a string or null',
    name: 'Create task with numeric dueDate',
  },
  {
    key: 'task-create-readonly-status',
    body: { title: 'Read-only status', status: 'DONE' },
    message: 'Unknown or read-only fields: status',
    name: 'Create task with server-managed status field',
  },
  {
    key: 'task-create-array-body',
    body: [{ title: 'Array body' }],
    message: 'Request body must be an object',
    name: 'Create task with a JSON array body',
  },
  {
    key: 'task-create-empty-body',
    body: {},
    message: 'Title must be a string between 1 and 200 characters',
    name: 'Create task with an empty JSON body',
  },
];
for (const item of invalidTaskPayloads) {
  await call({
    key: item.key,
    phase: 'Task validation',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: item.name,
    method: 'POST',
    path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
    org: ORG_A,
    body: item.body,
    status: 400,
    expected: `400 Bad Request with "${item.message}"`,
    check: messageIs(item.message),
  });
}
await call({
  key: 'task-create-malformed-json',
  phase: 'Task validation',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  name: 'Create task with malformed JSON',
  method: 'POST',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
  org: ORG_A,
  body: '{"title": ',
  status: 400,
  expected: '400 Bad Request from the JSON parser',
  check: all(isObject, fieldEquals('statusCode', 400)),
});
await call({
  key: 'task-create-missing-project',
  phase: 'Tasks',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  name: 'Create task in a non-existent project',
  method: 'POST',
  path: `/api/v1/projects/${MISSING_PROJECT_ID}/tasks`,
  org: ORG_A,
  body: { title: 'Orphan task' },
  status: 404,
  expected: '404 Not Found with "Project not found"',
  check: messageIs('Project not found'),
});

// ---------------------------------------------------------------------------
// Task listing and filtering
// ---------------------------------------------------------------------------
await call({
  key: 'task-list-all',
  phase: 'Tasks',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'List all tasks in the workflow project',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
  org: ORG_A,
  status: 200,
  expected: '200 array of 4 tasks sorted by number descending',
  check: all(
    arrayLength(4),
    (r) =>
      r.body.map((item) => item.key).join(',') ===
      [`${KEY_W}-4`, `${KEY_W}-3`, `${KEY_W}-2`, `${KEY_W}-1`].join(',')
        ? true
        : `keys were ${r.body.map((item) => item.key).join(',')}`,
    (r) =>
      r.body.every((item) => !('organizationId' in item))
        ? true
        : 'organizationId leaked in task list',
  ),
});
await call({
  key: 'task-filter-status-todo',
  phase: 'Task filters',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Filter tasks by status TODO',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks?status=TODO`,
  org: ORG_A,
  status: 200,
  expected: '200 array containing only TODO tasks',
  check: all(
    arrayLength(4),
    (r) =>
      r.body.every((item) => item.status === 'TODO')
        ? true
        : `statuses: ${describe(r.body.map((item) => item.status))}`,
  ),
});
await call({
  key: 'task-filter-priority-high',
  phase: 'Task filters',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Filter tasks by priority HIGH',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks?priority=HIGH`,
  org: ORG_A,
  status: 200,
  expected: '200 array containing only the HIGH priority task',
  check: all(
    arrayLength(1),
    (r) =>
      r.body[0].key === `${KEY_W}-2`
        ? true
        : `first key ${r.body[0]?.key}, expected ${KEY_W}-2`,
  ),
});
await call({
  key: 'task-filter-assignee',
  phase: 'Task filters',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Filter tasks by assigneeId',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks?assigneeId=${encodeURIComponent(USER_A)}`,
  org: ORG_A,
  status: 200,
  expected: '200 array containing the two tasks assigned to USER_A',
  check: all(
    arrayLength(2),
    (r) =>
      r.body.every((item) => item.assigneeId === USER_A)
        ? true
        : 'unexpected assignee in filtered results',
  ),
});
await call({
  key: 'task-filter-combined',
  phase: 'Task filters',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Combine status, priority and assigneeId filters',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks?status=TODO&priority=HIGH&assigneeId=${encodeURIComponent(USER_A)}`,
  org: ORG_A,
  status: 200,
  expected: '200 array containing exactly the matching task W-2',
  check: all(
    arrayLength(1),
    (r) =>
      r.body[0].key === `${KEY_W}-2`
        ? true
        : `first key ${r.body[0]?.key}, expected ${KEY_W}-2`,
  ),
});
await call({
  key: 'task-filter-invalid-status',
  phase: 'Task filters',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Invalid task status filter',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks?status=BANANA`,
  org: ORG_A,
  status: 400,
  expected: '400 Bad Request with "Invalid task status filter"',
  check: messageIs('Invalid task status filter'),
});
await call({
  key: 'task-filter-invalid-priority',
  phase: 'Task filters',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Invalid task priority filter',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks?priority=CRITICAL`,
  org: ORG_A,
  status: 400,
  expected: '400 Bad Request with "Invalid task priority filter"',
  check: messageIs('Invalid task priority filter'),
});
await call({
  key: 'task-filter-empty-status',
  phase: 'Task filters',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Empty task status filter',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks?status=`,
  org: ORG_A,
  status: 400,
  expected: '400 Bad Request with "Invalid task status filter"',
  check: messageIs('Invalid task status filter'),
});
await call({
  key: 'task-filter-unknown-param',
  phase: 'Task filters',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Unknown task query parameter is rejected by filter validation',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks?foo=bar`,
  org: ORG_A,
  status: 400,
  expected: '400 Bad Request with "Unknown or read-only fields: foo"',
  check: messageIs('Unknown or read-only fields: foo'),
});
await call({
  key: 'task-pagination-ignored',
  phase: 'Task filters',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Task pagination parameters are not implemented and are ignored',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks?limit=1&offset=99`,
  org: ORG_A,
  status: 200,
  expected: '200 with all 4 tasks; pagination is not implemented',
  check: arrayLength(4),
});
await call({
  key: 'task-list-missing-project',
  phase: 'Tasks',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'List tasks for a non-existent project',
  method: 'GET',
  path: `/api/v1/projects/${MISSING_PROJECT_ID}/tasks`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Project not found"',
  check: messageIs('Project not found'),
});

// ---------------------------------------------------------------------------
// Task retrieval and updates
// ---------------------------------------------------------------------------
await call({
  key: 'task-get-valid',
  phase: 'Tasks',
  endpoint: 'GET /api/v1/tasks/:taskId',
  name: 'Retrieve an existing task',
  method: 'GET',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  status: 200,
  expected: '200 with public task fields and derived key',
  check: all(publicTaskShape, fieldEquals('id', ctx.task1.id)),
});
await call({
  key: 'task-get-missing',
  phase: 'Tasks',
  endpoint: 'GET /api/v1/tasks/:taskId',
  name: 'Retrieve a non-existent task UUID',
  method: 'GET',
  path: `/api/v1/tasks/${MISSING_TASK_ID}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Task not found"',
  check: messageIs('Task not found'),
});
await call({
  key: 'task-patch-title-trim',
  phase: 'Tasks',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'Update task title and verify trimming',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  body: { title: '  Minimal task renamed  ' },
  status: 200,
  expected: '200 with title trimmed to "Minimal task renamed"',
  check: all(publicTaskShape, fieldEquals('title', 'Minimal task renamed')),
});
await call({
  key: 'task-patch-description-null',
  phase: 'Tasks',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'Clear task description with null',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task2.id}`,
  org: ORG_A,
  body: { description: null },
  status: 200,
  expected: '200 with description null',
  check: fieldEquals('description', null),
});
await call({
  key: 'task-patch-priority-assignee-due',
  phase: 'Tasks',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'Update priority, assigneeId and dueDate together',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task2.id}`,
  org: ORG_A,
  body: {
    priority: 'URGENT',
    assigneeId: USER_B,
    dueDate: '2027-01-15',
  },
  status: 200,
  expected: '200 with all three fields updated',
  check: all(
    fieldEquals('priority', 'URGENT'),
    fieldEquals('assigneeId', USER_B),
    fieldEquals('dueDate', '2027-01-15'),
  ),
});
await call({
  key: 'task-patch-empty',
  phase: 'Task validation',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'Empty PATCH body',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  body: {},
  status: 400,
  expected: '400 Bad Request with "PATCH body cannot be empty"',
  check: messageIs('PATCH body cannot be empty'),
});
await call({
  key: 'task-patch-readonly-number',
  phase: 'Task validation',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'PATCH a read-only task field',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  body: { number: 99 },
  status: 400,
  expected: '400 Bad Request with "Unknown or read-only fields: number"',
  check: messageIs('Unknown or read-only fields: number'),
});
await call({
  key: 'task-patch-blank-title',
  phase: 'Task validation',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'PATCH with a blank title',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  body: { title: '  ' },
  status: 400,
  expected: '400 Bad Request for an invalid title',
  check: messageIs('Title must be a string between 1 and 200 characters'),
});
await call({
  key: 'task-patch-invalid-status',
  phase: 'Task validation',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'PATCH with an unsupported status value',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  body: { status: 'BANANA' },
  status: 400,
  expected: '400 Bad Request with "Invalid task status"',
  check: messageIs('Invalid task status'),
});
await call({
  key: 'task-patch-invalid-priority',
  phase: 'Task validation',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'PATCH with an unsupported priority value',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  body: { priority: 'CRITICAL' },
  status: 400,
  expected: '400 Bad Request with "Invalid task priority"',
  check: messageIs('Invalid task priority'),
});
await call({
  key: 'task-patch-malformed-json',
  phase: 'Task validation',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'PATCH with malformed JSON',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  body: '{"title": ',
  status: 400,
  expected: '400 Bad Request from the JSON parser',
  check: all(isObject, fieldEquals('statusCode', 400)),
});
await call({
  key: 'task-patch-missing',
  phase: 'Tasks',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'PATCH a non-existent task UUID',
  method: 'PATCH',
  path: `/api/v1/tasks/${MISSING_TASK_ID}`,
  org: ORG_A,
  body: { title: 'Nobody' },
  status: 404,
  expected: '404 Not Found with "Task not found"',
  check: messageIs('Task not found'),
});
ctx.beforeNoOpTaskPatch = (await call({
  key: 'task-get-before-noop-patch',
  phase: 'Tasks',
  endpoint: 'GET /api/v1/tasks/:taskId',
  name: 'Capture task state before a no-op PATCH',
  method: 'GET',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  status: 200,
  expected: '200 with current task state',
  check: publicTaskShape,
})).body;
await call({
  key: 'task-patch-no-op-whitespace',
  phase: 'Tasks',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'No-op PATCH with whitespace around the current title preserves updatedAt',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  body: { title: `  ${ctx.beforeNoOpTaskPatch.title}  ` },
  status: 200,
  expected: '200 with updatedAt unchanged',
  check: all(
    fieldEquals('title', ctx.beforeNoOpTaskPatch.title),
    fieldEquals('updatedAt', ctx.beforeNoOpTaskPatch.updatedAt),
  ),
});

// ---------------------------------------------------------------------------
// Task state machine (allowed and invalid transitions)
// ---------------------------------------------------------------------------
async function transitionCase(key, from, to, expectStatus) {
  const isAllowed = expectStatus === 200;
  return call({
    key,
    phase: 'Task state machine',
    endpoint: 'PATCH /api/v1/tasks/:taskId',
    name: `Status transition ${from} -> ${to}`,
    method: 'PATCH',
    path: `/api/v1/tasks/${ctx.statusTask.id}`,
    org: ORG_A,
    body: { status: to },
    status: expectStatus,
    expected: isAllowed
      ? `200 with status ${to}`
      : `422 with "Cannot move task from ${from} to ${to}"`,
    check: isAllowed
      ? all(publicTaskShape, fieldEquals('status', to))
      : messageIs(`Cannot move task from ${from} to ${to}`),
  });
}

await transitionCase('transition-todo-inprogress', 'TODO', 'IN_PROGRESS', 200);
await transitionCase('transition-inprogress-inreview', 'IN_PROGRESS', 'IN_REVIEW', 200);
await transitionCase('transition-inreview-done', 'IN_REVIEW', 'DONE', 200);
await transitionCase('transition-done-inprogress', 'DONE', 'IN_PROGRESS', 200);
await transitionCase('transition-inprogress-todo', 'IN_PROGRESS', 'TODO', 200);
await transitionCase('transition-invalid-todo-done', 'TODO', 'DONE', 422);
await transitionCase('transition-invalid-todo-inreview', 'TODO', 'IN_REVIEW', 422);
await transitionCase('transition-reset-inprogress', 'TODO', 'IN_PROGRESS', 200);
await transitionCase('transition-invalid-inprogress-done', 'IN_PROGRESS', 'DONE', 422);
await transitionCase('transition-reset-inreview', 'IN_PROGRESS', 'IN_REVIEW', 200);
await transitionCase('transition-invalid-inreview-todo', 'IN_REVIEW', 'TODO', 422);
await transitionCase('transition-reset-done', 'IN_REVIEW', 'DONE', 200);
await transitionCase('transition-invalid-done-todo', 'DONE', 'TODO', 422);
await transitionCase('transition-invalid-done-inreview', 'DONE', 'IN_REVIEW', 422);
ctx.beforeSameStatusPatch = (await call({
  key: 'task-get-before-same-status',
  phase: 'Task state machine',
  endpoint: 'GET /api/v1/tasks/:taskId',
  name: 'Capture task state before patching to the same status',
  method: 'GET',
  path: `/api/v1/tasks/${ctx.statusTask.id}`,
  org: ORG_A,
  status: 200,
  expected: '200 with status DONE',
  check: fieldEquals('status', 'DONE'),
})).body;
await call({
  key: 'transition-same-status-no-op',
  phase: 'Task state machine',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'Patch a task to its current status is a no-op',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.statusTask.id}`,
  org: ORG_A,
  body: { status: 'DONE' },
  status: 200,
  expected: '200 with status DONE and updatedAt unchanged',
  check: all(
    fieldEquals('status', 'DONE'),
    fieldEquals('updatedAt', ctx.beforeSameStatusPatch.updatedAt),
  ),
});

// ---------------------------------------------------------------------------
// Task deletion and subsequent retrieval
// ---------------------------------------------------------------------------
const deleteTaskResult = trackTask(
  await call({
    key: 'task-create-for-delete',
    phase: 'Tasks',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: 'Create a task that will be deleted',
    method: 'POST',
    path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
    org: ORG_A,
    body: { title: 'Delete me' },
    status: 201,
    expected: '201 with key W-5',
    check: all(publicTaskShape, fieldEquals('key', `${KEY_W}-5`)),
  }),
  ORG_A,
);
ctx.deleteTask = mustSucceed(deleteTaskResult, 'task-create-for-delete');
await call({
  key: 'task-delete-valid',
  phase: 'Tasks',
  endpoint: 'DELETE /api/v1/tasks/:taskId',
  name: 'Delete an existing task',
  method: 'DELETE',
  path: `/api/v1/tasks/${ctx.deleteTask.id}`,
  org: ORG_A,
  status: 204,
  expected: '204 No Content with empty body',
  check: (r) => (r.raw === '' ? true : `expected empty body, got ${describe(r.raw)}`),
});
await call({
  key: 'task-get-after-delete',
  phase: 'Tasks',
  endpoint: 'GET /api/v1/tasks/:taskId',
  name: 'Retrieve a deleted task',
  method: 'GET',
  path: `/api/v1/tasks/${ctx.deleteTask.id}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Task not found"',
  check: messageIs('Task not found'),
});
await call({
  key: 'task-delete-twice',
  phase: 'Tasks',
  endpoint: 'DELETE /api/v1/tasks/:taskId',
  name: 'Delete the same task a second time',
  method: 'DELETE',
  path: `/api/v1/tasks/${ctx.deleteTask.id}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Task not found"',
  check: messageIs('Task not found'),
});
await call({
  key: 'task-delete-missing',
  phase: 'Tasks',
  endpoint: 'DELETE /api/v1/tasks/:taskId',
  name: 'Delete a non-existent task UUID',
  method: 'DELETE',
  path: `/api/v1/tasks/${MISSING_TASK_ID}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Task not found"',
  check: messageIs('Task not found'),
});

// ---------------------------------------------------------------------------
// Organization isolation across every resource operation
// ---------------------------------------------------------------------------
await call({
  key: 'isolation-orgb-list',
  phase: 'Organization isolation',
  endpoint: 'GET /api/v1/projects',
  name: 'Org B project list does not leak org A projects',
  method: 'GET',
  path: '/api/v1/projects',
  org: ORG_B,
  status: 200,
  expected: '200 array containing only KEY_B',
  check: all(
    isArray,
    (r) =>
      r.body.length === 1 && r.body[0].key === KEY_B
        ? true
        : `keys: ${describe(r.body.map((item) => item.key))}`,
  ),
});
await call({
  key: 'isolation-orgb-get-project-a',
  phase: 'Organization isolation',
  endpoint: 'GET /api/v1/projects/:id',
  name: 'Org B cannot read org A project',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_B,
  status: 404,
  expected: '404 Not Found',
  check: messageIs('Project not found'),
});
await call({
  key: 'isolation-orgb-patch-project-a',
  phase: 'Organization isolation',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Org B cannot update org A project',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_B,
  body: { name: 'Hacked by org B' },
  status: 404,
  expected: '404 Not Found',
  check: messageIs('Project not found'),
});
await call({
  key: 'isolation-orgb-delete-project-a',
  phase: 'Organization isolation',
  endpoint: 'DELETE /api/v1/projects/:id',
  name: 'Org B cannot delete org A project',
  method: 'DELETE',
  path: `/api/v1/projects/${ctx.projectA.id}`,
  org: ORG_B,
  status: 404,
  expected: '404 Not Found with "Project not found"',
  check: messageIs('Project not found'),
});
await call({
  key: 'isolation-orgb-list-tasks-a',
  phase: 'Organization isolation',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Org B cannot list tasks in org A project',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
  org: ORG_B,
  status: 404,
  expected: '404 Not Found with "Project not found"',
  check: messageIs('Project not found'),
});
await call({
  key: 'isolation-orgb-create-task-a',
  phase: 'Organization isolation',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  name: 'Org B cannot create a task in org A project',
  method: 'POST',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
  org: ORG_B,
  body: { title: 'Cross-org task' },
  status: 404,
  expected: '404 Not Found with "Project not found"',
  check: messageIs('Project not found'),
});
await call({
  key: 'isolation-orgb-get-task-a',
  phase: 'Organization isolation',
  endpoint: 'GET /api/v1/tasks/:taskId',
  name: 'Org B cannot read org A task',
  method: 'GET',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_B,
  status: 404,
  expected: '404 Not Found with "Task not found"',
  check: messageIs('Task not found'),
});
await call({
  key: 'isolation-orgb-patch-task-a',
  phase: 'Organization isolation',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'Org B cannot update org A task',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_B,
  body: { title: 'Cross-org title' },
  status: 404,
  expected: '404 Not Found with "Task not found"',
  check: messageIs('Task not found'),
});
await call({
  key: 'isolation-orgb-delete-task-a',
  phase: 'Organization isolation',
  endpoint: 'DELETE /api/v1/tasks/:taskId',
  name: 'Org B cannot delete org A task',
  method: 'DELETE',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_B,
  status: 404,
  expected: '404 Not Found with "Task not found"',
  check: messageIs('Task not found'),
});
await call({
  key: 'isolation-orga-get-project-b',
  phase: 'Organization isolation',
  endpoint: 'GET /api/v1/projects/:id',
  name: 'Org A cannot read org B project',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectB.id}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found',
  check: messageIs('Project not found'),
});
const orgBTaskResult = trackTask(
  await call({
    key: 'isolation-orgb-own-task',
    phase: 'Organization isolation',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: 'Org B can create a task in its own project',
    method: 'POST',
    path: `/api/v1/projects/${ctx.projectB.id}/tasks`,
    org: ORG_B,
    body: { title: 'Org B own task' },
    status: 201,
    expected: '201 with key B-1',
    check: all(publicTaskShape, fieldEquals('key', `${KEY_B}-1`)),
  }),
  ORG_B,
);
ctx.orgBTask = mustSucceed(orgBTaskResult, 'isolation-orgb-own-task');

// ---------------------------------------------------------------------------
// Archived project restrictions
// ---------------------------------------------------------------------------
await call({
  key: 'archive-project',
  phase: 'Archived project',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Archive a project',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectWork.id}`,
  org: ORG_A,
  body: { status: 'ARCHIVED' },
  status: 200,
  expected: '200 with status ARCHIVED',
  check: fieldEquals('status', 'ARCHIVED'),
});
await call({
  key: 'archive-filter-archived',
  phase: 'Archived project',
  endpoint: 'GET /api/v1/projects',
  name: 'Archived project appears in ARCHIVED filter',
  method: 'GET',
  path: '/api/v1/projects?status=ARCHIVED',
  org: ORG_A,
  status: 200,
  expected: '200 array containing the archived project',
  check: all(
    isArray,
    (r) =>
      r.body.some((item) => item.key === KEY_W)
        ? true
        : `keys: ${describe(r.body.map((item) => item.key))}`,
  ),
});
await call({
  key: 'archive-filter-active-excludes',
  phase: 'Archived project',
  endpoint: 'GET /api/v1/projects',
  name: 'Archived project is excluded from ACTIVE filter',
  method: 'GET',
  path: '/api/v1/projects?status=ACTIVE',
  org: ORG_A,
  status: 200,
  expected: '200 array without the archived project',
  check: all(
    isArray,
    (r) =>
      !r.body.some((item) => item.key === KEY_W)
        ? true
        : 'archived project unexpectedly appeared in ACTIVE filter',
  ),
});
await call({
  key: 'archive-create-task-blocked',
  phase: 'Archived project',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  name: 'Creating a task in an archived project is blocked',
  method: 'POST',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
  org: ORG_A,
  body: { title: 'Should not be created' },
  status: 409,
  expected: '409 Conflict with "Cannot create tasks in an archived project"',
  check: messageIs('Cannot create tasks in an archived project'),
});
await call({
  key: 'archive-patch-task-blocked',
  phase: 'Archived project',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  name: 'Updating a task in an archived project is blocked',
  method: 'PATCH',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  body: { title: 'Should not be updated' },
  status: 409,
  expected: '409 Conflict with "Cannot modify tasks in an archived project"',
  check: messageIs('Cannot modify tasks in an archived project'),
});
await call({
  key: 'archive-delete-task-blocked',
  phase: 'Archived project',
  endpoint: 'DELETE /api/v1/tasks/:taskId',
  name: 'Deleting a task in an archived project is blocked',
  method: 'DELETE',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  status: 409,
  expected: '409 Conflict with "Cannot delete tasks in an archived project"',
  check: messageIs('Cannot delete tasks in an archived project'),
});
await call({
  key: 'archive-get-task-allowed',
  phase: 'Archived project',
  endpoint: 'GET /api/v1/tasks/:taskId',
  name: 'Reading a task in an archived project is still allowed',
  method: 'GET',
  path: `/api/v1/tasks/${ctx.task1.id}`,
  org: ORG_A,
  status: 200,
  expected: '200 with the task',
  check: publicTaskShape,
});
await call({
  key: 'archive-list-tasks-allowed',
  phase: 'Archived project',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  name: 'Listing tasks in an archived project is still allowed',
  method: 'GET',
  path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
  org: ORG_A,
  status: 200,
  expected: '200 array of existing tasks',
  check: arrayLength(4),
});
await call({
  key: 'archive-restore-project',
  phase: 'Archived project',
  endpoint: 'PATCH /api/v1/projects/:id',
  name: 'Restore project to ACTIVE',
  method: 'PATCH',
  path: `/api/v1/projects/${ctx.projectWork.id}`,
  org: ORG_A,
  body: { status: 'ACTIVE' },
  status: 200,
  expected: '200 with status ACTIVE',
  check: fieldEquals('status', 'ACTIVE'),
});
const unarchivedTask = trackTask(
  await call({
    key: 'archive-create-after-restore',
    phase: 'Archived project',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: 'Task creation works again after restoring the project',
    method: 'POST',
    path: `/api/v1/projects/${ctx.projectWork.id}/tasks`,
    org: ORG_A,
    body: { title: 'Created after restore' },
    status: 201,
    expected: '201 with key W-6',
    check: all(publicTaskShape, fieldEquals('key', `${KEY_W}-6`)),
  }),
  ORG_A,
);
await call({
  key: 'archive-cleanup-restored-task',
  phase: 'Archived project',
  endpoint: 'DELETE /api/v1/tasks/:taskId',
  name: 'Remove the post-restore task',
  method: 'DELETE',
  path: `/api/v1/tasks/${unarchivedTask.body.id}`,
  org: ORG_A,
  status: 204,
  expected: '204 No Content',
  check: (r) => (r.raw === '' ? true : 'expected empty body'),
});

// ---------------------------------------------------------------------------
// Project deletion and cascading task removal
// ---------------------------------------------------------------------------
const cascadeProject = trackProject(
  await call({
    key: 'cascade-create-project',
    phase: 'Cascade deletion',
    endpoint: 'POST /api/v1/projects',
    name: 'Create a project for cascade-deletion testing',
    method: 'POST',
    path: '/api/v1/projects',
    org: ORG_A,
    body: { key: KEY_C, name: `QA Cascade ${RUN}` },
    status: 201,
    expected: '201 with public fields',
    check: all(publicProjectShape, fieldEquals('key', KEY_C)),
  }),
  ORG_A,
);
ctx.cascadeProject = mustSucceed(cascadeProject, 'cascade-create-project');
const cascadeTask1 = trackTask(
  await call({
    key: 'cascade-create-task-1',
    phase: 'Cascade deletion',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: 'Create first task in cascade project',
    method: 'POST',
    path: `/api/v1/projects/${ctx.cascadeProject.id}/tasks`,
    org: ORG_A,
    body: { title: 'Cascade task 1' },
    status: 201,
    expected: '201 with key C-1',
    check: fieldEquals('key', `${KEY_C}-1`),
  }),
  ORG_A,
);
const cascadeTask2 = trackTask(
  await call({
    key: 'cascade-create-task-2',
    phase: 'Cascade deletion',
    endpoint: 'POST /api/v1/projects/:projectId/tasks',
    name: 'Create second task in cascade project',
    method: 'POST',
    path: `/api/v1/projects/${ctx.cascadeProject.id}/tasks`,
    org: ORG_A,
    body: { title: 'Cascade task 2' },
    status: 201,
    expected: '201 with key C-2',
    check: fieldEquals('key', `${KEY_C}-2`),
  }),
  ORG_A,
);
await call({
  key: 'cascade-delete-project',
  phase: 'Cascade deletion',
  endpoint: 'DELETE /api/v1/projects/:id',
  name: 'Delete the project with two tasks',
  method: 'DELETE',
  path: `/api/v1/projects/${ctx.cascadeProject.id}`,
  org: ORG_A,
  status: 204,
  expected: '204 No Content',
  check: (r) => (r.raw === '' ? true : 'expected empty body'),
});
await call({
  key: 'cascade-get-deleted-project',
  phase: 'Cascade deletion',
  endpoint: 'GET /api/v1/projects/:id',
  name: 'Retrieve the deleted project',
  method: 'GET',
  path: `/api/v1/projects/${ctx.cascadeProject.id}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Project not found"',
  check: messageIs('Project not found'),
});
await call({
  key: 'cascade-get-deleted-task-1',
  phase: 'Cascade deletion',
  endpoint: 'GET /api/v1/tasks/:taskId',
  name: 'Verify first task was cascade-deleted',
  method: 'GET',
  path: `/api/v1/tasks/${cascadeTask1.body.id}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Task not found"',
  check: messageIs('Task not found'),
});
await call({
  key: 'cascade-get-deleted-task-2',
  phase: 'Cascade deletion',
  endpoint: 'GET /api/v1/tasks/:taskId',
  name: 'Verify second task was cascade-deleted',
  method: 'GET',
  path: `/api/v1/tasks/${cascadeTask2.body.id}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Task not found"',
  check: messageIs('Task not found'),
});
await call({
  key: 'cascade-delete-project-twice',
  phase: 'Cascade deletion',
  endpoint: 'DELETE /api/v1/projects/:id',
  name: 'Delete the already-deleted project again',
  method: 'DELETE',
  path: `/api/v1/projects/${ctx.cascadeProject.id}`,
  org: ORG_A,
  status: 404,
  expected: '404 Not Found with "Project not found"',
  check: messageIs('Project not found'),
});
} catch (error) {
  fatal = String(error?.stack ?? error);
  results.push({
    id: `TC-${String(results.length + 1).padStart(3, '0')}`,
    key: 'fatal-harness-error',
    phase: 'Harness',
    endpoint: '(harness)',
    name: 'Unexpected harness/setup error',
    method: '-',
    url: '-',
    requestHeaders: {},
    requestBody: null,
    status: 0,
    statusText: 'HARNESS ERROR',
    responseHeaders: {},
    raw: '',
    body: null,
    bodyPretty: '(none)',
    expected: 'All test steps complete without a harness error',
    expectedStatuses: [],
    networkError: fatal,
    startedAt: new Date().toISOString(),
    durationMs: 0,
    pass: false,
    failure: fatal,
  });
}

// ---------------------------------------------------------------------------
// Cleanup of all uniquely generated test data
// ---------------------------------------------------------------------------
for (const task of createdTasks) {
  await call({
    key: `cleanup-task-${task.id.slice(0, 8)}`,
    phase: 'Cleanup',
    endpoint: 'DELETE /api/v1/tasks/:taskId',
    name: `Cleanup task ${task.id}`,
    method: 'DELETE',
    path: `/api/v1/tasks/${task.id}`,
    org: task.org,
    status: [204, 404],
    expected: '204 if still present, 404 if already deleted',
    check: (r) =>
      r.status === 204
        ? r.raw === ''
          ? true
          : '204 response had a body'
        : messageIs('Task not found')(r),
  });
}
for (const project of createdProjects) {
  await call({
    key: `cleanup-project-${project.id.slice(0, 8)}`,
    phase: 'Cleanup',
    endpoint: 'DELETE /api/v1/projects/:id',
    name: `Cleanup project ${project.id}`,
    method: 'DELETE',
    path: `/api/v1/projects/${project.id}`,
    org: project.org,
    status: [204, 404],
    expected: '204 if still present, 404 if already deleted',
    check: (r) =>
      r.status === 204
        ? r.raw === ''
          ? true
          : '204 response had a body'
        : messageIs('Project not found')(r),
  });
}
await call({
  key: 'cleanup-verify-org-a-empty',
  phase: 'Cleanup',
  endpoint: 'GET /api/v1/projects',
  name: 'Verify no QA projects remain in org A',
  method: 'GET',
  path: '/api/v1/projects',
  org: ORG_A,
  status: 200,
  expected: '200 with an empty array',
  check: emptyArray,
});
await call({
  key: 'cleanup-verify-org-b-empty',
  phase: 'Cleanup',
  endpoint: 'GET /api/v1/projects',
  name: 'Verify no QA projects remain in org B',
  method: 'GET',
  path: '/api/v1/projects',
  org: ORG_B,
  status: 200,
  expected: '200 with an empty array',
  check: emptyArray,
});

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------
const passed = results.filter((result) => result.pass).length;
const failed = results.length - passed;
const generatedAt = new Date().toISOString();
const endpointRows = [...endpoints.values()]
  .sort((a, b) => a.endpoint.localeCompare(b.endpoint))
  .map((entry, index) => {
    const cases = results.filter((result) => result.endpoint === entry.endpoint);
    const endpointFailures = cases.filter((result) => !result.pass).length;
    return `| ${index + 1} | \`${entry.endpoint}\` | ${[...entry.methods].sort().join(', ')} | ${cases.length} | ${endpointFailures === 0 ? 'PASS' : `FAIL (${endpointFailures})`} |`;
  });

const report = [];
report.push('# TaskFlow API — HTTP QA Test Report');
report.push('');
report.push(`- **Generated:** ${generatedAt}`);
report.push(`- **Base URL:** \`${BASE}\``);
report.push(
  '- **Server startup:** local `npm run start` with `PORT=3100`; no application code was modified.',
);
report.push(
  `- **Test orgs:** \`${ORG_A}\` (A) and \`${ORG_B}\` (B), both randomly generated v4 UUIDs.`,
);
report.push(
  '- **Data safety:** all created projects/tasks used random QA-only keys and IDs; cleanup requests were sent at the end.',
);
report.push('');
report.push('## Summary');
report.push('');
report.push('| Metric | Count |');
report.push('| --- | ---: |');
report.push(`| Unique endpoints exercised | ${endpoints.size} |`);
report.push(`| Total test cases executed | ${results.length} |`);
report.push(`| Passed | ${passed} |`);
report.push(`| Failed | ${failed} |`);
report.push(
  `| Pass rate | ${results.length ? ((passed / results.length) * 100).toFixed(1) : '0.0'}% |`,
);
report.push('');
if (fatal) {
  report.push(`> **Harness warning:** ${fatal}`);
  report.push('');
}
report.push('## Endpoint coverage');
report.push('');
report.push('| # | Endpoint | Methods | Cases | Result |');
report.push('| ---: | --- | --- | ---: | --- |');
report.push(...endpointRows);
report.push('');
report.push('## Detailed test cases');
report.push('');
for (const r of results) {
  const relatedBugs = BUGS.filter((bug) => bug.evidenceKeys.includes(r.key))
    .map((bug) => bug.id)
    .join(', ');
  report.push(`### ${r.id} — ${r.name}`);
  report.push('');
  report.push(`- **Phase:** ${r.phase}`);
  report.push(`- **Endpoint:** \`${r.endpoint}\``);
  report.push(`- **Scenario:** ${r.name}`);
  report.push(`- **Actual request:** \`${r.method} ${r.url}\``);
  report.push('- **Request headers:**');
  report.push('```text');
  report.push(formatHeaders(r.requestHeaders));
  report.push('```');
  report.push('- **Request body:**');
  report.push('```json');
  report.push(r.requestBody ?? '(none)');
  report.push('```');
  report.push(`- **Expected response:** ${r.expected}`);
  report.push('- **Actual response:**');
  report.push('```text');
  report.push(responseSummary(r));
  report.push('```');
  report.push(`- **HTTP status code:** ${r.status} ${r.statusText}`);
  report.push(`- **Result:** ${r.pass ? 'PASS' : 'FAIL'}`);
  if (!r.pass) {
    report.push(
      `- **Explanation:** ${r.failure}${relatedBugs ? ` Related bug(s): ${relatedBugs}.` : ''}`,
    );
  } else if (relatedBugs) {
    report.push(`- **Related bug(s):** ${relatedBugs} (observed in this response).`);
  }
  report.push('');
}
report.push('## Bugs discovered');
report.push('');
if (BUGS.length === 0) {
  report.push('No bugs were identified.');
} else {
  for (const bug of BUGS) {
    const evidence = bug.evidenceKeys
      .map((key) => results.find((result) => result.key === key))
      .filter(Boolean);
    report.push(`### ${bug.id} — ${bug.title}`);
    report.push('');
    report.push(`- **Severity:** ${bug.severity}`);
    report.push(`- **Evidence cases:** ${evidence.map((item) => `${item.id} (${item.key})`).join(', ') || 'none observed'}`);
    report.push(`- **Files:** ${bug.files.map((file) => `\`${file}\``).join(', ')}`);
    report.push(`- **Explanation:** ${bug.explanation}`);
    if (evidence.length) {
      report.push('- **Observed responses:**');
      for (const item of evidence) {
        report.push(
          `  - ${item.id}: \`${item.method} ${item.url}\` → HTTP ${item.status}; ${item.bodyPretty.replace(/\s+/g, ' ').slice(0, 300)}`,
        );
      }
    }
    report.push('');
  }
}
report.push('## Untested scenarios and limitations');
report.push('');
for (const item of UNTESTED) {
  report.push(`- ${item}`);
}
report.push('');
report.push('## Notes on expectations');
report.push('');
report.push(
  '- Expectations were derived from the declared TypeScript types, the OrgId decorator, ParseUUIDPipe configuration, TasksService business rules, REST conventions and the startup route table.',
);
report.push(
  '- A case is marked PASS only after an actual HTTP response was received and asserted. FAIL means the observed status and/or body did not match the documented expectation.',
);
report.push(
  '- Setup, probing, negative and cleanup requests are all included in the case totals.',
);

writeFileSync(
  path.join(OUT_DIR, 'api-qa-results.json'),
  `${JSON.stringify(
    {
      generatedAt,
      baseUrl: BASE,
      run: RUN,
      orgA: ORG_A,
      orgB: ORG_B,
      summary: { endpoints: endpoints.size, total: results.length, passed, failed },
      untested: UNTESTED,
      bugs: BUGS,
      results,
    },
    null,
    2,
  )}\n`,
  'utf8',
);
writeFileSync(
  path.join(OUT_DIR, 'TaskFlow-API-Test-Report.md'),
  `${report.join('\n')}\n`,
  'utf8',
);
process.stdout.write(
  `QA run complete: ${results.length} cases, ${passed} passed, ${failed} failed, ${endpoints.size} endpoints. Report: ${path.join(OUT_DIR, 'TaskFlow-API-Test-Report.md')}\n`,
);
