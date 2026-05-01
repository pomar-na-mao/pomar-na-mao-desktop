import { Component, Input as NgInput, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
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
            class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400"
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
            'pl-5': icon,
            'px-3': !icon,
            'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500': errorMessage,
            'border-slate-200': !errorMessage,
          }"
        />
      </div>
      @if (errorMessage) {
        <p class="mt-1 text-xs text-red-500 animate-in slide-in-from-top-1">
          {{ errorMessage }}
        </p>
      }
    </div>
  `,
})
export class Input implements ControlValueAccessor {
  @NgInput() label = '';
  @NgInput() placeholder = '';
  @NgInput() type = 'text';
  @NgInput() id = 'input-' + Math.random().toString(36).substring(2, 9);
  @NgInput() icon = '';
  @NgInput() errors: Record<string, string> = {};

  @NgInput() set value(val: string | null) {
    this._value = val || '';
  }
  get value(): string {
    return this._value;
  }

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get errorMessage(): string {
    if (!this.ngControl || !this.ngControl.errors || !this.ngControl.touched) {
      return '';
    }

    const firstErrorKey = Object.keys(this.ngControl.errors)[0];
    return this.errors[firstErrorKey] || '';
  }

  private _value = '';
  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

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
