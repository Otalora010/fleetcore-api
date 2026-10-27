import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleStatus } from '../../common/enums/vehicle-status.enum.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { Vehicle } from './entities/vehicle.entity.js';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>,
  ) {}

  findAll(): Promise<Vehicle[]> {
    return this.vehicles.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicles.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehículo no encontrado');
    return vehicle;
  }

  async findByPlate(plate: string): Promise<Vehicle> {
    const normalized = plate.trim().toUpperCase();
    const vehicle = await this.vehicles.findOne({
      where: { plate: normalized },
    });
    if (!vehicle) {
      throw new NotFoundException(
        `No existe un vehículo con la placa ${normalized}`,
      );
    }
    return vehicle;
  }

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    await this.assertPlateFree(dto.plate);
    // El estado nunca lo define el cliente: un vehículo nuevo está disponible.
    return this.vehicles.save(
      this.vehicles.create({ ...dto, status: VehicleStatus.AVAILABLE }),
    );
  }

  async update(id: number, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    if (dto.plate !== undefined && dto.plate !== vehicle.plate) {
      await this.assertPlateFree(dto.plate);
    }
    if (dto.mileage !== undefined && dto.mileage < vehicle.mileage) {
      throw new BadRequestException(
        `El kilometraje no puede disminuir (actual: ${vehicle.mileage})`,
      );
    }
    Object.assign(vehicle, dto);
    return this.vehicles.save(vehicle);
  }

  async deactivate(id: number): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    if (vehicle.status === VehicleStatus.INACTIVE) {
      throw new ConflictException(
        `El vehículo ${vehicle.plate} ya está inactivo`,
      );
    }
    if (vehicle.status === VehicleStatus.IN_MAINTENANCE) {
      throw new ConflictException(
        `No se puede inactivar el vehículo ${vehicle.plate} porque está en mantenimiento`,
      );
    }
    // Eliminación lógica: se conserva la fila para no perder el historial.
    vehicle.status = VehicleStatus.INACTIVE;
    return this.vehicles.save(vehicle);
  }

  private async assertPlateFree(plate: string): Promise<void> {
    if (await this.vehicles.findOne({ where: { plate } })) {
      throw new ConflictException(
        `Ya existe un vehículo con la placa ${plate}`,
      );
    }
  }
}
