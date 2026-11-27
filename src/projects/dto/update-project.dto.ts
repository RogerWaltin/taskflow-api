import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsIn, ValidateIf } from 'class-validator';

import { AtLeastOneField } from '../../common/validators/at-least-one-field.decorator.js';
import { CreateProjectDto } from './create-project.dto.js';

@AtLeastOneField(['name', 'description', 'status'])
export class UpdateProjectDto extends PartialType(
  OmitType(CreateProjectDto, ['key'] as const),
  { skipNullProperties: false },
) {
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['ACTIVE', 'ARCHIVED'])
  status?: 'ACTIVE' | 'ARCHIVED';
}
