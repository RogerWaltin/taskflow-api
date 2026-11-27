import { describe, expect, it } from 'vitest';

import { paginateItems, toPaginatedResponse } from './pagination.js';

describe('pagination helpers', () => {
  const records = Array.from({ length: 57 }, (_, index) => index + 1);

  it.each([
    [1, 20, 20],
    [2, 20, 20],
    [3, 20, 17],
    [4, 20, 0],
  ])('page %i with limit %i returns %i records', (page, limit, count) => {
    const result = paginateItems(records, { page, limit });

    expect(result.items).toHaveLength(count);
    expect(result.total).toBe(57);
  });

  it('returns zero total pages when there are no matching items', () => {
    expect(toPaginatedResponse([], 0, { page: 1, limit: 20 })).toEqual({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });
});
