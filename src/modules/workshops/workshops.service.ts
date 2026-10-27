import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkshopStatus } from '../../common/enums/workshop-status.enum.js';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { Workshop } from './entities/workshop.entity.js';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshops: Repository<Workshop>,
  ) {}

  // El listado es solo de activos: los inactivos se consultan por id (CA §4.3).
  findAll(): Promise<Workshop[]> {
    return this.workshops.find({
      where: { status: WorkshopStatus.ACTIVE },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Workshop> {
    const workshop = await this.workshops.findOne({ where: { id } });
    if (!workshop) throw new NotFoundException('Taller no encontrado');
    return workshop;
  }

  async create(dto: CreateWorkshopDto): Promise<Workshop> {
    await this.assertNameFree(dto.name);
    // El estado nunca lo define el cliente: un taller nuevo está activo.
    return this.workshops.save(
      this.workshops.create({ ...dto, status: WorkshopStatus.ACTIVE }),
    );
  }

  async activate(id: number): Promise<Workshop> {
    const workshop = await this.findOne(id);
    if (workshop.status === WorkshopStatus.ACTIVE) {
      throw new ConflictException(`El taller ${workshop.name} ya está activo`);
    }
    workshop.status = WorkshopStatus.ACTIVE;
    return this.workshops.save(workshop);
  }

  async deactivate(id: number): Promise<Workshop> {
    const workshop = await this.findOne(id);
    if (workshop.status === WorkshopStatus.INACTIVE) {
      throw new ConflictException(
        `El taller ${workshop.name} ya está inactivo`,
      );
    }
    // Inactivación lógica: se conserva la fila para no perder el historial (REQ-MAN).
    workshop.status = WorkshopStatus.INACTIVE;
    return this.workshops.save(workshop);
  }

  // Unicidad exacta y sensible a mayúsculas (como el correo de mecánicos), con trim en el DTO.
  private async assertNameFree(name: string): Promise<void> {
    if (await this.workshops.findOne({ where: { name } })) {
      throw new ConflictException(`Ya existe un taller con el nombre ${name}`);
    }
  }
}
