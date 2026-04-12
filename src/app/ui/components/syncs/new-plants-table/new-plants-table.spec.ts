import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPlantsTableComponent } from './new-plants-table';
import { TranslateModule } from '@ngx-translate/core';
import { NewPlantsViewModel } from '../../../view-models/new-plant/new-plants.view-model';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import type { INewPlant } from '../../../../domain/models/new-plant.model';

describe('NewPlantsTableComponent', () => {
  let component: NewPlantsTableComponent;
  let fixture: ComponentFixture<NewPlantsTableComponent>;
  let mockViewModel: Partial<NewPlantsViewModel>;

  beforeEach(async () => {
    mockViewModel = {
      newPlants: signal<INewPlant[]>([
        { id: '1-uuid', latitude: 0, longitude: 0, created_at: new Date().toISOString(), is_approved: false, region: 'A', gps_timestamp: null, updated_at: null },
        { id: '2-uuid', latitude: 0, longitude: 0, created_at: new Date().toISOString(), is_approved: true, region: 'B', gps_timestamp: null, updated_at: null }
      ]),
      sortedNewPlants: signal<INewPlant[]>([
        { id: '2-uuid', latitude: 0, longitude: 0, created_at: new Date().toISOString(), is_approved: true, region: 'B', gps_timestamp: null, updated_at: null },
        { id: '1-uuid', latitude: 0, longitude: 0, created_at: new Date().toISOString(), is_approved: false, region: 'A', gps_timestamp: null, updated_at: null }
      ]),
      isLoading: signal(false),
      isApprovalModalOpen: signal(false),
      selectedNewPlant: signal(null),
      openApprovalModal: vi.fn(),
      closeApprovalModal: vi.fn(),
      approveSelectedNewPlant: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [NewPlantsTableComponent, TranslateModule.forRoot()],
      providers: [
        { provide: NewPlantsViewModel, useValue: mockViewModel }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewPlantsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render rows for each new plant', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    // 2 data rows
    expect(rows.length).toBe(2);
  });

  it('should call openApprovalModal when edit button is clicked', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    const firstRowButton = rows[0].query(By.css('button'));
    firstRowButton.triggerEventHandler('click', null);
    expect(mockViewModel.openApprovalModal).toHaveBeenCalledWith('2-uuid');
  });

  it('should show visibility icon for approved and edit for pending', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    // Find icons within the action buttons
    const row0Icon = rows[0].query(By.css('button span')).nativeElement.textContent.trim();
    const row1Icon = rows[1].query(By.css('button span')).nativeElement.textContent.trim();

    expect(row0Icon).toBe('visibility'); // approved
    expect(row1Icon).toBe('edit'); // pending
  });
});
