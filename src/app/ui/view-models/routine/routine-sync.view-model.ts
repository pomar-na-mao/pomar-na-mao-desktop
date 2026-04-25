import { inject, Injectable, signal, computed, effect, untracked } from "@angular/core";
import { Router } from "@angular/router";
import { RoutinePlantsRepository } from "../../../data/repositories/routine-plants/routine-plants-repository";
import { RoutineRepository } from "../../../data/repositories/routine/routine-repository";
import { PlantsRepository } from "../../../data/repositories/plants/plants-repository";
import { WorkAnnotationRepository } from "../../../data/repositories/work-annotation/work-annotation-repository";
import { MessageService } from "../../../data/services/message/message.service";
import { occurenceKeys, occurencesLabels } from "../../../shared/utils/occurrences";
import type { BooleanKeys, PlantData } from "../../../domain/models/plant-data.model";

@Injectable()
export class RoutineSyncViewModel {
    private router = inject(Router);
    private routinePlantsRepository = inject(RoutinePlantsRepository);
    private routineRepository = inject(RoutineRepository);
    private plantsRepository = inject(PlantsRepository);
    private workAnnotationRepository = inject(WorkAnnotationRepository);
    private messageService = inject(MessageService);

    public id = signal<number | null>(null);
    public currentPlantIndex = signal(0);
    public isPlantLoading = signal(false);
    public isApproving = signal(false);
    public isLoading = this.workAnnotationRepository.isLoading;

    public currentRoutinePlant = this.routinePlantsRepository.selectedRoutinePlant;
    public totalPlants = computed(() => this.routinePlantsRepository.routinePlants().length);

    public currentRoutineRegion = computed(() => {
        const routineId = this.id();
        const routines = this.routineRepository.routines();
        const routine = routines.find(routine => routine.id === routineId);
        return routine?.region || 'COMMON.UNKNOWN';
    });

    public occurrencesLabels = occurencesLabels;

    public occurrencesChanges = computed(() => {
        const currentRoutinePlant = this.currentRoutinePlant();
        const plants = this.plantsRepository.routineCurrentPlants();

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

    private pendingFetches = new Map<string, Promise<void>>();

    constructor() {
        effect(() => {
            const routinePlant = this.currentRoutinePlant();
            if (routinePlant) {
                untracked(() => {
                    this.fetchPlantData(routinePlant.plant_id);
                });
            }
        });
    }

    public initialize(id: number): void {
        this.id.set(id);
        this.currentPlantIndex.set(0);
        this.routinePlantsRepository.findByRoutineId(id);
    }

    public async fetchPlantData(plantId: string, force = false): Promise<void> {
        const existingPlants = this.plantsRepository.routineCurrentPlants();
        if (!force && existingPlants.some(plant => plant.id === plantId)) {
            return;
        }

        if (!force && this.pendingFetches.has(plantId)) {
            return this.pendingFetches.get(plantId)!;
        }

        const fetchPromise = (async () => {
            this.isPlantLoading.set(true);
            try {
                const plant = await this.plantsRepository.findById(plantId);
                if (plant) {
                    this.plantsRepository.addRoutineCurrentPlantsItem(plant as PlantData);
                }
            } finally {
                this.pendingFetches.delete(plantId);
                // Only set isPlantLoading to false if there are no other pending fetches
                if (this.pendingFetches.size === 0) {
                    this.isPlantLoading.set(false);
                }
            }
        })();

        this.pendingFetches.set(plantId, fetchPromise);
        return fetchPromise;
    }

    public nextPlant(): void {
        const total = this.totalPlants();
        const current = this.currentPlantIndex();
        if (current < total - 1) {
            this.currentPlantIndex.set(current + 1);
            this.updateSelectedPlant();
        }
    }

    public previousPlant(): void {
        const current = this.currentPlantIndex();
        if (current > 0) {
            this.currentPlantIndex.set(current - 1);
            this.updateSelectedPlant();
        }
    }

    private updateSelectedPlant(): void {
        const plants = this.routinePlantsRepository.routinePlants();
        const index = this.currentPlantIndex();
        if (plants.length > index) {
            this.routinePlantsRepository.setSelectedPlant(plants[index]);
        }
    }

    public async onApproveWorkAnnotation(annotationId: string): Promise<void> {
        try {
            this.isApproving.set(true);
            const { error } = await this.routinePlantsRepository.approveWorkAnnotation(annotationId);
            if (error) throw error;

            await this.workAnnotationRepository.fetchWorkAnnotations();

            this.messageService.show('COMMON.TOAST.SUCCESS', 'success');
        } catch {
            this.messageService.show('COMMON.TOAST.ERROR', 'error');
        } finally {
            this.isApproving.set(false);
        }
    }

    public async onApproveRoutine(): Promise<void> {
        const plantWithUpdates = this.currentRoutinePlant();
        const routineId = this.id();

        if (plantWithUpdates && routineId !== null) {
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
                const routinePlantId = plantWithUpdates.id;

                const { error } = await this.routinePlantsRepository.updatePlantFromRoutine(
                    plantId,
                    occurrences,
                    routinePlantId,
                    informations
                );

                if (error) throw error;

                this.messageService.show('COMMON.TOAST.SUCCESS', 'success');

                await this.routinePlantsRepository.findByRoutineId(routineId);
                this.updateSelectedPlant();
                const refetchedPlant = this.routinePlantsRepository.selectedRoutinePlant();
                if (refetchedPlant) {
                    await this.fetchPlantData(refetchedPlant.plant_id, true);
                }

            } catch {
                this.messageService.show('COMMON.TOAST.ERROR', 'error');
            } finally {
                this.isApproving.set(false);
            }
        }
    }

    public goBack(): void {
        this.router.navigate(['/pomar-na-mao/sincronizacoes']);
    }

    public cleanup(): void {
        this.plantsRepository.clearPlants();
    }
}
