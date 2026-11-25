/* global process, fetch, console */
/* eslint-disable no-console */
// Baseline HTTP reproduction for the Phase 1 remediation assignment.
// Test artifact only: does not modify application code.
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3301';
const OUT_FILE = process.env.OUT_FILE ?? 'qa/remediation-baseline-results.json';
const ORG = randomUUID();
const OTHER_ORG = randomUUID();
const PREFIX = '/api/v1';
const suffix = randomUUID().slice(0, 8).toUpperCase();

async function call(method, urlPath, { org = ORG, body, raw } = {}) {
  const headers = { 'X-Org-Id': org };
  let payload;
  if (raw !== undefined) {
    payload = raw;
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
  }
  if (payload !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${BASE}${urlPath}`, {
    method,
    headers,
    body: payload,
  });
  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return {
    status: response.status,
    body: parsed,
    location: response.headers.get('location'),
  };
}

const results = [];
function record(id, scenario, expected, response, note = '') {
  results.push({
    id,
    scenario,
    expected,
    actual: response.status,
    location: response.location ?? null,
    result: expected === response.status ? 'PASS' : 'FAIL',
    note,
    body: response.body,
  });
  console.log(
    `${id.padEnd(8)} ${String(response.status).padEnd(4)} expected=${String(expected).padEnd(4)} ${scenario}${response.location ? ` Location=${response.location}` : ''}`,
  );
}

// --- BUG-01: create validation -------------------------------------------------
record('B01-01', 'valid create', 201, await call('POST', `${PREFIX}/projects`, { body: { key: `BASE${suffix}`, name: 'Baseline project' } }));
record('B01-02', 'create with empty body', 400, await call('POST', `${PREFIX}/projects`, { body: {} }));
record('B01-03', 'create with key only', 400, await call('POST', `${PREFIX}/projects`, { body: { key: `BASE${suffix}X` } }));
record('B01-04', 'create with numeric description', 400, await call('POST', `${PREFIX}/projects`, { body: { key: `BASE${suffix}D`, name: 'Bad description', description: 123 } }));
record('B01-05', 'create with array body', 400, await call('POST', `${PREFIX}/projects`, { raw: JSON.stringify([{ key: 'ARR', name: 'Array' }]) }));
record('B01-06', 'create with read-only fields', 400, await call('POST', `${PREFIX}/projects`, { body: { key: `BASE${suffix}R`, name: 'Read-only', status: 'ARCHIVED', owner: 'someone' } }));

const created = await call('POST', `${PREFIX}/projects`, { body: { key: `BASE${suffix}W`, name: 'Workflow project' } });
const projectId = created.body.id;

// --- BUG-02: missing project ---------------------------------------------------
const missingId = randomUUID();
record('B02-01', 'GET existing project', 200, await call('GET', `${PREFIX}/projects/${projectId}`));
record('B02-02', 'GET nonexistent project', 404, await call('GET', `${PREFIX}/projects/${missingId}`));
record('B02-03', 'GET foreign-org project', 404, await call('GET', `${PREFIX}/projects/${projectId}`, { org: OTHER_ORG }));
record('B02-04', 'PATCH nonexistent project', 404, await call('PATCH', `${PREFIX}/projects/${missingId}`, { body: { name: 'Nope' } }));
record('B02-05', 'PATCH foreign-org project', 404, await call('PATCH', `${PREFIX}/projects/${projectId}`, { org: OTHER_ORG, body: { name: 'Nope' } }));

// --- BUG-01 / BUG-04: PATCH semantics -----------------------------------------
record('B01-07', 'PATCH empty body', 400, await call('PATCH', `${PREFIX}/projects/${projectId}`, { body: {} }));
record('B01-08', 'PATCH key (immutable)', 400, await call('PATCH', `${PREFIX}/projects/${projectId}`, { body: { key: 'CHANGED' } }));
record('B01-09', 'PATCH internal counter', 400, await call('PATCH', `${PREFIX}/projects/${projectId}`, { body: { nextTaskNumber: 50 } }));

const before = await call('GET', `${PREFIX}/projects/${projectId}`);
const same = await call('PATCH', `${PREFIX}/projects/${projectId}`, { body: { name: before.body.name } });
const afterSame = await call('GET', `${PREFIX}/projects/${projectId}`);
console.log(
  `B04-01  same-name PATCH updatedAt: ${before.body.updatedAt} -> ${afterSame.body.updatedAt} (${before.body.updatedAt === afterSame.body.updatedAt ? 'STABLE' : 'CHANGED'}) status=${same.status}`,
);
record('B01-10', 'valid partial PATCH', 200, await call('PATCH', `${PREFIX}/projects/${projectId}`, { body: { name: 'Renamed baseline project' } }));

// --- BUG-05: project status filter --------------------------------------------
record('B05-01', 'list without filter', 200, await call('GET', `${PREFIX}/projects`));
record('B05-02', 'list status=ACTIVE', 200, await call('GET', `${PREFIX}/projects?status=ACTIVE`));
record('B05-03', 'list status=ARCHIVED', 200, await call('GET', `${PREFIX}/projects?status=ARCHIVED`));
record('B05-04', 'list status=INVALID', 400, await call('GET', `${PREFIX}/projects?status=INVALID`));
record('B05-05', 'list status=active', 400, await call('GET', `${PREFIX}/projects?status=active`));
record('B05-06', 'list status= (empty)', 400, await call('GET', `${PREFIX}/projects?status=`));

// --- BUG-06: unknown task query ------------------------------------------------
record('B06-01', 'task list no filters', 200, await call('GET', `${PREFIX}/projects/${projectId}/tasks`));
record('B06-02', 'task list unknown foo', 400, await call('GET', `${PREFIX}/projects/${projectId}/tasks?foo=bar`));
record('B06-03', 'task list foo + status', 400, await call('GET', `${PREFIX}/projects/${projectId}/tasks?foo=bar&status=TODO`));
record('B06-04', 'task list invalid status', 400, await call('GET', `${PREFIX}/projects/${projectId}/tasks?status=BANANA`));

// --- EP-02: Location header ----------------------------------------------------
const task = await call('POST', `${PREFIX}/projects/${projectId}/tasks`, { body: { title: 'Baseline task' } });
results.push({ id: 'EP-02', scenario: 'task create has Location header', expected: 'present', actual: task.location ?? 'absent', result: task.location ? 'PASS' : 'FAIL', body: task.body });
console.log(`EP-02   task create Location: ${task.location ?? 'absent'}`);
if (task.location) {
  record('EP-02-F', 'follow Location', 200, await call('GET', task.location));
  const followed = await call('GET', task.location);
  console.log(
    `EP-02-F  followed task id matches created id: ${followed.body?.id === task.body?.id}`,
  );
}
const failedTask = await call('POST', `${PREFIX}/projects/${randomUUID()}/tasks`, {
  body: { title: 'Should fail' },
});
console.log(
  `EP-02-N  failed task create status=${failedTask.status} Location=${failedTask.location ?? 'absent'}`,
);

// --- BUG-08: sparse task PATCH -------------------------------------------------
const fullTask = await call('POST', `${PREFIX}/projects/${projectId}/tasks`, {
  body: {
    title: 'Full task',
    description: 'Keep description',
    priority: 'HIGH',
    assigneeId: 'qa-user-a',
    dueDate: '2026-12-31',
  },
});
const patchedTask = await call('PATCH', `${PREFIX}/tasks/${fullTask.body.id}`, {
  body: { title: 'Renamed only' },
});
console.log(
  `B08-01  sparse PATCH status=${patchedTask.status} body=${JSON.stringify(patchedTask.body)}`,
);

// --- BUG-02: deleted project ---------------------------------------------------
await call('DELETE', `${PREFIX}/projects/${projectId}`);
record('B02-06', 'GET deleted project', 404, await call('GET', `${PREFIX}/projects/${projectId}`));
record('B02-07', 'PATCH deleted project', 404, await call('PATCH', `${PREFIX}/projects/${projectId}`, { body: { name: 'Nope' } }));

writeFileSync(OUT_FILE, JSON.stringify({ base: BASE, org: ORG, otherOrg: OTHER_ORG, results }, null, 2));
console.log(`\nWrote ${OUT_FILE} (${results.length} records)`);
