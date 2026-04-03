import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeAlertsForecastPanel } from './home-alerts-forecast-panel';
import { TranslateModule } from '@ngx-translate/core';
import { AlertsViewModel } from '../../../view-models/alerts/alerts.view-model';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';

describe('HomeAlertsForecastPanel', () => {
  let component: HomeAlertsForecastPanel;
  let fixture: ComponentFixture<HomeAlertsForecastPanel>;
  let mockAlertsViewModel: any;

  beforeEach(async () => {
    mockAlertsViewModel = {
      alerts: signal([
        { id: '1', title: 'PAGES.HOME.DASHBOARD.APHID_INFESTATION', severity: 'high', region: 'A', row: 1, number_of_tree: 1 }
      ]),
      isLoading: signal(false),
      hasError: signal(false),
      initialize: vi.fn(),
      trackByAlertId: vi.fn((idx, a) => a.id)
    };

    await TestBed.configureTestingModule({
      imports: [HomeAlertsForecastPanel, TranslateModule.forRoot()],
    })
    .overrideComponent(HomeAlertsForecastPanel, {
      set: {
        providers: [
          { provide: AlertsViewModel, useValue: mockAlertsViewModel }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeAlertsForecastPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should render alerts from viewModel', () => {
    const alertItems = fixture.debugElement.queryAll(By.css('.border-surface-container-low'));
    expect(alertItems.length).toBe(1);
    expect(alertItems[0].nativeElement.textContent).toContain('PAGES.HOME.DASHBOARD.APHID_INFESTATION');
  });

  it('should render forecast bars', () => {
    const bars = fixture.debugElement.queryAll(By.css('.h-20 > div'));
    expect(bars.length).toBe(7);
  });
});
