import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MipdViewModel } from '../../../view-models/mipd/mipd.view-model';
import { MipdMap } from './mipd-map';

describe('MipdMap', () => {
  let fixture: ComponentFixture<MipdMap>;
  const isMapFullscreen = signal(false);
  const isLoading = signal(false);
  const errorMessage = signal<string | null>(null);
  const showEmptyState = signal(false);
  const hasActiveFilters = signal(false);
  const selectedMarking = signal(null);
  const selectedPlantMarkings = signal([]);
  const currentMarkingIndex = signal(0);
  const signedPhotoUrl = signal<string | null>(null);
  const isPhotoLoading = signal(false);
  const photoError = signal<string | null>(null);
  const initMap = vi.fn();
  const destroyMap = vi.fn();
  const setMapFullscreen = vi.fn((value: boolean) =>
    isMapFullscreen.set(value),
  );
  const invalidateMapSize = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    isMapFullscreen.set(false);
    isLoading.set(false);
    errorMessage.set(null);
    showEmptyState.set(false);
    hasActiveFilters.set(false);
    await TestBed.configureTestingModule({
      imports: [MipdMap],
      providers: [
        {
          provide: MipdViewModel,
          useValue: {
            isMapFullscreen,
            isLoading,
            errorMessage,
            showEmptyState,
            hasActiveFilters,
            selectedMarking,
            selectedPlantMarkings,
            currentMarkingIndex,
            signedPhotoUrl,
            isPhotoLoading,
            photoError,
            initMap,
            destroyMap,
            setMapFullscreen,
            invalidateMapSize,
            clearSelection: vi.fn(),
            navigateMarking: vi.fn(),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MipdMap);
    fixture.detectChanges();
  });

  it('initializes the MIPD map and copies the Operations map surface', () => {
    const map = fixture.nativeElement.querySelector('#mipd-map') as HTMLElement;
    expect(initMap).toHaveBeenCalledWith('mipd-map');
    expect(map.className).toContain('dark:[filter:invert');
  });

  it('toggles fullscreen, invalidates the map and restores body overflow', () => {
    fixture.componentInstance.toggleFullscreen();
    expect(setMapFullscreen).toHaveBeenCalledWith(true);
    expect(invalidateMapSize).toHaveBeenCalledOnce();
    expect(document.body.style.overflow).toBe('hidden');

    fixture.destroy();
    expect(document.body.style.overflow).toBe('');
    expect(destroyMap).toHaveBeenCalledOnce();
  });

  it('renders loading, empty and recoverable error feedback', () => {
    isLoading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Carregando marcações');

    isLoading.set(false);
    showEmptyState.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'Nenhum registro encontrado',
    );

    showEmptyState.set(false);
    errorMessage.set('failed');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });
});

