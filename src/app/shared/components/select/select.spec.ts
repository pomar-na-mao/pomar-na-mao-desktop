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
    component.size = 'sm';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('select');
    const customButton = compiled.querySelector('button');

    expect(select).toBeTruthy();
    expect(customButton).toBeFalsy();
    expect(component.hasColors).toBe(false);
    expect(select?.classList.contains('ui-field')).toBe(true);
    expect(select?.classList.contains('ui-field--sm')).toBe(true);
    expect(compiled.querySelector('svg.ui-select-chevron[aria-hidden="true"]')).toBeTruthy();
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
    expect(customButton?.querySelector('svg.ui-select-chevron[aria-hidden="true"]')).toBeTruthy();

    // Click to open dropdown
    customButton?.click();
    fixture.detectChanges();

    expect(component.isOpen).toBe(true);
    const options = compiled.querySelectorAll('li[role="option"]');
    expect(options.length).toBe(3);
    expect(options[0].getAttribute('tabindex')).toBe('0');
    expect(options[1].getAttribute('aria-selected')).toBe('true');

    // Select "Ponto vazio"
    (options[2] as HTMLElement).click();
    fixture.detectChanges();

    expect(component.value).toBe('empty');
    expect(component.isOpen).toBe(false);
    expect(compiled.textContent).toContain('Ponto vazio');
  });

  it('preserves multiple native selection values and touched state', () => {
    const fixture = TestBed.createComponent(Select);
    const component = fixture.componentInstance;
    const onChange = vi.fn();
    const onTouched = vi.fn();
    component.multiple = true;
    component.options = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ];
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(fixture.nativeElement.querySelector('.ui-select-chevron')).toBeFalsy();
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.dispatchEvent(new Event('change'));
    select.dispatchEvent(new Event('blur'));

    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    expect(onTouched).toHaveBeenCalledOnce();
    expect(component.value).toEqual(['a', 'b']);
  });
});
