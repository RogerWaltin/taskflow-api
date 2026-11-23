import type { Project, ProjectResponse } from './projects.types.js';

export function toProjectResponse(project: Project): ProjectResponse {
  return {
    id: project.id,
    key: project.key,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}