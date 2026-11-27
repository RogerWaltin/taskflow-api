import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

const PROJECT_SORT_FIELDS = ['name', 'key', 'createdAt', '-createdAt'] as const;

export type ProjectSort = (typeof PROJECT_SORT_FIELDS)[number];

export class ProjectFiltersDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'ARCHIVED'])
  status?: 'ACTIVE' | 'ARCHIVED';

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsInt()
  @Min(1)
  limit?: number;

  @IsIn(PROJECT_SORT_FIELDS)
  sort: ProjectSort = '-createdAt';
}
