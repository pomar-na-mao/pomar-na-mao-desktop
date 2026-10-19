import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { Input } from './input';

@Component({
  imports: [ReactiveFormsModule, Input],
  template: `
    <form [formGroup]="form">
      <app-input
        label="Nome"
        size="sm"
        formControlName="name"
        [errors]="{ required: 'Nome obrigatório' }"
      />
    </form>
  `,
})
class InputHost {
  form = new FormGroup({ name: new FormControl('', Validators.required) });
}

describe('Input', () => {
  function createFixture(): ComponentFixture<InputHost> {
    const fixture = TestBed.createComponent(InputHost);
    fixture.detectChanges();
    return fixture;
  }

  it('preserves ControlValueAccessor input and touched behavior', () => {
    const fixture = createFixture();
    const control = fixture.componentInstance.form.controls.name;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'Talhão norte';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(control.value).toBe('Talhão norte');
    expect(control.touched).toBe(true);
  });

  it('renders compact and accessible error states', () => {
    const fixture = createFixture();
    const control = fixture.componentInstance.form.controls.name;
    control.markAsTouched();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.classList.contains('p-inputtext-sm')).toBe(true);
    expect(input.classList.contains('ng-invalid')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Nome obrigatório');
  });

  it('preserves disabled and readonly native states', () => {
    const fixture = createFixture();
    const component = fixture.debugElement.query(By.directive(Input)).componentInstance as Input;
    fixture.componentInstance.form.controls.name.disable();
    component.readonly = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.disabled).toBe(true);
    expect(input.readOnly).toBe(true);
  });
});
