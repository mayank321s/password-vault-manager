import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentScimContextData {
  organizationId: string;
  scimTokenId: string;
  tokenLabel: string;
}

export const CurrentScimContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentScimContextData => {
    const request = ctx.switchToHttp().getRequest();
    return request.scimContext;
  },
);
