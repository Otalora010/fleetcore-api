import { ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMechanicDto } from './create-mechanic.dto.js';

const valid = {
  name: 'Carlos Pérez',
  email: 'carlos@fleetcore.com',
  specialty: 'Frenos',
};
const check = (over: object) =>
  validate(plainToInstance(CreateMechanicDto, { ...valid, ...over }));
const props = (errors: { property: string }[]) => errors.map((e) => e.property);

describe('CreateMechanicDto', () => {
  it('acepta un mecánico válido sin userId', async () => {
    expect(await check({})).toHaveLength(0);
  });

  it('acepta un userId válido', async () => {
    expect(await check({ userId: 2 })).toHaveLength(0);
  });

  it('rechaza correo inválido', async () => {
    expect(props(await check({ email: 'no-es-correo' }))).toContain('email');
  });

  it('rechaza nombre vacío', async () => {
    expect(props(await check({ name: '   ' }))).toContain('name');
  });

  it('rechaza especialidad vacía', async () => {
    expect(props(await check({ specialty: '' }))).toContain('specialty');
  });

  it('rechaza userId 0', async () => {
    expect(props(await check({ userId: 0 }))).toContain('userId');
  });

  it('rechaza userId texto', async () => {
    expect(props(await check({ userId: 'abc' }))).toContain('userId');
  });

  it('normaliza el correo a minúsculas sin espacios', () => {
    const dto = plainToInstance(CreateMechanicDto, {
      ...valid,
      email: '  Carlos@FleetCore.COM ',
    });
    expect(dto.email).toBe('carlos@fleetcore.com');
  });

  it('rechaza status con forbidNonWhitelisted', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
    await expect(
      pipe.transform(
        { ...valid, status: 'INACTIVE' },
        { type: 'body', metatype: CreateMechanicDto },
      ),
    ).rejects.toThrow();
  });
});
