import { Directive, ElementRef, inject, Input, Renderer2 } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'warning' | 'info' | 'danger';
export type ButtonSize = 'sm' | 'md';

@Directive({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  host: { class: 'p-button p-component' },
})
export class ButtonDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  private currentVariantClass = 'p-button-primary';
  private currentSizeClass = '';

  @Input() set variant(value: ButtonVariant) {
    if (this.currentVariantClass) {
      this.renderer.removeClass(this.element.nativeElement, this.currentVariantClass);
    }
    switch (value) {
      case 'secondary':
        this.currentVariantClass = 'p-button-secondary';
        break;
      case 'danger':
        this.currentVariantClass = 'p-button-danger';
        break;
      case 'warning':
        this.currentVariantClass = 'p-button-warn';
        break;
      case 'info':
        this.currentVariantClass = 'p-button-info';
        break;
      case 'primary':
      default:
        this.currentVariantClass = 'p-button-primary';
        break;
    }
    this.renderer.addClass(this.element.nativeElement, this.currentVariantClass);
    this.renderer.setAttribute(this.element.nativeElement, 'data-ui-variant', value);
  }

  @Input() set size(value: ButtonSize) {
    if (this.currentSizeClass) {
      this.renderer.removeClass(this.element.nativeElement, this.currentSizeClass);
    }
    if (value === 'sm') {
      this.currentSizeClass = 'p-button-sm';
      this.renderer.addClass(this.element.nativeElement, this.currentSizeClass);
    } else {
      this.currentSizeClass = '';
    }
    this.renderer.setAttribute(this.element.nativeElement, 'data-ui-size', value);
  }

  @Input() set iconOnly(value: boolean) {
    this.toggleClass('p-button-icon-only', value);
  }

  @Input() set block(value: boolean) {
    this.toggleClass('w-full', value);
  }

  constructor() {
    this.variant = 'primary';
    this.size = 'md';
  }

  private toggleClass(className: string, enabled: boolean): void {
    if (enabled) {
      this.renderer.addClass(this.element.nativeElement, className);
    } else {
      this.renderer.removeClass(this.element.nativeElement, className);
    }
  }
}
