import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import { ButtonDirective, ButtonVariant } from './button.directive';

@Component({
  imports: [ButtonDirective],
  template: `
    <button
      appButton
      type="button"
      [variant]="variant"
      [size]="size"
      [iconOnly]="iconOnly"
      [block]="block"
      [disabled]="disabled"
      aria-label="Ação de teste"
      (click)="onClick()"
    >
      Conteúdo preservado
    </button>
  `,
})
class TestHost {
  variant: ButtonVariant = 'primary';
  size: 'sm' | 'md' = 'md';
  iconOnly = false;
  block = false;
  disabled = false;
  onClick = vi.fn();
}

describe('ButtonDirective', () => {
  function createFixture(): ComponentFixture<TestHost> {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    return fixture;
  }

  it.each<ButtonVariant>(['primary', 'secondary', 'warning', 'info', 'danger'])(
    'applies the %s semantic variant without replacing native content',
    (variant) => {
      const fixture = createFixture();
      const directive = fixture.debugElement
        .query(By.directive(ButtonDirective))
        .injector.get(ButtonDirective);
      directive.variant = variant;
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

      expect(button.classList.contains('ui-btn')).toBe(true);
      expect(button.dataset['uiVariant']).toBe(variant);
      expect(button.textContent).toContain('Conteúdo preservado');
      expect(button.type).toBe('button');
    },
  );

  it('applies size, icon-only and block host states', () => {
    const fixture = createFixture();
    const directive = fixture.debugElement
      .query(By.directive(ButtonDirective))
      .injector.get(ButtonDirective);
    directive.size = 'sm';
    directive.iconOnly = true;
    directive.block = true;
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.dataset['uiSize']).toBe('sm');
    expect(button.classList.contains('ui-btn--icon')).toBe(true);
    expect(button.classList.contains('ui-btn--block')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Ação de teste');
  });

  it('preserves native click and disabled behavior', () => {
    const fixture = createFixture();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    button.click();
    expect(fixture.componentInstance.onClick).toHaveBeenCalledTimes(1);

    fixture.componentInstance.disabled = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    button.click();
    expect(fixture.componentInstance.onClick).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
  });
});
