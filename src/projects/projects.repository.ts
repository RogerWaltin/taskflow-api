import type {
  NewProject,
  Project,
  ProjectPatch,
  ProjectStatus,
} from './projects.types.js';

export abstract class ProjectsRepository {
  abstract create(orgId: string, data: NewProject): Promise<Project>;

  abstract findById(orgId: string, id: string): Promise<Project | null>;

  abstract list(
    orgId: string,
    filter: { status?: ProjectStatus },
  ): Promise<Project[]>;

  abstract update(
    orgId: string,
    id: string,
    patch: ProjectPatch,
  ): Promise<Project | null>;

  abstract delete(orgId: string, id: string): Promise<boolean>;
}
