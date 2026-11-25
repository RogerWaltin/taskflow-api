import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { TasksRepository } from './tasks.repository.js';

import type { NewTask, Task, TaskFilters, TaskPatch } from '../tasks.types.js';

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

  findByProject(
    orgId: string,
    projectId: string,
    filters: TaskFilters = {},
  ): Task[] {
    return [...this.tasks.values()]
      .filter(
        (task) => task.organizationId === orgId && task.projectId === projectId,
      )
      .filter(
        (task) =>
          filters.status === undefined || task.status === filters.status,
      )
      .filter(
        (task) =>
          filters.priority === undefined || task.priority === filters.priority,
      )
      .filter(
        (task) =>
          filters.assigneeId === undefined ||
          task.assigneeId === filters.assigneeId,
      )
      .sort((a, b) => b.number - a.number);
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
