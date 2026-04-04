import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectAnnotationService } from '../../services/inspect-annotation/inspect-annotation-service';
import { InspectAnnotationRepository } from './inspect-annotation-repository';

describe('InspectAnnotationRepository', () => {
  let repo: InspectAnnotationRepository;

  const getInspectAnnotations = vi.fn();
  const approveInspectAnnotation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        InspectAnnotationRepository,
        {
          provide: InspectAnnotationService,
          useValue: {
            getInspectAnnotations,
            approveInspectAnnotation
          }
        }
      ]
    });

    repo = TestBed.inject(InspectAnnotationRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('fetchInspectAnnotations should load annotations and clear loading state', async () => {
    const annotations = [{ id: 'annotation-1' }, { id: 'annotation-2' }];
    getInspectAnnotations.mockResolvedValue({ data: annotations, error: null });

    await repo.fetchInspectAnnotations();
    repo.setSelectedAnnotationId('annotation-2');

    expect(repo.inspectAnnotations()).toEqual(annotations);
    expect(repo.selectedAnnotation()).toEqual({ id: 'annotation-2' });
    expect(repo.isLoading()).toBe(false);
    expect(repo.error()).toBeNull();
  });

  it('fetchInspectAnnotations should store an error when the service fails', async () => {
    getInspectAnnotations.mockResolvedValue({ data: null, error: new Error('failed') });

    await repo.fetchInspectAnnotations();

    expect(repo.error()).toContain('Error fetching inspect annotations');
    expect(repo.isLoading()).toBe(false);
  });

  it('approveInspectAnnotation should delegate to the service', async () => {
    approveInspectAnnotation.mockResolvedValue({ data: 'ok', error: null });

    const result = await repo.approveInspectAnnotation('annotation-1');

    expect(approveInspectAnnotation).toHaveBeenCalledWith('annotation-1');
    expect(result).toEqual({ data: 'ok', error: null });
  });
});
