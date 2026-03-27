import { Pipe, PipeTransform } from '@angular/core';
import { occurenceKeys } from '../../shared/utils/occurrences';
import type { PlantRecentUpdate } from '../../domain/models/plant-data.model';

@Pipe({
  name: 'countOccurrences',
})
export class CountOccurrencesPipe implements PipeTransform {
  transform(plant: PlantRecentUpdate | null | undefined): number {
    if (!plant) return 0;
    return occurenceKeys.reduce((count, key) => {
      return count + ((plant as PlantRecentUpdate)[key] === true ? 1 : 0);
    }, 0);
  }
}
