import type { PaginatedResult } from '../../common/pagination.js';
import type {
  NewProject,
  Project,
  ProjectInternalPatch,
  ProjectListQuery,
} from '../projects.types.js';

export abstract class ProjectsRepository {
  abstract create(orgId: string, data: NewProject): Promise<Project>;

  abstract findById(orgId: string, id: string): Promise<Project | null>;

  abstract list(
    orgId: string,
    query: ProjectListQuery,
  ): Promise<PaginatedResult<Project>>;

  abstract update(
    orgId: string,
    id: string,
    patch: ProjectInternalPatch,
  ): Promise<Project | null>;

  abstract delete(orgId: string, id: string): Promise<boolean>;
}
