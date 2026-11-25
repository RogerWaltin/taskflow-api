import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { ProjectsService } from '../projects/projects.service.js';
import { TasksRepository } from './Repositories/tasks.repository.js';

import type {
  NewTask,
  Task,
  TaskFilters,
  TaskPatch,
  TaskPriority,
  TaskResponse,
  TaskStatus,
} from './tasks.types.js';

const TASK_STATUSES: TaskStatus[] = [
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
];

const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

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
  ): Promise<TaskResponse> {
    this.validateNewTask(data);

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
      title: data.title.trim(),
      description: data.description,
      priority: data.priority,
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

    return this.toTaskResponse(task, project.key);
  }

  async getTask(orgId: string, taskId: string): Promise<TaskResponse> {
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

    return this.toTaskResponse(task, project.key);
  }

  async getProjectTasks(
    orgId: string,
    projectId: string,
    filters: TaskFilters = {},
  ): Promise<TaskResponse[]> {
    this.validateFilters(filters);

    const project = await this.projectsService.getProjectForTask(
      orgId,
      projectId,
    );

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const tasks = this.tasksRepository.findByProject(orgId, projectId, filters);

    return tasks.map((task) => this.toTaskResponse(task, project.key));
  }

  async updateTask(
    orgId: string,
    taskId: string,
    data: TaskPatch,
  ): Promise<TaskResponse> {
    this.validatePatch(data);

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
      patch.title = data.title.trim();
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
      return this.toTaskResponse(task, project.key);
    }

    const updatedTask = this.tasksRepository.update(orgId, taskId, patch);

    if (!updatedTask) {
      throw new NotFoundException('Task not found');
    }

    return this.toTaskResponse(updatedTask, project.key);
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

  private toTaskResponse(task: Task, projectKey: string): TaskResponse {
    const { organizationId, ...response } = task;
    void organizationId;

    return {
      ...response,
      key: `${projectKey}-${task.number}`,
    };
  }

  private validateNewTask(data: NewTask): void {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Request body must be an object');
    }

    const allowedFields = [
      'title',
      'description',
      'priority',
      'assigneeId',
      'dueDate',
    ];

    this.rejectUnknownFields(data, allowedFields);

    if (
      typeof data.title !== 'string' ||
      data.title.trim().length < 1 ||
      data.title.trim().length > 200
    ) {
      throw new BadRequestException(
        'Title must be a string between 1 and 200 characters',
      );
    }

    if (
      data.description !== undefined &&
      data.description !== null &&
      typeof data.description !== 'string'
    ) {
      throw new BadRequestException('Description must be a string or null');
    }

    if (
      data.priority !== undefined &&
      data.priority !== null &&
      !TASK_PRIORITIES.includes(data.priority)
    ) {
      throw new BadRequestException('Invalid task priority');
    }

    if (
      data.assigneeId !== undefined &&
      data.assigneeId !== null &&
      typeof data.assigneeId !== 'string'
    ) {
      throw new BadRequestException('Assignee ID must be a string or null');
    }

    if (
      data.dueDate !== undefined &&
      data.dueDate !== null &&
      typeof data.dueDate !== 'string'
    ) {
      throw new BadRequestException('Due date must be a string or null');
    }
  }

  private validatePatch(data: TaskPatch): void {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Request body must be an object');
    }

    const allowedFields = [
      'title',
      'description',
      'status',
      'priority',
      'assigneeId',
      'dueDate',
    ];

    this.rejectUnknownFields(data, allowedFields);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('PATCH body cannot be empty');
    }

    if (
      data.title !== undefined &&
      (typeof data.title !== 'string' ||
        data.title.trim().length < 1 ||
        data.title.trim().length > 200)
    ) {
      throw new BadRequestException(
        'Title must be a string between 1 and 200 characters',
      );
    }

    if (
      data.description !== undefined &&
      data.description !== null &&
      typeof data.description !== 'string'
    ) {
      throw new BadRequestException('Description must be a string or null');
    }

    if (data.status !== undefined && !TASK_STATUSES.includes(data.status)) {
      throw new BadRequestException('Invalid task status');
    }

    if (
      data.priority !== undefined &&
      data.priority !== null &&
      !TASK_PRIORITIES.includes(data.priority)
    ) {
      throw new BadRequestException('Invalid task priority');
    }

    if (
      data.assigneeId !== undefined &&
      data.assigneeId !== null &&
      typeof data.assigneeId !== 'string'
    ) {
      throw new BadRequestException('Assignee ID must be a string or null');
    }

    if (
      data.dueDate !== undefined &&
      data.dueDate !== null &&
      typeof data.dueDate !== 'string'
    ) {
      throw new BadRequestException('Due date must be a string or null');
    }
  }

  private validateFilters(filters: TaskFilters): void {
    if (!filters || typeof filters !== 'object') {
      throw new BadRequestException('Invalid task filters');
    }

    this.rejectUnknownFields(filters, ['status', 'priority', 'assigneeId']);

    if (
      filters.status !== undefined &&
      !TASK_STATUSES.includes(filters.status)
    ) {
      throw new BadRequestException('Invalid task status filter');
    }

    if (
      filters.priority !== undefined &&
      !TASK_PRIORITIES.includes(filters.priority)
    ) {
      throw new BadRequestException('Invalid task priority filter');
    }

    if (
      filters.assigneeId !== undefined &&
      typeof filters.assigneeId !== 'string'
    ) {
      throw new BadRequestException('Invalid assigneeId filter');
    }
  }

  private rejectUnknownFields(data: object, allowedFields: string[]): void {
    const unknownFields = Object.keys(data).filter(
      (field) => !allowedFields.includes(field),
    );

    if (unknownFields.length > 0) {
      throw new BadRequestException(
        `Unknown or read-only fields: ${unknownFields.join(', ')}`,
      );
    }
  }
}
