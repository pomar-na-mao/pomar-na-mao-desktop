import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';
import { OperationsFiltersPanel } from './operations-filters-panel';

describe('OperationsFiltersPanel', () => {
  let fixture: ComponentFixture<OperationsFiltersPanel>;
  let component: OperationsFiltersPanel;
  let mockViewModel: {
    startDate: ReturnType<typeof signal<string>>;
    endDate: ReturnType<typeof signal<string>>;
    selectedOperation: ReturnType<typeof signal<string>>;
  };

  beforeEach(async () => {
    mockViewModel = {
      startDate: signal('2026-01-01'),
      endDate: signal('2026-01-31'),
      selectedOperation: signal('pulverizacao'),
    };

    await TestBed.configureTestingModule({
      imports: [OperationsFiltersPanel],
      providers: [{ provide: OperationsViewModel, useValue: mockViewModel }],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsFiltersPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders title, date pickers and operation select', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Operações');
    expect(root.textContent).toContain('Período');
    expect(root.querySelectorAll('p-datepicker')).toHaveLength(2);
    expect(root.querySelector('app-select')).toBeTruthy();
    expect(component.operationOptions.map((o) => o.value)).toEqual(['', 'pulverizacao', 'inspecao']);
  });

  it('clears filters when clearFilters is called', () => {
    component.clearFilters();
    expect(mockViewModel.startDate()).toBe('');
    expect(mockViewModel.endDate()).toBe('');
    expect(mockViewModel.selectedOperation()).toBe('');
  });
});
