import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { ProjectsService } from '../projects/projects.service.js';
import { TasksRepository } from './Repositories/tasks.repository.js';
import { toTaskResponse } from './tasks.mapper.js';
import { toPaginatedResponse } from '../common/pagination.js';

import type { PaginatedResponseDto } from '../common/pagination.js';
import type { TaskResponseDto } from './dto/task-response.dto.js';
import type {
  NewTask,
  Task,
  TaskFilters,
  TaskListQuery,
  TaskPatch,
  TaskStatus,
} from './tasks.types.js';

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['TODO', 'IN_REVIEW'],
  IN_REVIEW: ['IN_PROGRESS', 'DONE'],
  DONE: ['IN_PROGRESS'],
};

@Injectable()
export class TasksService {
  constructor(
    @Inject(TasksRepository)
    private readonly tasksRepository: TasksRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async createTask(
    orgId: string,
    projectId: string,
    data: NewTask,
  ): Promise<TaskResponseDto> {
    const project = await this.projectsService.getProjectForTask(
      orgId,
      projectId,
    );

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status === 'ARCHIVED') {
      throw new ConflictException('Cannot create tasks in an archived project');
    }

    const taskNumber = project.nextTaskNumber;

    // Explicitly accept only the permitted fields.
    const taskData: NewTask = {
      title: data.title,
      description: data.description,
      priority: data.priority ?? 'MEDIUM',
      assigneeId: data.assigneeId,
      dueDate: data.dueDate,
    };

    const task = this.tasksRepository.create(
      orgId,
      projectId,
      taskNumber,
      taskData,
    );

    try {
      const updatedProject = await this.projectsService.updateTaskNumber(
        orgId,
        projectId,
        taskNumber + 1,
      );

      if (!updatedProject) {
        throw new NotFoundException('Project not found');
      }
    } catch (error) {
      this.tasksRepository.delete(orgId, task.id);
      throw error;
    }

    return toTaskResponse(task, project.key);
  }

  async getTask(orgId: string, taskId: string): Promise<TaskResponseDto> {
    const task = this.tasksRepository.findById(orgId, taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const project = await this.projectsService.getProjectForTask(
      orgId,
      task.projectId,
    );

    if (!project) {
      throw new NotFoundException('Task not found');
    }

    return toTaskResponse(task, project.key);
  }

  async getProjectTasks(
    orgId: string,
    projectId: string,
    filters: TaskFilters & Partial<Pick<TaskListQuery, 'page' | 'limit'>> = {},
  ): Promise<PaginatedResponseDto<TaskResponseDto>> {
    const project = await this.projectsService.getProjectForTask(
      orgId,
      projectId,
    );

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const query: TaskListQuery = {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    };
    const result = this.tasksRepository.findByProject(orgId, projectId, query);
    const data = result.items.map((task) => toTaskResponse(task, project.key));

    return toPaginatedResponse(data, result.total, query);
  }

  async updateTask(
    orgId: string,
    taskId: string,
    data: TaskPatch,
  ): Promise<TaskResponseDto> {
    const task = this.tasksRepository.findById(orgId, taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const project = await this.projectsService.getProjectForTask(
      orgId,
      task.projectId,
    );

    if (!project) {
      throw new NotFoundException('Task not found');
    }

    if (project.status === 'ARCHIVED') {
      throw new ConflictException('Cannot modify tasks in an archived project');
    }

    if (
      data.status !== undefined &&
      data.status !== task.status &&
      !ALLOWED_TRANSITIONS[task.status].includes(data.status)
    ) {
      throw new UnprocessableEntityException(
        `Cannot move task from ${task.status} to ${data.status}`,
      );
    }

    // Only include fields the client actually supplied. Omitted fields must
    // keep their existing values; explicit nulls are preserved as real updates.
    const patch: TaskPatch = {};

    if (data.title !== undefined) {
      patch.title = data.title;
    }

    if (data.description !== undefined) {
      patch.description = data.description;
    }

    if (data.status !== undefined) {
      patch.status = data.status;
    }

    if (data.priority !== undefined) {
      patch.priority = data.priority;
    }

    if (data.assigneeId !== undefined) {
      patch.assigneeId = data.assigneeId;
    }

    if (data.dueDate !== undefined) {
      patch.dueDate = data.dueDate;
    }

    // A no-op PATCH must not update updatedAt.
    const hasChanges = Object.entries(patch).some(
      ([field, value]) =>
        value !== undefined && value !== task[field as keyof Task],
    );

    if (!hasChanges) {
      return toTaskResponse(task, project.key);
    }

    const updatedTask = this.tasksRepository.update(orgId, taskId, patch);

    if (!updatedTask) {
      throw new NotFoundException('Task not found');
    }

    return toTaskResponse(updatedTask, project.key);
  }

  async deleteTask(orgId: string, taskId: string): Promise<void> {
    const task = this.tasksRepository.findById(orgId, taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const project = await this.projectsService.getProjectForTask(
      orgId,
      task.projectId,
    );

    if (!project) {
      throw new NotFoundException('Task not found');
    }

    if (project.status === 'ARCHIVED') {
      throw new ConflictException('Cannot delete tasks in an archived project');
    }

    const deleted = this.tasksRepository.delete(orgId, taskId);

    if (!deleted) {
      throw new NotFoundException('Task not found');
    }
  }
}
