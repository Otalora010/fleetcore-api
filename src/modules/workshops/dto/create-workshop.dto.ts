import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../common/utils/transformers.util.js';

export class CreateWorkshopDto {
  @ApiProperty({ example: 'Taller Norte' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Trim()
  name: string;

  @ApiProperty({ example: 'Cra. 15 #42-10, Bogotá' })
  @IsString({ message: 'La dirección debe ser texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @Trim()
  address: string;
}
