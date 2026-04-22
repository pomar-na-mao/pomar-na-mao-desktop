import { computed, inject, Injectable } from '@angular/core';
import { WorkRoutineRepository } from '../../../data/repositories/work-routine/work-routine-repository';

@Injectable({
  providedIn: 'root',
})
export class WorkRoutinesViewModel {
  private workRoutineRepository = inject(WorkRoutineRepository);

  public workRoutines = this.workRoutineRepository.workRoutines;
  public isLoading = this.workRoutineRepository.isLoading;
  public error = this.workRoutineRepository.error;

  public sortedRoutines = computed(() => {
    return [...this.workRoutineRepository.workRoutines()].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  });

  public async loadRoutines(): Promise<void> {
    await this.workRoutineRepository.fetchWorkRoutines();
  }
}
