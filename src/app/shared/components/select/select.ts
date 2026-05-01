import { Component, Input as NgInput, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-select',
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-1 w-full">
      @if (label) {
        <label [for]="id" class="block text-sm font-medium text-slate-700">{{ label }}</label>
      }
      <select
        [id]="id"
        [value]="value"
        (change)="onInput($event)"
        (blur)="onBlur()"
        class="block w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
      >
        @for (option of options; track option) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
})
export class Select implements ControlValueAccessor {
  @NgInput() label = '';
  @NgInput() id = 'select-' + Math.random().toString(36).substring(2, 9);
  @NgInput() options: SelectOption[] = [];

  @NgInput() set value(val: string | number | null) {
    this._value = val !== null ? val : '';
  }
  get value(): string | number {
    return this._value;
  }

  private _value: string | number = '';
  private onChange: (value: string | number) => void = () => { };
  private onTouched: () => void = () => { };

  onInput(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this._value = target.value;
    this.onChange(this._value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string | number | null): void {
    this._value = value !== null ? value : '';
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
