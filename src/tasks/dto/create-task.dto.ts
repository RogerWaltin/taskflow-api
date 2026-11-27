import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export class CreateTaskDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  description?: string;

  @IsOptional()
  @IsIn(TASK_PRIORITIES)
  priority: (typeof TASK_PRIORITIES)[number] = 'MEDIUM';

  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;

  @IsOptional()
  @Matches(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
    {
      message: 'dueDate must be an ISO-8601 datetime with a timezone',
    },
  )
  @IsDateString({ strict: true })
  dueDate?: string | null;
}
