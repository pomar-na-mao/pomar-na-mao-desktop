import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OperationsViewModel } from './operations.view-model';
import { OperationsRepository } from '../../../data/repositories/operations/operations-repository';
import { signal } from '@angular/core';

describe('OperationsViewModel', () => {
  let viewModel: OperationsViewModel;
  let mockOperationsRepository: jasmine.SpyObj<OperationsRepository>;

  beforeEach(() => {
    mockOperationsRepository = jasmine.createSpyObj('OperationsRepository', ['getSprayingOperations'], {
      sprayingOperations: signal([])
    });

    TestBed.configureTestingModule({
      providers: [
        OperationsViewModel,
        { provide: OperationsRepository, useValue: mockOperationsRepository }
      ]
    });

    viewModel = TestBed.inject(OperationsViewModel);
  });

  it('should be created', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should fetch spraying operations when type is pulverizacao', fakeAsync(() => {
    viewModel.startDate.set('2023-01-01');
    viewModel.endDate.set('2023-12-31');
    viewModel.selectedZoneId.set('zone-1');
    viewModel.selectedOperation.set('pulverizacao');

    TestBed.flushEffects();
    tick();

    expect(mockOperationsRepository.getSprayingOperations).toHaveBeenCalledWith('2023-01-01', '2023-12-31', 'zone-1');
  }));

  it('should clear spraying operations when type is not pulverizacao', fakeAsync(() => {
    viewModel.selectedOperation.set('inspecao');

    TestBed.flushEffects();
    tick();

    expect(mockOperationsRepository.getSprayingOperations).not.toHaveBeenCalled();
    expect(mockOperationsRepository.sprayingOperations()).toEqual([]);
  }));
});
