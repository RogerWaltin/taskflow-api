import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { TaskFiltersDto } from './task-filters.dto.js';

describe('TaskFiltersDto pagination', () => {
  it('leaves pagination unset for the configured pagination pipe to default', async () => {
    const query = plainToInstance(TaskFiltersDto, {});

    expect(query.page).toBeUndefined();
    expect(query.limit).toBeUndefined();
    await expect(validate(query)).resolves.toHaveLength(0);
  });

  it('explicitly transforms numeric query strings', async () => {
    const query = plainToInstance(TaskFiltersDto, {
      page: '2',
      limit: '5',
    });

    expect(query.page).toBe(2);
    expect(query.limit).toBe(5);
    await expect(validate(query)).resolves.toHaveLength(0);
  });

  it.each([
    { page: '0' },
    { page: '-1' },
    { page: '1.5' },
    { page: 'invalid' },
    { limit: '0' },
    { limit: '-1' },
    { limit: '1.5' },
    { limit: 'invalid' },
  ])('rejects invalid pagination values: %o', async (query) => {
    const instance = plainToInstance(TaskFiltersDto, query);

    await expect(validate(instance)).resolves.not.toHaveLength(0);
  });
});
