import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureApp } from './app.setup.js';
import { AppModule } from './app.module.js';
import { ProjectsService } from './projects/projects.service.js';
import { TasksService } from './tasks/tasks.service.js';

describe('request validation boundary', () => {
  const orgId = '11111111-1111-4111-8111-111111111111';
  const projectId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  let app: INestApplication<App>;
  let projectsService: { createProject: ReturnType<typeof vi.fn> };
  let tasksService: { createTask: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    projectsService = { createProject: vi.fn() };
    tasksService = { createTask: vi.fn() };

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ProjectsService)
      .useValue(projectsService)
      .overrideProvider(TasksService)
      .useValue(tasksService)
      .compile();

    app = module.createNestApplication({ bodyParser: false });
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects invalid project DTO input before calling the project service', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('X-Org-Id', orgId)
      .send({ key: 'T', name: 'Invalid key' })
      .expect(400);

    expect(projectsService.createProject).not.toHaveBeenCalled();
  });

  it('rejects invalid task DTO input before calling the task service', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set('X-Org-Id', orgId)
      .send({ title: '', unknown: true })
      .expect(400);

    expect(tasksService.createTask).not.toHaveBeenCalled();
  });

  it('rejects prototype-sensitive JSON keys before calling project service', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('X-Org-Id', orgId)
      .set('Content-Type', 'application/json')
      .send('{"key":"PP","name":"prototype probe","__proto__":{"polluted":true}}')
      .expect(400);

    expect(projectsService.createProject).not.toHaveBeenCalled();
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });
});
