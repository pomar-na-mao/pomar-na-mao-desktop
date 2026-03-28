import { computed, inject, Injectable, signal } from "@angular/core";
import { PlantsRepository } from "../../../data/repositories/plants/plants-repository";
import { RegionsRepository } from "../../../data/repositories/regions/regions-repository";
import type { BooleanKeys } from "../../../domain/models/plant-data.model";
import type { Region } from "../../../domain/models/regions.model";
import { type AppSelectOption } from "../../../shared/components";
import { occurenceKeys, occurencesLabels } from "../../../shared/utils/occurrences";

@Injectable()
export class FarmOverviewMapViewModel {
  private plantsRepository = inject(PlantsRepository);
  private regionsRepository = inject(RegionsRepository);

  public selectedRegionId = signal('');
  public selectedOccurrenceKey = signal<BooleanKeys | ''>('');
  public isLoadingRegions = signal(true);
  public plants = this.plantsRepository.plants;

  public regionsGroupedByName = computed(() => {
    const groups = new Map<string, Region[]>();
    const regions = this.regionsRepository.regions();
    for (const region of regions) {
      const normalizedName = region.region.trim().toLocaleLowerCase();
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
      const normalizedName = region.region.trim().toLocaleLowerCase();
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

  public async loadRegions(): Promise<void> {
    this.isLoadingRegions.set(true);
    try {
      await this.regionsRepository.findAll();

      const [firstRegion] = this.uniqueRegions();
      if (firstRegion) {
        this.selectedRegionId.set(firstRegion.id);
        this.regionsRepository.currentRegion.set(firstRegion);
        await this.loadPlantsForCurrentFilters();
      }
    } finally {
      this.isLoadingRegions.set(false);
    }
  }

  public async onRegionChange(regionId: string): Promise<void> {
    this.selectedRegionId.set(regionId);
    const selectedRegion = this.findRegionById(regionId);

    if (selectedRegion) {
      this.regionsRepository.currentRegion.set(selectedRegion);
      await this.loadPlantsForCurrentFilters();
    } else {
      this.regionsRepository.currentRegion.set(null);
      this.plants.set([]);
    }
  }

  public async onOccurrenceChange(occurrenceKey: string): Promise<void> {
    this.selectedOccurrenceKey.set(this.toOccurrenceKey(occurrenceKey));
    await this.loadPlantsForCurrentFilters();
  }

  public findRegionById(regionId: string): Region | undefined {
    return this.uniqueRegions().find((region) => region.id === regionId);
  }

  private async loadPlants(region: string, occurrence: BooleanKeys | ''): Promise<void> {
    if (!region) {
      this.plants.set([]);
      return;
    }

    await this.plantsRepository.findAll({
      region,
      occurrence,
    });
  }

  private async loadPlantsForCurrentFilters(): Promise<void> {
    const selectedRegion = this.findRegionById(this.selectedRegionId());
    await this.loadPlants(selectedRegion?.region ?? '', this.selectedOccurrenceKey());
  }

  private toOccurrenceKey(value: string): BooleanKeys | '' {
    return occurenceKeys.includes(value as BooleanKeys) ? (value as BooleanKeys) : '';
  }
}
