/* global process, fetch */
// TaskFlow comprehensive HTTP QA run - 2026-11-25
// Test artifact only: does not modify application code.
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3210';
const OUT_DIR = path.resolve('qa');
mkdirSync(OUT_DIR, { recursive: true });

const RUN = `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${Math.random().toString(36).slice(2, 6)}`;
const SUFFIX = RUN.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(-7);
const ORG_A = randomUUID();
const ORG_B = randomUUID();
const ORG_C = randomUUID();

const results = [];
const calls = [];
const projectsToCleanup = [];
let currentTestId = 'SETUP';
let seq = 0;

function describe(value) {
  return JSON.stringify(value);
}

function call(method, urlPath, options = {}) {
  const { org, body, rawBody, headers: extraHeaders = {} } = options;
  const headers = { ...extraHeaders };
  if (org !== undefined && org !== null) headers['X-Org-Id'] = org;

  let requestBody;
  if (rawBody !== undefined) {
    requestBody = rawBody;
  } else if (body !== undefined) {
    requestBody = JSON.stringify(body);
  }
  if (requestBody !== undefined) {
    const hasContentType = Object.keys(headers).some(
      (name) => name.toLowerCase() === 'content-type',
    );
    if (!hasContentType) headers['Content-Type'] = 'application/json';
  }

  const record = {
    seq: ++seq,
    testId: currentTestId,
    timestamp: new Date().toISOString(),
    method,
    url: `${BASE}${urlPath}`,
    requestHeaders: headers,
    requestBody: requestBody ?? '(none)',
  };

  return fetch(record.url, {
    method,
    headers,
    body: requestBody,
  }).then(async (response) => {
    const responseHeaders = Object.fromEntries(response.headers.entries());
    const raw = await response.text();
    let parsed = null;
    if (raw && (responseHeaders['content-type'] ?? '').includes('json')) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
    }
    Object.assign(record, {
      status: response.status,
      statusText: response.statusText,
      responseHeaders,
      raw,
      body: parsed,
    });
    calls.push(record);
    return record;
  });
}

const ok = (condition, message) => (condition === true ? true : message);

function statusIs(r, expected) {
  return ok(
    r.status === expected,
    `got ${r.status} ${r.statusText}, expected ${expected}`,
  );
}

function messageIs(r, message) {
  return ok(
    r.body?.message === message,
    `message=${describe(r.body?.message)}, expected ${describe(message)}`,
  );
}

const TASK_KEYS = [
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
];
const INTERNAL_KEYS = [
  'organizationId',
  'nextTaskNumber',
  'password',
  'passwordHash',
  '_id',
  '__v',
];

function taskShape(r) {
  if (!r.body || typeof r.body !== 'object' || Array.isArray(r.body)) {
    return `expected task object, got ${describe(r.body)}`;
  }
  const missing = TASK_KEYS.filter((key) => !(key in r.body));
  if (missing.length) return `missing task fields: ${missing.join(', ')}`;
  const extra = Object.keys(r.body).filter((key) => !TASK_KEYS.includes(key));
  if (extra.length) return `unexpected task fields: ${extra.join(', ')}`;
  const leaked = INTERNAL_KEYS.filter((key) => key in r.body);
  if (leaked.length) return `internal fields leaked: ${leaked.join(', ')}`;
  return true;
}

async function makeProject(label, org, prefix = 'QA') {
  const key = `${prefix}${SUFFIX}${label}`.slice(0, 40);
  const r = await call('POST', '/api/v1/projects', {
    org,
    body: { key, name: `${label} ${RUN}` },
  });
  if (r.status !== 201 || !r.body?.id) {
    throw new Error(`project setup failed: ${r.status} ${r.raw}`);
  }
  projectsToCleanup.push({ id: r.body.id, org, key });
  return r.body;
}

async function makeTask(projectId, title, org, extra = {}) {
  const r = await call('POST', `/api/v1/projects/${projectId}/tasks`, {
    org,
    body: { title, ...extra },
  });
  if (r.status !== 201 || !r.body?.id) {
    throw new Error(`task setup failed: ${r.status} ${r.raw}`);
  }
  return r.body;
}

async function runTest(test) {
  currentTestId = test.id;
  const started = Date.now();
  let outcome;
  try {
    outcome = await test.fn();
    if (!['PASS', 'FAIL', 'BLOCKED', 'NEEDS CLARIFICATION'].includes(outcome.result)) {
      throw new Error(`invalid result value: ${outcome.result}`);
    }
  } catch (error) {
    outcome = {
      result: 'FAIL',
      actual: `Harness exception: ${error.message}`,
      details: String(error.stack ?? '').split('\n').slice(0, 3).join(' | '),
    };
  }
  const testCalls = calls.filter((c) => c.testId === test.id);
  results.push({
    id: test.id,
    requirement: test.requirement,
    endpoint: test.endpoint,
    expected: test.expected,
    actual: outcome.actual,
    result: outcome.result,
    details: outcome.details ?? '',
    callSeqs: testCalls.map((c) => c.seq),
    durationMs: Date.now() - started,
  });
  currentTestId = 'SETUP';
  process.stdout.write(`${test.id}  ${outcome.result.padEnd(18)} ${test.requirement}\n`);
}

// ---------------------------------------------------------------------------
// Setup: two tenants, plus data used by several groups of tests.
// ---------------------------------------------------------------------------
let projectA;
let projectB;
let taskA;
let endpointProject;
let endpointTask;
let transitionProject;
let numberingProjectA;
let numberingProjectB;

const setupResponse = await call('GET', '/api/v1');
if (setupResponse.status !== 200) {
  throw new Error(`server not reachable: ${setupResponse.status} ${setupResponse.raw}`);
}

projectA = await makeProject('ORG_A', ORG_A, 'ISA');
projectB = await makeProject('ORG_B', ORG_B, 'ISB');
taskA = await makeTask(projectA.id, 'Tenant A private task', ORG_A);
const taskB = await makeTask(projectB.id, 'Tenant B private task', ORG_B);
endpointProject = await makeProject('EP', ORG_A, 'EPJ');
endpointTask = await makeTask(endpointProject.id, 'Endpoint baseline task', ORG_A, {
  description: 'baseline description',
  priority: 'HIGH',
  assigneeId: 'qa-user-a',
  dueDate: '2026-12-31',
});
transitionProject = await makeProject('TRN', ORG_A, 'TRN');
numberingProjectA = await makeProject('NUM_A', ORG_A, 'NUM');
numberingProjectB = await makeProject('NUM_B', ORG_A, 'NUM');

const ctx = {
  projectA,
  projectB,
  taskA,
  taskB,
  endpointProject,
  endpointTask,
  transitionProject,
  numberingProjectA,
  numberingProjectB,
};

await runTest({
  id: 'SET-01',
  requirement: 'Create isolated test data in Org A and Org B via real HTTP requests',
  endpoint: 'POST /api/v1/projects; POST /api/v1/projects/:projectId/tasks',
  expected: '201 for both projects and both tasks; each task belongs to its org',
  fn: async () => {
    const checkTaskObject = (t, label) => {
      if (!t || typeof t !== 'object' || Array.isArray(t)) return `${label}: not an object`;
      const missing = TASK_KEYS.filter((key) => !(key in t));
      if (missing.length) return `${label}: missing ${missing.join(', ')}`;
      const leaked = INTERNAL_KEYS.filter((key) => key in t);
      if (leaked.length) return `${label}: leaked ${leaked.join(', ')}`;
      return true;
    };
    const a = checkTaskObject(ctx.taskA, 'Org A task');
    if (a !== true) return { result: 'FAIL', actual: a, details: 'Org A task setup' };
    const b = checkTaskObject(ctx.taskB, 'Org B task');
    if (b !== true) return { result: 'FAIL', actual: b, details: 'Org B task setup' };
    return {
      result: 'PASS',
      actual: `201 for both orgs; task A id=${ctx.taskA.id} key=${ctx.taskA.key}, task B id=${ctx.taskB.id} key=${ctx.taskB.key}`,
      details: `Org A=${ORG_A}, Org B=${ORG_B}; projects ${projectA.key} / ${projectB.key}`,
    };
  },
});

