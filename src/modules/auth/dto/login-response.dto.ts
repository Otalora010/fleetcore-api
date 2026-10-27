import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum.js';

class LoginUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Ana Admin' })
  name: string;

  @ApiProperty({ example: 'ana@fleetcore.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;
}

/** Solo documenta en Swagger la respuesta de login. */
export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ type: LoginUserDto })
  user: LoginUserDto;
}
