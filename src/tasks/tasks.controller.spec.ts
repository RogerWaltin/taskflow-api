import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { TaskFiltersDto } from './dto/task-filters.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

describe('TasksController', () => {
  const orgId = '11111111-1111-4111-8111-111111111111';
  const projectId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const taskId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  let controller: TasksController;
  let response: { setHeader: ReturnType<typeof vi.fn> };
  let service: { createTask: ReturnType<typeof vi.fn>; getProjectTasks: ReturnType<typeof vi.fn>; getTask: ReturnType<typeof vi.fn>; updateTask: ReturnType<typeof vi.fn>; deleteTask: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { createTask: vi.fn(), getProjectTasks: vi.fn(), getTask: vi.fn(), updateTask: vi.fn(), deleteTask: vi.fn() };
    response = { setHeader: vi.fn() };
    controller = new TasksController(service as unknown as TasksService);
  });

  it('delegates task creation and sets a Location header for the new task', async () => {
    const body = Object.assign(new CreateTaskDto(), {
      title: 'Build authentication',
      priority: 'HIGH' as const,
    });
    service.createTask.mockResolvedValue({ id: taskId });
    await controller.createTask(orgId, projectId, body, response as never);

    expect(service.createTask).toHaveBeenCalledWith(orgId, projectId, body);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Location',
      `/api/v1/tasks/${taskId}`,
    );
  });

  it('does not set a Location header when task creation fails', async () => {
    service.createTask.mockRejectedValue(new Error('creation failed'));
    await expect(
      controller.createTask(
        orgId,
        projectId,
        Object.assign(new CreateTaskDto(), { title: 'x' }),
        response as never,
      ),
    ).rejects.toThrow('creation failed');
    expect(response.setHeader).not.toHaveBeenCalled();
  });

  it('forwards the complete query object so unsupported keys can be rejected', async () => {
    service.getProjectTasks.mockResolvedValue([]);
    const query = { status: 'TODO', priority: 'HIGH', foo: 'bar' } as never;
    await controller.getProjectTasks(orgId, projectId, query);
    expect(service.getProjectTasks).toHaveBeenCalledWith(orgId, projectId, query);
  });

  it('passes all supplied supported filters to the service', async () => {
    service.getProjectTasks.mockResolvedValue([]);
    const filters = { status: 'TODO', priority: 'HIGH', assigneeId: 'user-1' } as never;
    await controller.getProjectTasks(orgId, projectId, filters);
    expect(service.getProjectTasks).toHaveBeenCalledWith(orgId, projectId, filters);
  });

  it('passes an empty filter object when no filters are supplied', () => {
    const filters = new TaskFiltersDto();
    controller.getProjectTasks(orgId, projectId, filters);
    expect(service.getProjectTasks).toHaveBeenCalledWith(
      orgId,
      projectId,
      filters,
    );
  });

  it('delegates retrieval of a single task', async () => {
    service.getTask.mockResolvedValue({ id: taskId });
    await expect(controller.getTask(orgId, taskId)).resolves.toEqual({ id: taskId });
    expect(service.getTask).toHaveBeenCalledWith(orgId, taskId);
  });

  it('delegates task updates with the patch body', async () => {
    const patch = Object.assign(new UpdateTaskDto(), {
      title: 'Updated title',
    });
    service.updateTask.mockResolvedValue({ id: taskId, ...patch });
    await controller.updateTask(orgId, taskId, patch);
    expect(service.updateTask).toHaveBeenCalledWith(orgId, taskId, patch);
  });

  it('delegates task deletion', async () => {
    service.deleteTask.mockResolvedValue(undefined);
    await expect(controller.deleteTask(orgId, taskId)).resolves.toBeUndefined();
    expect(service.deleteTask).toHaveBeenCalledWith(orgId, taskId);
  });
});