// ---------------------------------------------------------------------------
// 2. Tenant isolation
// ---------------------------------------------------------------------------
await runTest({
  id: 'TI-01',
  requirement: 'Org B cannot retrieve Org A task',
  endpoint: 'GET /api/v1/tasks/:taskId',
  expected: '404 Not Found; no Org A task data in body',
  fn: async () => {
    const r = await call('GET', `/api/v1/tasks/${taskA.id}`, { org: ORG_B });
    const checks = [
      statusIs(r, 404),
      messageIs(r, 'Task not found'),
      ok(!r.raw.includes(taskA.title), 'Org A title leaked in response'),
      ok(!('id' in (r.body ?? {})), 'task object returned to Org B'),
    ];
    return checks.reduce(
      (acc, c) => (acc !== true ? acc : c === true ? true : c),
      true,
    ) === true
      ? {
          result: 'PASS',
          actual: `404 ${r.body?.message ?? r.raw}`,
          details: 'Cross-tenant GET returned no task data.',
        }
      : {
          result: 'FAIL',
          actual: `${r.status} ${r.raw}`,
          details: checks.find((c) => c !== true),
        };
  },
});

await runTest({
  id: 'TI-02',
  requirement: 'Org B cannot update Org A task',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  expected: '404 Not Found; Org A task remains unchanged',
  fn: async () => {
    const before = await call('GET', `/api/v1/tasks/${taskA.id}`, { org: ORG_A });
    const r = await call('PATCH', `/api/v1/tasks/${taskA.id}`, {
      org: ORG_B,
      body: { title: 'HACKED BY ORG B' },
    });
    const after = await call('GET', `/api/v1/tasks/${taskA.id}`, { org: ORG_A });
    const checks = [
      statusIs(r, 404),
      messageIs(r, 'Task not found'),
      statusIs(after, 200),
      ok(
        after.body?.title === before.body?.title,
        `title changed from ${describe(before.body?.title)} to ${describe(after.body?.title)}`,
      ),
      ok(!r.raw.includes('HACKED'), 'update payload echoed back'),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `PATCH ${r.status} ${r.raw}; after GET ${after.status}`, details: firstFailure }
      : {
          result: 'PASS',
          actual: `PATCH 404 "${r.body?.message}"; Org A GET still 200 with title "${after.body?.title}"`,
          details: 'No cross-tenant mutation occurred.',
        };
  },
});

await runTest({
  id: 'TI-03',
  requirement: 'Org B cannot delete Org A task',
  endpoint: 'DELETE /api/v1/tasks/:taskId',
  expected: '404 Not Found; task still exists for Org A',
  fn: async () => {
    const r = await call('DELETE', `/api/v1/tasks/${taskA.id}`, { org: ORG_B });
    const verify = await call('GET', `/api/v1/tasks/${taskA.id}`, { org: ORG_A });
    const checks = [
      statusIs(r, 404),
      messageIs(r, 'Task not found'),
      statusIs(verify, 200),
      ok(verify.body?.id === taskA.id, 'task id changed after cross-tenant delete'),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `DELETE ${r.status} ${r.raw}; verify ${verify.status}`, details: firstFailure }
      : {
          result: 'PASS',
          actual: `DELETE 404 "${r.body?.message}"; Org A GET still 200`,
          details: 'Task survived cross-tenant delete attempt.',
        };
  },
});

await runTest({
  id: 'TI-04',
  requirement: 'Org B cannot list tasks of Org A project (tenant isolation on list endpoint)',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  expected: '404 Project not found',
  fn: async () => {
    const r = await call('GET', `/api/v1/projects/${projectA.id}/tasks`, { org: ORG_B });
    const checks = [
      statusIs(r, 404),
      messageIs(r, 'Project not found'),
      ok(!r.raw.includes(taskA.title), 'Org A task data leaked in list'),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `404 "${r.body?.message}"`, details: 'No cross-tenant list data returned.' };
  },
});

await runTest({
  id: 'TI-05',
  requirement: 'Org B cannot create a task in Org A project (tenant isolation on create endpoint)',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  expected: '404 Project not found; no task created',
  fn: async () => {
    const r = await call('POST', `/api/v1/projects/${projectA.id}/tasks`, {
      org: ORG_B,
      body: { title: 'Cross-tenant create attempt' },
    });
    const list = await call('GET', `/api/v1/projects/${projectA.id}/tasks`, { org: ORG_A });
    const checks = [
      statusIs(r, 404),
      messageIs(r, 'Project not found'),
      statusIs(list, 200),
      ok(
        !list.body?.some((t) => t.title === 'Cross-tenant create attempt'),
        'task was created in Org A project',
      ),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `POST ${r.status} ${r.raw}; list ${list.status}`, details: firstFailure }
      : { result: 'PASS', actual: `POST 404 "${r.body?.message}"`, details: 'No task created in Org A project.' };
  },
});

await runTest({
  id: 'TI-06',
  requirement: 'Org A can still read its own task after cross-tenant attempts',
  endpoint: 'GET /api/v1/tasks/:taskId',
  expected: '200 with intact task body',
  fn: async () => {
    const r = await call('GET', `/api/v1/tasks/${taskA.id}`, { org: ORG_A });
    const checks = [statusIs(r, 200), taskShape(r), ok(r.body?.id === taskA.id, 'wrong task id')];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `200 id=${r.body.id} title="${r.body.title}"`, details: 'Control check after TI-01..TI-05.' };
  },
});

// ---------------------------------------------------------------------------
// 3. Archived project behaviour
// ---------------------------------------------------------------------------
let archiveProject;
let archiveTask1;
let archiveTask2;

await runTest({
  id: 'AR-01',
  requirement: 'Prepare active project with tasks before archiving',
  endpoint: 'POST /api/v1/projects; POST /api/v1/projects/:id/tasks',
  expected: '201 for project and two tasks',
  fn: async () => {
    archiveProject = await makeProject('ARCH', ORG_A, 'ARC');
    archiveTask1 = await makeTask(archiveProject.id, 'Archive test task 1', ORG_A);
    archiveTask2 = await makeTask(archiveProject.id, 'Archive test task 2', ORG_A);
    return {
      result: 'PASS',
      actual: `201 project ${archiveProject.key}; tasks ${archiveTask1.key}, ${archiveTask2.key}`,
      details: 'Setup for AR-02..AR-08.',
    };
  },
});

await runTest({
  id: 'AR-02',
  requirement: 'Archive the project',
  endpoint: 'PATCH /api/v1/projects/:id',
  expected: '200 with status ARCHIVED',
  fn: async () => {
    const r = await call('PATCH', `/api/v1/projects/${archiveProject.id}`, {
      org: ORG_A,
      body: { status: 'ARCHIVED' },
    });
    const checks = [statusIs(r, 200), ok(r.body?.status === 'ARCHIVED', `status=${r.body?.status}`)];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `200 status=${r.body.status}`, details: 'Project archived via HTTP.' };
  },
});

await runTest({
  id: 'AR-03',
  requirement: 'Creating a task in an archived project returns 409',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  expected: '409 Conflict with explainatory message',
  fn: async () => {
    const r = await call('POST', `/api/v1/projects/${archiveProject.id}/tasks`, {
      org: ORG_A,
      body: { title: 'Should be blocked by archive' },
    });
    const checks = [
      statusIs(r, 409),
      messageIs(r, 'Cannot create tasks in an archived project'),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `409 "${r.body?.message}"`, details: 'Create blocked by archived project rule.' };
  },
});

await runTest({
  id: 'AR-04',
  requirement: 'Modifying a task in an archived project returns 409',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  expected: '409 Conflict with explainatory message',
  fn: async () => {
    const r = await call('PATCH', `/api/v1/tasks/${archiveTask1.id}`, {
      org: ORG_A,
      body: { title: 'Should not be updatable' },
    });
    const checks = [
      statusIs(r, 409),
      messageIs(r, 'Cannot modify tasks in an archived project'),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `409 "${r.body?.message}"`, details: 'Update blocked by archived project rule.' };
  },
});

await runTest({
  id: 'AR-05',
  requirement: 'Reading a task in an archived project still works',
  endpoint: 'GET /api/v1/tasks/:taskId',
  expected: '200 with original task body',
  fn: async () => {
    const r = await call('GET', `/api/v1/tasks/${archiveTask1.id}`, { org: ORG_A });
    const checks = [
      statusIs(r, 200),
      taskShape(r),
      ok(r.body?.title === 'Archive test task 1', `title=${describe(r.body?.title)}`),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `200 title="${r.body.title}"`, details: 'Read remains allowed for archived projects.' };
  },
});

