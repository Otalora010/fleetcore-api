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
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { Workshop } from './entities/workshop.entity.js';
import { WorkshopsService } from './workshops.service.js';

const err = (status: number, description: string) =>
  ApiResponse({ status, description, type: ErrorResponseDto });

@ApiTags('Workshops')
@ApiBearerAuth()
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshops: WorkshopsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar talleres activos' })
  @ApiWrappedResponse(Workshop, {
    isArray: true,
    description: 'Talleres activos',
  })
  @err(401, 'Token ausente, inválido o expirado')
  findAll() {
    return this.workshops.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar un taller por id (aunque esté inactivo)',
  })
  @ApiWrappedResponse(Workshop, { description: 'Taller' })
  @err(400, 'Id inválido')
  @err(401, 'Token ausente, inválido o expirado')
  @err(404, 'Taller inexistente')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workshops.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un taller activo (ADMIN)' })
  @ApiWrappedResponse(Workshop, { status: 201, description: 'Taller creado' })
  @err(400, 'Datos inválidos')
  @err(401, 'Token ausente, inválido o expirado')
  @err(403, 'Rol insuficiente')
  @err(409, 'Nombre repetido')
  create(@Body() dto: CreateWorkshopDto) {
    return this.workshops.create(dto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar un taller (ADMIN)' })
  @ApiWrappedResponse(Workshop, { description: 'Taller activado' })
  @err(401, 'Token ausente, inválido o expirado')
  @err(403, 'Rol insuficiente')
  @err(404, 'Taller inexistente')
  @err(409, 'Ya está activo')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.workshops.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Inactivar un taller sin borrar historial (ADMIN)',
  })
  @ApiWrappedResponse(Workshop, { description: 'Taller inactivado' })
  @err(401, 'Token ausente, inválido o expirado')
  @err(403, 'Rol insuficiente')
  @err(404, 'Taller inexistente')
  @err(409, 'Ya está inactivo')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.workshops.deactivate(id);
  }
}
