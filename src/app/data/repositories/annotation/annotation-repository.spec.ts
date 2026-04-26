import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnnotationService } from '../../services/annotation/annotation-service';
import { AnnotationRepository } from './annotation-repository';

describe('AnnotationRepository', () => {
  let repo: AnnotationRepository;

  const getAnnotations = vi.fn();
  const approveAnnotation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AnnotationRepository,
        {
          provide: AnnotationService,
          useValue: {
            getAnnotations,
            approveAnnotation
          }
        }
      ]
    });

    repo = TestBed.inject(AnnotationRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('fetchAnnotations should load annotations and clear loading state', async () => {
    const annotations = [{ id: 'annotation-1' }, { id: 'annotation-2' }];
    getAnnotations.mockResolvedValue({ data: annotations, error: null });

    await repo.fetchAnnotations();
    repo.setSelectedAnnotationId('annotation-2');

    expect(repo.annotations()).toEqual(annotations);
    expect(repo.selectedAnnotation()).toEqual({ id: 'annotation-2' });
    expect(repo.isLoading()).toBe(false);
    expect(repo.error()).toBeNull();
  });

  it('fetchAnnotations should store an error when the service fails', async () => {
    getAnnotations.mockResolvedValue({ data: null, error: new Error('failed') });

    await repo.fetchAnnotations();

    expect(repo.error()).toContain('Error fetching annotations');
    expect(repo.isLoading()).toBe(false);
  });

  it('approveAnnotation should delegate to the service', async () => {
    approveAnnotation.mockResolvedValue({ data: 'ok', error: null });

    const result = await repo.approveAnnotation('annotation-1');

    expect(approveAnnotation).toHaveBeenCalledWith('annotation-1');
    expect(result).toEqual({ data: 'ok', error: null });
  });
});
