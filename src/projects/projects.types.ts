export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

export interface Project {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly status: ProjectStatus;
  readonly createdAt: string;
  readonly updatedAt: string;

  // Internal fields — not part of API responses
  readonly organizationId: string;
  readonly nextTaskNumber: number;
}

export interface NewProject {
  readonly key: string;
  readonly name: string;
  readonly description?: string | null;
}

export type ProjectPatch = Partial<
  Pick<Project, 'name' | 'description' | 'status'>
>;

export type ProjectResponse = Pick<
  Project,
  'id' | 'key' | 'name' | 'description' | 'status' | 'createdAt' | 'updatedAt'
>;