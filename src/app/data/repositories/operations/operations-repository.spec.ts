import { TestBed } from '@angular/core/testing';
import { OperationsRepository } from './operations-repository';
import { OperationsService } from '../../services/operations/operations-service';

describe('OperationsRepository', () => {
  let repository: OperationsRepository;
  let mockOperationsService: jasmine.SpyObj<OperationsService>;

  beforeEach(() => {
    mockOperationsService = jasmine.createSpyObj('OperationsService', ['getSprayingOperations']);

    TestBed.configureTestingModule({
      providers: [
        OperationsRepository,
        { provide: OperationsService, useValue: mockOperationsService }
      ]
    });

    repository = TestBed.inject(OperationsRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  it('should fetch spraying operations and update signal', async () => {
    const mockData = [{ operation_id: '1' }];
    mockOperationsService.getSprayingOperations.and.returnValue(Promise.resolve({ data: mockData, error: null } as any));

    const result = await repository.getSprayingOperations('2023-01-01', '2023-12-31', 'zone-1');

    expect(result.error).toBeNull();
    expect(repository.sprayingOperations()).toEqual(mockData as any);
    expect(mockOperationsService.getSprayingOperations).toHaveBeenCalledWith('2023-01-01', '2023-12-31', 'zone-1');
  });

  it('should clear signal and return error on failure', async () => {
    const mockError = { message: 'Error' };
    mockOperationsService.getSprayingOperations.and.returnValue(Promise.resolve({ data: null, error: mockError } as any));

    const result = await repository.getSprayingOperations();

    expect(result.error).toEqual(mockError as any);
    expect(repository.sprayingOperations()).toEqual([]);
  });
});
