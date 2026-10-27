import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { VehicleStatus } from '../../common/enums/vehicle-status.enum.js';
import { VehiclesService } from './vehicles.service.js';

describe('VehiclesService', () => {
  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((v: object) => v),
    save: jest.fn((v: object) => Promise.resolve(v)),
    delete: jest.fn(),
    remove: jest.fn(),
  };
  let service: VehiclesService;

  const vehicle = (over: object = {}) => ({
    id: 1,
    plate: 'ABC123',
    brand: 'Toyota',
    model: 'Hilux',
    year: 2022,
    mileage: 1000,
    status: VehicleStatus.AVAILABLE,
    ...over,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VehiclesService(repo as never);
  });

  it('create guarda con estado AVAILABLE', async () => {
    repo.findOne.mockResolvedValue(null);
    const dto = {
      plate: 'XYZ789',
      brand: 'a',
      model: 'b',
      year: 2020,
      mileage: 0,
    };
    const res = await service.create(dto);
    expect(res.status).toBe(VehicleStatus.AVAILABLE);
  });

  it('create con placa duplicada lanza 409 con la placa', async () => {
    repo.findOne.mockResolvedValue(vehicle());
    const p = service.create({
      plate: 'ABC123',
      brand: 'a',
      model: 'b',
      year: 2020,
      mileage: 0,
    });
    await expect(p).rejects.toThrow(ConflictException);
    await expect(p).rejects.toThrow(/ABC123/);
  });

  it('findOne inexistente lanza 404', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(9)).rejects.toThrow(NotFoundException);
  });

  it("findByPlate 'abc123' busca 'ABC123'", async () => {
    repo.findOne.mockResolvedValue(vehicle());
    await service.findByPlate('abc123');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { plate: 'ABC123' } });
  });

  it('findByPlate inexistente lanza 404', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findByPlate('zzz')).rejects.toThrow(NotFoundException);
  });

  it('update a una placa existente lanza 409', async () => {
    repo.findOne
      .mockResolvedValueOnce(vehicle())
      .mockResolvedValueOnce(vehicle({ id: 2, plate: 'OTRA1' }));
    await expect(service.update(1, { plate: 'OTRA1' })).rejects.toThrow(
      ConflictException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('update con kilometraje menor lanza 400', async () => {
    repo.findOne.mockResolvedValue(vehicle());
    await expect(service.update(1, { mileage: 999 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('update válido guarda los cambios', async () => {
    repo.findOne.mockResolvedValue(vehicle());
    const res = await service.update(1, { mileage: 1000, brand: 'Ford' });
    expect(res.brand).toBe('Ford');
    expect(repo.save).toHaveBeenCalled();
  });

  it('update inexistente lanza 404', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.update(9, { brand: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deactivate pasa AVAILABLE a INACTIVE sin borrar', async () => {
    repo.findOne.mockResolvedValue(vehicle());
    const res = await service.deactivate(1);
    expect(res.status).toBe(VehicleStatus.INACTIVE);
    expect(repo.delete).not.toHaveBeenCalled();
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('deactivate de un INACTIVE lanza 409', async () => {
    repo.findOne.mockResolvedValue(vehicle({ status: VehicleStatus.INACTIVE }));
    await expect(service.deactivate(1)).rejects.toThrow(ConflictException);
  });

  it('deactivate de un IN_MAINTENANCE lanza 409', async () => {
    repo.findOne.mockResolvedValue(
      vehicle({ status: VehicleStatus.IN_MAINTENANCE }),
    );
    await expect(service.deactivate(1)).rejects.toThrow(ConflictException);
  });
});
