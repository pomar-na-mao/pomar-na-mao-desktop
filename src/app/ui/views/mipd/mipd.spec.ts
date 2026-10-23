import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MipdMarking } from '../../../domain/models/mipd.model';
import { MipdViewModel } from '../../view-models/mipd/mipd.view-model';
import { Mipd } from './mipd';

describe('Mipd', () => {
  let fixture: ComponentFixture<Mipd>;
  const startDate = signal('2026-10-01');
  const endDate = signal('2026-10-22');
  const selectedZoneId = signal('');
  const selectedOccurrenceTypeId = signal('type-1');
  const selectedMarking = signal<MipdMarking | null>(null);
  const selectedPlantMarkings = signal<MipdMarking[]>([]);
  const currentMarkingIndex = signal(0);
  const signedPhotoUrl = signal<string | null>(null);
  const isMapFullscreen = signal(false);
  const isLoading = signal(false);
  const errorMessage = signal<string | null>(null);
  const showEmptyState = signal(false);
  const hasActiveFilters = signal(true);
  const dateRangeInvalid = signal(false);
  const occurrenceTypeOptions = signal([
    { label: 'Todos', value: '' },
    { label: 'Broca', value: 'type-1' },
  ]);
  const zoneOptions = signal([
    { label: 'Todas as zonas', value: '' },
    { label: 'Zona A', value: 'zone-1' },
  ]);

  beforeEach(async () => {
    const mockViewModel = {
      startDate,
      endDate,
      selectedZoneId,
      selectedOccurrenceTypeId,
      selectedMarking,
      selectedPlantMarkings,
      currentMarkingIndex,
      signedPhotoUrl,
      isMapFullscreen,
      isLoading,
      errorMessage,
      showEmptyState,
      hasActiveFilters,
      dateRangeInvalid,
      occurrenceTypeOptions,
      zoneOptions,
      isPhotoLoading: signal(false),
      photoError: signal<string | null>(null),
      initMap: vi.fn(),
      destroyMap: vi.fn(),
      setMapFullscreen: vi.fn(),
      invalidateMapSize: vi.fn(),
      clearFilters: vi.fn(),
      clearSelection: vi.fn(),
      navigateMarking: (direction: 'prev' | 'next') => {
        const next = direction === 'next' ? 1 : 0;
        currentMarkingIndex.set(next);
        selectedMarking.set(selectedPlantMarkings()[next]);
      },
    };

    await TestBed.configureTestingModule({ imports: [Mipd] })
      .overrideComponent(Mipd, {
        set: { providers: [{ provide: MipdViewModel, useValue: mockViewModel }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(Mipd);
    fixture.detectChanges();
  });

  it('uses the Operations-equivalent responsive shell', () => {
    const shell = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(shell.className).toContain('md:flex-row');
    expect(shell.className).toContain('rounded-2xl');
    expect(fixture.nativeElement.querySelector('app-mipd-filters-panel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-mipd-map')).toBeTruthy();
  });

  it('keeps filters while navigating repeated plant markings and showing a signed photo', () => {
    const newest = {
      operation_id: 'operation-2',
      marking_id: 'marking-2',
      started_at: '2026-10-22T10:00:00Z',
      observed_at: '2026-10-22T10:00:00Z',
      plant_id: 'plant-1',
      latitude: -23.403,
      longitude: -49.149,
      zone_name: 'Talhão 1',
      occurrence_type_id: 'type-1',
      occurrence_type_name: 'Broca',
      plant_parts: ['LEAF'],
      photo_object_path: 'new.jpg',
    } as MipdMarking;
    const older = {
      ...newest,
      operation_id: 'operation-1',
      marking_id: 'marking-1',
      observed_at: '2026-10-21T10:00:00Z',
      photo_object_path: 'old.jpg',
    };
    selectedPlantMarkings.set([newest, older]);
    selectedMarking.set(newest);
    signedPhotoUrl.set('https://signed.example/new.jpg');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('1 de 2');
    expect(fixture.nativeElement.querySelector('img')).toBeTruthy();
    fixture.componentInstance.mipdViewModel.navigateMarking('next');
    fixture.detectChanges();

    expect(selectedMarking()?.marking_id).toBe('marking-1');
    expect(startDate()).toBe('2026-10-01');
    expect(endDate()).toBe('2026-10-22');
    expect(selectedOccurrenceTypeId()).toBe('type-1');
  });
});
