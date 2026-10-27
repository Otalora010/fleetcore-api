import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { MechanicStatus } from '../../common/enums/mechanic-status.enum.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { MechanicsService } from './mechanics.service.js';

describe('MechanicsService', () => {
  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((v: object) => v),
    save: jest.fn((v: object) => Promise.resolve({ id: 1, ...v })),
    delete: jest.fn(),
    remove: jest.fn(),
  };
  const usersRepo = { findOne: jest.fn() };
  let service: MechanicsService;

  const mechanic = (over: object = {}) => ({
    id: 1,
    name: 'Carlos',
    email: 'carlos@x.com',
    specialty: 'Frenos',
    status: MechanicStatus.ACTIVE,
    userId: null,
    user: null,
    ...over,
  });
  const dto = { name: 'Ana', email: 'ana@x.com', specialty: 'Motor' };

  // Simula la BD: findOne responde según el criterio de búsqueda.
  const mockDb = (opts: {
    byId?: object | null;
    byEmail?: object | null;
    byUserId?: object | null;
  }) =>
    repo.findOne.mockImplementation(
      ({ where }: { where: Record<string, unknown> }) => {
        if ('id' in where) return Promise.resolve(opts.byId ?? null);
        if ('email' in where) return Promise.resolve(opts.byEmail ?? null);
        return Promise.resolve(opts.byUserId ?? null);
      },
    );

  beforeEach(() => {
    jest.resetAllMocks();
    repo.create.mockImplementation((v: object) => v);
    repo.save.mockImplementation((v: object) =>
      Promise.resolve({ id: 1, ...v }),
    );
    service = new MechanicsService(repo as never, usersRepo as never);
  });

  it('create guarda con estado ACTIVE', async () => {
    mockDb({ byId: mechanic() });
    await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: MechanicStatus.ACTIVE }),
    );
  });

  it('create con correo duplicado lanza 409', async () => {
    mockDb({ byEmail: mechanic() });
    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('create con userId inexistente lanza 404', async () => {
    mockDb({});
    usersRepo.findOne.mockResolvedValue(null);
    const p = service.create({ ...dto, userId: 9 });
    await expect(p).rejects.toThrow(NotFoundException);
    await expect(p).rejects.toThrow('Usuario no encontrado');
  });

  it('create con usuario ADMIN lanza 400', async () => {
    mockDb({});
    usersRepo.findOne.mockResolvedValue({ id: 3, role: UserRole.ADMIN });
    const p = service.create({ ...dto, userId: 3 });
    await expect(p).rejects.toThrow(BadRequestException);
    await expect(p).rejects.toThrow(
      'El usuario vinculado debe tener rol TECHNICIAN',
    );
  });

  it('create con usuario ya vinculado a otro mecánico lanza 409', async () => {
    mockDb({ byUserId: mechanic({ id: 2, name: 'Luis' }) });
    usersRepo.findOne.mockResolvedValue({ id: 4, role: UserRole.TECHNICIAN });
    const p = service.create({ ...dto, userId: 4 });
    await expect(p).rejects.toThrow(ConflictException);
    await expect(p).rejects.toThrow(
      'El usuario ya está vinculado al mecánico Luis',
    );
  });

  it('create con técnico libre vincula el usuario', async () => {
    mockDb({ byId: mechanic({ userId: 4 }) });
    usersRepo.findOne.mockResolvedValue({ id: 4, role: UserRole.TECHNICIAN });
    const res = await service.create({ ...dto, userId: 4 });
    expect(repo.save).toHaveBeenCalled();
    expect(res.userId).toBe(4);
  });

  it('update con su mismo correo no lanza 409', async () => {
    mockDb({ byId: mechanic(), byEmail: mechanic() });
    await expect(
      service.update(1, { email: 'carlos@x.com' }),
    ).resolves.toBeDefined();
  });

  it('update con correo de otro mecánico lanza 409', async () => {
    mockDb({ byId: mechanic(), byEmail: mechanic({ id: 2 }) });
    await expect(service.update(1, { email: 'otro@x.com' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('update re-vinculando el mismo userId no lanza 409', async () => {
    mockDb({
      byId: mechanic({ userId: 4 }),
      byUserId: mechanic({ id: 1, userId: 4 }),
    });
    usersRepo.findOne.mockResolvedValue({ id: 4, role: UserRole.TECHNICIAN });
    await expect(service.update(1, { userId: 4 })).resolves.toBeDefined();
  });

  it('findOne inexistente lanza 404', async () => {
    mockDb({});
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('activate pasa INACTIVE a ACTIVE', async () => {
    mockDb({ byId: mechanic({ status: MechanicStatus.INACTIVE }) });
    const res = await service.activate(1);
    expect(res.status).toBe(MechanicStatus.ACTIVE);
  });

  it('deactivate pasa ACTIVE a INACTIVE usando save, nunca remove/delete', async () => {
    mockDb({ byId: mechanic() });
    const res = await service.deactivate(1);
    expect(res.status).toBe(MechanicStatus.INACTIVE);
    expect(repo.save).toHaveBeenCalled();
    expect(repo.remove).not.toHaveBeenCalled();
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('activate sobre ACTIVE lanza 409', async () => {
    mockDb({ byId: mechanic() });
    await expect(service.activate(1)).rejects.toThrow(ConflictException);
  });

  it('deactivate sobre INACTIVE lanza 409', async () => {
    mockDb({ byId: mechanic({ status: MechanicStatus.INACTIVE }) });
    await expect(service.deactivate(1)).rejects.toThrow(ConflictException);
  });

  describe('update y vínculo con usuario (bug: re-vincular desvinculaba)', () => {
    const tech = { id: 2, role: UserRole.TECHNICIAN };

    it('re-vincular el mismo userId conserva user y userId en save', async () => {
      mockDb({
        byId: mechanic({ userId: 2, user: { id: 2 } }),
        byUserId: mechanic({ id: 1, userId: 2 }),
      });
      usersRepo.findOne.mockResolvedValue(tech);
      await service.update(1, { userId: 2 });
      const saved = repo.save.mock.calls[0][0] as {
        user: { id: number } | null;
        userId: number;
      };
      expect(saved.user).not.toBeNull();
      expect(saved.userId).toBe(2);
      expect(saved.user?.id).toBe(2);
    });

    it('update sin userId no toca user ni userId', async () => {
      mockDb({ byId: mechanic({ userId: 2, user: { id: 2 } }) });
      await service.update(1, { name: 'Nuevo' });
      const saved = repo.save.mock.calls[0][0] as {
        user: { id: number };
        userId: number;
      };
      expect(saved.userId).toBe(2);
      expect(saved.user).toEqual({ id: 2 });
    });

    it('update con userId distinto deja user.id igual al nuevo', async () => {
      mockDb({ byId: mechanic({ userId: 2, user: { id: 2 } }) });
      usersRepo.findOne.mockResolvedValue({ ...tech, id: 5 });
      await service.update(1, { userId: 5 });
      const saved = repo.save.mock.calls[0][0] as {
        user: { id: number };
        userId: number;
      };
      expect(saved.user.id).toBe(5);
      expect(saved.userId).toBe(5);
    });
  });
});
