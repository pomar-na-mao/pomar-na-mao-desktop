import { computed, inject, Injectable, signal } from "@angular/core";
import type { INewPlant } from "../../../domain/models/new-plant.model";
import { NewPlantsService } from "../../services/new-plants/new-plants-service";

@Injectable({
  providedIn: 'root',
})
export class NewPlantsRepository {
  private newPlantsService = inject(NewPlantsService);

  private _newPlants = signal<INewPlant[]>([]);
  public newPlants = this._newPlants.asReadonly();

  private _selectedNewPlantId = signal<string | null>(null);
  public selectedNewPlant = computed(() => {
    const selectedNewPlantId = this._selectedNewPlantId();

    if (!selectedNewPlantId) return null;

    return this._newPlants().find(newPlant => newPlant.id === selectedNewPlantId) ?? null;
  });

  private _isLoading = signal<boolean>(false);
  public isLoading = this._isLoading.asReadonly();

  private _error = signal<string | null>(null);
  public error = this._error.asReadonly();

  public setSelectedNewPlantId(id: string | null): void {
    this._selectedNewPlantId.set(id);
  }

  public async fetchNewPlants(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const { data, error } = await this.newPlantsService.getNewPlants();

      if (error) throw error;

      this._newPlants.set(data ?? []);
    } catch (error) {
      this._error.set(`Error fetching new plants\n${JSON.stringify(error)}`);
    } finally {
      this._isLoading.set(false);
    }
  }
}
