import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ProjectsRepository } from './projects.repository.js';
import type {
  NewProject,
  Project,
  ProjectPatch,
  ProjectStatus,
} from './projects.types.js';

@Injectable()
export class ProjectsRepositoryStub extends ProjectsRepository {
  async create(orgId: string, data: NewProject): Promise<Project> {
    const now = new Date().toISOString();

    return {
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
  }

  async findById(orgId: string, id: string): Promise<Project | null> {
    return null;
  }

  async list(
    orgId: string,
    filter: { status?: ProjectStatus },
  ): Promise<Project[]> {
    return [];
  }

  async update(
    orgId: string,
    id: string,
    patch: ProjectPatch,
  ): Promise<Project | null> {
    return null;
  }

  async delete(orgId: string, id: string): Promise<boolean> {
    return false;
  }
}
