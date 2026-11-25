import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

describe('ProjectsController', () => {
  const orgId = '11111111-1111-4111-8111-111111111111';
  const projectId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  let controller: ProjectsController;
  let service: { fetchProjects: ReturnType<typeof vi.fn>; fetchOne: ReturnType<typeof vi.fn>; createProject: ReturnType<typeof vi.fn>; updateProject: ReturnType<typeof vi.fn>; deleteProject: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { fetchProjects: vi.fn(), fetchOne: vi.fn(), createProject: vi.fn(), updateProject: vi.fn(), deleteProject: vi.fn() };
    controller = new ProjectsController(service as unknown as ProjectsService);
  });

  it('delegates listing with an optional status filter', async () => {
    service.fetchProjects.mockResolvedValue([]);
    await expect(controller.fetchProjects(orgId, 'ACTIVE')).resolves.toEqual([]);
    expect(service.fetchProjects).toHaveBeenCalledWith(orgId, { status: 'ACTIVE' });
  });

  it('delegates listing without a status filter', () => {
    controller.fetchProjects(orgId);
    expect(service.fetchProjects).toHaveBeenCalledWith(orgId, { status: undefined });
  });

  it('delegates fetching one project', async () => {
    service.fetchOne.mockResolvedValue({ id: projectId });
    await expect(controller.fetchProject(orgId, projectId)).resolves.toEqual({ id: projectId });
    expect(service.fetchOne).toHaveBeenCalledWith(orgId, projectId);
  });

  it('delegates project creation with the request body', async () => {
    const body = { key: 'TF', name: 'TaskFlow' };
    service.createProject.mockResolvedValue({ id: projectId, ...body });
    await controller.createProject(orgId, body);
    expect(service.createProject).toHaveBeenCalledWith(orgId, body);
  });

  it('delegates project updates with ID and patch', async () => {
    const patch = { name: 'Renamed' };
    service.updateProject.mockResolvedValue({ id: projectId, ...patch });
    await controller.updateProject(orgId, projectId, patch);
    expect(service.updateProject).toHaveBeenCalledWith(orgId, projectId, patch);
  });

  it('rejects an attempt to patch the internal nextTaskNumber', () => {
    expect(() =>
      controller.updateProject(orgId, projectId, {
        nextTaskNumber: 50,
      } as never),
    ).toThrow(BadRequestException);
    expect(() =>
      controller.updateProject(orgId, projectId, {
        nextTaskNumber: 50,
      } as never),
    ).toThrow('nextTaskNumber is not an updatable project field');
    expect(service.updateProject).not.toHaveBeenCalled();
  });

  it.each([null, [1, 2], 'not-an-object'])(
    'rejects a malformed PATCH body before delegating',
    (body) => {
      expect(() =>
        controller.updateProject(orgId, projectId, body as never),
      ).toThrow(BadRequestException);
      expect(() =>
        controller.updateProject(orgId, projectId, body as never),
      ).toThrow('Request body must be an object');
      expect(service.updateProject).not.toHaveBeenCalled();
    },
  );

  it('delegates project deletion', async () => {
    service.deleteProject.mockResolvedValue(true);
    await expect(controller.deleteProject(orgId, projectId)).resolves.toBe(true);
    expect(service.deleteProject).toHaveBeenCalledWith(orgId, projectId);
  });
});
