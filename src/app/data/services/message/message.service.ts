import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type ToastType = 'info' | 'warn' | 'error' | 'success';

export interface ToastMessage {
  text: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private translate = inject(TranslateService);

  public showMessage = signal<boolean>(false);
  public currentMessage = signal<ToastMessage | null>(null);

  public show(text: string, type: ToastType = 'info'): void {
    const translatedText = this.translate.instant(text);
    this.currentMessage.set({ text: translatedText, type });
    this.showMessage.set(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hide();
    }, 5000);
  }

  public hide(): void {
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
