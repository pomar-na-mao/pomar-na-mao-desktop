import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-1 w-full">
      @if (label) {
        <div class="flex items-center justify-between">
          <label [for]="id" class="block text-sm font-medium text-slate-700">{{ label }}</label>
          <ng-content select="[label-extra]"></ng-content>
        </div>
      }
      <div class="relative">
        @if (icon) {
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
            [innerHTML]="icon"
          ></div>
        }
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          class="block w-full py-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all outline-none"
          [ngClass]="{
            'pl-10': icon,
            'px-4': !icon,
            'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500': error,
            'border-slate-200': !error,
          }"
        />
      </div>
      @if (error) {
        <p class="mt-1 text-xs text-red-500 animate-in slide-in-from-top-1">
          {{ error }}
        </p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() id = 'input-' + Math.random().toString(36).substring(2, 9);
  @Input() icon = '';
  @Input() error = '';

  @Input() set value(val: string | null) {
    this._value = val || '';
  }
  get value(): string {
    return this._value;
  }

  private _value = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._value = target.value;
    this.onChange(this._value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this._value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
