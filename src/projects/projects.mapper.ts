import type { ProjectResponseDto } from './dto/project-response.dto.js';
import type { Project } from './projects.types.js';

export function toProjectResponse(project: Project): ProjectResponseDto {
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
