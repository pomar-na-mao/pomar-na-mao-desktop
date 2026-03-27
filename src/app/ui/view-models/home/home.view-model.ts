import { computed, inject, Injectable, signal } from "@angular/core";
import { PlantsRepository } from "../../../data/repositories/plants/plants-repository";
import type { PlantRecentUpdate } from "../../../domain/models/plant-data.model";

@Injectable()
export class HomeViewModel {
  private plantsRepository = inject(PlantsRepository);

  public totalPlants = signal<number>(0);
  public latestUpdatedAt = signal<string | null>(null);
  public alivePlants = signal<number>(0);
  public updatedPlants = signal<number>(0);
  public recentUpdates = signal<PlantRecentUpdate[]>([]);
  public isLoading = signal<boolean>(true);
  public hasError = signal<boolean>(false);

  public vigorPercent = computed(() => {
    const total = this.totalPlants();
    if (total === 0) return 0;
    return Math.round((this.alivePlants() / total) * 100);
  });

  public progressPercent = computed(() => {
    const total = this.totalPlants();
    if (total === 0) return 0;
    return Math.round((this.updatedPlants() / total) * 100);
  });

  public async initialize(): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const stats = await this.plantsRepository.getHomeStats();

      this.totalPlants.set(stats.total_plants);
      this.alivePlants.set(stats.alive_plants);
      this.updatedPlants.set(stats.updated_plants);
      if (stats.latest_updated_at) {
        this.latestUpdatedAt.set(stats.latest_updated_at);
      }

      const updates = await this.plantsRepository.getRecentUpdates();
      this.recentUpdates.set(updates);
    } catch (error) {
      console.error('[HomeViewModel] Error initializing home stats:', error);
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  public async refreshRecentUpdates(): Promise<void> {
    this.isLoading.set(true);
    try {
      const updates = await this.plantsRepository.getRecentUpdates();
      this.recentUpdates.set(updates);
    } catch (error) {
      console.error('[HomeViewModel] Error refreshing recent updates:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
