import { inject, Injectable, signal } from "@angular/core";
import { InspectRoutinePlantsService } from "../../services/inspect-routine-plants/inspect-routine-plants-service";
import type { IInspectRoutinePlants } from "../../../domain/models/inspect-routine-plants.model";
import type { PlantData } from "../../../domain/models/plant-data.model";

@Injectable({
  providedIn: 'root',
})
export class InspectRoutinePlantsRepository {
  private inspectRoutinePlantsService = inject(InspectRoutinePlantsService);

  private _inspectRoutinePlants = signal<IInspectRoutinePlants[]>([]);
  public inspectRoutinePlants = this._inspectRoutinePlants.asReadonly();

  private _selectedInspectRoutinePlant = signal<IInspectRoutinePlants | null>(null);
  public selectedInspectRoutinePlant = this._selectedInspectRoutinePlant.asReadonly();

  private _isLoading = signal<boolean>(false);
  public isLoading = this._isLoading.asReadonly();

  private _error = signal<string | null>(null);
  public error = this._error.asReadonly();


  public async findByInspectRoutineId(routineId: number): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const { data, error } = await this.inspectRoutinePlantsService.findByInspectRoutineId(routineId);
      if (error) throw error;
      const plants = data ?? [];
      this._inspectRoutinePlants.set(plants);
      if (plants.length > 0) {
        this._selectedInspectRoutinePlant.set(plants[0]);
      } else {
        this._selectedInspectRoutinePlant.set(null);
      }
    } catch (error) {
      this._error.set(`Error fetching inspect routine plants: ${JSON.stringify(error)}`);
    } finally {
      this._isLoading.set(false);
    }
  }

  public setSelectedPlant(plant: IInspectRoutinePlants | null): void {
    this._selectedInspectRoutinePlant.set(plant);
  }

  public async updatePlantFromInspectRoutine(
    plantId: string,
    occurrences: {
      [k: string]: boolean;
    },
    inspectRoutinePlantId: string,
    informations: Partial<PlantData>,
  ) {
    const { data, error } = await this.inspectRoutinePlantsService.updatePlantFromInspectRoutine(
      plantId,
      occurrences,
      inspectRoutinePlantId,
      informations,
    );

    return { data, error };
  }

  public async approveInspectRoutinePlant(annotationId: string) {
    const { data, error } = await this.inspectRoutinePlantsService.approveInspectRoutinePlant(annotationId);
    return { data, error };
  }

}
