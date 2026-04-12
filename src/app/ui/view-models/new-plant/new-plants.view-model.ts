import { computed, inject, Injectable, signal } from '@angular/core';
import { NewPlantsRepository } from '../../../data/repositories/new-plants/new-plants-repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { MessageService } from '../../../data/services/message/message.service';
import { NewPlantsService } from '../../../data/services/new-plants/new-plants-service';


@Injectable({
  providedIn: 'root',
})
export class NewPlantsViewModel {
  private newPlantsRepository = inject(NewPlantsRepository);
  private plantsRepository = inject(PlantsRepository);
  private messageService = inject(MessageService);
  private newPlantsService = inject(NewPlantsService);

  private _isApprovalModalOpen = signal(false);
  public isApprovalModalOpen = this._isApprovalModalOpen.asReadonly();

  private _isApproving = signal(false);
  public isApproving = this._isApproving.asReadonly();

  public newPlants = this.newPlantsRepository.newPlants;
  public isLoading = this.newPlantsRepository.isLoading;
  public error = this.newPlantsRepository.error;
  public selectedNewPlant = this.newPlantsRepository.selectedNewPlant;

  public sortedNewPlants = computed(() => {
    return [...this.newPlants()].sort((firstNewPlant, secondNewPlant) => {
      const firstTimestamp = firstNewPlant.created_at ? new Date(firstNewPlant.created_at).getTime() : 0;
      const secondTimestamp = secondNewPlant.created_at ? new Date(secondNewPlant.created_at).getTime() : 0;

      return secondTimestamp - firstTimestamp;
    });
  });

  public async loadNewPlants(): Promise<void> {
    await this.newPlantsRepository.fetchNewPlants();
  }

  public openApprovalModal(newPlantId: string): void {
    this.newPlantsRepository.setSelectedNewPlantId(newPlantId);
    this._isApprovalModalOpen.set(true);
  }

  public closeApprovalModal(): void {
    this._isApprovalModalOpen.set(false);
    this.newPlantsRepository.setSelectedNewPlantId(null);
  }

  public async approveSelectedNewPlant(): Promise<void> {
    const selectedNewPlant = this.selectedNewPlant();

    if (!selectedNewPlant) return;

    this._isApproving.set(true);

    try {
      const { error } = await this.newPlantsService.approveNewPlant(selectedNewPlant.id);

      if (error) throw error;

      this.messageService.show('COMMON.TOAST.SUCCESS', 'success');
      this.closeApprovalModal();
      await this.loadNewPlants();
    } catch {
      this.messageService.show('COMMON.TOAST.ERROR', 'error');
    } finally {
      this._isApproving.set(false);
    }
  }
}
