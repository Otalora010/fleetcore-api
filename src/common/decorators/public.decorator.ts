import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/metadata.constants.js';

/**
 * Marca un endpoint como público: el guard JWT global no exige token.
 * Solo para register, login y el endpoint de integración (que usa ApiKeyGuard).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
