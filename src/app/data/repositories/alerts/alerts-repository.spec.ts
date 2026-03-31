import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertsService } from '../../services/alerts/alerts-service';
import { AlertsRepository } from './alerts-repository';

describe('AlertsRepository', () => {
  let repo: AlertsRepository;

  const findAll = vi.fn();
  const findById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AlertsRepository,
        {
          provide: AlertsService,
          useValue: {
            findAll,
            findById
          }
        }
      ]
    });

    repo = TestBed.inject(AlertsRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('findAll should update the alerts signal', async () => {
    const alerts = [{ id: 'alert-1' }];
    findAll.mockResolvedValue({ data: alerts, error: null });

    const result = await repo.findAll();

    expect(findAll).toHaveBeenCalled();
    expect(result).toEqual(alerts);
    expect(repo.alerts()).toEqual(alerts);
  });

  it('findAll should throw when the service returns an error', async () => {
    findAll.mockResolvedValue({ data: null, error: new Error('failed') });

    await expect(repo.findAll()).rejects.toThrow('failed');
  });

  it('findById should return null when the service returns an error', async () => {
    findById.mockResolvedValue({ data: null, error: new Error('failed') });

    const result = await repo.findById('alert-1');

    expect(result).toBeNull();
  });
});
