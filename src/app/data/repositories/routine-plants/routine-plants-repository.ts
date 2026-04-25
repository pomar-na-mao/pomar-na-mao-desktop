import { inject, Injectable, signal } from "@angular/core";
import { RoutinePlantsService } from "../../services/routine-plants/routine-plants-service";
import type { IRoutinePlants } from "../../../domain/models/routine-plants.model";
import type { PlantData } from "../../../domain/models/plant-data.model";

@Injectable({
  providedIn: 'root',
})
export class RoutinePlantsRepository {
  private routinePlantsService = inject(RoutinePlantsService);

  private _routinePlants = signal<IRoutinePlants[]>([]);
  public routinePlants = this._routinePlants.asReadonly();

  private _selectedRoutinePlant = signal<IRoutinePlants | null>(null);
  public selectedRoutinePlant = this._selectedRoutinePlant.asReadonly();

  private _isLoading = signal<boolean>(false);
  public isLoading = this._isLoading.asReadonly();

  private _error = signal<string | null>(null);
  public error = this._error.asReadonly();


  public async findByRoutineId(routineId: number): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const { data, error } = await this.routinePlantsService.findByRoutineId(routineId);
      if (error) throw error;
      const plants = data ?? [];
      this._routinePlants.set(plants);
      if (plants.length > 0) {
        this._selectedRoutinePlant.set(plants[0]);
      } else {
        this._selectedRoutinePlant.set(null);
      }
    } catch (error) {
      this._error.set(`Error fetching routine plants: ${JSON.stringify(error)}`);
    } finally {
      this._isLoading.set(false);
    }
  }

  public setSelectedPlant(plant: IRoutinePlants | null): void {
    this._selectedRoutinePlant.set(plant);
  }

  public async updatePlantFromRoutine(
    plantId: string,
    occurrences: {
      [k: string]: boolean;
    },
    routinePlantId: string,
    informations: Partial<PlantData>,
  ) {
    const { data, error } = await this.routinePlantsService.updatePlantFromRoutine(
      plantId,
      occurrences,
      routinePlantId,
      informations,
    );

    return { data, error };
  }

  public async approveWorkAnnotation(annotationId: string) {
    const { data, error } = await this.routinePlantsService.approveWorkAnnotation(annotationId);
    return { data, error };
  }

}
