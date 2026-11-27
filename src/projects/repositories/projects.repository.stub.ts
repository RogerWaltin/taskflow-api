
import type {
  NewProject,
  Project,
  ProjectInternalPatch,
  ProjectListQuery,
} from '../projects.types.js';
import type { PaginatedResult } from '../../common/pagination.js';
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
    _query: ProjectListQuery,
  ): Promise<PaginatedResult<Project>> {
    return { items: [], total: 0 };
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
