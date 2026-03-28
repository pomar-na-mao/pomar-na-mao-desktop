import { computed, inject, Injectable, signal } from "@angular/core";
import { RegionsRepository } from "../../../data/repositories/regions/regions-repository";
import type { Region } from "../../../domain/models/regions.model";
import { type AppSelectOption } from "../../../shared/components";
import { occurencesLabels } from "../../../shared/utils/occurrences";

@Injectable()
export class FarmOverviewMapViewModel {
  private regionsRepository = inject(RegionsRepository);

  public selectedRegionId = signal('');
  public selectedOccurrenceKey = signal('');
  public isLoadingRegions = signal(true);

  public regionsGroupedByName = computed(() => {
    const groups = new Map<string, Region[]>();
    for (const region of this.regionsRepository.regions()) {
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
      }
    } finally {
      this.isLoadingRegions.set(false);
    }
  }

  public onRegionChange(regionId: string): void {
    this.selectedRegionId.set(regionId);
    const selectedRegion = this.findRegionById(regionId);

    if (selectedRegion) {
      this.regionsRepository.currentRegion.set(selectedRegion);
    } else {
      this.regionsRepository.currentRegion.set(null);
    }
  }

  public onOccurrenceChange(occurrenceKey: string): void {
    this.selectedOccurrenceKey.set(occurrenceKey);
  }

  public findRegionById(regionId: string): Region | undefined {
    return this.uniqueRegions().find((region) => region.id === regionId);
  }
}
