import { Component, inject, Input, OnInit, OnChanges, SimpleChanges, computed, effect, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InspectRoutinePlantsRepository } from '../../../../data/repositories/inspect-routine-plants/inspect-routine-plants-repository';
import { InspectRoutineRepository } from '../../../../data/repositories/inspect-routine/inspect-routine-repository';
import { PlantsRepository } from '../../../../data/repositories/plants/plants-repository';
import { MessageService } from '../../../../data/services/message/message.service';
import { occurenceKeys, occurencesLabels } from '../../../../shared/utils/occurrences';
import type { BooleanKeys, PlantData } from '../../../../domain/models/plant-data.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-inspect-routine-plant-difference',
  imports: [CommonModule, TranslateModule],
  templateUrl: './inspect-routine-plant-difference.html',
  host: {
    'style': 'display: contents'
  }
})
export class InspectRoutinePlantDifference implements OnChanges, OnDestroy {
  @Input() id!: number;

  private router = inject(Router);

  public inspectRoutinePlantsRepository = inject(InspectRoutinePlantsRepository);
  public inspectRoutineRepository = inject(InspectRoutineRepository);
  public plantsRepository = inject(PlantsRepository);
  public messageService = inject(MessageService);

  public currentRoutineRegion = computed(() => {
    const routines = this.inspectRoutineRepository.inspectRoutines();
    const routine = routines.find(routine => routine.id === this.id);
    return routine?.region || 'Desconhecida';
  });

  public isPlantLoading = signal(false);
  public isApproving = signal(false);

  constructor() {
    effect(() => {
      const routinePlant = this.currentInspectRoutinePlant();
      if (routinePlant) {
        this.fetchPlantData(routinePlant.plant_id);
      }
    });
  }

  private async fetchPlantData(plantId: string, force = false): Promise<void> {
    const existingPlants = this.inspectRoutinePlantsRepository.plants();
    if (!force && existingPlants.some(plant => plant.id === plantId)) {
      return;
    }
    this.isPlantLoading.set(true);
    try {
      const plant = await this.plantsRepository.findById(plantId);
      if (plant) {
        this.inspectRoutinePlantsRepository.addPlant(plant);
      }
    } finally {
      this.isPlantLoading.set(false);
    }
  }

  public currentPlantIndex = 0;

  public currentInspectRoutinePlant = this.inspectRoutinePlantsRepository.selectedInspectRoutinePlant;

  get totalPlants(): number {
    return this.inspectRoutinePlantsRepository.inspectRoutinePlants().length;
  }

  public occurrencesLabels = occurencesLabels;

  public occurrencesChanges = computed(() => {
    const currentRoutinePlant = this.currentInspectRoutinePlant();
    const plants = this.inspectRoutinePlantsRepository.plants();

    const inclusions: BooleanKeys[] = [];
    const exclusions: BooleanKeys[] = [];

    if (!currentRoutinePlant) return { inclusions, exclusions };

    const equivalentPlant = plants.find(plant => plant.id === currentRoutinePlant.plant_id);

    for (const key of occurenceKeys) {
      const routineValue = currentRoutinePlant[key as keyof typeof currentRoutinePlant];
      const plantValue = equivalentPlant ? equivalentPlant[key as keyof typeof equivalentPlant] : false;

      if (routineValue && !plantValue) {
        inclusions.push(key);
      } else if (!routineValue && plantValue) {
        exclusions.push(key);
      }
    }

    return { inclusions, exclusions };
  });

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {
      this.currentPlantIndex = 0;
      this.inspectRoutinePlantsRepository.findByInspectRoutineId(this.id);
    }
  }

  public nextPlant(): void {
    if (this.currentPlantIndex < this.totalPlants - 1) {
      this.currentPlantIndex++;
      this.updateSelectedPlant();
    }
  }

  public previousPlant(): void {
    if (this.currentPlantIndex > 0) {
      this.currentPlantIndex--;
      this.updateSelectedPlant();
    }
  }

  public goBack(): void {
    this.router.navigate(['/pomar-na-mao/sincronizacoes']);
  }

  private updateSelectedPlant(): void {
    const plants = this.inspectRoutinePlantsRepository.inspectRoutinePlants();
    if (plants.length > this.currentPlantIndex) {
      this.inspectRoutinePlantsRepository.setSelectedPlant(plants[this.currentPlantIndex]);
    }
  }

  public async onApprove(): Promise<void> {
    const plantWithUpdates = this.inspectRoutinePlantsRepository.selectedInspectRoutinePlant();

    if (plantWithUpdates) {
      this.isApproving.set(true);
      try {
        const informations = {
          region: plantWithUpdates.region,
          variety: plantWithUpdates.variety,
          mass: plantWithUpdates.mass,
          life_of_the_tree: plantWithUpdates.life_of_the_tree,
          harvest: plantWithUpdates.harvest,
          planting_date: plantWithUpdates.planting_date,
          description: plantWithUpdates.description,
        } as Partial<PlantData>;

        const occurrences = Object.fromEntries(occurenceKeys.map((key) => [key, plantWithUpdates[key as keyof typeof plantWithUpdates]])) as {
          [k: string]: boolean;
        };

        const plantId = plantWithUpdates?.plant_id;

        const inspectRoutinePlantId = plantWithUpdates.id;

        const { error } = await this.inspectRoutinePlantsRepository.updatePlantFromInspectRoutine(plantId,
          occurrences,
          inspectRoutinePlantId,
          informations);

        if (error) throw error;

        this.messageService.show('COMMON.TOAST.SUCCESS', 'success');

        await this.inspectRoutinePlantsRepository.findByInspectRoutineId(this.id);
        this.currentPlantIndex = 0;
        const refetchedPlant = this.inspectRoutinePlantsRepository.selectedInspectRoutinePlant();
        if (refetchedPlant) {
          await this.fetchPlantData(refetchedPlant.plant_id, true);
        }

      } catch (error) {
        this.messageService.show('COMMON.TOAST.ERROR', 'error');
      } finally {
        this.isApproving.set(false);
      }
    }

  }

  public ngOnDestroy(): void {
    this.inspectRoutinePlantsRepository.clearPlants();
  }

}
