import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { WorkshopStatus } from '../../../common/enums/workshop-status.enum.js';

@Entity('workshops')
export class Workshop {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Taller Norte' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'Cra. 15 #42-10, Bogotá' })
  @Column()
  address: string;

  @ApiProperty({ enum: WorkshopStatus, example: WorkshopStatus.ACTIVE })
  @Column({
    type: 'enum',
    enum: WorkshopStatus,
    default: WorkshopStatus.ACTIVE,
  })
  status: WorkshopStatus;
}
