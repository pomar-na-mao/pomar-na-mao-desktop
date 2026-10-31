import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Infrastructure } from './infrastructure/infrastructure';

describe('Development views', () => {
  it.each([
    Infrastructure,
  ])('should render the development message for %s', async (component) => {
    await TestBed.configureTestingModule({ imports: [component] }).compileComponents();

    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Em desenvolvimento');
  });
});
