import { Component, Input as NgInput, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-1 w-full">
      @if (label) {
        <label [for]="id" class="block text-sm font-medium text-slate-700">{{ label }}</label>
      }
      <select
        [id]="id"
        [disabled]="disabled"
        [multiple]="multiple"
        [value]="value"
        (change)="onInput($event)"
        (blur)="onBlur()"
        class="block w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        @if (placeholder && !multiple) {
          <option value="" disabled>{{ placeholder }}</option>
        }
        @for (option of options; track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
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
  @NgInput() placeholder = '';
  @NgInput() disabled = false;
  @NgInput() multiple = false;

  @Output() valueChange = new EventEmitter<string | string[]>();

  @NgInput() set value(val: string | number | null) {
    this._value = val !== null ? val : '';
  }
  get value(): string | number {
    return this._value;
  }

  private _value: string | number = '';
  private onChange: (value: string | number | string[]) => void = () => { };
  private onTouched: () => void = () => { };

  onInput(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (this.multiple) {
      const selected = Array.from(target.selectedOptions).map(o => o.value);
      this._value = selected.join(',');
      this.onChange(selected);
      this.valueChange.emit(selected);
    } else {
      this._value = target.value;
      this.onChange(this._value);
      this.valueChange.emit(this._value as string);
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string | number | null): void {
    this._value = value !== null ? value : '';
  }

  registerOnChange(fn: (value: string | number | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
