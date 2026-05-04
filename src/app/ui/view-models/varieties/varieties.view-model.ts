import { Injectable, computed, inject, signal } from '@angular/core';
import { VarietiesRepository } from '../../../data/repositories/varieties/varieties-repository';
import { MessageService } from '../../../data/services/message/message.service';
import { Variety, VarietyInsert, VarietyUpdate } from '../../../domain/models/variety.model';

export interface VarietiesStats {
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class VarietiesViewModel {
  private varietiesRepository = inject(VarietiesRepository);
  private messageService = inject(MessageService);

  // Signals
  public varieties = this.varietiesRepository.varieties;
  public isLoading = signal<boolean>(false);
  public isSaving = signal<boolean>(false);
  public isDeleting = signal<boolean>(false);
  public isModalOpen = signal<boolean>(false);
  public editingVariety = signal<Variety | null>(null);
  public deletingVariety = signal<Variety | null>(null);

  // Computed
  public stats = computed<VarietiesStats>(() => {
    const allVarieties = this.varieties();
    return {
      total: allVarieties.length,
    };
  });

  public async loadVarieties(): Promise<void> {
    this.isLoading.set(true);
    try {
      const { error } = await this.varietiesRepository.findAll();
      if (error) {
        this.messageService.error('Erro ao carregar variedades. Verifique sua conexão.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  public openCreateModal(): void {
    this.editingVariety.set(null);
    this.isModalOpen.set(true);
  }

  public openEditModal(variety: Variety): void {
    this.editingVariety.set(variety);
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.editingVariety.set(null);
  }

  public openDeleteModal(variety: Variety): void {
    this.deletingVariety.set(variety);
  }

  public closeDeleteModal(): void {
    this.deletingVariety.set(null);
  }

  public async saveVariety(varietyData: VarietyInsert | VarietyUpdate): Promise<void> {
    this.isSaving.set(true);
    try {
      const current = this.editingVariety();
      if (current?.id) {
        const { error } = await this.varietiesRepository.update(current.id, varietyData as VarietyUpdate);
        if (error) {
          this.messageService.error('Erro ao atualizar variedade.');
          return;
        }
        this.messageService.success('Variedade atualizada com sucesso!');
      } else {
        const { error } = await this.varietiesRepository.insert(varietyData as VarietyInsert);
        if (error) {
          this.messageService.error('Erro ao cadastrar variedade.');
          return;
        }
        this.messageService.success('Variedade cadastrada com sucesso!');
      }
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  public async deleteVariety(): Promise<void> {
    const variety = this.deletingVariety();
    if (!variety) return;

    this.isDeleting.set(true);
    try {
      const { error } = await this.varietiesRepository.delete(variety.id);
      if (error) {
        this.messageService.error('Erro ao excluir variedade.');
        return;
      }
      this.messageService.success('Variedade excluída com sucesso!');
      this.closeDeleteModal();
    } finally {
      this.isDeleting.set(false);
    }
  }
}
