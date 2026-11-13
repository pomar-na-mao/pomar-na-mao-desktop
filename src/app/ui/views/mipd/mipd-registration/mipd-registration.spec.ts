import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FarmBoundaryService } from '../../../../data/services/farm-boundary/farm-boundary-service';
import { MipdRegistrationViewModel } from '../../../view-models/mipd/mipd-registration.view-model';
import { MipdRegistration } from './mipd-registration';

describe('MipdRegistration Component', () => {
  let mockViewModel: Partial<MipdRegistrationViewModel>;
  const mockBoundaryService = {
    getBoundary: vi.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockViewModel = {
      loading: signal(false),
      saving: signal(false),
      error: signal<string | null>(null),
      zones: signal([{ id: 'z-1', name: 'Talhão Sul' }]) as any,
      occurrenceTypes: signal([{ id: 'occ-1', name: 'Cancro Cítrico' }]) as any,
      plants: signal([
        {
          id: 'plant-1',
          latitude: -23.403,
          longitude: -49.149,
          zone_id: 'z-1',
          zone_name: 'Talhão Sul',
          variety_name: 'Pera',
        },
      ]) as any,
      selectedZoneId: signal(''),
      selectedPlantId: signal(''),
      selectedOccurrenceTypeId: signal(''),
      selectedPlantParts: signal([]),
      observedDate: signal('2026-11-12'),
      observedTime: signal('10:00'),
      selectedPhotoFile: signal<File | null>(null),
      photoPreviewUrl: signal<string | null>(null),
      initialize: vi.fn().mockResolvedValue(undefined),
      onZoneChange: vi.fn().mockResolvedValue(undefined),
      selectPlant: vi.fn(),
      togglePlantPart: vi.fn(),
      setPhoto: vi.fn(),
      removePhoto: vi.fn(),
      resetForm: vi.fn(),
      submit: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      imports: [MipdRegistration],
      providers: [
        { provide: FarmBoundaryService, useValue: mockBoundaryService },
      ],
    });

    TestBed.overrideComponent(MipdRegistration, {
      set: {
        providers: [{ provide: MipdRegistrationViewModel, useValue: mockViewModel }],
      },
    });
  });

  it('creates the component and initializes data', () => {
    const fixture = TestBed.createComponent(MipdRegistration);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(mockViewModel.initialize).toHaveBeenCalled();
  });

  it('exposes formatted select options for zones, plants and occurrences', () => {
    const fixture = TestBed.createComponent(MipdRegistration);
    const comp = fixture.componentInstance;

    expect(comp.zoneOptions).toEqual([
      { label: 'Todos os talhões', value: '' },
      { label: 'Talhão Sul', value: 'z-1' },
    ]);

    expect(comp.occurrenceTypeOptions).toEqual([
      { label: 'Cancro Cítrico', value: 'occ-1' },
    ]);

    expect(comp.plantOptions[0].label).toContain('Planta plant-1 [Talhão Sul] (Pera)');
  });

  it('calls selectPlant when a plant is selected', () => {
    const fixture = TestBed.createComponent(MipdRegistration);
    const comp = fixture.componentInstance;

    comp.onPlantChange('plant-1');
    expect(mockViewModel.selectPlant).toHaveBeenCalledWith('plant-1');
  });

  it('handles photo file input selection', () => {
    const fixture = TestBed.createComponent(MipdRegistration);
    const comp = fixture.componentInstance;

    const file = new File(['image'], 'leaf.jpg', { type: 'image/jpeg' });
    const event = {
      target: {
        files: [file],
      },
    } as unknown as Event;

    comp.onFileSelected(event);
    expect(mockViewModel.setPhoto).toHaveBeenCalledWith(file);
  });
});
