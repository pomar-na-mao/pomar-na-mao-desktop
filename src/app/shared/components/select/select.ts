import {
  Component,
  Input as NgInput,
  Output,
  EventEmitter,
  forwardRef,
  ChangeDetectionStrategy,
  ElementRef,
  HostListener,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  label: string;
  value: string | number;
  color?: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-1 w-full relative">
      @if (label) {
        <label
          [for]="id"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >{{ label }}</label
        >
      }

      @if (!hasColors) {
        <select
          [id]="id"
          [disabled]="disabled"
          [multiple]="multiple"
          (change)="onInput($event)"
          (blur)="onBlur()"
          [class]="
            multiple
              ? 'block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed h-32'
              : 'block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          "
        >
          @if (placeholder && !multiple) {
            <option value="" disabled>{{ placeholder }}</option>
          }
          @for (option of options; track option.value) {
            <option [value]="option.value" [selected]="isSelected(option.value)">
              {{ option.label }}
            </option>
          }
        </select>
      } @else {
        <div class="relative w-full">
          <button
            type="button"
            [id]="id"
            [disabled]="disabled"
            (click)="toggleOpen()"
            (keydown.escape)="isOpen = false"
            class="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm text-slate-700 transition-all outline-none hover:bg-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/60"
            [attr.aria-expanded]="isOpen"
          >
            <div class="flex items-center gap-2 truncate">
              @if (selectedOption?.color) {
                <span
                  class="h-3 w-3 shrink-0 rounded-full border border-white/60 shadow-sm dark:border-white/10"
                  [style.backgroundColor]="selectedOption?.color"
                ></span>
              }
              <span class="truncate">{{ selectedOption?.label || placeholder || 'Selecione...' }}</span>
            </div>
            <svg
              class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200"
              [class.rotate-180]="isOpen"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          @if (isOpen) {
            <ul
              class="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
              role="listbox"
            >
              @for (option of options; track option.value) {
                <li
                  role="option"
                  [attr.aria-selected]="isSelected(option.value)"
                  (click)="selectOption(option)"
                  class="flex cursor-pointer items-center justify-between px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  [class.bg-slate-100]="isSelected(option.value)"
                  [class.dark:bg-slate-700/60]="isSelected(option.value)"
                >
                  <div class="flex items-center gap-2 truncate">
                    @if (option.color) {
                      <span
                        class="h-3 w-3 shrink-0 rounded-full border border-white/60 shadow-sm dark:border-white/10"
                        [style.backgroundColor]="option.color"
                      ></span>
                    } @else {
                      <span class="h-3 w-3 shrink-0"></span>
                    }
                    <span class="truncate">{{ option.label }}</span>
                  </div>

                  @if (isSelected(option.value)) {
                    <svg
                      class="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  }
                </li>
              }
            </ul>
          }
        </div>
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

  @Output() valueChange = new EventEmitter<string | string[]>();

  @NgInput() set value(val: string | number | string[] | null) {
    this._value = val !== null ? val : '';
  }
  get value(): string | number | string[] {
    return this._value;
  }

  public isOpen = false;
  private elementRef = inject(ElementRef);
  private _value: string | number | string[] = '';
  private onChange: (value: string | number | string[]) => void = () => {};
  private onTouched: () => void = () => {};

  public get hasColors(): boolean {
    return !this.multiple && this.options.some((opt) => !!opt.color);
  }

  public get selectedOption(): SelectOption | undefined {
    return this.options.find((opt) => String(opt.value) === String(this._value));
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  public toggleOpen(): void {
    if (this.disabled) {
      return;
    }
    this.isOpen = !this.isOpen;
  }

  public selectOption(option: SelectOption): void {
    this._value = option.value;
    this.onChange(this._value);
    this.valueChange.emit(this._value as string);
    this.isOpen = false;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (this.multiple) {
      const selected = Array.from(target.selectedOptions).map((o) => o.value);
      this._value = selected;
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

  writeValue(value: string | number | string[] | null): void {
    this._value = value !== null ? value : '';
  }

  isSelected(optionValue: string | number): boolean {
    if (this.multiple && Array.isArray(this._value)) {
      return this._value.includes(optionValue.toString());
    }
    return this._value == optionValue;
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

