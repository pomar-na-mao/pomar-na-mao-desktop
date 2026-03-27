import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MessageService } from '../../../data/services/message/message.service';

@Component({
  selector: 'app-toast',
  imports: [NgClass],
  templateUrl: './app-toast.html'
})
export class AppToast {
  public messageService = inject(MessageService);

  public get bgClass(): string {
    const type = this.messageService.currentMessage()?.type;
    switch (type) {
      case 'success': return 'bg-success/90 border-success';
      case 'error': return 'bg-error/90 border-error';
      case 'warn': return 'bg-warning/90 border-warning';
      case 'info': return 'bg-primary/90 border-primary';
      default: return 'bg-surface/90 border-outline-variant';
    }
  }

  public get icon(): string {
    const type = this.messageService.currentMessage()?.type;
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warn': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }
}
