import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MachineItem } from '../../../domain/models/machine.model';
import { MachinesService } from '../../services/machines/machines.service';
import { MachinesRepository } from './machines.repository';

function machine(id: string, name: string): MachineItem {
  return {
    id,
    name,
    brand: 'Valtra',
    acquisition_date: '2024-01-01',
    manufacturing_year: 2023,
    quantity: 1,
    observations: null,
    created_at: '2026-10-29T10:00:00Z',
    updated_at: '2026-10-29T10:00:00Z',
  };
}

describe('MachinesRepository', () => {
  let repository: MachinesRepository;
  const service = {
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        MachinesRepository,
        { provide: MachinesService, useValue: service },
      ],
    });
    repository = TestBed.inject(MachinesRepository);
  });

  it('loads and sorts machines alphabetically by name', async () => {
    service.findAll.mockResolvedValue({
      data: [machine('2', 'Valtra Trator'), machine('1', 'Arado')],
      error: null,
    });

    await repository.findAll();

    expect(repository.machines().map((m) => m.name)).toEqual([
      'Arado',
      'Valtra Trator',
    ]);
  });

  it('adds a new machine and updates signal', async () => {
    repository.machines.set([machine('1', 'Arado')]);
    const created = machine('2', 'Valtra');
    service.create.mockResolvedValue({ data: created, error: null });

    const result = await repository.create({
      name: 'Valtra',
      brand: null,
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 1,
      observations: null,
    });

    expect(result.data).toBe(created);
    expect(repository.machines().map((m) => m.name)).toEqual(['Arado', 'Valtra']);
  });

  it('updates an existing machine in signal', async () => {
    repository.machines.set([machine('1', 'Arado')]);
    const updated = { ...machine('1', 'Arado Pesado') };
    service.update.mockResolvedValue({ data: updated, error: null });

    const result = await repository.update('1', {
      name: 'Arado Pesado',
      brand: null,
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 1,
      observations: null,
    });

    expect(result.data).toBe(updated);
    expect(repository.machines()[0].name).toBe('Arado Pesado');
  });

  it('deletes multiple machines from signal', async () => {
    repository.machines.set([machine('1', 'Arado'), machine('2', 'Valtra')]);
    service.deleteMany.mockResolvedValue({ data: null, error: null });

    const result = await repository.deleteMany(['1']);

    expect(result.error).toBeNull();
    expect(repository.machines().map((m) => m.id)).toEqual(['2']);
  });
});
