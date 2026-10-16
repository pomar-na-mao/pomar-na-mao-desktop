import { Directive, ElementRef, inject, Input, Renderer2 } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'warning' | 'info' | 'danger';
export type ButtonSize = 'sm' | 'md';

@Directive({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  host: { class: 'ui-btn' },
})
export class ButtonDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  @Input() set variant(value: ButtonVariant) {
    this.renderer.setAttribute(this.element.nativeElement, 'data-ui-variant', value);
  }

  @Input() set size(value: ButtonSize) {
    this.renderer.setAttribute(this.element.nativeElement, 'data-ui-size', value);
  }

  @Input() set iconOnly(value: boolean) {
    this.toggleClass('ui-btn--icon', value);
  }

  @Input() set block(value: boolean) {
    this.toggleClass('ui-btn--block', value);
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
