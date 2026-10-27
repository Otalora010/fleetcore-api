import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import {
  AuthenticatedUser,
  RequestWithUser,
} from '../interfaces/authenticated-user.interface.js';
import { headerValue, isPublicRoute } from '../utils/is-public.util.js';

type JwtPayload = {
  sub: number;
  email: string;
  role: AuthenticatedUser['role'];
};

/**
 * Guard global: todo endpoint exige JWT salvo los marcados con @Public().
 * Verifica firma y expiración sin consultar la BD y deja el usuario en
 * request.user para RolesGuard y @CurrentUser().
 * No consulta la BD: al ser guard global se evitaría una consulta por petición;
 * el token vale hasta expirar.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isPublicRoute(this.reflector, context)) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const header = headerValue(request.headers.authorization);
    const [scheme, token] = header?.split(/\s+/) ?? [];
    if (!header || scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return true;
  }
}
