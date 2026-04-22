import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkAnnotationService } from '../../services/work-annotation/work-annotation-service';
import { WorkAnnotationRepository } from './work-annotation-repository';

describe('WorkAnnotationRepository', () => {
  let repo: WorkAnnotationRepository;

  const getWorkAnnotations = vi.fn();
  const approveWorkAnnotation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        WorkAnnotationRepository,
        {
          provide: WorkAnnotationService,
          useValue: {
            getWorkAnnotations,
            approveWorkAnnotation
          }
        }
      ]
    });

    repo = TestBed.inject(WorkAnnotationRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('fetchWorkAnnotations should load annotations and clear loading state', async () => {
    const annotations = [{ id: 'annotation-1' }, { id: 'annotation-2' }];
    getWorkAnnotations.mockResolvedValue({ data: annotations, error: null });

    await repo.fetchWorkAnnotations();
    repo.setSelectedAnnotationId('annotation-2');

    expect(repo.workAnnotations()).toEqual(annotations);
    expect(repo.selectedAnnotation()).toEqual({ id: 'annotation-2' });
    expect(repo.isLoading()).toBe(false);
    expect(repo.error()).toBeNull();
  });

  it('fetchWorkAnnotations should store an error when the service fails', async () => {
    getWorkAnnotations.mockResolvedValue({ data: null, error: new Error('failed') });

    await repo.fetchWorkAnnotations();

    expect(repo.error()).toContain('Error fetching work annotations');
    expect(repo.isLoading()).toBe(false);
  });

  it('approveWorkAnnotation should delegate to the service', async () => {
    approveWorkAnnotation.mockResolvedValue({ data: 'ok', error: null });

    const result = await repo.approveWorkAnnotation('annotation-1');

    expect(approveWorkAnnotation).toHaveBeenCalledWith('annotation-1');
    expect(result).toEqual({ data: 'ok', error: null });
  });
});
