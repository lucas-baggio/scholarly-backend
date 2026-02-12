import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  userId: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user?: CurrentUserPayload;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentUserPayload | undefined,
    ctx: ExecutionContext,
  ): CurrentUserPayload | string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (data && user) {
      return user[data];
    }
    return user as CurrentUserPayload;
  },
);
