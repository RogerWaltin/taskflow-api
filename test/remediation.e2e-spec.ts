import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

describe('Phase 1 bug remediation (e2e)', () => {
  const orgA = '33333333-3333-4333-8333-333333333333';
  const orgB = '44444444-4444-4444-8444-444444444444';
  const otherId = '55555555-5555-4555-8555-555555555555';
  let app: INestApplication<App>;

  const api = () => request(app.getHttpServer());

  async function createProject(
    org: string,
    key: string,
    name = key,
  ): Promise<{ id: string; key: string; updatedAt: string }> {
    const response = await api()
      .post('/api/v1/projects')
      .set('X-Org-Id', org)
      .send({ key, name })
      .expect(201);

    return {
      id: response.body.id,
      key: response.body.key,
      updatedAt: response.body.updatedAt,
    };
  }

  function createTask(
    org: string,
    projectId: string,
    body: object = { title: 'Task' },
  ) {
    return api()
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set('X-Org-Id', org)
      .send(body);
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ bodyParser: false });
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ---------------------------------------------------------------- BUG-01
  it('accepts valid project creation and rejects invalid request bodies', async () => {
    const valid = await api()
      .post('/api/v1/projects')
      .set('X-Org-Id', orgA)
      .send({ key: 'VAL01', name: 'Valid project', description: 'Details' })
      .expect(201);

    expect(valid.body).toMatchObject({
      key: 'VAL01',
      name: 'Valid project',
      description: 'Details',
      status: 'ACTIVE',
    });
    expect(valid.body).not.toHaveProperty('organizationId');
    expect(valid.body).not.toHaveProperty('nextTaskNumber');

    const invalidBodies = [
      {},
      { key: 'MISSING' },
      { name: 'No key' },
      { key: 'NUMDESC', name: 'Bad', description: 123 },
      [{ key: 'ARRAY', name: 'Bad' }],
      { key: 'RO', name: 'Bad', status: 'ARCHIVED', owner: 'x' },
      { key: 'INT', name: 'Bad', nextTaskNumber: 99 },
    ];

    for (const body of invalidBodies) {
      const response = await api()
        .post('/api/v1/projects')
        .set('X-Org-Id', orgA)
        .send(body)
        .expect(400);
      expect(response.body.statusCode).toBe(400);
    }

    await api()
      .post('/api/v1/projects')
      .set('X-Org-Id', orgA)
      .set('Content-Type', 'application/json')
      .send('null')
      .expect(400);
  });

  it('rejects invalid PATCH bodies but preserves BUG-03 field separation', async () => {
    const project = await createProject(orgA, 'PCH01');

    for (const body of [
      {},
      { key: 'CHANGED' },
      { name: null },
      { nextTaskNumber: 50 },
      [],
    ]) {
      await api()
        .patch(`/api/v1/projects/${project.id}`)
        .set('X-Org-Id', orgA)
        .send(body)
        .expect(400);
    }

    await api()
      .patch(`/api/v1/projects/${project.id}`)
      .set('X-Org-Id', orgA)
      .set('Content-Type', 'application/json')
      .send('null')
      .expect(400);

    const rejectedCounter = await api()
      .patch(`/api/v1/projects/${project.id}`)
      .set('X-Org-Id', orgA)
      .send({ nextTaskNumber: 50 })
      .expect(400);
    expect(JSON.stringify(rejectedCounter.body)).toContain('nextTaskNumber');

    const valid = await api()
      .patch(`/api/v1/projects/${project.id}`)
      .set('X-Org-Id', orgA)
      .send({ name: 'Renamed' })
      .expect(200);
    expect(valid.body).toMatchObject({ id: project.id, key: 'PCH01', name: 'Renamed' });
    expect(valid.body).not.toHaveProperty('nextTaskNumber');

    const first = await createTask(orgA, project.id, { title: 'One' });
    const second = await createTask(orgA, project.id, { title: 'Two' });
    expect(first.body).toMatchObject({ number: 1, key: 'PCH01-1' });
    expect(second.body).toMatchObject({ number: 2, key: 'PCH01-2' });
  });

  // ---------------------------------------------------------------- BUG-02
  it('returns 404 for missing, foreign and deleted projects on GET and PATCH', async () => {
    const project = await createProject(orgA, 'FIND1');

    const existing = await api()
      .get(`/api/v1/projects/${project.id}`)
      .set('X-Org-Id', orgA)
      .expect(200);
    expect(existing.body).toMatchObject({ id: project.id, key: 'FIND1' });

    for (const [id, org] of [
      [otherId, orgA],
      [project.id, orgB],
    ] as const) {
      const getResponse = await api()
        .get(`/api/v1/projects/${id}`)
        .set('X-Org-Id', org)
        .expect(404);
      expect(getResponse.body).toMatchObject({ statusCode: 404, message: 'Project not found' });

      const patchResponse = await api()
        .patch(`/api/v1/projects/${id}`)
        .set('X-Org-Id', org)
        .send({ name: 'Unauthorized change' })
        .expect(404);
      expect(patchResponse.body).toMatchObject({ statusCode: 404, message: 'Project not found' });
    }

    await api()
      .delete(`/api/v1/projects/${project.id}`)
      .set('X-Org-Id', orgA)
      .expect(204);

    const goneGet = await api()
      .get(`/api/v1/projects/${project.id}`)
      .set('X-Org-Id', orgA)
      .expect(404);
    expect(goneGet.body.message).toBe('Project not found');

    const gonePatch = await api()
      .patch(`/api/v1/projects/${project.id}`)
      .set('X-Org-Id', orgA)
      .send({ name: 'Nope' })
      .expect(404);
    expect(gonePatch.body.message).toBe('Project not found');
  });

  // ---------------------------------------------------------------- BUG-04
  it('changes updatedAt only for real project changes', async () => {
    const created = await createProject(orgA, 'TIME1');
    await api()
      .patch(`/api/v1/projects/${created.id}`)
      .set('X-Org-Id', orgA)
      .send({ description: 'Original description' })
      .expect(200);

    const initial = await api()
      .get(`/api/v1/projects/${created.id}`)
      .set('X-Org-Id', orgA)
      .expect(200);
    const initialTime = initial.body.updatedAt as string;

    await api()
      .patch(`/api/v1/projects/${created.id}`)
      .set('X-Org-Id', orgA)
      .send({})
      .expect(400);
    const afterRejected = await api()
      .get(`/api/v1/projects/${created.id}`)
      .set('X-Org-Id', orgA)
      .expect(200);
    expect(afterRejected.body.updatedAt).toBe(initialTime);

    const noOp = await api()
      .patch(`/api/v1/projects/${created.id}`)
      .set('X-Org-Id', orgA)
      .send({ name: 'TIME1', description: 'Original description', status: 'ACTIVE' })
      .expect(200);
    expect(noOp.body.updatedAt).toBe(initialTime);

    const renamed = await api()
      .patch(`/api/v1/projects/${created.id}`)
      .set('X-Org-Id', orgA)
      .send({ name: 'Renamed' })
      .expect(200);
    expect(renamed.body.name).toBe('Renamed');
    expect(new Date(renamed.body.updatedAt as string).getTime()).toBeGreaterThanOrEqual(
      new Date(initialTime).getTime(),
    );

    const described = await api()
      .patch(`/api/v1/projects/${created.id}`)
      .set('X-Org-Id', orgA)
      .send({ description: 'New description' })
      .expect(200);
    expect(described.body.description).toBe('New description');

    // The internal counter update driven by task creation still works.
    const task = await createTask(orgA, created.id, { title: 'Counter probe' })
      .expect(201);
    expect(task.body).toMatchObject({ number: 1, key: 'TIME1-1' });

    const archived = await api()
      .patch(`/api/v1/projects/${created.id}`)
      .set('X-Org-Id', orgA)
      .send({ status: 'ARCHIVED' })
      .expect(200);
    expect(archived.body.status).toBe('ARCHIVED');
  });

  // ---------------------------------------------------------------- BUG-05
  it('validates the project status filter and keeps valid filtering working', async () => {
    const active = await createProject(orgA, 'FLTA1');
    const archived = await createProject(orgA, 'FLTB1');
    await api()
      .patch(`/api/v1/projects/${archived.id}`)
      .set('X-Org-Id', orgA)
      .send({ status: 'ARCHIVED' })
      .expect(200);

    const all = await api().get('/api/v1/projects').set('X-Org-Id', orgA).expect(200);
    expect(all.body.data).toHaveLength(2);
    expect(all.body.meta).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    });

    const activeList = await api()
      .get('/api/v1/projects?status=ACTIVE')
      .set('X-Org-Id', orgA)
      .expect(200);
    expect(activeList.body.data.map((item: { id: string }) => item.id)).toEqual([active.id]);

    const archivedList = await api()
      .get('/api/v1/projects?status=ARCHIVED')
      .set('X-Org-Id', orgA)
      .expect(200);
    expect(archivedList.body.data.map((item: { id: string }) => item.id)).toEqual([archived.id]);

    for (const value of ['INVALID', 'active', '']) {
      const response = await api()
        .get(`/api/v1/projects?status=${value}`)
        .set('X-Org-Id', orgA)
        .expect(400);
      expect(JSON.stringify(response.body.message)).toContain(
        'status must be one of the following values',
      );
    }
  });

  // ---------------------------------------------------------------- BUG-06
  it('rejects unsupported task-list query keys while keeping supported filters', async () => {
    const project = await createProject(orgA, 'TSKQ1');
    const task = await createTask(orgA, project.id, {
      title: 'Filter target',
      priority: 'URGENT',
      assigneeId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
    expect(task.status).toBe(201);
    expect(task.body).not.toHaveProperty('organizationId');
    expect(task.body).not.toHaveProperty('nextTaskNumber');

    await api()
      .get(`/api/v1/projects/${project.id}/tasks`)
      .set('X-Org-Id', orgA)
      .expect(200)
      .expect(({ body }) => expect(body.data).toHaveLength(1));

    for (const query of [
      '?status=TODO',
      '?priority=URGENT',
      '?assigneeId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '?status=TODO&priority=URGENT&assigneeId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    ]) {
      await api()
        .get(`/api/v1/projects/${project.id}/tasks${query}`)
        .set('X-Org-Id', orgA)
        .expect(200)
        .expect(({ body }) => expect(body.data).toHaveLength(1));
    }

    const noMatches = await api()
      .get(`/api/v1/projects/${project.id}/tasks?status=DONE`)
      .set('X-Org-Id', orgA)
      .expect(200);
    expect(noMatches.body).toMatchObject({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    for (const query of [
      '?foo=bar',
      '?foo=bar&status=TODO',
      '?status=BANANA',
      '?priority=CRITICAL',
      '?status=',
      '?priority=',
    ]) {
      const response = await api()
        .get(`/api/v1/projects/${project.id}/tasks${query}`)
        .set('X-Org-Id', orgA)
        .expect(400);
      expect(response.body.statusCode).toBe(400);
    }
  });

  // ---------------------------------------------------------------- EP-02
  it('returns a usable Location header on successful task creation only', async () => {
    const project = await createProject(orgA, 'LOC01');

    const task = await createTask(orgA, project.id, { title: 'Located task' })
      .expect(201)
      .expect('Content-Type', /json/);
    expect(task.headers.location).toMatch(/^\/api\/v1\/tasks\/[0-9a-f-]+$/);

    const followed = await api()
      .get(task.headers.location as string)
      .set('X-Org-Id', orgA)
      .expect(200);
    expect(followed.body.id).toBe(task.body.id);
    expect(followed.body.key).toBe('LOC01-1');

    const failed = await createTask(orgA, otherId, { title: 'No project' }).expect(404);
    expect(failed.headers.location).toBeUndefined();
  });

  // ---------------------------------------------------------------- BUG-08
  it('preserves omitted task fields on PATCH', async () => {
    const project = await createProject(orgA, 'PTCH1');
    const created = await createTask(orgA, project.id, {
      title: 'Original title',
      description: 'Keep description',
      priority: 'HIGH',
      assigneeId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      dueDate: '2026-12-31T00:00:00Z',
    }).expect(201);

    await api()
      .patch(`/api/v1/tasks/${created.body.id}`)
      .set('X-Org-Id', orgA)
      .send({ title: null })
      .expect(400);

    const patched = await api()
      .patch(`/api/v1/tasks/${created.body.id}`)
      .set('X-Org-Id', orgA)
      .send({ title: 'Updated title' })
      .expect(200);
    expect(patched.body).toMatchObject({
      title: 'Updated title',
      description: 'Keep description',
      status: 'TODO',
      priority: 'HIGH',
      assigneeId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      dueDate: '2026-12-31T00:00:00Z',
    });

    const cleared = await api()
      .patch(`/api/v1/tasks/${created.body.id}`)
      .set('X-Org-Id', orgA)
      .send({ description: null })
      .expect(200);
    expect(cleared.body).toMatchObject({ description: null, title: 'Updated title' });
  });
});
