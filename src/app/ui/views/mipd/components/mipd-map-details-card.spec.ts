import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MipdMarking } from '../../../../domain/models/mipd.model';
import { MipdViewModel } from '../../../view-models/mipd/mipd.view-model';
import { MipdMapDetailsCard } from './mipd-map-details-card';

function marking(photo: string | null): MipdMarking {
  return {
    operation_id: 'operation-1',
    marking_id: 'marking-1',
    started_at: '2026-10-22T10:00:00Z',
    observed_at: '2026-10-22T10:01:00Z',
    plant_id: 'plant-1',
    latitude: -23.403,
    longitude: -49.149,
    zone_name: 'Talhão 1',
    occurrence_type_id: 'type-1',
    occurrence_type_name: 'Broca',
    plant_parts: ['LEAF', 'BRANCH'],
    photo_object_path: photo,
  };
}

describe('MipdMapDetailsCard', () => {
  let fixture: ComponentFixture<MipdMapDetailsCard>;
  const selectedMarking = signal<MipdMarking | null>(null);
  const selectedPlantMarkings = signal<MipdMarking[]>([]);
  const currentMarkingIndex = signal(0);
  const signedPhotoUrl = signal<string | null>(null);
  const isPhotoLoading = signal(false);
  const photoError = signal<string | null>(null);
  const clearSelection = vi.fn();
  const navigateMarking = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    selectedMarking.set(null);
    selectedPlantMarkings.set([]);
    signedPhotoUrl.set(null);
    isPhotoLoading.set(false);
    photoError.set(null);
    await TestBed.configureTestingModule({
      imports: [MipdMapDetailsCard],
      providers: [
        {
          provide: MipdViewModel,
          useValue: {
            selectedMarking,
            selectedPlantMarkings,
            currentMarkingIndex,
            signedPhotoUrl,
            isPhotoLoading,
            photoError,
            clearSelection,
            navigateMarking,
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MipdMapDetailsCard);
  });

  it('shows coordinates, occurrence, translated parts and no-photo state', () => {
    const value = marking(null);
    selectedMarking.set(value);
    selectedPlantMarkings.set([value]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('plant-1');
    expect(text).toContain('-23.403000, -49.149000');
    expect(text).toContain('Broca');
    expect(text).toContain('Folha');
    expect(text).toContain('Ramo');
    expect(text).toContain('Foto não informada');
  });

  it('renders signed photos with accessible alternative text', () => {
    const value = marking('photo.jpg');
    selectedMarking.set(value);
    selectedPlantMarkings.set([value]);
    signedPhotoUrl.set('https://signed.example/photo.jpg');
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image.src).toContain('https://signed.example/photo.jpg');
    expect(image.alt).toBe('Foto da marcação de Broca');
  });

  it('shows unavailable photo state and history navigation', () => {
    const value = marking('photo.jpg');
    const older = { ...value, marking_id: 'marking-older' };
    selectedMarking.set(value);
    selectedPlantMarkings.set([value, older]);
    photoError.set('Foto indisponível.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Foto indisponível');
    expect(fixture.nativeElement.textContent).toContain('1 de 2');
  });

  it('closes details without changing filter state', () => {
    const value = marking(null);
    selectedMarking.set(value);
    selectedPlantMarkings.set([value]);
    fixture.detectChanges();

    fixture.componentInstance.mipdViewModel.clearSelection();
    expect(clearSelection).toHaveBeenCalledOnce();
  });
});

