import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MechanicStatus } from '../../common/enums/mechanic-status.enum.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { User } from '../users/entities/user.entity.js';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';
import { UpdateMechanicDto } from './dto/update-mechanic.dto.js';
import { Mechanic } from './entities/mechanic.entity.js';

@Injectable()
export class MechanicsService {
  constructor(
    @InjectRepository(Mechanic)
    private readonly mechanics: Repository<Mechanic>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  // User tiene password con select:false, así que la relación nunca lo devuelve.
  findAll(): Promise<Mechanic[]> {
    return this.mechanics.find({
      relations: { user: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Mechanic> {
    const mechanic = await this.mechanics.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!mechanic) throw new NotFoundException('Mecánico no encontrado');
    return mechanic;
  }

  async create(dto: CreateMechanicDto): Promise<Mechanic> {
    await this.assertEmailFree(dto.email);
    if (dto.userId !== undefined) await this.assertUserLinkable(dto.userId);
    // El estado nunca lo define el cliente: un mecánico nuevo está activo.
    const saved = await this.mechanics.save(
      this.mechanics.create({ ...dto, status: MechanicStatus.ACTIVE }),
    );
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateMechanicDto): Promise<Mechanic> {
    const mechanic = await this.findOne(id);
    if (dto.email !== undefined && dto.email !== mechanic.email) {
      await this.assertEmailFree(dto.email);
    }
    if (dto.userId !== undefined) {
      await this.assertUserLinkable(dto.userId, mechanic.id);
    }
    const { userId, ...data } = dto;
    Object.assign(mechanic, data);
    if (userId !== undefined) {
      // La relación cargada gana sobre la columna: si quedara null o con otro id,
      // TypeORM escribiría NULL/otro valor en la FK. Se alinean ambas.
      mechanic.user = { id: userId } as User;
      mechanic.userId = userId;
    }
    await this.mechanics.save(mechanic);
    return this.findOne(id);
  }

  async activate(id: number): Promise<Mechanic> {
    const mechanic = await this.findOne(id);
    if (mechanic.status === MechanicStatus.ACTIVE) {
      throw new ConflictException(
        `El mecánico ${mechanic.name} ya está activo`,
      );
    }
    mechanic.status = MechanicStatus.ACTIVE;
    return this.mechanics.save(mechanic);
  }

  async deactivate(id: number): Promise<Mechanic> {
    const mechanic = await this.findOne(id);
    if (mechanic.status === MechanicStatus.INACTIVE) {
      throw new ConflictException(
        `El mecánico ${mechanic.name} ya está inactivo`,
      );
    }
    // Eliminación lógica: se conserva la fila para no perder el historial.
    mechanic.status = MechanicStatus.INACTIVE;
    return this.mechanics.save(mechanic);
  }

  private async assertEmailFree(email: string): Promise<void> {
    if (await this.mechanics.findOne({ where: { email } })) {
      throw new ConflictException(
        `Ya existe un mecánico con el correo ${email}`,
      );
    }
  }

  // Valida que el usuario exista, sea técnico y no esté ligado a otro mecánico.
  private async assertUserLinkable(
    userId: number,
    mechanicId?: number,
  ): Promise<void> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.role !== UserRole.TECHNICIAN) {
      throw new BadRequestException(
        'El usuario vinculado debe tener rol TECHNICIAN',
      );
    }
    const linked = await this.mechanics.findOne({ where: { userId } });
    if (linked && linked.id !== mechanicId) {
      throw new ConflictException(
        `El usuario ya está vinculado al mecánico ${linked.name}`,
      );
    }
  }
}
