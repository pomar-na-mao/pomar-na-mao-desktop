import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertsRepository } from '../../../data/repositories/alerts/alerts-repository';
import { AlertsViewModel } from './alerts.view-model';

describe('AlertsViewModel', () => {
  let viewModel: AlertsViewModel;

  const alertsSignal = signal([
    {
      id: 'alert-1',
      created_at: '2026-03-31T10:00:00Z',
      title: 'Alert',
      region: 'North',
      row: 1,
      number_of_tree: 2,
      description: 'Description',
      is_active: true
    }
  ]);

  const mockAlertsRepository = {
    alerts: alertsSignal.asReadonly(),
    findAll: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AlertsViewModel,
        { provide: AlertsRepository, useValue: mockAlertsRepository }
      ]
    });

    viewModel = TestBed.inject(AlertsViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should initialize alerts successfully', async () => {
    await viewModel.initialize();

    expect(mockAlertsRepository.findAll).toHaveBeenCalled();
    expect(viewModel.alerts()).toEqual(alertsSignal());
    expect(viewModel.hasError()).toBe(false);
    expect(viewModel.isLoading()).toBe(false);
  });

  it('should set the error flag when initialization fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockAlertsRepository.findAll.mockRejectedValueOnce(new Error('failed'));

    await viewModel.initialize();

    expect(viewModel.hasError()).toBe(true);
    expect(viewModel.isLoading()).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should track alerts by id', () => {
    expect(viewModel.trackByAlertId(0, alertsSignal()[0])).toBe('alert-1');
  });
});