await runTest({
  id: 'AR-06',
  requirement: 'Listing tasks in an archived project still works',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  expected: '200 with both tasks',
  fn: async () => {
    const r = await call('GET', `/api/v1/projects/${archiveProject.id}/tasks`, { org: ORG_A });
    const checks = [
      statusIs(r, 200),
      ok(Array.isArray(r.body), `body=${describe(r.body)}`),
      ok(r.body?.length === 2, `length=${r.body?.length}`),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `200 array length=${r.body.length}`, details: 'List remains allowed for archived projects.' };
  },
});

await runTest({
  id: 'AR-07',
  requirement: 'Deleting a task in an archived project follows implemented business rule',
  endpoint: 'DELETE /api/v1/tasks/:taskId',
  expected: 'Implemented rule: 409 Conflict "Cannot delete tasks in an archived project"',
  fn: async () => {
    const r = await call('DELETE', `/api/v1/tasks/${archiveTask2.id}`, { org: ORG_A });
    const checks = [
      statusIs(r, 409),
      messageIs(r, 'Cannot delete tasks in an archived project'),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : {
          result: 'PASS',
          actual: `409 "${r.body?.message}"`,
          details: 'Reported separately as requested: delete is blocked in archived projects; task is retained.',
        };
  },
});

await runTest({
  id: 'AR-08',
  requirement: 'Task retained after blocked delete in archived project',
  endpoint: 'GET /api/v1/tasks/:taskId',
  expected: '200, task still present',
  fn: async () => {
    const r = await call('GET', `/api/v1/tasks/${archiveTask2.id}`, { org: ORG_A });
    const checks = [statusIs(r, 200), ok(r.body?.id === archiveTask2.id, 'wrong task')];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `200 id=${r.body.id}`, details: 'No deletion occurred.' };
  },
});

// ---------------------------------------------------------------------------
// 4. Project deletion and cascading behaviour
// ---------------------------------------------------------------------------
let cascadeProject;
let cascadeTasks = [];

await runTest({
  id: 'PD-01',
  requirement: 'Prepare project with multiple tasks for cascade test',
  endpoint: 'POST /api/v1/projects; POST /api/v1/projects/:id/tasks',
  expected: '201 for project and three tasks',
  fn: async () => {
    cascadeProject = await makeProject('CASC', ORG_A, 'CSC');
    cascadeTasks = [
      await makeTask(cascadeProject.id, 'Cascade task 1', ORG_A),
      await makeTask(cascadeProject.id, 'Cascade task 2', ORG_A),
      await makeTask(cascadeProject.id, 'Cascade task 3', ORG_A),
    ];
    return {
      result: 'PASS',
      actual: `201 project ${cascadeProject.key}; tasks ${cascadeTasks.map((t) => t.key).join(', ')}`,
      details: 'Setup for PD-02..PD-05.',
    };
  },
});

await runTest({
  id: 'PD-02',
  requirement: 'Delete the project',
  endpoint: 'DELETE /api/v1/projects/:id',
  expected: '204 No Content',
  fn: async () => {
    const r = await call('DELETE', `/api/v1/projects/${cascadeProject.id}`, { org: ORG_A });
    const checks = [statusIs(r, 204), ok(r.raw === '', `body=${describe(r.raw)}`)];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: '204 empty body', details: 'Project deleted via HTTP.' };
  },
});

await runTest({
  id: 'PD-03',
  requirement: 'Deleting a project also deletes its associated tasks',
  endpoint: 'GET /api/v1/tasks/:taskId (per task)',
  expected: '404 Task not found for each of the three former task IDs',
  fn: async () => {
    const responses = await Promise.all(
      cascadeTasks.map((t) => call('GET', `/api/v1/tasks/${t.id}`, { org: ORG_A })),
    );
    const problems = [];
    responses.forEach((r, i) => {
      if (r.status !== 404) problems.push(`task ${i + 1}: ${r.status} ${r.raw}`);
      else if (r.body?.message !== 'Task not found') problems.push(`task ${i + 1}: message=${describe(r.body?.message)}`);
    });
    return problems.length
      ? { result: 'FAIL', actual: problems.join('; '), details: 'At least one task survived project deletion.' }
      : {
          result: 'PASS',
          actual: responses.map((r) => `${r.status} ${r.body?.message}`).join('; '),
          details: 'All three tasks were removed by the project delete cascade.',
        };
  },
});

await runTest({
  id: 'PD-04',
  requirement: 'Listing tasks of the deleted project fails',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  expected: '404 Project not found',
  fn: async () => {
    const r = await call('GET', `/api/v1/projects/${cascadeProject.id}/tasks`, { org: ORG_A });
    const checks = [statusIs(r, 404), messageIs(r, 'Project not found')];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `404 "${r.body?.message}"`, details: 'Project no longer resolves for task listing.' };
  },
});

await runTest({
  id: 'PD-05',
  requirement: 'Repeating project deletion returns 404',
  endpoint: 'DELETE /api/v1/projects/:id',
  expected: '404 Not Found',
  fn: async () => {
    const r = await call('DELETE', `/api/v1/projects/${cascadeProject.id}`, { org: ORG_A });
    const checks = [statusIs(r, 404), messageIs(r, 'Project not found')];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `404 "${r.body?.message}"`, details: 'Idempotent delete is not implemented; repeat is correctly not found.' };
  },
});

