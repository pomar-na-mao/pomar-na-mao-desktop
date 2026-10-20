import { Injectable, signal } from '@angular/core';

export type ToastType = 'info' | 'warn' | 'error' | 'success';

export interface ToastMessage {
  text: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public showMessage = signal<boolean>(false);
  public currentMessage = signal<ToastMessage | null>(null);
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  public show(text: string, type: ToastType = 'info'): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    const translatedText = text;
    this.currentMessage.set({ text: translatedText, type });
    this.showMessage.set(true);

    // Auto-hide after 5 seconds
    this.hideTimeout = setTimeout(() => {
      this.hide();
    }, 5000);
  }

  public hide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.showMessage.set(false);
  }

  public success(text: string): void {
    this.show(text, 'success');
  }

  public error(text: string): void {
    this.show(text, 'error');
  }

  public warn(text: string): void {
    this.show(text, 'warn');
  }

  public info(text: string): void {
    this.show(text, 'info');
  }
}
