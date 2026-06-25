import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../../auth/interfaces/index.js';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: RequestUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
