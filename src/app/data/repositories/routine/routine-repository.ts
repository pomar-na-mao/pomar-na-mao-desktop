import { inject, Injectable, signal } from "@angular/core";
import { RoutineService } from "../../services/routine/routine-service";
import type { IRoutine } from "../../../domain/models/routine.model";

@Injectable({
  providedIn: 'root',
})
export class RoutineRepository {
  private routineService = inject(RoutineService);

  public routines = signal<IRoutine[]>([]);
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);

  public async fetchRoutines(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const { data, error } = await this.routineService.getRoutines();
      if (error) throw error;
      this.routines.set(data ?? []);
    } catch (error) {
      this.error.set(`Error fetching routines\n${JSON.stringify(error)}`);
    } finally {
      this.isLoading.set(false);
    }
  }
}
