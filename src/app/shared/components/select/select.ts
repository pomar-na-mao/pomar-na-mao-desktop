import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input as NgInput,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';

export interface SelectOption {
  label: string;
  value: string | number;
  color?: string;
}

@Component({
  selector: 'app-select',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, MultiSelectModule],
  template: `
    <div class="w-full space-y-1">
      @if (label) {
        <label
          [for]="id"
          class="block text-md font-medium text-surface-700 dark:text-surface-200"
          >{{ label }}</label
        >
      }

      @if (!multiple) {
        <p-select
          [id]="id"
          [options]="options"
          optionLabel="label"
          optionValue="value"
          [placeholder]="placeholder || 'Selecione...'"
          [disabled]="disabled"
          [ngModel]="currentSingleValue"
          (ngModelChange)="onPrimeChange($event)"
          (onBlur)="onBlur()"
          appendTo="body"
          [fluid]="true"
          class="w-full"
        >
          @if (hasColors) {
            <ng-template #selectedItem let-selectedOption>
              <div class="flex items-center gap-2">
                @if (selectedOption?.color) {
                  <span
                    class="h-3 w-3 shrink-0 rounded-full border border-white/60 shadow-sm"
                    [style.backgroundColor]="selectedOption?.color"
                  ></span>
                }
                <span>{{ selectedOption?.label }}</span>
              </div>
            </ng-template>
            <ng-template #item let-option>
              <div class="flex items-center gap-2">
                @if (option?.color) {
                  <span
                    class="h-3 w-3 shrink-0 rounded-full border border-white/60 shadow-sm"
                    [style.backgroundColor]="option?.color"
                  ></span>
                }
                <span>{{ option?.label }}</span>
              </div>
            </ng-template>
          }
        </p-select>
      } @else {
        <p-multiselect
          [id]="id"
          [options]="options"
          optionLabel="label"
          optionValue="value"
          [placeholder]="placeholder || 'Selecione...'"
          [disabled]="disabled"
          [ngModel]="currentMultiValue"
          (ngModelChange)="onPrimeMultiChange($event)"
          (onBlur)="onBlur()"
          appendTo="body"
          [fluid]="true"
          class="w-full"
        >
          @if (hasColors) {
            <ng-template #item let-option>
              <div class="flex items-center gap-2">
                @if (option?.color) {
                  <span
                    class="h-3 w-3 shrink-0 rounded-full border border-white/60 shadow-sm"
                    [style.backgroundColor]="option?.color"
                  ></span>
                }
                <span>{{ option?.label }}</span>
              </div>
            </ng-template>
          }
        </p-multiselect>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
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
  @NgInput() size: 'sm' | 'md' = 'md';

  @Output() valueChange = new EventEmitter<string | string[]>();

  @NgInput() set value(val: string | number | string[] | null) {
    this._value = val !== null ? val : '';
  }

  get value(): string | number | string[] {
    return this._value;
  }

  get currentSingleValue(): string | number {
    return Array.isArray(this._value) ? (this._value[0] ?? '') : this._value;
  }

  get currentMultiValue(): string[] {
    if (Array.isArray(this._value)) {
      return this._value as string[];
    }
    return this._value ? [String(this._value)] : [];
  }

  private _value: string | number | string[] = '';
  private onChange: (value: string | number | string[]) => void = () => {};
  private onTouched: () => void = () => {};

  public get hasColors(): boolean {
    return this.options.some((opt) => !!opt.color);
  }

  public onPrimeChange(val: string | number): void {
    this._value = val;
    this.onChange(this._value);
    this.valueChange.emit(this._value as string);
  }

  public onPrimeMultiChange(val: string[]): void {
    this._value = val || [];
    this.onChange(this._value);
    this.valueChange.emit(this._value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string | number | string[] | null): void {
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
