import type { ProjectStatus } from '../projects.types.js';

export interface ProjectResponseDto {
  id: string;
  key: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}
