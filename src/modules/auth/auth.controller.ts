import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ErrorResponseDto } from '../../common/dto/error-response.dto.js';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { User } from '../users/entities/user.entity.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario (ADMIN o TECHNICIAN)' })
  @ApiWrappedResponse(User, { status: 201, description: 'Usuario creado' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Correo ya registrado',
    type: ErrorResponseDto,
  })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión y obtener el JWT' })
  @ApiWrappedResponse(LoginResponseDto, {
    description: 'Devuelve { accessToken, user }',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    type: ErrorResponseDto,
  })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Datos del usuario autenticado' })
  @ApiWrappedResponse(User, { description: 'Usuario actual' })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido o expirado',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    type: ErrorResponseDto,
  })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.me(user.id);
  }
}
