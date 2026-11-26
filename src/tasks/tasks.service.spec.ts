import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { TasksRepository } from './Repositories/tasks.repository.js';
import { ProjectsService } from '../projects/projects.service.js';
import type { Task, TaskPatch } from './tasks.types.js';
import type { Project } from '../projects/projects.types.js';

describe('TasksService', () => {
  const orgId = '11111111-1111-4111-8111-111111111111';
  const projectId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const taskId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const project: Project = {
    id: projectId, key: 'TF', name: 'TaskFlow', description: null, status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    organizationId: orgId, nextTaskNumber: 1,
  };
  const task: Task = {
    id: taskId, projectId, number: 1, title: 'Build authentication', description: null,
    status: 'TODO', priority: 'HIGH', assigneeId: null, dueDate: null,
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', organizationId: orgId,
  };
  let service: TasksService;
  let repo: { create: ReturnType<typeof vi.fn>; findById: ReturnType<typeof vi.fn>; findByProject: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>; deleteByProject: ReturnType<typeof vi.fn> };
  let projects: { getProjectForTask: ReturnType<typeof vi.fn>; updateTaskNumber: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    repo = { create: vi.fn(), findById: vi.fn(), findByProject: vi.fn(), update: vi.fn(), delete: vi.fn(), deleteByProject: vi.fn() };
    projects = { getProjectForTask: vi.fn(), updateTaskNumber: vi.fn() };
    service = new TasksService(repo as unknown as TasksRepository, projects as unknown as ProjectsService);
  });

  it('creates a task, increments the project counter, and returns a public key', async () => {
    projects.getProjectForTask.mockResolvedValue(project);
    repo.create.mockReturnValue({ ...task, title: 'Build authentication' });
    projects.updateTaskNumber.mockResolvedValue({ ...project, nextTaskNumber: 2 });
    const result = await service.createTask(orgId, projectId, { title: 'Build authentication', priority: 'HIGH' });
    expect(repo.create).toHaveBeenCalledWith(orgId, projectId, 1, { title: 'Build authentication', description: undefined, priority: 'HIGH', assigneeId: undefined, dueDate: undefined });
    expect(projects.updateTaskNumber).toHaveBeenCalledWith(orgId, projectId, 2);
    expect(result.key).toBe('TF-1');
    expect(result).not.toHaveProperty('organizationId');
  });

  it('rejects creation when the project does not exist', async () => {
    projects.getProjectForTask.mockResolvedValue(null);
    await expect(service.createTask(orgId, projectId, { title: 'A task' })).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rejects creation in an archived project', async () => {
    projects.getProjectForTask.mockResolvedValue({ ...project, status: 'ARCHIVED' });
    await expect(service.createTask(orgId, projectId, { title: 'A task' })).rejects.toBeInstanceOf(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rolls back the created task if incrementing the project counter fails', async () => {
    projects.getProjectForTask.mockResolvedValue(project);
    repo.create.mockReturnValue(task);
    projects.updateTaskNumber.mockRejectedValue(new Error('counter failed'));
    repo.delete.mockReturnValue(true);
    await expect(service.createTask(orgId, projectId, { title: 'A task' })).rejects.toThrow('counter failed');
    expect(repo.delete).toHaveBeenCalledWith(orgId, taskId);
  });

  it('rolls back when the project counter update returns null', async () => {
    projects.getProjectForTask.mockResolvedValue(project);
    repo.create.mockReturnValue(task);
    projects.updateTaskNumber.mockResolvedValue(null);
    repo.delete.mockReturnValue(true);
    await expect(service.createTask(orgId, projectId, { title: 'A task' })).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.delete).toHaveBeenCalledWith(orgId, taskId);
  });

  it('retrieves a task with its project key', async () => {
    repo.findById.mockReturnValue(task);
    projects.getProjectForTask.mockResolvedValue(project);
    const result = await service.getTask(orgId, taskId);
    expect(repo.findById).toHaveBeenCalledWith(orgId, taskId);
    expect(result.key).toBe('TF-1');
    expect(result).not.toHaveProperty('organizationId');
  });

  it('throws when retrieving a missing task', async () => {
    repo.findById.mockReturnValue(null);
    await expect(service.getTask(orgId, taskId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when the task exists but its project cannot be found', async () => {
    repo.findById.mockReturnValue(task);
    projects.getProjectForTask.mockResolvedValue(null);
    await expect(service.getTask(orgId, taskId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists project tasks and maps each task to a response', async () => {
    projects.getProjectForTask.mockResolvedValue(project);
    repo.findByProject.mockReturnValue([task, { ...task, id: 'task-2', number: 2 }]);
    const result = await service.getProjectTasks(orgId, projectId, { status: 'TODO' });
    expect(repo.findByProject).toHaveBeenCalledWith(orgId, projectId, { status: 'TODO' });
    expect(result.map((item) => item.key)).toEqual(['TF-1', 'TF-2']);
  });

  it('returns an empty array when the project has no tasks', async () => {
    projects.getProjectForTask.mockResolvedValue(project);
    repo.findByProject.mockReturnValue([]);
    await expect(service.getProjectTasks(orgId, projectId)).resolves.toEqual([]);
  });

  it('throws when listing tasks for a missing project', async () => {
    projects.getProjectForTask.mockResolvedValue(null);
    await expect(service.getProjectTasks(orgId, projectId)).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.findByProject).not.toHaveBeenCalled();
  });

  it('accepts multiple supported filters together', async () => {
    projects.getProjectForTask.mockResolvedValue(project);
    repo.findByProject.mockReturnValue([task]);
    const filters = { status: 'TODO', priority: 'HIGH', assigneeId: 'user-1' } as const;
    await expect(service.getProjectTasks(orgId, projectId, filters)).resolves.toHaveLength(1);
    expect(repo.findByProject).toHaveBeenCalledWith(orgId, projectId, filters);
  });

  it('updates task fields', async () => {
    repo.findById.mockReturnValue(task);
    projects.getProjectForTask.mockResolvedValue(project);
    repo.update.mockReturnValue({ ...task, title: 'Updated title' });
    const result = await service.updateTask(orgId, taskId, { title: 'Updated title' });
    expect(repo.update).toHaveBeenCalledWith(orgId, taskId, { title: 'Updated title' });
    expect(result.title).toBe('Updated title');
  });

  it('does not call repository update for a no-op patch', async () => {
    repo.findById.mockReturnValue(task);
    projects.getProjectForTask.mockResolvedValue(project);
    const result = await service.updateTask(orgId, taskId, { title: task.title });
    expect(repo.update).not.toHaveBeenCalled();
    expect(result.updatedAt).toBe(task.updatedAt);
  });

  it('sends only supplied fields and preserves omitted fields', async () => {
    const original: Task = {
      ...task,
      title: 'Original title',
      description: 'Keep me',
      priority: 'HIGH',
      assigneeId: 'user-1',
      dueDate: '2026-12-31',
    };
    repo.findById.mockReturnValue(original);
    projects.getProjectForTask.mockResolvedValue(project);
    repo.update.mockImplementation((_org, _id, patch) => ({ ...original, ...patch }));

    const result = await service.updateTask(orgId, taskId, {
      title: 'Renamed title',
    });

    expect(repo.update).toHaveBeenCalledWith(orgId, taskId, {
      title: 'Renamed title',
    });
    expect(result).toMatchObject({
      title: 'Renamed title',
      description: 'Keep me',
      status: original.status,
      priority: 'HIGH',
      assigneeId: 'user-1',
      dueDate: '2026-12-31',
    });
  });

  it.each([
    ['description', 'Updated description'],
    ['priority', 'LOW'],
    ['assigneeId', 'user-2'],
    ['dueDate', '2027-01-15'],
  ] as const)('updates only %s when a single field is patched', async (field, value) => {
    const original: Task = {
      ...task,
      title: 'Original title',
      description: 'Keep me',
      priority: 'HIGH',
      assigneeId: 'user-1',
      dueDate: '2026-12-31',
    };
    const patch = { [field]: value } as TaskPatch;
    repo.findById.mockReturnValue(original);
    projects.getProjectForTask.mockResolvedValue(project);
    repo.update.mockImplementation((_org, _id, update) => ({
      ...original,
      ...update,
    }));

    const result = await service.updateTask(orgId, taskId, patch);

    expect(repo.update).toHaveBeenCalledWith(orgId, taskId, patch);
    expect(result[field]).toBe(value);
    expect(result.title).toBe('Original title');
    expect(result.status).toBe(original.status);
    for (const otherField of [
      'description',
      'priority',
      'assigneeId',
      'dueDate',
    ] as const) {
      if (otherField !== field) {
        expect(result[otherField]).toBe(original[otherField]);
      }
    }
  });

  it.each(['description', 'priority', 'assigneeId', 'dueDate'] as const)(
    'clears %s when null is explicitly supplied',
    async (field) => {
      const original: Task = {
        ...task,
        description: 'Keep me',
        priority: 'HIGH',
        assigneeId: 'user-1',
        dueDate: '2026-12-31',
      };
      const patch = { [field]: null } as TaskPatch;
      repo.findById.mockReturnValue(original);
      projects.getProjectForTask.mockResolvedValue(project);
      repo.update.mockImplementation((_org, _id, update) => ({
        ...original,
        ...update,
      }));

      const result = await service.updateTask(orgId, taskId, patch);

      expect(repo.update).toHaveBeenCalledWith(orgId, taskId, patch);
      expect(result[field]).toBeNull();
      expect(result.title).toBe(original.title);
      expect(result.status).toBe(original.status);
    },
  );

  it('allows a status transition after a partial update', async () => {
    let stored: Task = {
      ...task,
      title: 'Original title',
      description: 'Keep me',
      priority: 'HIGH',
      assigneeId: 'user-1',
      dueDate: '2026-12-31',
    };
    repo.findById.mockImplementation(() => stored);
    projects.getProjectForTask.mockResolvedValue(project);
    repo.update.mockImplementation((_org, _id, patch) => {
      stored = { ...stored, ...patch } as Task;
      return stored;
    });

    const renamed = await service.updateTask(orgId, taskId, {
      title: 'Renamed title',
    });
    expect(renamed).toMatchObject({
      title: 'Renamed title',
      status: 'TODO',
      description: 'Keep me',
      priority: 'HIGH',
    });

    const moved = await service.updateTask(orgId, taskId, {
      status: 'IN_PROGRESS',
    });

    expect(repo.update).toHaveBeenLastCalledWith(orgId, taskId, {
      status: 'IN_PROGRESS',
    });
    expect(moved).toMatchObject({
      status: 'IN_PROGRESS',
      title: 'Renamed title',
      description: 'Keep me',
      priority: 'HIGH',
      assigneeId: 'user-1',
      dueDate: '2026-12-31',
    });
  });

  it('throws when updating a missing task', async () => {
    repo.findById.mockReturnValue(null);
    await expect(service.updateTask(orgId, taskId, { title: 'Updated' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects updates when the parent project is archived', async () => {
    repo.findById.mockReturnValue(task);
    projects.getProjectForTask.mockResolvedValue({ ...project, status: 'ARCHIVED' });
    await expect(service.updateTask(orgId, taskId, { title: 'Updated' })).rejects.toBeInstanceOf(ConflictException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([
    ['TODO', 'IN_PROGRESS'], ['IN_PROGRESS', 'TODO'], ['IN_PROGRESS', 'IN_REVIEW'],
    ['IN_REVIEW', 'IN_PROGRESS'], ['IN_REVIEW', 'DONE'], ['DONE', 'IN_PROGRESS'],
  ] as const)('allows status transition %s -> %s', async (from, to) => {
    repo.findById.mockReturnValue({ ...task, status: from });
    projects.getProjectForTask.mockResolvedValue(project);
    repo.update.mockReturnValue({ ...task, status: to });
    await expect(service.updateTask(orgId, taskId, { status: to })).resolves.toMatchObject({ status: to });
  });

  it.each([
    ['TODO', 'DONE'], ['TODO', 'IN_REVIEW'], ['IN_PROGRESS', 'DONE'],
    ['IN_REVIEW', 'TODO'], ['DONE', 'TODO'], ['DONE', 'IN_REVIEW'],
  ] as const)('rejects status transition %s -> %s', async (from, to) => {
    repo.findById.mockReturnValue({ ...task, status: from });
    projects.getProjectForTask.mockResolvedValue(project);
    await expect(service.updateTask(orgId, taskId, { status: to })).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('allows setting a task to its current status as a no-op', async () => {
    repo.findById.mockReturnValue(task);
    projects.getProjectForTask.mockResolvedValue(project);
    await expect(service.updateTask(orgId, taskId, { status: 'TODO' })).resolves.toMatchObject({ status: 'TODO' });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('throws when the repository cannot find the task during update', async () => {
    repo.findById.mockReturnValue(task);
    projects.getProjectForTask.mockResolvedValue(project);
    repo.update.mockReturnValue(null);
    await expect(service.updateTask(orgId, taskId, { title: 'Updated' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes a task', async () => {
    repo.findById.mockReturnValue(task);
    projects.getProjectForTask.mockResolvedValue(project);
    repo.delete.mockReturnValue(true);
    await expect(service.deleteTask(orgId, taskId)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(orgId, taskId);
  });

  it('throws when deleting a missing task', async () => {
    repo.findById.mockReturnValue(null);
    await expect(service.deleteTask(orgId, taskId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects deletion when the parent project is archived', async () => {
    repo.findById.mockReturnValue(task);
    projects.getProjectForTask.mockResolvedValue({ ...project, status: 'ARCHIVED' });
    await expect(service.deleteTask(orgId, taskId)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('throws if the repository reports that deletion failed', async () => {
    repo.findById.mockReturnValue(task);
    projects.getProjectForTask.mockResolvedValue(project);
    repo.delete.mockReturnValue(false);
    await expect(service.deleteTask(orgId, taskId)).rejects.toBeInstanceOf(NotFoundException);
  });
});
