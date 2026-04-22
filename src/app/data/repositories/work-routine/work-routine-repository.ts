import { inject, Injectable, signal } from "@angular/core";
import { WorkRoutineService } from "../../services/work-routine/work-routine-service";
import type { IWorkRoutine } from "../../../domain/models/work-routine.model";

@Injectable({
  providedIn: 'root',
})
export class WorkRoutineRepository {
  private workRoutineService = inject(WorkRoutineService);

  public workRoutines = signal<IWorkRoutine[]>([]);
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);

  public async fetchWorkRoutines(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const { data, error } = await this.workRoutineService.getWorkRoutines();
      if (error) throw error;
      this.workRoutines.set(data ?? []);
    } catch (error) {
      this.error.set(`Error fetching work routines\n${JSON.stringify(error)}`);
    } finally {
      this.isLoading.set(false);
    }
  }
}
