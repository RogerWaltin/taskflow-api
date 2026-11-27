import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { ProjectFiltersDto } from './dto/project-filters.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

describe('ProjectsController', () => {
  const orgId = '11111111-1111-4111-8111-111111111111';
  const projectId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  let controller: ProjectsController;
  let service: {
    fetchProjects: ReturnType<typeof vi.fn>;
    fetchOne: ReturnType<typeof vi.fn>;
    createProject: ReturnType<typeof vi.fn>;
    updateProject: ReturnType<typeof vi.fn>;
    deleteProject: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      fetchProjects: vi.fn(),
      fetchOne: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
    };
    controller = new ProjectsController(service as unknown as ProjectsService);
  });

  it('delegates listing with an optional status filter', async () => {
    const response = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
    service.fetchProjects.mockResolvedValue(response);
    const filters = Object.assign(new ProjectFiltersDto(), {
      status: 'ACTIVE' as const,
    });
    await expect(controller.fetchProjects(orgId, filters)).resolves.toEqual(
      response,
    );
    expect(service.fetchProjects).toHaveBeenCalledWith(orgId, {
      status: 'ACTIVE',
      page: undefined,
      limit: undefined,
      sort: '-createdAt',
    });
  });

  it('delegates listing without a status filter', () => {
    const filters = new ProjectFiltersDto();
    controller.fetchProjects(orgId, filters);
    expect(service.fetchProjects).toHaveBeenCalledWith(orgId, {
      page: undefined,
      limit: undefined,
      sort: '-createdAt',
      status: undefined,
    });
  });

  it('delegates fetching one project', async () => {
    service.fetchOne.mockResolvedValue({ id: projectId });
    await expect(controller.fetchProject(orgId, projectId)).resolves.toEqual({
      id: projectId,
    });
    expect(service.fetchOne).toHaveBeenCalledWith(orgId, projectId);
  });

  it('delegates project creation with the request body', async () => {
    const body = Object.assign(new CreateProjectDto(), {
      key: 'TF',
      name: 'TaskFlow',
    });
    service.createProject.mockResolvedValue({ id: projectId, ...body });
    await controller.createProject(orgId, body);
    expect(service.createProject).toHaveBeenCalledWith(orgId, body);
  });

  it('delegates project updates with ID and patch', async () => {
    const patch = Object.assign(new UpdateProjectDto(), { name: 'Renamed' });
    service.updateProject.mockResolvedValue({ id: projectId, ...patch });
    await controller.updateProject(orgId, projectId, patch);
    expect(service.updateProject).toHaveBeenCalledWith(orgId, projectId, patch);
  });

  it('delegates project deletion', async () => {
    service.deleteProject.mockResolvedValue(true);
    await expect(controller.deleteProject(orgId, projectId)).resolves.toBe(
      true,
    );
    expect(service.deleteProject).toHaveBeenCalledWith(orgId, projectId);
  });
});
