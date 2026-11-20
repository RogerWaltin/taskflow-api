import { Inject, Injectable } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository.js';
import type {
  NewProject,
  Project,
  ProjectPatch,
  ProjectStatus,
} from './projects.types.js';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(ProjectsRepository)
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  fetchProjects(
    orgId: string,
    filter: { status?: ProjectStatus } = {},
  ): Promise<Project[]> {
    return this.projectsRepository.list(orgId, filter);
  }

  fetchOne(
    orgId: string,
    id: string,
  ): Promise<Project | null> {
    return this.projectsRepository.findById(orgId, id);
  }

  createProject(
    orgId: string,
    data: NewProject,
  ): Promise<Project> {
    return this.projectsRepository.create(orgId, data);
  }

  updateProject(
    orgId: string,
    id: string,
    patch: ProjectPatch,
  ): Promise<Project | null> {
    return this.projectsRepository.update(orgId, id, patch);
  }

  deleteProject(
    orgId: string,
    id: string,
  ): Promise<boolean> {
    return this.projectsRepository.delete(orgId, id);
  }
}