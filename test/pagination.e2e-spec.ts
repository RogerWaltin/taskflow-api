import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';

import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

describe('paginated list responses (e2e)', () => {
  const orgId = '11111111-1111-4111-8111-111111111111';
  let app: INestApplication<App>;

  const api = () => request(app.getHttpServer());

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication({ bodyParser: false });
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('paginates projects and returns empty data for a past-end page', async () => {
    for (let index = 1; index <= 57; index += 1) {
      await api()
        .post('/api/v1/projects')
        .set('X-Org-Id', orgId)
        .send({ key: `P${index}`, name: `Project ${index}` })
        .expect(201);
    }

    for (const [page, count] of [
      [1, 20],
      [2, 20],
      [3, 17],
      [4, 0],
    ]) {
      const response = await api()
        .get(`/api/v1/projects?page=${page}&limit=20`)
        .set('X-Org-Id', orgId)
        .expect(200);

      expect(response.body.data).toHaveLength(count);
      expect(response.body.meta).toEqual({
        page,
        limit: 20,
        total: 57,
        totalPages: 3,
      });
    }

    const noResults = await api()
      .get('/api/v1/projects?status=ARCHIVED&page=1&limit=20')
      .set('X-Org-Id', orgId)
      .expect(200);
    expect(noResults.body).toEqual({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    await api()
      .get('/api/v1/projects?page=0&limit=20')
      .set('X-Org-Id', orgId)
      .expect(400);

    await api()
      .get('/api/v1/projects?page=1&limit=101')
      .set('X-Org-Id', orgId)
      .expect(400);
  });

  it('paginates tasks and returns the requested page metadata', async () => {
    const project = await api()
      .post('/api/v1/projects')
      .set('X-Org-Id', orgId)
      .send({ key: 'TASK', name: 'Task pagination project' })
      .expect(201);

    for (let index = 1; index <= 57; index += 1) {
      await api()
        .post(`/api/v1/projects/${project.body.id}/tasks`)
        .set('X-Org-Id', orgId)
        .send({ title: `Task ${index}` })
        .expect(201);
    }

    for (const [page, count] of [
      [1, 20],
      [2, 20],
      [3, 17],
      [4, 0],
    ]) {
      const response = await api()
        .get(`/api/v1/projects/${project.body.id}/tasks?page=${page}&limit=20`)
        .set('X-Org-Id', orgId)
        .expect(200);

      expect(response.body.data).toHaveLength(count);
      expect(response.body.meta).toEqual({
        page,
        limit: 20,
        total: 57,
        totalPages: 3,
      });
    }

    const noResults = await api()
      .get(
        `/api/v1/projects/${project.body.id}/tasks?status=DONE&page=1&limit=20`,
      )
      .set('X-Org-Id', orgId)
      .expect(200);
    expect(noResults.body).toEqual({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    await api()
      .get(`/api/v1/projects/${project.body.id}/tasks?page=1&limit=101`)
      .set('X-Org-Id', orgId)
      .expect(400);
  });
});
