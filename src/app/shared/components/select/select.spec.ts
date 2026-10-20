import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Select } from './select';

describe('Select Component', () => {
  let fixture: ComponentFixture<Select>;
  let component: Select;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Select],
    }).compileComponents();

    fixture = TestBed.createComponent(Select);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should detect hasColors based on options', () => {
    component.options = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
    ];
    expect(component.hasColors).toBe(false);

    component.options = [
      { label: 'Option 1', value: '1', color: '#10b981' },
      { label: 'Option 2', value: '2' },
    ];
    expect(component.hasColors).toBe(true);
  });

  it('should compute currentSingleValue correctly', () => {
    component.value = 'single';
    expect(component.currentSingleValue).toBe('single');

    component.value = ['item1', 'item2'];
    expect(component.currentSingleValue).toBe('item1');

    component.value = null;
    expect(component.currentSingleValue).toBe('');
  });

  it('should compute currentMultiValue correctly', () => {
    component.value = ['val1', 'val2'];
    expect(component.currentMultiValue).toEqual(['val1', 'val2']);

    component.value = 'single-val';
    expect(component.currentMultiValue).toEqual(['single-val']);

    component.value = null;
    expect(component.currentMultiValue).toEqual([]);
  });

  it('should handle single selection changes through onPrimeChange', () => {
    const onChangeSpy = vi.fn();
    const emitSpy = vi.spyOn(component.valueChange, 'emit');
    component.registerOnChange(onChangeSpy);

    component.onPrimeChange('selected-value');

    expect(component.value).toBe('selected-value');
    expect(onChangeSpy).toHaveBeenCalledWith('selected-value');
    expect(emitSpy).toHaveBeenCalledWith('selected-value');
  });

  it('should handle multi selection changes through onPrimeMultiChange', () => {
    const onChangeSpy = vi.fn();
    const emitSpy = vi.spyOn(component.valueChange, 'emit');
    component.registerOnChange(onChangeSpy);

    component.onPrimeMultiChange(['val1', 'val2']);

    expect(component.value).toEqual(['val1', 'val2']);
    expect(onChangeSpy).toHaveBeenCalledWith(['val1', 'val2']);
    expect(emitSpy).toHaveBeenCalledWith(['val1', 'val2']);
  });

  it('should trigger onTouched when onBlur is called', () => {
    const onTouchedSpy = vi.fn();
    component.registerOnTouched(onTouchedSpy);

    component.onBlur();

    expect(onTouchedSpy).toHaveBeenCalledOnce();
  });

  it('should implement ControlValueAccessor writeValue', () => {
    component.writeValue('test-value');
    expect(component.value).toBe('test-value');

    component.writeValue(null);
    expect(component.value).toBe('');
  });

  it('should implement ControlValueAccessor setDisabledState', () => {
    expect(component.disabled).toBe(false);
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
    component.setDisabledState(false);
    expect(component.disabled).toBe(false);
  });

  it('should render label when provided', () => {
    component.label = 'Test Label';
    component.id = 'custom-id';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const labelEl = compiled.querySelector('label');
    expect(labelEl).toBeTruthy();
    expect(labelEl?.textContent?.trim()).toBe('Test Label');
    expect(labelEl?.getAttribute('for')).toBe('custom-id');
  });
});
