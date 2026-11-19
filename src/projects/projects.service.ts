import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectsService {
  fetchProjects(): string {
    return 'Fetched all projects';
  }

  fetchOne(id: string): string {
    return `Fetched Project No.${id}`;
  }

  createProject(payload: Record<string, unknown>): Record<string, unknown> {
    return { payload, message: 'Create project successfully' };
  }

  updateProject(
    id: string,
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    return { payload, message: `Updated project No.${id}` };
  }

  deleteProject(id: string): string {
    return `Successfully deleted project No.${id}`;
  }
}
