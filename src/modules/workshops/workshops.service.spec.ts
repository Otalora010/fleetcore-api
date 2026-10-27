import { ConflictException, NotFoundException } from '@nestjs/common';
import { WorkshopStatus } from '../../common/enums/workshop-status.enum.js';
import { WorkshopsService } from './workshops.service.js';

describe('WorkshopsService', () => {
  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((v: object) => v),
    save: jest.fn((v: object) => Promise.resolve({ id: 1, ...v })),
    delete: jest.fn(),
    remove: jest.fn(),
  };
  let service: WorkshopsService;

  const workshop = (over: object = {}) => ({
    id: 1,
    name: 'Taller Norte',
    address: 'Cra. 15 #42-10',
    status: WorkshopStatus.ACTIVE,
    ...over,
  });
  const dto = { name: 'Taller Sur', address: 'Cra. 7 #12-34' };

  // Simula la BD: findOne responde según el criterio de búsqueda.
  const mockDb = (opts: { byId?: object | null; byName?: object | null }) =>
    repo.findOne.mockImplementation(
      ({ where }: { where: Record<string, unknown> }) => {
        if ('id' in where) return Promise.resolve(opts.byId ?? null);
        return Promise.resolve(opts.byName ?? null);
      },
    );

  beforeEach(() => {
    jest.resetAllMocks();
    repo.create.mockImplementation((v: object) => v);
    repo.save.mockImplementation((v: object) =>
      Promise.resolve({ id: 1, ...v }),
    );
    service = new WorkshopsService(repo as never);
  });

  it('findAll pide solo talleres activos', async () => {
    repo.find.mockResolvedValue([]);
    await service.findAll();
    expect(repo.find).toHaveBeenCalledWith({
      where: { status: WorkshopStatus.ACTIVE },
      order: { id: 'ASC' },
    });
  });

  it('create guarda con estado ACTIVE', async () => {
    mockDb({ byName: null });
    await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: WorkshopStatus.ACTIVE }),
    );
  });

  it('create con nombre repetido lanza 409', async () => {
    mockDb({ byName: workshop() });
    const p = service.create(dto);
    await expect(p).rejects.toThrow(ConflictException);
    await expect(p).rejects.toThrow('Ya existe un taller con el nombre');
  });

  it('findOne inexistente lanza 404 "Taller no encontrado"', async () => {
    mockDb({ byId: null });
    const p = service.findOne(99);
    await expect(p).rejects.toThrow(NotFoundException);
    await expect(p).rejects.toThrow('Taller no encontrado');
  });

  it('findOne de un taller INACTIVE lo devuelve (no 404)', async () => {
    mockDb({ byId: workshop({ status: WorkshopStatus.INACTIVE }) });
    await expect(service.findOne(1)).resolves.toMatchObject({
      status: WorkshopStatus.INACTIVE,
    });
  });

  it('activate pasa INACTIVE a ACTIVE', async () => {
    mockDb({ byId: workshop({ status: WorkshopStatus.INACTIVE }) });
    const res = await service.activate(1);
    expect(res.status).toBe(WorkshopStatus.ACTIVE);
    expect(repo.save).toHaveBeenCalled();
  });

  it('activate sobre ACTIVE lanza 409', async () => {
    mockDb({ byId: workshop() });
    const p = service.activate(1);
    await expect(p).rejects.toThrow(ConflictException);
    await expect(p).rejects.toThrow('ya está activo');
  });

  it('deactivate pasa ACTIVE a INACTIVE usando save, nunca remove/delete', async () => {
    mockDb({ byId: workshop() });
    const res = await service.deactivate(1);
    expect(res.status).toBe(WorkshopStatus.INACTIVE);
    expect(repo.save).toHaveBeenCalled();
    expect(repo.remove).not.toHaveBeenCalled();
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('deactivate sobre INACTIVE lanza 409', async () => {
    mockDb({ byId: workshop({ status: WorkshopStatus.INACTIVE }) });
    const p = service.deactivate(1);
    await expect(p).rejects.toThrow(ConflictException);
    await expect(p).rejects.toThrow('ya está inactivo');
  });
});
