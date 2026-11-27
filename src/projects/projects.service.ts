import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ProjectsRepository } from './repositories/projects.repository.js';
import { toProjectResponse } from './projects.mapper.js';
import { TasksRepository } from '../tasks/Repositories/tasks.repository.js';

import type { ProjectResponseDto } from './dto/project-response.dto.js';
import type {
  NewProject,
  Project,
  ProjectUpdate,
  ProjectStatus,
} from './projects.types.js';

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
  ): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsRepository.list(orgId, filter);
    return projects.map(toProjectResponse);
  }

  async fetchOne(orgId: string, id: string): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findById(orgId, id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return toProjectResponse(project);
  }

  async getProjectForTask(orgId: string, id: string): Promise<Project | null> {
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
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.create(orgId, data);
    return toProjectResponse(project);
  }

  async updateProject(
    orgId: string,
    id: string,
    patch: ProjectUpdate,
  ): Promise<ProjectResponseDto> {
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
}
