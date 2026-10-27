import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../constants/metadata.constants.js';
import { UserRole } from '../enums/user-role.enum.js';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  const ctx = (opts: {
    roles?: UserRole[];
    isPublic?: boolean;
    user?: { role: UserRole };
  }) => {
    const handler = () => undefined;
    if (opts.roles) Reflect.defineMetadata(ROLES_KEY, opts.roles, handler);
    if (opts.isPublic) Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler);
    return {
      switchToHttp: () => ({ getRequest: () => ({ user: opts.user }) }),
      getHandler: () => handler,
      getClass: () => class {},
    } as unknown as ExecutionContext;
  };

  it('sin @Roles pasa', () => {
    expect(
      guard.canActivate(ctx({ user: { role: UserRole.TECHNICIAN } })),
    ).toBe(true);
  });

  it('rol correcto pasa', () => {
    const c = ctx({ roles: [UserRole.ADMIN], user: { role: UserRole.ADMIN } });
    expect(guard.canActivate(c)).toBe(true);
  });

  it('rol incorrecto da Forbidden', () => {
    const c = ctx({
      roles: [UserRole.ADMIN],
      user: { role: UserRole.TECHNICIAN },
    });
    expect(() => guard.canActivate(c)).toThrow(ForbiddenException);
  });

  it('sin user da Forbidden', () => {
    expect(() => guard.canActivate(ctx({ roles: [UserRole.ADMIN] }))).toThrow(
      ForbiddenException,
    );
  });

  it('ruta pública pasa', () => {
    expect(
      guard.canActivate(ctx({ roles: [UserRole.ADMIN], isPublic: true })),
    ).toBe(true);
  });
});
