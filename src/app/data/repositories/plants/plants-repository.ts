import { inject, Injectable, signal } from "@angular/core";
import { PlantsService, type InspectRoutineFilter } from "../../services/plants/plants-service";
import { HomeStatsService, type HomeStats } from "../../services/home-stats/home-stats-service";
import type { Plant, PlantRecentUpdate } from "../../../domain/models/plant-data.model";

@Injectable({
  providedIn: 'root',
})
export class PlantsRepository {
  private plantsService = inject(PlantsService);
  private homeStatsService = inject(HomeStatsService);

  public plants = signal<Plant[]>([]);

  public async findAll(filters: InspectRoutineFilter | null = null): Promise<void> {
    const { data, error } = await this.plantsService.findAll(filters);
    if (!error && data) {
      this.plants.set(data);
    }
  }

  public async findById(id: string): Promise<Plant | null> {
    const { data, error } = await this.plantsService.findById(id);
    return error ? null : data;
  }

  public async delete(id: string): Promise<void> {
    const { error } = await this.plantsService.delete(id);
    if (!error) {
      this.plants.update(prev => prev.filter(p => p.id !== id));
    }
  }

  public async insert(plant: Plant): Promise<void> {
    const { data, error } = await this.plantsService.insert(plant);
    if (!error && data) {
      this.plants.update(prev => [data, ...prev]);
    }
  }

  public async getTotalCount(): Promise<number> {
    return await this.plantsService.getTotalCount();
  }

  public async getAliveCount(): Promise<number> {
    return await this.plantsService.getAliveCount();
  }

  public async getUpdatedCount(): Promise<number> {
    return await this.plantsService.getUpdatedCount();
  }

  public async getLatestUpdatedAt(): Promise<string | null> {
    return await this.plantsService.getLatestUpdatedAt();
  }

  public async getHomeStats(): Promise<HomeStats> {
    return await this.homeStatsService.getHomeStats();
  }

  public async getRecentUpdates(): Promise<PlantRecentUpdate[]> {
    return await this.homeStatsService.getRecentUpdates();
  }
}
