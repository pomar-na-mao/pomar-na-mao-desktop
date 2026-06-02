import { inject, Injectable } from "@angular/core";
import { HomeDashboardService } from "../../services/home-dashboard/home-dashboard-service";
import type {
  HomeDashboardFilterOptions,
  HomeDashboardSnapshot,
} from "../../../domain/models/home-dashboard.model";

@Injectable({
  providedIn: 'root',
})
export class HomeDashboardRepository {
  private homeDashboardService = inject(HomeDashboardService);

  public async getSnapshot(): Promise<HomeDashboardSnapshot> {
    return await this.homeDashboardService.getSnapshot();
  }

  public async getFilterOptions(): Promise<HomeDashboardFilterOptions> {
    return await this.homeDashboardService.getFilterOptions();
  }
}
