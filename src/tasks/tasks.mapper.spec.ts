import { describe, expect, it } from 'vitest';

import { toTaskResponse } from './tasks.mapper.js';
import type { Task } from './tasks.types.js';

describe('toTaskResponse', () => {
  it('constructs only the public task fields from the entity', () => {
    const task = {
      id: 'task-id',
      projectId: 'project-id',
      number: 12,
      title: 'Build responses',
      description: 'Use an explicit response shape',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      assigneeId: 'user-id',
      dueDate: '2026-12-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      organizationId: 'organization-id',
      internalNote: 'Must not leak',
    } as Task;

    expect(toTaskResponse(task, 'TF')).toEqual({
      id: 'task-id',
      projectId: 'project-id',
      number: 12,
      key: 'TF-12',
      title: 'Build responses',
      description: 'Use an explicit response shape',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      assigneeId: 'user-id',
      dueDate: '2026-12-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
  });
});
