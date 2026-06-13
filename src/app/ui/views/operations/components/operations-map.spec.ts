import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationsMap } from './operations-map';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';
import { signal } from '@angular/core';

describe('OperationsMap', () => {
  let component: OperationsMap;
  let fixture: ComponentFixture<OperationsMap>;
  let mockViewModel: {
    isMapFullscreen: ReturnType<typeof signal<boolean>>;
    selectedOperationDetails: ReturnType<typeof signal<Record<string, unknown> | null>>;
    initMap: ReturnType<typeof vi.fn>;
    setMapFullscreen: ReturnType<typeof vi.fn>;
    invalidateMapSize: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockViewModel = {
      isMapFullscreen: signal(false),
      selectedOperationDetails: signal(null),
      initMap: vi.fn(),
      setMapFullscreen: vi.fn(),
      invalidateMapSize: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [OperationsMap],
      providers: [
        { provide: OperationsViewModel, useValue: mockViewModel }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize map', () => {
    expect(component).toBeTruthy();
    expect(mockViewModel.initMap).toHaveBeenCalledWith('operations-map');
  });
});
