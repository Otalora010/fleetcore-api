import { ValidationPipe } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateWorkshopDto } from './create-workshop.dto.js';

const valid = {
  name: 'Taller Norte',
  address: 'Cra. 15 #42-10, Bogotá',
};
const check = (over: object) =>
  validate(plainToInstance(CreateWorkshopDto, { ...valid, ...over }));
const props = (errors: { property: string }[]) => errors.map((e) => e.property);

describe('CreateWorkshopDto', () => {
  it('acepta un taller válido sin campos extra', async () => {
    expect(await check({})).toHaveLength(0);
  });

  it('rechaza nombre vacío con error en name', async () => {
    expect(props(await check({ name: '   ' }))).toContain('name');
  });

  it('rechaza address vacío con error en address', async () => {
    expect(props(await check({ address: '' }))).toContain('address');
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
        { type: 'body', metatype: CreateWorkshopDto },
      ),
    ).rejects.toThrow();
  });

  it('recorta espacios en name y address con @Trim', () => {
    const dto = plainToInstance(CreateWorkshopDto, {
      name: '  Taller Sur  ',
      address: '  Cra. 7 #12-34  ',
    });
    expect(dto.name).toBe('Taller Sur');
    expect(dto.address).toBe('Cra. 7 #12-34');
  });
});
