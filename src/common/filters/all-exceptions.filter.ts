import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { ErrorResponseDto } from '../dto/error-response.dto.js';

/** Códigos de error de PostgreSQL que son culpa del cliente, no del servidor. */
const PG_ERRORS: Record<string, { statusCode: number; message: string }> = {
  '23505': {
    statusCode: HttpStatus.CONFLICT,
    message: 'El registro ya existe',
  },
  '23503': {
    statusCode: HttpStatus.CONFLICT,
    message: 'El registro está relacionado con otros datos',
  },
  '22P02': {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Formato de dato inválido',
  },
};

/**
 * Normaliza TODOS los errores a { success: false, statusCode, message, path, timestamp }.
 * - HttpException (400, 401, 403, 404, 409...) conserva su código real.
 * - Errores conocidos de TypeORM/PostgreSQL se traducen a 400/404/409 en vez de 500.
 * - Solo lo realmente inesperado responde 500, sin filtrar detalles internos.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { statusCode, message } = this.resolve(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseDto = {
      success: false,
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    response.status(statusCode).json(body);
  }

  private resolve(exception: unknown): {
    statusCode: number;
    message: string | string[];
  } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message ??
            exception.message);
      return { statusCode: exception.getStatus(), message };
    }
    if (exception instanceof EntityNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Recurso no encontrado',
      };
    }
    if (exception instanceof QueryFailedError) {
      const code = (exception.driverError as { code?: string } | undefined)
        ?.code;
      const known = code ? PG_ERRORS[code] : undefined;
      if (known) return known;
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
    };
  }
}
