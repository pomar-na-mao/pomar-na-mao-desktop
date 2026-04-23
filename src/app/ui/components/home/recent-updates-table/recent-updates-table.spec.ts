import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentUpdatesTableComponent } from './recent-updates-table';
import { TranslateModule } from '@ngx-translate/core';
import { HomeViewModel } from '../../../view-models/home/home.view-model';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { By } from '@angular/platform-browser';
import type { PlantRecentUpdate } from '../../../../domain/models/plant-data.model';

describe('RecentUpdatesTableComponent', () => {
  let component: RecentUpdatesTableComponent;
  let fixture: ComponentFixture<RecentUpdatesTableComponent>;
  let mockHomeViewModel: Partial<HomeViewModel>;

  beforeEach(async () => {
    mockHomeViewModel = {
      recentUpdates: signal([
        {
          id: '1-uuid',
          variety: 'Gala',
          region: 'Sector A',
          updated_at: new Date().toISOString(),
          stick: false,
          broken_branch: false,
          vine_growing: false,
          burnt_branch: false,
          struck_by_lightning: false,
          drill: false,
          anthill: false,
          in_experiment: false,
          weeds_in_the_basin: false,
          fertilization_or_manuring: false,
          mites: false,
          thrips: false,
          empty_collection_box_near: false,
          is_new: false,
          non_existent: false,
          frost: false,
          flowers: false,
          buds: false,
          dehydrated: false,
          is_dead: false,
          wasUpdated: true
        } as PlantRecentUpdate,
        {
          id: '2-uuid',
          variety: 'Fuji',
          region: 'Sector B',
          updated_at: new Date().toISOString(),
          stick: false,
          broken_branch: false,
          vine_growing: false,
          burnt_branch: false,
          struck_by_lightning: false,
          drill: false,
          anthill: false,
          in_experiment: false,
          weeds_in_the_basin: false,
          fertilization_or_manuring: false,
          mites: false,
          thrips: false,
          empty_collection_box_near: false,
          is_new: false,
          non_existent: false,
          frost: false,
          flowers: false,
          buds: false,
          dehydrated: false,
          is_dead: false,
          wasUpdated: true
        } as PlantRecentUpdate
      ]),
      isLoading: signal(false),
       selectedPlant: signal(null),
      openPlantDetail: vi.fn(),
      closePlantDetail: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RecentUpdatesTableComponent, TranslateModule.forRoot()],
      providers: [
        { provide: HomeViewModel, useValue: mockHomeViewModel }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecentUpdatesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format updates correctly', () => {
    const formatted = component.formattedUpdates();
    expect(formatted.length).toBe(2);
    expect(formatted[0].formattedId).toBe('1');
  });

  it('should render rows for each update', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
  });

  it('should show empty state if no updates', () => {
    mockHomeViewModel.recentUpdates!.set([]);
    fixture.detectChanges();

    const emptyMessage = fixture.debugElement.query(By.css('tbody p.text-on-surface-variant'));
    // The @empty block renders a table row with the message
    expect(emptyMessage.nativeElement.textContent).toContain('PAGES.HOME.DASHBOARD.NO_RECENT_UPDATES');
    
    // There's still 1 row (the empty state row)
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(1);
  });
});
