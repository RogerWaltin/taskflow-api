
import { Inject, Injectable } from '@nestjs/common';
import { ProjectsRepository } from './repositories/projects.repository.js';
import { toProjectResponse } from './projects.mapper.js';

import type {
  NewProject,
  ProjectPatch,
  ProjectResponse,
  ProjectStatus,
} from './projects.types.js';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(ProjectsRepository)
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async fetchProjects(
    orgId: string,
    filter: { status?: ProjectStatus } = {},
  ): Promise<ProjectResponse[]> {
    const projects = await this.projectsRepository.list(orgId, filter);

    return projects.map(toProjectResponse);
  }

  async fetchOne(
    orgId: string,
    id: string,
  ): Promise<ProjectResponse | null> {
    const project = await this.projectsRepository.findById(orgId, id);

    return project ? toProjectResponse(project) : null;
  }

  async createProject(
    orgId: string,
    data: NewProject,
  ): Promise<ProjectResponse> {
    const project = await this.projectsRepository.create(orgId, data);

    return toProjectResponse(project);
  }

  async updateProject(
    orgId: string,
    id: string,
    patch: ProjectPatch,
  ): Promise<ProjectResponse | null> {
    const project = await this.projectsRepository.update(orgId, id, patch);

    return project ? toProjectResponse(project) : null;
  }

  deleteProject(orgId: string, id: string): Promise<boolean> {
    return this.projectsRepository.delete(orgId, id);
  }
}
