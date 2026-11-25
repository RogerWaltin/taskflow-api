
import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.DEVELOPMENT;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  DEFAULT_PAGE_SIZE = 20;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  MAX_PAGE_SIZE = 100;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
  });

  const messages = errors.flatMap((error) =>
    Object.values(error.constraints ?? {}).map(
      (message) =>
        `${error.property}: ${message} (received "${String(error.value)}")`,
    ),
  );

  // Cross-field validation
  if (
    Number.isInteger(validatedConfig.DEFAULT_PAGE_SIZE) &&
    Number.isInteger(validatedConfig.MAX_PAGE_SIZE) &&
    validatedConfig.DEFAULT_PAGE_SIZE > validatedConfig.MAX_PAGE_SIZE
  ) {
    messages.push(
      `DEFAULT_PAGE_SIZE: must not exceed MAX_PAGE_SIZE (${validatedConfig.DEFAULT_PAGE_SIZE} > ${validatedConfig.MAX_PAGE_SIZE})`,
    );
  }

  if (messages.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n\n${messages
        .map((message) => `- ${message}`)
        .join('\n')}`,
    );
  }

  return validatedConfig;
}
