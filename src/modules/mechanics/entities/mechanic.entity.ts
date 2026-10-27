import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MechanicStatus } from '../../../common/enums/mechanic-status.enum.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('mechanics')
export class Mechanic {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Carlos Pérez' })
  @Column()
  name: string;

  @ApiProperty({ example: 'carlos@fleetcore.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'Frenos y suspensión' })
  @Column()
  specialty: string;

  @ApiProperty({ enum: MechanicStatus, example: MechanicStatus.ACTIVE })
  @Column({
    type: 'enum',
    enum: MechanicStatus,
    default: MechanicStatus.ACTIVE,
  })
  status: MechanicStatus;

  // Vínculo opcional 1:1 con el usuario técnico que consulta sus mantenimientos.
  @ApiProperty({ type: () => User, nullable: true })
  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @ApiProperty({ example: 2, nullable: true })
  @Column({ type: 'int', nullable: true, unique: true })
  userId: number | null;
}
