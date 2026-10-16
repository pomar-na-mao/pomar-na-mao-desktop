import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';
import { OperationsFiltersPanel } from './operations-filters-panel';

describe('OperationsFiltersPanel', () => {
  it('renders the responsive filter rail/sheet with preserved date and operation bindings', async () => {
    const viewModel = { startDate: signal(''), endDate: signal(''), selectedOperation: signal('') };
    await TestBed.configureTestingModule({
      imports: [OperationsFiltersPanel],
      providers: [{ provide: OperationsViewModel, useValue: viewModel }],
    }).compileComponents();
    const fixture = TestBed.createComponent(OperationsFiltersPanel);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.responsive-filter-shell')).toBeTruthy();
    expect(root.querySelector('.ui-form-panel')).toBeTruthy();
    expect(root.querySelector('.ui-form-panel-header')).toBeTruthy();
    expect(root.querySelector('.ui-form-panel-body')).toBeTruthy();
    expect(root.textContent).toContain('Filtre o período e o tipo de operação.');
    expect(root.querySelector('summary.responsive-filter-summary')).toBeTruthy();
    expect(root.querySelectorAll('app-input input[type="date"]')).toHaveLength(2);
    expect(root.querySelector('app-select')).toBeTruthy();
    expect(fixture.componentInstance.operationOptions.map((option) => option.value)).toEqual(['', 'pulverizacao', 'inspecao']);
  });
});
