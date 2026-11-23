import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ProjectsRepository } from './projects.repository.js';
import type {
  NewProject,
  Project,
  ProjectPatch,
  ProjectStatus,
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
    filter: { status?: ProjectStatus },
  ): Promise<Project[]> {
    return [...this.projects.values()]
      .filter(
        (project) =>
          project.organizationId === orgId &&
          (filter.status === undefined || project.status === filter.status),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async update(
    orgId: string,
    id: string,
    patch: ProjectPatch,
  ): Promise<Project | null> {
    const project = await this.findById(orgId, id);

    if (!project) {
      return null;
    }

    const updatedProject = {
      ...project,
      status: patch.status ?? project.status,
      description:
        patch.description !== undefined
          ? patch.description
          : project.description,
      name: patch.name ?? project.name,
    };

    const hasChanged =
      project.name !== updatedProject.name ||
      project.status !== updatedProject.status ||
      project.description !== updatedProject.description;

    const finalProject: Project = {
      ...updatedProject,
      updatedAt: hasChanged ? new Date().toISOString() : project.updatedAt,
    };

    this.projects.set(id, finalProject);

    return finalProject;
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
