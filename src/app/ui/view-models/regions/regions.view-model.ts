import { Injectable, computed, inject, signal } from '@angular/core';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { MessageService } from '../../../data/services/message/message.service';

export interface RegionsStats {
  total: number;
  unique: number;
}

@Injectable({
  providedIn: 'root',
})
export class RegionsViewModel {
  private regionsRepository = inject(RegionsRepository);
  private messageService = inject(MessageService);

  public regions = this.regionsRepository.regions;
  public isLoading = signal<boolean>(false);

  public stats = computed<RegionsStats>(() => {
    const allRegions = this.regions();
    const uniqueNames = new Set(
      allRegions
        .map((region) => region.region?.trim().toLocaleLowerCase())
        .filter((regionName) => regionName),
    );

    return {
      total: allRegions.length,
      unique: uniqueNames.size,
    };
  });

  public async loadRegions(): Promise<void> {
    this.isLoading.set(true);
    try {
      const { error } = await this.regionsRepository.findAll();
      if (error) {
        this.messageService.error('Erro ao carregar zonas. Verifique sua conexão.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
