import { inject, Injectable, signal } from "@angular/core";
import type { Alerts } from "../../../domain/models/alerts.model";
import { AlertsService } from "../../services/alerts/alerts-service";

@Injectable({
  providedIn: 'root',
})
export class AlertsRepository {
  private alertsService = inject(AlertsService);

  public alerts = signal<Alerts[]>([]);

  public async findAll(): Promise<Alerts[]> {
    const { data, error } = await this.alertsService.findAll();
    if (error) {
      throw error;
    }

    const alerts = data ?? [];
    this.alerts.set(alerts);
    return alerts;
  }

  public async findById(id: string): Promise<Alerts | null> {
    const { data, error } = await this.alertsService.findById(id);
    return error ? null : data;
  }
}
