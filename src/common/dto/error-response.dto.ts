import { ApiProperty } from '@nestjs/swagger';

/** Forma de TODAS las respuestas de error (generada por AllExceptionsFilter). */
export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'El vehículo ABC123 ya tiene un mantenimiento activo',
  })
  message: string | string[];

  @ApiProperty({ example: '/api/maintenances' })
  path: string;

  @ApiProperty({ example: '2026-10-20T19:00:00.000Z' })
  timestamp: string;
}