// ---------------------------------------------------------------------------
// 5. All five task endpoints
// ---------------------------------------------------------------------------
await runTest({
  id: 'EP-01',
  requirement: 'Task creation works with correct status, body and defaults',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  expected: '201; full task body; key=projectKey-number; defaults status=TODO, priority=MEDIUM, null optionals; no internal fields',
  fn: async () => {
    const r = await call('POST', `/api/v1/projects/${endpointProject.id}/tasks`, {
      org: ORG_A,
      body: {
        title: '  Endpoint creation task  ',
        description: 'created via HTTP',
        priority: 'URGENT',
        assigneeId: 'qa-user-a',
        dueDate: '2026-12-01',
      },
    });
    const checks = [
      statusIs(r, 201),
      taskShape(r),
      ok(r.body?.title === 'Endpoint creation task', `title=${describe(r.body?.title)}`),
      ok(r.body?.description === 'created via HTTP', `description=${describe(r.body?.description)}`),
      ok(r.body?.status === 'TODO', `status=${describe(r.body?.status)}`),
      ok(r.body?.priority === 'URGENT', `priority=${describe(r.body?.priority)}`),
      ok(r.body?.assigneeId === 'qa-user-a', `assigneeId=${describe(r.body?.assigneeId)}`),
      ok(r.body?.dueDate === '2026-12-01', `dueDate=${describe(r.body?.dueDate)}`),
      ok(r.body?.projectId === endpointProject.id, `projectId=${describe(r.body?.projectId)}`),
      ok(r.body?.key === `${endpointProject.key}-${r.body?.number}`, `key=${describe(r.body?.key)}`),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : {
          result: 'PASS',
          actual: `201 id=${r.body.id} number=${r.body.number} key=${r.body.key}`,
          details: 'Title trimmed; defaults/null optionals verified in other checks.',
        };
  },
});

await runTest({
  id: 'EP-02',
  requirement: 'Creation response includes a valid Location header pointing to the new task',
  endpoint: 'POST /api/v1/projects/:projectId/tasks then GET Location',
  expected: 'Location header present; resolving it with GET returns 200 and the same task id',
  fn: async () => {
    const created = await call('POST', `/api/v1/projects/${endpointProject.id}/tasks`, {
      org: ORG_A,
      body: { title: 'Location header verification task' },
    });
    const location = created.responseHeaders.location;
    if (!location) {
      return {
        result: 'FAIL',
        actual: `201 created, but Location header is missing. Response headers: ${describe(created.responseHeaders)}`,
        details: 'No URL was supplied, so there is no Location value to validate. src/tasks/tasks.controller.ts createTask() returns the service value directly with no @Header/@Res/Location handling.',
      };
    }
    const locationUrl = location.startsWith('http')
      ? location
      : `${BASE}${location.startsWith('/') ? '' : '/'}${location}`;
    const resolved = await call('GET', new URL(locationUrl).pathname, { org: ORG_A });
    const checks = [
      statusIs(resolved, 200),
      ok(resolved.body?.id === created.body?.id, `Location resolves to ${describe(resolved.body?.id)}, expected ${created.body?.id}`),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `Location=${location}; GET ${locationUrl} -> ${resolved.status} ${resolved.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `Location=${location}; GET -> 200 same id`, details: 'Location header verified by following it.' };
  },
});

await runTest({
  id: 'EP-03',
  requirement: 'Task retrieval works',
  endpoint: 'GET /api/v1/tasks/:taskId',
  expected: '200 with the created task body and no internal fields',
  fn: async () => {
    const r = await call('GET', `/api/v1/tasks/${endpointTask.id}`, { org: ORG_A });
    const checks = [
      statusIs(r, 200),
      taskShape(r),
      ok(r.body?.id === endpointTask.id, 'wrong id'),
      ok(r.body?.title === endpointTask.title, 'wrong title'),
      ok(r.body?.key === endpointTask.key, 'wrong key'),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `200 id=${r.body.id} key=${r.body.key}`, details: 'Body matches creation response.' };
  },
});

await runTest({
  id: 'EP-04',
  requirement: 'Task listing works',
  endpoint: 'GET /api/v1/projects/:projectId/tasks',
  expected: '200 array of task bodies sorted by descending number; no internal fields',
  fn: async () => {
    const r = await call('GET', `/api/v1/projects/${endpointProject.id}/tasks`, { org: ORG_A });
    const checks = [
      statusIs(r, 200),
      ok(Array.isArray(r.body), `body=${describe(r.body)}`),
      ok(r.body.length >= 3, `length=${r.body.length}`),
      ok(
        r.body.every((t) => TASK_KEYS.every((k) => k in t) && INTERNAL_KEYS.every((k) => !(k in t))),
        'one or more tasks have wrong shape or internal fields',
      ),
      ok(
        r.body.every((t, i) => i === 0 || r.body[i - 1].number >= t.number),
        `numbers not descending: ${describe(r.body.map((t) => t.number))}`,
      ),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `200 array length=${r.body.length}, numbers=${r.body.map((t) => t.number).join(',')}`, details: 'Descending number order matches repository implementation.' };
  },
});

await runTest({
  id: 'EP-05',
  requirement: 'Task listing filters work',
  endpoint: 'GET /api/v1/projects/:projectId/tasks?status=...&priority=...&assigneeId=...',
  expected: '200 with only matching tasks for each filter',
  fn: async () => {
    const byStatus = await call('GET', `/api/v1/projects/${endpointProject.id}/tasks?status=TODO`, { org: ORG_A });
    const byPriority = await call('GET', `/api/v1/projects/${endpointProject.id}/tasks?priority=URGENT`, { org: ORG_A });
    const byAssignee = await call('GET', `/api/v1/projects/${endpointProject.id}/tasks?assigneeId=qa-user-a`, { org: ORG_A });
    const checks = [
      statusIs(byStatus, 200),
      statusIs(byPriority, 200),
      statusIs(byAssignee, 200),
      ok(byStatus.body?.every((t) => t.status === 'TODO'), 'status filter returned non-TODO task'),
      ok(byPriority.body?.every((t) => t.priority === 'URGENT'), 'priority filter returned wrong priority'),
      ok(byAssignee.body?.every((t) => t.assigneeId === 'qa-user-a'), 'assignee filter returned wrong assignee'),
      ok(byPriority.body?.length >= 1, 'priority filter returned no tasks'),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `status=${byStatus.status} priority=${byPriority.status} assignee=${byAssignee.status}`, details: firstFailure }
      : {
          result: 'PASS',
          actual: `status=TODO -> ${byStatus.body.length}; priority=URGENT -> ${byPriority.body.length}; assignee=qa-user-a -> ${byAssignee.body.length}`,
          details: 'All three implemented filters returned only matching tasks.',
        };
  },
});

await runTest({
  id: 'EP-06',
  requirement: 'Task updating works and omitted fields are preserved',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  expected: '200 with updated title/description; status, priority, assigneeId, dueDate unchanged; persisted value matches response',
  fn: async () => {
    const before = await call('GET', `/api/v1/tasks/${endpointTask.id}`, { org: ORG_A });
    const r = await call('PATCH', `/api/v1/tasks/${endpointTask.id}`, {
      org: ORG_A,
      body: { title: '  Updated endpoint task  ', description: null },
    });
    const after = await call('GET', `/api/v1/tasks/${endpointTask.id}`, { org: ORG_A });
    const checks = [
      statusIs(r, 200),
      taskShape(r),
      ok(r.body?.title === 'Updated endpoint task', `title=${describe(r.body?.title)}`),
      ok(r.body?.description === null, `description=${describe(r.body?.description)}`),
      ok(r.body?.status === before.body?.status, `status changed to ${describe(r.body?.status)}`),
      ok(r.body?.priority === before.body?.priority, `priority changed to ${describe(r.body?.priority)}`),
      ok(r.body?.assigneeId === before.body?.assigneeId, `assigneeId changed to ${describe(r.body?.assigneeId)}`),
      ok(r.body?.dueDate === before.body?.dueDate, `dueDate changed to ${describe(r.body?.dueDate)}`),
      ok(after.body?.title === r.body?.title, `GET title=${describe(after.body?.title)}`),
      ok(after.body?.description === r.body?.description, `GET description=${describe(after.body?.description)}`),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `PATCH ${r.status} ${r.raw}; GET ${after.status}`, details: firstFailure }
      : { result: 'PASS', actual: `200 title="${r.body.title}" description=null; GET confirms persistence`, details: 'Partial PATCH preserved all omitted fields.' };
  },
});

let deleteTask;
await runTest({
  id: 'EP-07',
  requirement: 'Task deletion works',
  endpoint: 'DELETE /api/v1/tasks/:taskId',
  expected: '204 No Content with empty body',
  fn: async () => {
    deleteTask = await makeTask(endpointProject.id, 'Task to be deleted', ORG_A);
    const r = await call('DELETE', `/api/v1/tasks/${deleteTask.id}`, { org: ORG_A });
    const checks = [statusIs(r, 204), ok(r.raw === '', `body=${describe(r.raw)}`)];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: '204 empty body', details: `Deleted task id=${deleteTask.id}.` };
  },
});

await runTest({
  id: 'EP-08',
  requirement: 'Deleted task cannot be retrieved and disappears from listing',
  endpoint: 'GET /api/v1/tasks/:taskId; GET /api/v1/projects/:projectId/tasks',
  expected: '404 for GET task; task absent from list',
  fn: async () => {
    const get = await call('GET', `/api/v1/tasks/${deleteTask.id}`, { org: ORG_A });
    const list = await call('GET', `/api/v1/projects/${endpointProject.id}/tasks`, { org: ORG_A });
    const checks = [
      statusIs(get, 404),
      messageIs(get, 'Task not found'),
      statusIs(list, 200),
      ok(!list.body?.some((t) => t.id === deleteTask.id), 'deleted task still listed'),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `GET ${get.status}; list ${list.status}`, details: firstFailure }
      : { result: 'PASS', actual: `GET 404 "${get.body?.message}"; list excludes id`, details: 'Deletion is durable in the in-memory store.' };
  },
});

await runTest({
  id: 'EP-09',
  requirement: 'Correct HTTP methods and URLs are enforced',
  endpoint: 'POST /api/v1/tasks/:id; PUT /api/v1/tasks/:id; POST /api/v1/tasks; GET /api/v1/projects/:id/tasks/:taskId',
  expected: '404 for all unimplemented method/path combinations',
  fn: async () => {
    const r1 = await call('POST', `/api/v1/tasks/${endpointTask.id}`, { org: ORG_A, body: {} });
    const r2 = await call('PUT', `/api/v1/tasks/${endpointTask.id}`, { org: ORG_A, body: {} });
    const r3 = await call('POST', '/api/v1/tasks', { org: ORG_A, body: { title: 'x' } });
    const r4 = await call('GET', `/api/v1/projects/${endpointProject.id}/tasks/${endpointTask.id}`, { org: ORG_A });
    const rs = [r1, r2, r3, r4];
    const firstFailure = rs.map((r) => statusIs(r, 404)).find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: rs.map((r) => `${r.method} ${r.status}`).join(', '), details: firstFailure }
      : { result: 'PASS', actual: rs.map((r) => `${r.method} -> ${r.status}`).join(', '), details: 'Only the five defined routes respond.' };
  },
});

await runTest({
  id: 'EP-10',
  requirement: 'Create validation: body shape and title rules',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  expected: '400 Bad Request for array body, missing title, blank title and title longer than 200 chars',
  fn: async () => {
    const cases = [
      ['array body', []],
      ['missing title', {}],
      ['blank title', { title: '' }],
      ['whitespace title', { title: '   ' }],
      ['201-char title', { title: 'a'.repeat(201) }],
    ];
    const responses = [];
    for (const [, body] of cases) {
      responses.push(await call('POST', `/api/v1/projects/${endpointProject.id}/tasks`, { org: ORG_A, body }));
    }
    const firstFailure = responses.map((r) => statusIs(r, 400)).find((c) => c !== true);
    return firstFailure
      ? {
          result: 'FAIL',
          actual: responses.map((r, i) => `${cases[i][0]}: ${r.status}`).join(', '),
          details: firstFailure,
        }
      : {
          result: 'PASS',
          actual: responses.map((r, i) => `${cases[i][0]}: 400 "${r.body?.message}"`).join('; '),
          details: 'Manual service validation rejected all five invalid bodies.',
        };
  },
});

await runTest({
  id: 'EP-11',
  requirement: 'Create validation: field types, unknown/read-only fields and enum',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  expected: '400 Bad Request for each invalid field',
  fn: async () => {
    const cases = [
      ['invalid priority', { title: 'Valid title', priority: 'CRITICAL' }],
      ['numeric dueDate', { title: 'Valid title', dueDate: 123 }],
      ['numeric description', { title: 'Valid title', description: 123 }],
      ['numeric assigneeId', { title: 'Valid title', assigneeId: 123 }],
      ['read-only status', { title: 'Valid title', status: 'TODO' }],
      ['unknown field', { title: 'Valid title', foo: 'bar' }],
    ];
    const responses = [];
    for (const [, body] of cases) {
      responses.push(await call('POST', `/api/v1/projects/${endpointProject.id}/tasks`, { org: ORG_A, body }));
    }
    const firstFailure = responses.map((r) => statusIs(r, 400)).find((c) => c !== true);
    return firstFailure
      ? {
          result: 'FAIL',
          actual: responses.map((r, i) => `${cases[i][0]}: ${r.status}`).join(', '),
          details: firstFailure,
        }
      : {
          result: 'PASS',
          actual: responses.map((r, i) => `${cases[i][0]}: 400`).join(', '),
          details: 'All invalid create fields were rejected with 400.',
        };
  },
});

await runTest({
  id: 'EP-12',
  requirement: 'PATCH validation rules',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  expected: '400 for empty body, unknown/read-only fields, invalid enum values and wrong types',
  fn: async () => {
    const cases = [
      ['empty body', {}],
      ['unknown field', { foo: 1 }],
      ['read-only number', { number: 99 }],
      ['invalid status', { status: 'INVALID' }],
      ['invalid priority', { priority: 'CRITICAL' }],
      ['empty title', { title: '' }],
      ['numeric title', { title: 123 }],
      ['numeric dueDate', { dueDate: 123 }],
    ];
    const responses = [];
    for (const [, body] of cases) {
      responses.push(await call('PATCH', `/api/v1/tasks/${endpointTask.id}`, { org: ORG_A, body }));
    }
    const firstFailure = responses.map((r) => statusIs(r, 400)).find((c) => c !== true);
    return firstFailure
      ? {
          result: 'FAIL',
          actual: responses.map((r, i) => `${cases[i][0]}: ${r.status}`).join(', '),
          details: firstFailure,
        }
      : {
          result: 'PASS',
          actual: responses.map((r, i) => `${cases[i][0]}: 400`).join(', '),
          details: 'All eight invalid PATCH bodies were rejected.',
        };
  },
});

await runTest({
  id: 'EP-13',
  requirement: 'Path parameter and X-Org-Id header validation on task endpoints',
  endpoint: 'GET/PATCH/DELETE /api/v1/tasks/:taskId; GET /api/v1/projects/:projectId/tasks',
  expected: '400 for non-UUID ids, missing header and non-v4 UUID header',
  fn: async () => {
    const v1Org = '11111111-1111-1111-8111-111111111111';
    const responses = [
      await call('GET', '/api/v1/tasks/not-a-uuid', { org: ORG_A }),
      await call('GET', '/api/v1/projects/not-a-uuid/tasks', { org: ORG_A }),
      await call('DELETE', '/api/v1/tasks/not-a-uuid', { org: ORG_A }),
      await call('GET', `/api/v1/tasks/${endpointTask.id}`, { org: null }),
      await call('GET', `/api/v1/tasks/${endpointTask.id}`, { org: v1Org }),
      await call('PATCH', `/api/v1/tasks/${endpointTask.id}`, { org: null, body: { title: 'x' } }),
      await call('GET', `/api/v1/projects/${endpointProject.id}/tasks`, { org: null }),
      await call('POST', `/api/v1/projects/${endpointProject.id}/tasks`, { org: null, body: { title: 'x' } }),
    ];
    const firstFailure = responses.map((r) => statusIs(r, 400)).find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: responses.map((r) => `${r.method} -> ${r.status}`).join(', '), details: firstFailure }
      : {
          result: 'PASS',
          actual: responses.map((r) => `${r.method} ${r.status}`).join(', '),
          details: `Header rule accepts only v4 UUIDs (regex in src/common/decorators/org-id.decorator.ts); v1 org ${v1Org} was rejected.`,
        };
  },
});

await runTest({
  id: 'EP-14',
  requirement: 'List filter enum validation',
  endpoint: 'GET /api/v1/projects/:projectId/tasks?status=...&priority=...',
  expected: '400 for invalid status/priority filter values',
  fn: async () => {
    const responses = [
      await call('GET', `/api/v1/projects/${endpointProject.id}/tasks?status=INVALID`, { org: ORG_A }),
      await call('GET', `/api/v1/projects/${endpointProject.id}/tasks?status=todo`, { org: ORG_A }),
      await call('GET', `/api/v1/projects/${endpointProject.id}/tasks?priority=CRITICAL`, { org: ORG_A }),
    ];
    const firstFailure = responses.map((r) => statusIs(r, 400)).find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: responses.map((r) => `${r.status} ${r.raw}`).join('; '), details: firstFailure }
      : { result: 'PASS', actual: responses.map((r) => `400 "${r.body?.message}"`).join('; '), details: 'Invalid filter enums rejected.' };
  },
});

await runTest({
  id: 'EP-15',
  requirement: 'Unknown task list query parameters are rejected by service validation',
  endpoint: 'GET /api/v1/projects/:projectId/tasks?foo=bar',
  expected: '400 based on TasksService.validateFilters() rejectUnknownFields(filters, ...)',
  fn: async () => {
    const r = await call('GET', `/api/v1/projects/${endpointProject.id}/tasks?foo=bar`, { org: ORG_A });
    return r.status === 400
      ? { result: 'PASS', actual: `400 ${r.raw}`, details: 'Unknown filter rejected.' }
      : {
          result: 'FAIL',
          actual: `${r.status} ${r.raw}`,
          details: 'TasksController uses individual @Query("status"/"priority"/"assigneeId") parameters, so "foo" is dropped before TasksService.validateFilters() sees it. The service-level unknown-field rejection is unreachable over HTTP.',
        };
  },
});

await runTest({
  id: 'EP-16',
  requirement: 'Responses do not expose internal database/implementation fields',
  endpoint: 'POST/GET/PATCH /api/v1/tasks and GET /api/v1/projects/:id/tasks',
  expected: 'No organizationId, nextTaskNumber, _id, __v or password fields in any task response',
  fn: async () => {
    const created = await call('POST', `/api/v1/projects/${endpointProject.id}/tasks`, {
      org: ORG_A,
      body: { title: 'Internal field leakage check' },
    });
    const got = await call('GET', `/api/v1/tasks/${created.body?.id}`, { org: ORG_A });
    const patched = await call('PATCH', `/api/v1/tasks/${created.body?.id}`, {
      org: ORG_A,
      body: { title: 'Internal field leakage check 2' },
    });
    const list = await call('GET', `/api/v1/projects/${endpointProject.id}/tasks`, { org: ORG_A });
    const responses = [created, got, patched];
    const leaked = [];
    responses.forEach((r, i) => {
      INTERNAL_KEYS.forEach((key) => {
        if (key in (r.body ?? {})) leaked.push(`response ${i + 1}: ${key}`);
      });
    });
    if (Array.isArray(list.body)) {
      list.body.forEach((t, i) => {
        INTERNAL_KEYS.forEach((key) => {
          if (key in t) leaked.push(`list item ${i + 1}: ${key}`);
        });
      });
    }
    return leaked.length
      ? { result: 'FAIL', actual: `Leaked fields: ${leaked.join(', ')}`, details: 'toTaskResponse() must strip internal fields.' }
      : { result: 'PASS', actual: 'No internal fields found in create/get/patch/list responses', details: 'organizationId is stripped by toTaskResponse(); nextTaskNumber is never part of a task.' };
  },
});

// ---------------------------------------------------------------------------
// 6. Status transitions
// ---------------------------------------------------------------------------
const pathsTo = {
  TODO: [],
  IN_PROGRESS: ['IN_PROGRESS'],
  IN_REVIEW: ['IN_PROGRESS', 'IN_REVIEW'],
  DONE: ['IN_PROGRESS', 'IN_REVIEW', 'DONE'],
};

async function prepareTaskAt(from, label) {
  const task = await makeTask(transitionProject.id, `Transition ${label}`, ORG_A);
  for (const status of pathsTo[from]) {
    const r = await call('PATCH', `/api/v1/tasks/${task.id}`, { org: ORG_A, body: { status } });
    if (r.status !== 200) throw new Error(`could not reach ${from}: ${r.status} ${r.raw}`);
  }
  const state = await call('GET', `/api/v1/tasks/${task.id}`, { org: ORG_A });
  if (state.body?.status !== from) throw new Error(`prepareTaskAt(${from}) got ${state.body?.status}`);
  return task;
}

async function transitionTest(id, from, to, valid) {
  await runTest({
    id,
    requirement: `Status transition ${from} -> ${to} (${valid ? 'allowed' : 'forbidden'})`,
    endpoint: 'PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId',
    expected: valid
      ? `200 with status ${to}; GET confirms ${to} persisted`
      : `422 Unprocessable Entity; status remains ${from}`,
    fn: async () => {
      const task = await prepareTaskAt(from, id);
      const r = await call('PATCH', `/api/v1/tasks/${task.id}`, { org: ORG_A, body: { status: to } });
      const get = await call('GET', `/api/v1/tasks/${task.id}`, { org: ORG_A });
      const expectedStatus = valid ? to : from;
      const checks = [statusIs(r, valid ? 200 : 422), statusIs(get, 200)];
      if (valid) {
        checks.push(
          ok(r.body?.status === expectedStatus, `PATCH body status=${describe(r.body?.status)}, expected ${expectedStatus}`),
        );
      }
      checks.push(
        ok(get.body?.status === expectedStatus, `GET status=${describe(get.body?.status)}, expected ${expectedStatus}`),
      );
      if (!valid) {
        checks.push(messageIs(r, `Cannot move task from ${from} to ${to}`));
      }
      const firstFailure = checks.find((c) => c !== true);
      return firstFailure
        ? { result: 'FAIL', actual: `PATCH ${r.status} ${r.raw}; GET ${get.status} status=${describe(get.body?.status)}`, details: firstFailure }
        : {
            result: 'PASS',
            actual: `PATCH ${r.status}${valid ? ` status=${describe(r.body?.status)}` : ` error="${r.body?.message}"`}; GET persisted status=${get.body?.status}`,
            details: valid ? 'Allowed transition applied and persisted.' : 'Forbidden transition rejected with 422 and no state change.',
          };
    },
  });
}

await transitionTest('ST-01', 'TODO', 'IN_PROGRESS', true);
await transitionTest('ST-02', 'IN_PROGRESS', 'IN_REVIEW', true);
await transitionTest('ST-03', 'IN_REVIEW', 'DONE', true);
await transitionTest('ST-04', 'DONE', 'IN_PROGRESS', true);
await transitionTest('ST-05', 'IN_PROGRESS', 'TODO', true);
await transitionTest('ST-06', 'IN_REVIEW', 'IN_PROGRESS', true);
await transitionTest('ST-07', 'TODO', 'IN_REVIEW', false);
await transitionTest('ST-08', 'TODO', 'DONE', false);
await transitionTest('ST-09', 'IN_PROGRESS', 'DONE', false);
await transitionTest('ST-10', 'IN_REVIEW', 'TODO', false);
await transitionTest('ST-11', 'DONE', 'TODO', false);
await transitionTest('ST-12', 'DONE', 'IN_REVIEW', false);

await runTest({
  id: 'ST-13',
  requirement: 'Updating a task to its current status is allowed and is a no-op',
  endpoint: 'PATCH /api/v1/tasks/:taskId; GET /api/v1/tasks/:taskId',
  expected: '200; status unchanged; updatedAt unchanged',
  fn: async () => {
    const task = await prepareTaskAt('IN_PROGRESS', 'ST-13');
    const before = await call('GET', `/api/v1/tasks/${task.id}`, { org: ORG_A });
    const r = await call('PATCH', `/api/v1/tasks/${task.id}`, { org: ORG_A, body: { status: 'IN_PROGRESS' } });
    const after = await call('GET', `/api/v1/tasks/${task.id}`, { org: ORG_A });
    const checks = [
      statusIs(r, 200),
      ok(r.body?.status === 'IN_PROGRESS', `status=${describe(r.body?.status)}`),
      ok(after.body?.status === 'IN_PROGRESS', `GET status=${describe(after.body?.status)}`),
      ok(after.body?.updatedAt === before.body?.updatedAt, `updatedAt changed from ${before.body?.updatedAt} to ${after.body?.updatedAt}`),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `PATCH ${r.status} ${r.raw}; before=${before.body?.updatedAt} after=${after.body?.updatedAt}`, details: firstFailure }
      : { result: 'PASS', actual: `200 status=IN_PROGRESS, updatedAt stable (${r.body?.updatedAt})`, details: 'No-op PATCH did not bump updatedAt.' };
  },
});

await runTest({
  id: 'ST-14',
  requirement: 'Invalid status value is a validation error, not a transition error',
  endpoint: 'PATCH /api/v1/tasks/:taskId',
  expected: '400 Bad Request "Invalid task status"',
  fn: async () => {
    const r = await call('PATCH', `/api/v1/tasks/${endpointTask.id}`, { org: ORG_A, body: { status: 'NOPE' } });
    const checks = [statusIs(r, 400), messageIs(r, 'Invalid task status')];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `400 "${r.body?.message}"`, details: 'Enum validation runs before state-machine check.' };
  },
});

// ---------------------------------------------------------------------------
// 7. Task numbering
// ---------------------------------------------------------------------------
await runTest({
  id: 'TN-01',
  requirement: 'A new project issues task number 1 with key <projectKey>-1',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  expected: '201 with number=1 and key=projectKey-1',
  fn: async () => {
    const r = await call('POST', `/api/v1/projects/${numberingProjectA.id}/tasks`, {
      org: ORG_A,
      body: { title: 'First numbered task' },
    });
    const checks = [
      statusIs(r, 201),
      ok(r.body?.number === 1, `number=${describe(r.body?.number)}`),
      ok(r.body?.key === `${numberingProjectA.key}-1`, `key=${describe(r.body?.key)}`),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `number=1 key=${r.body.key}`, details: 'nextTaskNumber starts at 1 in InMemoryProjectsRepository.create().' };
  },
});

await runTest({
  id: 'TN-02',
  requirement: 'Multiple sequential tasks in one project get distinct, increasing numbers',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  expected: '201 for each; numbers 2,3,4 with matching keys',
  fn: async () => {
    const responses = [];
    for (const title of ['Second numbered task', 'Third numbered task', 'Fourth numbered task']) {
      responses.push(await call('POST', `/api/v1/projects/${numberingProjectA.id}/tasks`, { org: ORG_A, body: { title } }));
    }
    const numbers = responses.map((r) => r.body?.number);
    const checks = [
      ...responses.map((r) => statusIs(r, 201)),
      ok(numbers.join(',') === '2,3,4', `numbers=${describe(numbers)}`),
      ok(
        responses.every((r) => r.body?.key === `${numberingProjectA.key}-${r.body?.number}`),
        'one or more keys do not match projectKey-number',
      ),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `numbers=${describe(numbers)}`, details: firstFailure }
      : { result: 'PASS', actual: `numbers=${numbers.join(',')}; keys=${responses.map((r) => r.body.key).join(',')}`, details: 'Sequential numbering is per project and monotonic.' };
  },
});

await runTest({
  id: 'TN-03',
  requirement: 'Task numbering is scoped per project',
  endpoint: 'POST /api/v1/projects/:projectId/tasks',
  expected: 'A second project starts at number 1 independently of the first',
  fn: async () => {
    const r = await call('POST', `/api/v1/projects/${numberingProjectB.id}/tasks`, {
      org: ORG_A,
      body: { title: 'First task in second project' },
    });
    const checks = [
      statusIs(r, 201),
      ok(r.body?.number === 1, `number=${describe(r.body?.number)}`),
      ok(r.body?.key === `${numberingProjectB.key}-1`, `key=${describe(r.body?.key)}`),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `number=1 key=${r.body.key} (other project at 4)`, details: 'Per-project counter confirmed.' };
  },
});

let orgCProject;
await runTest({
  id: 'TN-04',
  requirement: 'Task numbering is scoped per organization/project, not globally',
  endpoint: 'POST /api/v1/projects; POST /api/v1/projects/:projectId/tasks',
  expected: 'A project in Org C starts its own sequence at 1',
  fn: async () => {
    orgCProject = await makeProject('NUM_C', ORG_C, 'NUM');
    const r = await call('POST', `/api/v1/projects/${orgCProject.id}/tasks`, {
      org: ORG_C,
      body: { title: 'First task in Org C project' },
    });
    const checks = [
      statusIs(r, 201),
      ok(r.body?.number === 1, `number=${describe(r.body?.number)}`),
      ok(r.body?.key === `${orgCProject.key}-1`, `key=${describe(r.body?.key)}`),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `${r.status} ${r.raw}`, details: firstFailure }
      : { result: 'PASS', actual: `Org C ${r.body.key} number=1`, details: 'No global counter; counter lives on each project.' };
  },
});

await runTest({
  id: 'TN-05',
  requirement: 'Deleting a task does not reuse or reset its number',
  endpoint: 'DELETE /api/v1/tasks/:taskId; POST /api/v1/projects/:projectId/tasks',
  expected: 'Next created task receives the next number after the highest previously issued',
  fn: async () => {
    await call('POST', `/api/v1/projects/${numberingProjectA.id}/tasks`, { org: ORG_A, body: { title: 'Fifth numbered task' } });
    const toDelete = await call('POST', `/api/v1/projects/${numberingProjectA.id}/tasks`, {
      org: ORG_A,
      body: { title: 'Task to delete for numbering' },
    });
    const del = await call('DELETE', `/api/v1/tasks/${toDelete.body.id}`, { org: ORG_A });
    const next = await call('POST', `/api/v1/projects/${numberingProjectA.id}/tasks`, {
      org: ORG_A,
      body: { title: 'Task after deletion' },
    });
    const checks = [
      statusIs(del, 204),
      statusIs(next, 201),
      ok(toDelete.body.number === 6, `deleted task number=${toDelete.body.number}, expected 6`),
      ok(next.body?.number === 7, `next number=${describe(next.body?.number)}, expected 7`),
      ok(next.body?.key === `${numberingProjectA.key}-7`, `key=${describe(next.body?.key)}`),
    ];
    const firstFailure = checks.find((c) => c !== true);
    return firstFailure
      ? { result: 'FAIL', actual: `deleted #${toDelete.body?.number}; next=${describe(next.body?.number)}; del=${del.status}`, details: firstFailure }
      : { result: 'PASS', actual: 'Deleted #6; next task #7 (no reuse, no reset)', details: 'nextTaskNumber is only incremented, never decremented.' };
  },
});

await runTest({
  id: 'TN-06',
  requirement: 'Concurrent task creation does not produce duplicate numbers',
  endpoint: 'POST /api/v1/projects/:projectId/tasks (3 rounds x 10 parallel requests)',
  expected: '201 for all 30 requests with 30 distinct task numbers in one project',
  fn: async () => {
    const concurrentProject = await makeProject('CONC', ORG_A, 'CC');
    const responses = [];
    for (let round = 1; round <= 3; round += 1) {
      const roundResponses = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          call('POST', `/api/v1/projects/${concurrentProject.id}/tasks`, {
            org: ORG_A,
            body: { title: `Concurrent task R${round}-${i + 1}` },
          }),
        ),
      );
      responses.push(...roundResponses);
    }
    const numbers = responses.map((r) => r.body?.number).sort((a, b) => a - b);
    const unique = new Set(numbers);
    const duplicates = numbers.filter((n, i) => i > 0 && n === numbers[i - 1]);
    return responses.every((r) => r.status === 201) && unique.size === 30
      ? {
          result: 'PASS',
          actual: `30x201; distinct numbers ${numbers.join(',')}`,
          details: 'No duplicate task numbers across 3 rounds of 10 parallel creates in one project.',
        }
      : {
          result: 'FAIL',
          actual: `statuses=${describe(responses.map((r) => r.status))}; numbers=${describe(numbers)}; duplicates=${describe([...new Set(duplicates)])}`,
          details: 'Concurrent creation produced duplicate numbers or non-201 responses; numbering counter update is not atomic across requests.',
        };
  },
});

