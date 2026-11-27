import { describe, expect, it } from 'vitest';

import { toProjectResponse } from './projects.mapper.js';
import type { Project } from './projects.types.js';

describe('toProjectResponse', () => {
  it('returns only the public project fields', () => {
    const project: Project = {
      id: 'project-id',
      key: 'TF',
      name: 'TaskFlow',
      description: 'A project',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      organizationId: 'organization-id',
      nextTaskNumber: 12,
    };

    expect(toProjectResponse(project)).toEqual({
      id: 'project-id',
      key: 'TF',
      name: 'TaskFlow',
      description: 'A project',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
  });
});
