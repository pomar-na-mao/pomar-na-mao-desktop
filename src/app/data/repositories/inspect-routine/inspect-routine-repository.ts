import { inject, Injectable, signal } from "@angular/core";
import { InspectRoutineService } from "../../services/inspect-routine/inspect-routine-service";
import type { IInspectRoutine } from "../../../domain/models/inspect-routine.model";

@Injectable({
  providedIn: 'root',
})
export class InspectRoutineRepository {
  private inspectRoutineService = inject(InspectRoutineService);

  public inspectRoutines = signal<IInspectRoutine[]>([]);
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);

  public async fetchInspectRoutines(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const { data, error } = await this.inspectRoutineService.getInspectRoutines();
      if (error) throw error;
      this.inspectRoutines.set(data ?? []);
    } catch (error) {
      this.error.set(`Error fetching inspect routines\n${JSON.stringify(error)}`);
    } finally {
      this.isLoading.set(false);
    }
  }
}
