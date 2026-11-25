import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const OrgId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const orgId = request.headers['x-org-id'];

    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (typeof orgId !== 'string' || !uuidV4Regex.test(orgId)) {
      throw new BadRequestException('X-Org-Id header must be a UUID');
    }

    return orgId;
  },
);
