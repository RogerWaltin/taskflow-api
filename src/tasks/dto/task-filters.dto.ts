import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class TaskFiltersDto {
  @IsOptional()
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

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
}
