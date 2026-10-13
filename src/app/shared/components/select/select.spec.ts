import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Select } from './select';

describe('Select Component', () => {
  it('should render native select when options do not have colors', () => {
    const fixture = TestBed.createComponent(Select);
    const component = fixture.componentInstance;
    component.options = [
      { label: 'Opção 1', value: '1' },
      { label: 'Opção 2', value: '2' },
    ];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('select');
    const customButton = compiled.querySelector('button');

    expect(select).toBeTruthy();
    expect(customButton).toBeFalsy();
    expect(component.hasColors).toBe(false);
  });

  it('should render custom dropdown with color badge when options have colors', () => {
    const fixture = TestBed.createComponent(Select);
    const component = fixture.componentInstance;
    component.options = [
      { label: 'Todos', value: '' },
      { label: 'Planta viva', value: 'alive', color: '#10b981' },
      { label: 'Ponto vazio', value: 'empty', color: '#ef4444' },
    ];
    component.value = 'alive';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nativeSelect = compiled.querySelector('select');
    const customButton = compiled.querySelector('button');

    expect(nativeSelect).toBeFalsy();
    expect(customButton).toBeTruthy();
    expect(component.hasColors).toBe(true);
    expect(compiled.textContent).toContain('Planta viva');

    // Click to open dropdown
    customButton?.click();
    fixture.detectChanges();

    expect(component.isOpen).toBe(true);
    const options = compiled.querySelectorAll('li[role="option"]');
    expect(options.length).toBe(3);

    // Select "Ponto vazio"
    (options[2] as HTMLElement).click();
    fixture.detectChanges();

    expect(component.value).toBe('empty');
    expect(component.isOpen).toBe(false);
    expect(compiled.textContent).toContain('Ponto vazio');
  });
});
