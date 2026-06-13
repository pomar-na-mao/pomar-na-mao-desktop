import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  public isLoading = signal<boolean>(false);
  public message = signal<string | undefined>(undefined);

  show(message?: string) {
    this.message.set(message);
    this.isLoading.set(true);
  }

  hide() {
    this.isLoading.set(false);
    this.message.set(undefined);
  }
}
