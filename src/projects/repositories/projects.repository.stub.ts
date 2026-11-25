
import type {
  NewProject,
  Project,
  ProjectInternalPatch,
  ProjectStatus,
} from '../projects.types.js';
import { ProjectsRepository } from './projects.repository.js';

export class ProjectsRepositoryStub extends ProjectsRepository {
  async create(_orgId: string, _data: NewProject): Promise<Project> {
    throw new Error('Not implemented');
  }

  async findById(_orgId: string, _id: string): Promise<Project | null> {
    return null;
  }

  async list(
    _orgId: string,
    _filter: { status?: ProjectStatus },
  ): Promise<Project[]> {
    return [];
  }

  async update(
    _orgId: string,
    _id: string,
    _patch: ProjectInternalPatch,
  ): Promise<Project | null> {
    return null;
  }

  async delete(_orgId: string, _id: string): Promise<boolean> {
    return false;
  }
}
