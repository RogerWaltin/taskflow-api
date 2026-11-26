import { IsIn, IsOptional, IsUUID } from 'class-validator';

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
}
