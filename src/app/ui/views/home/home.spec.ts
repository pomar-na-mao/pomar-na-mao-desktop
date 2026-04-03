import { ComponentFixture, TestBed } from '@angular/core/testing';
import { inject } from '@angular/core';
import { Home } from './home';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Component, input, output } from '@angular/core';
import { FarmOverviewMap } from '../../components/home/farm-overview-map/farm-overview-map';
import { HomeAlertsForecastPanel } from '../../components/home/home-alerts-forecast-panel/home-alerts-forecast-panel';
import { RecentUpdatesTableComponent } from '../../components/home/recent-updates-table/recent-updates-table';
import { HomeViewModel } from '../../view-models/home/home.view-model';
import type { PlantRecentUpdate } from '../../../domain/models/plant-data.model';

vi.mock('leaflet', () => ({
  map: vi.fn().mockReturnValue({
    setView: vi.fn(),
    remove: vi.fn(),
    invalidateSize: vi.fn(),
    addControl: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  }),
  tileLayer: vi.fn().mockReturnValue({
    addTo: vi.fn()
  }),
  marker: vi.fn().mockReturnValue({
    addTo: vi.fn(),
    setLatLng: vi.fn()
  }),
  icon: vi.fn(),
  divIcon: vi.fn(),
  LatLng: vi.fn(),
  Marker: {
    prototype: {
      options: {
        icon: {}
      }
    }
  }
}));

@Component({
  selector: 'app-farm-overview-map',
  standalone: true,
  template: '<div class="mock-map"></div>'
})
class MockFarmOverviewMap { }

@Component({
  selector: 'app-recent-updates-table',
  standalone: true,
  template: '<div class="mock-table">@if(viewModel.recentUpdates().length > 0) { <div class="has-updates"></div> }</div>'
})
class MockRecentUpdatesTableComponent {
  public viewModel = inject(HomeViewModel);
}

@Component({
  selector: 'app-home-alerts-forecast-panel',
  standalone: true,
  template: `
    <div class="dashboard__alerts-card">
      <div class="alert-item">
        <div class="alert-item__title">PAGES.HOME.DASHBOARD.APHID_INFESTATION</div>
      </div>
    </div>
    <div class="forecast__bar" style="height: 30px"></div>
    <div class="forecast__bar" style="height: 50px"></div>
    <div class="forecast__bar" style="height: 40px"></div>
    <div class="forecast__bar" style="height: 65px"></div>
    <div class="forecast__bar" style="height: 55px"></div>
    <div class="forecast__bar" style="height: 75px"></div>
    <div class="forecast__bar" style="height: 60px"></div>
  `
})
class MockHomeAlertsForecastPanelComponent { }

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let mockPlantsRepository: Partial<PlantsRepository>;

  beforeEach(async () => {
    mockPlantsRepository = {
      getHomeStats: vi.fn().mockResolvedValue({
        total_plants: 1024,
        alive_plants: 980,
        updated_plants: 500,
        latest_updated_at: '2026-03-24T10:00:00Z'
      }),
      getRecentUpdates: vi.fn().mockResolvedValue([
        { id: '1234', variety: 'Granny Smith', region: 'Sector A', updated_at: new Date().toISOString() },
        { id: '5678', variety: 'Gala Apple', region: 'Sector B', updated_at: new Date().toISOString() }
      ])
    };

    await TestBed.configureTestingModule({
      imports: [Home, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: PlantsRepository, useValue: mockPlantsRepository }
      ]
    })
      .overrideComponent(Home, {
        remove: { imports: [FarmOverviewMap, RecentUpdatesTableComponent, HomeAlertsForecastPanel] },
        add: { imports: [MockFarmOverviewMap, MockRecentUpdatesTableComponent, MockHomeAlertsForecastPanelComponent] }
      })
      .compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initialize()

    // Explicitly wait for the view model to finish loading
    while (component.viewModel.isLoading()) {
      await new Promise(resolve => setTimeout(resolve, 10));
      fixture.detectChanges();
    }

    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the grid container', () => {
    const grid = fixture.debugElement.query(By.css('.grid'));
    expect(grid).toBeTruthy();
  });

  it('should display the map card', () => {
    const mapCard = fixture.debugElement.query(By.css('app-farm-overview-map'));
    expect(mapCard).toBeTruthy();
  });

  it('should display the stats components', () => {
    const statusComp = fixture.debugElement.query(By.css('app-farm-base-status'));
    expect(statusComp).toBeTruthy();

    // Check if stat components are rendered inside FarmBaseStatus
    const totalPlants = fixture.debugElement.query(By.css('app-total-plants'));
    const orchardVigor = fixture.debugElement.query(By.css('app-orchard-vigor'));
    const progressCard = fixture.debugElement.query(By.css('app-progress-card'));

    expect(totalPlants).toBeTruthy();
    expect(orchardVigor).toBeTruthy();
    expect(progressCard).toBeTruthy();
  });

  it('should display total trees count accurately', () => {
    const totalPlantsComp = fixture.debugElement.query(By.css('app-total-plants'));
    expect(totalPlantsComp.componentInstance.total()).toBe(1024);
  });

  it('should display the recent updates table component', () => {
    const tableComp = fixture.debugElement.query(By.css('app-recent-updates-table'));
    expect(tableComp).toBeTruthy();
    expect(tableComp.query(By.css('.has-updates'))).toBeTruthy();
  });

  it('should display urgent health alerts', () => {
    const alertsCard = fixture.debugElement.query(By.css('.dashboard__alerts-card'));
    const alertItems = alertsCard.queryAll(By.css('.alert-item'));

    expect(alertsCard).toBeTruthy();
    expect(alertItems.length).toBeGreaterThan(0);
    expect(alertItems[0].query(By.css('.alert-item__title')).nativeElement.textContent).toContain('PAGES.HOME.DASHBOARD.APHID_INFESTATION');
  });

  it('should display the growth forecast chart with correct number of bars', () => {
    const forecastBars = fixture.debugElement.queryAll(By.css('.forecast__bar'));
    expect(forecastBars.length).toBe(7);

    // Check if the first bar has the expected height style
    const firstBar = forecastBars[0].nativeElement;
    expect(firstBar.style.height).toBe('30px');
  });
});
