import { ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateVehicleDto } from './create-vehicle.dto.js';

const valid = {
  plate: 'abc123',
  brand: 'Toyota',
  model: 'Hilux',
  year: 2022,
  mileage: 1000,
};
const check = (over: object) =>
  validate(plainToInstance(CreateVehicleDto, { ...valid, ...over }));
const props = (errors: { property: string }[]) => errors.map((e) => e.property);

describe('CreateVehicleDto', () => {
  it('acepta un vehículo válido', async () => {
    expect(await check({})).toHaveLength(0);
  });

  it('rechaza año 1899', async () => {
    expect(props(await check({ year: 1899 }))).toContain('year');
  });

  it('rechaza año actual + 2', async () => {
    const year = new Date().getFullYear() + 2;
    expect(props(await check({ year }))).toContain('year');
  });

  it('acepta año actual + 1', async () => {
    const year = new Date().getFullYear() + 1;
    expect(await check({ year })).toHaveLength(0);
  });

  it('rechaza kilometraje negativo', async () => {
    expect(props(await check({ mileage: -1 }))).toContain('mileage');
  });

  it('rechaza placa con caracteres inválidos', async () => {
    expect(props(await check({ plate: 'AB C#1' }))).toContain('plate');
  });

  it('transforma la placa a mayúsculas', () => {
    expect(plainToInstance(CreateVehicleDto, valid).plate).toBe('ABC123');
  });

  it('rechaza la propiedad status con forbidNonWhitelisted', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
    await expect(
      pipe.transform(
        { ...valid, status: 'INACTIVE' },
        { type: 'body', metatype: CreateVehicleDto },
      ),
    ).rejects.toThrow();
  });
});
