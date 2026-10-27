import { ArgumentsHost, ConflictException, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ErrorResponseDto } from '../dto/error-response.dto.js';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

const run = (exception: unknown) => {
  const json = jest.fn<void, [ErrorResponseDto]>();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url: '/api/test', method: 'POST' }),
    }),
  } as unknown as ArgumentsHost;
  new AllExceptionsFilter().catch(exception, host);
  return { status, body: json.mock.calls[0][0] };
};

const pgError = (code: string) =>
  new QueryFailedError('INSERT', [], Object.assign(new Error('pg'), { code }));

describe('AllExceptionsFilter', () => {
  it('conserva el código y mensaje de una HttpException', () => {
    const { status, body } = run(new ConflictException('Ya existe'));
    expect(status).toHaveBeenCalledWith(409);
    expect(body).toMatchObject({
      success: false,
      statusCode: 409,
      message: 'Ya existe',
      path: '/api/test',
    });
    expect(typeof body.timestamp).toBe('string');
  });

  it.each([
    ['23505', 409],
    ['23503', 409],
    ['22P02', 400],
  ])('traduce el error de PostgreSQL %s a %i', (code, expected) => {
    expect(run(pgError(code)).status).toHaveBeenCalledWith(expected);
  });

  it('responde 500 sin detalles ante un error inesperado', () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { status, body } = run(new Error('secreto interno'));
    expect(status).toHaveBeenCalledWith(500);
    expect(body.message).toBe('Error interno del servidor');
  });
});