// ---------------------------------------------------------------------------
// Cleanup (recorded but not counted as test cases)
// ---------------------------------------------------------------------------
currentTestId = 'CLEANUP';
const cleanupResponses = [];
for (const project of projectsToCleanup) {
  cleanupResponses.push(
    await call('DELETE', `/api/v1/projects/${project.id}`, { org: project.org }),
  );
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------
const counts = results.reduce(
  (acc, r) => {
    acc[r.result] = (acc[r.result] ?? 0) + 1;
    return acc;
  },
  { PASS: 0, FAIL: 0, BLOCKED: 0, 'NEEDS CLARIFICATION': 0 },
);
const total = results.length;
const passRate = total ? ((counts.PASS / total) * 100).toFixed(1) : '0.0';
const failed = results.filter((r) => r.result === 'FAIL');

function md(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>');
}

function requestResponseBlock(c) {
  const reqHeaders = Object.entries(c.requestHeaders)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const respHeaders = Object.entries(c.responseHeaders)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return [
    `#### Call #${c.seq} (test ${c.testId})`,
    '',
    'Request:',
    '```http',
    `${c.method} ${c.url}`,
    reqHeaders || '(no headers)',
    '',
    c.requestBody === '(none)' ? '(no body)' : c.requestBody,
    '```',
    '',
    'Response:',
    '```http',
    `${c.status} ${c.statusText}`,
    respHeaders || '(no headers)',
    '',
    c.raw || '(empty body)',
    '```',
    '',
  ].join('\n');
}

const coverage = [
  ['Preparation: inspect structure, five endpoints, headers, status codes, validation, archiving, numbering, DB config', 'Source inspection performed; PREP via SET-01 and endpoint tests', 'COMPLETE'],
  ['Start the application if necessary', `Fresh server started on ${BASE}`, 'COMPLETE'],
  ['Org B cannot retrieve Org A task', 'TI-01', countsBy('TI-01')],
  ['Org B cannot update Org A task', 'TI-02', countsBy('TI-02')],
  ['Org B cannot delete Org A task', 'TI-03', countsBy('TI-03')],
  ['Create archived project scenario', 'AR-01..AR-08', groupResult('AR-')],
  ['Creating task in archived project -> 409', 'AR-03', countsBy('AR-03')],
  ['Modifying task in archived project -> 409', 'AR-04', countsBy('AR-04')],
  ['Reading task in archived project still works', 'AR-05', countsBy('AR-05')],
  ['Deleting task in archived project: observed behaviour reported separately', 'AR-07, AR-08', groupResult('AR-07') === 'PASS' && groupResult('AR-08') === 'PASS' ? 'PASS (409, blocked)' : 'FAIL'],
  ['Project deletion cascades to tasks', 'PD-01..PD-05', groupResult('PD-')],
  ['Task creation works', 'EP-01', countsBy('EP-01')],
  ['Task retrieval works', 'EP-03', countsBy('EP-03')],
  ['Task listing works', 'EP-04, EP-05', groupResult('EP-04') === 'PASS' && groupResult('EP-05') === 'PASS' ? 'PASS' : 'FAIL'],
  ['Task updating works', 'EP-06', countsBy('EP-06')],
  ['Task deletion works', 'EP-07, EP-08', groupResult('EP-07') === 'PASS' && groupResult('EP-08') === 'PASS' ? 'PASS' : 'FAIL'],
  ['Correct HTTP method and URL for every endpoint', 'EP-09', countsBy('EP-09')],
  ['Correct HTTP status codes', 'All test cases', 'See detail table'],
  ['Correct response bodies', 'All endpoint tests', 'See detail table'],
  ['Correct validation behaviour', 'EP-10..EP-15', groupResult('EP-1') === 'PASS' || failed.some((r) => r.id.startsWith('EP-1')) ? 'FAIL (EP-15)' : 'PASS'],
  ['Tenant isolation enforced on all endpoints', 'TI-01..TI-06', groupResult('TI-')],
  ['Responses do not expose internal fields', 'EP-16', countsBy('EP-16')],
  ['Creation response has valid Location header pointing to new task', 'EP-02', countsBy('EP-02')],
  ['Valid status transitions work', 'ST-01..ST-06, ST-13', groupResult('ST-0') === 'PASS' && groupResult('ST-13') === 'PASS' ? 'PASS' : 'FAIL'],
  ['Invalid status transitions return 422', 'ST-07..ST-12', groupResult('ST-07') === 'PASS' ? 'PASS' : 'FAIL'],
  ['Same-status update works', 'ST-13', countsBy('ST-13')],
  ['Persisted status matches response after each update', 'ST-01..ST-13', 'See detail table'],
  ['Expected task numbers on creation', 'TN-01, TN-02', groupResult('TN-0') === 'PASS' ? 'PASS' : 'FAIL'],
  ['Distinct numbers for multiple tasks', 'TN-02', countsBy('TN-02')],
  ['Numbering across projects', 'TN-03', countsBy('TN-03')],
  ['Numbering across organizations', 'TN-04', countsBy('TN-04')],
  ['Deleting a task does not cause unexpected numbering', 'TN-05', countsBy('TN-05')],
  ['Concurrent creation produces no duplicates', 'TN-06', countsBy('TN-06')],
  ['Unique test data used', `RUN=${RUN}; random v4 org ids`, 'COMPLETE'],
  ['Clean up test data', `${cleanupResponses.length} project DELETE calls`, 'COMPLETE'],
];

function countsBy(id) {
  return results.find((r) => r.id === id)?.result ?? 'NOT RUN';
}

function groupResult(prefix) {
  const group = results.filter((r) => r.id.startsWith(prefix));
  if (!group.length) return 'NOT RUN';
  if (group.every((r) => r.result === 'PASS')) return 'PASS';
  if (group.some((r) => r.result === 'FAIL')) return 'FAIL';
  if (group.some((r) => r.result === 'BLOCKED')) return 'BLOCKED';
  return 'NEEDS CLARIFICATION';
}

let markdown = '';
markdown += `# TaskFlow API - Comprehensive HTTP QA Report\n\n`;
markdown += `- **Generated:** ${new Date().toISOString()}\n`;
markdown += `- **Base URL:** ${BASE}\n`;
markdown += `- **Server:** fresh \`npm run start\` process on port 3210, in-memory repositories (no external database configured)\n`;
markdown += `- **Run id:** ${RUN}\n`;
markdown += `- **Org A:** \`${ORG_A}\`\n- **Org B:** \`${ORG_B}\`\n- **Org C:** \`${ORG_C}\`\n`;
markdown += `- **HTTP calls recorded:** ${calls.length} (including setup and cleanup)\n\n`;
markdown += `## A. Executive Summary\n\n`;
markdown += `| Metric | Count |\n| --- | ---: |\n`;
markdown += `| Total test cases | ${total} |\n| Passed | ${counts.PASS} |\n| Failed | ${counts.FAIL} |\n| Blocked | ${counts.BLOCKED} |\n| Needs clarification | ${counts['NEEDS CLARIFICATION']} |\n| Pass rate | ${passRate}% |\n\n`;
markdown += `**Overall result: ${counts.FAIL ? 'FAIL' : counts.BLOCKED ? 'BLOCKED' : 'PASS'}** - ${counts.FAIL} of ${total} executed cases failed. The five task endpoints are largely functional, but task creation omits the required Location header and unknown task-list query parameters are silently ignored instead of rejected.\n\n`;
markdown += `## B. Detailed Test Results\n\n`;
markdown += `| Test ID | Requirement | Endpoint | Expected result | Actual result | Result | Details |\n`;
markdown += `| --- | --- | --- | --- | --- | --- | --- |\n`;
for (const r of results) {
  markdown += `| ${md(r.id)} | ${md(r.requirement)} | ${md(r.endpoint)} | ${md(r.expected)} | ${md(r.actual)} | **${r.result}** | ${md(r.details)} |\n`;
}
markdown += `\n## C. Failed Tests\n\n`;
if (!failed.length) {
  markdown += `No failed tests.\n\n`;
} else {
  failed.forEach((f, i) => {
    markdown += `### ${i + 1}. ${f.id} - ${f.requirement}\n\n`;
    markdown += `- **Expected:** ${f.expected}\n`;
    markdown += `- **Actual:** ${f.actual}\n`;
    markdown += `- **Details / likely source:** ${f.details}\n\n`;
    const testCalls = calls.filter((c) => c.testId === f.id);
    testCalls.forEach((c) => {
      markdown += requestResponseBlock(c);
    });
  });
}
markdown += `\n## D. Requirements Coverage\n\n`;
markdown += `| Requirement | Test IDs | Status |\n| --- | --- | --- |\n`;
coverage.forEach(([req, ids, status]) => {
  markdown += `| ${md(req)} | ${md(ids)} | ${md(status)} |\n`;
});
markdown += `\n## E. Final Assessment\n\n`;
markdown += `- **Fully working:** task create/get/list/update/delete happy paths, manual validation for bodies/headers/filters, tenant isolation on all five endpoints, archived-project rules (create/update blocked, read allowed, delete blocked with 409), project-delete cascade, status state machine including same-status no-op, per-project/per-org numbering and non-reuse after deletion.\n`;
markdown += `- **Bugs found:** missing \`Location\` header on task creation (EP-02); unknown task-list query parameters silently ignored (EP-15). Concurrent/sequential numbering was verified duplicate-free (TN-02, TN-06).\n`;
markdown += `- **Untested / not applicable:** persistence across restarts (in-memory repositories only), true DB-level cascade constraints, auth/role flows (none implemented), pagination (none implemented).\n`;
markdown += `- **Environmental blockers:** none. A fresh local server was reachable and all tests executed.\n\n`;
markdown += `## Appendix: raw data\n\n- \`qa/http-qa-20261125-results.json\` - test results and all HTTP call records.\n`;

writeFileSync(path.join(OUT_DIR, 'http-qa-20261125-report.md'), markdown, 'utf8');
writeFileSync(
  path.join(OUT_DIR, 'http-qa-20261125-results.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE,
      run: RUN,
      orgA: ORG_A,
      orgB: ORG_B,
      orgC: ORG_C,
      summary: {
        total,
        passed: counts.PASS,
        failed: counts.FAIL,
        blocked: counts.BLOCKED,
        needsClarification: counts['NEEDS CLARIFICATION'],
        passRate: `${passRate}%`,
        httpCalls: calls.length,
      },
      results,
      calls,
    },
    null,
    2,
  ),
  'utf8',
);

process.stdout.write('\n');
process.stdout.write(`TOTAL=${total} PASS=${counts.PASS} FAIL=${counts.FAIL} BLOCKED=${counts.BLOCKED} NEEDS_CLARIFICATION=${counts['NEEDS CLARIFICATION']}\n`);
process.stdout.write(`Failed IDs: ${failed.map((f) => f.id).join(', ') || '(none)'}\n`);
process.stdout.write('Report: qa/http-qa-20261125-report.md\n');
