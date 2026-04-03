import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrchardVigorComponent } from './orchard-vigor';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

describe('OrchardVigorComponent', () => {
  let component: OrchardVigorComponent;
  let fixture: ComponentFixture<OrchardVigorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrchardVigorComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrchardVigorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the vigor percentage', () => {
    fixture.componentRef.setInput('percent', 85);
    fixture.detectChanges();

    const valueElement = fixture.debugElement.query(By.css('.text-\\[24px\\]'));
    expect(valueElement.nativeElement.textContent.trim()).toBe('85%');
  });

  it('should display healthy badge if percent >= 70', () => {
    fixture.componentRef.setInput('percent', 75);
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('.text-\\[9px\\]'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain('PAGES.HOME.DASHBOARD.HEALTHY');
  });

  it('should display unhealthy badge if percent < 70', () => {
    fixture.componentRef.setInput('percent', 65);
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('.text-\\[9px\\]'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain('PAGES.HOME.DASHBOARD.UNHEALTHY');
  });
});
