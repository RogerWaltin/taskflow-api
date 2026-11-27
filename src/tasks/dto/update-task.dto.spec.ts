import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { UpdateTaskDto } from './update-task.dto.js';

async function validatePatch(body: Record<string, unknown>) {
  return validate(plainToInstance(UpdateTaskDto, body), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('UpdateTaskDto', () => {
  it.each([
    { title: 'Updated title' },
    { priority: 'HIGH' },
    { priority: 'URGENT' },
    { dueDate: '2026-11-26T12:00:00Z' },
    { status: 'IN_PROGRESS' },
    { description: null },
  ])('accepts a valid partial update: %o', async (body) => {
    await expect(validatePatch(body)).resolves.toHaveLength(0);
  });

  it('rejects an invalid priority', async () => {
    const errors = await validatePatch({ priority: 'INVALID' });

    expect(errors.some((error) => error.property === 'priority')).toBe(true);
  });

  it('rejects an invalid status', async () => {
    const errors = await validatePatch({ status: 'INVALID' });

    expect(errors.some((error) => error.property === 'status')).toBe(true);
  });

  it('rejects null for the non-nullable task title and status', async () => {
    for (const body of [{ title: null }, { status: null }]) {
      const errors = await validatePatch(body);

      expect(errors.some((error) => error.property in body)).toBe(true);
    }
  });

  it('rejects an invalid assignee UUID', async () => {
    const errors = await validatePatch({ assigneeId: 'not-a-uuid' });

    expect(errors.some((error) => error.property === 'assigneeId')).toBe(true);
  });

  it('accepts null for nullable assigneeId and dueDate', async () => {
    await expect(
      validatePatch({ assigneeId: null, dueDate: null }),
    ).resolves.toHaveLength(0);
  });

  it('rejects an empty patch', async () => {
    const errors = await validatePatch({});

    expect(errors.some((error) => error.property === '__atLeastOneField')).toBe(
      true,
    );
  });
});
