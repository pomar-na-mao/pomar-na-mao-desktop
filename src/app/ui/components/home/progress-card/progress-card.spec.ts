import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressCardComponent } from './progress-card';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ProgressCardComponent', () => {
  let component: ProgressCardComponent;
  let fixture: ComponentFixture<ProgressCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressCardComponent, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the progress percentage', () => {
    fixture.componentRef.setInput('percent', 42);
    fixture.detectChanges();

    const valueElement = fixture.debugElement.query(By.css('.text-\\[24px\\]'));
    expect(valueElement.nativeElement.textContent.trim()).toBe('42%');
  });

  it('should update progress bar width based on percent', () => {
    fixture.componentRef.setInput('percent', 60);
    fixture.detectChanges();

    const progressFill = fixture.debugElement.query(By.css('.h-full'));
    expect(progressFill.nativeElement.style.width).toBe('60%');
  });
});
