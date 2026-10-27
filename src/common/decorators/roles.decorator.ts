import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/metadata.constants.js';
import { UserRole } from '../enums/user-role.enum.js';

/**
 * Declara los roles autorizados para un endpoint o controlador.
 * Sin @Roles cualquier usuario autenticado puede acceder.
 *
 * @example @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
