import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('Projects BUG-03 (e2e)', () => {
  const orgId = '11111111-1111-4111-8111-111111111111';
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects nextTaskNumber mass assignment and keeps task numbering sequential', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('X-Org-Id', orgId)
      .send({ key: `BUG03${Date.now()}`, name: 'BUG-03 verification' })
      .expect(201);

    const rejected = await request(app.getHttpServer())
      .patch(`/api/v1/projects/${created.body.id}`)
      .set('X-Org-Id', orgId)
      .send({ nextTaskNumber: 50 })
      .expect(400);

    expect(rejected.body.message).toContain('nextTaskNumber');

    const updated = await request(app.getHttpServer())
      .patch(`/api/v1/projects/${created.body.id}`)
      .set('X-Org-Id', orgId)
      .send({ name: 'Renamed verification project' })
      .expect(200);

    expect(updated.body).toMatchObject({
      id: created.body.id,
      key: created.body.key,
      name: 'Renamed verification project',
    });
    expect(updated.body).not.toHaveProperty('nextTaskNumber');

    const firstTask = await request(app.getHttpServer())
      .post(`/api/v1/projects/${created.body.id}/tasks`)
      .set('X-Org-Id', orgId)
      .send({ title: 'First task' })
      .expect(201);

    const secondTask = await request(app.getHttpServer())
      .post(`/api/v1/projects/${created.body.id}/tasks`)
      .set('X-Org-Id', orgId)
      .send({ title: 'Second task' })
      .expect(201);

    expect(firstTask.body).toMatchObject({
      number: 1,
      key: `${created.body.key}-1`,
    });
    expect(secondTask.body).toMatchObject({
      number: 2,
      key: `${created.body.key}-2`,
    });
  });
});
