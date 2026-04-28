import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { SprayingFlowViewModel } from '../../../view-models/spraying-flow/spraying-flow.view-model';
import { SprayingSessionMapComponent } from '../spraying-session-map/spraying-session-map';
import { SprayingFlowDetailPanelComponent } from './spraying-flow-detail-panel';

@Component({
  selector: 'app-spraying-session-map',
  standalone: true,
  template: '<div class="mock-spraying-session-map"></div>',
})
class MockSprayingSessionMapComponent {}

describe('SprayingFlowDetailPanelComponent', () => {
  let fixture: ComponentFixture<SprayingFlowDetailPanelComponent>;
  let component: SprayingFlowDetailPanelComponent;

  const mockViewModel = {
    selectedSession: signal({
      id: 'session-1234-abcd',
      started_at: '2026-04-28T10:00:00Z',
      created_at: '2026-04-28T09:00:00Z',
      ended_at: '2026-04-28T11:00:00Z',
      operator_name: 'Lucas',
      region: 'north',
      status: 'completed',
      notes: 'Observacao',
      water_volume_liters: 20,
    }),
    selectedVisualization: signal({
      session: { id: 'session-1234-abcd' },
      routePoints: [{ id: 'route-1' }],
      plants: [{ id: 'plant-1' }],
      products: [
        { id: 'product-1', name: 'Copper', dose: 10, dose_unit: 'ml/L' },
      ],
    }),
    routePoints: signal([{ id: 'route-1' }]),
    plants: signal([{ id: 'plant-1' }]),
    products: signal([
      { id: 'product-1', name: 'Copper', dose: 10, dose_unit: 'ml/L' },
    ]),
    totalRoutePoints: signal(1),
    totalPlants: signal(1),
    totalProducts: signal(1),
    isLoadingVisualization: signal(false),
    error: signal<string | null>(null),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprayingFlowDetailPanelComponent, TranslateModule.forRoot()],
      providers: [{ provide: SprayingFlowViewModel, useValue: mockViewModel }],
    })
      .overrideComponent(SprayingFlowDetailPanelComponent, {
        remove: { imports: [SprayingSessionMapComponent] },
        add: { imports: [MockSprayingSessionMapComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SprayingFlowDetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render selected session id badge', () => {
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('ID: session');
  });

  it('should render metrics cards', () => {
    const metricCards = fixture.debugElement.queryAll(By.css('.metric-card'));
    expect(metricCards.length).toBe(3);
  });

  it('should render product rows', () => {
    const productRows = fixture.debugElement.queryAll(By.css('.product-row'));
    expect(productRows.length).toBe(1);
  });
});
