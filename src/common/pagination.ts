export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface PaginationMeta extends PaginationOptions {
  total: number;
  totalPages: number;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;
}

export function paginateItems<T>(
  items: T[],
  { page, limit }: PaginationOptions,
): PaginatedResult<T> {
  const offset = (page - 1) * limit;

  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
  };
}

export function toPaginatedResponse<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationOptions,
): PaginatedResponseDto<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
 