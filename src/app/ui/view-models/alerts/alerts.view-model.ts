import { inject, Injectable, signal } from "@angular/core";
import { AlertsRepository } from "../../../data/repositories/alerts/alerts-repository";
import type { Alerts } from "../../../domain/models/alerts.model";

@Injectable()
export class AlertsViewModel {
  private alertsRepository = inject(AlertsRepository);

  public alerts = this.alertsRepository.alerts;
  public isLoading = signal<boolean>(true);
  public hasError = signal<boolean>(false);

  public async initialize(): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      await this.alertsRepository.findAll();
    } catch (error) {
      console.error('[AlertsViewModel] Error loading alerts:', error);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  public trackByAlertId(_index: number, alert: Alerts): string {
    return alert.id;
  }
}
