import { IsIn, IsOptional } from 'class-validator';

export class ProjectFiltersDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'ARCHIVED'])
  status?: 'ACTIVE' | 'ARCHIVED';
}
