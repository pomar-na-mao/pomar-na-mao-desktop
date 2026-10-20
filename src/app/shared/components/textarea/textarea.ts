import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    Input as NgInput,
} from '@angular/core';
import {
    ControlValueAccessor,
    NgControl,
    ReactiveFormsModule,
} from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextareaModule, MessageModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="space-y-1 w-full">
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
        <textarea
          pTextarea
          [id]="id"
          [placeholder]="placeholder"
          [value]="value"
          [rows]="rows"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [disabled]="disabled"
          [readOnly]="readonly"
          [attr.aria-invalid]="errorMessage ? 'true' : null"
          [attr.aria-describedby]="errorMessage ? id + '-error' : null"
          class="w-full resize-none"
          [ngClass]="{
            'p-inputtext-sm': size === 'sm',
            'ng-invalid ng-dirty': !!errorMessage
          }"
        ></textarea>
      </div>
      @if (errorMessage) {
        <p-message severity="error" variant="simple" class="mt-[3px] flex items-start">
          <span class="text-sm" [id]="id + '-error'">{{ errorMessage }}</span>
        </p-message>
      }
    </div>
  `,
})
export class Textarea implements ControlValueAccessor {
  @NgInput() label = '';
  @NgInput() placeholder = '';
  @NgInput() id = 'textarea-' + Math.random().toString(36).substring(2, 9);
  @NgInput() rows = 3;
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
    const target = event.target as HTMLTextAreaElement;
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

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
