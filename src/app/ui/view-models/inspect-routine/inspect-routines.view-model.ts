import { inject, Injectable } from '@angular/core';
import { InspectRoutineRepository } from '../../../data/repositories/inspect-routine/inspect-routine-repository';

@Injectable({
  providedIn: 'root',
})
export class InspectRoutinesViewModel {
  private repository = inject(InspectRoutineRepository);

  public routines = this.repository.inspectRoutines;
  public isLoading = this.repository.isLoading;
  public error = this.repository.error;

  public async loadRoutines(): Promise<void> {
    await this.repository.fetchInspectRoutines();
  }
}
