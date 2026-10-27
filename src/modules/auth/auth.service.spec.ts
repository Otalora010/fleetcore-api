import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const repo = {
    existsBy: jest.fn(),
    create: jest.fn((v: object) => v),
    save: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const jwt = { signAsync: jest.fn() };
  let service: AuthService;

  const mockLoginUser = (user: unknown) => {
    const qb = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(user),
    };
    repo.createQueryBuilder.mockReturnValue(qb);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(repo as never, jwt as never);
  });

  const dto = {
    name: 'Ana',
    email: 'ana@x.com',
    password: 'Secreta123',
    role: UserRole.ADMIN,
  };

  it('register guarda el hash y no devuelve password', async () => {
    repo.existsBy.mockResolvedValue(false);
    repo.save.mockImplementation((u: object) =>
      Promise.resolve({ id: 1, createdAt: new Date(), ...u }),
    );
    const res = await service.register(dto);
    const saved = (repo.save.mock.calls as [{ password: string }][])[0][0];
    expect(saved.password).not.toBe(dto.password);
    expect(await bcrypt.compare(dto.password, saved.password)).toBe(true);
    expect(res).not.toHaveProperty('password');
    expect(res.email).toBe(dto.email);
  });

  it('register con correo duplicado lanza Conflict', async () => {
    repo.existsBy.mockResolvedValue(true);
    await expect(service.register(dto)).rejects.toThrow(ConflictException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('login correcto firma {sub,email,role} y no devuelve password', async () => {
    const hash = await bcrypt.hash(dto.password, 4);
    mockLoginUser({
      id: 7,
      name: 'Ana',
      email: dto.email,
      role: UserRole.ADMIN,
      password: hash,
    });
    jwt.signAsync.mockResolvedValue('tok');
    const res = await service.login({
      email: dto.email,
      password: dto.password,
    });
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 7,
      email: dto.email,
      role: UserRole.ADMIN,
    });
    expect(res.accessToken).toBe('tok');
    expect(res.user).toEqual({
      id: 7,
      name: 'Ana',
      email: dto.email,
      role: UserRole.ADMIN,
    });
  });

  it('login con correo inexistente da Credenciales inválidas', async () => {
    mockLoginUser(null);
    await expect(
      service.login({ email: 'no@x.com', password: 'x' }),
    ).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));
  });

  it('login con contraseña incorrecta da el mismo error', async () => {
    mockLoginUser({
      id: 1,
      email: dto.email,
      role: UserRole.ADMIN,
      password: await bcrypt.hash('otra-clave', 4),
    });
    await expect(
      service.login({ email: dto.email, password: dto.password }),
    ).rejects.toThrow(new UnauthorizedException('Credenciales inválidas'));
  });

  it('me inexistente lanza NotFound', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.me(99)).rejects.toThrow(NotFoundException);
  });
});
