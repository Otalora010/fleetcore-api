import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto.js';

const check = (over: object) =>
  validate(
    plainToInstance(RegisterDto, {
      name: 'Ana',
      email: 'Ana@X.com',
      password: 'Secreta123',
      role: 'ADMIN',
      ...over,
    }),
  );

describe('RegisterDto', () => {
  it.each(['ADMIN', 'TECHNICIAN'])('acepta el rol %s', async (role) => {
    expect(await check({ role })).toHaveLength(0);
  });

  it('rechaza roles fuera del enunciado', async () => {
    const errors = await check({ role: 'MANAGER' });
    expect(errors.map((e) => e.property)).toContain('role');
  });

  it('rechaza contraseñas de menos de 8 caracteres', async () => {
    const errors = await check({ password: '1234567' });
    expect(errors.map((e) => e.property)).toContain('password');
  });

  it('normaliza el correo a minúsculas', () => {
    const dto = plainToInstance(RegisterDto, { email: ' Ana@X.com ' });
    expect(dto.email).toBe('ana@x.com');
  });
});
