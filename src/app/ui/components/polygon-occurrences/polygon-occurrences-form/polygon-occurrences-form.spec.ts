import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it, vi } from 'vitest';
import { PolygonOccurrencesViewModel } from '../../../view-models/polygon-occurrences/polygon-occurrences.view-model';
import { PolygonOccurrencesForm } from './polygon-occurrences-form';

describe('PolygonOccurrencesForm', () => {
  it('renders only zone, occurrence and occurrence action fields', async () => {
    const viewModel = {
      form: new FormGroup({
        occurrenceAction: new FormControl<'add' | 'remove'>('add', { nonNullable: true }),
        occurrences: new FormControl<string[]>([], { nonNullable: true }),
      }),
      canEditForm: signal(true), isLoadingOptions: signal(false), isLoadingZones: signal(false),
      isSaving: signal(false), isPreviewing: signal(false), previewLoaded: signal(false),
      previewError: signal<string | null>(null), plantsFoundCount: signal(0), canConfirm: signal(false),
      zoneOptions: signal([{ value: '', label: 'Nenhuma' }]), occurrenceOptions: signal([]),
      selectedZoneId: signal(''), onZoneChange: vi.fn(), onOccurrencesChange: vi.fn(),
      onOccurrenceActionChange: vi.fn(), clear: vi.fn(), preview: vi.fn(), save: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [PolygonOccurrencesForm],
      providers: [{ provide: PolygonOccurrencesViewModel, useValue: viewModel }],
    }).compileComponents();
    const fixture = TestBed.createComponent(PolygonOccurrencesForm);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Zona');
    expect(text).toContain('Ocorrências');
    expect(text).toContain('Ação da Ocorrência');
    expect(text).toContain('Limpar');
    expect(text).toContain('Prévia');
    expect(text).toContain('Salvar');
    expect(text).not.toContain('Variedade');
    expect(text).not.toContain('Vida da Árvore');
    expect(text).not.toContain('Data de Plantio');
    expect(text).not.toContain('Observações');
  });
});
