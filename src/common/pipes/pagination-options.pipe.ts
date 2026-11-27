import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PaginationQueryInput {
  page?: number;
  limit?: number;
}

@Injectable()
export class PaginationOptionsPipe implements PipeTransform<
  PaginationQueryInput,
  PaginationQueryInput
> {
  constructor(private readonly configService: ConfigService) {}

  transform<T extends PaginationQueryInput>(
    value: T,
  ): T & {
    page: number;
    limit: number;
  } {
    const page = value.page ?? 1;
    const limit =
      value.limit ?? this.configService.getOrThrow<number>('DEFAULT_PAGE_SIZE');
    const maxPageSize = this.configService.getOrThrow<number>('MAX_PAGE_SIZE');

    if (limit > maxPageSize) {
      throw new BadRequestException(
        `limit must not exceed MAX_PAGE_SIZE (${maxPageSize})`,
      );
    }

    return { ...value, page, limit };
  }
}
