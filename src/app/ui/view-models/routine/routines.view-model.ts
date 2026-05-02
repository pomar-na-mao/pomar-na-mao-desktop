import { computed, inject, Injectable } from '@angular/core';
import { RoutineRepository } from '../../../data/repositories/routine/routine-repository';

@Injectable({
  providedIn: 'root',
})
export class RoutinesViewModel {
  private routineRepository = inject(RoutineRepository);

  public routines = this.routineRepository.routines;
  public isLoading = this.routineRepository.isLoading;
  public error = this.routineRepository.error;

  public sortedRoutines = computed(() => {
    return [...this.routineRepository.routines()].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  });

  public async loadRoutines(): Promise<void> {
    await this.routineRepository.fetchRoutines();
  }
}
