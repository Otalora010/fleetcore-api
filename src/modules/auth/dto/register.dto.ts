import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum.js';
import { Trim } from '../../../common/utils/transformers.util.js';

export class RegisterDto {
  @ApiProperty({ example: 'Ana Admin' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Trim()
  name: string;

  @ApiProperty({ example: 'ana@fleetcore.com' })
  @IsEmail({}, { message: 'El correo no es válido' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @ApiProperty({ example: 'Secreta123', minLength: 8 })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TECHNICIAN })
  @IsEnum(UserRole, { message: 'El rol debe ser ADMIN o TECHNICIAN' })
  role: UserRole;
}
