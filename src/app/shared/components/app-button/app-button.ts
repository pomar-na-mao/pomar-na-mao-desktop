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
      'bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg hover:opacity-95!': this.variant === 'primary',
      'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80!': this.variant === 'secondary',
      'border-2 border-primary/20 text-primary hover:bg-primary/5!': this.variant === 'outline',
      'text-on-surface-variant hover:bg-surface-container-low!': this.variant === 'ghost',
      'bg-error text-on-error hover:bg-error/90!': this.variant === 'error',
    };
  }
}
