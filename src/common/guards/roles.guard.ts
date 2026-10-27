import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants/metadata.constants.js';
import { UserRole } from '../enums/user-role.enum.js';
import { RequestWithUser } from '../interfaces/authenticated-user.interface.js';
import { isPublicRoute } from '../utils/is-public.util.js';

/**
 * Aplica los roles declarados con @Roles(...). Corre después del guard JWT,
 * así request.user ya existe. El rol sale del token, nunca del cliente.
 * Si el endpoint no declara roles, basta con estar autenticado.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (isPublicRoute(this.reflector, context)) return true;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Requiere uno de los roles: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}
