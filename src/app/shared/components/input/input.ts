import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    Input as NgInput,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormsModule,
    NgControl,
    ReactiveFormsModule,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-input',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, DatePickerModule, MessageModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="w-full space-y-1">
      @if (label) {
        <div class="flex items-center justify-between">
          <label
            [for]="id"
            class="block text-md font-medium text-surface-700 dark:text-surface-200"
            >{{ label }}</label
          >
          <ng-content select="[label-extra]"></ng-content>
        </div>
      }
      <div class="relative">
        @if (type === 'date') {
          <p-datepicker
            [id]="id"
            [placeholder]="placeholder"
            [ngModel]="value"
            (ngModelChange)="onDateChange($event)"
            (onBlur)="onBlur()"
            [disabled]="disabled"
            [readonlyInput]="readonly"
            dateFormat="yy-mm-dd"
            dataType="string"
            [showIcon]="true"
            appendTo="body"
            [fluid]="true"
            [ngClass]="{
              'ng-invalid ng-dirty': !!errorMessage
            }"
          />
        } @else {
          @if (icon) {
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-400 z-10"
              [innerHTML]="icon"
            ></div>
          }
          <input
            pInputText
            [id]="id"
            [type]="type"
            [placeholder]="placeholder"
            [value]="value"
            (input)="onInput($event)"
            (blur)="onBlur()"
            [disabled]="disabled"
            [readOnly]="readonly"
            [attr.aria-invalid]="errorMessage ? 'true' : null"
            [attr.aria-describedby]="errorMessage ? id + '-error' : null"
            class="w-full"
            [ngClass]="{
              'p-inputtext-sm': size === 'sm',
              'ng-invalid ng-dirty': !!errorMessage,
              'pl-10': !!icon,
              'pr-10': trailingAction
            }"
          />
          @if (trailingAction) {
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 z-10">
              <ng-content select="[input-extra]"></ng-content>
            </div>
          }
        }
      </div>
      @if (errorMessage) {
        <p-message severity="error" variant="simple" class="mt-[3px] flex items-start">
          <span class="text-sm" [id]="id + '-error'">{{ errorMessage }}</span>
        </p-message>
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
  @NgInput() trailingAction = false;
  @NgInput() errors: Record<string, string> = {};
  @NgInput() disabled = false;
  @NgInput() readonly = false;
  @NgInput() size: 'sm' | 'md' = 'md';

  public ngControl = inject(NgControl, { optional: true, self: true });

  @NgInput() set value(val: string | null) {
    this._value = val || '';
  }
  get value(): string {
    return this._value;
  }

  constructor() {
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
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._value = target.value;
    this.onChange(this._value);
  }

  onDateChange(newVal: string | null): void {
    this._value = newVal || '';
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

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
