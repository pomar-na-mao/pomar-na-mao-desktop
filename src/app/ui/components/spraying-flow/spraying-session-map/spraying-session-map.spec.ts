import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { SprayingFlowViewModel } from '../../../view-models/spraying-flow/spraying-flow.view-model';
import { SprayingSessionMapComponent } from './spraying-session-map';

type SprayingSessionMapPrivateApi = {
  initMap: () => void;
  renderVisualization: () => void;
};

describe('SprayingSessionMapComponent', () => {
  let fixture: ComponentFixture<SprayingSessionMapComponent>;
  let component: SprayingSessionMapComponent;
  let initMapSpy: MockInstance<() => void>;
  let renderVisualizationSpy: MockInstance<() => void>;

  const mockViewModel = {
    selectedVisualization: signal({
      session: { id: 'session-1' },
      routePoints: [],
      plants: [],
      products: [],
    }),
  };

  const mockThemeService = {
    currentTheme: signal<'light' | 'dark'>('light'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprayingSessionMapComponent],
      providers: [
        { provide: SprayingFlowViewModel, useValue: mockViewModel },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SprayingSessionMapComponent);
    component = fixture.componentInstance;

    const componentPrototype = Object.getPrototypeOf(component) as SprayingSessionMapPrivateApi;
    initMapSpy = vi.spyOn(componentPrototype, 'initMap').mockImplementation(() => undefined);
    renderVisualizationSpy = vi.spyOn(componentPrototype, 'renderVisualization').mockImplementation(() => undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and render map on afterViewInit', () => {
    component.ngAfterViewInit();

    expect(initMapSpy).toHaveBeenCalled();
    expect(renderVisualizationSpy).toHaveBeenCalled();
  });

  it('should remove map on destroy when present', () => {
    const remove = vi.fn();
    (component as unknown as { map: { remove: () => void } }).map = { remove };

    component.ngOnDestroy();

    expect(remove).toHaveBeenCalled();
  });
});
