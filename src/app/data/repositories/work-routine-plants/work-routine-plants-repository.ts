import { inject, Injectable, signal } from "@angular/core";
import { WorkRoutinePlantsService } from "../../services/work-routine-plants/work-routine-plants-service";
import type { IWorkRoutinePlants } from "../../../domain/models/work-routine-plants.model";
import type { PlantData } from "../../../domain/models/plant-data.model";

@Injectable({
  providedIn: 'root',
})
export class WorkRoutinePlantsRepository {
  private workRoutinePlantsService = inject(WorkRoutinePlantsService);

  private _workRoutinePlants = signal<IWorkRoutinePlants[]>([]);
  public workRoutinePlants = this._workRoutinePlants.asReadonly();

  private _selectedWorkRoutinePlant = signal<IWorkRoutinePlants | null>(null);
  public selectedWorkRoutinePlant = this._selectedWorkRoutinePlant.asReadonly();

  private _isLoading = signal<boolean>(false);
  public isLoading = this._isLoading.asReadonly();

  private _error = signal<string | null>(null);
  public error = this._error.asReadonly();


  public async findByWorkRoutineId(routineId: number): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const { data, error } = await this.workRoutinePlantsService.findByWorkRoutineId(routineId);
      if (error) throw error;
      const plants = data ?? [];
      this._workRoutinePlants.set(plants);
      if (plants.length > 0) {
        this._selectedWorkRoutinePlant.set(plants[0]);
      } else {
        this._selectedWorkRoutinePlant.set(null);
      }
    } catch (error) {
      this._error.set(`Error fetching work routine plants: ${JSON.stringify(error)}`);
    } finally {
      this._isLoading.set(false);
    }
  }

  public setSelectedPlant(plant: IWorkRoutinePlants | null): void {
    this._selectedWorkRoutinePlant.set(plant);
  }

  public async updatePlantFromWorkRoutine(
    plantId: string,
    occurrences: {
      [k: string]: boolean;
    },
    workRoutinePlantId: string,
    informations: Partial<PlantData>,
  ) {
    const { data, error } = await this.workRoutinePlantsService.updatePlantFromWorkRoutine(
      plantId,
      occurrences,
      workRoutinePlantId,
      informations,
    );

    return { data, error };
  }

  public async approveWorkAnnotation(annotationId: string) {
    const { data, error } = await this.workRoutinePlantsService.approveWorkAnnotation(annotationId);
    return { data, error };
  }

}
