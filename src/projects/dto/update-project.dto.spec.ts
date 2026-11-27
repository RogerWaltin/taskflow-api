import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { UpdateProjectDto } from './update-project.dto.js';

async function validatePatch(body: Record<string, unknown>) {
  return validate(plainToInstance(UpdateProjectDto, body), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe('UpdateProjectDto', () => {
  it.each([
    { name: 'Renamed project' },
    { description: 'Updated description' },
    { status: 'ARCHIVED' },
    { name: 'Renamed project', status: 'ACTIVE' },
    { description: null },
  ])('accepts a valid partial update: %o', async (body) => {
    await expect(validatePatch(body)).resolves.toHaveLength(0);
  });

  it('rejects an immutable project key', async () => {
    const errors = await validatePatch({ key: 'NEW' });

    expect(errors.some((error) => error.property === 'key')).toBe(true);
  });

  it('rejects an invalid status', async () => {
    const errors = await validatePatch({ status: 'PAUSED' });

    expect(errors.some((error) => error.property === 'status')).toBe(true);
  });

  it('rejects null for the non-nullable project name and status', async () => {
    for (const body of [{ name: null }, { status: null }]) {
      const errors = await validatePatch(body);

      expect(errors.some((error) => error.property in body)).toBe(true);
    }
  });

  it('rejects an empty patch', async () => {
    const errors = await validatePatch({});

    expect(errors.some((error) => error.property === '__atLeastOneField')).toBe(
      true,
    );
  });
});
