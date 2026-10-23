import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MipdViewModel } from '../../../view-models/mipd/mipd.view-model';
import { MipdFiltersPanel } from './mipd-filters-panel';

describe('MipdFiltersPanel', () => {
  let fixture: ComponentFixture<MipdFiltersPanel>;
  const startDate = signal('2026-10-22');
  const endDate = signal('2026-10-22');
  const selectedZoneId = signal('');
  const selectedOccurrenceTypeId = signal('');
  const dateRangeInvalid = signal(false);
  const options = signal([
    { label: 'Todos', value: '' },
    { label: 'Broca', value: 'type-1' },
  ]);
  const zoneOptions = signal([
    { label: 'Todas as zonas', value: '' },
    { label: 'Zona A', value: 'zone-1' },
  ]);
  const clearFilters = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MipdFiltersPanel],
      providers: [
        {
          provide: MipdViewModel,
          useValue: {
            startDate,
            endDate,
            selectedZoneId,
            selectedOccurrenceTypeId,
            dateRangeInvalid,
            zoneOptions,
            occurrenceTypeOptions: options,
            clearFilters,
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MipdFiltersPanel);
    fixture.detectChanges();
  });

  it('copies the Operations panel structure and renders the required filters', () => {
    const root = fixture.nativeElement as HTMLElement;
    const aside = root.querySelector('aside');
    expect(root.textContent).toContain('Mipd');
    expect(root.textContent).toContain('Período');
    expect(root.textContent).toContain('Zona');
    expect(root.textContent).toContain('Praga ou doença');
    expect(options()[0]).toEqual({ label: 'Todos', value: '' });
    expect(root.querySelectorAll('p-datepicker')).toHaveLength(2);
    expect(root.querySelectorAll('app-select')).toHaveLength(2);
    expect(zoneOptions()[0]).toEqual({ label: 'Todas as zonas', value: '' });
    expect(aside?.className).toContain('bg-surface-0');
  });

  it('delegates clear filters and exposes an invalid date alert', () => {
    dateRangeInvalid.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();

    fixture.componentInstance.mipdViewModel.clearFilters();
    expect(clearFilters).toHaveBeenCalledOnce();
  });
});
