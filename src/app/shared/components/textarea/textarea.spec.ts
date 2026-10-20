import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { Textarea } from './textarea';

@Component({
  imports: [ReactiveFormsModule, Textarea],
  template: `
    <form [formGroup]="form">
      <app-textarea
        label="Observações"
        size="sm"
        formControlName="notes"
        [errors]="{ required: 'Observação obrigatória' }"
      />
    </form>
  `,
})
class TextareaHost {
  form = new FormGroup({ notes: new FormControl('', Validators.required) });
}

describe('Textarea', () => {
  it('preserves value, blur and compact error states', () => {
    const fixture = TestBed.createComponent(TextareaHost);
    fixture.detectChanges();
    const control = fixture.componentInstance.form.controls.notes;
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    textarea.value = 'Texto de teste';
    textarea.dispatchEvent(new Event('input'));
    textarea.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(control.value).toBe('Texto de teste');
    expect(control.touched).toBe(true);
    expect(textarea.classList.contains('p-inputtext-sm')).toBe(true);

    control.setValue('');
    control.markAsTouched();
    fixture.detectChanges();
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Observação obrigatória');
  });
});
