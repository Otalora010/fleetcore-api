import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Trim } from '../../../common/utils/transformers.util.js';

export class CreateMechanicDto {
  @ApiProperty({ example: 'Carlos Pérez' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Trim()
  name: string;

  @ApiProperty({ example: 'carlos@fleetcore.com' })
  @IsEmail({}, { message: 'El correo no es válido' })
  // Se normaliza para que la unicidad no dependa de mayúsculas ni espacios.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @ApiProperty({ example: 'Frenos y suspensión' })
  @IsString({ message: 'La especialidad debe ser texto' })
  @IsNotEmpty({ message: 'La especialidad es obligatoria' })
  @Trim()
  specialty: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Id de un usuario con rol TECHNICIAN',
  })
  @IsOptional()
  @IsInt({ message: 'El id de usuario debe ser un número entero' })
  @Min(1, { message: 'El id de usuario debe ser mayor o igual a 1' })
  userId?: number;
}
