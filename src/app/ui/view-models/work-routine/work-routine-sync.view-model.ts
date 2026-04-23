import { inject, Injectable, signal, computed, effect, untracked } from "@angular/core";
import { Router } from "@angular/router";
import { WorkRoutinePlantsRepository } from "../../../data/repositories/work-routine-plants/work-routine-plants-repository";
import { WorkRoutineRepository } from "../../../data/repositories/work-routine/work-routine-repository";
import { PlantsRepository } from "../../../data/repositories/plants/plants-repository";
import { WorkAnnotationRepository } from "../../../data/repositories/work-annotation/work-annotation-repository";
import { MessageService } from "../../../data/services/message/message.service";
import { occurenceKeys, occurencesLabels } from "../../../shared/utils/occurrences";
import type { BooleanKeys, PlantData } from "../../../domain/models/plant-data.model";

@Injectable()
export class WorkRoutineSyncViewModel {
    private router = inject(Router);
    private workRoutinePlantsRepository = inject(WorkRoutinePlantsRepository);
    private workRoutineRepository = inject(WorkRoutineRepository);
    private plantsRepository = inject(PlantsRepository);
    private workAnnotationRepository = inject(WorkAnnotationRepository);
    private messageService = inject(MessageService);

    public id = signal<number | null>(null);
    public currentPlantIndex = signal(0);
    public isPlantLoading = signal(false);
    public isApproving = signal(false);
    public isLoading = this.workAnnotationRepository.isLoading;

    public currentWorkRoutinePlant = this.workRoutinePlantsRepository.selectedWorkRoutinePlant;
    public totalPlants = computed(() => this.workRoutinePlantsRepository.workRoutinePlants().length);

    public currentRoutineRegion = computed(() => {
        const routineId = this.id();
        const routines = this.workRoutineRepository.workRoutines();
        const routine = routines.find(routine => routine.id === routineId);
        return routine?.region || 'COMMON.UNKNOWN';
    });

    public occurrencesLabels = occurencesLabels;

    public occurrencesChanges = computed(() => {
        const currentRoutinePlant = this.currentWorkRoutinePlant();
        const plants = this.plantsRepository.workRoutineCurrentPlants();

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
            const routinePlant = this.currentWorkRoutinePlant();
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
        this.workRoutinePlantsRepository.findByWorkRoutineId(id);
    }

    public async fetchPlantData(plantId: string, force = false): Promise<void> {
        const existingPlants = this.plantsRepository.workRoutineCurrentPlants();
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
                    this.plantsRepository.addWorkRoutineCurrentPlantsItem(plant as PlantData);
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
        const plants = this.workRoutinePlantsRepository.workRoutinePlants();
        const index = this.currentPlantIndex();
        if (plants.length > index) {
            this.workRoutinePlantsRepository.setSelectedPlant(plants[index]);
        }
    }

    public async onApproveWorkAnnotation(annotationId: string): Promise<void> {
        try {
            this.isApproving.set(true);
            const { error } = await this.workRoutinePlantsRepository.approveWorkAnnotation(annotationId);
            if (error) throw error;

            await this.workAnnotationRepository.fetchWorkAnnotations();

            this.messageService.show('COMMON.TOAST.SUCCESS', 'success');
        } catch {
            this.messageService.show('COMMON.TOAST.ERROR', 'error');
        } finally {
            this.isApproving.set(false);
        }
    }

    public async onApproveWorkRoutine(): Promise<void> {
        const plantWithUpdates = this.currentWorkRoutinePlant();
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
                const workRoutinePlantId = plantWithUpdates.id;

                const { error } = await this.workRoutinePlantsRepository.updatePlantFromWorkRoutine(
                    plantId,
                    occurrences,
                    workRoutinePlantId,
                    informations
                );

                if (error) throw error;

                this.messageService.show('COMMON.TOAST.SUCCESS', 'success');

                await this.workRoutinePlantsRepository.findByWorkRoutineId(routineId);
                this.updateSelectedPlant();
                const refetchedPlant = this.workRoutinePlantsRepository.selectedWorkRoutinePlant();
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
