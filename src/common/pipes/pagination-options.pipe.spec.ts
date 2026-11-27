import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { PaginationOptionsPipe } from './pagination-options.pipe.js';

describe('PaginationOptionsPipe', () => {
  const createPipe = (defaultPageSize: number, maxPageSize: number) =>
    new PaginationOptionsPipe({
      getOrThrow: vi.fn((key: string) =>
        key === 'DEFAULT_PAGE_SIZE' ? defaultPageSize : maxPageSize,
      ),
    } as never);

  it('uses page 1 and the configured default page size when omitted', () => {
    const pipe = createPipe(7, 9);

    expect(
      pipe.transform({ status: 'ACTIVE', page: undefined, limit: undefined }),
    ).toEqual({
      status: 'ACTIVE',
      page: 1,
      limit: 7,
    });
  });

  it('preserves explicitly requested pagination values within the configured maximum', () => {
    const pipe = createPipe(7, 9);

    expect(pipe.transform({ page: 2, limit: 9 })).toEqual({
      page: 2,
      limit: 9,
    });
  });

  it('rejects a limit above the configured maximum', () => {
    const pipe = createPipe(7, 9);

    expect(() => pipe.transform({ limit: 10 })).toThrow(BadRequestException);
  });
});
