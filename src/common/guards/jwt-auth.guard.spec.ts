import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../constants/metadata.constants.js';
import { UserRole } from '../enums/user-role.enum.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  const jwt = new JwtService({ secret: 'test-secret' });
  const reflector = new Reflector();
  const guard = new JwtAuthGuard(reflector, jwt);

  const ctx = (headers: Record<string, string>, isPublic = false) => {
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers,
    };
    const handler = () => undefined;
    if (isPublic) Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler);
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => class {},
    } as unknown as ExecutionContext;
    return { context, request };
  };

  const payload = { sub: 5, email: 'a@x.com', role: UserRole.TECHNICIAN };

  it('deja pasar rutas @Public sin token', async () => {
    await expect(guard.canActivate(ctx({}, true).context)).resolves.toBe(true);
  });

  it('sin header Authorization da 401', async () => {
    await expect(guard.canActivate(ctx({}).context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('esquema distinto de Bearer da 401', async () => {
    const token = await jwt.signAsync(payload);
    await expect(
      guard.canActivate(ctx({ authorization: `Basic ${token}` }).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('token inválido da 401', async () => {
    await expect(
      guard.canActivate(ctx({ authorization: 'Bearer basura' }).context),
    ).rejects.toThrow('Token inválido o expirado');
  });

  it('token firmado con otra clave da 401', async () => {
    const other = await new JwtService({ secret: 'otra' }).signAsync(payload);
    await expect(
      guard.canActivate(ctx({ authorization: `Bearer ${other}` }).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('token expirado da 401', async () => {
    const expired = await jwt.signAsync(payload, { expiresIn: -10 });
    await expect(
      guard.canActivate(ctx({ authorization: `Bearer ${expired}` }).context),
    ).rejects.toThrow('Token inválido o expirado');
  });

  it('token válido pasa y adjunta request.user', async () => {
    const token = await jwt.signAsync(payload);
    const { context, request } = ctx({ authorization: `Bearer ${token}` });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 5,
      email: 'a@x.com',
      role: UserRole.TECHNICIAN,
    });
  });
});
