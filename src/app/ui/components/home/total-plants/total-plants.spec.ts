import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TotalPlantsComponent } from './total-plants';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

describe('TotalPlantsComponent', () => {
  let component: TotalPlantsComponent;
  let fixture: ComponentFixture<TotalPlantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalPlantsComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TotalPlantsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the total number of plants', () => {
    fixture.componentRef.setInput('total', 1234);
    fixture.detectChanges();

    const valueElement = fixture.debugElement.query(By.css('.text-\\[24px\\]'));
    // Depending on the locale, '1234 | number' could be '1,234' or '1.234'
    expect(valueElement.nativeElement.textContent.trim()).toMatch(/1.234/);
  });

  it('should display the last update time if provided', () => {
    const now = new Date().toISOString();
    fixture.componentRef.setInput('latestUpdatedAt', now);
    fixture.detectChanges();

    const subElement = fixture.debugElement.query(By.css('.text-\\[11px\\]'));
    expect(subElement.nativeElement.textContent).toBeTruthy();
  });

  it('should display a fallback message if latestUpdatedAt is null', () => {
    fixture.componentRef.setInput('latestUpdatedAt', null);
    fixture.detectChanges();

    const subElement = fixture.debugElement.query(By.css('.text-\\[11px\\]'));
    // If it's null, TimeAgoPipe returns '', so it renders the prefix
    expect(subElement.nativeElement.textContent).toContain('PAGES.HOME.DASHBOARD.UPDATED_MINS_AGO');
  });
});
