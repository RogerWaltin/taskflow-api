import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { paginateItems } from '../../common/pagination.js';
import { TasksRepository } from './tasks.repository.js';

import type {
  NewTask,
  Task,
  TaskListQuery,
  TaskPatch,
} from '../tasks.types.js';

@Injectable()
export class InMemoryTasksRepository extends TasksRepository {
  private readonly tasks = new Map<string, Task>();

  create(
    orgId: string,
    projectId: string,
    taskNumber: number,
    data: NewTask,
  ): Task {
    const now = new Date().toISOString();

    const task: Task = {
      id: randomUUID(),
      projectId,
      number: taskNumber,
      title: data.title,
      description: data.description ?? null,
      status: 'TODO',
      priority: data.priority ?? 'MEDIUM',
      assigneeId: data.assigneeId ?? null,
      dueDate: data.dueDate ?? null,
      createdAt: now,
      updatedAt: now,
      organizationId: orgId,
    };

    this.tasks.set(task.id, task);

    return task;
  }

  findById(orgId: string, taskId: string): Task | null {
    const task = this.tasks.get(taskId);

    if (!task || task.organizationId !== orgId) {
      return null;
    }

    return task;
  }

  findByProject(orgId: string, projectId: string, query: TaskListQuery) {
    const matchingTasks = [...this.tasks.values()]
      .filter(
        (task) => task.organizationId === orgId && task.projectId === projectId,
      )
      .filter(
        (task) =>
          query.status === undefined || query.status.includes(task.status),
      )
      .filter(
        (task) =>
          query.priority === undefined ||
          (task.priority !== null && query.priority.includes(task.priority)),
      )
      .filter(
        (task) =>
          query.assigneeId === undefined ||
          task.assigneeId === query.assigneeId,
      )
      .filter(
        (task) =>
          query.unassigned === undefined ||
          (query.unassigned
            ? task.assigneeId === null
            : task.assigneeId !== null),
      )
      .sort((a, b) => b.number - a.number);

    return paginateItems(matchingTasks, query);
  }

  update(orgId: string, taskId: string, data: TaskPatch): Task | null {
    const task = this.findById(orgId, taskId);

    if (!task) {
      return null;
    }

    // Ignore undefined values so a caller cannot accidentally erase fields.
    const changes = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as TaskPatch;

    const updatedTask: Task = {
      ...task,
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(taskId, updatedTask);

    return updatedTask;
  }

  delete(orgId: string, taskId: string): boolean {
    const task = this.findById(orgId, taskId);

    if (!task) {
      return false;
    }

    return this.tasks.delete(taskId);
  }

  deleteByProject(orgId: string, projectId: string): void {
    for (const [taskId, task] of this.tasks) {
      if (task.organizationId === orgId && task.projectId === projectId) {
        this.tasks.delete(taskId);
      }
    }
  }
}
