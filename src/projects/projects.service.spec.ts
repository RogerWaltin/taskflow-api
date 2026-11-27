import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { ProjectsRepository } from './repositories/projects.repository.js';
import { TasksRepository } from '../tasks/Repositories/tasks.repository.js';
import type { Project } from './projects.types.js';

describe('ProjectsService', () => {
  const orgId = '11111111-1111-4111-8111-111111111111';
  const projectId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const project: Project = {
    id: projectId, key: 'TF', name: 'TaskFlow', description: 'Original',
    status: 'ACTIVE', createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z', organizationId: orgId,
    nextTaskNumber: 1,
  };
  let service: ProjectsService;
  let projectsRepository: {
    create: ReturnType<typeof vi.fn>; findById: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let tasksRepository: { deleteByProject: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    projectsRepository = {
      create: vi.fn(), findById: vi.fn(), list: vi.fn(), update: vi.fn(), delete: vi.fn(),
    };
    tasksRepository = { deleteByProject: vi.fn() };
    service = new ProjectsService(
      projectsRepository as unknown as ProjectsRepository,
      tasksRepository as unknown as TasksRepository,
    );
  });

  it('creates a project and returns only public fields', async () => {
    projectsRepository.create.mockResolvedValue(project);
    const result = await service.createProject(orgId, { key: 'TF', name: 'TaskFlow' });
    expect(projectsRepository.create).toHaveBeenCalledWith(orgId, { key: 'TF', name: 'TaskFlow' });
    expect(result).toEqual({ id: projectId, key: 'TF', name: 'TaskFlow', description: 'Original', status: 'ACTIVE', createdAt: project.createdAt, updatedAt: project.updatedAt });
    expect(result).not.toHaveProperty('organizationId');
    expect(result).not.toHaveProperty('nextTaskNumber');
  });

  it('lists projects for an organization with the supplied status filter', async () => {
    projectsRepository.list.mockResolvedValue({ items: [project], total: 1 });
    await expect(service.fetchProjects(orgId, { status: 'ACTIVE' })).resolves.toEqual({
      data: [
        {
          id: project.id,
          key: project.key,
          name: project.name,
          description: project.description,
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    expect(projectsRepository.list).toHaveBeenCalledWith(orgId, {
      status: 'ACTIVE',
      page: 1,
      limit: 20,
    });
  });

  it('returns an empty page with zero total pages when no projects exist', async () => {
    projectsRepository.list.mockResolvedValue({ items: [], total: 0 });
    await expect(service.fetchProjects(orgId)).resolves.toEqual({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    expect(projectsRepository.list).toHaveBeenCalledWith(orgId, {
      page: 1,
      limit: 20,
    });
  });

  it.each(['ACTIVE', 'ARCHIVED'] as const)('accepts the valid status filter %s', async (status) => {
    projectsRepository.list.mockResolvedValue({ items: [], total: 0 });
    await expect(service.fetchProjects(orgId, { status })).resolves.toEqual({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    expect(projectsRepository.list).toHaveBeenCalledWith(orgId, {
      status,
      page: 1,
      limit: 20,
    });
  });

  it('retrieves one project as a public response', async () => {
    projectsRepository.findById.mockResolvedValue(project);
    const result = await service.fetchOne(orgId, projectId);
    expect(result?.key).toBe('TF');
    expect(result).not.toHaveProperty('organizationId');
  });

  it('throws NotFoundException when a project cannot be found', async () => {
    projectsRepository.findById.mockResolvedValue(null);
    await expect(service.fetchOne(orgId, projectId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns the full internal project for task operations', async () => {
    projectsRepository.findById.mockResolvedValue(project);
    expect(await service.getProjectForTask(orgId, projectId)).toEqual(project);
  });

  it('updates the task counter through the repository', async () => {
    projectsRepository.update.mockResolvedValue({ ...project, nextTaskNumber: 2 });
    const result = await service.updateTaskNumber(orgId, projectId, 2);
    expect(projectsRepository.update).toHaveBeenCalledWith(orgId, projectId, { nextTaskNumber: 2 });
    expect(result?.nextTaskNumber).toBe(2);
  });

  it('updates project fields and maps the response', async () => {
    projectsRepository.update.mockResolvedValue({ ...project, name: 'Renamed' });
    const result = await service.updateProject(orgId, projectId, { name: 'Renamed' });
    expect(projectsRepository.update).toHaveBeenCalledWith(orgId, projectId, { name: 'Renamed' });
    expect(result?.name).toBe('Renamed');
    expect(result).not.toHaveProperty('nextTaskNumber');
  });

  it('throws NotFoundException when updating a missing project', async () => {
    projectsRepository.update.mockResolvedValue(null);
    await expect(service.updateProject(orgId, projectId, { name: 'Renamed' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes project tasks before deleting the project', async () => {
    projectsRepository.findById.mockResolvedValue(project);
    projectsRepository.delete.mockResolvedValue(true);
    expect(await service.deleteProject(orgId, projectId)).toBe(true);
    expect(tasksRepository.deleteByProject).toHaveBeenCalledWith(orgId, projectId);
    expect(projectsRepository.delete).toHaveBeenCalledWith(orgId, projectId);
    expect(tasksRepository.deleteByProject.mock.invocationCallOrder[0]).toBeLessThan(projectsRepository.delete.mock.invocationCallOrder[0]);
  });

  it('throws and does not delete tasks when the project does not exist', async () => {
    projectsRepository.findById.mockResolvedValue(null);
    await expect(service.deleteProject(orgId, projectId)).rejects.toBeInstanceOf(NotFoundException);
    expect(tasksRepository.deleteByProject).not.toHaveBeenCalled();
    expect(projectsRepository.delete).not.toHaveBeenCalled();
  });
});
