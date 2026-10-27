import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum.js';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Ana Admin' })
  @Column()
  name: string;

  @ApiProperty({ example: 'ana@fleetcore.com' })
  @Column({ unique: true })
  email: string;

  // select:false evita que el hash viaje en cualquier consulta normal.
  @Column({ select: false })
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TECHNICIAN })
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @ApiProperty({ example: '2026-10-27T12:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;
}
