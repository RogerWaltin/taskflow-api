import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  Validate,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from 'class-validator';
import type { TaskPriority, TaskStatus } from '../tasks.types.js';

const TASK_STATUSES: TaskStatus[] = [
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
];
const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const TASK_SORT_FIELDS = [
  'number',
  'priority',
  'dueDate',
  'createdAt',
  '-number',
] as const;

@ValidatorConstraint({ name: 'unassignedConflictsWithAssignee', async: false })
class UnassignedAssigneeConflictConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const filters = args.object as TaskFiltersDto;
    return !(filters.unassigned === true && filters.assigneeId !== undefined);
  }

  defaultMessage(): string {
    return 'assigneeId cannot be combined with unassigned=true';
  }
}

export class TaskFiltersDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(TASK_STATUSES, { each: true })
  status?: TaskStatus[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(TASK_PRIORITIES, { each: true })
  priority?: TaskPriority[];

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  @Validate(UnassignedAssigneeConflictConstraint)
  unassigned?: boolean;

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

  @IsIn(TASK_SORT_FIELDS)
  sort: (typeof TASK_SORT_FIELDS)[number] = '-number';
}
