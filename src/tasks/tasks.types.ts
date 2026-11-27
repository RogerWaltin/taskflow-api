import type { PaginationOptions } from '../common/pagination.js';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  projectId: string;
  number: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

export type NewTask = Pick<Task, 'title'> &
  Partial<Pick<Task, 'description' | 'priority' | 'assigneeId' | 'dueDate'>>;

export type TaskPatch = Partial<NewTask> & {
  status?: TaskStatus;
};

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
}

export type TaskListQuery = TaskFilters & PaginationOptions;
