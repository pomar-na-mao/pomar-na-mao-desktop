import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FarmBaseStatus } from './farm-base-status';
import { TranslateModule } from '@ngx-translate/core';
import { HomeViewModel } from '../../../view-models/home/home.view-model';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';

describe('FarmBaseStatus', () => {
  let component: FarmBaseStatus;
  let fixture: ComponentFixture<FarmBaseStatus>;
  let mockHomeViewModel: Partial<HomeViewModel>;

  beforeEach(async () => {
    mockHomeViewModel = {
      isLoading: signal(false),
      hasError: signal(false),
      totalPlants: signal(100),
      latestUpdatedAt: signal('2026-04-03T10:00:00Z'),
      vigorPercent: signal(85),
      progressPercent: signal(60),
      initialize: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FarmBaseStatus, TranslateModule.forRoot()],
      providers: [
        { provide: HomeViewModel, useValue: mockHomeViewModel }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FarmBaseStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading skeletons when loading', () => {
    mockHomeViewModel.isLoading!.set(true);
    fixture.detectChanges();
 
    const skeletons = fixture.debugElement.queryAll(By.css('.animate-pulse'));
    expect(skeletons.length).toBeGreaterThan(0);
  });
 
  it('should show error state when hasError is true', () => {
    mockHomeViewModel.hasError!.set(true);
    fixture.detectChanges();
 
    const errorContainer = fixture.debugElement.query(By.css('.bg-error-container'));
    expect(errorContainer).toBeTruthy();
  });

  it('should show status components when loaded', () => {
    const totalPlants = fixture.debugElement.query(By.css('app-total-plants'));
    const orchardVigor = fixture.debugElement.query(By.css('app-orchard-vigor'));
    const progressCard = fixture.debugElement.query(By.css('app-progress-card'));

    expect(totalPlants).toBeTruthy();
    expect(orchardVigor).toBeTruthy();
    expect(progressCard).toBeTruthy();
  });
});
