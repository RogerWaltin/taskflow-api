import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { paginateItems } from '../../common/pagination.js';
import { ProjectsRepository } from './projects.repository.js';
import type {
  NewProject,
  Project,
  ProjectInternalPatch,
  ProjectListQuery,
} from '../projects.types.js';

@Injectable()
export class InMemoryProjectsRepository extends ProjectsRepository {
  private readonly projects = new Map<string, Project>();

  async create(orgId: string, data: NewProject): Promise<Project> {
    const now = new Date().toISOString();

    const project: Project = {
      id: randomUUID(),
      organizationId: orgId,
      key: data.key,
      name: data.name,
      description: data.description ?? null,
      status: 'ACTIVE',
      nextTaskNumber: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.projects.set(project.id, project);
    return project;
  }

  async findById(orgId: string, id: string): Promise<Project | null> {
    const project = this.projects.get(id) ?? null;

    if (!project || project.organizationId !== orgId) {
      return null;
    }

    return project;
  }

  async list(
    orgId: string,
    query: ProjectListQuery,
  ) {
    const matchingProjects = [...this.projects.values()]
      .filter(
        (project) =>
          project.organizationId === orgId &&
          (query.status === undefined || project.status === query.status),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return paginateItems(matchingProjects, query);
  }

  async update(
    orgId: string,
    id: string,
    patch: ProjectInternalPatch,
  ): Promise<Project | null> {
    const project = await this.findById(orgId, id);

    if (!project) {
      return null;
    }

    const hasChanges =
      (patch.name !== undefined && patch.name !== project.name) ||
      (patch.description !== undefined &&
        patch.description !== project.description) ||
      (patch.status !== undefined && patch.status !== project.status) ||
      (patch.nextTaskNumber !== undefined &&
        patch.nextTaskNumber !== project.nextTaskNumber);

    const updatedProject: Project = {
      ...project,
      status: patch.status ?? project.status,
      description:
        patch.description !== undefined
          ? patch.description
          : project.description,
      name: patch.name ?? project.name,
      nextTaskNumber: patch.nextTaskNumber ?? project.nextTaskNumber,
      updatedAt: hasChanges ? new Date().toISOString() : project.updatedAt,
    };

    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async delete(orgId: string, id: string): Promise<boolean> {
    const project = await this.findById(orgId, id);

    if (!project) {
      return false;
    }

    this.projects.delete(id);
    return true;
  }
}
