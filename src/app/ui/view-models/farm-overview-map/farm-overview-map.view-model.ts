import { computed, effect, inject, Injectable, PLATFORM_ID, signal, untracked } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { PlantsRepository } from "../../../data/repositories/plants/plants-repository";
import { RegionsRepository } from "../../../data/repositories/regions/regions-repository";
import type { BooleanKeys, Plant } from "../../../domain/models/plant-data.model";
import type { Region } from "../../../domain/models/regions.model";
import { type AppSelectOption } from "../../../shared/components";
import { occurenceKeys, occurencesLabels } from "../../../shared/utils/occurrences";
import { varieties } from "../../../shared/utils/varieties";

const STORAGE_KEY_PREFIX = 'farm_overview_map_';
const REGION_KEY = `${STORAGE_KEY_PREFIX}region_id`;
const OCCURRENCE_KEY = `${STORAGE_KEY_PREFIX}occurrence_key`;
const VARIETY_KEY = `${STORAGE_KEY_PREFIX}variety`;

@Injectable()
export class FarmOverviewMapViewModel {
  private platformId = inject(PLATFORM_ID);
  private plantsRepository = inject(PlantsRepository);
  private regionsRepository = inject(RegionsRepository);
  private initialized = false;

  public selectedRegionId = signal<string>(this.getFromStorage(REGION_KEY));
  public selectedOccurrenceKey = signal<BooleanKeys | ''>(this.toOccurrenceKey(this.getFromStorage(OCCURRENCE_KEY)));
  public selectedVariety = signal<string>(this.getFromStorage(VARIETY_KEY));
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

  constructor() {
    // Persist filter changes to localStorage and reload plants
    effect(() => {
      const regionId = this.selectedRegionId();
      const occurrenceKey = this.selectedOccurrenceKey();
      const variety = this.selectedVariety();

      untracked(() => {
        this.saveToStorage(REGION_KEY, regionId);
        this.saveToStorage(OCCURRENCE_KEY, occurrenceKey);
        this.saveToStorage(VARIETY_KEY, variety);

        if (!this.initialized) return;

        const selectedRegion = this.findRegionById(regionId);
        if (selectedRegion) {
          this.regionsRepository.currentRegion.set(selectedRegion);
        } else {
          this.regionsRepository.currentRegion.set(null);
        }

        this.loadPlantsForCurrentFilters();
      });
    });
  }

  public async loadRegions(): Promise<void> {
    this.isLoadingRegions.set(true);
    try {
      await this.regionsRepository.findAll();

      // No auto-selection of the first region to keep maps clean initially
    } finally {
      this.isLoadingRegions.set(false);
    }
  }

  /** Reapplies persisted filters and plant list after regions are fetched (e.g. when returning to Home). */
  public async restoreMapContextAfterRegionsLoad(): Promise<void> {
    const id = this.selectedRegionId();
    const selectedRegion = id ? this.findRegionById(id) : undefined;

    if (id && selectedRegion) {
      this.regionsRepository.currentRegion.set(selectedRegion);
      await this.loadPlantsForCurrentFilters();
    } else {
      if (id && !selectedRegion) {
        this.selectedRegionId.set('');
      }
      this.plants.set([]);
    }

    this.initialized = true;
  }

  public findRegionById(regionId: string): Region | undefined {
    return this.uniqueRegions().find((region) => region.id === regionId);
  }

  private async loadPlants(region: string, occurrence: BooleanKeys | '', variety: string): Promise<void> {
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

  private async loadPlantsForCurrentFilters(): Promise<void> {
    const selectedRegion = this.findRegionById(this.selectedRegionId());
    await this.loadPlants(selectedRegion?.region ?? '', this.selectedOccurrenceKey(), this.selectedVariety());
  }

  private toOccurrenceKey(value: string): BooleanKeys | '' {
    return occurenceKeys.includes(value as BooleanKeys) ? (value as BooleanKeys) : '';
  }

  private getFromStorage(key: string): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key) || '';
    }
    return '';
  }

  private saveToStorage(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    }
  }
}

