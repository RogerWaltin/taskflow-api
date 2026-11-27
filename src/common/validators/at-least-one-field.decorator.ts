import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneField', async: false })
class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const object = args.object as Record<string, unknown>;
    const [fields] = args.constraints as [string[]];

    // Prevent clients from supplying the internal validation property.
    if (Object.hasOwn(object, '__atLeastOneField')) {
      return false;
    }

    return fields.some((field) => object[field] !== undefined);
  }

  defaultMessage(): string {
    return 'At least one field must be provided';
  }
}

export function AtLeastOneField(
  fields: string[],
  validationOptions?: ValidationOptions,
): ClassDecorator {
  return (target) => {
    registerDecorator({
      name: 'atLeastOneField',
      target,
      propertyName: '__atLeastOneField',
      constraints: [fields],
      options: validationOptions,
      validator: AtLeastOneFieldConstraint,
    });
  };
}
