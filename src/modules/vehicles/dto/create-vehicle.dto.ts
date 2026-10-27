import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Trim } from '../../../common/utils/transformers.util.js';

// Máximo calculado al validar (no al cargar el módulo) para no quedar obsoleto.
@ValidatorConstraint({ name: 'maxVehicleYear' })
class MaxVehicleYear implements ValidatorConstraintInterface {
  validate(value: number): boolean {
    return value <= new Date().getFullYear() + 1;
  }
  defaultMessage(): string {
    return `El año no puede superar ${new Date().getFullYear() + 1}`;
  }
}

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC123', maxLength: 10 })
  @IsString({ message: 'La placa debe ser texto' })
  @IsNotEmpty({ message: 'La placa es obligatoria' })
  @MaxLength(10, { message: 'La placa no puede superar 10 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'La placa solo admite letras, números y guion',
  })
  // Se normaliza a mayúsculas para que la unicidad no dependa del formato.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  plate: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString({ message: 'La marca debe ser texto' })
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  @Trim()
  brand: string;

  @ApiProperty({ example: 'Hilux' })
  @IsString({ message: 'El modelo debe ser texto' })
  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  @Trim()
  model: string;

  @ApiProperty({ example: 2022, minimum: 1900 })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(1900, { message: 'El año no puede ser anterior a 1900' })
  @Validate(MaxVehicleYear)
  year: number;

  @ApiProperty({ example: 15000, minimum: 0 })
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  mileage: number;
}
