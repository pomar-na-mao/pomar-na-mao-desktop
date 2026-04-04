import { computed, inject, Injectable } from '@angular/core';
import { InspectRoutineRepository } from '../../../data/repositories/inspect-routine/inspect-routine-repository';

@Injectable({
  providedIn: 'root',
})
export class InspectRoutinesViewModel {
  private inspectRoutineRepository = inject(InspectRoutineRepository);

  public inspectRoutines = this.inspectRoutineRepository.inspectRoutines;
  public isLoading = this.inspectRoutineRepository.isLoading;
  public error = this.inspectRoutineRepository.error;

  public sortedRoutines = computed(() => {
    return [...this.inspectRoutineRepository.inspectRoutines()].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  });

  public async loadRoutines(): Promise<void> {
    await this.inspectRoutineRepository.fetchInspectRoutines();
  }
}
