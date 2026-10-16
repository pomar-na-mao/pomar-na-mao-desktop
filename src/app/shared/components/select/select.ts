import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  inject,
  Input as NgInput,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string | number;
  color?: string;
}

@Component({
  selector: 'app-select',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative w-full space-y-1">
      @if (label) {
        <label
          [for]="id"
          class="ui-field-label"
          >{{ label }}</label
        >
      }

      @if (!hasColors) {
        <div class="relative w-full">
          <select
            [id]="id"
            [disabled]="disabled"
            [multiple]="multiple"
            (change)="onInput($event)"
            (blur)="onBlur()"
            class="ui-field ui-select-native"
            [class.ui-field--sm]="size === 'sm'"
            [class.h-32]="multiple"
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
          @if (!multiple) {
            <svg
              class="ui-select-chevron"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          }
        </div>
      } @else {
        <div class="relative w-full">
          <button
            type="button"
            [id]="id"
            [disabled]="disabled"
            (click)="toggleOpen()"
            (keydown.escape)="isOpen = false"
            (blur)="onBlur()"
            class="ui-field ui-select-trigger"
            [class.ui-field--sm]="size === 'sm'"
            [attr.aria-expanded]="isOpen"
            aria-haspopup="listbox"
            [attr.aria-controls]="id + '-listbox'"
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
              class="ui-select-chevron ui-select-chevron--inline transition-transform duration-[180ms]"
              [class.rotate-180]="isOpen"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
              [id]="id + '-listbox'"
              class="ui-select-menu"
              role="listbox"
            >
              @for (option of options; track option.value) {
                <li
                  role="option"
                  [attr.aria-selected]="isSelected(option.value)"
                  (click)="selectOption(option)"
                  (keydown.enter)="selectOption(option)"
                  (keydown.space)="selectOption(option); $event.preventDefault()"
                  class="ui-select-option"
                  tabindex="0"
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
  @NgInput() size: 'sm' | 'md' = 'md';

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

