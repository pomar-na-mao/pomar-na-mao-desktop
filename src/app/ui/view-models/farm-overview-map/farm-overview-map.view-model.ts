import { computed, inject, Injectable, signal } from "@angular/core";
import { PlantsRepository } from "../../../data/repositories/plants/plants-repository";
import { RegionsRepository } from "../../../data/repositories/regions/regions-repository";
import type { BooleanKeys, Plant } from "../../../domain/models/plant-data.model";
import type { Region } from "../../../domain/models/regions.model";
import { type AppSelectOption } from "../../../shared/components";
import { occurencesLabels } from "../../../shared/utils/occurrences";
import { varieties } from "../../../shared/utils/varieties";

@Injectable()
export class FarmOverviewMapViewModel {
  private plantsRepository = inject(PlantsRepository);
  private regionsRepository = inject(RegionsRepository);

  public isLoadingRegions = signal(true);
  public plants = signal<Plant[]>([]);

  public regionsGroupedByName = computed(() => {
    const groups = new Map<string, Region[]>();
    const regions = this.regionsRepository.regions();
    for (const region of regions) {
      const normalizedName = (region.region ?? '').trim().toLocaleLowerCase();
      if (!groups.has(normalizedName)) {
        groups.set(normalizedName, []);
      }
      groups.get(normalizedName)!.push(region);
    }
    return groups;
  });

  public uniqueRegions = computed(() => {
    const uniqueByName = new Map<string, Region>();

    for (const region of this.regionsRepository.regions()) {
      const normalizedName = (region.region ?? '').trim().toLocaleLowerCase();
      if (!uniqueByName.has(normalizedName)) {
        uniqueByName.set(normalizedName, region);
      }
    }

    return Array.from(uniqueByName.values());
  });

  public regionOptions = computed<AppSelectOption[]>(() =>
    this.uniqueRegions().map((region) => ({
      value: region.id,
      label: region.region,
    }))
  );

  public occurrenceOptions = computed<AppSelectOption[]>(() =>
    Object.entries(occurencesLabels).map(([key, value]) => ({
      value: key,
      label: value,
    }))
  );

  public varietyOptions = computed<AppSelectOption[]>(() =>
    varieties.map((variety) => ({
      value: variety,
      label: variety,
    }))
  );

  public async loadRegions(): Promise<void> {
    this.isLoadingRegions.set(true);
    try {
      await this.regionsRepository.findAll();
    } finally {
      this.isLoadingRegions.set(false);
    }
  }

  public async loadPlants(region: string, occurrence: BooleanKeys | '', variety: string): Promise<void> {
    if (!region) {
      this.plants.set([]);
      return;
    }

    const data = await this.plantsRepository.queryPlants({
      region,
      occurrence,
      variety,
    });
    this.plants.set(data);
  }

  public findRegionById(regionId: string): Region | undefined {
    return this.uniqueRegions().find((region) => region.id === regionId);
  }
}
