import type { PaginatedResult } from '../../common/pagination.js';
import type {
  NewTask,
  Task,
  TaskListQuery,
  TaskPatch,
} from '../tasks.types.js';

export abstract class TasksRepository {
  abstract create(
    orgId: string,
    projectId: string,
    taskNumber: number,
    data: NewTask,
  ): Task;

  abstract findById(
    orgId: string,
    taskId: string,
  ): Task | null;

  abstract findByProject(
    orgId: string,
    projectId: string,
    query: TaskListQuery,
  ): PaginatedResult<Task>;

  abstract update(
    orgId: string,
    taskId: string,
    data: TaskPatch,
  ): Task | null;

  abstract delete(
    orgId: string,
    taskId: string,
  ): boolean;

  abstract deleteByProject(
    orgId: string,
    projectId: string,
  ): void;
}
