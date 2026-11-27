import type { TaskPriority, TaskStatus } from '../tasks.types.js';

export interface TaskResponseDto {
  id: string;
  projectId: string;
  number: number;
  key: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
