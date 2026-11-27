import { PartialType } from '@nestjs/mapped-types';
import { IsIn, ValidateIf } from 'class-validator';

import { AtLeastOneField } from '../../common/validators/at-least-one-field.decorator.js';
import { CreateTaskDto } from './create-task.dto.js';

@AtLeastOneField([
  'title',
  'description',
  'status',
  'priority',
  'assigneeId',
  'dueDate',
])
export class UpdateTaskDto extends PartialType(CreateTaskDto, {
  skipNullProperties: false,
}) {
  constructor() {
    super();
    // CreateTaskDto defaults priority for creation, but an omitted PATCH field
    // must remain omitted so an empty patch can be rejected.
    this.priority = undefined;
  }

  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
}
