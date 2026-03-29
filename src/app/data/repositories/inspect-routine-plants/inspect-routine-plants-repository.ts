import { inject, Injectable, signal } from "@angular/core";
import { InspectRoutinePlantsService } from "../../services/inspect-routine-plants/inspect-routine-plants-service";
import type { IInspectRoutinePlants } from "../../../domain/models/inspect-routine-plants.model";

@Injectable({
  providedIn: 'root',
})
export class InspectRoutinePlantsRepository {
  private inspectRoutinePlantsService = inject(InspectRoutinePlantsService);

  public inspectRoutinePlants = signal<IInspectRoutinePlants[]>([]);
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);

  public async findByInspectRoutineId(routineId: number): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const { data, error } = await this.inspectRoutinePlantsService.findByInspectRoutineId(routineId);
      if (error) throw error;
      this.inspectRoutinePlants.set(data ?? []);
    } catch (error) {
      this.error.set(`Error fetching inspect routine plants: ${JSON.stringify(error)}`);
    } finally {
      this.isLoading.set(false);
    }
  }
}
