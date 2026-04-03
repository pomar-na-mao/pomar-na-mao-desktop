import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, input, model, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface AppSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './app-select.html',
  host: { class: 'block' },
})
export class AppSelect {
  @Input() public id = '';
  @Input() public label = '';
  @Input() public placeholder = '';
  /* @Input() public value: string | string[] = ''; */
  public value = model<string | string[]>('');
  @Input() public options: AppSelectOption[] = [];
  @Input() public disabled = false;
  @Input() public multiple = false;

  @Output() public valueChange = new EventEmitter<string | string[]>();

  public onValueChange(value: string | string[]): void {
    this.value.set(value);
    this.valueChange.emit(value);
  }
}
