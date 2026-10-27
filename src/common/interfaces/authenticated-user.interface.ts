import { Request } from 'express';
import { UserRole } from '../enums/user-role.enum.js';

/** Usuario autenticado (payload del JWT) adjuntado a request.user. */
export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}
