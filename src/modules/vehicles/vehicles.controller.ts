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
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { Vehicle } from './entities/vehicle.entity.js';
import { VehiclesService } from './vehicles.service.js';

const err = (status: number, description: string) =>
  ApiResponse({ status, description, type: ErrorResponseDto });

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar vehículos' })
  @ApiWrappedResponse(Vehicle, { isArray: true, description: 'Vehículos' })
  @err(401, 'Token ausente, inválido o expirado')
  findAll() {
    return this.vehicles.findAll();
  }

  // Ruta fija antes de ':id' para que 'plate' no se interprete como id.
  @Get('plate/:plate')
  @ApiOperation({ summary: 'Consultar un vehículo por placa' })
  @ApiWrappedResponse(Vehicle, { description: 'Vehículo' })
  @err(401, 'Token ausente, inválido o expirado')
  @err(404, 'Vehículo inexistente')
  findByPlate(@Param('plate') plate: string) {
    return this.vehicles.findByPlate(plate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un vehículo por id' })
  @ApiWrappedResponse(Vehicle, { description: 'Vehículo' })
  @err(400, 'Id inválido')
  @err(401, 'Token ausente, inválido o expirado')
  @err(404, 'Vehículo inexistente')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehicles.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un vehículo (ADMIN)' })
  @ApiWrappedResponse(Vehicle, { status: 201, description: 'Vehículo creado' })
  @err(400, 'Datos inválidos')
  @err(401, 'Token ausente, inválido o expirado')
  @err(403, 'Rol insuficiente')
  @err(409, 'Placa ya registrada')
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar datos de un vehículo (ADMIN)' })
  @ApiWrappedResponse(Vehicle, { description: 'Vehículo actualizado' })
  @err(400, 'Datos inválidos o kilometraje menor al actual')
  @err(401, 'Token ausente, inválido o expirado')
  @err(403, 'Rol insuficiente')
  @err(404, 'Vehículo inexistente')
  @err(409, 'Placa ya registrada')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(id, dto);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Inactivar un vehículo sin borrar historial (ADMIN)',
  })
  @ApiWrappedResponse(Vehicle, { description: 'Vehículo inactivado' })
  @err(401, 'Token ausente, inválido o expirado')
  @err(403, 'Rol insuficiente')
  @err(404, 'Vehículo inexistente')
  @err(409, 'Ya inactivo o en mantenimiento')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.vehicles.deactivate(id);
  }
}
