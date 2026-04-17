import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './app-button.html',
  host: { class: 'block' },
})
export class AppButton {
  @Input() public label = '';
  @Input() public loading = false;
  @Input() public disabled = false;
  @Input() public fullWidth = true;
  @Input() public variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error' = 'primary';
  @Input() public type: 'submit' | 'button' | 'reset' = 'submit';

  public get variantClasses(): Record<string, boolean> {
    return {
      'bg-linear-to-br from-primary to-primary-container text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-95 disabled:shadow-none disabled:scale-100 disabled:from-surface-container-highest disabled:to-surface-container-highest disabled:text-on-surface-variant/50': this.variant === 'primary',
      'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 hover:scale-[1.02] active:scale-95': this.variant === 'secondary',
      'border-2 border-primary/20 text-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-95': this.variant === 'outline',
      'text-on-surface-variant hover:bg-surface-container-low hover:scale-[1.02] active:scale-95': this.variant === 'ghost',
      'bg-error text-on-error hover:bg-error/90 hover:scale-[1.02] active:scale-95': this.variant === 'error',
    };
  }
}
