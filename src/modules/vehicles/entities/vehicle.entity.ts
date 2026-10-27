import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleStatus } from '../../../common/enums/vehicle-status.enum.js';

@Entity('vehicles')
export class Vehicle {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'ABC123' })
  @Column({ unique: true, length: 10 })
  plate: string;

  @ApiProperty({ example: 'Toyota' })
  @Column()
  brand: string;

  @ApiProperty({ example: 'Hilux' })
  @Column()
  model: string;

  @ApiProperty({ example: 2022 })
  @Column({ type: 'int' })
  year: number;

  @ApiProperty({ example: 15000 })
  @Column({ type: 'int' })
  mileage: number;

  @ApiProperty({ enum: VehicleStatus, example: VehicleStatus.AVAILABLE })
  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus;
}
