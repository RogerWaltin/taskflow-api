import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsRepository } from './repositories/projects.repository.js';
import { toProjectResponse } from './projects.mapper.js';
import { TasksRepository } from '../tasks/Repositories/tasks.repository.js';

import type {
  NewProject,
  Project,
  ProjectUpdate,
  ProjectResponse,
  ProjectStatus,
} from './projects.types.js';

const PROJECT_STATUSES: ProjectStatus[] = ['ACTIVE', 'ARCHIVED'];
const NEW_PROJECT_FIELDS = ['key', 'name', 'description'];

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(ProjectsRepository)
    private readonly projectsRepository: ProjectsRepository,
    @Inject(TasksRepository)
    private readonly tasksRepository: TasksRepository,
  ) {}

  async fetchProjects(
    orgId: string,
    filter: { status?: ProjectStatus } = {},
  ): Promise<ProjectResponse[]> {
    if (
      filter.status !== undefined &&
      !PROJECT_STATUSES.includes(filter.status)
    ) {
      throw new BadRequestException('Invalid project status filter');
    }

    const projects = await this.projectsRepository.list(orgId, filter);
    return projects.map(toProjectResponse);
  }

  async fetchOne(orgId: string, id: string): Promise<ProjectResponse> {
    const project = await this.projectsRepository.findById(orgId, id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return toProjectResponse(project);
  }

  async getProjectForTask(
    orgId: string,
    id: string,
  ): Promise<Project | null> {
    return this.projectsRepository.findById(orgId, id);
  }

  async updateTaskNumber(
    orgId: string,
    projectId: string,
    nextTaskNumber: number,
  ): Promise<Project | null> {
    return this.projectsRepository.update(orgId, projectId, {
      nextTaskNumber,
    });
  }

  async createProject(
    orgId: string,
    data: NewProject,
  ): Promise<ProjectResponse> {
    this.validateNewProject(data);

    const project = await this.projectsRepository.create(orgId, data);
    return toProjectResponse(project);
  }

  async updateProject(
    orgId: string,
    id: string,
    patch: ProjectUpdate,
  ): Promise<ProjectResponse> {
    this.validateProjectPatch(patch);

    const project = await this.projectsRepository.update(orgId, id, patch);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return toProjectResponse(project);
  }

  async deleteProject(orgId: string, id: string): Promise<boolean> {
    const project = await this.projectsRepository.findById(orgId, id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Remove the project's tasks before removing the project itself.
    this.tasksRepository.deleteByProject(orgId, id);

    return this.projectsRepository.delete(orgId, id);
  }

  private validateNewProject(data: NewProject): void {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Request body must be an object');
    }

    this.rejectUnknownFields(data, NEW_PROJECT_FIELDS);

    if (typeof data.key !== 'string' || data.key.trim().length === 0) {
      throw new BadRequestException(
        'Key is required and must be a non-empty string',
      );
    }

    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new BadRequestException(
        'Name is required and must be a non-empty string',
      );
    }

    if (
      data.description !== undefined &&
      data.description !== null &&
      typeof data.description !== 'string'
    ) {
      throw new BadRequestException('Description must be a string or null');
    }
  }

  private validateProjectPatch(patch: ProjectUpdate): void {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
      throw new BadRequestException('Request body must be an object');
    }

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('PATCH body cannot be empty');
    }

    if (
      patch.name !== undefined &&
      (typeof patch.name !== 'string' || patch.name.trim().length === 0)
    ) {
      throw new BadRequestException('Name must be a non-empty string');
    }

    if (
      patch.description !== undefined &&
      patch.description !== null &&
      typeof patch.description !== 'string'
    ) {
      throw new BadRequestException('Description must be a string or null');
    }

    if (
      patch.status !== undefined &&
      !PROJECT_STATUSES.includes(patch.status)
    ) {
      throw new BadRequestException('Invalid project status');
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
