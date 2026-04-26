import { inject, Injectable, signal } from "@angular/core";
import { PlantsService, type PlantsFilter } from "../../services/plants/plants-service";
import { HomeStatsService, type HomeStats } from "../../services/home-stats/home-stats-service";
import type { Plant, PlantData, PlantInsert, PlantRecentUpdate } from "../../../domain/models/plant-data.model";
import type { PostgrestError } from "@supabase/supabase-js";

@Injectable({
  providedIn: 'root',
})
export class PlantsRepository {
  private plantsService = inject(PlantsService);
  private homeStatsService = inject(HomeStatsService);

  public plants = signal<Plant[]>([]);
  private _routineCurrentPlants = signal<PlantData[]>([]);
  public routineCurrentPlants = this._routineCurrentPlants.asReadonly();

  public addRoutineCurrentPlantsItem(plant: PlantData): void {
    this._routineCurrentPlants.update(plants => {
      const index = plants.findIndex(p => p.id === plant.id);
      if (index !== -1) {
        const newPlants = [...plants];
        newPlants[index] = plant;
        return newPlants;
      }
      return [...plants, plant as PlantData];
    });
  }

  public clearPlants(): void {
    this._routineCurrentPlants.set([]);
  }

  public async findAll(filters: PlantsFilter | null = null): Promise<void> {
    const { data, error } = await this.plantsService.findAll(filters);
    if (!error && data) {
      this.plants.set(data);
    }
  }

  /** Loads plants for the given filters without updating the shared `plants` signal. */
  public async queryPlants(filters: PlantsFilter | null): Promise<Plant[]> {
    const { data, error } = await this.plantsService.findAll(filters);
    if (!error && data) {
      return data;
    }
    return [];
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

  public async insert(plant: PlantInsert): Promise<{ data: Plant | null; error: PostgrestError | null }> {
    const { data, error } = await this.plantsService.insert(plant);
    if (!error && data) {
      this.plants.update(prev => [data, ...prev]);
    }
    return { data, error };
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
