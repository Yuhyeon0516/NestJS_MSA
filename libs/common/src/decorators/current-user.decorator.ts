import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '../models';

function getCurrentUserByContext(context: ExecutionContext): User {
  return context.switchToHttp().getRequest().user;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
