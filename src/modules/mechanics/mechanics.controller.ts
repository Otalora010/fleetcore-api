import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../common/decorators/api-wrapped-response.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { ErrorResponseDto } from '../../common/dto/error-response.dto.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';
import { UpdateMechanicDto } from './dto/update-mechanic.dto.js';
import { Mechanic } from './entities/mechanic.entity.js';
import { MechanicsService } from './mechanics.service.js';

const err = (status: number, description: string) =>
  ApiResponse({ status, description, type: ErrorResponseDto });

@ApiTags('Mechanics')
@ApiBearerAuth()
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanics: MechanicsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mecánicos' })
  @ApiWrappedResponse(Mechanic, { isArray: true, description: 'Mecánicos' })
  @err(401, 'Token ausente, inválido o expirado')
  findAll() {
    return this.mechanics.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un mecánico por id' })
  @ApiWrappedResponse(Mechanic, { description: 'Mecánico' })
  @err(400, 'Id inválido')
  @err(401, 'Token ausente, inválido o expirado')
  @err(404, 'Mecánico inexistente')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mechanics.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un mecánico activo (ADMIN)' })
  @ApiWrappedResponse(Mechanic, { status: 201, description: 'Mecánico creado' })
  @err(400, 'Datos inválidos o usuario que no es TECHNICIAN')
  @err(401, 'Token ausente, inválido o expirado')
  @err(403, 'Rol insuficiente')
  @err(404, 'Usuario a vincular inexistente')
  @err(409, 'Correo repetido o usuario ya vinculado')
  create(@Body() dto: CreateMechanicDto) {
    return this.mechanics.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar datos de un mecánico (ADMIN)' })
  @ApiWrappedResponse(Mechanic, { description: 'Mecánico actualizado' })
  @err(400, 'Datos inválidos o usuario que no es TECHNICIAN')
  @err(401, 'Token ausente, inválido o expirado')
  @err(403, 'Rol insuficiente')
  @err(404, 'Mecánico o usuario inexistente')
  @err(409, 'Correo repetido o usuario ya vinculado')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMechanicDto,
  ) {
    return this.mechanics.update(id, dto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar un mecánico (ADMIN)' })
  @ApiWrappedResponse(Mechanic, { description: 'Mecánico activado' })
  @err(401, 'Token ausente, inválido o expirado')
  @err(403, 'Rol insuficiente')
  @err(404, 'Mecánico inexistente')
  @err(409, 'Ya está activo')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.mechanics.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Inactivar un mecánico sin borrar historial (ADMIN)',
  })
  @ApiWrappedResponse(Mechanic, { description: 'Mecánico inactivado' })
  @err(401, 'Token ausente, inválido o expirado')
  @err(403, 'Rol insuficiente')
  @err(404, 'Mecánico inexistente')
  @err(409, 'Ya está inactivo')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.mechanics.deactivate(id);
  }
}
