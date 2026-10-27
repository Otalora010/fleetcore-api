import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedUser,
  RequestWithUser,
} from '../interfaces/authenticated-user.interface.js';

/**
 * Inyecta el usuario autenticado por el guard JWT.
 *
 * @example findAll(@CurrentUser() user: AuthenticatedUser)
 * @example findAll(@CurrentUser('role') role: UserRole)
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);
